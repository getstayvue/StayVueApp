require('dotenv').config();
const path = require('path');
const fs = require('fs');

const USE_POSTGRES = !!process.env.DATABASE_URL;

// ─── PostgreSQL Mode (Supabase / Production) ───
let _pool = null;

class PgStatement {
  constructor(pool, sql) {
    this._pool = pool;
    // Convert SQLite ? placeholders to PostgreSQL $1, $2, etc.
    let idx = 0;
    this._sql = sql.replace(/\?/g, () => `$${++idx}`);
    // Convert SQLite functions to PostgreSQL equivalents
    this._sql = this._sql
      .replace(/datetime\('now'\)/gi, 'NOW()')
      .replace(/strftime\('%Y-%m',\s*([^)]+)\)/gi, "to_char($1::date, 'YYYY-MM')")
      .replace(/strftime\('%Y',\s*([^)]+)\)/gi, "to_char($1::date, 'YYYY')")
      .replace(/julianday\(([^)]+)\)/gi, "($1)::date")
      .replace(/CAST\(([^)]+) AS INTEGER\)/gi, "($1)::integer");
  }

  async all(...params) {
    const result = await this._pool.query(this._sql, params);
    return result.rows;
  }

  async get(...params) {
    const result = await this._pool.query(this._sql, params);
    return result.rows[0] || undefined;
  }

  async run(...params) {
    const result = await this._pool.query(this._sql + ' RETURNING *', params).catch(async () => {
      // Fallback without RETURNING for non-INSERT statements
      return this._pool.query(this._sql, params);
    });
    const lastId = result.rows?.[0]?.id || 0;
    return { changes: result.rowCount, lastInsertRowid: lastId };
  }
}

class PgWrapper {
  constructor(pool) { this._pool = pool; }
  prepare(sql) { return new PgStatement(this._pool, sql); }
  async exec(sql) { await this._pool.query(sql); }
  _save() { /* no-op for Postgres — auto-persisted */ }
}

// ─── SQLite Mode (Local Development Fallback) ───
class SqliteStatement {
  constructor(db, sql) { this._db = db; this._sql = sql; }
  all(...params) {
    const stmt = this._db.prepare(this._sql);
    if (params.length) stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }
  get(...params) {
    const stmt = this._db.prepare(this._sql);
    if (params.length) stmt.bind(params);
    const result = stmt.step() ? stmt.getAsObject() : undefined;
    stmt.free();
    return result;
  }
  run(...params) {
    this._db.run(this._sql, params);
    return {
      changes: this._db.getRowsModified(),
      lastInsertRowid: (() => {
        const r = this._db.exec('SELECT last_insert_rowid() as id');
        return r.length ? r[0].values[0][0] : 0;
      })(),
    };
  }
}

class SqliteWrapper {
  constructor(db) { this._db = db; }
  prepare(sql) { return new SqliteStatement(this._db, sql); }
  exec(sql) { this._db.run(sql); }
  _save() {
    const DB_PATH = path.join(__dirname, '..', '..', 'data', 'airbnb.db');
    const data = this._db.export();
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

// ─── Initialization ───
let _wrapper = null;

async function initPostgres() {
  const { Pool } = require('pg');
  _pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('supabase') ? { rejectUnauthorized: false } : false,
    max: 10,
  });

  // Test connection
  await _pool.query('SELECT 1');
  console.log('✓ Connected to PostgreSQL (Supabase)');

  // Run schema
  const schema = fs.readFileSync(path.join(__dirname, 'schema.pg.sql'), 'utf8');
  try { await _pool.query(schema); } catch (e) { console.log('Schema note:', e.message); }

  _wrapper = new PgWrapper(_pool);
  return _wrapper;
}

async function initSqlite() {
  const initSqlJs = require('sql.js');
  const DB_PATH = path.join(__dirname, '..', '..', 'data', 'airbnb.db');
  const SQL = await initSqlJs();
  let db;
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }
  const wrapper = new SqliteWrapper(db);
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  try { db.exec(schema); } catch (e) { console.log('Schema note:', e.message); }
  // Migrate: add trial columns if missing
  try { db.exec('ALTER TABLE users ADD COLUMN trial_ends_at TEXT'); } catch (e) { /* already exists */ }
  try { db.exec('ALTER TABLE users ADD COLUMN has_paid INTEGER DEFAULT 0'); } catch (e) { /* already exists */ }
  try { db.exec('ALTER TABLE users ADD COLUMN has_seen_demo INTEGER DEFAULT 0'); } catch (e) { /* already exists */ }
  // Do NOT seed new databases - My App should start clean
  // Demo data is handled client-side in the demo mode
  wrapper._save();
  setInterval(() => wrapper._save(), 30000);
  _wrapper = wrapper;
  console.log('✓ Using SQLite (local development mode)');
  return wrapper;
}

function getDB() {
  if (_wrapper) return _wrapper;
  throw new Error('DB not initialized — call init() first');
}

module.exports = {
  init: async () => {
    if (USE_POSTGRES) return initPostgres();
    return initSqlite();
  },
  prepare: (...args) => getDB().prepare(...args),
  exec: (...args) => getDB().exec(...args),
  _save: () => getDB()._save(),
  isPostgres: () => USE_POSTGRES,
};
