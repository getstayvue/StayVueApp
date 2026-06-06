import { useState, useEffect } from 'react';
import { LayoutDashboard, CalendarDays, CalendarRange, DollarSign, Wrench, Users, ClipboardList, Home, Contact, Menu, X, Receipt, Plus, LogOut, Users2, HelpCircle, HardDrive, MessageCircleQuestion } from 'lucide-react';
import StayVueLogo from './components/StayVueLogo';
import { PropertyProvider, AuthProvider, apiGet, apiPost, authGet, authPost } from './hooks/useApi';
import { DEMO_PROPERTIES } from './data/demoData';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import Paywall from './pages/Paywall';
import TrialBanner from './pages/TrialBanner';
import DemoOverlay from './pages/DemoOverlay';
import DemoToggle from './pages/DemoToggle';
import DemoBanner from './pages/DemoBanner';
import DemoDashboard from './pages/DemoDashboard';
import {
  DemoBookings, DemoExpenses, DemoMaintenance, DemoGuests,
  DemoVendors, DemoCleaning, DemoProperty, DemoTeam, DemoTax, DemoStorage, DemoCalendar,
} from './pages/DemoPages';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import CalendarView from './pages/CalendarView';
import Expenses from './pages/Expenses';
import Maintenance from './pages/Maintenance';
import GuestCRM from './pages/GuestCRM';
import PropertyInfo from './pages/PropertyInfo';
import Cleaning from './pages/Cleaning';
import Vendors from './pages/Vendors';
import Tax from './pages/Tax';
import Team from './pages/Team';
import HelpCentre from './pages/HelpCentre';
import StoragePage from './pages/StoragePage';
import FAQ from './pages/FAQ';
import TermsOfService from './pages/TermsOfService';

const headingFont = { fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' };

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'core' },
  { id: 'calendar', label: 'Calendar', icon: CalendarRange, group: 'core' },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays, group: 'core' },
  { id: 'expenses', label: 'Expenses', icon: DollarSign, group: 'finance' },
  { id: 'tax', label: 'Tax Centre', icon: Receipt, group: 'finance' },
  { id: 'guests', label: 'Guest CRM', icon: Users, group: 'people' },
  { id: 'vendors', label: 'Vendors', icon: Contact, group: 'people' },
  { id: 'team', label: 'Team', icon: Users2, group: 'people' },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, group: 'property' },
  { id: 'cleaning', label: 'Cleaning', icon: ClipboardList, group: 'property' },
  { id: 'property', label: 'Property', icon: Home, group: 'property' },
  { id: 'storage', label: 'Storage', icon: HardDrive, group: 'settings' },
  { id: 'help', label: 'Help', icon: HelpCircle, group: 'settings' },
  { id: 'faq', label: 'FAQ', icon: MessageCircleQuestion, group: 'settings' },
];

const GROUPS = [
  { id: 'core', label: '' },
  { id: 'finance', label: 'Finance' },
  { id: 'people', label: 'People' },
  { id: 'property', label: 'Property' },
  { id: 'settings', label: 'Settings' },
];

