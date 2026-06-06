const db = require('../db');

async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const sessionQ = db.prepare("SELECT * FROM sessions WHERE id = ? AND expires_at > NOW()");
    let session;
    
    if (db.isPostgres()) {
      session = await sessionQ.get(token);
    } else {
      // SQLite uses datetime('now')
      const sqliteQ = db.prepare("SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')");
      session = sqliteQ.get(token);
    }
    
    if (!session) return res.status(401).json({ error: 'Session expired — please log in again' });

    const userQ = db.prepare('SELECT id, email, name FROM users WHERE id = ?');
    const user = db.isPostgres() ? await userQ.get(session.user_id) : userQ.get(session.user_id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = { requireAuth };
