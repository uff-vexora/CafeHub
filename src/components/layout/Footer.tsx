import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Heart, Mail, MapPin, Phone, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Footer: React.FC = () => {
  const { user, getRedirectPathForRole } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const homeLink = user ? getRedirectPathForRole(user.role) : '/login';

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-espresso-950 text-cream-200 pt-16 pb-24 lg:pb-12 border-t border-espresso-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Feature Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-espresso-850">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-espresso-900/60 border border-espresso-800">
            <div className="w-12 h-12 rounded-xl bg-terracotta-600/20 text-terracotta-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-cream-100">Curated Specialty Cafes</h4>
              <p className="text-xs text-coffee-300 mt-0.5">
                Handpicked coffee estates & artisan bakeries only
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-espresso-900/60 border border-espresso-800">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-cream-100">Zero Wait Reservations</h4>
              <p className="text-xs text-coffee-300 mt-0.5">
                Guaranteed table bookings with instant confirmations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-espresso-900/60 border border-espresso-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-cream-100">Verified Reviews & Orders</h4>
              <p className="text-xs text-coffee-300 mt-0.5">
                Authentic diner reviews and live order tracking
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12">
          {/* Col 1: Brand & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <Link to={homeLink} className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-terracotta-500 to-terracotta-600 flex items-center justify-center text-white shadow-warm">
                <Coffee className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-cream-100">
                Cafe<span className="text-terracotta-400">Hub</span>
              </span>
            </Link>
            <p className="text-xs text-coffee-300 leading-relaxed max-w-sm">
              CafeHub is India’s premier specialty cafe marketplace — bridging passionate coffee roasters, artisanal bakeries, and modern urban diners.
            </p>

            <div className="pt-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-cream-200 mb-2">
                Join the Coffee Club
              </h5>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email for cafe perks..."
                  required
                  className="bg-espresso-900 border border-espresso-800 focus:border-terracotta-500 rounded-xl px-3.5 py-2 text-xs text-cream-100 placeholder:text-coffee-400 flex-1 outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="bg-terracotta-600 hover:bg-terracotta-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-warm transition-all flex items-center gap-1 shrink-0"
                >
                  Join
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
              {subscribed && (
                <p className="text-xs text-emerald-400 mt-1.5 animate-in fade-in">
                  ☕ Welcome aboard! Check your inbox for exclusive cafe invites.
                </p>
              )}
            </div>
          </div>

          {/* Col 2: Discover */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-cream-200">
              Discover
            </h5>
            <ul className="space-y-2 text-xs text-coffee-300">
              <li>
                <Link to="/cafes" className="hover:text-cream-100 transition-colors">
                  All Cafes
                </Link>
              </li>
              <li>
                <Link to="/cafes?category=Work-friendly" className="hover:text-cream-100 transition-colors">
                  Work-friendly Cafes
                </Link>
              </li>
              <li>
                <Link to="/cafes?category=Date+night" className="hover:text-cream-100 transition-colors">
                  Date Night Spots
                </Link>
              </li>
              <li>
                <Link to="/cafes?category=Outdoor+seating" className="hover:text-cream-100 transition-colors">
                  Garden & Outdoor Cafes
                </Link>
              </li>
              <li>
                <Link to="/cafes?category=Bakery" className="hover:text-cream-100 transition-colors">
                  Artisan Bakeries
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Cities */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-cream-200">
              Top Cities
            </h5>
            <ul className="space-y-2 text-xs text-coffee-300">
              <li>
                <Link to="/cafes?city=Mumbai" className="hover:text-cream-100 transition-colors">
                  Mumbai (Bandra, Fort)
                </Link>
              </li>
              <li>
                <Link to="/cafes?city=Bengaluru" className="hover:text-cream-100 transition-colors">
                  Bengaluru (Koramangala, Indiranagar)
                </Link>
              </li>
              <li>
                <Link to="/cafes?city=New+Delhi" className="hover:text-cream-100 transition-colors">
                  New Delhi (Hauz Khas, CP)
                </Link>
              </li>
              <li>
                <Link to="/cafes?city=Pune" className="hover:text-cream-100 transition-colors">
                  Pune (Koregaon Park)
                </Link>
              </li>
              <li>
                <Link to="/cafes?city=Hyderabad" className="hover:text-cream-100 transition-colors">
                  Hyderabad (Jubilee Hills)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: For Cafe Owners & Admin */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-cream-200">
              For Partners
            </h5>
            <ul className="space-y-2 text-xs text-coffee-300">
              <li>
                <Link to="/owner" className="hover:text-cream-100 transition-colors text-amber-400 font-semibold flex items-center gap-1">
                  List Your Cafe
                </Link>
              </li>
              <li>
                <Link to="/owner" className="hover:text-cream-100 transition-colors">
                  Cafe Owner Portal
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-cream-100 transition-colors text-purple-300">
                  Platform Admin
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-cream-100 transition-colors">
                  Customer Account
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-cream-100 transition-colors">
                  Track Past Orders
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-espresso-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-coffee-400">
          <p>© {new Date().getFullYear()} CafeHub Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Crafted with freshly roasted Arabica & warmth</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
