const { Router } = require('express');
const db = require('../db');
const router = Router();

// ─── Templates ───

router.get('/templates', (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM email_templates ORDER BY category, name').all();
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/templates', (req, res) => {
  try {
    const { name, subject, body, category } = req.body;
    if (!name || !subject || !body) return res.status(400).json({ error: 'name, subject, body required' });
    const r = db.prepare('INSERT INTO email_templates (name, subject, body, category) VALUES (?,?,?,?)')
      .run(name, subject, body, category || 'general');
    db._save();
    res.json({ id: r.lastInsertRowid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/templates/:id', (req, res) => {
  try {
    const { name, subject, body, category } = req.body;
    db.prepare('UPDATE email_templates SET name=?, subject=?, body=?, category=? WHERE id=?')
      .run(name, subject, body, category || 'general', req.params.id);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/templates/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM email_templates WHERE id=?').run(+req.params.id);
    db._save();
    res.json({ deleted: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Campaigns ───

router.get('/campaigns', (_req, res) => {
  try {
    const rows = db.prepare(`
      SELECT c.*, t.name as template_name
      FROM email_campaigns c
      LEFT JOIN email_templates t ON c.template_id = t.id
      ORDER BY c.created_at DESC
    `).all();
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/campaigns', (req, res) => {
  try {
    const { name, template_id, subject, body, recipient_type, recipient_ids, frequency, scheduled_at } = req.body;
    if (!name || !subject || !body) return res.status(400).json({ error: 'name, subject, body required' });

    // Calculate next_send_at
    const next_send = scheduled_at || new Date().toISOString().slice(0, 16);
    const status = scheduled_at ? 'scheduled' : 'draft';

    const r = db.prepare(`
      INSERT INTO email_campaigns (name, template_id, subject, body, recipient_type, recipient_ids, frequency, scheduled_at, next_send_at, status)
      VALUES (?,?,?,?,?,?,?,?,?,?)
    `).run(name, template_id || null, subject, body, recipient_type || 'all_optin',
      recipient_ids ? JSON.stringify(recipient_ids) : null,
      frequency || 'once', scheduled_at || null, next_send, status);
    db._save();
    res.json({ id: r.lastInsertRowid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/campaigns/:id', (req, res) => {
  try {
    const { name, template_id, subject, body, recipient_type, recipient_ids, frequency, scheduled_at, status } = req.body;
    db.prepare(`
      UPDATE email_campaigns SET name=?, template_id=?, subject=?, body=?, recipient_type=?, recipient_ids=?,
        frequency=?, scheduled_at=?, status=? WHERE id=?
    `).run(name, template_id || null, subject, body, recipient_type, 
      recipient_ids ? JSON.stringify(recipient_ids) : null,
      frequency, scheduled_at || null, status || 'draft', req.params.id);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/campaigns/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM email_campaigns WHERE id=?').run(+req.params.id);
    db._save();
    res.json({ deleted: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Send / Preview ───

// Preview: resolve template variables for a specific guest
router.post('/preview', (req, res) => {
  try {
    const { subject, body, guest_id } = req.body;
    let guest = { first_name: 'Guest', last_name: '', email: 'guest@example.com' };
    if (guest_id) {
      const g = db.prepare('SELECT * FROM guests WHERE id=?').get(+guest_id);
      if (g) guest = g;
    }
    const resolve = (text) => text
      .replace(/\{\{first_name\}\}/g, guest.first_name || 'Guest')
      .replace(/\{\{last_name\}\}/g, guest.last_name || '')
      .replace(/\{\{full_name\}\}/g, `${guest.first_name || ''} ${guest.last_name || ''}`.trim())
      .replace(/\{\{email\}\}/g, guest.email || '');

    res.json({
      subject: resolve(subject),
      body: resolve(body),
      guest_name: `${guest.first_name} ${guest.last_name}`.trim(),
      guest_email: guest.email,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Test send — opens a mailto link on the client with resolved content
// In production, this would call SendGrid/SES to actually deliver the email
router.post('/test-send', (req, res) => {
  try {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body) return res.status(400).json({ error: 'to, subject, body required' });

    // Log the test send
    console.log(`[TEST EMAIL] To: ${to} | Subject: ${subject}`);

    // In demo mode, just confirm success
    // In production, this would send via SMTP/API
    res.json({
      success: true,
      message: `Test email queued for ${to}. In production, this sends via your email provider (SendGrid, Mailgun, etc). For now, check the server console.`,
      to,
      subject,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// "Send" a campaign — in practice this generates mailto links / marks as sent
// A real implementation would integrate with SendGrid/Mailgun/SES
router.post('/send/:id', (req, res) => {
  try {
    const campaign = db.prepare('SELECT * FROM email_campaigns WHERE id=?').get(+req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    // Get recipients
    let recipients = [];
    if (campaign.recipient_type === 'individual' && campaign.recipient_ids) {
      const ids = JSON.parse(campaign.recipient_ids);
      recipients = db.prepare(`SELECT * FROM guests WHERE id IN (${ids.map(() => '?').join(',')})`)
        .all(...ids);
    } else if (campaign.recipient_type === 'vip') {
      recipients = db.prepare('SELECT * FROM guests WHERE status = ? AND marketing_optin = 1 AND email IS NOT NULL').all('vip');
    } else if (campaign.recipient_type === 'past_guests') {
      recipients = db.prepare('SELECT * FROM guests WHERE total_stays > 0 AND marketing_optin = 1 AND email IS NOT NULL').all();
    } else {
      // all_optin
      recipients = db.prepare('SELECT * FROM guests WHERE marketing_optin = 1 AND email IS NOT NULL').all();
    }

    const resolve = (text, guest) => text
      .replace(/\{\{first_name\}\}/g, guest.first_name || 'Guest')
      .replace(/\{\{last_name\}\}/g, guest.last_name || '')
      .replace(/\{\{full_name\}\}/g, `${guest.first_name || ''} ${guest.last_name || ''}`.trim())
      .replace(/\{\{email\}\}/g, guest.email || '');

    // Generate individual emails
    const emails = recipients.map(g => ({
      to: g.email,
      name: `${g.first_name} ${g.last_name}`.trim(),
      subject: resolve(campaign.subject, g),
      body: resolve(campaign.body, g),
    }));

    // Calculate next send for recurring
    let nextSend = null;
    if (campaign.frequency !== 'once') {
      const now = new Date();
      const intervals = { weekly: 7, biweekly: 14, monthly: 30, quarterly: 90 };
      const days = intervals[campaign.frequency] || 30;
      nextSend = new Date(now.getTime() + days * 86400000).toISOString().slice(0, 16);
    }

    // Update campaign
    db.prepare(`UPDATE email_campaigns SET status=?, last_sent_at=?, next_send_at=?, send_count=send_count+1 WHERE id=?`)
      .run(campaign.frequency === 'once' ? 'sent' : 'active',
        new Date().toISOString().slice(0, 16), nextSend, campaign.id);

    // Update last_contacted on guests
    const now = new Date().toISOString().slice(0, 10);
    for (const g of recipients) {
      db.prepare('UPDATE guests SET last_contacted=? WHERE id=?').run(now, g.id);
    }
    
    db._save();

    res.json({
      sent: emails.length,
      recipients: emails.map(e => ({ to: e.to, name: e.name })),
      emails,
      next_send_at: nextSend,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
