import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  User,
  ShoppingBag,
  Calendar,
  Heart,
  MessageSquare,
  Settings,
  Check,
  Star,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CafeCard } from '../components/cards/CafeCard';
import { Badge } from '../components/common/Badge';

export const AccountPage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { cafes, orders, reservations, reviews, favorites } = useData();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = (searchParams.get('tab') as any) || 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'reservations' | 'favorites' | 'reviews' | 'settings'>(tabParam);

  // Profile Edit State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const favoriteCafes = cafes.filter((c) => favorites.includes(c.id));
  const userReviews = reviews.filter((r) => r.user_name === user?.full_name || r.user_id === user?.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: fullName,
      phone,
      avatar_url: avatarUrl,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const navItems = [
    { key: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
    { key: 'orders', label: `Orders (${orders.length})`, icon: <ShoppingBag className="w-4 h-4" /> },
    { key: 'reservations', label: `Reservations (${reservations.length})`, icon: <Calendar className="w-4 h-4" /> },
    { key: 'favorites', label: `Favorites (${favoriteCafes.length})`, icon: <Heart className="w-4 h-4" /> },
    { key: 'reviews', label: `My Reviews (${userReviews.length})`, icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-up">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-4xl border border-cream-200 shadow-warm flex flex-col sm:flex-row sm:items-center justify-between gap-6 card-lift">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={
                user?.avatar_url ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
              }
              alt={user?.full_name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover ring-4 ring-cream-100 shadow-warm"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-espresso-950">
                {user?.full_name}
              </h1>
              <Badge
                variant={user?.role === 'admin' ? 'danger' : user?.role === 'cafe_owner' ? 'warning' : 'primary'}
                size="sm"
              >
                {user?.role.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-coffee-600 mt-0.5">{user?.email}</p>
            {user?.phone && <p className="text-xs text-coffee-500 mt-0.5">{user.phone}</p>}
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Grid: Sidebar Tabs + Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Nav */}
        <div className="lg:col-span-1">
          <div className="bg-white p-3 rounded-3xl border border-cream-200 shadow-warm space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key as any);
                  setSearchParams({ tab: item.key });
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                  activeTab === item.key
                    ? 'bg-espresso-900 text-white shadow-warm'
                    : 'text-espresso-800 hover:bg-cream-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tab: Profile */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
              <h3 className="font-serif font-bold text-xl text-espresso-950 pb-2 border-b border-cream-100">
                Edit Personal Information
              </h3>

              {savedSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs font-bold text-espresso-900">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full mt-1.5 bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl px-3.5 py-2.5 text-xs text-espresso-900 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-espresso-900">Email Address (Read-only)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full mt-1.5 bg-cream-100 border border-cream-200 rounded-xl px-3.5 py-2.5 text-xs text-coffee-500 outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-espresso-900">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full mt-1.5 bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl px-3.5 py-2.5 text-xs text-espresso-900 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-espresso-900">Avatar Image URL</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full mt-1.5 bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl px-3.5 py-2.5 text-xs text-espresso-900 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs rounded-xl shadow-warm transition-all active:scale-95"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* Tab: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-xl text-espresso-950">Your Past Orders</h3>
                <Link to="/orders" className="text-xs font-bold text-terracotta-600 hover:underline">
                  Full Order Tracker
                </Link>
              </div>

              <div className="space-y-3">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold">#{o.order_number}</span>
                        <Badge variant="primary" size="sm">{o.status}</Badge>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-espresso-950 mt-1">{o.cafe_name}</h4>
                      <p className="text-xs text-coffee-500 mt-0.5">{o.items.length} items • ₹{o.total_amount.toFixed(2)}</p>
                    </div>
                    <Link
                      to="/orders"
                      className="px-4 py-2 bg-cream-100 hover:bg-espresso-900 hover:text-white rounded-xl text-xs font-bold transition-all text-espresso-900"
                    >
                      Track Order
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Reservations */}
          {activeTab === 'reservations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-xl text-espresso-950">Your Table Reservations</h3>
                <Link to="/reservations" className="text-xs font-bold text-terracotta-600 hover:underline">
                  Book Table
                </Link>
              </div>

              <div className="space-y-3">
                {reservations.map((res) => (
                  <div
                    key={res.id}
                    className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="success" size="sm">{res.status}</Badge>
                        <span className="font-mono text-xs font-bold">{res.reservation_code}</span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-espresso-950 mt-1">{res.cafe_name}</h4>
                      <p className="text-xs text-coffee-500 mt-0.5">
                        {res.reservation_date} at {res.reservation_time} • {res.guest_count} Guests
                      </p>
                    </div>
                    <Link
                      to="/reservations"
                      className="px-4 py-2 bg-cream-100 hover:bg-espresso-900 hover:text-white rounded-xl text-xs font-bold transition-all text-espresso-900"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Favorites */}
          {activeTab === 'favorites' && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-xl text-espresso-950">Saved Favorite Cafes</h3>
              {favoriteCafes.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-cream-200 text-center text-xs text-coffee-600">
                  You haven't saved any cafes yet. Click the heart icon on any cafe card to save it.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {favoriteCafes.map((cafe) => (
                    <CafeCard key={cafe.id} cafe={cafe} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-xl text-espresso-950">Your Posted Reviews</h3>
              {userReviews.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-cream-200 text-center text-xs text-coffee-600">
                  You haven't posted any reviews yet. Visit a cafe and share your tasting experience!
                </div>
              ) : (
                <div className="space-y-3">
                  {userReviews.map((r) => (
                    <div
                      key={r.id}
                      className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-xs font-bold text-amber-800">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{r.rating} / 5</span>
                        </div>
                        <span className="text-[11px] text-coffee-400">
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-coffee-700 leading-relaxed font-normal">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Settings */}
          {activeTab === 'settings' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
              <h3 className="font-serif font-bold text-xl text-espresso-950 pb-2 border-b border-cream-100">
                Account & Notification Preferences
              </h3>

              <div className="space-y-4 text-xs text-espresso-900">
                <label className="flex items-center justify-between p-3 bg-cream-50 rounded-2xl border border-cream-200 cursor-pointer">
                  <div>
                    <span className="font-bold">Order Status Notifications</span>
                    <p className="text-coffee-500 text-[11px] mt-0.5">Receive real-time alerts when barista prepares your order</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-terracotta-600 rounded" />
                </label>

                <label className="flex items-center justify-between p-3 bg-cream-50 rounded-2xl border border-cream-200 cursor-pointer">
                  <div>
                    <span className="font-bold">Table Reservation Reminders</span>
                    <p className="text-coffee-500 text-[11px] mt-0.5">Get SMS & push reminders 1 hour before booking</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-terracotta-600 rounded" />
                </label>

                <label className="flex items-center justify-between p-3 bg-cream-50 rounded-2xl border border-cream-200 cursor-pointer">
                  <div>
                    <span className="font-bold">Weekly Curated Specialty Drops</span>
                    <p className="text-coffee-500 text-[11px] mt-0.5">Get early invites to new single estate coffee batches</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-terracotta-600 rounded" />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
