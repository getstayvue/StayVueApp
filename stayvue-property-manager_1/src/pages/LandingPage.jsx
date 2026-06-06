import { useState, useEffect, useRef } from 'react';
import { Check, ArrowRight, CalendarDays, DollarSign, Users, BarChart3, Shield, Smartphone, X, Zap, Ban, Clock, Lock, RefreshCw, ChevronRight, Sparkles, Star, Receipt, ClipboardList } from 'lucide-react';
import StayVueLogo from '../components/StayVueLogo';
import FAQ from './FAQ';

const logoStyle = { fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em' };
const headingFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

const PRICING = [
  {
    name: 'Starter', price: 69.99, salePrice: 49.99, monthlyEquiv: '$4.17',
    desc: 'Everything a solo host needs',
    features: ['2 properties', 'Booking calendar + iCal sync', 'Expense tracking + receipts', 'Guest CRM + email campaigns', 'Dashboard analytics', 'Tax Centre + CSV export', 'Cleaning checklists', '1 GB cloud storage'],
    notIncluded: ['Team access'],
  },
  {
    name: 'Professional', price: 99.99, salePrice: 74.99, monthlyEquiv: '$6.25',
    desc: 'Best value for growing hosts', badge: 'MOST POPULAR',
    features: ['Everything in Starter', '7 properties', '3 team members', '5 GB cloud storage', 'Vendor management', 'Priority support'],
    savings: 'Save $78 vs add-ons',
    highlighted: true,
  },
  {
    name: 'Portfolio', price: 179.99, salePrice: 129.99, monthlyEquiv: '$10.83',
    desc: 'For hosts scaling up',
    features: ['Everything in Professional', '15 properties', '10 team members', '10 GB cloud storage', 'Full data export', 'Early access to new features'],
    savings: 'Save $198 vs add-ons',
  },
];

const TOOLS = [
  { icon: CalendarDays, name: 'Booking Calendar', desc: 'iCal sync from Airbnb, VRBO & Booking.com — every reservation, one view.' },
  { icon: DollarSign, name: 'Expense Tracker', desc: 'Snap receipts, flag deductibles, export for tax time. One click.' },
  { icon: Users, name: 'Guest CRM', desc: 'Profiles, VIP tracking, personalized email campaigns to drive repeat bookings.' },
  { icon: BarChart3, name: 'Revenue Dashboard', desc: 'Revenue, occupancy, ratings, and platform breakdown — filter by anything.' },
  { icon: Shield, name: 'Team Permissions', desc: 'Cleaners see checklists. Accountants see finances. Nobody sees more than they should.' },
  { icon: Smartphone, name: 'Mobile App (PWA)', desc: 'Install on any phone. Works offline. Manage your properties from anywhere.' },
  { icon: Receipt, name: 'Tax Centre', desc: 'Auto-generated tax reports with deductible totals. Your accountant will thank you.' },
  { icon: ClipboardList, name: 'Cleaning Checklists', desc: 'Shareable turnover checklists with progress tracking. Nothing gets missed.' },
];

const COMPETITORS = [
  { name: 'Hospitable', monthly: 40 },
  { name: 'Guesty', monthly: 29 },
  { name: 'Lodgify', monthly: 17 },
  { name: 'Hostaway', monthly: 29 },
];

// Animated number counter
function Counter({ end, prefix = '', suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const startTime = Date.now();
        const tick = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * end));
          if (progress < 1) requestAnimationFrame(tick);
        };
        tick();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

