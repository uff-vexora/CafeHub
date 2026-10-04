import React, { useState } from 'react';
import {
  Shield,
  Users,
  Store,
  ShoppingBag,
  Calendar,
  MessageSquare,
  BarChart3,
  CheckCircle,
  XCircle,
  Trash2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Search,
  Sliders,
  Check,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { SEED_PROFILES } from '../../data/seedData';
import { UserRole } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { cafes, orders, reservations, reviews, approveCafe, suspendCafe, deleteReview } = useData();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'metrics' | 'cafes' | 'users' | 'orders' | 'reviews'>('metrics');
  const [usersList, setUsersList] = useState(SEED_PROFILES);

  // Platform metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalCafesCount = cafes.length;
  const approvedCafesCount = cafes.filter((c) => c.is_approved).length;

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const navItems = [
    { key: 'metrics', label: 'Platform Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'cafes', label: `Cafes (${cafes.length})`, icon: <Store className="w-4 h-4" /> },
    { key: 'users', label: `Users (${usersList.length})`, icon: <Users className="w-4 h-4" /> },
    { key: 'orders', label: `All Orders (${orders.length})`, icon: <ShoppingBag className="w-4 h-4" /> },
    { key: 'reviews', label: `Moderate Reviews (${reviews.length})`, icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-espresso-950 to-espresso-900 text-white p-6 sm:p-8 rounded-4xl shadow-warm-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 bg-purple-900/60 px-2.5 py-0.5 rounded-full border border-purple-700/50">
              Super Admin Console
            </span>
            <span className="text-xs text-cream-300">Platform-Wide Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-cream-50 mt-1">
            CafeHub Administration
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" size="md">
            All Systems Operational
          </Badge>
        </div>
      </div>

      {/* Main Grid: Sidebar + Admin Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Admin Navigation */}
        <aside className="lg:col-span-1">
          <div className="bg-white p-3 rounded-3xl border border-cream-200 shadow-warm space-y-1 sticky top-28">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                  activeTab === item.key
                    ? 'bg-purple-900 text-white shadow-warm'
                    : 'text-espresso-800 hover:bg-cream-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Tab Content */}
        <main className="lg:col-span-3 space-y-6">
          {/* TAB 1: METRICS */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm space-y-1.5">
                  <span className="text-[11px] font-bold uppercase text-coffee-500">Gross GMV</span>
                  <div className="text-2xl font-serif font-bold text-espresso-950">
                    ₹{totalRevenue.toFixed(0)}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold">+24.5% this month</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm space-y-1.5">
                  <span className="text-[11px] font-bold uppercase text-coffee-500">Total Cafes</span>
                  <div className="text-2xl font-serif font-bold text-espresso-950">
                    {totalCafesCount}
                  </div>
                  <span className="text-[10px] text-coffee-400">{approvedCafesCount} active & approved</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm space-y-1.5">
                  <span className="text-[11px] font-bold uppercase text-coffee-500">Orders Processed</span>
                  <div className="text-2xl font-serif font-bold text-espresso-950">
                    {orders.length}
                  </div>
                  <span className="text-[10px] text-coffee-400">Dine-in, takeaway & delivery</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm space-y-1.5">
                  <span className="text-[11px] font-bold uppercase text-coffee-500">Table Bookings</span>
                  <div className="text-2xl font-serif font-bold text-espresso-950">
                    {reservations.length}
                  </div>
                  <span className="text-[10px] text-coffee-400">100% fulfilled without no-shows</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm space-y-1.5">
                  <span className="text-[11px] font-bold uppercase text-coffee-500">Verified Diners</span>
                  <div className="text-2xl font-serif font-bold text-espresso-950">
                    {usersList.length}
                  </div>
                  <span className="text-[10px] text-coffee-400">Active customer profiles</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm space-y-1.5">
                  <span className="text-[11px] font-bold uppercase text-coffee-500">Diner Reviews</span>
                  <div className="text-2xl font-serif font-bold text-espresso-950">
                    {reviews.length}
                  </div>
                  <span className="text-[10px] text-coffee-400">Average 4.7★ across network</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CAFES MANAGEMENT */}
          {activeTab === 'cafes' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
              <div>
                <h3 className="font-serif font-bold text-xl text-espresso-950">
                  Cafe Verification & Approval
                </h3>
                <p className="text-xs text-coffee-500 mt-0.5">
                  Approve newly submitted cafes, toggle featured status, or suspend policy violations.
                </p>
              </div>

              <div className="divide-y divide-cream-100">
                {cafes.map((cafe) => (
                  <div
                    key={cafe.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={cafe.cover_image}
                        alt={cafe.name}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-sm text-espresso-950">
                            {cafe.name}
                          </h4>
                          <Badge
                            variant={cafe.is_approved ? 'success' : 'warning'}
                            size="sm"
                          >
                            {cafe.is_approved ? 'Approved' : 'Pending Review'}
                          </Badge>
                          {cafe.is_featured && (
                            <Badge variant="primary" size="sm">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-coffee-600 mt-0.5">
                          {cafe.city} • Rating: {cafe.rating}★ ({cafe.review_count} reviews)
                        </p>
                        <p className="text-coffee-400 text-[11px] mt-0.5">{cafe.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {!cafe.is_approved ? (
                        <button
                          onClick={() => approveCafe(cafe.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => suspendCafe(cafe.id)}
                          className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: USERS & ROLES */}
          {activeTab === 'users' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
              <div>
                <h3 className="font-serif font-bold text-xl text-espresso-950">
                  User Roles & Permissions
                </h3>
                <p className="text-xs text-coffee-500 mt-0.5">
                  Change role permissions between Customer, Cafe Owner, and Admin.
                </p>
              </div>

              <div className="divide-y divide-cream-100">
                {usersList.map((u) => (
                  <div
                    key={u.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar_url}
                        alt={u.full_name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-cream-200"
                      />
                      <div>
                        <h4 className="font-bold text-espresso-950">{u.full_name}</h4>
                        <p className="text-coffee-500">{u.email}</p>
                      </div>
                    </div>

                    {/* Role changer dropdown */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-coffee-500 text-[11px] font-semibold">Role:</span>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="bg-cream-50 border border-cream-200 font-bold rounded-xl px-3 py-1.5 text-xs text-espresso-900 outline-none cursor-pointer"
                      >
                        <option value="customer">Customer</option>
                        <option value="cafe_owner">Cafe Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS OVERVIEW */}
          {activeTab === 'orders' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
              <div>
                <h3 className="font-serif font-bold text-xl text-espresso-950">
                  Platform Transactions Feed
                </h3>
                <p className="text-xs text-coffee-500 mt-0.5">
                  Audit trail of all customer orders across all partner cafes.
                </p>
              </div>

              <div className="divide-y divide-cream-100">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-espresso-950">#{o.order_number}</span>
                        <span className="text-coffee-600">• {o.cafe_name}</span>
                        <Badge variant="primary" size="sm">{o.status}</Badge>
                      </div>
                      <p className="text-coffee-500 text-[11px] mt-0.5">
                        Customer: {o.customer_name} • Paid via {o.payment_method}
                      </p>
                    </div>
                    <span className="font-bold text-base text-espresso-950">
                      ₹{o.total_amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: REVIEWS MODERATION */}
          {activeTab === 'reviews' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
              <div>
                <h3 className="font-serif font-bold text-xl text-espresso-950">
                  Review Moderation
                </h3>
                <p className="text-xs text-coffee-500 mt-0.5">
                  Maintain trust and safety. Remove spam or inappropriate reviews.
                </p>
              </div>

              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl border border-cream-200 bg-cream-50/50 flex items-start justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-espresso-950">{rev.user_name}</span>
                        <span className="text-amber-600 font-bold">★ {rev.rating}</span>
                      </div>
                      <p className="text-coffee-700 font-normal">"{rev.comment}"</p>
                    </div>

                    <button
                      onClick={() => deleteReview(rev.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors shrink-0"
                      title="Delete inappropriate review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
