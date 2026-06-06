const { Router } = require('express');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const router = Router();

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'data', 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

router.get('/', (req, res) => {
  try {
    const { category, year, property_id, limit = 200, offset = 0 } = req.query;
    let q = 'SELECT e.*, p.name as property_name FROM expenses e LEFT JOIN properties p ON e.property_id = p.id WHERE 1=1';
    const params = [];
    if (property_id && property_id !== '0') { q += ' AND e.property_id = ?'; params.push(+property_id); }
    if (category) { q += ' AND e.category = ?'; params.push(category); }
    if (year) { q += ' AND strftime("%Y", e.date) = ?'; params.push(year); }
    q += ' ORDER BY e.date DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const rows = db.prepare(q).all(...params);
    let countQ = 'SELECT COUNT(*) as c FROM expenses WHERE 1=1';
    const countP = [];
    if (property_id && property_id !== '0') { countQ += ' AND property_id = ?'; countP.push(+property_id); }
    const total = db.prepare(countQ).get(...countP);
    res.json({ data: rows, total: total.c });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/categories', (_req, res) => {
  try {
    const rows = db.prepare('SELECT DISTINCT category FROM expenses ORDER BY category').all();
    res.json(rows.map(r => r.category));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', (req, res) => {
  try {
    const { property_id, date, description, amount, category, vendor, notes, is_recurring, recurrence, is_deductible } = req.body;
    if (!description || !category) return res.status(400).json({ error: 'description and category required' });
    const fields = ['property_id','date','description','amount','category','vendor','notes','is_recurring','is_deductible'];
    const vals = [property_id||1, date||'', description, amount||0, category, vendor||'', notes||'', is_recurring||0, is_deductible !== undefined ? is_deductible : 1];
    if (recurrence && ['weekly','monthly','annual'].includes(recurrence)) {
      fields.push('recurrence');
      vals.push(recurrence);
    }
    const placeholders = fields.map(() => '?').join(',');
    const r = db.prepare(`INSERT INTO expenses (${fields.join(',')}) VALUES (${placeholders})`).run(...vals);
    db._save();
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', (req, res) => {
  try {
    const fields = ['property_id','date','description','amount','category','vendor','notes','is_recurring','recurrence','is_deductible'];
    const updates = [], params = [];
    for (const f of fields) {
      if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); }
    }
    if (!updates.length) return res.status(400).json({ error: 'No fields' });
    params.push(req.params.id);
    db.prepare(`UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', (req, res) => {
  try {
    const exp = db.prepare('SELECT file_path FROM expenses WHERE id = ?').get(+req.params.id);
    if (exp?.file_path) {
      const fp = path.join(UPLOADS_DIR, exp.file_path);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// File upload for expense receipt
router.post('/:id/upload', (req, res) => {
  try {
    const { filename, data } = req.body;
    if (!filename || !data) return res.status(400).json({ error: 'filename and data required' });
    const ext = path.extname(filename).toLowerCase();
    const safeName = `exp_${req.params.id}_${Date.now()}${ext}`;
    const buffer = Buffer.from(data, 'base64');
    fs.writeFileSync(path.join(UPLOADS_DIR, safeName), buffer);
    db.prepare('UPDATE expenses SET file_path = ? WHERE id = ?').run(safeName, +req.params.id);
    db._save();
    res.json({ file_path: safeName });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// File download
router.get('/:id/download', (req, res) => {
  try {
    const exp = db.prepare('SELECT * FROM expenses WHERE id = ?').get(+req.params.id);
    if (!exp?.file_path) return res.status(404).json({ error: 'No file attached' });
    const fp = path.join(UPLOADS_DIR, exp.file_path);
    if (!fs.existsSync(fp)) return res.status(404).json({ error: 'File not found' });
    res.download(fp, exp.file_path);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Serve uploaded files inline (for image preview)
router.get('/uploads/:filename', (req, res) => {
  try {
    const fp = path.join(UPLOADS_DIR, req.params.filename);
    if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
    res.sendFile(fp);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
