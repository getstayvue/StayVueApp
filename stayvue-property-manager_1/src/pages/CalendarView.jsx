import { useState, useMemo } from 'react';
import { useApi, apiPost, apiPut, apiDelete, useProperty } from '../hooks/useApi';
import { HelpButton } from './HelpCentre';
import { ChevronLeft, ChevronRight, Link2, HelpCircle, X, Plus, Trash2, RefreshCw, ExternalLink, Check, AlertCircle, Pencil, CalendarRange } from 'lucide-react';
import EmptyState from '../components/EmptyState';

const PLATFORM_COLORS = {
  'Airbnb': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500' },
  'VRBO': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-500' },
  'Booking.com': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300', dot: 'bg-indigo-500' },
  'Direct': { bg: 'bg-brand-100', text: 'text-brand-700', border: 'border-brand-300', dot: 'bg-brand-500' },
};
const DEFAULT_C = { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-300', dot: 'bg-stone-500' };

const STATUS_BADGE = {
  confirmed: 'bg-emerald-50 text-emerald-700',
  completed: 'bg-stone-100 text-stone-500',
  pending: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-600',
};

const FEED_PLATFORMS = ['Airbnb', 'VRBO', 'Booking.com', 'Google Calendar', 'HomeAway', 'TripAdvisor', 'Other'];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getMonthDays(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay();
  const totalDays = last.getDate();
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  return cells;
}

function dateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function CalendarView() {
  const { propertyId, properties } = useProperty();
  const pid = propertyId || 0;
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  // Feed management
  const { data: feeds, refetch: reFeeds } = useApi(`/calendar-feeds?property_id=${pid}`, [pid]);
  const [feedForm, setFeedForm] = useState({ platform: 'Airbnb', url: '', property_id: 0 });
  const [feedSaving, setFeedSaving] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const [syncResult, setSyncResult] = useState(null);

  const { data, loading, refetch: reBookings } = useApi(`/bookings?limit=500&property_id=${pid}`, [pid]);
  const bookings = data?.data || [];

  const dayMap = useMemo(() => {
    const map = {};
    for (const b of bookings) {
      if (b.status === 'cancelled') continue;
      const start = new Date(b.check_in + 'T00:00:00');
      const end = new Date(b.check_out + 'T00:00:00');
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        if (!map[key]) map[key] = [];
        map[key].push(b);
      }
    }
    return map;
  }, [bookings]);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }
  function goToday() { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); }

  // Feed CRUD
  async function addFeed() {
    if (!feedForm.url || !feedForm.platform) return;
    setFeedSaving(true);
    try {
      await apiPost('/calendar-feeds', {
        property_id: feedForm.property_id || (propertyId || (properties?.[0]?.id) || 1),
        platform: feedForm.platform,
        url: feedForm.url,
      });
      setFeedForm({ platform: 'Airbnb', url: '', property_id: 0 });
      reFeeds();
    } catch (e) { alert(e.message); }
    setFeedSaving(false);
  }

  async function deleteFeed(id) {
    if (!confirm('Remove this calendar feed?')) return;
    await apiDelete(`/calendar-feeds/${id}`);
    reFeeds();
  }

  async function syncFeed(id) {
    setSyncingId(id);
    setSyncResult(null);
    try {
      const result = await apiPost(`/calendar-feeds/${id}/sync`, {});
      setSyncResult({ id, ...result });
      reFeeds();
      reBookings();
    } catch (e) {
      setSyncResult({ id, error: e.message });
    }
    setSyncingId(null);
  }

  const cells = getMonthDays(viewYear, viewMonth);
  const todayStr = dateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const upcoming = bookings
    .filter(b => b.check_in >= todayStr && b.status !== 'cancelled')
    .sort((a, b) => a.check_in.localeCompare(b.check_in))
    .slice(0, 8);

  const isEmpty = bookings.length === 0 && (!feeds || feeds.length === 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">Booking Calendar</h1><HelpButton sectionId="calendar" /></div>
          <p className="text-sm text-stone-400 mt-1">All confirmed bookings across platforms</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowHowTo(true)} className="btn-secondary flex items-center gap-1.5 text-sm">
            <HelpCircle size={15} /> How To Sync
          </button>
          <button onClick={() => setShowLinkModal(true)} className="btn-primary flex items-center gap-1.5 text-sm">
            <Link2 size={15} /> Link Calendar
          </button>
        </div>
      </div>

      {/* Connected feeds banner */}
      {(feeds || []).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {(feeds || []).map(f => (
            <span key={f.id} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-stone-100 text-stone-600">
              <span className={`w-2 h-2 rounded-full ${f.status === 'active' ? 'bg-emerald-500' : f.status === 'error' ? 'bg-red-500' : 'bg-amber-500'}`} />
              {f.platform}
              {f.last_synced && <span className="text-stone-400">· synced {f.last_synced.slice(0, 10)}</span>}
            </span>
          ))}
        </div>
      )}

      {isEmpty ? (
        <EmptyState
          icon={CalendarRange}
          title="Your calendar is empty"
          description="Sync your Airbnb, VRBO, or Booking.com calendar with one iCal link — all bookings appear automatically, color-coded by platform."
          steps={[
            'Click "Link Calendar" above to paste your iCal URL',
            'Go to your Airbnb host dashboard → Calendar → Export Calendar to find your link',
            'Repeat for VRBO and any other platforms you use',
            'Or manually add bookings via the Bookings page',
          ]}
          action={{ label: 'Link a calendar', onClick: () => setShowLinkModal(true) }}
          tip="iCal syncing is the fastest setup — one URL pulls in all your existing and future bookings."
        />
      ) : (
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Calendar */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"><ChevronLeft size={18} /></button>
              <h2 className="text-lg font-semibold min-w-[180px] text-center">{MONTHS[viewMonth]} {viewYear}</h2>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"><ChevronRight size={18} /></button>
            </div>
            <button onClick={goToday} className="btn-secondary text-xs">Today</button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[11px] font-medium text-stone-400 uppercase tracking-wider py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 border-t border-l border-stone-100">
            {cells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} className="border-r border-b border-stone-100 bg-stone-50/50 min-h-[80px]" />;
              const ds = dateStr(viewYear, viewMonth, day);
              const isToday = ds === todayStr;
              const dayBookings = dayMap[ds] || [];
              return (
                <div key={ds} className={`border-r border-b border-stone-100 min-h-[80px] p-1 transition-colors ${isToday ? 'bg-brand-50/40' : 'hover:bg-stone-50/50'}`}>
                  <div className={`text-xs font-medium mb-0.5 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-brand-500 text-white' : 'text-stone-600'}`}>{day}</div>
                  <div className="space-y-0.5">
                    {dayBookings.slice(0, 3).map(b => {
                      const c = PLATFORM_COLORS[b.platform] || DEFAULT_C;
                      const isCheckIn = b.check_in === ds;
                      return (
                        <button key={b.id} onClick={() => setSelectedBooking(b)}
                          className={`w-full text-left text-[10px] leading-tight px-1.5 py-0.5 rounded-md truncate font-medium ${c.bg} ${c.text} ${isCheckIn ? 'rounded-l-lg border-l-2 ' + c.border : ''}`}>
                          {isCheckIn ? '→ ' : ''}{b.guest_name.split(' ')[0]}
                        </button>
                      );
                    })}
                    {dayBookings.length > 3 && <p className="text-[9px] text-stone-400 text-center">+{dayBookings.length - 3} more</p>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-stone-100">
            {Object.entries(PLATFORM_COLORS).map(([name, c]) => (
              <span key={name} className="flex items-center gap-1.5 text-xs text-stone-600">
                <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />{name}
              </span>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold mb-3">Upcoming Bookings</h3>
            {upcoming.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">No upcoming bookings</p>
            ) : (
              <div className="space-y-2.5">
                {upcoming.map(b => {
                  const c = PLATFORM_COLORS[b.platform] || DEFAULT_C;
                  const checkIn = new Date(b.check_in + 'T00:00:00');
                  const daysUntil = Math.ceil((checkIn - today) / 86400000);
                  return (
                    <button key={b.id} onClick={() => { setSelectedBooking(b); setViewYear(checkIn.getFullYear()); setViewMonth(checkIn.getMonth()); }}
                      className="w-full text-left p-3 rounded-xl hover:bg-stone-50 transition-colors ring-1 ring-stone-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{b.guest_name}</span>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} title={b.platform} />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        <span>{b.check_in} → {b.check_out}</span>
                        <span className="text-stone-300">·</span>
                        <span>{b.nights}n</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${STATUS_BADGE[b.status] || ''}`}>{b.status}</span>
                        {daysUntil >= 0 && <span className="text-[10px] text-stone-400">{daysUntil === 0 ? 'Today' : `in ${daysUntil}d`}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold mb-3">This Month</h3>
            {(() => {
              const monthStart = dateStr(viewYear, viewMonth, 1);
              const monthEnd = dateStr(viewYear, viewMonth, new Date(viewYear, viewMonth + 1, 0).getDate());
              const monthBookings = bookings.filter(b => b.check_in <= monthEnd && b.check_out >= monthStart && b.status !== 'cancelled');
              const nights = Object.keys(dayMap).filter(d => d >= monthStart && d <= monthEnd).length;
              const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
              return (
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm"><span className="text-stone-500">Bookings</span><span className="font-medium">{monthBookings.length}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-stone-500">Nights booked</span><span className="font-medium">{nights}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-stone-500">Occupancy</span><span className="font-medium">{daysInMonth > 0 ? Math.round(nights / daysInMonth * 100) : 0}%</span></div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min(100, daysInMonth > 0 ? nights / daysInMonth * 100 : 0)}%` }} />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
      )}

      {/* ─── LINK CALENDAR MODAL ─── */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[5vh] overflow-y-auto" onClick={() => setShowLinkModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold flex items-center gap-2"><Link2 size={18} className="text-brand-500" /> Link External Calendar</h2>
              <button onClick={() => setShowLinkModal(false)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm text-stone-500">Paste an iCal (.ics) URL from any booking platform to automatically import reservations into your calendar.</p>

              {/* Add new feed */}
              <div className="space-y-3 p-4 rounded-xl bg-stone-50 ring-1 ring-stone-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-stone-500 mb-1 block">Platform</label>
                    <select className="input-field w-full" value={feedForm.platform} onChange={e => setFeedForm(f => ({ ...f, platform: e.target.value }))}>
                      {FEED_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-500 mb-1 block">Property</label>
                    <select className="input-field w-full" value={feedForm.property_id}
                      onChange={e => setFeedForm(f => ({ ...f, property_id: +e.target.value }))}>
                      <option value={0}>Select property…</option>
                      {(properties || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">iCal Feed URL</label>
                  <input className="input-field w-full text-sm font-mono" value={feedForm.url}
                    onChange={e => setFeedForm(f => ({ ...f, url: e.target.value }))}
                    placeholder="https://www.airbnb.com/calendar/ical/12345.ics?s=abc123" />
                </div>
                <button onClick={addFeed} disabled={feedSaving || !feedForm.url || !feedForm.platform}
                  className="btn-primary w-full flex items-center justify-center gap-1.5">
                  <Plus size={14} /> {feedSaving ? 'Adding…' : 'Add Calendar Feed'}
                </button>
              </div>

              {/* Existing feeds */}
              {(feeds || []).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wider">Connected Feeds</h3>
                  {(feeds || []).map(f => (
                    <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl ring-1 ring-stone-200">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${f.status === 'active' ? 'bg-emerald-500' : f.status === 'error' ? 'bg-red-500' : 'bg-amber-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{f.platform}</p>
                        <p className="text-[10px] text-stone-400 truncate font-mono">{f.url}</p>
                        {f.last_synced && <p className="text-[10px] text-stone-400">Last synced: {f.last_synced}</p>}
                      </div>
                      <button onClick={() => syncFeed(f.id)} disabled={syncingId === f.id}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-brand-600" title="Sync now">
                        <RefreshCw size={14} className={syncingId === f.id ? 'animate-spin' : ''} />
                      </button>
                      <button onClick={() => deleteFeed(f.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500" title="Remove">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Sync result */}
              {syncResult && (
                <div className={`p-3 rounded-xl text-sm ${syncResult.error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {syncResult.error ? (
                    <p className="flex items-center gap-2"><AlertCircle size={14} /> {syncResult.error}</p>
                  ) : (
                    <p className="flex items-center gap-2"><Check size={14} /> Synced! {syncResult.imported} new bookings imported, {syncResult.skipped} already existed.</p>
                  )}
                </div>
              )}

              <button onClick={() => { setShowLinkModal(false); setShowHowTo(true); }}
                className="text-xs text-brand-600 hover:underline flex items-center gap-1 mx-auto">
                <HelpCircle size={12} /> Need help finding your iCal URL?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── HOW-TO GUIDE MODAL ─── */}
      {showHowTo && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[5vh] overflow-y-auto" onClick={() => setShowHowTo(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold flex items-center gap-2"><HelpCircle size={18} className="text-brand-500" /> How to Link Your Calendars</h2>
              <button onClick={() => setShowHowTo(false)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <p className="text-sm text-stone-600">Each booking platform provides an iCal export URL. Copy that URL and paste it into the Link Calendar form. Here's how to find it on each platform:</p>

              {/* Airbnb */}
              <div className="rounded-xl ring-1 ring-stone-200 overflow-hidden">
                <div className="px-4 py-3 bg-red-50 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"><span className="text-white text-xs font-bold">A</span></div>
                  <h3 className="text-sm font-semibold text-red-800">Airbnb</h3>
                </div>
                <div className="p-4 space-y-2 text-sm text-stone-600">
                  <p><span className="font-medium text-stone-800">1.</span> Log in to your Airbnb host account</p>
                  <p><span className="font-medium text-stone-800">2.</span> Go to <span className="font-medium">Calendar</span> for your listing</p>
                  <p><span className="font-medium text-stone-800">3.</span> Click <span className="font-medium">Availability settings</span> (gear icon)</p>
                  <p><span className="font-medium text-stone-800">4.</span> Scroll to <span className="font-medium">"Connect calendars"</span></p>
                  <p><span className="font-medium text-stone-800">5.</span> Under "Export Calendar", click <span className="font-medium">Copy Link</span></p>
                  <p><span className="font-medium text-stone-800">6.</span> Paste the URL into the Link Calendar form above</p>
                  <p className="text-xs text-stone-400 mt-2 p-2 bg-stone-50 rounded-lg font-mono break-all">Example: https://www.airbnb.com/calendar/ical/12345678.ics?s=abc123def456</p>
                </div>
              </div>

              {/* VRBO */}
              <div className="rounded-xl ring-1 ring-stone-200 overflow-hidden">
                <div className="px-4 py-3 bg-blue-50 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center"><span className="text-white text-xs font-bold">V</span></div>
                  <h3 className="text-sm font-semibold text-blue-800">VRBO / Vrbo</h3>
                </div>
                <div className="p-4 space-y-2 text-sm text-stone-600">
                  <p><span className="font-medium text-stone-800">1.</span> Log in to your VRBO owner dashboard</p>
                  <p><span className="font-medium text-stone-800">2.</span> Go to <span className="font-medium">Calendar</span></p>
                  <p><span className="font-medium text-stone-800">3.</span> Click the <span className="font-medium">gear icon</span> or <span className="font-medium">"Import/Export"</span></p>
                  <p><span className="font-medium text-stone-800">4.</span> Under "Export Calendar", copy the <span className="font-medium">iCal link</span></p>
                  <p><span className="font-medium text-stone-800">5.</span> Paste the URL into the Link Calendar form</p>
                  <p className="text-xs text-stone-400 mt-2 p-2 bg-stone-50 rounded-lg font-mono break-all">Example: https://www.vrbo.com/icalendar/abc123.ics</p>
                </div>
              </div>

              {/* Booking.com */}
              <div className="rounded-xl ring-1 ring-stone-200 overflow-hidden">
                <div className="px-4 py-3 bg-indigo-50 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center"><span className="text-white text-xs font-bold">B</span></div>
                  <h3 className="text-sm font-semibold text-indigo-800">Booking.com</h3>
                </div>
                <div className="p-4 space-y-2 text-sm text-stone-600">
                  <p><span className="font-medium text-stone-800">1.</span> Log in to your Booking.com Extranet</p>
                  <p><span className="font-medium text-stone-800">2.</span> Go to <span className="font-medium">Rates & Availability</span></p>
                  <p><span className="font-medium text-stone-800">3.</span> Click <span className="font-medium">"Sync calendars"</span></p>
                  <p><span className="font-medium text-stone-800">4.</span> Under "Export calendar", click <span className="font-medium">Copy Link</span></p>
                  <p><span className="font-medium text-stone-800">5.</span> Paste the URL into the Link Calendar form</p>
                  <p className="text-xs text-stone-400 mt-2 p-2 bg-stone-50 rounded-lg font-mono break-all">Example: https://admin.booking.com/hotel/hoteladmin/ical.html?t=abc123</p>
                </div>
              </div>

              {/* Google Calendar */}
              <div className="rounded-xl ring-1 ring-stone-200 overflow-hidden">
                <div className="px-4 py-3 bg-emerald-50 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"><span className="text-white text-xs font-bold">G</span></div>
                  <h3 className="text-sm font-semibold text-emerald-800">Google Calendar</h3>
                </div>
                <div className="p-4 space-y-2 text-sm text-stone-600">
                  <p><span className="font-medium text-stone-800">1.</span> Open Google Calendar on desktop</p>
                  <p><span className="font-medium text-stone-800">2.</span> Click the <span className="font-medium">three dots</span> next to the calendar name in the sidebar</p>
                  <p><span className="font-medium text-stone-800">3.</span> Select <span className="font-medium">"Settings and sharing"</span></p>
                  <p><span className="font-medium text-stone-800">4.</span> Scroll to <span className="font-medium">"Secret address in iCal format"</span></p>
                  <p><span className="font-medium text-stone-800">5.</span> Copy the URL and paste it into the Link Calendar form</p>
                </div>
              </div>

              {/* Tips */}
              <div className="rounded-xl bg-brand-50 p-4">
                <h3 className="text-sm font-semibold text-brand-800 mb-2">Tips</h3>
                <div className="space-y-1.5 text-xs text-brand-700">
                  <p>• iCal URLs usually end in <span className="font-mono">.ics</span> — that's how you know you have the right link</p>
                  <p>• Each feed is one-way: it imports bookings <em>from</em> the platform <em>into</em> this app</p>
                  <p>• Click the sync button (↻) on any connected feed to pull the latest bookings</p>
                  <p>• Duplicate bookings are automatically detected and skipped</p>
                  <p>• Blocked dates from other platforms will appear as "Reserved" or "Blocked" entries</p>
                  <p>• For real-time auto-sync, set up the same iCal URL in each platform's import settings to keep them all in sync with each other</p>
                </div>
              </div>

              <button onClick={() => { setShowHowTo(false); setShowLinkModal(true); }}
                className="btn-primary w-full flex items-center justify-center gap-1.5">
                <Link2 size={14} /> Link a Calendar Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── BOOKING DETAIL MODAL ─── */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[10vh] overflow-y-auto" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 mb-8" onClick={e => e.stopPropagation()}>
            {(() => {
              const b = selectedBooking;
              const c = PLATFORM_COLORS[b.platform] || DEFAULT_C;
              return (
                <>
                  <div className={`px-6 py-4 rounded-t-2xl ${c.bg}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-lg font-semibold ${c.text}`}>{b.guest_name}</p>
                        <p className={`text-xs ${c.text} opacity-70`}>{b.platform}</p>
                      </div>
                      <span className={`text-[11px] px-2 py-1 rounded-lg ${STATUS_BADGE[b.status] || ''}`}>{b.status}</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-[10px] text-stone-400 uppercase">Check-in</p><p className="font-medium">{b.check_in}</p></div>
                      <div><p className="text-[10px] text-stone-400 uppercase">Check-out</p><p className="font-medium">{b.check_out}</p></div>
                      <div><p className="text-[10px] text-stone-400 uppercase">Nights</p><p className="font-medium">{b.nights}</p></div>
                      <div><p className="text-[10px] text-stone-400 uppercase">Guests</p><p className="font-medium">{b.guests}</p></div>
                      {b.nightly_rate > 0 && <div><p className="text-[10px] text-stone-400 uppercase">Nightly Rate</p><p className="font-medium">${b.nightly_rate}</p></div>}
                      {b.airbnb_payout > 0 && <div><p className="text-[10px] text-stone-400 uppercase">Net Payout</p><p className="font-medium text-emerald-600">${b.airbnb_payout}</p></div>}
                    </div>
                    {b.property_name && <p className="text-xs text-stone-400 pt-2 border-t border-stone-100">Property: {b.property_name}</p>}
                    {b.rating && <p className="text-xs text-stone-400">Rating: {b.rating} ★</p>}
                    {b.review_notes && <p className="text-xs text-stone-500 italic">"{b.review_notes}"</p>}
                  </div>
                  <div className="px-6 py-3 border-t border-stone-100 flex justify-end">
                    <button onClick={() => setSelectedBooking(null)} className="btn-secondary text-sm">Close</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
