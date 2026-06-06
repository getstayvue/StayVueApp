import { useState } from 'react';
import { useApi, formatCurrency, useProperty } from '../hooks/useApi';
import { TrendingUp, TrendingDown, Calendar, Star, Wrench, Users, DollarSign, Moon, LayoutDashboard } from 'lucide-react';
import { HelpButton } from './HelpCentre';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, AreaChart, Area } from 'recharts';
import EmptyState from '../components/EmptyState';

const COLORS = ['#5A7F4B','#2D7A8A','#C4853A','#6B5B95','#B5651D','#3D7068','#8B6C42','#7A8B5C'];

const PLATFORM_COLORS = {
  'Airbnb': '#FF5A5F',
  'VRBO': '#3B5FC0',
  'Booking.com': '#003580',
  'Direct': '#5A7F4B',
};

const PERIODS = [
  { id: 'month', label: 'This Month' },
  { id: 'quarter', label: 'This Quarter' },
  { id: 'year', label: 'This Year' },
  { id: 'lifetime', label: 'Lifetime' },
];

function KPICard({ icon: Icon, label, value, sub, color = 'brand' }) {
  const colorMap = {
    brand: 'bg-brand-500/10 text-brand-500',
    green: 'bg-emerald-500/10 text-emerald-600',
    red: 'bg-red-500/10 text-red-500',
    blue: 'bg-blue-500/10 text-blue-600',
    amber: 'bg-amber-500/10 text-amber-600',
    purple: 'bg-purple-500/10 text-purple-600',
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-medium text-stone-600 mb-4">{title}</h3>
      {children}
    </div>
  );
}

