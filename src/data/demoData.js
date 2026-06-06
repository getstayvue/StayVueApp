// ─────────────────────────────────────────────────────────────────────────────
// StayVue Demo Data — "Lakeview Retreats" — a realistic 2-property hosting
// business. All data is static/read-only; rendered only in demo mode.
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_PROPERTIES = [
  {
    id: 901,
    name: 'Cozy Downtown Retreat',
    address: '742 Broadway, Nashville, TN 37203',
    property_type: 'Condo',
    bedrooms: 2,
    bathrooms: 1,
    max_guests: 4,
    base_nightly_rate: 120,
    square_footage: 850,
    year_built: 2018,
    listing_urls: 'https://airbnb.com/rooms/12345678, https://vrbo.com/2345678',
    property_manager: 'Sarah Mitchell',
    emergency_contact: '615-555-0199',
    insurance_provider: 'State Farm Insurance',
    policy_number: 'HO-2025-88421',
    annual_premium: 2400,
    str_license_number: 'STR-NSH-2025-4821',
    license_expiry: '2026-12-31',
    business_license: 'BL-TN-2024-09912',
  },
  {
    id: 902,
    name: 'Lakeside Cottage',
    address: '15 Lakeshore Drive, South Lake Tahoe, CA 96150',
    property_type: 'Cottage',
    bedrooms: 3,
    bathrooms: 2,
    max_guests: 6,
    base_nightly_rate: 180,
    square_footage: 1400,
    year_built: 2005,
    listing_urls: 'https://airbnb.com/rooms/87654321',
    property_manager: 'David Harrison',
    emergency_contact: '530-555-0177',
    insurance_provider: 'Allstate Insurance',
    policy_number: 'COT-2025-33190',
    annual_premium: 3100,
    str_license_number: 'STR-SLT-2025-7734',
    license_expiry: '2027-03-15',
    business_license: 'BL-CA-2024-15567',
  },
];

// ─── Dashboard ──────────────────────────────────────────────────────────────
export const DEMO_DASHBOARD = {
  summary: {
    totalRevenue: 84620,
    totalExpenses: 24380,
    netIncome: 60240,
    totalBookings: 78,
    avgRating: 4.9,
    avgNightlyRate: 195,
    totalNightsBooked: 412,
    pendingMaintenance: 2,
    totalGuests: 8,
  },
  monthly: [
    { month: '2025-07', revenue: 8900 },
    { month: '2025-08', revenue: 11200 },
    { month: '2025-09', revenue: 5800 },
    { month: '2025-10', revenue: 4200 },
    { month: '2025-11', revenue: 2100 },
    { month: '2025-12', revenue: 7400 },
    { month: '2026-01', revenue: 5900 },
    { month: '2026-02', revenue: 4800 },
    { month: '2026-03', revenue: 6200 },
    { month: '2026-04', revenue: 7800 },
    { month: '2026-05', revenue: 9100 },
  ],
  expenseBreakdown: [
    { category: 'Cleaning', total: 6800, count: 32 },
    { category: 'Utilities', total: 4200, count: 24 },
    { category: 'Insurance', total: 4200, count: 2 },
    { category: 'Maintenance', total: 4180, count: 11 },
    { category: 'Tax', total: 2950, count: 3 },
    { category: 'Supplies', total: 1300, count: 8 },
    { category: 'Marketing', total: 750, count: 3 },
  ],
  ratings: {
    distribution: [
      { star: 1, count: 0 }, { star: 2, count: 0 },
      { star: 3, count: 1 }, { star: 4, count: 9 }, { star: 5, count: 58 },
    ],
    average: 4.9,
  },
  platforms: [
    { platform: 'Airbnb', bookings: 48, revenue: 52400 },
    { platform: 'VRBO', bookings: 18, revenue: 19800 },
    { platform: 'Direct', bookings: 8, revenue: 8620 },
    { platform: 'Booking.com', bookings: 4, revenue: 3800 },
  ],
};

