const { Router } = require('express');
const db = require('../db');
const router = Router();

function buildFilters(query) {
  const pid = query.property_id;
  const period = query.period || 'lifetime'; // lifetime, year, month, quarter
  let propSql = '', dateSqlB = '', dateSqlE = '';
  const propP = [], dateP = [];

  if (pid && pid !== '0') { propSql = ' AND property_id = ?'; propP.push(+pid); }

  if (period === 'month') {
    const d = new Date();
    const start = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
    dateSqlB = ` AND check_in >= ?`; dateSqlE = ` AND date >= ?`;
    dateP.push(start);
  } else if (period === 'quarter') {
    const d = new Date();
    const qMonth = Math.floor(d.getMonth() / 3) * 3;
    const start = `${d.getFullYear()}-${String(qMonth+1).padStart(2,'0')}-01`;
    dateSqlB = ` AND check_in >= ?`; dateSqlE = ` AND date >= ?`;
    dateP.push(start);
  } else if (period === 'year') {
    const start = `${new Date().getFullYear()}-01-01`;
    dateSqlB = ` AND check_in >= ?`; dateSqlE = ` AND date >= ?`;
    dateP.push(start);
  }
  // lifetime = no date filter

  return { propSql, propP, dateSqlB, dateSqlE, dateP };
}

router.get('/summary', (req, res) => {
  try {
    const f = buildFilters(req.query);
    const bp = [...f.propP, ...f.dateP]; // booking params
    const ep = [...f.propP, ...f.dateP]; // expense params

    const totalRevenue = db.prepare(`SELECT COALESCE(SUM(airbnb_payout),0) as v FROM bookings WHERE status IN ('completed','confirmed')${f.propSql}${f.dateSqlB}`).get(...bp);
    const totalExpenses = db.prepare(`SELECT COALESCE(SUM(amount),0) as v FROM expenses WHERE 1=1${f.propSql}${f.dateSqlE}`).get(...ep);
    const totalBookings = db.prepare(`SELECT COUNT(*) as v FROM bookings WHERE 1=1${f.propSql}${f.dateSqlB}`).get(...bp);
    const avgRating = db.prepare(`SELECT ROUND(AVG(rating),2) as v FROM bookings WHERE rating IS NOT NULL${f.propSql}${f.dateSqlB}`).get(...bp);
    const avgNightly = db.prepare(`SELECT ROUND(AVG(nightly_rate),2) as v FROM bookings WHERE nightly_rate > 0${f.propSql}${f.dateSqlB}`).get(...bp);
    const occupancyDays = db.prepare(`SELECT COALESCE(SUM(nights),0) as v FROM bookings WHERE status IN ('completed','confirmed')${f.propSql}${f.dateSqlB}`).get(...bp);
    const pendingMaint = db.prepare(`SELECT COUNT(*) as v FROM maintenance WHERE status IN ('pending','in_progress')${f.propSql}`).get(...f.propP);
    const totalGuests = db.prepare('SELECT COUNT(*) as v FROM guests').get();

    res.json({
      totalRevenue: totalRevenue.v, totalExpenses: totalExpenses.v,
      netIncome: totalRevenue.v - totalExpenses.v,
      totalBookings: totalBookings.v, avgRating: avgRating.v,
      avgNightlyRate: avgNightly.v, totalNightsBooked: occupancyDays.v,
      pendingMaintenance: pendingMaint.v, totalGuests: totalGuests.v,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/monthly-revenue', (req, res) => {
  try {
    const f = buildFilters(req.query);
    const rows = db.prepare(`
      SELECT strftime('%Y-%m', check_in) as month, SUM(airbnb_payout) as revenue, COUNT(*) as bookings
      FROM bookings WHERE status IN ('completed','confirmed')${f.propSql}${f.dateSqlB}
      GROUP BY month ORDER BY month
    `).all(...f.propP, ...f.dateP);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/expense-breakdown', (req, res) => {
  try {
    const f = buildFilters(req.query);
    const rows = db.prepare(`
      SELECT category, SUM(amount) as total, COUNT(*) as count
      FROM expenses WHERE 1=1${f.propSql}${f.dateSqlE} GROUP BY category ORDER BY total DESC
    `).all(...f.propP, ...f.dateP);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/ratings-distribution', (req, res) => {
  try {
    const f = buildFilters(req.query);
    const rows = db.prepare(`
      SELECT CAST(rating AS INTEGER) as star, COUNT(*) as count
      FROM bookings WHERE rating IS NOT NULL${f.propSql}${f.dateSqlB}
      GROUP BY star ORDER BY star
    `).all(...f.propP, ...f.dateP);
    // Ensure we always have 1-5
    const full = [1,2,3,4,5].map(s => {
      const found = rows.find(r => r.star === s);
      return { star: s, count: found ? found.count : 0 };
    });
    // Avg
    const avg = db.prepare(`SELECT ROUND(AVG(rating),1) as v FROM bookings WHERE rating IS NOT NULL${f.propSql}${f.dateSqlB}`).get(...f.propP, ...f.dateP);
    res.json({ distribution: full, average: avg?.v || null });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/platform-split', (req, res) => {
  try {
    const f = buildFilters(req.query);
    const rows = db.prepare(`
      SELECT platform, COUNT(*) as bookings, SUM(airbnb_payout) as revenue
      FROM bookings WHERE 1=1${f.propSql}${f.dateSqlB} GROUP BY platform ORDER BY revenue DESC
    `).all(...f.propP, ...f.dateP);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
