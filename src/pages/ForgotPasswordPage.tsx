import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await resetPassword(email);
      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.error || 'Failed to send reset email. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-up">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 shadow-warm-xl card-lift">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-terracotta-500 to-terracotta-600 text-white mx-auto flex items-center justify-center shadow-warm">
            <Coffee className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-espresso-950">
            Reset Password
          </h2>
          <p className="text-xs text-coffee-600">
            Enter your account email and we'll send you instructions to reset your password
          </p>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-espresso-950 text-base">Check Your Inbox</h4>
              <p className="text-xs text-coffee-600">
                We've sent a password reset link to <strong className="text-espresso-900">{email}</strong>.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-espresso-900 hover:bg-espresso-800 text-white font-bold text-xs rounded-xl shadow-warm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-espresso-900">Registered Email Address</label>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs rounded-xl shadow-warm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                'Sending Link...'
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-cream-100 flex items-center justify-between text-xs text-coffee-600">
          <Link to="/login" className="font-semibold text-espresso-900 hover:text-terracotta-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
          <Link to="/signup" className="font-bold text-terracotta-600 hover:underline">
            Create Account
          </Link>
        </div>

        <div className="text-[11px] text-coffee-400 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          Secured with Supabase Authentication
        </div>
      </div>
    </div>
  );
};
