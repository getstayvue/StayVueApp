import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import StayVueLogo from '../components/StayVueLogo';
import { authPost } from '../hooks/useApi';

export default function AuthPage({ onAuth, onBack, onTerms }) {
  const [mode, setMode] = useState('login'); // login | signup
  const [form, setForm] = useState({ email: '', password: '', name: '', marketing_optin: false });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let result;
      if (mode === 'signup') {
        result = await authPost('/signup', {
          email: form.email,
          password: form.password,
          name: form.name,
          marketing_optin: form.marketing_optin ? 1 : 0,
        });
      } else {
        result = await authPost('/login', { email: form.email, password: form.password });
      }
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('auth_user', JSON.stringify(result.user));
      onAuth(result.user, result.token);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setError('');
    // Use Google Identity Services popup
    if (!window.google?.accounts?.id) {
      setError('Google Sign-In is not configured yet. Set VITE_GOOGLE_CLIENT_ID in your environment to enable it.');
      return;
    }
    // This is handled by the GSI callback set up in index.html
    window.google.accounts.id.prompt();
  }

  // Expose Google callback globally
  if (typeof window !== 'undefined') {
    window.__handleGoogleAuth = async (response) => {
      try {
        // Decode JWT to get user info
        const payload = JSON.parse(atob(response.credential.split('.')[1]));
        const result = await authPost('/google', {
          email: payload.email,
          name: payload.name,
          google_id: payload.sub,
          avatar_url: payload.picture,
          marketing_optin: form.marketing_optin ? 1 : 0,
        });
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('auth_user', JSON.stringify(result.user));
        onAuth(result.user, result.token);
      } catch (err) {
        setError(err.message);
      }
    };
  }

  const googleClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to landing page */}
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 mb-6 mx-auto transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to StayVue.com
          </button>
        )}
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <StayVueLogo variant="mark" size={64} />
          </div>
          <StayVueLogo variant="wordmark" size={36} style={{ display: 'inline-block' }} />
          <p className="text-sm text-stone-400 mt-3">Start your 3-day free trial — no credit card required</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 ring-1 ring-stone-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-stone-100">
            <button onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${mode === 'login' ? 'text-brand-600 border-b-2 border-brand-500' : 'text-stone-400 hover:text-stone-600'}`}>
              Sign In
            </button>
            <button onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${mode === 'signup' ? 'text-brand-600 border-b-2 border-brand-500' : 'text-stone-400 hover:text-stone-600'}`}>
              Create Account
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Google Sign-In */}
            {googleClientId ? (
              <div>
                <div id="google-signin-btn" className="flex justify-center" />
                <button onClick={handleGoogle}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl ring-1 ring-stone-200 hover:bg-stone-50 transition-colors text-sm font-medium text-stone-700">
                  <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </button>
              </div>
            ) : (
              <button onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl ring-1 ring-stone-200 hover:bg-stone-50 transition-colors text-sm font-medium text-stone-700">
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="text-xs text-stone-400">or</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input className="input-field w-full pl-10" placeholder="Jane Smith" value={form.name}
                      onChange={e => set('name', e.target.value)} required />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-stone-500 mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input type="email" className="input-field w-full pl-10" placeholder="you@example.com" value={form.email}
                    onChange={e => set('email', e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-500 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input type={showPass ? 'text' : 'password'} className="input-field w-full pl-10 pr-10"
                    placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
                    value={form.password} onChange={e => set('password', e.target.value)} required minLength={mode === 'signup' ? 8 : 1} />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Marketing opt-in (signup only) */}
              {mode === 'signup' && (
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    form.marketing_optin ? 'bg-brand-500 text-white' : 'ring-1 ring-stone-300 group-hover:ring-brand-400'
                  }`} onClick={() => set('marketing_optin', !form.marketing_optin)}>
                    {form.marketing_optin && <Check size={13} />}
                  </div>
                  <span className="text-xs text-stone-500 leading-relaxed">
                    I'd like to receive product updates, tips, and occasional offers. You can unsubscribe anytime.
                  </span>
                </label>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm">
                {loading ? (
                  <span className="animate-pulse">Please wait…</span>
                ) : (
                  <>{mode === 'signup' ? 'Start Free Trial' : 'Sign In'} <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            {mode === 'signup' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
                  <Check size={12} className="shrink-0" />
                  <span>3-day free trial — full access to all features, no payment needed</span>
                </div>
                <p className="text-[11px] text-stone-400 text-center leading-relaxed">
                  By creating an account, you agree to our{' '}
                  {onTerms ? <button onClick={onTerms} className="text-brand-600 hover:underline">Terms of Service</button> : <span>Terms of Service</span>}
                  {' '}and Privacy Policy.
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          © {new Date().getFullYear()} StayVue Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
}