// ─── Bookings ────────────────────────────────────────────────────────────────
export const DEMO_BOOKINGS = [
  { id: 1, guest_name: 'Ava Pelletier', check_in: '2026-05-24', check_out: '2026-05-28', guests: 4, nights: 4, platform: 'Airbnb', nightly_rate: 160, airbnb_payout: 707, status: 'confirmed', rating: null, property_id: 901 },
  { id: 2, guest_name: 'Marc-André Dupont', check_in: '2026-05-20', check_out: '2026-05-25', guests: 6, nights: 5, platform: 'Airbnb', nightly_rate: 230, airbnb_payout: 1215, status: 'confirmed', rating: null, property_id: 902 },
  { id: 3, guest_name: 'William Bergeron', check_in: '2026-05-18', check_out: '2026-05-22', guests: 2, nights: 4, platform: 'Direct', nightly_rate: 145, airbnb_payout: 580, status: 'completed', rating: 4.8, review: 'Great host communication', property_id: 901 },
  { id: 4, guest_name: 'Isabella Martin', check_in: '2026-05-10', check_out: '2026-05-14', guests: 3, nights: 4, platform: 'VRBO', nightly_rate: 155, airbnb_payout: 653, status: 'completed', rating: 5.0, review: 'Everything was perfect', property_id: 902 },
  { id: 5, guest_name: 'Ethan Lawrence', check_in: '2026-05-01', check_out: '2026-05-05', guests: 2, nights: 4, platform: 'Airbnb', nightly_rate: 150, airbnb_payout: 635, status: 'completed', rating: 4.9, review: 'May in Nashville is beautiful', property_id: 901 },
  { id: 6, guest_name: 'Amy Richards', check_in: '2026-05-08', check_out: '2026-05-12', guests: 4, nights: 4, platform: 'VRBO', nightly_rate: 210, airbnb_payout: 895, status: 'completed', rating: 4.9, review: 'Lake was gorgeous', property_id: 902 },
  { id: 7, guest_name: 'Liam Côté', check_in: '2026-06-05', check_out: '2026-06-12', guests: 3, nights: 7, platform: 'Airbnb', nightly_rate: 175, airbnb_payout: 1135, status: 'confirmed', rating: null, property_id: 901 },
  { id: 8, guest_name: 'Lisa Chen-Murray', check_in: '2026-06-10', check_out: '2026-06-17', guests: 5, nights: 7, platform: 'Airbnb', nightly_rate: 260, airbnb_payout: 1840, status: 'confirmed', rating: null, property_id: 902 },
  { id: 9, guest_name: 'Charlotte Morin', check_in: '2026-06-20', check_out: '2026-06-25', guests: 2, nights: 5, platform: 'VRBO', nightly_rate: 175, airbnb_payout: 900, status: 'confirmed', rating: null, property_id: 901 },
  { id: 10, guest_name: 'Robert Paradis', check_in: '2026-07-05', check_out: '2026-07-12', guests: 6, nights: 7, platform: 'Direct', nightly_rate: 280, airbnb_payout: 1960, status: 'confirmed', rating: null, property_id: 902 },
  { id: 11, guest_name: 'Noah Gauthier', check_in: '2026-07-01', check_out: '2026-07-08', guests: 4, nights: 7, platform: 'Airbnb', nightly_rate: 190, airbnb_payout: 1325, status: 'confirmed', rating: null, property_id: 901 },
  { id: 12, guest_name: 'Emma Fournier', check_in: '2025-12-22', check_out: '2025-12-28', guests: 4, nights: 6, platform: 'Airbnb', nightly_rate: 185, airbnb_payout: 1120, status: 'completed', rating: 5.0, review: 'Perfect holiday retreat', property_id: 901 },
  { id: 13, guest_name: 'Daniel Martinez', check_in: '2026-01-10', check_out: '2026-01-15', guests: 2, nights: 5, platform: 'Booking.com', nightly_rate: 110, airbnb_payout: 590, status: 'completed', rating: 4.8, review: 'Great winter getaway', property_id: 901 },
  { id: 14, guest_name: 'Nathan Roy', check_in: '2026-04-10', check_out: '2026-04-15', guests: 3, nights: 5, platform: 'Airbnb', nightly_rate: 135, airbnb_payout: 712, status: 'completed', rating: 5.0, review: 'Springtime in Nashville', property_id: 901 },
  { id: 15, guest_name: 'François Lemieux', check_in: '2026-04-18', check_out: '2026-04-23', guests: 3, nights: 5, platform: 'Airbnb', nightly_rate: 200, airbnb_payout: 1080, status: 'completed', rating: 5.0, review: 'Dog loved it', property_id: 902 },
];

