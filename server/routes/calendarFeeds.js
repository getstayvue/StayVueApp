const { Router } = require('express');
const db = require('../db');
const router = Router();

// List feeds for a property
router.get('/', (req, res) => {
  try {
    const pid = req.query.property_id;
    let q = 'SELECT * FROM calendar_feeds';
    const p = [];
    if (pid && pid !== '0') { q += ' WHERE property_id = ?'; p.push(+pid); }
    q += ' ORDER BY platform, created_at';
    res.json(db.prepare(q).all(...p));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Add a feed
router.post('/', (req, res) => {
  try {
    const { property_id, platform, url } = req.body;
    if (!platform || !url) return res.status(400).json({ error: 'platform and url required' });
    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('webcal://')) {
      return res.status(400).json({ error: 'URL must start with http://, https://, or webcal://' });
    }
    const r = db.prepare('INSERT INTO calendar_feeds (property_id, platform, url) VALUES (?,?,?)')
      .run(property_id || 1, platform, url);
    db._save();
    res.json({ id: r.lastInsertRowid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update feed
router.put('/:id', (req, res) => {
  try {
    const { platform, url, status } = req.body;
    db.prepare('UPDATE calendar_feeds SET platform=?, url=?, status=? WHERE id=?')
      .run(platform, url, status || 'active', +req.params.id);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete feed
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM calendar_feeds WHERE id = ?').run(+req.params.id);
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Sync a specific feed — fetches iCal and imports events as bookings
router.post('/:id/sync', async (req, res) => {
  try {
    const feed = db.prepare('SELECT * FROM calendar_feeds WHERE id = ?').get(+req.params.id);
    if (!feed) return res.status(404).json({ error: 'Feed not found' });

    // Fetch the iCal URL
    const url = feed.url.replace(/^webcal:\/\//, 'https://');
    let icalText;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      icalText = await response.text();
    } catch (fetchErr) {
      db.prepare('UPDATE calendar_feeds SET status = ? WHERE id = ?').run('error', feed.id);
      db._save();
      return res.status(400).json({ error: `Could not fetch calendar: ${fetchErr.message}` });
    }

    // Parse iCal events (simple parser for VEVENT blocks)
    const events = [];
    const veventBlocks = icalText.split('BEGIN:VEVENT');
    for (let i = 1; i < veventBlocks.length; i++) {
      const block = veventBlocks[i].split('END:VEVENT')[0];
      const get = (key) => {
        const match = block.match(new RegExp(`^${key}[;:](.*)$`, 'm'));
        return match ? match[1].trim() : null;
      };
      const dtstart = get('DTSTART');
      const dtend = get('DTEND');
      const summary = get('SUMMARY') || 'Blocked';
      const uid = get('UID');

      if (dtstart && dtend) {
        // Parse date (handles both DATE and DATE-TIME formats)
        const parseDate = (d) => {
          if (!d) return null;
          // Remove VALUE=DATE: prefix if present
          const clean = d.replace(/^VALUE=DATE:?/, '');
          if (clean.length === 8) return `${clean.slice(0,4)}-${clean.slice(4,6)}-${clean.slice(6,8)}`;
          if (clean.length >= 15) return `${clean.slice(0,4)}-${clean.slice(4,6)}-${clean.slice(6,8)}`;
          return clean.slice(0, 10);
        };

        const checkIn = parseDate(dtstart);
        const checkOut = parseDate(dtend);
        if (checkIn && checkOut && checkIn !== checkOut) {
          events.push({ checkIn, checkOut, summary, uid });
        }
      }
    }

    // Import events as bookings (skip duplicates by check_in + check_out + guest_name)
    let imported = 0, skipped = 0;
    for (const evt of events) {
      const existing = db.prepare(
        'SELECT id FROM bookings WHERE property_id = ? AND check_in = ? AND check_out = ? AND guest_name = ?'
      ).get(feed.property_id, evt.checkIn, evt.checkOut, evt.summary);

      if (!existing) {
        const isBlocked = /block|not available|reserved|unavailable/i.test(evt.summary);
        db.prepare(`
          INSERT INTO bookings (property_id, guest_name, check_in, check_out, guests, platform, nightly_rate, cleaning_fee, airbnb_fee, pet_fee, other_fee, airbnb_payout, status)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        `).run(
          feed.property_id, evt.summary, evt.checkIn, evt.checkOut,
          1, feed.platform, 0, 0, 0, 0, 0, 0,
          isBlocked ? 'confirmed' : 'confirmed'
        );
        imported++;
      } else {
        skipped++;
      }
    }

    // Update feed status
    db.prepare('UPDATE calendar_feeds SET last_synced = ?, status = ? WHERE id = ?')
      .run(new Date().toISOString().slice(0, 16), 'active', feed.id);
    db._save();

    res.json({ total_events: events.length, imported, skipped, feed_id: feed.id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
