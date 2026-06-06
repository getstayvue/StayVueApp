const { Router } = require('express');
const db = require('../db');
const router = Router();

// Parse CSV text into array of objects
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  
  // Parse header — handle quoted fields
  const parseRow = (line) => {
    const fields = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === ',' && !inQuote) { fields.push(current.trim()); current = ''; }
      else { current += ch; }
    }
    fields.push(current.trim());
    return fields;
  };
  
  const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
  return lines.slice(1).map(line => {
    const vals = parseRow(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  });
}

// Normalize a row from any platform into our booking schema
function normalizeBooking(row, platform) {
  const p = platform.toLowerCase();
  
  // Field mapping per platform
  if (p === 'airbnb') {
    return {
      guest_name: row.guest || row.guest_name || row.guest_first_name || '',
      check_in: normalizeDate(row.start_date || row.check_in || row.start || row.date || ''),
      check_out: normalizeDate(row.end_date || row.check_out || row.end || ''),
      guests: parseInt(row.number_of_guests || row.guests || row.adults || '1') || 1,
      platform: 'Airbnb',
      nightly_rate: parseMoney(row.nightly_rate || row.amount || row.listing_rate || '0'),
      cleaning_fee: parseMoney(row.cleaning_fee || '0'),
      airbnb_fee: parseMoney(row.host_fee || row.service_fee || row.host_service_fee || '0'),
      pet_fee: parseMoney(row.pet_fee || '0'),
      other_fee: parseMoney(row.other_fee || row.extra_guest_fee || '0'),
      airbnb_payout: parseMoney(row.payout || row.amount || row.host_payout || row.total_payout || '0'),
      status: normalizeStatus(row.status || row.reservation_status || 'confirmed'),
    };
  }
  
  if (p === 'vrbo' || p === 'homeaway') {
    return {
      guest_name: row.guest_name || row.traveler_name || row.guest || '',
      check_in: normalizeDate(row.check_in || row.arrival || row.start_date || ''),
      check_out: normalizeDate(row.check_out || row.departure || row.end_date || ''),
      guests: parseInt(row.guests || row.number_of_guests || '1') || 1,
      platform: 'VRBO',
      nightly_rate: parseMoney(row.nightly_rate || row.rent || row.avg_night || '0'),
      cleaning_fee: parseMoney(row.cleaning_fee || row.cleaning || '0'),
      airbnb_fee: parseMoney(row.service_fee || row.commission || row.host_fee || '0'),
      pet_fee: parseMoney(row.pet_fee || '0'),
      other_fee: parseMoney(row.other_fee || row.damage_waiver || '0'),
      airbnb_payout: parseMoney(row.payout || row.owner_payout || row.net_amount || '0'),
      status: normalizeStatus(row.status || 'confirmed'),
    };
  }
  
  if (p === 'booking.com' || p === 'booking') {
    return {
      guest_name: row.guest_name || row.booker_name || row.guest || '',
      check_in: normalizeDate(row.check_in || row.checkin || row.arrival || ''),
      check_out: normalizeDate(row.check_out || row.checkout || row.departure || ''),
      guests: parseInt(row.guests || row.number_of_guests || row.persons || '1') || 1,
      platform: 'Booking.com',
      nightly_rate: parseMoney(row.price || row.total_price || row.room_rate || '0'),
      cleaning_fee: parseMoney(row.cleaning_fee || '0'),
      airbnb_fee: parseMoney(row.commission || row.commission_amount || '0'),
      pet_fee: 0,
      other_fee: parseMoney(row.extras || row.other_fee || '0'),
      airbnb_payout: parseMoney(row.payout || row.total_payout || row.amount_paid || '0'),
      status: normalizeStatus(row.status || 'confirmed'),
    };
  }
  
  // Generic / Direct
  return {
    guest_name: row.guest_name || row.guest || row.name || '',
    check_in: normalizeDate(row.check_in || row.start || row.arrival || row.date || ''),
    check_out: normalizeDate(row.check_out || row.end || row.departure || ''),
    guests: parseInt(row.guests || '1') || 1,
    platform: platform || 'Direct',
    nightly_rate: parseMoney(row.nightly_rate || row.rate || '0'),
    cleaning_fee: parseMoney(row.cleaning_fee || '0'),
    airbnb_fee: parseMoney(row.fee || row.service_fee || '0'),
    pet_fee: parseMoney(row.pet_fee || '0'),
    other_fee: parseMoney(row.other_fee || '0'),
    airbnb_payout: parseMoney(row.payout || row.total || row.amount || '0'),
    status: normalizeStatus(row.status || 'confirmed'),
  };
}