// ─── Calendar feeds (iCal links) ────────────────────────────────────────────
export const DEMO_FEEDS = [
  { id: 1, property_id: 901, platform: 'Airbnb', url: 'https://www.airbnb.com/calendar/ical/12345678.ics?s=abc123', last_synced: '2026-05-25T08:30:00', booking_count: 22 },
  { id: 2, property_id: 901, platform: 'VRBO', url: 'https://www.vrbo.com/icalendar/abc987.ics', last_synced: '2026-05-24T14:15:00', booking_count: 8 },
  { id: 3, property_id: 902, platform: 'Airbnb', url: 'https://www.airbnb.com/calendar/ical/87654321.ics?s=xyz456', last_synced: '2026-05-25T08:30:00', booking_count: 18 },
  { id: 4, property_id: 902, platform: 'VRBO', url: 'https://www.vrbo.com/icalendar/def654.ics', last_synced: '2026-05-23T09:00:00', booking_count: 7 },
];

// ─── Expenses ────────────────────────────────────────────────────────────────
export const DEMO_EXPENSES = [
  { id: 1, date: '2026-05-18', description: 'Welcome Gifts', amount: 85, category: 'Supplies', vendor: 'Local Market', tax_deductible: 1, property_id: 901 },
  { id: 2, date: '2026-05-10', description: 'Internet — May', amount: 65, category: 'Utilities', vendor: 'Vidéotron', tax_deductible: 1, property_id: 901 },
  { id: 3, date: '2026-05-05', description: 'Professional Cleaning', amount: 200, category: 'Cleaning', vendor: 'SparkleClean Nashville', tax_deductible: 1, property_id: 902 },
  { id: 4, date: '2026-05-01', description: 'Spring Opening — de-winterize, dock', amount: 380, category: 'Maintenance', vendor: 'Handy Services', tax_deductible: 1, property_id: 902 },
  { id: 5, date: '2026-05-01', description: 'Professional Cleaning', amount: 300, category: 'Cleaning', vendor: 'SparkleClean Nashville', tax_deductible: 1, property_id: 901 },
  { id: 6, date: '2026-04-15', description: 'Spring Refresh — towels and linens', amount: 250, category: 'Supplies', vendor: 'Wayfair', tax_deductible: 1, property_id: 901 },
  { id: 7, date: '2026-04-01', description: 'Professional Cleaning', amount: 300, category: 'Cleaning', vendor: 'SparkleClean Nashville', tax_deductible: 1, property_id: 901 },
  { id: 8, date: '2026-04-01', description: 'Hydro/Electricity — Apr', amount: 110, category: 'Utilities', vendor: 'Hydro One', tax_deductible: 1, property_id: 902 },
  { id: 9, date: '2026-03-15', description: 'Minor Repairs — bathroom caulking', amount: 120, category: 'Maintenance', vendor: 'QuickFix', tax_deductible: 1, property_id: 901 },
  { id: 10, date: '2026-03-01', description: 'Professional Cleaning', amount: 300, category: 'Cleaning', vendor: 'SparkleClean Nashville', tax_deductible: 1, property_id: 901 },
  { id: 11, date: '2026-02-01', description: 'Hydro/Electricity — Feb', amount: 105, category: 'Utilities', vendor: 'Hydro-Québec', tax_deductible: 1, property_id: 901 },
  { id: 12, date: '2026-01-01', description: 'Property Insurance 2026 — Condo', amount: 1800, category: 'Insurance', vendor: 'ABC Insurance', tax_deductible: 1, property_id: 901 },
  { id: 13, date: '2026-01-01', description: 'Property Insurance 2026 — Cottage', amount: 2400, category: 'Insurance', vendor: 'Allstate Insurance', tax_deductible: 1, property_id: 902 },
];