// Donut segment for platform chart
function PlatformDonut({ data }) {
  if (!data || data.length === 0) return <p className="text-stone-400 text-sm text-center py-8">No data</p>;
  const total = data.reduce((s, d) => s + d.revenue, 0);
  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={85} innerRadius={50} dataKey="revenue" nameKey="platform" paddingAngle={3}>
            {data.map((entry, i) => <Cell key={i} fill={PLATFORM_COLORS[entry.platform] || COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={v => formatCurrency(v)} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 mt-2">
        {data.map(p => {
          const pct = total > 0 ? (p.revenue / total * 100) : 0;
          const color = PLATFORM_COLORS[p.platform] || '#888';
          return (
            <div key={p.platform} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-xs font-medium text-stone-700 w-24">{p.platform}</span>
              <div className="flex-1 bg-stone-100 rounded-full h-2">
                <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
              </div>
              <span className="text-xs text-stone-500 w-16 text-right">{formatCurrency(p.revenue)}</span>
              <span className="text-[10px] text-stone-400 w-8 text-right">{p.bookings}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Star rating visual
function StarRating({ data }) {
  if (!data) return null;
  const { distribution, average } = data;
  const maxCount = Math.max(...distribution.map(d => d.count), 1);
  const totalReviews = distribution.reduce((s, d) => s + d.count, 0);

  return (
    <div>
      {/* Average display */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-4xl font-bold text-amber-500">{average ?? '—'}</span>
        <div>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={16} className={s <= Math.round(average || 0) ? 'text-amber-400 fill-amber-400' : 'text-stone-200'} />
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-0.5">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
        </div>
      </div>
      {/* 5 to 1 star bars */}
      <div className="space-y-2">
        {[...distribution].reverse().map(d => {
          const pct = maxCount > 0 ? (d.count / maxCount * 100) : 0;
          return (
            <div key={d.star} className="flex items-center gap-2.5">
              <span className="text-xs text-stone-500 w-5 text-right">{d.star}</span>
              <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />
              <div className="flex-1 bg-stone-100 rounded-full h-2.5">
                <div className="h-2.5 rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-stone-500 w-6 text-right">{d.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { propertyId, setPropertyId, properties } = useProperty();
  const pid = propertyId || 0;
  const [period, setPeriod] = useState('lifetime');
  const pq = `property_id=${pid}&period=${period}`;
  const { data: summary } = useApi(`/dashboard/summary?${pq}`, [pid, period]);
  const { data: monthly } = useApi(`/dashboard/monthly-revenue?${pq}`, [pid, period]);
  const { data: expBreak } = useApi(`/dashboard/expense-breakdown?${pq}`, [pid, period]);
  const { data: ratings } = useApi(`/dashboard/ratings-distribution?${pq}`, [pid, period]);
  const { data: platforms } = useApi(`/dashboard/platform-split?${pq}`, [pid, period]);

  if (!summary) return <div className="animate-pulse space-y-4"><div className="h-32 bg-stone-100 rounded-2xl" /><div className="h-64 bg-stone-100 rounded-2xl" /></div>;

  // Empty state — no data yet
  const hasData = summary.totalBookings > 0 || summary.totalExpenses > 0;
  if (!hasData && (!properties || properties.length === 0)) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1></div>
        <EmptyState
          icon={LayoutDashboard}
          title="Your dashboard is waiting"
          description="Once you add a property and start logging bookings and expenses, your revenue, occupancy, and ratings will all appear here automatically."
          steps={[
            'Add your first property using the sidebar dropdown (click + next to "All Properties")',
            'Add your Airbnb or VRBO iCal URL in the Calendar page to sync bookings automatically',
            'Log your first expense under Expenses — your charts update in real time',
          ]}
          tip="Toggle to the Demo above to see what a fully set-up dashboard looks like."
        />
      </div>
    );
  }

  const s = summary;
  const currentPropName = pid === 0 ? 'All Properties' : properties?.find(p => p.id === pid)?.name || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <HelpButton sectionId="dashboard" />
          </div>
          <p className="text-sm text-stone-400 mt-1">{currentPropName}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {/* Period toggle */}
          <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
            {PERIODS.map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  period === p.id ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'
                }`}>
                {p.label}
              </button>
            ))}
          </div>
          {/* Property toggle */}
          {(properties || []).length > 1 && (
            <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
              <button onClick={() => setPropertyId(0)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  pid === 0 ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'
                }`}>
                All
              </button>
              {(properties || []).map(p => (
                <button key={p.id} onClick={() => setPropertyId(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all max-w-[120px] truncate ${
                    pid === p.id ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'
                  }`}>
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPI row 1 — financial */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={DollarSign} label="Total Revenue" value={formatCurrency(s.totalRevenue)} color="green" />
        <KPICard icon={TrendingDown} label="Total Expenses" value={formatCurrency(s.totalExpenses)} color="red" />
        <KPICard icon={TrendingUp} label="Net Income" value={formatCurrency(s.netIncome)} color={s.netIncome >= 0 ? 'green' : 'red'} />
        <KPICard icon={Star} label="Avg Rating" value={s.avgRating ? `${s.avgRating} ★` : '—'} sub={`Avg nightly: ${formatCurrency(s.avgNightlyRate)}`} color="amber" />
      </div>

      {/* KPI row 2 — operational */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Calendar} label="Total Bookings" value={s.totalBookings} color="blue" />
        <KPICard icon={Moon} label="Nights Booked" value={s.totalNightsBooked} color="purple" />
        <KPICard icon={Users} label="Total Guests" value={s.totalGuests} sub="In CRM" color="blue" />
        <KPICard icon={Wrench} label="Pending Maintenance" value={s.pendingMaintenance} sub="Open tickets" color="amber" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Monthly revenue">
          {monthly && monthly.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthly}>
                <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5A7F4B" stopOpacity={0.18}/><stop offset="100%" stopColor="#5A7F4B" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
                <Tooltip formatter={v => formatCurrency(v)} labelStyle={{ color: '#78716c' }} />
                <Area type="monotone" dataKey="revenue" stroke="#5A7F4B" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-stone-400 text-sm text-center py-12">No revenue data for this period</p>}
        </ChartCard>

        <ChartCard title="Expense breakdown">
          {expBreak && expBreak.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={expBreak} cx="50%" cy="50%" outerRadius={90} innerRadius={55} dataKey="total" nameKey="category" paddingAngle={2}>
                    {expBreak.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {expBreak.slice(0, 6).map((e, i) => (
                  <span key={e.category} className="text-xs flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    {e.category}
                  </span>
                ))}
              </div>
            </>
          ) : <p className="text-stone-400 text-sm text-center py-12">No expenses for this period</p>}
        </ChartCard>

        <ChartCard title="Revenue by platform">
          <PlatformDonut data={platforms} />
        </ChartCard>

        <ChartCard title="Guest ratings">
          <StarRating data={ratings} />
        </ChartCard>
      </div>
    </div>
  );
}
