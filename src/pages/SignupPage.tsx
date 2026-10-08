import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Coffee, Mail, Lock, User, Phone, ArrowRight, Shield, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const PERKS: Record<UserRole, string[]> = {
  customer: [
    'Discover 500+ curated cafes',
    'Reserve tables in seconds',
    'Real-time order tracking',
    'Earn loyalty rewards',
  ],
  cafe_owner: [
    'List your cafe for free',
    'Manage orders & reservations',
    'Digital menu management',
    'Analytics & insights',
  ],
  admin: [
    'Platform oversight & compliance',
    'Merchant verification pipeline',
    'Financial audit & moderation',
    'System health monitoring',
  ],
};

export const SignupPage: React.FC = () => {
  const { signup, isAuthenticated, user, getRedirectPathForRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [role, setRole] = useState<UserRole>('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (redirectParam && redirectParam.startsWith('/')) {
        navigate(redirectParam, { replace: true });
      } else {
        navigate(getRedirectPathForRole(user.role), { replace: true });
      }
    }
  }, [isAuthenticated, user, redirectParam, navigate, getRedirectPathForRole]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await signup(fullName, email, password, role, phone);
      if (res.success) {
        if (redirectParam && redirectParam.startsWith('/')) {
          navigate(redirectParam, { replace: true });
        } else {
          navigate(getRedirectPathForRole(role), { replace: true });
        }
      } else {
        setError(res.error || 'Failed to complete registration.');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* LEFT — Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 hero-mesh overflow-y-auto">
        <div className="w-full max-w-md space-y-6 animate-fade-up">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-terracotta-500 to-terracotta-700 flex items-center justify-center">
              <Coffee className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-serif font-bold text-espresso-950">CafeHub</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-serif font-bold text-espresso-950">Create your account</h2>
            <p className="text-sm text-coffee-500">Join thousands of coffee lovers across India</p>
          </div>

          {/* Role selector */}
          <div>
            <label className="text-xs font-bold text-espresso-900">I'm joining as</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { value: 'customer' as UserRole, label: '👤 Customer / Diner', desc: 'Discover & order' },
                { value: 'cafe_owner' as UserRole, label: '☕ Cafe Owner', desc: 'List & manage' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setRole(opt.value); setError(''); }}
                  className={`py-3 px-3 rounded-xl text-xs font-bold border-2 transition-all text-left ${
                    role === opt.value
                      ? 'bg-espresso-900 text-white border-espresso-900 shadow-warm-md'
                      : 'bg-white text-espresso-800 border-cream-200 hover:border-cream-300'
                  }`}
                >
                  <div>{opt.label}</div>
                  <div className={`text-[10px] font-normal mt-0.5 ${role === opt.value ? 'text-cream-200' : 'text-coffee-400'}`}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-scale-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-3.5">
            {[
              { icon: User, label: 'Full Name', type: 'text', value: fullName, setter: setFullName, placeholder: 'Rohan Gupta', required: true },
              { icon: Mail, label: 'Email Address', type: 'email', value: email, setter: setEmail, placeholder: 'rohan@example.com', required: true },
              { icon: Phone, label: 'Phone Number', type: 'tel', value: phone, setter: setPhone, placeholder: '+91 98765 43210', required: false },
              { icon: Lock, label: 'Password', type: 'password', value: password, setter: setPassword, placeholder: 'At least 6 characters', required: true },
            ].map((field) => (
              <div key={field.label}>
                <label className="text-xs font-bold text-espresso-900">
                  {field.label}{!field.required && <span className="text-coffee-400 font-normal"> (Optional)</span>}
                </label>
                <div className="relative mt-1.5">
                  <field.icon className="w-4 h-4 text-coffee-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={field.type}
                    required={field.required}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    placeholder={field.placeholder}
                    minLength={field.label === 'Password' ? 6 : undefined}
                    className="w-full bg-white border border-cream-200 focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-100 rounded-xl pl-10 pr-4 py-3 text-sm text-espresso-900 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-terracotta-600 to-terracotta-700 hover:from-terracotta-700 hover:to-terracotta-800 text-white font-bold text-sm rounded-xl shadow-glow-terra flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account…
                </>
              ) : (
                <>
                  <span>Sign Up as {role === 'customer' ? 'Customer' : 'Cafe Owner'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-1 border-t border-cream-200 space-y-2">
            <p className="text-xs text-coffee-600">
              Already have an account?{' '}
              <Link
                to={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login'}
                className="font-bold text-terracotta-600 hover:text-terracotta-700 hover:underline"
              >
                Sign in →
              </Link>
            </p>
            <div className="text-[11px] text-coffee-400 flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Roles enforced via Row Level Security
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Perks Panel */}
      <div className="hidden lg:flex lg:w-5/12 hero-mesh-dark relative overflow-hidden flex-col justify-center p-12 gap-8">
        {/* Ambient orbs */}
        <div className="absolute top-1/3 right-1/3 w-72 h-72 rounded-full bg-terracotta-500/20 blur-3xl ambient-glow pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-56 h-56 rounded-full bg-caramel-400/15 blur-3xl ambient-glow pointer-events-none" style={{ animationDelay: '2.5s' }} />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-terra text-terracotta-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            {role === 'customer' ? 'For Coffee Lovers' : 'For Cafe Owners'}
          </div>
          <h3 className="text-3xl font-serif font-bold text-white leading-tight">
            {role === 'customer' ? 'Discover your perfect brew' : 'Grow your cafe business'}
          </h3>
          <p className="text-cream-200/60 text-sm leading-relaxed">
            {role === 'customer'
              ? 'Join thousands of coffee enthusiasts exploring artisan cafes across India.'
              : 'List your cafe and reach thousands of hungry coffee lovers in your city.'}
          </p>

          <div className="space-y-3 pt-2">
            {PERKS[role].map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-terracotta-500/20 border border-terracotta-400/30 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-terracotta-400" />
                </div>
                <span className="text-sm text-cream-200/80">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative z-10 glass-dark rounded-2xl p-4 border border-white/5">
          <div className="text-xs font-bold text-cream-100 mb-1">Free to join, forever</div>
          <p className="text-xs text-cream-200/60">
            No credit card required. Start discovering or listing your cafe in minutes.
          </p>
        </div>
      </div>
    </div>
  );
};
