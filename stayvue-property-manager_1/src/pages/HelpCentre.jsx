import { useState, useRef, useEffect } from 'react';
import { HelpCircle, ChevronLeft, ChevronRight, LayoutDashboard, CalendarRange, CalendarDays, DollarSign, Wrench, Users, Contact, ClipboardList, Home, Users2, Receipt, Lightbulb, CheckCircle2, ArrowRight, Sparkles, X, HardDrive } from 'lucide-react';

const GUIDES = [
  {
    id: 'getting-started',
    icon: Sparkles,
    color: 'bg-brand-500',
    title: 'Getting Started',
    subtitle: 'Your first steps with StayVue',
    steps: [
      { title: 'Create your account', desc: 'Sign up with your email or Google account. Your first 2 properties are included free.' },
      { title: 'Set up your property', desc: 'Go to the Property tab and fill in your property details — name, address, type, bedrooms, and nightly rate.' },
      { title: 'Add your codes', desc: 'In the Quick Codes section, add your WiFi password, door code, alarm code, and any other access info guests need.' },
      { title: 'Import your bookings', desc: 'Go to Bookings and either add them manually or use CSV Import to bulk-import from Airbnb, VRBO, or Booking.com.' },
      { title: 'Link your calendars', desc: 'On the Calendar page, click "Link Calendar" and paste your iCal URL from each platform to auto-sync bookings.' },
      { title: 'Start tracking expenses', desc: 'Head to Expenses and add your costs. Upload receipts as photos — they\'ll be included in your tax reports.' },
    ],
  },
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    color: 'bg-emerald-500',
    title: 'Dashboard',
    subtitle: 'Your portfolio at a glance',
    steps: [
      { title: 'Time period toggle', desc: 'Use the pills at the top right — This Month, This Quarter, This Year, or Lifetime — to see data for different time ranges. All charts and KPIs update instantly.' },
      { title: 'KPI cards', desc: 'The top row shows financials: Revenue, Expenses, Net Income, and Rating. The second row shows operational metrics: Bookings, Nights, Guests, and Maintenance.' },
      { title: 'Revenue chart', desc: 'The area chart shows monthly revenue trends. Hover over any month to see the exact figure.' },
      { title: 'Platform breakdown', desc: 'The donut chart shows which platforms generate the most revenue. Each platform has its brand color for easy identification.' },
      { title: 'Star ratings', desc: 'Shows your average guest rating (like 4.8) with a breakdown of how many 1-5 star reviews you\'ve received.' },
      { title: 'Property selector', desc: 'Use the dropdown in the sidebar to view data for a single property or all properties combined.' },
    ],
  },
  {
    id: 'calendar',
    icon: CalendarRange,
    color: 'bg-blue-500',
    title: 'Calendar',
    subtitle: 'Visual booking overview',
    steps: [
      { title: 'Month view', desc: 'Each booking appears as a colored bar spanning check-in to check-out. Colors match the booking platform — red for Airbnb, blue for VRBO, etc.' },
      { title: 'Booking details', desc: 'Click any booking on the calendar to see full details: guest name, dates, payout, rating, and review.' },
      { title: 'Link external calendars', desc: 'Click "Link Calendar" to paste an iCal URL from Airbnb, VRBO, Booking.com, or Google Calendar. Bookings sync automatically.' },
      { title: 'How to find your iCal URL', desc: 'Click "How To Sync" for step-by-step instructions for each platform — with screenshots of exactly where to find the export link.' },
      { title: 'Sync your feeds', desc: 'After linking, click the sync button (↻) on any feed to pull the latest bookings. Duplicates are automatically skipped.' },
      { title: 'Upcoming bookings', desc: 'The sidebar shows your next 8 upcoming bookings with countdown timers and platform indicators.' },
    ],
  },
  {
    id: 'bookings',
    icon: CalendarDays,
    color: 'bg-indigo-500',
    title: 'Bookings',
    subtitle: 'Manage all reservations',
    steps: [
      { title: 'Add a booking', desc: 'Click "Add Booking" and fill in the guest name, dates, platform, nightly rate, fees, and payout. Select which property it\'s for.' },
      { title: 'Filter and search', desc: 'Use the filters at the top to narrow by status (confirmed, completed, pending), year, or platform. Use the search bar to find specific guests.' },
      { title: 'CSV import', desc: 'Click "Import CSV" to bulk-import bookings. Paste CSV data or upload a file — the system auto-detects columns from Airbnb, VRBO, and Booking.com exports.' },
      { title: 'Edit or delete', desc: 'Click the pencil icon to edit any booking, or the trash icon to delete. Changes reflect immediately across Dashboard, Calendar, and Tax.' },
      { title: 'Platform tracking', desc: 'Each booking shows a color-coded platform badge. Platform fees and net payout are tracked separately for accurate tax reporting.' },
    ],
  },
  {
    id: 'expenses',
    icon: DollarSign,
    color: 'bg-red-500',
    title: 'Expenses',
    subtitle: 'Track costs and receipts',
    steps: [
      { title: 'Add an expense', desc: 'Click "Add Expense" and enter the date, amount, description, category, and vendor. Toggle "Tax Deductible" if applicable.' },
      { title: 'Upload receipts', desc: 'Attach a photo of your receipt or an invoice PDF when creating an expense. Files up to 25 MB are supported.' },
      { title: 'View receipts', desc: 'Click the eye icon on any expense with a receipt to preview the image full-screen. Click the download icon to save it.' },
      { title: 'Categories', desc: 'Choose from 10 categories: Utilities, Cleaning, Maintenance, Insurance, Tax, Supplies, Marketing, and more. Filter by category to see spending patterns.' },
      { title: 'Tax reports', desc: 'All expense data — including vendor, deductible status, and receipt attachment info — flows into your Tax Centre CSV export automatically.' },
    ],
  },
  {
    id: 'maintenance',
    icon: Wrench,
    color: 'bg-orange-500',
    title: 'Maintenance',
    subtitle: 'Track repairs and upkeep',
    steps: [
      { title: 'Log a request', desc: 'Click "Add" and enter the date, description, category (plumbing, electrical, HVAC, etc.), vendor, cost, and priority level.' },
      { title: 'Track status', desc: 'Each request has a status: pending, in progress, or completed. Update the status as work progresses.' },
      { title: 'Priority levels', desc: 'Mark items as low, medium, or high priority. High-priority items show a warning indicator. Filter by priority to focus on urgent issues.' },
      { title: 'Warranty tracking', desc: 'Toggle the warranty flag on any maintenance item. This helps you track which repairs are covered and which aren\'t.' },
      { title: 'Cost tracking', desc: 'Log the cost of each repair. Total maintenance costs show on the Dashboard and in the Tax Centre for accurate deductions.' },
    ],
  },
  {
    id: 'guests',
    icon: Users,
    color: 'bg-purple-500',
    title: 'Guest CRM',
    subtitle: 'Manage guests and email campaigns',
    steps: [
      { title: 'Guest profiles', desc: 'Each guest has a card with their contact info, stay history, total spend, rating, and preferences. Mark VIP guests and pet owners.' },
      { title: 'Marketing opt-in', desc: 'Toggle "Marketing Opt-in" for guests who agree to receive emails. Only opted-in guests receive campaigns.' },
      { title: 'Email templates', desc: 'Go to the Templates tab to create reusable emails — welcome messages, thank-you notes, seasonal promos. Use {{first_name}} for personalization.' },
      { title: 'Create a campaign', desc: 'Go to Email Campaigns, click "New Campaign", choose recipients (all opted-in, VIP, past guests, or specific individuals), set frequency, and write your email.' },
      { title: 'Send emails', desc: 'Click send on any campaign. The app generates personalized mailto links for each recipient that open in your default mail app with the subject and body pre-filled.' },
    ],
  },
  {
    id: 'vendors',
    icon: Contact,
    color: 'bg-teal-500',
    title: 'Vendors',
    subtitle: 'Your service contacts',
    steps: [
      { title: 'Add a vendor', desc: 'Click "Add Vendor" and enter their name, company, category (plumber, electrician, cleaner, etc.), phone, email, and notes.' },
      { title: 'Quick contact', desc: 'Click the phone or email icon on any vendor card to call or email them directly. Works on both desktop and mobile.' },
      { title: 'Flip cards', desc: 'Click a vendor card to flip it and see additional details like website, address, and notes on the back.' },
      { title: 'Share contacts', desc: 'Click the share icon to share a vendor\'s contact info via your phone\'s share sheet (Messages, WhatsApp, email) or copy to clipboard.' },
      { title: 'Categories', desc: 'Vendors are color-coded by category — 10 categories including Plumber, Electrician, Cleaner, Locksmith, HVAC, and more.' },
    ],
  },
  {
    id: 'cleaning',
    icon: ClipboardList,
    color: 'bg-cyan-500',
    title: 'Cleaning',
    subtitle: 'Turnover checklists',
    steps: [
      { title: 'Check off tasks', desc: 'Click the circle next to each task to mark it complete. The progress bar at the top updates in real-time.' },
      { title: 'Add tasks', desc: 'Click the + button next to any area heading, or "Add Task" at the top. Choose the area (Kitchen, Bathroom, etc.) and priority.' },
      { title: 'Add notes', desc: 'Click the message icon on any task to add a note — like "guest reported stain" or "check under bed". Notes are included when you share.' },
      { title: 'Guest checkout', desc: 'Enter the guest name in the "Guest checkout" field to track which turnover this cleaning is for.' },
      { title: 'Share with cleaners', desc: 'Click "Share" to send the full checklist to your cleaning company via text, WhatsApp, email, or clipboard. It includes all tasks, priorities, notes, and progress.' },
      { title: 'Reset', desc: 'Click "Reset" to uncheck everything and clear notes for the next turnover.' },
    ],
  },
  {
    id: 'property',
    icon: Home,
    color: 'bg-amber-500',
    title: 'Property',
    subtitle: 'Property details, codes, and docs',
    steps: [
      { title: 'Switch properties', desc: 'Use the property pills at the top to switch between properties. Each property has its own details, codes, pricing, and documents.' },
      { title: 'Add a property', desc: 'Click "Add Property" to create a new one. Free accounts include 2 properties — upgrade for more.' },
      { title: 'Quick Codes', desc: 'Add WiFi passwords, door codes, alarm codes, and more. Click any code to copy it to your clipboard. Choose from 10 icons to keep them organized.' },
      { title: 'Pricing Seasons', desc: 'Set seasonal rate multipliers — like 1.5x for summer or 0.8x for off-season. The effective nightly rate updates automatically.' },
      { title: 'Documents', desc: 'Upload insurance policies, receipts, contracts, and photos. Each document has a category, amount, tax year, and deductible flag. Files up to 25 MB.' },
      { title: 'Remove a property', desc: 'Click "Remove" to delete a property and all its data. You must have at least one property remaining.' },
    ],
  },
  {
    id: 'team',
    icon: Users2,
    color: 'bg-violet-500',
    title: 'Team',
    subtitle: 'Share access with your team',
    steps: [
      { title: 'Invite a member', desc: 'Click "Invite Member", enter their email, and choose a role. If they already have an account, they\'re added instantly. Otherwise, they\'ll get access when they sign up.' },
      { title: 'Choose a role', desc: 'Pick from preset roles: Co-Host (full access), Property Manager, Cleaner (cleaning only), Accountant (finances only), Viewer (read-only), or Custom.' },
      { title: 'Custom permissions', desc: 'With the Custom role, you control access to each section individually — Can Edit, View Only, or No Access for every module.' },
      { title: 'Property access', desc: 'If you have multiple properties, choose which ones each team member can see. They won\'t see data from restricted properties.' },
      { title: 'Edit or revoke', desc: 'Click the shield icon to change someone\'s permissions anytime. Click the trash icon to remove them completely.' },
      { title: 'Upgrade for more', desc: 'Free accounts start with 0 team slots. Upgrade to add +1 team member ($19) or +5 team members ($49) through the Team page.' },
    ],
  },
  {
    id: 'tax',
    icon: Receipt,
    color: 'bg-stone-500',
    title: 'Tax Centre',
    subtitle: 'Export reports for your accountant',
    steps: [
      { title: 'Annual summary', desc: 'See your total revenue, platform fees, expenses, maintenance costs, and net income for any year at a glance.' },
      { title: 'Per-property breakdown', desc: 'The income table shows bookings, nights, revenue, fees, expenses, and net income for each property, plus a portfolio total.' },
      { title: 'Expense categories', desc: 'Visual bars show how expenses break down by category for each property — utilities, cleaning, insurance, etc.' },
      { title: 'Deductible expenses', desc: 'A separate table shows only tax-deductible expenses with category totals, so your accountant knows exactly what to claim.' },
      { title: 'Download CSV', desc: 'Click "Download CSV" to get a comprehensive spreadsheet with 5 sections: income, expenses (with vendor and receipt info), category summary, maintenance, and net income.' },
      { title: 'Send to accountant', desc: 'Click "Send to Accountant" to share the report via email or your phone\'s share sheet. On mobile, the CSV file is attached automatically.' },
    ],
  },
  {
    id: 'storage',
    icon: HardDrive,
    color: 'bg-slate-500',
    title: 'Storage & Data',
    subtitle: 'Manage usage and backups',
    steps: [
      { title: 'Check your usage', desc: 'The storage bar shows how much space you\'re using for uploaded receipts, documents, and photos. Starter plans include 1 GB.' },
      { title: 'Upgrade storage', desc: 'If you need more space, click "Upgrade" to add +1 GB ($3/mo), +5 GB ($9/mo), or +25 GB ($19/mo) to your plan.' },
      { title: 'Download your data', desc: 'Click "Download All Data" to save a complete JSON backup of everything — all properties, bookings, expenses, guests, and more — to your computer.' },
      { title: 'Free up space', desc: 'After downloading a backup, you can delete old receipt images and document attachments from the app to free up cloud storage. Your records stay — only attached files use storage.' },
      { title: 'Plan overview', desc: 'The plan section shows your current limits for properties, team members, and storage with visual progress bars.' },
    ],
  },
];