// ─── Maintenance ─────────────────────────────────────────────────────────────
export const DEMO_MAINTENANCE = [
  { id: 1, date: '2025-06-10', description: 'Deck power wash before summer season', category: 'General', vendor: '', cost: 0, status: 'pending', priority: 'medium', property_id: 901 },
  { id: 2, date: '2025-05-01', description: 'Dishwasher not draining — under warranty', category: 'Appliance', vendor: 'AppliancePro', cost: 0, status: 'pending', priority: 'high', property_id: 901 },
  { id: 3, date: '2025-03-15', description: 'Door hinge + paint touch-up', category: 'General', vendor: 'Self', cost: 165, status: 'completed', priority: 'low', property_id: 901 },
  { id: 4, date: '2024-10-20', description: 'HVAC fall tune-up', category: 'HVAC', vendor: 'CoolAir Services', cost: 195, status: 'completed', priority: 'medium', property_id: 901 },
  { id: 5, date: '2024-09-15', description: 'Smart lock installation', category: 'Electrical', vendor: 'TechHome Install', cost: 350, status: 'completed', priority: 'medium', property_id: 901 },
  { id: 6, date: '2024-05-01', description: 'Dock repair and install', category: 'General', vendor: 'Lake Services', cost: 850, status: 'completed', priority: 'high', property_id: 902 },
  { id: 7, date: '2024-04-15', description: 'HVAC spring tune-up', category: 'HVAC', vendor: 'CoolAir Services', cost: 195, status: 'completed', priority: 'medium', property_id: 901 },
];

// ─── Guests ──────────────────────────────────────────────────────────────────
export const DEMO_GUESTS = [
  { id: 1, first_name: 'Emma', last_name: 'Wilson', email: 'emma.w@email.com', phone: '+1-615-555-0101', country_city: 'Chicago, US', total_stays: 1, total_nights: 4, total_spend: 407, last_rating: 5.0, is_pet_owner: 0, preferences: 'Early check-in preferred', marketing_optin: 1, status: 'active', vip: false },
  { id: 2, first_name: 'James', last_name: 'Chen', email: 'james.c@email.com', phone: '+1-206-555-0102', country_city: 'Seattle, US', total_stays: 1, total_nights: 5, total_spend: 510, last_rating: 4.8, is_pet_owner: 0, preferences: 'Needs parking spot', marketing_optin: 1, status: 'active', vip: false },
  { id: 3, first_name: 'Olivia', last_name: 'Davis', email: 'olivia.d@email.com', phone: '+1-312-555-0103', country_city: 'Denver, US', total_stays: 2, total_nights: 10, total_spend: 1537, last_rating: 4.9, is_pet_owner: 1, preferences: 'Travelling with golden retriever', marketing_optin: 1, status: 'active', vip: true },
  { id: 4, first_name: 'Jack', last_name: 'Adams', email: 'jack.a@email.com', phone: '+1-310-555-0105', country_city: 'Nashville, US', total_stays: 1, total_nights: 5, total_spend: 1090, last_rating: 5.0, is_pet_owner: 0, preferences: 'Holiday traveler', marketing_optin: 1, status: 'active', vip: false },
  { id: 5, first_name: 'Mia', last_name: 'White', email: 'mia.w@email.com', phone: null, country_city: 'Boston, US', total_stays: 1, total_nights: 6, total_spend: 1023, last_rating: 5.0, is_pet_owner: 0, preferences: null, marketing_optin: 0, status: 'active', vip: false },
  { id: 6, first_name: 'Aiden', last_name: 'Campbell', email: 'aiden.c@email.com', phone: '+1-615-555-0106', country_city: 'Nashville, US', total_stays: 1, total_nights: 5, total_spend: 635, last_rating: 5.0, is_pet_owner: 0, preferences: 'Return guest potential', marketing_optin: 1, status: 'active', vip: false },
  { id: 7, first_name: 'Jackson', last_name: 'Collins', email: 'jackson.c@email.com', phone: '+1-415-555-0107', country_city: 'Chicago, US', total_stays: 1, total_nights: 7, total_spend: 1211, last_rating: 4.9, is_pet_owner: 1, preferences: 'Dog owner, needs yard access', marketing_optin: 1, status: 'active', vip: true },
  { id: 8, first_name: 'Charlotte', last_name: 'Clark', email: 'charlotte.c@email.com', phone: '+1-212-555-0104', country_city: 'New York, US', total_stays: 1, total_nights: 9, total_spend: 1487, last_rating: 4.7, is_pet_owner: 0, preferences: 'Late check-out requested', marketing_optin: 0, status: 'active', vip: false },
];

