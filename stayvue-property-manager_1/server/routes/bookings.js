const { Router } = require('express');
const db = require('../db');
const router = Router();

router.get('/', (req, res) => {
  try {
    const { status, year, property_id, limit = 100, offset = 0 } = req.query;
    let q = 'SELECT b.*, p.name as property_name FROM bookings b LEFT JOIN properties p ON b.property_id = p.id WHERE 1=1';
    const params = [];
    if (property_id && property_id !== '0') { q += ' AND b.property_id = ?'; params.push(+property_id); }
    if (status) { q += ' AND b.status = ?'; params.push(status); }
    if (year) { q += ' AND strftime("%Y", b.check_in) = ?'; params.push(year); }
    q += ' ORDER BY b.check_in DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const rows = db.prepare(q).all(...params);

    let countQ = 'SELECT COUNT(*) as c FROM bookings WHERE 1=1';
    const countP = [];
    if (property_id && property_id !== '0') { countQ += ' AND property_id = ?'; countP.push(+property_id); }
    const total = db.prepare(countQ).get(...countP);
    res.json({ data: rows, total: total.c });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', (req, res) => {
  try {
    const { property_id, guest_name, check_in, check_out, guests, platform, nightly_rate, cleaning_fee, airbnb_fee, pet_fee, other_fee, airbnb_payout, rating, has_pet, has_damage, has_review, review_notes, status } = req.body;
    if (!guest_name || !check_in || !check_out) return res.status(400).json({ error: 'guest_name, check_in, check_out required' });
    const r = db.prepare(`INSERT INTO bookings (property_id, guest_name, check_in, check_out, guests, platform, nightly_rate, cleaning_fee, airbnb_fee, pet_fee, other_fee, airbnb_payout, rating, has_pet, has_damage, has_review, review_notes, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      property_id||1, guest_name, check_in, check_out, guests||1, platform||'Airbnb', nightly_rate||0, cleaning_fee||0, airbnb_fee||0, pet_fee||0, other_fee||0, airbnb_payout||0, rating||'', has_pet||0, has_damage||0, has_review||0, review_notes||'', status||'confirmed'
    );
    db._save();
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', (req, res) => {
  try {
    const fields = ['property_id','guest_name','check_in','check_out','guests','platform','nightly_rate','cleaning_fee','airbnb_fee','pet_fee','other_fee','airbnb_payout','rating','has_pet','has_damage','has_review','review_notes','status'];
    const updates = [], params = [];
    for (const f of fields) {
      if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); }
    }
    if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
    params.push(req.params.id);
    db.prepare(`UPDATE bookings SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
