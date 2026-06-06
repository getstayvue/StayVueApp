-- Airbnb Property Manager — Database Schema
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ─── Users & Auth ───
CREATE TABLE IF NOT EXISTS users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT,
  name            TEXT NOT NULL,
  auth_provider   TEXT DEFAULT 'local' CHECK(auth_provider IN ('local','google')),
  google_id       TEXT,
  avatar_url      TEXT,
  marketing_optin INTEGER DEFAULT 0,
  consent_date    TEXT,
  property_limit  INTEGER DEFAULT 2,
  team_limit      INTEGER DEFAULT 0,
  storage_limit   INTEGER DEFAULT 1073741824,
  storage_used    INTEGER DEFAULT 0,
  plan_details    TEXT,
  stripe_customer_id TEXT,
  trial_ends_at   TEXT,
  has_paid        INTEGER DEFAULT 0,
  has_seen_demo   INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now')),
  last_login      TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ─── Team & Permissions ───
CREATE TABLE IF NOT EXISTS team_members (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id      INTEGER NOT NULL REFERENCES users(id),
  user_id       INTEGER NOT NULL REFERENCES users(id),
  role          TEXT DEFAULT 'viewer' CHECK(role IN ('co-host','manager','cleaner','accountant','viewer','custom')),
  property_ids  TEXT,
  permissions   TEXT NOT NULL DEFAULT '{}',
  invited_at    TEXT DEFAULT (datetime('now')),
  accepted_at   TEXT,
  status        TEXT DEFAULT 'active' CHECK(status IN ('active','pending','revoked')),
  UNIQUE(owner_id, user_id)
);

