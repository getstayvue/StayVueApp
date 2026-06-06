require('dotenv').config();
const { Router } = require('express');
const db = require('../db');
const router = Router();

const USE_STRIPE = !!process.env.STRIPE_SECRET_KEY;
let stripe = null;
if (USE_STRIPE) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

const PROPERTY_PLANS = [
  { id: 'prop_1', label: '+1 Property', add: 1, price: 9, stripe_price: 'price_prop_1' },
  { id: 'prop_5', label: '+5 Properties', add: 5, price: 29, stripe_price: 'price_prop_5' },
];

const TEAM_PLANS = [
  { id: 'team_1', label: '+1 Team Member', add: 1, price: 19, stripe_price: 'price_team_1' },
  { id: 'team_5', label: '+5 Team Members', add: 5, price: 49, stripe_price: 'price_team_5' },
];

const STORAGE_PLANS = [
  { id: 'storage_1gb', label: '+1 GB Storage', add: 1073741824, price: 3, stripe_price: 'price_storage_1' },
  { id: 'storage_5gb', label: '+5 GB Storage', add: 5368709120, price: 9, stripe_price: 'price_storage_5' },
  { id: 'storage_25gb', label: '+25 GB Storage', add: 26843545600, price: 19, stripe_price: 'price_storage_25' },
];

function formatBytes(bytes) {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1024).toFixed(0) + ' KB';
}