const PAGES = {
  dashboard: Dashboard, calendar: CalendarView, bookings: Bookings, expenses: Expenses,
  maintenance: Maintenance, guests: GuestCRM, vendors: Vendors,
  tax: Tax, cleaning: Cleaning, property: PropertyInfo, team: Team,
  storage: StoragePage, help: HelpCentre, faq: FAQ,
};
const DEMO_PAGES = {
  dashboard: DemoDashboard, calendar: DemoCalendar, bookings: DemoBookings,
  expenses: DemoExpenses, maintenance: DemoMaintenance, guests: DemoGuests,
  vendors: DemoVendors, cleaning: DemoCleaning, property: DemoProperty,
  team: DemoTeam, tax: DemoTax, storage: DemoStorage,
  help: HelpCentre, faq: FAQ,
};

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [page, setPage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [properties, setProperties] = useState([]);
  const [propertyId, setPropertyId] = useState(0);
  const [access, setAccess] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [showDemoOverlay, setShowDemoOverlay] = useState(false);
  const [demoPropertyId, setDemoPropertyId] = useState(0);

  const Page = demoMode ? (DEMO_PAGES[page] || DEMO_PAGES.dashboard) : PAGES[page];

  const visibleNav = access?.is_owner ? NAV : NAV.filter(n => {
    if (!access?.permissions) return true;
    const perm = access.permissions[n.id];
    return perm && perm !== 'none';
  });

  const canEdit = (moduleId) => {
    if (demoMode) return false;
    if (!access || access.is_owner) return true;
    return access.permissions?.[moduleId] === 'edit';
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    if (savedToken && savedUser) {
      authGet('/me').then(data => {
        setUser(data.user); setToken(savedToken);
        if (!data.user.has_seen_demo) { setDemoMode(true); setShowDemoOverlay(true); }
        setAuthChecked(true);
      }).catch(() => {
        localStorage.removeItem('auth_token'); localStorage.removeItem('auth_user');
        setAuthChecked(true);
      });
    } else { setAuthChecked(true); }
  }, []);

  useEffect(() => {
    if (user && token) {
      apiGet('/property/list').then(setProperties).catch(() => {});
      apiGet('/team/my-access').then(setAccess).catch(() => setAccess({ is_owner: true }));
    }
  }, [user, token]);

  function handleAuth(userData, tokenStr) {
    setUser(userData); setToken(tokenStr);
    if (!userData.has_seen_demo) { setDemoMode(true); setShowDemoOverlay(true); }
  }
  function handleLogout() {
    const t = localStorage.getItem('auth_token');
    if (t) fetch('/api/auth/logout', { method: 'POST', headers: { 'Authorization': `Bearer ${t}` } }).catch(() => {});
    localStorage.removeItem('auth_token'); localStorage.removeItem('auth_user');
    setUser(null); setToken(null); setPage('dashboard'); setDemoMode(false);
  }
  function handleCloseDemoOverlay() {
    setShowDemoOverlay(false);
    authPost('/demo-seen', {}).catch(() => {});
    setUser(u => u ? { ...u, has_seen_demo: true } : u);
  }
  function toggleDemoMode() { setDemoMode(d => !d); }

  async function addProperty() {
    try {
      const check = await apiGet('/billing/can-add-property');
      if (!check.allowed) { alert(`You've reached your ${check.limit}-property limit. Upgrade for more.`); return; }
      const name = prompt('New property name:');
      if (!name || !name.trim()) return;
      const result = await apiPost('/property', { name: name.trim() });
      const updated = await apiGet('/property/list');
      setProperties(updated);
      if (result?.id) setPropertyId(result.id);
    } catch (e) { alert('Could not add property: ' + (e.message || 'Unknown error')); }
  }

  function navigate(id) { setPage(id); setMobileMenu(false); }

  // ─── Loading ───
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <StayVueLogo variant="mark" size={48} className="animate-pulse" />
          <p className="text-xs text-stone-400 font-medium">Loading StayVue…</p>
        </div>
      </div>
    );
  }
  // ─── Auth / Landing ───
  if (!user) {
    if (page === 'terms') return <TermsOfService onBack={() => setPage('dashboard')} />;
    if (showAuth) return <AuthPage onAuth={handleAuth} onBack={() => setShowAuth(false)} onTerms={() => setPage('terms')} />;
    return <LandingPage onGetStarted={() => setShowAuth(true)} onTerms={() => setPage('terms')} />;
  }
  // ─── Paywall ───
  if (user.trial_expired && !user.has_paid) {
    return <Paywall user={user} onActivated={() => {
      authGet('/me').then(data => { setUser(data.user); localStorage.setItem('auth_user', JSON.stringify(data.user)); }).catch(() => {});
    }} onLogout={handleLogout} />;
  }

  const trialActive = user.trial_active && !user.has_paid;
  const trialDaysLeft = user.trial_days_left || 0;
  const trialHoursLeft = user.trial_ends_at ? Math.max(0, Math.ceil((new Date(user.trial_ends_at) - new Date()) / 3600000)) : 0;
  const ctx = { propertyId, setPropertyId, properties, setProperties };
  const authCtx = { user, token, logout: handleLogout };
  const initials = user.name ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';

  return (
    <AuthProvider value={authCtx}>
      <PropertyProvider value={ctx}>
        <div className="flex h-screen overflow-hidden bg-surface-50">

          {/* ═══ Mobile header ═══ */}
          <div className="md:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-stone-200/60 z-40"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="h-14 flex items-center justify-between px-4">
              <button onClick={() => navigate('dashboard')} className="flex items-center gap-2">
                <StayVueLogo size={32} />
              </button>
              <div className="flex items-center gap-2">
                <DemoToggle isDemo={demoMode} onToggle={toggleDemoMode} compact />
                {demoMode ? (
                  <select value={demoPropertyId} onChange={e => setDemoPropertyId(+e.target.value)}
                    className="text-xs bg-violet-50 border border-violet-200 rounded-lg px-2 py-1.5 max-w-[130px] text-violet-700">
                    <option value={0}>All Properties</option>
                    {DEMO_PROPERTIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                ) : properties.length > 0 && (
                  <select value={propertyId} onChange={e => setPropertyId(+e.target.value)}
                    className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 max-w-[130px]">
                    <option value={0}>All Properties</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                )}
                <button onClick={() => setMobileMenu(!mobileMenu)} className="p-2 rounded-xl hover:bg-stone-100 transition-colors">
                  {mobileMenu ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* ═══ Mobile menu overlay ═══ */}
          {mobileMenu && (
            <div className="md:hidden fixed inset-0 z-30 animate-fadeIn" onClick={() => setMobileMenu(false)}>
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
              <div className="absolute top-14 right-0 w-72 bg-white shadow-2xl rounded-bl-2xl border-l border-b border-stone-200/60 py-3 px-3"
                style={{ top: 'calc(3.5rem + env(safe-area-inset-top))' }}
                onClick={e => e.stopPropagation()}>
                {visibleNav.map(n => (
                  <button key={n.id} onClick={() => navigate(n.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      page === n.id ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                    }`}>
                    <n.icon size={17} /><span>{n.label}</span>
                  </button>
                ))}
                <div className="border-t border-stone-100 mt-3 pt-3 px-3">
                  <div className="flex items-center gap-2 py-2">
                    {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full ring-2 ring-brand-100" /> :
                      <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center text-xs font-semibold">{initials}</div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{user.name}</p>
                      <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 py-2 text-sm text-red-500 hover:text-red-700 transition-colors">
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ Desktop sidebar ═══ */}
          <aside className={`hidden md:flex ${collapsed ? 'w-[64px]' : 'w-[220px]'} bg-white border-r border-stone-200/40 flex-col transition-all duration-300 shrink-0`}>
            {/* Logo */}
            <button onClick={() => navigate('dashboard')} className="h-16 flex items-center gap-2.5 px-4 border-b border-stone-100/80 w-full hover:bg-stone-50/50 transition-colors">
              {collapsed ? <StayVueLogo variant="mark" size={32} /> : <StayVueLogo size={36} />}
            </button>

            {/* Controls */}
            {!collapsed && (
              <div className="px-3 py-3 border-b border-stone-100/80 space-y-2">
                <DemoToggle isDemo={demoMode} onToggle={toggleDemoMode} />
                {demoMode ? (
                  <select value={demoPropertyId} onChange={e => setDemoPropertyId(+e.target.value)}
                    className="w-full text-xs bg-violet-50 border border-violet-200 rounded-xl px-2.5 py-2 text-violet-700 font-medium">
                    <option value={0}>All Properties</option>
                    {DEMO_PROPERTIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                ) : (
                  <div className="flex items-center gap-1">
                    <select value={propertyId} onChange={e => setPropertyId(+e.target.value)}
                      className="flex-1 text-xs bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 truncate font-medium">
                      <option value={0}>All Properties</option>
                      {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button onClick={addProperty} className="p-2 rounded-xl hover:bg-brand-50 text-stone-400 hover:text-brand-600 shrink-0 transition-colors" title="Add property">
                      <Plus size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
            {collapsed && (
              <div className="px-2 py-3 border-b border-stone-100/80 flex justify-center">
                <DemoToggle isDemo={demoMode} onToggle={toggleDemoMode} compact />
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 py-2 px-2 overflow-y-auto">
              {GROUPS.map(g => {
                const items = visibleNav.filter(n => n.group === g.id);
                if (!items.length) return null;
                return (
                  <div key={g.id} className={g.label ? 'mt-4 first:mt-0' : ''}>
                    {g.label && !collapsed && (
                      <p className="text-[10px] font-semibold text-stone-300 uppercase tracking-widest px-3 mb-1">{g.label}</p>
                    )}
                    {items.map(n => {
                      const active = page === n.id;
                      return (
                        <button key={n.id} onClick={() => setPage(n.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-150 mb-0.5 ${
                            active ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm shadow-brand-500/5' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                          }`}
                          title={collapsed ? n.label : undefined}>
                          <n.icon size={17} className={`shrink-0 ${active ? 'text-brand-600' : ''}`} />
                          {!collapsed && <span className="truncate">{n.label}</span>}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </nav>

            {/* User */}
            <div className="border-t border-stone-100/80 p-2">
              {!collapsed && (
                <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl hover:bg-stone-50 transition-colors mb-1">
                  {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full ring-2 ring-brand-100" /> :
                    <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center text-xs font-bold">{initials}</div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{user.name}</p>
                    <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
                  </div>
                </div>
              )}
              <button onClick={handleLogout}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all ${collapsed ? 'justify-center' : ''}`}
                title="Sign out">
                <LogOut size={15} className="shrink-0" />
                {!collapsed && <span>Sign Out</span>}
              </button>
            </div>
          </aside>

          {/* ═══ Main content ═══ */}
          <main className="flex-1 overflow-y-auto bg-surface-50 pt-14 md:pt-0"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {demoMode && <DemoBanner onExit={() => { setDemoMode(false); setPage('dashboard'); }} />}
            {!demoMode && trialActive && <TrialBanner daysLeft={trialDaysLeft} hoursLeft={trialHoursLeft} />}
            {!demoMode && access && !access.is_owner && access.is_member && (
              <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-xs text-blue-700 text-center font-medium">
                Viewing as <span className="font-bold">{access.role}</span> for {access.owner_name}'s properties
                {!canEdit(page) && <span className="ml-2 text-blue-400">· View only</span>}
              </div>
            )}
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
              {demoMode ? <Page demoPropertyId={demoPropertyId} /> : <Page />}
            </div>
          </main>
        </div>

        {showDemoOverlay && <DemoOverlay onClose={handleCloseDemoOverlay} onNavigate={navigate} />}
      </PropertyProvider>
    </AuthProvider>
  );
}
