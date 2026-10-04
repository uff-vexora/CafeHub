import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Coffee, Mail, Lock, User, Phone, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 shadow-warm-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-terracotta-500 to-terracotta-600 text-white mx-auto flex items-center justify-center shadow-warm">
            <Coffee className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-espresso-950">
            Create an Account
          </h2>
          <p className="text-xs text-coffee-600">
            Join CafeHub to explore specialty cafes, reserve tables & order online
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="text-xs font-bold text-espresso-900">I am joining as</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                  role === 'customer'
                    ? 'bg-espresso-900 text-white border-espresso-900 shadow-sm'
                    : 'bg-cream-50 text-espresso-800 border-cream-200 hover:bg-cream-100'
                }`}
              >
                Customer / Diner
              </button>
              <button
                type="button"
                onClick={() => setRole('cafe_owner')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                  role === 'cafe_owner'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-cream-50 text-espresso-800 border-cream-200 hover:bg-cream-100'
                }`}
              >
                Cafe Owner
              </button>
            </div>
            <p className="text-[10px] text-coffee-500 mt-1">
              {role === 'customer'
                ? 'Access personal bookings, order tracking & favorite cafes.'
                : 'List & manage your cafe menu, orders, tables & reviews.'}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-espresso-900">Full Name</label>
            <div className="relative mt-1.5">
              <User className="w-4 h-4 text-coffee-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rohan Gupta"
                className="w-full bg-cream-50 border border-cream-200 focus:border-terracotta-500 focus:bg-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-espresso-900 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-espresso-900">Email Address</label>
            <div className="relative mt-1.5">
              <Mail className="w-4 h-4 text-coffee-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan@example.com"
                className="w-full bg-cream-50 border border-cream-200 focus:border-terracotta-500 focus:bg-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-espresso-900 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-espresso-900">Phone Number (Optional)</label>
            <div className="relative mt-1.5">
              <Phone className="w-4 h-4 text-coffee-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-cream-50 border border-cream-200 focus:border-terracotta-500 focus:bg-white rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-espresso-900 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-espresso-900">Password</label>
            <div className="relative mt-1.5">
              <Lock className="w-4 h-4 text-coffee-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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
              'Creating Account...'
            ) : (
              <>
                <span>Sign Up as {role === 'customer' ? 'Customer' : 'Cafe Owner'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-cream-100 space-y-2">
          <p className="text-xs text-coffee-600">
            Already have an account?{' '}
            <Link
              to={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login'}
              className="font-bold text-terracotta-600 hover:underline"
            >
              Sign In here
            </Link>
          </p>
          <div className="text-[11px] text-coffee-400 flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Roles are cryptographically enforced via Row Level Security
          </div>
        </div>
      </div>
    </div>
  );
};
