#!/usr/bin/env node
/**
 * StayVue — Database Setup Script
 * 
 * Run this once to set up your Supabase database:
 *   node server/db/setup.js
 * 
 * Requires DATABASE_URL in your .env file.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function setup() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in .env file');
    console.log('   Copy .env.example to .env and fill in your Supabase credentials');
    process.exit(1);
  }

  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await pool.query('SELECT 1');
    console.log('✓ Connected to database');

    // Run schema
    const schema = fs.readFileSync(path.join(__dirname, 'schema.pg.sql'), 'utf8');
    await pool.query(schema);
    console.log('✓ Schema created');

    // Check if data exists
    const { rows } = await pool.query('SELECT COUNT(*) as c FROM properties');
    if (parseInt(rows[0].c) === 0) {
      console.log('  Database is empty — you can add your first property through the app');
    } else {
      console.log(`  Database has ${rows[0].c} properties`);
    }

    console.log('\n✅ Setup complete! Run `npm start` to launch the app.');
  } catch (e) {
    console.error('❌ Setup failed:', e.message);
  } finally {
    await pool.end();
  }
}

setup();