// ─── Vendors ─────────────────────────────────────────────────────────────────
export const DEMO_VENDORS = [
  { id: 1, property_id: 901, name: 'Claire Johnson', company: 'SparkleClean Nashville', category: 'Cleaning', phone: '+1-615-555-2001', email: 'claire@sparkleclean.com', website: 'sparkleclean.com', address: '123 Broadway, Nashville, TN', notes: 'Turnover cleans, very reliable. $150/visit.', is_favorite: 1 },
  { id: 2, property_id: 0, name: 'Pete Thompson', company: 'QuickFix Plumbing', category: 'Plumbing', phone: '+1-615-555-2002', email: 'pete@quickfixplumb.com', website: null, address: null, notes: 'Emergency availability. 1hr warranty on parts.', is_favorite: 1 },
  { id: 3, property_id: 0, name: 'John Morales', company: 'CoolAir Services', category: 'HVAC', phone: '+1-615-555-2003', email: 'service@coolair.com', website: 'coolair.com', address: '45 Music Row, Nashville, TN', notes: 'Spring and fall tune-ups. Very professional.', is_favorite: 1 },
  { id: 4, property_id: 901, name: 'Alex Nguyen', company: 'TechHome Install', category: 'Electrical', phone: '+1-615-555-2004', email: 'alex@techhome.com', website: 'techhome.com', address: null, notes: 'Smart lock & smart home installs. Good prices.', is_favorite: 0 },
  { id: 5, property_id: 901, name: 'Amy Bergman', company: 'Bergman Lawn & Snow', category: 'Snow Removal', phone: '+1-615-555-2005', email: 'amy@bergmanlawn.com', website: null, address: '890 West End Ave, Nashville, TN', notes: 'Seasonal contract Nov-Apr, $800/season. Very dependable.', is_favorite: 1 },
  { id: 6, property_id: 902, name: 'Mark Lewis', company: 'Green Thumb Lawn Care', category: 'Lawn Care', phone: '+1-615-555-2006', email: 'mark@greenthumb.com', website: 'greenthumb.com', address: null, notes: 'Weekly mowing May-Oct. $120/visit.', is_favorite: 0 },
  { id: 7, property_id: 0, name: 'Isabella Costa', company: 'ABC Insurance', category: 'Insurance', phone: '+1-615-555-2007', email: 'icosta@abcinsurance.com', website: 'abcinsurance.com', address: '200 Commerce St, Nashville, TN', notes: 'STR coverage included. Annual renewal Jan 15.', is_favorite: 1 },
  { id: 8, property_id: 0, name: 'David Chen', company: 'ProShot Studios', category: 'Photography', phone: '+1-615-555-2008', email: 'david@proshotstudios.com', website: 'proshotstudios.com', address: null, notes: 'Listing photos & video tours. $250/session.', is_favorite: 0 },
  { id: 9, property_id: 902, name: 'Nadia Khoury', company: 'AppliancePro', category: 'Appliance Repair', phone: '+1-615-555-2009', email: 'nadia@appliancepro.com', website: 'appliancepro.com', address: '567 Church St, Nashville, TN', notes: 'All major appliances. Warranty work authorized.', is_favorite: 0 },
  { id: 10, property_id: 0, name: 'Frank Garcia', company: null, category: 'Locksmith', phone: '+1-615-555-2010', email: 'fgarcia@gmail.com', website: null, address: null, notes: 'Emergency lockout service. 24/7 availability.', is_favorite: 0 },
];

