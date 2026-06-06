const { Router } = require('express');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const router = Router();

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'data', 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ─── Properties CRUD ───

router.get('/list', (_req, res) => {
  try { res.json(db.prepare('SELECT * FROM properties ORDER BY id').all()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/', (req, res) => {
  try {
    const id = req.query.property_id || 1;
    res.json(db.prepare('SELECT * FROM properties WHERE id = ?').get(+id) || {});
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', (req, res) => {
  try {
    const { name, address, property_type, bedrooms, bathrooms, max_guests, base_nightly_rate,
            square_footage, year_built, listing_urls, property_manager, emergency_contact,
            insurance_provider, policy_number, annual_premium, str_license_number, license_expiry, business_license } = req.body;
    const r = db.prepare(`INSERT INTO properties (name,address,property_type,bedrooms,bathrooms,max_guests,base_nightly_rate,
      square_footage,year_built,listing_urls,property_manager,emergency_contact,
      insurance_provider,policy_number,annual_premium,str_license_number,license_expiry,business_license)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(name || 'New Property', address || '', property_type || 'House', bedrooms||0, bathrooms||0, max_guests||0, base_nightly_rate||100,
           square_footage||0, year_built||0, listing_urls||'', property_manager||'', emergency_contact||'',
           insurance_provider||'', policy_number||'', annual_premium||0, str_license_number||'', license_expiry||'', business_license||'');
    db._save();
    res.json({ id: r.lastInsertRowid });
  } catch (e) { console.error('Property create error:', e); res.status(500).json({ error: String(e?.message || e) }); }
});

router.put('/', (req, res) => {
  try {
    const id = req.query.property_id || req.body.id || 1;
    const fields = ['name','address','property_type','bedrooms','bathrooms','max_guests','base_nightly_rate',
      'square_footage','year_built','listing_urls','property_manager','emergency_contact',
      'insurance_provider','policy_number','annual_premium','str_license_number','license_expiry','business_license'];
    const updates = [], params = [];
    for (const f of fields) { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); } }
    updates.push("updated_at = datetime('now')");
    params.push(+id);
    db.prepare(`UPDATE properties SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', (req, res) => {
  try {
    const count = db.prepare('SELECT COUNT(*) as c FROM properties').get();
    if (count.c <= 1) return res.status(400).json({ error: 'Cannot delete last property' });
    db.prepare('DELETE FROM properties WHERE id = ?').run(+req.params.id);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Documents CRUD + File Upload ───

router.get('/documents', (req, res) => {
  try {
    const pid = req.query.property_id;
    let q = 'SELECT * FROM documents';
    const p = [];
    if (pid && pid !== '0') { q += ' WHERE property_id = ?'; p.push(+pid); }
    q += ' ORDER BY date DESC';
    res.json(db.prepare(q).all(...p));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/documents', (req, res) => {
  try {
    const { property_id, date, name, category, amount, vendor, tax_year, status, is_deductible, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const r = db.prepare('INSERT INTO documents (property_id,date,name,category,amount,vendor,tax_year,status,is_deductible,file_path) VALUES (?,?,?,?,?,?,?,?,?,?)')
      .run(property_id||1, date || new Date().toISOString().slice(0,10), name, category||'Other', amount||0, vendor, tax_year || new Date().getFullYear(), status||'pending', is_deductible||0, notes||'');
    db._save();
    res.json({ id: r.lastInsertRowid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/documents/:id', (req, res) => {
  try {
    const fields = ['property_id','date','name','category','amount','vendor','tax_year','status','is_deductible'];
    const updates = [], params = [];
    for (const f of fields) { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); } }
    if (!updates.length) return res.status(400).json({ error: 'No fields' });
    params.push(+req.params.id);
    db.prepare(`UPDATE documents SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/documents/:id', (req, res) => {
  try {
    // Also delete uploaded file if exists
    const doc = db.prepare('SELECT file_path FROM documents WHERE id = ?').get(+req.params.id);
    if (doc?.file_path) {
      const filePath = path.join(UPLOADS_DIR, doc.file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    db.prepare('DELETE FROM documents WHERE id = ?').run(+req.params.id);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── File compression utility ───
const MAX_IMAGE_DIMENSION = 2048; // Resize images larger than this
const JPEG_QUALITY = 80; // JPEG quality (0-100)

function compressFile(buffer, ext) {
  // For images: strip EXIF data and enforce reasonable size
  // The actual pixel-level compression requires sharp (not bundled),
  // so we do what we can: re-encode JPEGs at lower quality client-side,
  // and on the server we strip EXIF metadata from JPEGs.
  if (['.jpg', '.jpeg'].includes(ext)) {
    // Strip EXIF: find SOI (FFD8) then skip APP1 (FFE1) segments
    // This can save 5-50KB per photo from camera EXIF data
    try {
      const stripped = stripJpegExif(buffer);
      if (stripped.length < buffer.length) {
        return { buffer: stripped, saved: buffer.length - stripped.length };
      }
    } catch { /* fall through to original */ }
  }
  return { buffer, saved: 0 };
}

function stripJpegExif(buf) {
  if (buf[0] !== 0xFF || buf[1] !== 0xD8) return buf; // Not JPEG
  const chunks = [];
  let i = 2;
  while (i < buf.length - 1) {
    if (buf[i] !== 0xFF) break;
    const marker = buf[i + 1];
    if (marker === 0xDA) { // Start of Scan — copy rest as-is
      chunks.push(buf.slice(i));
      break;
    }
    const len = buf.readUInt16BE(i + 2);
    // Skip APP1 (EXIF) and APP2 (ICC large) segments to save space
    if (marker === 0xE1 || marker === 0xE2) {
      i += 2 + len;
      continue;
    }
    chunks.push(buf.slice(i, i + 2 + len));
    i += 2 + len;
  }
  if (chunks.length === 0) return buf;
  return Buffer.concat([Buffer.from([0xFF, 0xD8]), ...chunks]);
}

// File upload (base64 from frontend)
router.post('/documents/:id/upload', (req, res) => {
  try {
    const { filename, data } = req.body; // data is base64
    if (!filename || !data) return res.status(400).json({ error: 'filename and data required' });

    const ext = path.extname(filename).toLowerCase();
    const safeName = `doc_${req.params.id}_${Date.now()}${ext}`;
    let buffer = Buffer.from(data, 'base64');

    // Auto-compress images
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    if (imageExts.includes(ext)) {
      const result = compressFile(buffer, ext);
      buffer = result.buffer;
    }

    fs.writeFileSync(path.join(UPLOADS_DIR, safeName), buffer);

    // Update storage used on user
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token && req.user) {
        db.prepare('UPDATE users SET storage_used = COALESCE(storage_used, 0) + ? WHERE id = ?').run(buffer.length, req.user.id);
      }
    } catch { /* non-critical */ }

    db.prepare('UPDATE documents SET file_path = ? WHERE id = ?').run(safeName, +req.params.id);
    db._save();
    res.json({ file_path: safeName, size: buffer.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// File download
router.get('/documents/:id/download', (req, res) => {
  try {
    const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(+req.params.id);
    if (!doc?.file_path) return res.status(404).json({ error: 'No file attached' });
    const filePath = path.join(UPLOADS_DIR, doc.file_path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on disk' });
    res.download(filePath, doc.file_path);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// File preview (serve inline for images)
router.get('/uploads/:filename', (req, res) => {
  try {
    const filePath = path.join(UPLOADS_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
    res.sendFile(filePath);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Pricing Seasons ───

router.get('/pricing', (req, res) => {
  try {
    const pid = req.query.property_id;
    let q = 'SELECT * FROM pricing_seasons';
    const p = [];
    if (pid && pid !== '0') { q += ' WHERE property_id = ?'; p.push(+pid); }
    q += ' ORDER BY id';
    res.json(db.prepare(q).all(...p));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/pricing/:id', (req, res) => {
  try {
    const { multiplier, min_nights, notes } = req.body;
    db.prepare('UPDATE pricing_seasons SET multiplier=?, min_nights=?, notes=? WHERE id=?')
      .run(multiplier, min_nights, notes, req.params.id);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Surveys ───

router.get('/surveys', (req, res) => {
  try {
    const pid = req.query.property_id;
    let q = 'SELECT * FROM surveys';
    const p = [];
    if (pid && pid !== '0') { q += ' WHERE property_id = ?'; p.push(+pid); }
    q += ' ORDER BY created_at DESC';
    res.json(db.prepare(q).all(...p));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/surveys/summary', (req, res) => {
  try {
    const pid = req.query.property_id;
    let where = '';
    const p = [];
    if (pid && pid !== '0') { where = ' WHERE property_id = ?'; p.push(+pid); }
    const s = db.prepare(`SELECT COUNT(*) as total, ROUND(AVG(overall_rating),2) as avg_overall,
      ROUND(AVG(cleanliness),2) as avg_cleanliness, ROUND(AVG(communication),2) as avg_communication,
      ROUND(AVG(checkin),2) as avg_checkin, ROUND(AVG(accuracy),2) as avg_accuracy,
      ROUND(AVG(location),2) as avg_location, ROUND(AVG(value),2) as avg_value FROM surveys${where}`).get(...p);
    res.json(s);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Cleaning ───

router.get('/cleaning', (_req, res) => {
  try { res.json(db.prepare('SELECT * FROM cleaning_tasks ORDER BY area, sort_order').all()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/cleaning', (req, res) => {
  try {
    const { area, task, priority, sort_order } = req.body;
    if (!task || !area) return res.status(400).json({ error: 'area and task required' });
    const r = db.prepare('INSERT INTO cleaning_tasks (area, task, priority, sort_order) VALUES (?,?,?,?)')
      .run(area, task, priority || 'medium', sort_order || 0);
    db._save();
    res.json({ id: r.lastInsertRowid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/cleaning/:id', (req, res) => {
  try {
    const { area, task, priority, sort_order } = req.body;
    db.prepare('UPDATE cleaning_tasks SET area=?, task=?, priority=?, sort_order=? WHERE id=?')
      .run(area, task, priority || 'medium', sort_order || 0, +req.params.id);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/cleaning/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM cleaning_tasks WHERE id = ?').run(+req.params.id);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Auto-Populate Cleaning Checklist ───
router.post('/cleaning/auto-populate', (req, res) => {
  try {
    const existing = db.prepare('SELECT COUNT(*) as c FROM cleaning_tasks').get();
    if (existing.c > 0) return res.status(400).json({ error: 'Checklist already has tasks. Clear existing tasks first or add individually.' });

    const DEFAULT_TASKS = [
      { area: 'Bedroom', task: 'Strip and wash all bedding', priority: 'high', sort_order: 1 },
      { area: 'Bedroom', task: 'Replace with fresh clean bedding', priority: 'high', sort_order: 2 },
      { area: 'Bedroom', task: 'Vacuum/mop floors and under bed', priority: 'medium', sort_order: 3 },
      { area: 'Bedroom', task: 'Dust all surfaces, nightstands, lamps', priority: 'medium', sort_order: 4 },
      { area: 'Bedroom', task: 'Empty all trash cans', priority: 'high', sort_order: 5 },
      { area: 'Bedroom', task: 'Check for items left behind', priority: 'high', sort_order: 6 },
      { area: 'Bathroom', task: 'Scrub toilet inside, outside, base', priority: 'high', sort_order: 7 },
      { area: 'Bathroom', task: 'Clean and disinfect sink and counter', priority: 'high', sort_order: 8 },
      { area: 'Bathroom', task: 'Clean shower/tub, remove soap scum', priority: 'high', sort_order: 9 },
      { area: 'Bathroom', task: 'Replace toilet paper (min 2 rolls)', priority: 'high', sort_order: 10 },
      { area: 'Bathroom', task: 'Restock shampoo, conditioner, body wash', priority: 'high', sort_order: 11 },
      { area: 'Bathroom', task: 'Hang fresh clean towels', priority: 'high', sort_order: 12 },
      { area: 'Kitchen', task: 'Wash all dishes, dry and put away', priority: 'high', sort_order: 13 },
      { area: 'Kitchen', task: 'Wipe inside microwave', priority: 'high', sort_order: 14 },
      { area: 'Kitchen', task: 'Clean stovetop and oven', priority: 'high', sort_order: 15 },
      { area: 'Kitchen', task: 'Wipe countertops and backsplash', priority: 'high', sort_order: 16 },
      { area: 'Kitchen', task: 'Mop floor', priority: 'high', sort_order: 17 },
      { area: 'Kitchen', task: 'Restock coffee, tea, sugar', priority: 'medium', sort_order: 18 },
      { area: 'Living Room', task: 'Vacuum all sofas and cushions', priority: 'high', sort_order: 19 },
      { area: 'Living Room', task: 'Vacuum or mop floors', priority: 'high', sort_order: 20 },
      { area: 'Living Room', task: 'Wipe TV remotes (disinfect)', priority: 'high', sort_order: 21 },
      { area: 'Living Room', task: 'Return furniture to original position', priority: 'high', sort_order: 22 },
      { area: 'Living Room', task: 'Ensure WiFi is working', priority: 'high', sort_order: 23 },
      { area: 'Entrance', task: 'Sweep/mop entryway', priority: 'medium', sort_order: 24 },
      { area: 'Entrance', task: 'Wipe door handle and light switches', priority: 'high', sort_order: 25 },
      { area: 'Laundry', task: 'Run empty washer cycle with cleaner', priority: 'low', sort_order: 26 },
      { area: 'Laundry', task: 'Clean lint trap in dryer', priority: 'medium', sort_order: 27 },
      { area: 'General', task: 'Check all windows and doors lock', priority: 'high', sort_order: 28 },
      { area: 'General', task: 'Test smoke and CO detectors', priority: 'high', sort_order: 29 },
      { area: 'General', task: 'Take out all garbage/recycling', priority: 'high', sort_order: 30 },
      { area: 'General', task: 'Confirm key/lockbox is working', priority: 'high', sort_order: 31 },
      { area: 'General', task: 'Take photos of clean unit', priority: 'medium', sort_order: 32 },
      { area: 'Outdoor', task: 'Sweep porch/patio area', priority: 'medium', sort_order: 33 },
      { area: 'Outdoor', task: 'Wipe outdoor furniture', priority: 'low', sort_order: 34 },
    ];

    const stmt = db.prepare('INSERT INTO cleaning_tasks (area, task, priority, sort_order) VALUES (?,?,?,?)');
    for (const t of DEFAULT_TASKS) {
      stmt.run(t.area, t.task, t.priority, t.sort_order);
    }
    db._save();
    res.json({ success: true, count: DEFAULT_TASKS.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Property Codes ───

router.get('/codes', (req, res) => {
  try {
    const pid = req.query.property_id;
    let q = 'SELECT * FROM property_codes';
    const p = [];
    if (pid && pid !== '0') { q += ' WHERE property_id = ?'; p.push(+pid); }
    q += ' ORDER BY property_id, sort_order';
    res.json(db.prepare(q).all(...p));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/codes', (req, res) => {
  try {
    const { property_id, label, value, icon } = req.body;
    if (!label) return res.status(400).json({ error: 'label required' });
    const maxSort = db.prepare('SELECT COALESCE(MAX(sort_order),0) as m FROM property_codes WHERE property_id = ?').get(property_id || 1);
    const r = db.prepare('INSERT INTO property_codes (property_id, label, value, icon, sort_order) VALUES (?,?,?,?,?)')
      .run(property_id || 1, label, value || '', icon || 'key', (maxSort?.m || 0) + 1);
    db._save();
    res.json({ id: r.lastInsertRowid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/codes/:id', (req, res) => {
  try {
    const { label, value, icon } = req.body;
    db.prepare('UPDATE property_codes SET label=?, value=?, icon=? WHERE id=?')
      .run(label, value || '', icon || 'key', +req.params.id);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/codes/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM property_codes WHERE id = ?').run(+req.params.id);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
