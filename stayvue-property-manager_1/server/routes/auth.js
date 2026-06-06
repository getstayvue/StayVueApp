const { Router } = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../db');
const router = Router();

const SESSION_DAYS = 30;
const TRIAL_DAYS = 3;

function getTrialEnd() {
  return new Date(Date.now() + TRIAL_DAYS * 86400000).toISOString();
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function createSession(userId) {
  const token = generateToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?,?,?)').run(token, userId, expires);
  db._save();
  return { token, expires };
}

function cleanExpiredSessions() {
  db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();
  db._save();
}

// ─── Signup ───
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, marketing_optin } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name are required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    // Check if email exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

    const hash = await bcrypt.hash(password, 12);
    const consent = marketing_optin ? new Date().toISOString() : null;
    const trialEnd = getTrialEnd();
    const r = db.prepare('INSERT INTO users (email, password_hash, name, auth_provider, marketing_optin, consent_date, trial_ends_at) VALUES (?,?,?,?,?,?,?)')
      .run(email.toLowerCase().trim(), hash, name.trim(), 'local', marketing_optin ? 1 : 0, consent, trialEnd);
    db._save();

    const session = createSession(r.lastInsertRowid);
    res.json({
      token: session.token,
      user: {
        id: r.lastInsertRowid,
        email: email.toLowerCase().trim(),
        name: name.trim(),
        trial_ends_at: trialEnd,
        has_paid: false,
        has_seen_demo: false,
        trial_active: true,
        trial_expired: false,
        trial_days_left: TRIAL_DAYS,
      },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Login ───
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    if (user.auth_provider === 'google' && !user.password_hash) {
      return res.status(401).json({ error: 'This account uses Google sign-in. Please use "Continue with Google".' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    // Update last login
    db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);
    db._save();

    cleanExpiredSessions();
    const session = createSession(user.id);

    // Calculate trial status for login
    const now = new Date();
    const trialEnd = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
    const trialExpired = trialEnd ? now > trialEnd : false;
    const trialActive = trialEnd ? now <= trialEnd : false;
    const trialDaysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd - now) / 86400000)) : 0;

    res.json({
      token: session.token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        trial_ends_at: user.trial_ends_at,
        has_paid: !!user.has_paid,
        trial_active: trialActive,
        trial_expired: trialExpired && !user.has_paid,
        trial_days_left: trialDaysLeft,
      },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Google OAuth ───
router.post('/google', (req, res) => {
  try {
    const { email, name, google_id, avatar_url, marketing_optin } = req.body;
    if (!email || !google_id) return res.status(400).json({ error: 'Email and Google ID required' });

    let user = db.prepare('SELECT * FROM users WHERE email = ? OR google_id = ?').get(email.toLowerCase().trim(), google_id);
    
    if (user) {
      // Update existing user
      db.prepare("UPDATE users SET google_id=?, avatar_url=?, last_login=datetime('now') WHERE id=?")
        .run(google_id, avatar_url || user.avatar_url, user.id);
      db._save();
    } else {
      // Create new user
      const consent = marketing_optin ? new Date().toISOString() : null;
      const trialEnd = getTrialEnd();
      const r = db.prepare('INSERT INTO users (email, name, auth_provider, google_id, avatar_url, marketing_optin, consent_date, trial_ends_at) VALUES (?,?,?,?,?,?,?,?)')
        .run(email.toLowerCase().trim(), name, 'google', google_id, avatar_url, marketing_optin ? 1 : 0, consent, trialEnd);
      db._save();
      user = { id: r.lastInsertRowid, email: email.toLowerCase().trim(), name, avatar_url };
    }

    cleanExpiredSessions();
    const session = createSession(user.id);

    // Re-fetch user with trial fields
    const fullUser = db.prepare('SELECT id, email, name, avatar_url, trial_ends_at, has_paid, created_at FROM users WHERE id = ?').get(user.id);
    const now = new Date();
    const trialEnd = fullUser.trial_ends_at ? new Date(fullUser.trial_ends_at) : null;
    const trialExpired = trialEnd ? now > trialEnd : false;
    const trialActive = trialEnd ? now <= trialEnd : false;
    const trialDaysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd - now) / 86400000)) : 0;

    res.json({
      token: session.token,
      user: {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        avatar_url: fullUser.avatar_url,
        trial_ends_at: fullUser.trial_ends_at,
        has_paid: !!fullUser.has_paid,
        trial_active: trialActive,
        trial_expired: trialExpired && !fullUser.has_paid,
        trial_days_left: trialDaysLeft,
      },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Session check ───
router.get('/me', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const session = db.prepare("SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')").get(token);
    if (!session) return res.status(401).json({ error: 'Session expired' });

    const user = db.prepare('SELECT id, email, name, avatar_url, trial_ends_at, has_paid, has_seen_demo, created_at FROM users WHERE id = ?').get(session.user_id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    // Back-fill trial for legacy users who don't have one set
    if (!user.trial_ends_at && !user.has_paid) {
      const trialEnd = new Date(Date.now() + TRIAL_DAYS * 86400000).toISOString();
      db.prepare('UPDATE users SET trial_ends_at = ? WHERE id = ?').run(trialEnd, user.id);
      db._save();
      user.trial_ends_at = trialEnd;
    }

    // Calculate trial status
    const now = new Date();
    const trialEnd = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
    const trialExpired = trialEnd ? now > trialEnd : false;
    const trialActive = trialEnd ? now <= trialEnd : false;
    const trialDaysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd - now) / 86400000)) : 0;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        trial_ends_at: user.trial_ends_at,
        has_paid: !!user.has_paid,
        has_seen_demo: !!user.has_seen_demo,
        trial_active: trialActive,
        trial_expired: trialExpired && !user.has_paid,
        trial_days_left: trialDaysLeft,
        created_at: user.created_at,
      },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Mark demo as seen ───
router.post('/demo-seen', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const session = db.prepare("SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')").get(token);
    if (!session) return res.status(401).json({ error: 'Session expired' });
    db.prepare('UPDATE users SET has_seen_demo = 1 WHERE id = ?').run(session.user_id);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Logout ───
router.post('/logout', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) { db.prepare('DELETE FROM sessions WHERE id = ?').run(token); db._save(); }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