// ─── Cleaning tasks ───────────────────────────────────────────────────────────
export const DEMO_CLEANING_TASKS = [
  { id: 1, area: 'Bedrooms', task: 'Strip and wash all bedding', priority: 'high', sort_order: 1 },
  { id: 2, area: 'Bedrooms', task: 'Replace with fresh clean bedding', priority: 'high', sort_order: 2 },
  { id: 3, area: 'Bedrooms', task: 'Vacuum/mop floors and under bed', priority: 'medium', sort_order: 3 },
  { id: 4, area: 'Bedrooms', task: 'Dust all surfaces, nightstands, lamps', priority: 'medium', sort_order: 4 },
  { id: 5, area: 'Bedrooms', task: 'Empty all trash cans', priority: 'high', sort_order: 5 },
  { id: 6, area: 'Bedrooms', task: 'Check for items left behind', priority: 'high', sort_order: 6 },
  { id: 7, area: 'Bathrooms', task: 'Scrub toilet inside, outside, base', priority: 'high', sort_order: 7 },
  { id: 8, area: 'Bathrooms', task: 'Clean and disinfect sink and counter', priority: 'high', sort_order: 8 },
  { id: 9, area: 'Bathrooms', task: 'Clean shower/tub, remove soap scum', priority: 'high', sort_order: 9 },
  { id: 10, area: 'Bathrooms', task: 'Replace toilet paper (min 2 rolls)', priority: 'high', sort_order: 10 },
  { id: 11, area: 'Bathrooms', task: 'Restock shampoo, conditioner, body wash', priority: 'high', sort_order: 11 },
  { id: 12, area: 'Bathrooms', task: 'Hang fresh clean towels', priority: 'high', sort_order: 12 },
  { id: 13, area: 'Kitchen', task: 'Wash all dishes, dry and put away', priority: 'high', sort_order: 13 },
  { id: 14, area: 'Kitchen', task: 'Wipe inside microwave', priority: 'high', sort_order: 14 },
  { id: 15, area: 'Kitchen', task: 'Clean stovetop and oven', priority: 'high', sort_order: 15 },
  { id: 16, area: 'Kitchen', task: 'Wipe countertops and backsplash', priority: 'high', sort_order: 16 },
  { id: 17, area: 'Kitchen', task: 'Mop floor', priority: 'high', sort_order: 17 },
  { id: 18, area: 'Kitchen', task: 'Restock coffee, tea, sugar', priority: 'medium', sort_order: 18 },
  { id: 19, area: 'Living Areas', task: 'Vacuum all sofas and cushions', priority: 'high', sort_order: 19 },
  { id: 20, area: 'Living Areas', task: 'Vacuum or mop floors', priority: 'high', sort_order: 20 },
  { id: 21, area: 'Living Areas', task: 'Wipe TV remotes (disinfect)', priority: 'high', sort_order: 21 },
  { id: 22, area: 'Living Areas', task: 'Return furniture to original position', priority: 'high', sort_order: 22 },
  { id: 23, area: 'Living Areas', task: 'Ensure WiFi is working', priority: 'high', sort_order: 23 },
  { id: 24, area: 'General', task: 'Check all windows and doors lock', priority: 'high', sort_order: 24 },
  { id: 25, area: 'General', task: 'Test smoke and CO detectors', priority: 'high', sort_order: 25 },
  { id: 26, area: 'General', task: 'Take out all garbage/recycling', priority: 'high', sort_order: 26 },
  { id: 27, area: 'General', task: 'Confirm key/lockbox is working', priority: 'high', sort_order: 27 },
  { id: 28, area: 'General', task: 'Take photos of clean unit', priority: 'medium', sort_order: 28 },
];

// ─── Property codes ──────────────────────────────────────────────────────────
export const DEMO_PROPERTY_CODES = {
  901: [
    { label: 'Front Door Code', value: '4829', icon: 'door' },
    { label: 'WiFi Network', value: 'CozyRetreat_5G', icon: 'wifi' },
    { label: 'WiFi Password', value: 'Welcome2Nashville!', icon: 'wifi' },
    { label: 'Lockbox Code', value: '1234', icon: 'lock' },
    { label: 'Building Entry', value: '#502', icon: 'building' },
    { label: 'Alarm Code', value: '9876', icon: 'shield' },
  ],
  902: [
    { label: 'Front Door Code', value: '5173', icon: 'door' },
    { label: 'WiFi Network', value: 'LakeCottage_Net', icon: 'wifi' },
    { label: 'WiFi Password', value: 'Tahoe2024!', icon: 'wifi' },
    { label: 'Lockbox Code', value: '8844', icon: 'lock' },
    { label: 'Gate Code', value: '2266', icon: 'gate' },
  ],
};

// ─── Pricing seasons ─────────────────────────────────────────────────────────
export const DEMO_PRICING_SEASONS = [
  { id: 1, name: 'Spring (Mar–May)', start_date: '03-01', end_date: '05-31', multiplier: 1.0, min_nights: 2, notes: 'Standard spring rates' },
  { id: 2, name: 'Summer Peak (Jun–Aug)', start_date: '06-01', end_date: '08-31', multiplier: 1.4, min_nights: 3, notes: 'Highest demand' },
  { id: 3, name: 'Fall (Sep–Oct)', start_date: '09-01', end_date: '10-31', multiplier: 1.1, min_nights: 2, notes: 'Leaf season premium' },
  { id: 4, name: 'Off-Season (Nov–Feb)', start_date: '11-01', end_date: '02-28', multiplier: 0.75, min_nights: 1, notes: 'Reduce for occupancy' },
  { id: 5, name: 'Holiday Premium (Dec 23–Jan 2)', start_date: '12-23', end_date: '01-02', multiplier: 1.8, min_nights: 4, notes: 'Max rate' },
];

