const { Router } = require('express');
const db = require('../db');
const router = Router();

router.get('/', (req, res) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;
    let q = 'SELECT * FROM guests WHERE 1=1';
    const params = [];
    if (status) { q += ' AND status = ?'; params.push(status); }
    q += ' ORDER BY total_spend DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const rows = db.prepare(q).all(...params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', (req, res) => {
  try {
    const { first_name, last_name, email, phone, country_city, total_stays, total_nights, total_spend, last_rating, is_pet_owner, preferences, marketing_optin } = req.body;
    if (!first_name) return res.status(400).json({ error: 'first_name required' });
    const r = db.prepare('INSERT INTO guests (first_name,last_name,email,phone,country_city,total_stays,total_nights,total_spend,last_rating,is_pet_owner,preferences,marketing_optin) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
      .run(first_name, last_name||'', email||'', phone||'', country_city||'', total_stays||0, total_nights||0, total_spend||0, last_rating||null, is_pet_owner||0, preferences||'', marketing_optin||0);
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', (req, res) => {
  try {
    const fields = ['first_name','last_name','email','phone','country_city','total_stays','total_nights','total_spend','last_rating','is_pet_owner','preferences','marketing_optin','last_contacted','status'];
    const updates = [], params = [];
    for (const f of fields) {
      if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); }
    }
    if (!updates.length) return res.status(400).json({ error: 'No fields' });
    params.push(req.params.id);
    db.prepare(`UPDATE guests SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM guests WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