CREATE TABLE IF NOT EXISTS invitations (
  id          TEXT PRIMARY KEY,
  owner_id    INTEGER NOT NULL REFERENCES users(id),
  email       TEXT NOT NULL,
  role        TEXT DEFAULT 'viewer',
  property_ids TEXT,
  permissions TEXT NOT NULL DEFAULT '{}',
  expires_at  TEXT NOT NULL,
  used        INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- ─── Properties ───
CREATE TABLE IF NOT EXISTS properties (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL DEFAULT 'My Airbnb Property',
  address       TEXT,
  property_type TEXT,
  bedrooms      INTEGER DEFAULT 0,
  bathrooms     INTEGER DEFAULT 0,
  max_guests    INTEGER DEFAULT 0,
  base_nightly_rate REAL DEFAULT 100.00,
  square_footage    INTEGER DEFAULT 0,
  year_built        INTEGER DEFAULT 0,
  listing_urls      TEXT,
  property_manager  TEXT,
  emergency_contact TEXT,
  insurance_provider TEXT,
  policy_number     TEXT,
  annual_premium    REAL DEFAULT 0,
  str_license_number TEXT,
  license_expiry    TEXT,
  business_license  TEXT,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

-- ─── Bookings ───
CREATE TABLE IF NOT EXISTS bookings (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id   INTEGER NOT NULL DEFAULT 1,
  guest_name    TEXT NOT NULL,
  check_in      TEXT NOT NULL,
  check_out     TEXT NOT NULL,
  nights        INTEGER GENERATED ALWAYS AS (CAST(julianday(check_out) - julianday(check_in) AS INTEGER)) STORED,
  guests        INTEGER DEFAULT 1,
  platform      TEXT DEFAULT 'Airbnb',
  nightly_rate  REAL DEFAULT 0,
  cleaning_fee  REAL DEFAULT 0,
  airbnb_fee    REAL DEFAULT 0,
  pet_fee       REAL DEFAULT 0,
  other_fee     REAL DEFAULT 0,
  gross_income  REAL GENERATED ALWAYS AS (nightly_rate * CAST(julianday(check_out) - julianday(check_in) AS INTEGER) + cleaning_fee + pet_fee + other_fee) STORED,
  airbnb_payout REAL DEFAULT 0,
  rating        REAL,
  has_pet       INTEGER DEFAULT 0,
  has_damage    INTEGER DEFAULT 0,
  has_review    INTEGER DEFAULT 0,
  review_notes  TEXT,
  status        TEXT DEFAULT 'confirmed' CHECK(status IN ('confirmed','completed','cancelled','pending')),
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_platform ON bookings(platform);

-- ─── Expenses ───
CREATE TABLE IF NOT EXISTS expenses (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id   INTEGER NOT NULL DEFAULT 1,
  date          TEXT,
  description   TEXT NOT NULL,
  amount        REAL NOT NULL DEFAULT 0,
  category      TEXT NOT NULL,
  vendor        TEXT,
  notes         TEXT,
  is_recurring  INTEGER DEFAULT 0,
  recurrence    TEXT CHECK(recurrence IN ('weekly','monthly','annual')),
  is_deductible INTEGER DEFAULT 1,
  file_path     TEXT,
  file_size     INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- ─── Guests (CRM) ───
CREATE TABLE IF NOT EXISTS guests (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name      TEXT NOT NULL,
  last_name       TEXT,
  email           TEXT,
  phone           TEXT,
  country_city    TEXT,
  total_stays     INTEGER DEFAULT 0,
  total_nights    INTEGER DEFAULT 0,
  total_spend     REAL DEFAULT 0,
  last_rating     REAL,
  is_pet_owner    INTEGER DEFAULT 0,
  preferences     TEXT,
  marketing_optin INTEGER DEFAULT 0,
  last_contacted  TEXT,
  status          TEXT DEFAULT 'active',
  created_at      TEXT DEFAULT (datetime('now'))
);

-- ─── Maintenance ───
CREATE TABLE IF NOT EXISTS maintenance (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id   INTEGER NOT NULL DEFAULT 1,
  date          TEXT,
  description   TEXT NOT NULL,
  category      TEXT,
  vendor        TEXT,
  cost          REAL DEFAULT 0,
  status        TEXT DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','cancelled')),
  priority      TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high','urgent')),
  has_warranty  INTEGER DEFAULT 0,
  next_service  TEXT,
  notes         TEXT,
  file_path     TEXT,
  file_size     INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now'))
);

-- ─── Pricing Seasons ───
CREATE TABLE IF NOT EXISTS pricing_seasons (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id   INTEGER NOT NULL DEFAULT 1,
  name          TEXT NOT NULL,
  start_date    TEXT,
  end_date      TEXT,
  multiplier    REAL DEFAULT 1.0,
  min_nights    INTEGER DEFAULT 1,
  notes         TEXT
);

-- ─── Documents ───
CREATE TABLE IF NOT EXISTS documents (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id   INTEGER NOT NULL DEFAULT 1,
  date          TEXT,
  name          TEXT NOT NULL,
  category      TEXT,
  amount        REAL,
  vendor        TEXT,
  tax_year      INTEGER,
  status        TEXT DEFAULT 'pending',
  is_deductible INTEGER DEFAULT 0,
  file_path     TEXT,
  file_size     INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now'))
);

-- ─── Survey Responses ───
CREATE TABLE IF NOT EXISTS surveys (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id     INTEGER NOT NULL DEFAULT 1,
  guest_name      TEXT,
  email           TEXT,
  stay_date       TEXT,
  overall_rating  INTEGER,
  cleanliness     INTEGER,
  communication   INTEGER,
  checkin         INTEGER,
  accuracy        INTEGER,
  location        INTEGER,
  value           INTEGER,
  recommend       TEXT,
  comments        TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);

-- ─── Cleaning Checklist Templates ───
CREATE TABLE IF NOT EXISTS cleaning_tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  area        TEXT NOT NULL,
  task        TEXT NOT NULL,
  priority    TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high')),
  sort_order  INTEGER DEFAULT 0
);

-- ─── Property Codes ───
CREATE TABLE IF NOT EXISTS property_codes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER NOT NULL DEFAULT 1,
  label       TEXT NOT NULL,
  value       TEXT NOT NULL DEFAULT '',
  icon        TEXT DEFAULT 'key',
  sort_order  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- ─── Calendar Feeds (iCal sync) ───
CREATE TABLE IF NOT EXISTS calendar_feeds (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id INTEGER NOT NULL DEFAULT 1,
  platform    TEXT NOT NULL,
  url         TEXT NOT NULL,
  last_synced TEXT,
  status      TEXT DEFAULT 'active' CHECK(status IN ('active','paused','error')),
  created_at  TEXT DEFAULT (datetime('now'))
);

-- ─── Vendor Contacts ───
CREATE TABLE IF NOT EXISTS vendors (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  property_id   INTEGER DEFAULT 0,
  name          TEXT NOT NULL,
  company       TEXT,
  category      TEXT NOT NULL,
  phone         TEXT,
  email         TEXT,
  website       TEXT,
  address       TEXT,
  notes         TEXT,
  is_favorite   INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now'))
);

-- ─── Email Templates ───
CREATE TABLE IF NOT EXISTS email_templates (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  subject       TEXT NOT NULL,
  body          TEXT NOT NULL,
  category      TEXT DEFAULT 'general' CHECK(category IN ('welcome','thank_you','promo','reminder','follow_up','newsletter','general')),
  created_at    TEXT DEFAULT (datetime('now'))
);

-- ─── Email Campaigns ───
CREATE TABLE IF NOT EXISTS email_campaigns (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  template_id   INTEGER REFERENCES email_templates(id),
  subject       TEXT NOT NULL,
  body          TEXT NOT NULL,
  recipient_type TEXT DEFAULT 'all_optin' CHECK(recipient_type IN ('all_optin','individual','vip','past_guests')),
  recipient_ids TEXT,
  frequency     TEXT DEFAULT 'once' CHECK(frequency IN ('once','weekly','biweekly','monthly','quarterly')),
  scheduled_at  TEXT,
  next_send_at  TEXT,
  last_sent_at  TEXT,
  status        TEXT DEFAULT 'draft' CHECK(status IN ('draft','scheduled','active','paused','sent','cancelled')),
  send_count    INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now'))
);
