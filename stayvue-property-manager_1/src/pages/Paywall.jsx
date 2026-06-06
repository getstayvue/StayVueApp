import { useState } from 'react';
import { Check, ArrowRight, Shield, Zap, Clock, Star, X } from 'lucide-react';
import StayVueLogo from '../components/StayVueLogo';
import { apiPost } from '../hooks/useApi';

const PLANS = [
  {
    name: 'Starter',
    price: 49.99,
    originalPrice: 69.99,
    desc: 'Everything a solo host needs',
    features: [
      '2 properties included',
      'Booking calendar + iCal sync',
      'Expense tracking + receipt uploads',
      'Guest CRM + email campaigns',
      'Dashboard analytics',
      'Tax Centre + CSV export',
      'Cleaning checklists',
      '1 GB cloud storage',
    ],
    highlighted: false,
  },
  {
    name: 'Professional',
    price: 74.99,
    originalPrice: 99.99,
    desc: 'Best value for growing hosts',
    badge: 'MOST POPULAR',
    features: [
      'Everything in Starter',
      '7 properties included',
      '3 team members included',
      '5 GB cloud storage',
      'Vendor management',
      'Priority support',
    ],
    savings: 'Save $78 vs buying add-ons',
    highlighted: true,
  },
  {
    name: 'Portfolio',
    price: 129.99,
    originalPrice: 179.99,
    desc: 'For hosts scaling up',
    features: [
      'Everything in Professional',
      '15 properties included',
      '10 team members included',
      '10 GB cloud storage',
      'Full data export & backup',
      'Early access to new features',
    ],
    savings: 'Save $198 vs buying add-ons',
    highlighted: false,
  },
];

export default function Paywall({ user, onActivated, onLogout }) {
  const [loading, setLoading] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handlePurchase(plan) {
    setLoading(plan.name);
    setError('');
    try {
      const result = await apiPost('/billing/activate-license', { plan_name: plan.name });
      if (result.success) {
        setSuccess(true);
        setTimeout(() => onActivated(), 1500);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(null);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <div className="text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
            <Check size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            You're all set!
          </h2>
          <p className="text-stone-500">Activating your account…</p>
        </div>
      </div>
    );
  }

  const trialEndDate = user.trial_ends_at ? new Date(user.trial_ends_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  }) : null;

  return (
    <div className="min-h-screen bg-surface-50 overflow-y-auto"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      
      {/* Header */}
      <div className="bg-white border-b border-stone-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <StayVueLogo size={36} />
          </div>
          <button onClick={onLogout} className="text-sm text-stone-400 hover:text-stone-600 transition-colors">
            Sign Out
          </button>
        </div>
      </div>

      {/* Trial expired banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Clock size={14} />
            Free Trial Ended
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Your 3-day free trial has ended
          </h1>
          <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto">
            {trialEndDate ? `Your trial expired on ${trialEndDate}. ` : ''}
            Choose a plan below to unlock StayVue and keep managing your properties.
          </p>
        </div>
      </div>

      {/* What you get back */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl ring-1 ring-stone-100 shadow-sm p-5 sm:p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-brand-500" />
            <h3 className="font-semibold text-stone-800 text-sm">Your data is safe — pick up right where you left off</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-stone-500">
            <div className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500 shrink-0" /> All bookings saved</div>
            <div className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500 shrink-0" /> Expenses & receipts</div>
            <div className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500 shrink-0" /> Guest CRM contacts</div>
            <div className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500 shrink-0" /> All property data</div>
          </div>
        </div>

        {/* Launch pricing callout */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 rounded-full px-4 py-1.5 text-xs font-semibold ring-1 ring-brand-100">
            <Zap size={12} /> One-time payment — no subscriptions, no recurring fees
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-5 mb-8">
          {PLANS.map(plan => (
            <div key={plan.name}
              className={`relative bg-white rounded-2xl ring-1 overflow-hidden transition-all ${
                plan.highlighted
                  ? 'ring-2 ring-brand-500 shadow-lg shadow-brand-500/10'
                  : 'ring-stone-200 hover:ring-stone-300 shadow-sm'
              }`}>
              {plan.badge && (
                <div className="bg-brand-500 text-white text-[10px] font-bold tracking-wider text-center py-1.5">
                  {plan.badge}
                </div>
              )}
              <div className="p-5 sm:p-6">
                <h3 className="font-bold text-stone-800 mb-1">{plan.name}</h3>
                <p className="text-xs text-stone-400 mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-extrabold text-stone-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    ${plan.price}
                  </span>
                  <span className="text-sm text-stone-400 line-through">${plan.originalPrice}</span>
                </div>
                <p className="text-[10px] text-stone-400 mb-5">One-time payment · Lifetime updates</p>

                {plan.savings && (
                  <div className="text-[11px] text-emerald-600 font-medium bg-emerald-50 rounded-lg px-3 py-1.5 mb-4 flex items-center gap-1">
                    <Star size={10} /> {plan.savings}
                  </div>
                )}

                <button
                  onClick={() => handlePurchase(plan)}
                  disabled={loading === plan.name}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    plan.highlighted
                      ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm shadow-brand-500/20'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  } ${loading === plan.name ? 'opacity-70 cursor-wait' : ''}`}>
                  {loading === plan.name ? (
                    <span className="animate-pulse">Processing…</span>
                  ) : (
                    <>Get {plan.name} <ArrowRight size={14} /></>
                  )}
                </button>

                <ul className="mt-5 space-y-2.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-stone-600">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-6 p-3 rounded-xl bg-red-50 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <p className="text-center text-[10px] text-stone-300 max-w-2xl mx-auto">
          All prices are in USD. All plans include free lifetime updates. No subscriptions, no hidden fees. In production, payments are processed securely via Stripe.
          *Optional Cloud Backup & Sync is available if you need storage beyond your plan's included amount.
        </p>

        <div className="text-center mt-8 pb-8">
          <p className="text-xs text-stone-400">
            Signed in as <span className="font-medium text-stone-600">{user.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