// ─── Team members ─────────────────────────────────────────────────────────────
export const DEMO_TEAM = [
  {
    id: 1, name: 'Sophie Taylor', email: 'sophie.t@email.com', role: 'co-host',
    status: 'active', avatar_url: null,
    permissions: { dashboard: 'view', calendar: 'edit', bookings: 'edit', expenses: 'view', maintenance: 'edit', guests: 'edit', vendors: 'view', cleaning: 'edit', property: 'view', team: 'none', tax: 'none', storage: 'none' },
    property_names: ['Cozy Downtown Retreat', 'Lakeside Cottage'],
  },
  {
    id: 2, name: 'Michael Nguyen', email: 'michael@cleanteam.com', role: 'cleaner',
    status: 'active', avatar_url: null,
    permissions: { dashboard: 'none', calendar: 'view', bookings: 'none', expenses: 'none', maintenance: 'none', guests: 'none', vendors: 'none', cleaning: 'edit', property: 'none', team: 'none', tax: 'none', storage: 'none' },
    property_names: ['Cozy Downtown Retreat'],
  },
  {
    id: 3, name: 'Patricia Cooper', email: 'p.cooper@email.com', role: 'accountant',
    status: 'active', avatar_url: null,
    permissions: { dashboard: 'view', calendar: 'none', bookings: 'view', expenses: 'view', maintenance: 'none', guests: 'none', vendors: 'none', cleaning: 'none', property: 'none', team: 'none', tax: 'view', storage: 'none' },
    property_names: ['Cozy Downtown Retreat', 'Lakeside Cottage'],
  },
];

// ─── Tax centre data ──────────────────────────────────────────────────────────
export const DEMO_TAX = {
  year: '2026',
  totals: {
    gross_revenue: 84620,
    platform_fees: 8420,
    total_expenses: 24380,
    total_maintenance: 4180,
    net_income: 47640,
    total_bookings: 78,
    total_nights: 412,
  },
  properties: [
    {
      property_id: 901,
      property_name: 'Cozy Downtown Retreat',
      total_bookings: 54,
      total_nights: 258,
      gross_revenue: 52400,
      platform_fees: 5240,
      total_expenses: 14200,
      total_maintenance: 2450,
      net_income: 30510,
      expense_breakdown: [
        { category: 'Cleaning', total: 4500 },
        { category: 'Utilities', total: 2800 },
        { category: 'Insurance', total: 1800 },
        { category: 'Maintenance', total: 2450 },
        { category: 'Tax', total: 1350 },
        { category: 'Supplies', total: 900 },
        { category: 'Marketing', total: 400 },
      ],
    },
    {
      property_id: 902,
      property_name: 'Lakeside Cottage',
      total_bookings: 24,
      total_nights: 154,
      gross_revenue: 32220,
      platform_fees: 3180,
      total_expenses: 10180,
      total_maintenance: 1730,
      net_income: 17130,
      expense_breakdown: [
        { category: 'Cleaning', total: 2300 },
        { category: 'Utilities', total: 1400 },
        { category: 'Insurance', total: 2400 },
        { category: 'Maintenance', total: 1730 },
        { category: 'Tax', total: 1600 },
        { category: 'Supplies', total: 400 },
        { category: 'Marketing', total: 350 },
      ],
    },
  ],
  deductible_expenses: [
    { category: 'Cleaning', total: 6800 },
    { category: 'Utilities', total: 4200 },
    { category: 'Insurance', total: 4200 },
    { category: 'Maintenance', total: 4180 },
    { category: 'Supplies', total: 1300 },
    { category: 'Marketing', total: 750 },
    { category: 'Platform Fees', total: 8420 },
  ],
};

// ─── Storage ──────────────────────────────────────────────────────────────────
export const DEMO_STORAGE = {
  storage_used: 285932544,   // ~272 MB
  storage_limit: 5368709120, // 5 GB (Professional plan)
  storage_remaining: 5082776576,
  property_count: 2,
  property_limit: 7,
  team_count: 3,
  team_limit: 3,
  plan_name: 'Professional',
};

