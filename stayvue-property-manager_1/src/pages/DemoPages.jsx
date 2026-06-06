import { useState, useMemo } from 'react';
import { Star, Phone, Mail, Globe, MapPin, CheckCircle2, Circle, Eye, EyeOff, Users, Shield, Lock, Wifi, Building2, Car, Anchor, Send, FileText, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '../hooks/useApi';
import {
  DEMO_BOOKINGS, DEMO_EXPENSES, DEMO_MAINTENANCE, DEMO_GUESTS,
  DEMO_VENDORS, DEMO_CLEANING_TASKS, DEMO_PROPERTY_CODES, DEMO_PRICING_SEASONS,
  DEMO_TEAM, DEMO_TAX, DEMO_STORAGE, DEMO_PROPERTIES, DEMO_FEEDS,
  DEMO_TEMPLATES, DEMO_CAMPAIGNS,
} from '../data/demoData';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const PLATFORM_COLORS = { Airbnb: 'bg-red-50 text-red-600 border border-red-100', VRBO: 'bg-blue-50 text-blue-600 border border-blue-100', 'Booking.com': 'bg-indigo-50 text-indigo-600 border border-indigo-100', Direct: 'bg-emerald-50 text-emerald-600 border border-emerald-100' };
const STATUS_COLORS = { confirmed: 'bg-emerald-50 text-emerald-700', completed: 'bg-stone-100 text-stone-600', pending: 'bg-amber-50 text-amber-700' };
const MAINT_STATUS = { pending: 'bg-amber-50 text-amber-700', in_progress: 'bg-blue-50 text-blue-700', completed: 'bg-stone-100 text-stone-600' };
const PRIORITY = { high: 'bg-red-50 text-red-600', medium: 'bg-amber-50 text-amber-600', low: 'bg-stone-100 text-stone-500' };
const CATEGORY_COLORS = {
  'Cleaning': 'bg-sky-50 text-sky-700', 'Plumbing': 'bg-blue-50 text-blue-700',
  'HVAC': 'bg-orange-50 text-orange-700', 'Electrical': 'bg-amber-50 text-amber-700',
  'Snow Removal': 'bg-indigo-50 text-indigo-700', 'Lawn Care': 'bg-emerald-50 text-emerald-700',
  'Insurance': 'bg-purple-50 text-purple-700', 'Photography': 'bg-pink-50 text-pink-700',
  'Appliance Repair': 'bg-red-50 text-red-700', 'Locksmith': 'bg-stone-100 text-stone-700',
};
const PRIORITY_DOT = { high: 'bg-red-400', medium: 'bg-amber-400', low: 'bg-stone-300' };
const AREA_ICONS = { Kitchen: '🍳', Bathroom: '🚿', Bedroom: '🛏️', Bedrooms: '🛏️', Bathrooms: '🚿', 'Living Room': '🛋️', 'Living Areas': '🛋️', Outdoor: '🌿', Laundry: '🧺', General: '🏠', Entrance: '🚪' };
const ROLE_COLORS = { 'co-host': 'bg-purple-50 text-purple-700', manager: 'bg-blue-50 text-blue-700', cleaner: 'bg-teal-50 text-teal-700', accountant: 'bg-amber-50 text-amber-700', viewer: 'bg-stone-100 text-stone-600' };
const ROLE_LABELS = { 'co-host': 'Co-Host', manager: 'Property Manager', cleaner: 'Cleaner', accountant: 'Accountant', viewer: 'Viewer' };
const CODE_ICONS = { door: Lock, wifi: Wifi, lock: Lock, building: Building2, car: Car, anchor: Anchor, gate: Lock, shield: Shield };

function badge(cls, label) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${cls}`}>{label}</span>;
}

// ─── Bookings ────────────────────────────────────────────────────────────────
export function DemoBookings({ demoPropertyId = 0 }) {
  const [filter, setFilter] = useState('all');
  const [demoPopup, setDemoPopup] = useState(null);
  const allBookings = demoPropertyId ? DEMO_BOOKINGS.filter(b => b.property_id === demoPropertyId) : DEMO_BOOKINGS;
  const filtered = filter === 'all' ? allBookings : allBookings.filter(b => b.status === filter);
  const total = allBookings.reduce((s, b) => s + b.airbnb_payout, 0);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
          <p className="text-sm text-stone-400 mt-1">{allBookings.length} bookings · {formatCurrency(total)} total payout</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setDemoPopup('import')} className="btn-secondary flex items-center gap-1.5">
            <FileText size={16} /> Import CSV
          </button>
          <button onClick={() => setDemoPopup('add')} className="btn-primary flex items-center gap-1.5">
            <Users size={16} /> Add Booking
          </button>
        </div>
      </div>
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1 w-fit">
        {['all','confirmed','completed','pending'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {demoPopup && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setDemoPopup(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mx-auto">
                {demoPopup === 'import' ? <FileText size={22} className="text-brand-500" /> : <Users size={22} className="text-brand-500" />}
              </div>
              <h3 className="font-semibold text-lg">{demoPopup === 'import' ? 'Import Unavailable' : 'Feature Unavailable'}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                {demoPopup === 'import'
                  ? 'CSV import is not available in demo mode. Create a free account to import your booking history from Airbnb, VRBO, and other platforms.'
                  : 'Adding bookings is not available in demo mode. Create a free account to start tracking your reservations and guest data.'}
              </p>
              <button onClick={() => setDemoPopup(null)} className="btn-primary w-full mt-2">Got It</button>
            </div>
          </div>
        </div>
      )}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left text-stone-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Guest</th>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium">Check-in</th>
                <th className="px-4 py-3 font-medium">Nights</th>
                <th className="px-4 py-3 font-medium">Platform</th>
                <th className="px-4 py-3 font-medium text-right">Payout</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const prop = DEMO_PROPERTIES.find(p => p.id === b.property_id);
                return (
                  <tr key={b.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                    <td className="px-4 py-3 font-medium">{b.guest_name}</td>
                    <td className="px-4 py-3 text-stone-500 text-xs">{prop?.name || '—'}</td>
                    <td className="px-4 py-3 text-stone-500">{formatDate(b.check_in)}</td>
                    <td className="px-4 py-3">{b.nights}</td>
                    <td className="px-4 py-3">{badge(PLATFORM_COLORS[b.platform] || 'bg-stone-100 text-stone-600', b.platform)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(b.airbnb_payout)}</td>
                    <td className="px-4 py-3">{b.rating ? <span className="flex items-center gap-0.5 text-amber-500 text-xs"><Star size={11} className="fill-amber-400" />{b.rating}</span> : <span className="text-stone-300">—</span>}</td>
                    <td className="px-4 py-3">{badge(STATUS_COLORS[b.status] || '', b.status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Calendar (visual month view) ─────────────────────────────────────────────
export function DemoCalendar({ demoPropertyId = 0 }) {
  const allBookings = demoPropertyId ? DEMO_BOOKINGS.filter(b => b.property_id === demoPropertyId) : DEMO_BOOKINGS;
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(null);
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const PC = { Airbnb: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' }, VRBO: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' }, 'Booking.com': { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500' }, Direct: { bg: 'bg-brand-100', text: 'text-brand-700', dot: 'bg-brand-500' } };
  const DEFAULT_C = { bg: 'bg-stone-100', text: 'text-stone-700', dot: 'bg-stone-500' };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  function dStr(d) { return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`; }
  function bookingsOn(d) {
    const ds = dStr(d);
    return allBookings.filter(b => b.check_in <= ds && b.check_out > ds);
  }

  const upcoming = [...allBookings].filter(b => b.check_in >= new Date().toISOString().slice(0,10)).sort((a,b) => a.check_in.localeCompare(b.check_in)).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }} className="p-2 rounded-lg hover:bg-stone-100">‹</button>
          <span className="text-sm font-medium w-36 text-center">{MONTHS[month]} {year}</span>
          <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }} className="p-2 rounded-lg hover:bg-stone-100">›</button>
        </div>
      </div>

      <div className="flex gap-2 text-xs flex-wrap">
        {Object.entries(PC).map(([k,v]) => (
          <span key={k} className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${v.dot}`} />{k}</span>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-4">
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {DAYS.map(d => <div key={d} className="text-center text-xs font-medium text-stone-400 py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((d, i) => {
              if (!d) return <div key={`e${i}`} />;
              const bks = bookingsOn(d);
              const isToday = dStr(d) === today.toISOString().slice(0,10);
              return (
                <div key={d} onClick={() => bks.length && setSelected(bks[0])}
                  className={`min-h-[52px] p-1 rounded-lg text-xs ${bks.length ? 'cursor-pointer hover:bg-stone-50' : ''}`}>
                  <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-medium mb-0.5 ${isToday ? 'bg-brand-500 text-white' : 'text-stone-600'}`}>{d}</span>
                  {bks.slice(0, 2).map(b => {
                    const c = PC[b.platform] || DEFAULT_C;
                    return <div key={b.id} className={`text-[9px] px-1 py-0.5 rounded ${c.bg} ${c.text} truncate leading-tight`}>{b.guest_name.split(' ')[0]}</div>;
                  })}
                  {bks.length > 2 && <div className="text-[9px] text-stone-400">+{bks.length - 2}</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Upcoming</h3>
            <div className="space-y-2">
              {upcoming.map(b => {
                const c = PC[b.platform] || DEFAULT_C;
                return (
                  <div key={b.id} className="flex items-start gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${c.dot}`} />
                    <div>
                      <p className="font-medium">{b.guest_name}</p>
                      <p className="text-stone-400">{formatDate(b.check_in)} · {b.nights}n · {formatCurrency(b.airbnb_payout)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Synced Calendars</h3>
            <div className="space-y-2">
              {DEMO_FEEDS.map(f => (
                <div key={f.id} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${(PC[f.platform]||DEFAULT_C).dot}`} />
                    <span className="font-medium">{f.platform}</span>
                  </span>
                  <span className="text-emerald-600 text-[10px] font-medium">✓ Synced</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{selected.guest_name}</h3>
              <button onClick={() => setSelected(null)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>
            <div className="space-y-2 text-sm text-stone-600">
              <p><span className="text-stone-400">Check-in:</span> {formatDate(selected.check_in)}</p>
              <p><span className="text-stone-400">Check-out:</span> {formatDate(selected.check_out)}</p>
              <p><span className="text-stone-400">Payout:</span> {formatCurrency(selected.airbnb_payout)}</p>
              <p><span className="text-stone-400">Platform:</span> {selected.platform}</p>
              {selected.review && <p className="italic text-stone-500 text-xs mt-2">"{selected.review}"</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Expenses ────────────────────────────────────────────────────────────────
export function DemoExpenses({ demoPropertyId = 0 }) {
  const allExpenses = demoPropertyId ? DEMO_EXPENSES.filter(e => e.property_id === demoPropertyId) : DEMO_EXPENSES;
  const total = allExpenses.reduce((s, e) => s + e.amount, 0);
  const deductible = allExpenses.filter(e => e.tax_deductible).reduce((s, e) => s + e.amount, 0);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
        <p className="text-sm text-stone-400 mt-1">{allExpenses.length} expenses · {formatCurrency(total)} total · {formatCurrency(deductible)} deductible</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card p-4"><p className="text-xs text-stone-400 mb-1">Total Expenses</p><p className="text-xl font-semibold text-red-600">{formatCurrency(total)}</p></div>
        <div className="card p-4"><p className="text-xs text-stone-400 mb-1">Tax Deductible</p><p className="text-xl font-semibold text-emerald-600">{formatCurrency(deductible)}</p></div>
        <div className="card p-4"><p className="text-xs text-stone-400 mb-1">Entries</p><p className="text-xl font-semibold">{DEMO_EXPENSES.length}</p></div>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left text-stone-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium">Deductible</th>
              </tr>
            </thead>
            <tbody>
              {allExpenses.map(e => (
                <tr key={e.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                  <td className="px-4 py-3 text-stone-500">{formatDate(e.date)}</td>
                  <td className="px-4 py-3 font-medium">{e.description}</td>
                  <td className="px-4 py-3">{badge('bg-stone-100 text-stone-600 text-[10px]', e.category)}</td>
                  <td className="px-4 py-3 text-stone-500">{e.vendor}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(e.amount)}</td>
                  <td className="px-4 py-3">{e.tax_deductible ? <span className="text-emerald-500 text-xs font-medium">✓ Yes</span> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Maintenance ─────────────────────────────────────────────────────────────
export function DemoMaintenance({ demoPropertyId = 0 }) {
  const items = demoPropertyId ? DEMO_MAINTENANCE.filter(m => m.property_id === demoPropertyId) : DEMO_MAINTENANCE;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Maintenance Log</h1>
        <p className="text-sm text-stone-400 mt-1">{items.filter(m => m.status !== 'completed').length} open · {items.length} total</p>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left text-stone-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium text-right">Cost</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map(m => {
                const prop = DEMO_PROPERTIES.find(p => p.id === m.property_id);
                return (
                  <tr key={m.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                    <td className="px-4 py-3 text-stone-500">{formatDate(m.date)}</td>
                    <td className="px-4 py-3 font-medium">{m.description}</td>
                    <td className="px-4 py-3 text-stone-500 text-xs">{prop?.name || '—'}</td>
                    <td className="px-4 py-3">{m.category}</td>
                    <td className="px-4 py-3">{badge(`${PRIORITY[m.priority] || ''} text-[10px]`, m.priority)}</td>
                    <td className="px-4 py-3 text-right font-medium">{m.cost > 0 ? formatCurrency(m.cost) : '—'}</td>
                    <td className="px-4 py-3">{badge(MAINT_STATUS[m.status] || '', m.status?.replace('_', ' '))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Guests (full CRM with email tabs) ───────────────────────────────────────
const CAMP_STATUS = { draft: 'bg-stone-100 text-stone-600', active: 'bg-emerald-50 text-emerald-700', sent: 'bg-purple-50 text-purple-700', paused: 'bg-amber-50 text-amber-700' };
const TPL_CAT = { welcome: 'bg-blue-50 text-blue-600', thank_you: 'bg-emerald-50 text-emerald-600', promo: 'bg-amber-50 text-amber-600', reminder: 'bg-red-50 text-red-600', follow_up: 'bg-purple-50 text-purple-600', newsletter: 'bg-pink-50 text-pink-600', general: 'bg-stone-100 text-stone-600' };

export function DemoGuests() {
  const [tab, setTab] = useState('guests');
  const [previewTpl, setPreviewTpl] = useState(null);
  const optedIn = DEMO_GUESTS.filter(g => g.marketing_optin);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Guest CRM</h1>
          <p className="text-sm text-stone-400 mt-1">{DEMO_GUESTS.length} guests · {optedIn.length} opted in for emails</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1 w-fit">
        {[
          { id: 'guests', label: 'Guests', icon: Users },
          { id: 'emails', label: 'Email Campaigns', icon: Send },
          { id: 'templates', label: 'Templates', icon: FileText },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === t.id ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'
            }`}>
            <t.icon size={13} />{t.label}
          </button>
        ))}
      </div>

      {/* ─── Guests Tab ─── */}
      {tab === 'guests' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Total Guests</p><p className="text-xl font-semibold">{DEMO_GUESTS.length}</p></div>
            <div className="card p-4"><p className="text-xs text-stone-500 mb-1">VIP Guests</p><p className="text-xl font-semibold text-amber-600">{DEMO_GUESTS.filter(g => g.vip).length}</p></div>
            <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Repeat Guests</p><p className="text-xl font-semibold">{DEMO_GUESTS.filter(g => g.total_stays > 1).length}</p></div>
            <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Email Opted In</p><p className="text-xl font-semibold text-emerald-600">{optedIn.length}</p></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {DEMO_GUESTS.map(g => (
              <div key={g.id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center text-sm font-semibold">
                      {`${g.first_name[0]}${g.last_name[0]}`}
                    </div>
                    <div>
                      <p className="font-medium text-sm flex items-center gap-1.5">
                        {g.first_name} {g.last_name}
                        {g.vip && badge('bg-amber-50 text-amber-600 text-[9px] ml-1', 'VIP')}
                      </p>
                      <p className="text-[11px] text-stone-400">{g.email}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div className="bg-stone-50 rounded-lg px-2.5 py-1.5"><span className="text-stone-400">Stays:</span> <span className="font-medium">{g.total_stays}</span></div>
                  <div className="bg-stone-50 rounded-lg px-2.5 py-1.5"><span className="text-stone-400">Spent:</span> <span className="font-medium">{formatCurrency(g.total_spend)}</span></div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {g.is_pet_owner ? badge('bg-blue-50 text-blue-600 text-[9px]', '🐾 Pet owner') : null}
                  {g.marketing_optin ? badge('bg-emerald-50 text-emerald-600 text-[9px]', '✉ Opted in') : null}
                  {g.last_rating ? <span className="inline-flex items-center gap-0.5 text-amber-500 text-[10px]"><Star size={10} className="fill-amber-400" />{g.last_rating}</span> : null}
                </div>
                {g.preferences && <p className="text-[11px] text-stone-400 mt-2 italic">"{g.preferences}"</p>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ─── Email Campaigns Tab ─── */}
      {tab === 'emails' && (
        <>
          {/* How it works guide */}
          <div className="rounded-xl bg-blue-50 ring-1 ring-blue-100 p-4">
            <p className="text-xs font-semibold text-blue-800 mb-2">How personalized email campaigns work</p>
            <div className="text-[11px] text-blue-700 space-y-1.5 leading-relaxed">
              <p><span className="font-semibold">1. Create a template</span> — Write your email once using variables like <code className="bg-white/60 px-1 rounded text-blue-600">{'{{first_name}}'}</code> where you want each guest's name to appear.</p>
              <p><span className="font-semibold">2. Create a campaign</span> — Pick a template, choose your audience (all opted-in guests, VIPs only, past guests, or individual), and preview it.</p>
              <p><span className="font-semibold">3. Preview & test</span> — See exactly what each guest will receive. Send a test to yourself first to check formatting and links.</p>
              <p><span className="font-semibold">4. Send</span> — One click sends a personalized email to every recipient. Each person sees their own name, not a generic "Dear Guest".</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1 text-[11px]">
              <div className="bg-white/60 rounded-lg px-2 py-1.5 flex justify-between"><code className="text-blue-600 font-mono">{'{{first_name}}'}</code><span className="text-blue-500">→ Emma</span></div>
              <div className="bg-white/60 rounded-lg px-2 py-1.5 flex justify-between"><code className="text-blue-600 font-mono">{'{{last_name}}'}</code><span className="text-blue-500">→ Wilson</span></div>
              <div className="bg-white/60 rounded-lg px-2 py-1.5 flex justify-between"><code className="text-blue-600 font-mono">{'{{full_name}}'}</code><span className="text-blue-500">→ Emma Wilson</span></div>
              <div className="bg-white/60 rounded-lg px-2 py-1.5 flex justify-between"><code className="text-blue-600 font-mono">{'{{email}}'}</code><span className="text-blue-500">→ emma@email.com</span></div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-left text-stone-500 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 font-medium">Campaign</th>
                    <th className="px-4 py-3 font-medium">Audience</th>
                    <th className="px-4 py-3 font-medium text-center">Recipients</th>
                    <th className="px-4 py-3 font-medium text-center">Opened</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_CAMPAIGNS.map(c => (
                    <tr key={c.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{c.name}</p>
                        <p className="text-[11px] text-stone-400 truncate max-w-[200px]">{c.subject}</p>
                      </td>
                      <td className="px-4 py-3 text-stone-500 text-xs capitalize">{c.recipient_type.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-center">{c.recipients_count || '—'}</td>
                      <td className="px-4 py-3 text-center">{c.opened_count > 0 ? `${c.opened_count} (${Math.round(c.opened_count/c.recipients_count*100)}%)` : '—'}</td>
                      <td className="px-4 py-3">{badge(CAMP_STATUS[c.status] || '', c.status)}</td>
                      <td className="px-4 py-3 text-stone-500 text-xs">{c.sent_at ? formatDate(c.sent_at.slice(0,10)) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ─── Templates Tab ─── */}
      {tab === 'templates' && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_TEMPLATES.map(t => (
              <div key={t.id} className="card p-4 cursor-pointer hover:ring-1 hover:ring-brand-200 transition-all" onClick={() => setPreviewTpl(previewTpl?.id === t.id ? null : t)}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm">{t.name}</h3>
                  {badge(TPL_CAT[t.category] || TPL_CAT.general, t.category.replace('_', ' '))}
                </div>
                <p className="text-xs text-stone-400 mb-2">Subject: <span className="text-stone-600">{t.subject}</span></p>
                <p className="text-[11px] text-stone-400 line-clamp-3 leading-relaxed">{t.body}</p>
              </div>
            ))}
          </div>

          {/* Template preview */}
          {previewTpl && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Preview: {previewTpl.name}</h3>
                <button onClick={() => setPreviewTpl(null)} className="text-stone-400 hover:text-stone-600 text-xs">Close</button>
              </div>
              <div className="rounded-xl ring-1 ring-stone-200 overflow-hidden">
                <div className="bg-stone-50 px-4 py-2.5 border-b border-stone-200">
                  <p className="text-xs text-stone-400">Subject:</p>
                  <p className="text-sm font-medium">{previewTpl.subject.replace(/\{\{first_name\}\}/g, 'Emma').replace(/\{\{last_name\}\}/g, 'Wilson').replace(/\{\{full_name\}\}/g, 'Emma Wilson')}</p>
                </div>
                <div className="p-4 whitespace-pre-line text-sm text-stone-700 leading-relaxed">
                  {previewTpl.body.replace(/\{\{first_name\}\}/g, 'Emma').replace(/\{\{last_name\}\}/g, 'Wilson').replace(/\{\{full_name\}\}/g, 'Emma Wilson').replace(/\{\{email\}\}/g, 'emma.w@email.com')}
                </div>
              </div>
              <p className="text-[10px] text-stone-400 mt-2 italic">Variables are shown resolved for sample guest "Emma Wilson". Each recipient sees their own details.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Vendors ─────────────────────────────────────────────────────────────────
export function DemoVendors({ demoPropertyId = 0 }) {
  const [search, setSearch] = useState('');
  const [vendorPropFilter, setVendorPropFilter] = useState(0);
  const allVendors = DEMO_VENDORS.filter(v => {
    if (vendorPropFilter) return v.property_id === vendorPropFilter || v.property_id === 0;
    return true;
  });
  const filtered = allVendors.filter(v =>
    `${v.name} ${v.company || ''} ${v.category}`.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vendors</h1>
          <p className="text-sm text-stone-400 mt-1">{filtered.length} contacts · {filtered.filter(v => v.is_favorite).length} favourites</p>
        </div>
        <div className="flex gap-2">
          <select value={vendorPropFilter} onChange={e => setVendorPropFilter(+e.target.value)} className="input-field text-sm">
            <option value={0}>All Properties</option>
            {DEMO_PROPERTIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="input-field w-40 text-sm" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(v => {
          const cc = CATEGORY_COLORS[v.category] || 'bg-stone-100 text-stone-600';
          const initials = v.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          return (
            <div key={v.id} className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold ${cc}`}>{initials}</div>
                  <div>
                    <p className="font-medium text-sm flex items-center gap-1">{v.name}{v.is_favorite ? ' ⭐' : ''}</p>
                    {v.company && <p className="text-[11px] text-stone-400">{v.company}</p>}
                  </div>
                </div>
                {badge(`${cc} text-[10px]`, v.category)}
              </div>
              <div className="space-y-1 text-xs text-stone-500">
                {v.phone && <p className="flex items-center gap-1.5"><Phone size={11} />{v.phone}</p>}
                {v.email && <p className="flex items-center gap-1.5"><Mail size={11} />{v.email}</p>}
                {v.address && <p className="flex items-center gap-1.5"><MapPin size={11} /><span className="truncate">{v.address}</span></p>}
              </div>
              {v.notes && <p className="text-[11px] text-stone-400 mt-2 italic leading-relaxed">"{v.notes}"</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Cleaning ────────────────────────────────────────────────────────────────
export function DemoCleaning() {
  const [checked, setChecked] = useState({});
  const grouped = useMemo(() => {
    const map = {};
    DEMO_CLEANING_TASKS.forEach(t => { if (!map[t.area]) map[t.area] = []; map[t.area].push(t); });
    return map;
  }, []);
  const total = DEMO_CLEANING_TASKS.length;
  const done = Object.values(checked).filter(Boolean).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Cleaning Checklist</h1>
        <button onClick={() => setChecked({})} className="btn-secondary text-sm">Reset</button>
      </div>
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{done} / {total} tasks done</span>
          <span className={`text-sm font-semibold ${pct === 100 ? 'text-emerald-600' : 'text-stone-500'}`}>{pct}%</span>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        {pct === 100 && <p className="text-emerald-600 text-xs font-medium mt-2">🎉 All tasks complete! Ready for the next guest.</p>}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {Object.entries(grouped).map(([area, tasks]) => {
          const areaDone = tasks.filter(t => checked[t.id]).length;
          return (
            <div key={area} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <span>{AREA_ICONS[area] || '📋'}</span>{area}
                </h3>
                <span className="text-xs text-stone-400">{areaDone}/{tasks.length}</span>
              </div>
              <div className="space-y-2">
                {tasks.map(t => (
                  <label key={t.id} className="flex items-start gap-2.5 cursor-pointer group">
                    <button onClick={() => setChecked(c => ({ ...c, [t.id]: !c[t.id] }))} className="mt-0.5 shrink-0">
                      {checked[t.id]
                        ? <CheckCircle2 size={16} className="text-brand-500" />
                        : <Circle size={16} className="text-stone-300 group-hover:text-stone-400" />}
                    </button>
                    <div className="flex-1">
                      <span className={`text-sm ${checked[t.id] ? 'line-through text-stone-400' : 'text-stone-700'}`}>{t.task}</span>
                      <span className={`ml-2 w-1.5 h-1.5 rounded-full inline-block ${PRIORITY_DOT[t.priority]}`} />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Property ────────────────────────────────────────────────────────────────
export function DemoProperty() {
  const [propIdx, setPropIdx] = useState(0);
  const [showVal, setShowVal] = useState({});
  const prop = DEMO_PROPERTIES[propIdx];
  const codes = DEMO_PROPERTY_CODES[prop.id] || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Property</h1>
        <div className="flex gap-2 mt-3">
          {DEMO_PROPERTIES.map((p, i) => (
            <button key={p.id} onClick={() => setPropIdx(i)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${i === propIdx ? 'bg-brand-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-sm text-stone-500 uppercase tracking-wider flex items-center gap-2"><FileText size={16} className="text-brand-500" /> Property Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div><p className="text-stone-400 text-xs">Name</p><p className="font-medium">{prop.name}</p></div>
          <div><p className="text-stone-400 text-xs">Type</p><p className="font-medium">{prop.property_type}</p></div>
          <div><p className="text-stone-400 text-xs">Bedrooms</p><p className="font-medium">{prop.bedrooms}</p></div>
          <div><p className="text-stone-400 text-xs">Bathrooms</p><p className="font-medium">{prop.bathrooms}</p></div>
          <div><p className="text-stone-400 text-xs">Max Guests</p><p className="font-medium">{prop.max_guests}</p></div>
          <div><p className="text-stone-400 text-xs">Base Rate</p><p className="font-medium">{formatCurrency(prop.base_nightly_rate)}/night</p></div>
          <div><p className="text-stone-400 text-xs">Square Footage</p><p className="font-medium">{prop.square_footage?.toLocaleString()} sq ft</p></div>
          <div><p className="text-stone-400 text-xs">Year Built</p><p className="font-medium">{prop.year_built}</p></div>
          <div><p className="text-stone-400 text-xs">Property Manager</p><p className="font-medium">{prop.property_manager}</p></div>
          <div><p className="text-stone-400 text-xs">Emergency Contact</p><p className="font-medium">{prop.emergency_contact}</p></div>
        </div>
        <div className="pt-2 border-t border-stone-100">
          <p className="text-stone-400 text-xs mb-1">Address</p>
          <p className="text-sm font-medium">{prop.address}</p>
        </div>
        {prop.listing_urls && (
          <div className="pt-2 border-t border-stone-100">
            <p className="text-stone-400 text-xs mb-1">Listing URLs</p>
            <div className="flex flex-wrap gap-3">
              {prop.listing_urls.split(',').map((url, i) => {
                const trimmed = url.trim();
                const label = trimmed.includes('airbnb') ? 'Airbnb' : trimmed.includes('vrbo') ? 'VRBO' : trimmed.includes('booking.com') ? 'Booking.com' : `Link ${i + 1}`;
                return <a key={i} href={trimmed} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"><Globe size={12} />{label}</a>;
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-semibold text-sm text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Shield size={16} className="text-brand-500" /> Insurance & Licensing</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-stone-400 text-xs">Insurance Provider</p><p className="font-medium">{prop.insurance_provider}</p></div>
            <div><p className="text-stone-400 text-xs">Policy Number</p><p className="font-medium font-mono text-xs">{prop.policy_number}</p></div>
            <div><p className="text-stone-400 text-xs">Annual Premium</p><p className="font-medium">{formatCurrency(prop.annual_premium)}</p></div>
            <div><p className="text-stone-400 text-xs">STR License</p><p className="font-medium font-mono text-xs">{prop.str_license_number}</p></div>
            <div><p className="text-stone-400 text-xs">License Expiry</p><p className="font-medium">{prop.license_expiry}</p></div>
            <div><p className="text-stone-400 text-xs">Business License</p><p className="font-medium font-mono text-xs">{prop.business_license}</p></div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-sm text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-2">🔑 Quick Codes</h2>
          {codes.length === 0 ? (
            <p className="text-center text-stone-400 text-sm py-4">No codes configured</p>
          ) : (
            <div className="space-y-2">
              {codes.map((c, i) => {
                const Icon = CODE_ICONS[c.icon] || Lock;
                return (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        <Icon size={14} className="text-stone-500" />
                      </div>
                      <span className="text-sm font-medium">{c.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-stone-700">
                        {showVal[`${propIdx}-${i}`] ? c.value : '••••'}
                      </span>
                      <button onClick={() => setShowVal(s => ({ ...s, [`${propIdx}-${i}`]: !s[`${propIdx}-${i}`] }))} className="text-stone-400 hover:text-stone-600">
                        {showVal[`${propIdx}-${i}`] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-sm text-stone-500 uppercase tracking-wider mb-3">Pricing Seasons</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-stone-400 text-xs uppercase tracking-wider border-b border-stone-100">
                <th className="pb-2 font-medium">Season</th>
                <th className="pb-2 font-medium">Dates</th>
                <th className="pb-2 font-medium text-center">Multiplier</th>
                <th className="pb-2 font-medium text-right">Effective Rate</th>
                <th className="pb-2 font-medium text-center">Min Nights</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {DEMO_PRICING_SEASONS.map(s => (
                <tr key={s.id}>
                  <td className="py-2.5 font-medium">{s.name}</td>
                  <td className="py-2.5 text-stone-500">{s.start_date} → {s.end_date}</td>
                  <td className="py-2.5 text-center">
                    <span className={`font-medium ${s.multiplier > 1 ? 'text-emerald-600' : s.multiplier < 1 ? 'text-amber-600' : 'text-stone-600'}`}>{s.multiplier}×</span>
                  </td>
                  <td className="py-2.5 text-right font-medium">{formatCurrency(prop.base_nightly_rate * s.multiplier)}/night</td>
                  <td className="py-2.5 text-center text-stone-500">{s.min_nights}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Team ─────────────────────────────────────────────────────────────────────
export function DemoTeam() {
  const PERM_COLORS = { edit: 'bg-emerald-50 text-emerald-700', view: 'bg-blue-50 text-blue-700', none: 'bg-stone-100 text-stone-400' };
  const PERM_LABELS = { edit: 'Can edit', view: 'View only', none: 'No access' };
  const MODULES = ['dashboard','calendar','bookings','expenses','maintenance','guests','cleaning','vendors','property','tax'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team Management</h1>
          <p className="text-sm text-stone-400 mt-1">{DEMO_TEAM.length} team members</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {DEMO_TEAM.map(m => {
          const initials = m.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
          return (
            <div key={m.id} className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center text-sm font-semibold">{initials}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{m.name}</span>
                    {badge(`${ROLE_COLORS[m.role] || ''} text-[10px]`, ROLE_LABELS[m.role] || m.role)}
                  </div>
                  <p className="text-xs text-stone-400">{m.email}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">Properties: {m.property_names.join(', ')}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {MODULES.map(mod => {
                  const perm = m.permissions[mod] || 'none';
                  return (
                    <div key={mod} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-stone-50">
                      <span className="text-xs capitalize">{mod}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${PERM_COLORS[perm]}`}>{PERM_LABELS[perm]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tax Centre ───────────────────────────────────────────────────────────────
export function DemoTax() {
  const t = DEMO_TAX;
  const COLORS = ['#5A7F4B','#2D7A8A','#C4853A','#6B5B95','#B5651D','#3D7068','#8B6C42'];
  const [exportModal, setExportModal] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tax Centre</h1>
          <p className="text-sm text-stone-400 mt-1">All Properties · {t.year}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setExportModal(true)} className="btn-secondary flex items-center gap-1.5 text-sm">
            <FileText size={14} /> Export CSV
          </button>
        </div>
      </div>

      {exportModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setExportModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mx-auto"><FileText size={22} className="text-brand-500" /></div>
              <h3 className="font-semibold text-lg">Export Unavailable</h3>
              <p className="text-sm text-stone-500 leading-relaxed">CSV export is not available in demo mode. Create a free account to access full export functionality for your tax reports, including per-property and combined summaries.</p>
              <button onClick={() => setExportModal(false)} className="btn-primary w-full mt-2">Got It</button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Gross Revenue', value: formatCurrency(t.totals.gross_revenue), color: 'text-emerald-700' },
          { label: 'Platform Fees', value: formatCurrency(t.totals.platform_fees), color: 'text-amber-700' },
          { label: 'Total Expenses', value: formatCurrency(t.totals.total_expenses), color: 'text-red-700' },
          { label: 'Maintenance', value: formatCurrency(t.totals.total_maintenance), color: 'text-blue-700' },
          { label: 'Net Income', value: formatCurrency(t.totals.net_income), color: 'text-emerald-700' },
        ].map(k => (
          <div key={k.label} className="card p-4">
            <p className="text-xs text-stone-400 mb-1">{k.label}</p>
            <p className={`text-xl font-semibold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-stone-100"><h3 className="font-semibold text-sm">Income by Property</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left text-stone-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium text-right">Bookings</th>
                <th className="px-4 py-3 font-medium text-right">Revenue</th>
                <th className="px-4 py-3 font-medium text-right">Fees</th>
                <th className="px-4 py-3 font-medium text-right">Expenses</th>
                <th className="px-4 py-3 font-medium text-right">Net</th>
                <th className="px-4 py-3 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {t.properties.map(p => (
                <tr key={p.property_id} className="border-b border-stone-50 hover:bg-stone-50/50">
                  <td className="px-4 py-3 font-medium">{p.property_name}</td>
                  <td className="px-4 py-3 text-right">{p.total_bookings}</td>
                  <td className="px-4 py-3 text-right text-emerald-700">{formatCurrency(p.gross_revenue)}</td>
                  <td className="px-4 py-3 text-right text-amber-600">{formatCurrency(p.platform_fees)}</td>
                  <td className="px-4 py-3 text-right text-red-600">{formatCurrency(p.total_expenses)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-700">{formatCurrency(p.net_income)}</td>
                  <td className="px-4 py-3"><button onClick={() => setExportModal(true)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-brand-600" title="Download CSV"><FileText size={13} /></button></td>
                </tr>
              ))}
              <tr className="bg-stone-50 font-semibold">
                <td className="px-4 py-3">Portfolio Total</td>
                <td className="px-4 py-3 text-right">{t.totals.total_bookings}</td>
                <td className="px-4 py-3 text-right text-emerald-700">{formatCurrency(t.totals.gross_revenue)}</td>
                <td className="px-4 py-3 text-right text-amber-600">{formatCurrency(t.totals.platform_fees)}</td>
                <td className="px-4 py-3 text-right text-red-600">{formatCurrency(t.totals.total_expenses)}</td>
                <td className="px-4 py-3 text-right text-emerald-700">{formatCurrency(t.totals.net_income)}</td>
                <td className="px-4 py-3"><button onClick={() => setExportModal(true)} className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-400 hover:text-brand-600" title="Download combined CSV"><FileText size={13} /></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="card p-5">
        <h3 className="font-semibold text-sm mb-4">Tax-Deductible Expenses</h3>
        <div className="space-y-2">
          {t.deductible_expenses.map((e, i) => {
            const total = t.deductible_expenses.reduce((s, x) => s + x.total, 0);
            const pct = total > 0 ? (e.total / total * 100) : 0;
            return (
              <div key={e.category} className="flex items-center gap-3">
                <span className="text-xs w-28 text-stone-600 truncate">{e.category}</span>
                <div className="flex-1 bg-stone-100 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                </div>
                <span className="text-xs font-medium w-20 text-right">{formatCurrency(e.total)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Storage ──────────────────────────────────────────────────────────────────
function fmtSize(n) {
  if (!n) return '0 KB';
  if (n >= 1073741824) return (n / 1073741824).toFixed(1) + ' GB';
  if (n >= 1048576) return (n / 1048576).toFixed(1) + ' MB';
  return (n / 1024).toFixed(0) + ' KB';
}
export function DemoStorage() {
  const s = DEMO_STORAGE;
  const pct = Math.min(100, s.storage_used / s.storage_limit * 100);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Storage & Data</h1>
        <p className="text-sm text-stone-400 mt-1">Professional plan · {s.plan_name}</p>
      </div>
      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Storage Usage</h2>
          <span className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg font-medium">{s.plan_name} Plan</span>
        </div>
        <div className="flex items-end justify-between mb-2">
          <div><span className="text-3xl font-bold">{fmtSize(s.storage_used)}</span><span className="text-stone-400 text-sm ml-1">of {fmtSize(s.storage_limit)}</span></div>
          <span className="text-sm text-stone-500">{pct.toFixed(0)}% used</span>
        </div>
        <div className="h-4 bg-stone-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #5A7F4B, #476B3A)' }} />
        </div>
      </div>
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Plan Limits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Properties', used: s.property_count, limit: s.property_limit, color: 'bg-brand-500' },
            { label: 'Team Members', used: s.team_count, limit: s.team_limit, color: 'bg-blue-500' },
            { label: 'Storage', used: fmtSize(s.storage_used), limit: fmtSize(s.storage_limit), color: 'bg-emerald-500', pct: pct },
          ].map(item => (
            <div key={item.label} className="p-4 rounded-xl bg-stone-50 ring-1 ring-stone-100">
              <p className="text-xs text-stone-400 mb-1">{item.label}</p>
              <p className="text-lg font-semibold">{item.used} <span className="text-stone-400 font-normal text-sm">/ {item.limit}</span></p>
              <div className="h-1.5 bg-stone-200 rounded-full mt-2">
                <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct !== undefined ? item.pct : (typeof item.used === 'number' ? (item.used / (typeof item.limit === 'number' ? item.limit : 1)) * 100 : 0)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
