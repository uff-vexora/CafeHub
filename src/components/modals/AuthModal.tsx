import React, { useState } from 'react';
import { Coffee, Lock, Mail, User, Phone, Shield } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Authentication failed. Please verify credentials.');
        }
      } else {
        const res = await signup(fullName, email, password, selectedRole, phone);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || 'Registration failed. Please try again.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (role: UserRole) => {
    const cred = DEMO_CREDENTIALS.find((d) => d.role === role);
    if (cred) {
      setEmail(cred.email);
      setPassword(cred.password);
      setError('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-terracotta-500 to-terracotta-600 text-white mx-auto flex items-center justify-center shadow-warm">
            <Coffee className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-espresso-950">
            {mode === 'login' ? 'Welcome Back to CafeHub' : 'Create your CafeHub Account'}
          </h3>
          <p className="text-xs text-coffee-600">
            {mode === 'login'
              ? 'Discover cafes, reserve tables & order gourmet menus'
              : 'Join thousands of cafe enthusiasts across India'}
          </p>
        </div>

        {/* Quick Demo Logins Bar */}
        <div className="p-3 bg-cream-100 rounded-2xl border border-cream-300">
          <div className="text-[11px] font-bold text-espresso-800 uppercase tracking-wider text-center mb-2">
            ⚡ Quick Demo Logins (Click to autofill)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('customer')}
              className={`py-1.5 px-2 rounded-xl text-xs font-semibold shadow-xs text-center transition-colors border ${
                email === 'aravind@example.com'
                  ? 'bg-espresso-900 text-white border-espresso-900'
                  : 'bg-white hover:bg-terracotta-50 text-espresso-900 border-cream-200'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('cafe_owner')}
              className={`py-1.5 px-2 rounded-xl text-xs font-semibold shadow-xs text-center transition-colors border ${
                email === 'owner@subkocoffee.com'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white hover:bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              Cafe Owner
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className={`py-1.5 px-2 rounded-xl text-xs font-semibold shadow-xs text-center transition-colors border ${
                email === 'admin@cafehub.in'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white hover:bg-purple-50 text-purple-900 border-purple-200'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="text-xs font-bold text-espresso-900">I am joining as</label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('customer')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedRole === 'customer'
                        ? 'bg-espresso-900 text-white border-espresso-900 shadow-sm'
                        : 'bg-cream-50 text-espresso-800 border-cream-200 hover:bg-cream-100'
                    }`}
                  >
                    Customer / Foodie
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('cafe_owner')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedRole === 'cafe_owner'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-cream-50 text-espresso-800 border-cream-200 hover:bg-cream-100'
                    }`}
                  >
                    Cafe Owner / Partner
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-espresso-900">Full Name</label>
                <div className="relative mt-1">
                  <User className="w-4 h-4 text-coffee-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Aravind Sharma"
                    className="w-full bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-espresso-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-espresso-900">Phone Number</label>
                <div className="relative mt-1">
                  <Phone className="w-4 h-4 text-coffee-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-espresso-900 outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-espresso-900">Email Address</label>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 text-coffee-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-espresso-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-espresso-900">Password</label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 text-coffee-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-espresso-900 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs rounded-xl shadow-warm transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading
              ? 'Please wait...'
              : mode === 'login'
              ? 'Sign In to CafeHub'
              : 'Create My Account'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center pt-2 border-t border-cream-100">
          <p className="text-xs text-coffee-600">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
              className="font-bold text-terracotta-600 hover:underline"
            >
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
};