// ─── Feature highlights for first-login tour ─────────────────────────────────
export const DEMO_HIGHLIGHTS = [
  {
    title: 'Your hosting business at a glance',
    desc: 'Revenue, bookings, expenses, ratings — everything you need on one screen. Filter by property, month, quarter, or all time.',
    page: 'dashboard',
    icon: 'LayoutDashboard',
    tip: 'The dashboard updates live as you add bookings and expenses. Great for showing co-hosts a quick summary.',
  },
  {
    title: 'All bookings on one calendar',
    desc: 'Color-coded by platform. Paste one iCal URL to sync your Airbnb, VRBO, and Booking.com bookings automatically — no manual entry.',
    page: 'calendar',
    icon: 'CalendarRange',
    tip: 'Click any booking on the calendar to see full guest details, payout, and reviews.',
  },
  {
    title: 'Expenses with receipt photos',
    desc: 'Log costs, snap receipt photos, flag as tax-deductible. At tax time, export everything your accountant needs in one click.',
    page: 'expenses',
    icon: 'DollarSign',
    tip: 'Every expense flows automatically into the Tax Centre — your accountant will love it.',
  },
  {
    title: 'Guest CRM & repeat bookings',
    desc: 'Build guest profiles, track VIPs and pet owners, run email campaigns to drive direct repeat bookings.',
    page: 'guests',
    icon: 'Users',
    tip: 'Guests who book direct save you the platform fee — the CRM helps you nurture that relationship.',
  },
  {
    title: 'Share access with your team',
    desc: 'Invite your co-host, cleaner, or accountant with custom permissions. They see exactly what they need — nothing more.',
    page: 'team',
    icon: 'Users2',
    tip: 'Cleaners only see the cleaning checklist. Accountants only see expenses and tax. Everyone stays in their lane.',
  },
];

// ─── Email Templates ──────────────────────────────────────────────────────────
export const DEMO_TEMPLATES = [
  {
    id: 1, name: 'Welcome Back', category: 'promo',
    subject: 'We\'d love to host you again, {{first_name}}!',
    body: 'Hi {{first_name}},\n\nIt was wonderful having you as our guest! We wanted to let you know that we\'ve made some exciting upgrades since your last visit.\n\nAs a returning guest, book directly with us and enjoy a 10% discount on your next stay.\n\nWe hope to see you again soon!\n\nWarm regards,\nLakeview Retreats',
  },
  {
    id: 2, name: 'Thank You After Stay', category: 'thank_you',
    subject: 'Thank you for staying with us, {{first_name}}!',
    body: 'Hi {{first_name}},\n\nThank you so much for choosing Lakeview Retreats! We hope you had a wonderful time.\n\nIf you enjoyed your stay, we\'d really appreciate a review — it helps other travelers find us.\n\nWe\'d love to welcome you back anytime.\n\nBest,\nLakeview Retreats',
  },
  {
    id: 3, name: 'Summer Promo', category: 'promo',
    subject: 'Summer is calling, {{first_name}} — book your getaway!',
    body: 'Hi {{first_name}},\n\nSummer is right around the corner, and our lakeside cottage is booking fast!\n\nBook before June 15 and lock in last year\'s rates. Our downtown condo also has a few openings in July.\n\nReply to this email or book directly — no platform fees.\n\nSee you this summer!\nLakeview Retreats',
  },
];

// ─── Email Campaigns ──────────────────────────────────────────────────────────
export const DEMO_CAMPAIGNS = [
  {
    id: 1, name: 'Summer 2026 Promo', template_id: 3,
    subject: 'Summer is calling, {{first_name}} — book your getaway!',
    body: DEMO_TEMPLATES[2].body,
    recipient_type: 'all_optin', recipient_ids: [],
    status: 'sent', sent_at: '2026-05-15T10:00:00',
    recipients_count: 6, opened_count: 4, clicked_count: 2,
  },
  {
    id: 2, name: 'Post-Stay Thank You — May', template_id: 2,
    subject: 'Thank you for staying with us, {{first_name}}!',
    body: DEMO_TEMPLATES[1].body,
    recipient_type: 'past_guests', recipient_ids: [],
    status: 'sent', sent_at: '2026-05-20T09:00:00',
    recipients_count: 4, opened_count: 3, clicked_count: 1,
  },
  {
    id: 3, name: 'Return Guest Discount', template_id: 1,
    subject: 'We\'d love to host you again, {{first_name}}!',
    body: DEMO_TEMPLATES[0].body,
    recipient_type: 'all_optin', recipient_ids: [],
    status: 'draft', sent_at: null,
    recipients_count: 0, opened_count: 0, clicked_count: 0,
  },
];