function parseMoney(val) {
  if (!val) return 0;
  return parseFloat(String(val).replace(/[$,CAD\s]/g, '')) || 0;
}

function normalizeDate(val) {
  if (!val) return '';
  // Handle MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, etc.
  const v = val.trim();
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  // MM/DD/YYYY or DD/MM/YYYY — assume MM/DD/YYYY (North American)
  const parts = v.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);
    if (c > 100) return `${c}-${String(a).padStart(2, '0')}-${String(b).padStart(2, '0')}`;
    if (a > 100) return `${a}-${String(b).padStart(2, '0')}-${String(c).padStart(2, '0')}`;
  }
  return v;
}

function normalizeStatus(val) {
  const v = (val || '').toLowerCase();
  if (v.includes('confirm') || v.includes('accept')) return 'confirmed';
  if (v.includes('complete') || v.includes('past') || v.includes('checked_out') || v.includes('fulfilled')) return 'completed';
  if (v.includes('cancel')) return 'cancelled';
  return 'pending';
}

// POST /api/bookings/import
// Body: { csv: "csv text content", platform: "Airbnb" }
router.post('/', (req, res) => {
  try {
    const { csv, platform } = req.body;
    if (!csv) return res.status(400).json({ error: 'No CSV data provided' });
    
    const rows = parseCSV(csv);
    if (rows.length === 0) return res.status(400).json({ error: 'No valid rows found in CSV' });
    
    const results = { imported: 0, skipped: 0, errors: [], preview: [] };
    
    for (const row of rows) {
      try {
        const booking = normalizeBooking(row, platform || 'Airbnb');
        
        // Skip if no guest name or no dates
        if (!booking.guest_name || !booking.check_in) {
          results.skipped++;
          continue;
        }
        
        // Check for duplicates (same guest + check-in date)
        const existing = db.prepare(
          'SELECT id FROM bookings WHERE guest_name = ? AND check_in = ?'
        ).get(booking.guest_name, booking.check_in);
        
        if (existing) {
          results.skipped++;
          results.errors.push(`Duplicate: ${booking.guest_name} on ${booking.check_in}`);
          continue;
        }
        
        db.prepare(
          `INSERT INTO bookings (guest_name, check_in, check_out, guests, platform, nightly_rate, cleaning_fee, airbnb_fee, pet_fee, other_fee, airbnb_payout, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          booking.guest_name, booking.check_in, booking.check_out, booking.guests,
          booking.platform, booking.nightly_rate, booking.cleaning_fee, booking.airbnb_fee,
          booking.pet_fee, booking.other_fee, booking.airbnb_payout, booking.status
        );
        results.imported++;
      } catch (e) {
        results.errors.push(`Row error: ${e.message}`);
        results.skipped++;
      }
    }
    
    db._save();
    res.json(results);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/bookings/import/preview
// Same as import but just returns parsed data without inserting
router.post('/preview', (req, res) => {
  try {
    const { csv, platform } = req.body;
    if (!csv) return res.status(400).json({ error: 'No CSV data provided' });
    
    const rows = parseCSV(csv);
    if (rows.length === 0) return res.status(400).json({ error: 'No valid rows found' });
    
    const preview = rows.map(row => {
      const booking = normalizeBooking(row, platform || 'Airbnb');
      const existing = booking.guest_name && booking.check_in
        ? db.prepare('SELECT id FROM bookings WHERE guest_name = ? AND check_in = ?').get(booking.guest_name, booking.check_in)
        : null;
      return { ...booking, isDuplicate: !!existing };
    }).filter(b => b.guest_name && b.check_in);
    
    res.json({ total: rows.length, valid: preview.length, preview });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
