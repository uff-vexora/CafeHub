import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Coffee, Mail, Lock, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, user, getRedirectPathForRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect to intended target or allowed dashboard
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
          // Note: State might take a tick, but login returns server-verified role
          const target = redirectParam || '/dashboard';
          navigate(target, { replace: true });
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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 shadow-warm-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-terracotta-500 to-terracotta-600 text-white mx-auto flex items-center justify-center shadow-warm">
            <Coffee className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-espresso-950">
            Sign in to CafeHub
          </h2>
          <p className="text-xs text-coffee-600">
            {redirectParam ? (
              <span className="text-terracotta-600 font-semibold flex items-center justify-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Authentication required to access {redirectParam}
              </span>
            ) : (
              'Enter your credentials to access your account and dashboard'
            )}
          </p>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="p-3.5 bg-cream-100 rounded-2xl border border-cream-300 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-espresso-800 uppercase tracking-wider">
            <span>⚡ Quick Demo Credentials</span>
            <span className="text-coffee-500 font-normal">Click to fill</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_CREDENTIALS.map((demo) => (
              <button
                key={demo.role}
                type="button"
                onClick={() => handleQuickFill(demo)}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  email === demo.email
                    ? 'bg-espresso-900 text-white border-espresso-900 shadow-sm'
                    : 'bg-white hover:bg-cream-50 text-espresso-800 border-cream-200 shadow-xs'
                }`}
              >
                {demo.role === 'customer'
                  ? 'Customer'
                  : demo.role === 'cafe_owner'
                  ? 'Cafe Owner'
                  : 'Admin'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-espresso-900">Email Address</label>
            <div className="relative mt-1.5">
              <Mail className="w-4 h-4 text-coffee-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-cream-50 border border-cream-200 focus:border-terracotta-500 focus:bg-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-espresso-900 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-espresso-900">Password</label>
              <span className="text-[11px] text-coffee-500">Demo: password123</span>
            </div>
            <div className="relative mt-1.5">
              <Lock className="w-4 h-4 text-coffee-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-cream-50 border border-cream-200 focus:border-terracotta-500 focus:bg-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-espresso-900 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs rounded-xl shadow-warm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              'Verifying Session...'
            ) : (
              <>
                <span>Sign In Securely</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center pt-2 border-t border-cream-100 space-y-2">
          <p className="text-xs text-coffee-600">
            Don't have an account?{' '}
            <Link
              to={redirectParam ? `/signup?redirect=${encodeURIComponent(redirectParam)}` : '/signup'}
              className="font-bold text-terracotta-600 hover:underline"
            >
              Sign Up here
            </Link>
          </p>
          <div className="text-[11px] text-coffee-400 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Protected by Supabase Row Level Security (RLS)
          </div>
        </div>
      </div>
    </div>
  );
};
