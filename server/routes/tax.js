const { Router } = require('express');
const db = require('../db');
const router = Router();

// Annual tax summary
router.get('/summary', (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear().toString();
    const pid = req.query.property_id;
    const filterProp = (pid && pid !== '0');

    // Revenue by property
    let revQ = `
      SELECT p.id as property_id, p.name as property_name,
        COALESCE(SUM(b.airbnb_payout), 0) as gross_revenue,
        COALESCE(SUM(b.airbnb_fee), 0) as platform_fees,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(b.nights), 0) as total_nights
      FROM properties p
      LEFT JOIN bookings b ON b.property_id = p.id
        AND strftime('%Y', b.check_in) = ?
        AND b.status IN ('completed','confirmed')
    `;
    const revParams = [year];
    if (filterProp) { revQ += ' WHERE p.id = ?'; revParams.push(+pid); }
    revQ += ' GROUP BY p.id ORDER BY p.id';
    const revenue = db.prepare(revQ).all(...revParams);

    // Expenses by property and category
    let expCatQ = `
      SELECT p.id as property_id, p.name as property_name,
        e.category, COALESCE(SUM(e.amount), 0) as total,
        COUNT(e.id) as count
      FROM properties p
      JOIN expenses e ON e.property_id = p.id AND strftime('%Y', e.date) = ?
    `;
    const expCatP = [year];
    if (filterProp) { expCatQ += ' WHERE p.id = ?'; expCatP.push(+pid); }
    expCatQ += ' GROUP BY p.id, e.category ORDER BY p.id, total DESC';
    const expCats = db.prepare(expCatQ).all(...expCatP);

    // Total expenses per property
    let expTotQ = `
      SELECT p.id as property_id, COALESCE(SUM(e.amount), 0) as total_expenses
      FROM properties p LEFT JOIN expenses e ON e.property_id = p.id AND strftime('%Y', e.date) = ?
    `;
    const expTotP = [year];
    if (filterProp) { expTotQ += ' WHERE p.id = ?'; expTotP.push(+pid); }
    expTotQ += ' GROUP BY p.id';
    const expenseTotals = db.prepare(expTotQ).all(...expTotP);

    // Maintenance costs per property
    let maintQ = `
      SELECT p.id as property_id, COALESCE(SUM(m.cost), 0) as total_maintenance
      FROM properties p
      LEFT JOIN maintenance m ON m.property_id = p.id AND strftime('%Y', m.date) = ? AND m.status = 'completed'
    `;
    const maintP = [year];
    if (filterProp) { maintQ += ' WHERE p.id = ?'; maintP.push(+pid); }
    maintQ += ' GROUP BY p.id';
    const maintenance = db.prepare(maintQ).all(...maintP);

    // Deductible expenses
    let dedQ = `SELECT category, SUM(amount) as total FROM expenses WHERE strftime('%Y', date) = ? AND is_deductible = 1`;
    const dedP = [year];
    if (filterProp) { dedQ += ' AND property_id = ?'; dedP.push(+pid); }
    dedQ += ' GROUP BY category ORDER BY total DESC';
    const deductible = db.prepare(dedQ).all(...dedP);

    // Combine
    const properties = revenue.map(r => {
      const exp = expenseTotals.find(e => e.property_id === r.property_id) || { total_expenses: 0 };
      const maint = maintenance.find(m => m.property_id === r.property_id) || { total_maintenance: 0 };
      return {
        ...r,
        total_expenses: exp.total_expenses,
        total_maintenance: maint.total_maintenance,
        net_income: r.gross_revenue - exp.total_expenses,
        expense_breakdown: expCats.filter(e => e.property_id === r.property_id),
      };
    });

    const totals = {
      gross_revenue: properties.reduce((s, p) => s + p.gross_revenue, 0),
      platform_fees: properties.reduce((s, p) => s + p.platform_fees, 0),
      total_expenses: properties.reduce((s, p) => s + p.total_expenses, 0),
      total_maintenance: properties.reduce((s, p) => s + p.total_maintenance, 0),
      net_income: properties.reduce((s, p) => s + p.net_income, 0),
      total_bookings: properties.reduce((s, p) => s + p.total_bookings, 0),
      total_nights: properties.reduce((s, p) => s + p.total_nights, 0),
    };

    res.json({ year, properties, totals, deductible_expenses: deductible });
  } catch (e) { console.error('Tax summary error:', e); res.status(500).json({ error: e.message }); }
});

