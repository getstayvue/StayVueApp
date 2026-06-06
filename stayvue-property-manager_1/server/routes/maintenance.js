const { Router } = require('express');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const router = Router();

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'data', 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function isImage(filename) {
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(filename || '');
}

router.get('/', (req, res) => {
  try {
    const { status, priority, property_id, limit = 200, offset = 0 } = req.query;
    let q = 'SELECT m.*, p.name as property_name FROM maintenance m LEFT JOIN properties p ON m.property_id = p.id WHERE 1=1';
    const params = [];
    if (property_id && property_id !== '0') { q += ' AND m.property_id = ?'; params.push(+property_id); }
    if (status) { q += ' AND m.status = ?'; params.push(status); }
    if (priority) { q += ' AND m.priority = ?'; params.push(priority); }
    q += ' ORDER BY m.date DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const rows = db.prepare(q).all(...params);
    res.json({ data: rows, total: rows.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', (req, res) => {
  try {
    const { property_id, date, description, category, vendor, cost, status, priority, has_warranty, next_service, notes } = req.body;
    const fields = ['property_id','date','description','category','vendor','cost','status','priority','has_warranty','notes'];
    const vals = [property_id||1, date||new Date().toISOString().slice(0,10), description, category||'General', vendor||'', cost||0, status||'pending', priority||'medium', has_warranty||0, notes||''];
    if (next_service) { fields.push('next_service'); vals.push(next_service); }
    const r = db.prepare(`INSERT INTO maintenance (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`).run(...vals);
    db._save();
    res.status(201).json({ id: r.lastInsertRowid });
  } catch (e) { console.error('Maintenance error:', e); res.status(500).json({ error: String(e?.message || e) }); }
});

router.put('/:id', (req, res) => {
  try {
    const fields = ['property_id','date','description','category','vendor','cost','status','priority','has_warranty','next_service','notes'];
    const updates = [], params = [];
    for (const f of fields) { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); } }
    params.push(req.params.id);
    db.prepare(`UPDATE maintenance SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT file_path FROM maintenance WHERE id = ?').get(+req.params.id);
    if (row?.file_path) {
      const filePath = path.join(UPLOADS_DIR, row.file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    db.prepare('DELETE FROM maintenance WHERE id = ?').run(req.params.id);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── File upload for maintenance records ───
router.post('/:id/upload', (req, res) => {
  try {
    const { filename, data } = req.body;
    if (!filename || !data) return res.status(400).json({ error: 'filename and data required' });
    const ext = path.extname(filename).toLowerCase();
    const safeName = `maint_${req.params.id}_${Date.now()}${ext}`;
    const buffer = Buffer.from(data, 'base64');
    fs.writeFileSync(path.join(UPLOADS_DIR, safeName), buffer);
    // Remove old file if replacing
    const old = db.prepare('SELECT file_path FROM maintenance WHERE id = ?').get(+req.params.id);
    if (old?.file_path) {
      const oldPath = path.join(UPLOADS_DIR, old.file_path);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    db.prepare('UPDATE maintenance SET file_path = ?, file_size = ? WHERE id = ?').run(safeName, buffer.length, +req.params.id);
    db._save();
    res.json({ file_path: safeName, size: buffer.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id/download', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM maintenance WHERE id = ?').get(+req.params.id);
    if (!row?.file_path) return res.status(404).json({ error: 'No file attached' });
    const filePath = path.join(UPLOADS_DIR, row.file_path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    res.download(filePath, row.file_path);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
