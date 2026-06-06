const { Router } = require('express');
const db = require('../db');
const router = Router();

router.get('/', (req, res) => {
  try {
    const { category, property_id } = req.query;
    let sql = 'SELECT * FROM vendors WHERE 1=1';
    const params = [];
    if (property_id && property_id !== '0') { sql += ' AND (property_id = ? OR property_id = 0 OR property_id IS NULL)'; params.push(+property_id); }
    if (category) { sql += ' AND category = ?'; params.push(category); }
    sql += ' ORDER BY is_favorite DESC, name ASC';
    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/categories', (_req, res) => {
  try {
    const rows = db.prepare('SELECT DISTINCT category FROM vendors ORDER BY category').all();
    res.json(rows.map(r => r.category));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', (req, res) => {
  try {
    const { name, company, category, phone, email, website, address, notes, is_favorite, property_id } = req.body;
    const result = db.prepare(
      `INSERT INTO vendors (name, company, category, phone, email, website, address, notes, is_favorite, property_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(name, company || null, category, phone || null, email || null, website || null, address || null, notes || null, is_favorite ? 1 : 0, property_id || 0);
    db._save();
    res.json({ id: result.lastInsertRowid, ...req.body });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', (req, res) => {
  try {
    const { name, company, category, phone, email, website, address, notes, is_favorite, property_id } = req.body;
    db.prepare(
      `UPDATE vendors SET name=?, company=?, category=?, phone=?, email=?, website=?, address=?, notes=?, is_favorite=?, property_id=? WHERE id=?`
    ).run(name, company || null, category, phone || null, email || null, website || null, address || null, notes || null, is_favorite ? 1 : 0, property_id || 0, req.params.id);
    db._save();
    res.json({ id: +req.params.id, ...req.body });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM vendors WHERE id = ?').run(+req.params.id);
    db._save();
    res.json({ deleted: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