// CSV export
router.get('/export', (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear().toString();
    const pid = req.query.property_id;
    const filterProp = (pid && pid !== '0');
    const lines = [];

    lines.push(`Tax Report — ${year}`);
    lines.push('');

    // Section 1: Revenue
    lines.push('=== RENTAL INCOME ===');
    lines.push('Property,Platform,Guest,Check-in,Check-out,Nights,Gross Income,Platform Fee,Net Payout');
    let bQ = `SELECT b.*, p.name as property_name FROM bookings b JOIN properties p ON b.property_id = p.id
      WHERE strftime('%Y', b.check_in) = ? AND b.status IN ('completed','confirmed')`;
    const bP = [year];
    if (filterProp) { bQ += ' AND b.property_id = ?'; bP.push(+pid); }
    bQ += ' ORDER BY p.id, b.check_in';
    const bookings = db.prepare(bQ).all(...bP);
    for (const b of bookings) {
      lines.push(`"${b.property_name}","${b.platform}","${b.guest_name}",${b.check_in},${b.check_out},${b.nights},${b.gross_income || 0},${b.airbnb_fee || 0},${b.airbnb_payout || 0}`);
    }
    const totalRev = bookings.reduce((s, b) => s + (b.airbnb_payout || 0), 0);
    const totalFees = bookings.reduce((s, b) => s + (b.airbnb_fee || 0), 0);
    lines.push(`,,,,,,Total Fees:,${totalFees},Total Revenue:,${totalRev}`);
    lines.push('');

    // Section 2: Expenses
    lines.push('=== EXPENSES ===');
    lines.push('Property,Date,Description,Category,Vendor,Amount,Recurring,Tax Deductible,Receipt Attached');
    let eQ = `SELECT e.*, p.name as property_name FROM expenses e JOIN properties p ON e.property_id = p.id
      WHERE strftime('%Y', e.date) = ?`;
    const eP = [year];
    if (filterProp) { eQ += ' AND e.property_id = ?'; eP.push(+pid); }
    eQ += ' ORDER BY p.id, e.date';
    const expenses = db.prepare(eQ).all(...eP);
    for (const e of expenses) {
      lines.push(`"${e.property_name}",${e.date},"${e.description}","${e.category}","${e.vendor || ''}",${e.amount},${e.is_recurring ? 'Yes' : 'No'},${e.is_deductible ? 'Yes' : 'No'},${e.file_path ? 'Yes' : 'No'}`);
    }
    const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
    const deductibleExp = expenses.filter(e => e.is_deductible).reduce((s, e) => s + e.amount, 0);
    lines.push(`,,,,,Total Expenses:,${totalExp},,Deductible:,${deductibleExp}`);
    lines.push('');

    // Section 3: Expense Summary
    lines.push('=== EXPENSE SUMMARY BY CATEGORY ===');
    lines.push('Category,Total,Count');
    let csQ = `SELECT category, SUM(amount) as total, COUNT(*) as count FROM expenses WHERE strftime('%Y', date) = ?`;
    const csP = [year];
    if (filterProp) { csQ += ' AND property_id = ?'; csP.push(+pid); }
    csQ += ' GROUP BY category ORDER BY total DESC';
    const catSummary = db.prepare(csQ).all(...csP);
    for (const c of catSummary) { lines.push(`"${c.category}",${c.total},${c.count}`); }
    lines.push('');

    // Section 4: Maintenance
    lines.push('=== MAINTENANCE & REPAIRS ===');
    lines.push('Property,Date,Description,Category,Vendor,Cost,Warranty');
    let mQ = `SELECT m.*, p.name as property_name FROM maintenance m JOIN properties p ON m.property_id = p.id
      WHERE strftime('%Y', m.date) = ? AND m.status = 'completed'`;
    const mP = [year];
    if (filterProp) { mQ += ' AND m.property_id = ?'; mP.push(+pid); }
    mQ += ' ORDER BY p.id, m.date';
    const maint = db.prepare(mQ).all(...mP);
    for (const m of maint) {
      lines.push(`"${m.property_name}",${m.date},"${m.description}","${m.category}","${m.vendor || ''}",${m.cost},${m.has_warranty ? 'Yes' : 'No'}`);
    }
    lines.push('');

    // Section 5: Net Income
    lines.push('=== NET INCOME SUMMARY ===');
    lines.push('Property,Gross Revenue,Platform Fees,Total Expenses,Net Income');
    const props = filterProp
      ? db.prepare('SELECT * FROM properties WHERE id = ?').all(+pid)
      : db.prepare('SELECT * FROM properties ORDER BY id').all();
    for (const p of props) {
      const rev = bookings.filter(b => b.property_id === p.id).reduce((s, b) => s + (b.airbnb_payout || 0), 0);
      const fees = bookings.filter(b => b.property_id === p.id).reduce((s, b) => s + (b.airbnb_fee || 0), 0);
      const exp = expenses.filter(e => e.property_id === p.id).reduce((s, e) => s + e.amount, 0);
      lines.push(`"${p.name}",${rev},${fees},${exp},${rev - exp}`);
    }
    if (!filterProp) lines.push(`"PORTFOLIO TOTAL",${totalRev},${totalFees},${totalExp},${totalRev - totalExp}`);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="tax-report-${year}.csv"`);
    res.send(lines.join('\n'));
  } catch (e) { console.error('Tax export error:', e); res.status(500).json({ error: e.message }); }
});

module.exports = router;
