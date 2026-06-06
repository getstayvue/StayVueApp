import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, Star, Wrench, Users, DollarSign, Moon } from 'lucide-react';
import { formatCurrency } from '../hooks/useApi';
import { DEMO_DASHBOARD, DEMO_PROPERTIES, DEMO_BOOKINGS, DEMO_EXPENSES } from '../data/demoData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, AreaChart, Area } from 'recharts';

const COLORS = ['#5A7F4B','#2D7A8A','#C4853A','#6B5B95','#B5651D','#3D7068'];
const PLATFORM_COLORS = { 'Airbnb': '#FF5A5F', 'VRBO': '#3B5FC0', 'Booking.com': '#003580', 'Direct': '#5A7F4B' };

function KPI({ icon: Icon, label, value, sub, color = 'brand' }) {
  const cm = { brand: 'bg-brand-500/10 text-brand-500', green: 'bg-emerald-500/10 text-emerald-600', red: 'bg-red-500/10 text-red-500', blue: 'bg-blue-500/10 text-blue-600', amber: 'bg-amber-500/10 text-amber-600', purple: 'bg-purple-500/10 text-purple-600' };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cm[color]}`}><Icon size={20} /></div>
      </div>
    </div>
  );
}

export default function DemoDashboard({ demoPropertyId = 0 }) {
  const [timeFilter, setTimeFilter] = useState('Lifetime');
  const TIME_FILTERS = ['This Month', 'This Quarter', 'This Year', 'Lifetime'];

  // Filter data by time period
  const now = new Date();
  const filterDate = useMemo(() => {
    if (timeFilter === 'This Month') return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
    if (timeFilter === 'This Quarter') { const q = Math.floor(now.getMonth()/3)*3; return new Date(now.getFullYear(), q, 1).toISOString().slice(0,10); }
    if (timeFilter === 'This Year') return `${now.getFullYear()}-01-01`;
    return '2000-01-01';
  }, [timeFilter]);

  const filteredBookings = DEMO_BOOKINGS.filter(b => {
    if (demoPropertyId && b.property_id !== demoPropertyId) return false;
    return b.check_in >= filterDate;
  });
  const filteredExpenses = DEMO_EXPENSES.filter(e => {
    if (demoPropertyId && e.property_id !== demoPropertyId) return false;
    return e.date >= filterDate;
  });

  const totalRevenue = filteredBookings.reduce((s, b) => s + b.airbnb_payout, 0);
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const netIncome = totalRevenue - totalExpenses;
  const avgRating = filteredBookings.filter(b => b.rating).length > 0
    ? (filteredBookings.filter(b => b.rating).reduce((s, b) => s + b.rating, 0) / filteredBookings.filter(b => b.rating).length).toFixed(1)
    : DEMO_DASHBOARD.summary.avgRating;

  // Use lifetime chart data (always shown) but highlight the filter
  const monthly = useMemo(() => {
    const map = {};
    filteredBookings.forEach(b => {
      const month = b.check_in.slice(0, 7);
      map[month] = (map[month] || 0) + b.airbnb_payout;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([month, revenue]) => ({ month, revenue }));
  }, [filteredBookings]);

  const platforms = useMemo(() => {
    const map = {};
    filteredBookings.forEach(b => {
      if (!map[b.platform]) map[b.platform] = { platform: b.platform, bookings: 0, revenue: 0 };
      map[b.platform].bookings++;
      map[b.platform].revenue += b.airbnb_payout;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filteredBookings]);

  const totalPlatformRev = platforms.reduce((a, p) => a + p.revenue, 0);
  const activeProp = demoPropertyId ? DEMO_PROPERTIES.find(p => p.id === demoPropertyId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-stone-400 mt-1">Lakeview Retreats · {activeProp ? activeProp.name : 'All Properties'}</p>
        </div>
        <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
          {TIME_FILTERS.map(l => (
            <button key={l} onClick={() => setTimeFilter(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${timeFilter === l ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={DollarSign} label="Total Revenue" value={formatCurrency(totalRevenue)} color="green" />
        <KPI icon={TrendingDown} label="Total Expenses" value={formatCurrency(totalExpenses)} color="red" />
        <KPI icon={TrendingUp} label="Net Income" value={formatCurrency(netIncome)} color="green" />
        <KPI icon={Star} label="Avg Rating" value={`${avgRating} ★`} color="amber" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={Calendar} label="Total Bookings" value={filteredBookings.length} color="blue" />
        <KPI icon={Moon} label="Nights Booked" value={filteredBookings.reduce((s, b) => s + b.nights, 0)} color="purple" />
        <KPI icon={Users} label="Total Guests" value={DEMO_DASHBOARD.summary.totalGuests} sub="In CRM" color="blue" />
        <KPI icon={Wrench} label="Pending Maintenance" value={DEMO_DASHBOARD.summary.pendingMaintenance} sub="Open tickets" color="amber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-medium text-stone-600 mb-4">Monthly revenue</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthly}>
              <defs><linearGradient id="demoRevGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5A7F4B" stopOpacity={0.18}/><stop offset="100%" stopColor="#5A7F4B" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
              <Tooltip formatter={v => formatCurrency(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#5A7F4B" strokeWidth={2} fill="url(#demoRevGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-medium text-stone-600 mb-4">Revenue by platform</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={platforms} cx="50%" cy="50%" outerRadius={85} innerRadius={50} dataKey="revenue" nameKey="platform" paddingAngle={3}>
                {platforms.map((p, i) => <Cell key={i} fill={PLATFORM_COLORS[p.platform] || COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={v => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {platforms.map(p => {
              const pct = totalPlatformRev > 0 ? (p.revenue / totalPlatformRev * 100) : 0;
              return (
                <div key={p.platform} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: PLATFORM_COLORS[p.platform] }} />
                  <span className="text-xs font-medium text-stone-700 w-24">{p.platform}</span>
                  <div className="flex-1 bg-stone-100 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: PLATFORM_COLORS[p.platform] }} />
                  </div>
                  <span className="text-xs text-stone-500 w-16 text-right">{formatCurrency(p.revenue)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
