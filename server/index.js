require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { initStorage, getFile } = require('./storage');

async function start() {
  await db.init();
  await initStorage();
  console.log('Database and storage initialized');

  const authRouter = require('./routes/auth');
  const { requireAuth } = require('./middleware/auth');
  const bookingsRouter = require('./routes/bookings');
  const expensesRouter = require('./routes/expenses');
  const propertyRouter = require('./routes/property');
  const guestsRouter = require('./routes/guests');
  const maintenanceRouter = require('./routes/maintenance');
  const dashboardRouter = require('./routes/dashboard');
  const vendorsRouter = require('./routes/vendors');
  const importRouter = require('./routes/import');
  const emailsRouter = require('./routes/emails');
  const taxRouter = require('./routes/tax');
  const calendarFeedsRouter = require('./routes/calendarFeeds');
  const teamRouter = require('./routes/team');
  const billingRouter = require('./routes/billing');

  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(cors());

  // Stripe webhook needs raw body — must come before json parser
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET) {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = parseInt(session.metadata?.user_id);
        const planId = session.metadata?.plan_id;
        if (userId && planId) {
          const { applyUpgrade } = require('./routes/billing');
          await applyUpgrade(userId, planId, null);
          console.log(`✓ Payment confirmed: user ${userId} upgraded with ${planId}`);
        }
      }
      res.json({ received: true });
    });
  }

  app.use(express.json({ limit: '25mb' }));

  // Service worker — no cache
  app.get('/sw.js', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Service-Worker-Allowed', '/');
    res.sendFile(path.join(__dirname, '..', 'dist', 'sw.js'));
  });

  app.use(express.static(path.join(__dirname, '..', 'dist')));

  app.use((req, _res, next) => {
    if (req.path.startsWith('/api')) console.log(`${req.method} ${req.path}`);
    next();
  });

  // Auth routes (public)
  app.use('/api/auth', authRouter);

  // File serving (public — files are accessed by signed URL or path)
  app.get('/api/files/:filename', async (req, res) => {
    try {
      const { buffer, contentType } = await getFile(req.params.filename);
      res.setHeader('Content-Type', contentType);
      res.send(buffer);
    } catch (e) { res.status(404).json({ error: 'File not found' }); }
  });

  // Protected routes
  app.use('/api', requireAuth);

  app.use('/api/bookings/import', importRouter);
  app.use('/api/bookings', bookingsRouter);
  app.use('/api/expenses', expensesRouter);
  app.use('/api/property', propertyRouter);
  app.use('/api/guests', guestsRouter);
  app.use('/api/maintenance', maintenanceRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/vendors', vendorsRouter);
  app.use('/api/emails', emailsRouter);
  app.use('/api/tax', taxRouter);
  app.use('/api/calendar-feeds', calendarFeedsRouter);
  app.use('/api/team', teamRouter);
  app.use('/api/billing', billingRouter);

  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });

  app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  app.listen(PORT, () => {
    console.log(`StayVue server running on port ${PORT}`);
    console.log(`Mode: ${db.isPostgres() ? 'PostgreSQL (Supabase)' : 'SQLite (local)'}`);
    console.log(`Stripe: ${process.env.STRIPE_SECRET_KEY ? 'enabled' : 'demo mode'}`);
  });
}

start().catch(e => { console.error('Failed to start:', e); process.exit(1); });