// Get current status
router.get('/status', async (req, res) => {
  try {
    const userQ = db.prepare('SELECT property_limit, team_limit, storage_limit, storage_used, plan_details, stripe_customer_id FROM users WHERE id = ?');
    const u = db.isPostgres() ? await userQ.get(req.user.id) : userQ.get(req.user.id);

    const propCountQ = db.prepare('SELECT COUNT(*) as c FROM properties');
    const teamCountQ = db.prepare('SELECT COUNT(*) as c FROM team_members WHERE owner_id = ?');
    const propCount = db.isPostgres() ? await propCountQ.get() : propCountQ.get();
    const teamCount = db.isPostgres() ? await teamCountQ.get(req.user.id) : teamCountQ.get(req.user.id);

    res.json({
      property_limit: u.property_limit || 2,
      property_count: propCount.c,
      property_remaining: Math.max(0, (u.property_limit || 2) - propCount.c),
      team_limit: u.team_limit || 0,
      team_count: teamCount.c,
      team_remaining: Math.max(0, (u.team_limit || 0) - teamCount.c),
      storage_limit: u.storage_limit || 1073741824,
      storage_used: u.storage_used || 0,
      storage_remaining: Math.max(0, (u.storage_limit || 1073741824) - (u.storage_used || 0)),
      storage_limit_formatted: formatBytes(u.storage_limit || 1073741824),
      storage_used_formatted: formatBytes(u.storage_used || 0),
      plan_details: u.plan_details ? JSON.parse(u.plan_details) : null,
      stripe_enabled: USE_STRIPE,
      plans: { property: PROPERTY_PLANS, team: TEAM_PLANS, storage: STORAGE_PLANS },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Check limits
router.get('/can-add-property', async (req, res) => {
  try {
    const userQ = db.prepare('SELECT property_limit FROM users WHERE id = ?');
    const countQ = db.prepare('SELECT COUNT(*) as c FROM properties');
    const u = db.isPostgres() ? await userQ.get(req.user.id) : userQ.get(req.user.id);
    const count = db.isPostgres() ? await countQ.get() : countQ.get();
    res.json({ allowed: count.c < (u.property_limit || 2), count: count.c, limit: u.property_limit || 2 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/can-add-team', async (req, res) => {
  try {
    const userQ = db.prepare('SELECT team_limit FROM users WHERE id = ?');
    const countQ = db.prepare('SELECT COUNT(*) as c FROM team_members WHERE owner_id = ?');
    const u = db.isPostgres() ? await userQ.get(req.user.id) : userQ.get(req.user.id);
    const count = db.isPostgres() ? await countQ.get(req.user.id) : countQ.get(req.user.id);
    res.json({ allowed: count.c < (u.team_limit || 0), count: count.c, limit: u.team_limit || 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/can-upload', async (req, res) => {
  try {
    const fileSize = parseInt(req.query.size || 0);
    const userQ = db.prepare('SELECT storage_limit, storage_used FROM users WHERE id = ?');
    const u = db.isPostgres() ? await userQ.get(req.user.id) : userQ.get(req.user.id);
    const remaining = (u.storage_limit || 1073741824) - (u.storage_used || 0);
    res.json({ allowed: fileSize <= remaining, remaining, limit: u.storage_limit || 1073741824, used: u.storage_used || 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Stripe Checkout ───
router.post('/create-checkout', async (req, res) => {
  try {
    const { plan_id } = req.body;
    if (!plan_id) return res.status(400).json({ error: 'plan_id required' });

    const allPlans = [...PROPERTY_PLANS, ...TEAM_PLANS, ...STORAGE_PLANS];
    const plan = allPlans.find(p => p.id === plan_id);
    if (!plan) return res.status(400).json({ error: 'Invalid plan' });

    if (!USE_STRIPE) {
      return applyUpgrade(req.user.id, plan_id, res);
    }

    const userQ = db.prepare('SELECT stripe_customer_id, email, name FROM users WHERE id = ?');
    const user = db.isPostgres() ? await userQ.get(req.user.id) : userQ.get(req.user.id);

    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.name, metadata: { user_id: req.user.id.toString() } });
      customerId = customer.id;
      const updateQ = db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?');
      if (db.isPostgres()) await updateQ.run(customerId, req.user.id);
      else updateQ.run(customerId, req.user.id);
      db._save();
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'cad',
          product_data: { name: plan.label, description: `StayVue — ${plan.label}` },
          unit_amount: plan.price * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:3001'}?payment=success&plan=${plan_id}`,
      cancel_url: `${req.headers.origin || 'http://localhost:3001'}?payment=cancelled`,
      metadata: { user_id: req.user.id.toString(), plan_id },
    });

    res.json({ checkout_url: session.url, session_id: session.id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Apply upgrade
async function applyUpgrade(userId, planId, res) {
  const userQ = db.prepare('SELECT * FROM users WHERE id = ?');
  const user = db.isPostgres() ? await userQ.get(userId) : userQ.get(userId);

  let newPropLimit = user.property_limit || 2;
  let newTeamLimit = user.team_limit || 0;
  let newStorageLimit = user.storage_limit || 1073741824;
  let planName = '';

  const propPlan = PROPERTY_PLANS.find(p => p.id === planId);
  const teamPlan = TEAM_PLANS.find(p => p.id === planId);
  const storagePlan = STORAGE_PLANS.find(p => p.id === planId);

  if (propPlan) {
    newPropLimit = newPropLimit + propPlan.add;
    planName = propPlan.label;
  } else if (teamPlan) {
    newTeamLimit = newTeamLimit + teamPlan.add;
    planName = teamPlan.label;
  } else if (storagePlan) {
    newStorageLimit = newStorageLimit + storagePlan.add;
    planName = storagePlan.label;
  } else {
    if (res) return res.status(400).json({ error: 'Invalid plan' });
    return;
  }

  const details = user.plan_details ? JSON.parse(user.plan_details) : { purchases: [] };
  details.purchases.push({ plan_id: planId, plan_name: planName, date: new Date().toISOString() });

  // Mark user as paid when they make any purchase
  const updateQ = db.prepare('UPDATE users SET property_limit = ?, team_limit = ?, storage_limit = ?, plan_details = ?, has_paid = 1 WHERE id = ?');
  if (db.isPostgres()) await updateQ.run(newPropLimit, newTeamLimit, newStorageLimit, JSON.stringify(details), userId);
  else updateQ.run(newPropLimit, newTeamLimit, newStorageLimit, JSON.stringify(details), userId);
  db._save();

  if (res) {
    const msg = USE_STRIPE ? `${planName} activated!` : `${planName} activated! (Demo mode — in production this processes via Stripe)`;
    res.json({ success: true, message: msg, property_limit: newPropLimit, team_limit: newTeamLimit, storage_limit: newStorageLimit, has_paid: true });
  }
}

// ─── Activate license (paywall purchase) ───
router.post('/activate-license', async (req, res) => {
  try {
    const { plan_name } = req.body;
    if (!plan_name) return res.status(400).json({ error: 'plan_name required' });

    // Set limits based on chosen plan
    const planLimits = {
      'Starter':      { property_limit: 2,  team_limit: 0,  storage_limit: 1073741824 },      // 1 GB
      'Professional': { property_limit: 7,  team_limit: 3,  storage_limit: 5368709120 },      // 5 GB
      'Portfolio':    { property_limit: 15, team_limit: 10, storage_limit: 10737418240 },     // 10 GB
    };
    const limits = planLimits[plan_name] || planLimits['Starter'];

    const sql = 'UPDATE users SET has_paid = 1, property_limit = ?, team_limit = ?, storage_limit = ?, plan_details = ? WHERE id = ?';
    const details = JSON.stringify({ purchases: [{ plan_name, date: new Date().toISOString() }] });

    if (db.isPostgres()) {
      await db.prepare(sql).run(limits.property_limit, limits.team_limit, limits.storage_limit, details, req.user.id);
    } else {
      db.prepare(sql).run(limits.property_limit, limits.team_limit, limits.storage_limit, details, req.user.id);
    }
    db._save();

    res.json({ success: true, has_paid: true, ...limits, message: `${plan_name} activated! (Demo mode — in production this processes via Stripe)` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Simulated upgrade for demo mode
router.post('/upgrade', async (req, res) => {
  try {
    await applyUpgrade(req.user.id, req.body.plan_id, res);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update storage used
router.post('/update-storage', async (req, res) => {
  try {
    const { delta } = req.body;
    if (db.isPostgres()) {
      await db.prepare('UPDATE users SET storage_used = GREATEST(0, COALESCE(storage_used, 0) + ?) WHERE id = ?').run(delta, req.user.id);
    } else {
      db.prepare('UPDATE users SET storage_used = MAX(0, COALESCE(storage_used, 0) + ?) WHERE id = ?').run(delta, req.user.id);
    }
    db._save();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Data export
router.get('/export-data', async (req, res) => {
  try {
    const tables = ['properties', 'bookings', 'expenses', 'guests', 'maintenance', 'pricing_seasons', 'documents', 'surveys', 'cleaning_tasks', 'property_codes', 'calendar_feeds', 'vendors', 'email_templates', 'email_campaigns'];
    const data = {};
    for (const table of tables) {
      const q = db.prepare(`SELECT * FROM ${table}`);
      data[table] = db.isPostgres() ? await q.all() : q.all();
    }
    data.exported_at = new Date().toISOString();
    data.format = 'stayvue_backup_v2';

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="stayvue-backup-${new Date().toISOString().slice(0,10)}.json"`);
    res.send(JSON.stringify(data, null, 2));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
module.exports.applyUpgrade = applyUpgrade;
