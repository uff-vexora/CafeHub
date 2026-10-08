import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Coffee, Mail, Lock, ArrowRight, Shield, AlertCircle, Sparkles, Star, ChefHat } from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';

const FLOATING_ITEMS = [
  { icon: '☕', label: 'Espresso', delay: '0s', x: '15%', y: '20%', size: 'text-2xl' },
  { icon: '🥐', label: 'Croissant', delay: '1.5s', x: '80%', y: '15%', size: 'text-3xl' },
  { icon: '🍰', label: 'Cake', delay: '3s', x: '10%', y: '70%', size: 'text-2xl' },
  { icon: '🫖', label: 'Tea', delay: '0.8s', x: '85%', y: '65%', size: 'text-2xl' },
  { icon: '🧁', label: 'Muffin', delay: '2.2s', x: '50%', y: '80%', size: 'text-xl' },
];

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, user, getRedirectPathForRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        if (redirectParam && redirectParam.startsWith('/')) {
          navigate(redirectParam, { replace: true });
        } else {
          navigate(getRedirectPathForRole(res.role || 'customer'), { replace: true });
        }
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demo: typeof DEMO_CREDENTIALS[0]) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* LEFT — Immersive Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-mesh-dark relative overflow-hidden flex-col justify-between p-12">
        {/* Floating decorative items */}
        {FLOATING_ITEMS.map((item) => (
          <div
            key={item.label}
            className="absolute select-none pointer-events-none animate-float"
            style={{ left: item.x, top: item.y, animationDelay: item.delay, animationDuration: `${4 + parseFloat(item.delay)}s` }}
          >
            <div className="glass-dark rounded-2xl p-3 shadow-glow-espresso">
              <span className={item.size}>{item.icon}</span>
            </div>
          </div>
        ))}

        {/* Ambient orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-terracotta-500/20 blur-3xl ambient-glow pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-caramel-400/15 blur-3xl ambient-glow pointer-events-none" style={{ animationDelay: '2s' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-terracotta-500 to-terracotta-700 flex items-center justify-center shadow-glow-terra animate-pulse-glow">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-serif font-bold text-white">CafeHub</span>
              <div className="text-[10px] text-cream-200/60 font-medium tracking-widest uppercase">Premium</div>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-terra text-terracotta-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            India's #1 Cafe Discovery Platform
          </div>
          <h1 className="text-5xl font-serif font-bold text-white leading-tight">
            Your perfect<br />
            <span className="text-gradient-cream">coffee moment</span><br />
            awaits.
          </h1>
          <p className="text-cream-200/70 text-sm leading-relaxed max-w-sm">
            Discover artisan cafes, reserve your favourite table, and order handcrafted coffee — all in one place.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { value: '500+', label: 'Curated Cafes' },
              { value: '50K+', label: 'Happy Diners' },
              { value: '4.9★', label: 'App Rating' },
            ].map((stat) => (
              <div key={stat.label} className="glass-dark rounded-2xl p-3 text-center">
                <div className="text-lg font-bold text-terracotta-400">{stat.value}</div>
                <div className="text-[10px] text-cream-200/60 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews teaser */}
        <div className="relative z-10 glass-dark rounded-2xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-terracotta-500 to-coffee-600 flex items-center justify-center shrink-0">
            <ChefHat className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-caramel-400 text-caramel-400 star-glow" />)}
            </div>
            <p className="text-xs text-cream-200/80 leading-relaxed">
              "CafeHub completely changed how I discover cafes. Found my new favourite spot in 2 minutes!"
            </p>
            <div className="text-[10px] text-cream-200/50 mt-1">— Priya S., Mumbai</div>
          </div>
        </div>
      </div>

      {/* RIGHT — Auth Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 hero-mesh">
        <div className="w-full max-w-md space-y-7 animate-fade-up">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-terracotta-500 to-terracotta-700 flex items-center justify-center">
              <Coffee className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-serif font-bold text-espresso-950">CafeHub</span>
          </div>

          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-3xl font-serif font-bold text-espresso-950">Welcome back</h2>
            <p className="text-sm text-coffee-500">
              {redirectParam ? (
                <span className="text-terracotta-600 font-semibold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Sign in to continue to {decodeURIComponent(redirectParam)}
                </span>
              ) : (
                'Sign in to your CafeHub account'
              )}
            </p>
          </div>

          {/* Quick Demo Buttons */}
          <div className="p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-warm">
            <div className="text-[10px] font-bold text-espresso-800 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-terracotta-500" />
              Quick Demo Access
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_CREDENTIALS.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleQuickFill(demo)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    email === demo.email
                      ? 'bg-espresso-900 text-white border-espresso-900 shadow-sm scale-[1.02]'
                      : 'bg-cream-50 hover:bg-cream-100 text-espresso-800 border-cream-200'
                  }`}
                >
                  {demo.role === 'customer' ? '👤 Customer' : demo.role === 'cafe_owner' ? '☕ Owner' : '🛡 Admin'}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-scale-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-espresso-900">Email Address</label>
              <div className="relative mt-1.5">
                <Mail className="w-4 h-4 text-coffee-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white border border-cream-200 focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-100 rounded-xl pl-10 pr-4 py-3 text-sm text-espresso-900 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-espresso-900">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-terracotta-600 hover:text-terracotta-700 font-semibold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <Lock className="w-4 h-4 text-coffee-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-cream-200 focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-100 rounded-xl pl-10 pr-4 py-3 text-sm text-espresso-900 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-terracotta-600 to-terracotta-700 hover:from-terracotta-700 hover:to-terracotta-800 text-white font-bold text-sm rounded-xl shadow-glow-terra flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing you in…
                </>
              ) : (
                <>
                  <span>Sign In to CafeHub</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center pt-1 border-t border-cream-200 space-y-2">
            <p className="text-xs text-coffee-600">
              New to CafeHub?{' '}
              <Link
                to={redirectParam ? `/signup?redirect=${encodeURIComponent(redirectParam)}` : '/signup'}
                className="font-bold text-terracotta-600 hover:text-terracotta-700 hover:underline"
              >
                Create a free account →
              </Link>
            </p>
            <div className="text-[11px] text-coffee-400 flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Protected by Supabase Row Level Security
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
