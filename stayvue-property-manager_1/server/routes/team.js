const { Router } = require('express');
const crypto = require('crypto');
const db = require('../db');
const router = Router();

// Default permission presets for each role
const ROLE_PRESETS = {
  'co-host': {
    dashboard: 'edit', calendar: 'edit', bookings: 'edit', expenses: 'edit',
    maintenance: 'edit', guests: 'edit', vendors: 'edit', cleaning: 'edit',
    property: 'edit', tax: 'view', team: 'none',
  },
  'manager': {
    dashboard: 'view', calendar: 'edit', bookings: 'edit', expenses: 'view',
    maintenance: 'edit', guests: 'edit', vendors: 'edit', cleaning: 'edit',
    property: 'view', tax: 'none', team: 'none',
  },
  'cleaner': {
    dashboard: 'none', calendar: 'view', bookings: 'none', expenses: 'none',
    maintenance: 'none', guests: 'none', vendors: 'none', cleaning: 'edit',
    property: 'view', tax: 'none', team: 'none',
  },
  'accountant': {
    dashboard: 'view', calendar: 'none', bookings: 'view', expenses: 'view',
    maintenance: 'view', guests: 'none', vendors: 'none', cleaning: 'none',
    property: 'view', tax: 'view', team: 'none',
  },
  'viewer': {
    dashboard: 'view', calendar: 'view', bookings: 'view', expenses: 'view',
    maintenance: 'view', guests: 'view', vendors: 'view', cleaning: 'view',
    property: 'view', tax: 'view', team: 'none',
  },
};

// Get role presets
router.get('/presets', (_req, res) => {
  res.json(ROLE_PRESETS);
});

// List team members (for the current owner)
router.get('/members', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT tm.*, u.name, u.email, u.avatar_url
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.owner_id = ?
      ORDER BY tm.invited_at DESC
    `).all(req.user.id);
    res.json(rows.map(r => ({ ...r, permissions: JSON.parse(r.permissions || '{}') })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// List pending invitations
router.get('/invitations', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM invitations
      WHERE owner_id = ? AND used = 0 AND expires_at > datetime('now')
      ORDER BY created_at DESC
    `).all(req.user.id);
    res.json(rows.map(r => ({ ...r, permissions: JSON.parse(r.permissions || '{}') })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Send invitation
router.post('/invite', (req, res) => {
  try {
    const { email, role, property_ids, permissions } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    if (email.toLowerCase() === req.user.email) return res.status(400).json({ error: 'You cannot invite yourself' });

    // Check if already a team member
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existingUser) {
      const existingMember = db.prepare('SELECT id FROM team_members WHERE owner_id = ? AND user_id = ?').get(req.user.id, existingUser.id);
      if (existingMember) return res.status(409).json({ error: 'This person is already on your team' });
    }

    const id = crypto.randomBytes(16).toString('hex');
    const perms = permissions || ROLE_PRESETS[role] || ROLE_PRESETS['viewer'];
    const expires = new Date(Date.now() + 7 * 86400000).toISOString(); // 7 days

    db.prepare('INSERT INTO invitations (id, owner_id, email, role, property_ids, permissions, expires_at) VALUES (?,?,?,?,?,?,?)')
      .run(id, req.user.id, email.toLowerCase().trim(), role || 'viewer', property_ids ? JSON.stringify(property_ids) : null, JSON.stringify(perms), expires);
    db._save();

    // If user already has an account, auto-accept
    if (existingUser) {
      db.prepare('INSERT INTO team_members (owner_id, user_id, role, property_ids, permissions, accepted_at, status) VALUES (?,?,?,?,?,datetime("now"),?)')
        .run(req.user.id, existingUser.id, role || 'viewer', property_ids ? JSON.stringify(property_ids) : null, JSON.stringify(perms), 'active');
      db.prepare('UPDATE invitations SET used = 1 WHERE id = ?').run(id);
      db._save();
      return res.json({ id, auto_accepted: true, message: 'User already has an account — added to your team' });
    }

    res.json({ id, invite_link: `/invite/${id}`, message: `Invitation sent to ${email}. They'll need to create an account to accept.` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Accept invitation (called during signup/login if invite exists)
router.post('/accept/:id', (req, res) => {
  try {
    const invite = db.prepare("SELECT * FROM invitations WHERE id = ? AND used = 0 AND expires_at > datetime('now')").get(req.params.id);
    if (!invite) return res.status(404).json({ error: 'Invitation not found or expired' });

    // Check email matches
    if (invite.email !== req.user.email) return res.status(403).json({ error: 'This invitation was sent to a different email address' });

    // Create team member
    db.prepare('INSERT OR REPLACE INTO team_members (owner_id, user_id, role, property_ids, permissions, accepted_at, status) VALUES (?,?,?,?,?,datetime("now"),?)')
      .run(invite.owner_id, req.user.id, invite.role, invite.property_ids, invite.permissions, 'active');
    db.prepare('UPDATE invitations SET used = 1 WHERE id = ?').run(invite.id);
    db._save();

    res.json({ success: true, message: 'Invitation accepted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update member permissions
router.put('/members/:id', (req, res) => {
  try {
    const member = db.prepare('SELECT * FROM team_members WHERE id = ? AND owner_id = ?').get(+req.params.id, req.user.id);
    if (!member) return res.status(404).json({ error: 'Team member not found' });

    const { role, property_ids, permissions, status } = req.body;
    db.prepare('UPDATE team_members SET role=?, property_ids=?, permissions=?, status=? WHERE id=?')
      .run(role || member.role, property_ids ? JSON.stringify(property_ids) : member.property_ids,
        JSON.stringify(permissions || JSON.parse(member.permissions)), status || member.status, member.id);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Remove team member
router.delete('/members/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM team_members WHERE id = ? AND owner_id = ?').run(+req.params.id, req.user.id);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete invitation
router.delete('/invitations/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM invitations WHERE id = ? AND owner_id = ?').run(req.params.id, req.user.id);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get current user's permissions (what they can access if they're a team member)
router.get('/my-access', (req, res) => {
  try {
    // Check if user is an owner of any data (has properties) — owners get full access
    const ownProps = db.prepare('SELECT COUNT(*) as c FROM properties').get();
    
    // Check if user is a team member for someone
    const memberships = db.prepare(`
      SELECT tm.*, u.name as owner_name, u.email as owner_email
      FROM team_members tm
      JOIN users u ON tm.owner_id = u.id
      WHERE tm.user_id = ? AND tm.status = 'active'
    `).all(req.user.id);

    if (memberships.length > 0) {
      // Return permissions from the first active membership
      const m = memberships[0];
      res.json({
        is_owner: false,
        is_member: true,
        role: m.role,
        owner_name: m.owner_name,
        permissions: JSON.parse(m.permissions || '{}'),
        property_ids: m.property_ids ? JSON.parse(m.property_ids) : null,
      });
    } else {
      // Owner — full access
      res.json({ is_owner: true, is_member: false, role: 'owner', permissions: null, property_ids: null });
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