// Scroll-triggered fade-in
function FadeIn({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.15 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function LandingPage({ onGetStarted, onTerms }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-white overflow-hidden">

      {/* ═══════════════════ NAV ═══════════════════ */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-stone-100/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <StayVueLogo size={36} />
          </div>
          <div className="flex items-center gap-1 sm:gap-4">
            <button onClick={() => scrollTo('tools')} className="text-sm text-stone-500 hover:text-stone-800 font-medium px-2 py-1 hidden sm:block transition-colors">Features</button>
            <button onClick={() => scrollTo('pricing')} className="text-sm text-stone-500 hover:text-stone-800 font-medium px-2 py-1 hidden sm:block transition-colors">Pricing</button>
            <button onClick={() => scrollTo('faq')} className="text-sm text-stone-500 hover:text-stone-800 font-medium px-2 py-1 hidden sm:block transition-colors">FAQ</button>
            <button onClick={onGetStarted} className="text-sm text-stone-500 hover:text-stone-800 font-medium px-2 py-1 hidden sm:block transition-colors">Sign In</button>
            <button onClick={onGetStarted}
              className="bg-brand-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-600 transition-all shadow-sm shadow-brand-500/20 hover:shadow-md hover:shadow-brand-500/25 active:scale-[0.98]">
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative">
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-50 via-white to-white" />
        <div className="absolute top-0 left-0 right-0 h-[600px] opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #5A7F4B 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 sm:pt-28 pb-16 sm:pb-24">
          <FadeIn>
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-brand-50 text-brand-700 text-sm font-semibold ring-1 ring-brand-200/60">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
                </span>
                Pay once. Own forever. No monthly fees.
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <h1 className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-extrabold tracking-tight text-stone-900 leading-[1.08] max-w-4xl mx-auto mb-6" style={headingFont}>
              The property management app that{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-brand-600">doesn't charge rent</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-brand-100/60 -z-0 rounded-sm" />
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="text-center text-lg sm:text-xl text-stone-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Bookings, expenses, guests, taxes, team access — everything Airbnb hosts need, 
              without the monthly subscription that eats into your profits.
            </p>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <button onClick={onGetStarted}
                className="group bg-brand-500 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 text-base flex items-center gap-2 active:scale-[0.98]">
                Start Your 3-Day Free Trial
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button onClick={() => scrollTo('tools')} className="text-stone-500 hover:text-stone-700 text-sm font-medium flex items-center gap-1 transition-colors">
                See what's included <ChevronRight size={14} />
              </button>
            </div>
          </FadeIn>

          {/* Social proof numbers */}
          <FadeIn delay={400}>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-center">
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-stone-800" style={headingFont}><Counter end={14} suffix="+" /></p>
                <p className="text-xs text-stone-400 mt-1 uppercase tracking-wider font-medium">Built-in tools</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-stone-200 self-center" />
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-brand-600" style={headingFont}><Counter end={0} prefix="$" suffix="/mo" /></p>
                <p className="text-xs text-stone-400 mt-1 uppercase tracking-wider font-medium">After you buy</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-stone-200 self-center" />
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-stone-800" style={headingFont}><Counter end={3} /></p>
                <p className="text-xs text-stone-400 mt-1 uppercase tracking-wider font-medium">Platforms synced</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-stone-200 self-center" />
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-stone-800" style={headingFont}>∞</p>
                <p className="text-xs text-stone-400 mt-1 uppercase tracking-wider font-medium">Free updates</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════ THE PROBLEM ═══════════════════ */}
      <section className="bg-stone-900 py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-5xl mx-auto px-6">
          <FadeIn>
            <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-4 text-center">The problem with property management software</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center mb-6 tracking-tight leading-tight" style={headingFont}>
              You're paying monthly for tools<br className="hidden sm:block" /> that should've been a one-time purchase.
            </h2>
            <p className="text-stone-400 text-center text-lg max-w-2xl mx-auto mb-14">Here's what hosting software really costs you:</p>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {COMPETITORS.map((c, i) => (
                <div key={c.name} className="bg-white/5 rounded-2xl p-5 ring-1 ring-white/10 backdrop-blur-sm">
                  <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2">{c.name}</p>
                  <p className="text-2xl font-bold text-white">${c.monthly}<span className="text-base font-normal text-white/40">/mo</span></p>
                  <p className="text-red-400/80 text-sm mt-1 font-medium">${c.monthly * 12}/yr</p>
                  <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400/60 rounded-full" style={{ width: `${Math.min(100, c.monthly * 12 / 480 * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="bg-brand-500/20 rounded-2xl p-6 sm:p-8 ring-1 ring-brand-400/30 text-center">
              <p className="text-brand-300 text-sm font-semibold uppercase tracking-wider mb-2">StayVue</p>
              <p className="text-4xl sm:text-5xl font-bold text-white mb-2" style={headingFont}>$49.99 <span className="text-lg font-normal text-brand-300">once</span></p>
              <p className="text-brand-300 text-sm">That's <span className="text-white font-semibold">$4.17/mo</span> if you use it for a year. <span className="text-brand-200 font-semibold">$0.00/mo</span> after that. Forever.</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════ TOOLS ═══════════════════ */}
      <section id="tools" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-4 text-center">Everything you need</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 text-center mb-4 tracking-tight" style={headingFont}>14+ tools. One purchase. Zero subscriptions.</h2>
            <p className="text-stone-500 text-center max-w-xl mx-auto mb-14">Every feature a host needs to run their short-term rental business — from first booking to tax season.</p>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TOOLS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 60}>
                <div className="group p-5 rounded-2xl bg-white ring-1 ring-stone-100 hover:ring-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 h-full">
                  <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-500 group-hover:shadow-md group-hover:shadow-brand-500/20 transition-all duration-300">
                    <t.icon size={20} className="text-brand-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-semibold text-stone-800 text-sm mb-1.5">{t.name}</h3>
                  <p className="text-stone-500 text-xs leading-relaxed">{t.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ WHY NO SUBSCRIPTION ═══════════════════ */}
      <section className="bg-surface-50 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-4 text-center">Our philosophy</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 text-center mb-14 tracking-tight" style={headingFont}>Why we don't charge monthly</h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { emoji: '💸', title: 'Subscriptions eat your margins', body: 'You\'re already paying platform fees to Airbnb and VRBO. Your management tool shouldn\'t be another monthly bill.' },
              { emoji: '🔒', title: 'Your data, your terms', body: 'With subscriptions, you lose access when you cancel. With StayVue, you own the app and your data. Forever.' },
              { emoji: '📈', title: 'We grow when you succeed', body: 'When you scale to more properties, you upgrade your plan. Our growth is tied to yours — not a recurring billing cycle.' },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 100}>
                <div className="text-center">
                  <span className="text-4xl block mb-4">{item.emoji}</span>
                  <h3 className="text-base font-bold text-stone-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{item.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ USE CASES ═══════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn>
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-4 text-center">Built for real hosts</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 text-center mb-14 tracking-tight" style={headingFont}>Sound like you?</h2>
          </FadeIn>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { icon: CalendarDays, who: 'The solo host', you: 'Managing 1-2 Airbnb units. Spreadsheets are getting messy, and $30/mo for software feels absurd for 2 properties.', fix: 'A proper booking calendar, expense tracker, and tax reports — one flat fee, done.' },
              { icon: Users, who: 'The co-hosting couple', you: 'You both need access, but your partner doesn\'t need to see the financials.', fix: 'Granular team permissions. Each person sees exactly what they need.' },
              { icon: BarChart3, who: 'The growing portfolio', you: 'Scaling from 2 to 5+ properties. You need real analytics but enterprise tools are overkill.', fix: 'Multi-property dashboards. Compare performance. Track everything per property.' },
              { icon: DollarSign, who: 'Tax season dreader', you: 'April hits and your receipts are scattered across bank statements, emails, and shoeboxes.', fix: 'Upload receipts as you go, flag deductibles, one-click CSV export for your accountant.' },
            ].map((c, i) => (
              <FadeIn key={c.who} delay={i * 80}>
                <div className="rounded-2xl bg-white ring-1 ring-stone-100 p-6 hover:shadow-lg hover:ring-stone-200 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                      <c.icon size={20} className="text-brand-600" />
                    </div>
                    <h3 className="font-bold text-stone-800 text-sm">{c.who}</h3>
                  </div>
                  <p className="text-sm text-stone-500 mb-3 leading-relaxed"><span className="font-medium text-stone-700">You:</span> {c.you}</p>
                  <p className="text-sm text-stone-500 leading-relaxed"><span className="font-medium text-brand-600">StayVue:</span> {c.fix}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PRICING ═══════════════════ */}
      <section id="pricing" className="bg-stone-900 py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-5xl mx-auto px-6">
          <FadeIn>
            <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-4 text-center">Simple, honest pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-3 tracking-tight" style={headingFont}>One price. Yours forever.</h2>
            <p className="text-stone-400 text-center mb-4">Try free for 3 days. Then pay once — never again.</p>
            <div className="flex justify-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 text-amber-300 text-sm font-medium ring-1 ring-amber-400/20">
                <Zap size={14} className="text-amber-400" /> Launch pricing — up to 28% off
              </div>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-3 gap-5 mb-10">
            {PRICING.map((p, i) => (
              <FadeIn key={p.name} delay={i * 80}>
                <div className={`rounded-2xl p-6 relative h-full flex flex-col ${
                  p.highlighted
                    ? 'bg-brand-500 text-white ring-2 ring-brand-400 shadow-2xl shadow-brand-500/30 sm:scale-[1.04]'
                    : 'bg-white/[0.06] text-white ring-1 ring-white/10 backdrop-blur-sm'
                }`}>
                  {p.badge && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[10px] font-bold px-3 py-1 rounded-full tracking-wide shadow-lg">{p.badge}</div>}
                  <p className={`text-sm font-medium mb-1 ${p.highlighted ? 'text-brand-100' : 'text-white/60'}`}>{p.name}</p>
                  <p className={`text-xs mb-1 ${p.highlighted ? 'text-brand-200' : 'text-white/40'}`}>{p.desc}</p>
                  <div className="flex items-baseline gap-2 mb-1 mt-2">
                    <span className={`text-lg line-through ${p.highlighted ? 'text-brand-300' : 'text-white/30'}`}>${p.price}</span>
                    <span className="text-4xl font-bold">${p.salePrice}</span>
                  </div>
                  <p className={`text-xs mb-1 ${p.highlighted ? 'text-brand-200' : 'text-white/40'}`}>one-time payment</p>
                  <p className={`text-[11px] mb-4 ${p.highlighted ? 'text-brand-200' : 'text-white/30'}`}>just {p.monthlyEquiv}/mo over a year</p>
                  {p.savings && <p className={`text-xs font-medium mb-3 px-2.5 py-1 rounded-lg inline-block w-fit ${p.highlighted ? 'bg-white/20 text-white' : 'bg-brand-400/20 text-brand-300'}`}>{p.savings}</p>}
                  <ul className="space-y-2 mb-6 flex-1">
                    {p.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check size={14} className={`shrink-0 mt-0.5 ${p.highlighted ? 'text-brand-200' : 'text-brand-400'}`} />
                        <span className={p.highlighted ? '' : 'text-white/80'}>{f}</span>
                      </li>
                    ))}
                    {p.notIncluded?.map(f => (
                      <li key={f} className={`flex items-start gap-2 text-sm ${p.highlighted ? 'text-brand-300/60' : 'text-white/25'}`}>
                        <X size={14} className="shrink-0 mt-0.5" /><span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={onGetStarted}
                    className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                      p.highlighted ? 'bg-white text-brand-600 hover:bg-brand-50 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20 ring-1 ring-white/20'
                    }`}>
                    Try Free — Then ${p.salePrice}
                  </button>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div className="flex flex-wrap items-center justify-center gap-6 py-6 border-t border-white/10">
              <span className="flex items-center gap-1.5 text-xs text-white/50"><Lock size={12} /> Secure via Stripe</span>
              <span className="flex items-center gap-1.5 text-xs text-white/50"><RefreshCw size={12} /> Free lifetime updates</span>
              <span className="flex items-center gap-1.5 text-xs text-white/50"><Shield size={12} /> No subscriptions</span>
              <span className="flex items-center gap-1.5 text-xs text-white/50"><Clock size={12} /> 3-day free trial</span>
            </div>
            <p className="text-center text-[10px] text-white/25 mt-4 max-w-2xl mx-auto">All prices are in USD. Each plan includes cloud storage for receipts, documents, and photos. Optional Cloud Backup & Sync available if you need extra storage beyond your plan. All purchases include free lifetime updates.</p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════ FAQ ═══════════════════ */}
      <section id="faq" className="py-20 sm:py-28 bg-surface-50">
        <div className="max-w-3xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-12 text-center tracking-tight" style={headingFont}>Questions? Answers.</h2>
          </FadeIn>
          <FAQ embedded />
        </div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 leading-tight" style={headingFont}>
              Stop paying rent on your own business tools.
            </h2>
            <p className="text-brand-100 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
              One app. One price. Every tool a host needs. Try it free for 3 days — if it's not for you, you've lost nothing.
            </p>
            <button onClick={onGetStarted}
              className="group bg-white text-brand-600 font-bold px-10 py-5 rounded-2xl hover:bg-brand-50 transition-all shadow-xl shadow-black/10 text-lg flex items-center gap-3 mx-auto active:scale-[0.98]">
              Start Your Free Trial
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-brand-200 text-xs mt-5">3-day free trial · Then from $49.99 one-time · No monthly fees ever</p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="border-t border-stone-100 py-8 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <StayVueLogo size={28} />
          </div>
          <div className="flex items-center gap-4">
            {onTerms && <button onClick={onTerms} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">Terms of Service</button>}
            <p className="text-xs text-stone-400">© {new Date().getFullYear()} StayVue Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