// Contextual help popup for individual pages
export function HelpButton({ sectionId }) {
  const [open, setOpen] = useState(false);
  const guide = GUIDES.find(g => g.id === sectionId);
  if (!guide) return null;

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-brand-600 transition-colors" title="How to use this section">
        <HelpCircle size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[5vh] overflow-y-auto" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className={`px-6 py-5 rounded-t-2xl ${guide.color} text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <guide.icon size={22} />
                  <div>
                    <h2 className="font-bold text-lg">{guide.title}</h2>
                    <p className="text-white/70 text-xs">{guide.subtitle}</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/20"><X size={18} /></button>
              </div>
            </div>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              {guide.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{step.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Full Help Centre page with swipeable cards
export default function HelpCentre() {
  const [activeGuide, setActiveGuide] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const scrollRef = useRef(null);

  const guide = GUIDES[activeGuide];

  function selectGuide(idx) {
    setActiveGuide(idx);
    setActiveStep(0);
  }

  function prevStep() { if (activeStep > 0) setActiveStep(s => s - 1); }
  function nextStep() { if (activeStep < guide.steps.length - 1) setActiveStep(s => s + 1); }

  // Swipe handling
  const touchStart = useRef(null);
  function onTouchStart(e) { touchStart.current = e.touches[0].clientX; }
  function onTouchEnd(e) {
    if (!touchStart.current) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextStep();
      else prevStep();
    }
    touchStart.current = null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Help Centre</h1>
        <p className="text-sm text-stone-400 mt-1">Learn how to use every feature in StayVue</p>
      </div>

      {/* Guide selector — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {GUIDES.map((g, i) => (
          <button key={g.id} onClick={() => selectGuide(i)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeGuide === i ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' : 'bg-white ring-1 ring-stone-200 text-stone-600 hover:ring-brand-300'
            }`}>
            <g.icon size={15} />{g.title}
          </button>
        ))}
      </div>

      {/* Active guide card */}
      <div className="card overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-5 ${guide.color} text-white`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <guide.icon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{guide.title}</h2>
              <p className="text-white/70 text-sm">{guide.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Step carousel */}
        <div className="p-6" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {/* Step indicator dots */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {guide.steps.map((_, i) => (
              <button key={i} onClick={() => setActiveStep(i)}
                className={`rounded-full transition-all ${
                  i === activeStep ? 'w-6 h-2 bg-brand-500' : i < activeStep ? 'w-2 h-2 bg-brand-300' : 'w-2 h-2 bg-stone-200'
                }`} />
            ))}
          </div>

          {/* Current step */}
          <div className="min-h-[140px] flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0 ${guide.color} text-white`}>
              {activeStep + 1}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-stone-800 mb-2">{guide.steps[activeStep].title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{guide.steps[activeStep].desc}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-100">
            <button onClick={prevStep} disabled={activeStep === 0}
              className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="text-xs text-stone-400">{activeStep + 1} of {guide.steps.length}</span>
            {activeStep < guide.steps.length - 1 ? (
              <button onClick={nextStep}
                className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={() => { if (activeGuide < GUIDES.length - 1) selectGuide(activeGuide + 1); }}
                className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
                {activeGuide < GUIDES.length - 1 ? <>Next section <ArrowRight size={16} /></> : <><CheckCircle2 size={16} /> Done</>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick reference grid */}
      <div>
        <h2 className="text-lg font-semibold mb-3">All Sections</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {GUIDES.map((g, i) => (
            <button key={g.id} onClick={() => selectGuide(i)}
              className="card p-4 text-left hover:ring-1 hover:ring-brand-300 transition-all">
              <div className="flex items-center gap-2.5 mb-2">
                <div className={`w-8 h-8 rounded-lg ${g.color} text-white flex items-center justify-center`}>
                  <g.icon size={16} />
                </div>
                <span className="text-sm font-semibold">{g.title}</span>
              </div>
              <p className="text-xs text-stone-400">{g.steps.length} steps · {g.subtitle}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
