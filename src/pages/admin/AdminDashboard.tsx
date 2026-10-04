import React, { useState, useEffect } from 'react';
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
  Download,
  Filter,
  Eye,
  FileText,
  Settings,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { SEED_PROFILES } from '../../data/seedData';
import { UserRole } from '../../types';

interface AdminDashboardProps {
  defaultTab?: 'metrics' | 'cafes' | 'users' | 'orders' | 'reservations' | 'reviews' | 'reports' | 'settings';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ defaultTab = 'metrics' }) => {
  const { cafes, orders, reservations, reviews, approveCafe, suspendCafe, deleteReview } = useData();
  const { user, updateUserRoleAsAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'metrics' | 'cafes' | 'users' | 'orders' | 'reservations' | 'reviews' | 'reports' | 'settings'>(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Load profiles from storage or initial seed
  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem('cafehub_registered_users_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse registered users:', e);
      }
    }
    return SEED_PROFILES;
  });

  const [userRoleFeedback, setUserRoleFeedback] = useState<string | null>(null);

  // Filters for Reservations Audit
  const [resCafeFilter, setResCafeFilter] = useState<string>('all');
  const [resStatusFilter, setResStatusFilter] = useState<string>('all');
  const [resDateFilter, setResDateFilter] = useState<string>('');

  // Filters for Orders Audit
  const [orderCafeFilter, setOrderCafeFilter] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Platform metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalCafesCount = cafes.length;
  const approvedCafesCount = cafes.filter((c) => c.is_approved).length;
  const platformFee = totalRevenue * 0.10; // 10% platform take-rate

  // Role Change Handler with AuthContext persistence
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const result = await updateUserRoleAsAdmin(userId, newRole);
    if (result.success) {
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setUserRoleFeedback(`Successfully updated user permissions to ${newRole}`);
      setTimeout(() => setUserRoleFeedback(null), 3000);
    } else {
      setUserRoleFeedback(result.error || 'Failed to update user role');
      setTimeout(() => setUserRoleFeedback(null), 3000);
    }
  };

  // Filtered reservations
  const filteredReservations = reservations.filter((r) => {
    if (resCafeFilter !== 'all' && r.cafe_id !== resCafeFilter) return false;
    if (resStatusFilter !== 'all' && r.status !== resStatusFilter) return false;
    if (resDateFilter && r.reservation_date !== resDateFilter) return false;
    return true;
  });

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderCafeFilter !== 'all' && o.cafe_id !== orderCafeFilter) return false;
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
    return true;
  });

  // CSV Export utility
  const handleExportCSV = () => {
    const headers = 'Order Number,Cafe,Customer,Amount,Status,Date\n';
    const rows = orders
      .map(
        (o) =>
          `"${o.order_number}","${o.cafe_name}","${o.customer_name}","${o.total_amount}","${o.status}","${o.created_at}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cafehub_financial_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Role Feedback Toast */}
      {userRoleFeedback && (
        <div className="p-3.5 bg-purple-50 border border-purple-200 text-purple-900 text-xs rounded-2xl flex items-center gap-2 shadow-sm animate-in fade-in">
          <Check className="w-4 h-4 text-purple-700" />
          <span className="font-semibold">{userRoleFeedback}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: METRICS                                                 */}
      {/* ============================================================== */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm space-y-1.5">
              <span className="text-[11px] font-bold uppercase text-purple-700">Gross GMV</span>
              <div className="text-2xl font-serif font-bold text-espresso-950">
                ₹{totalRevenue.toFixed(0)}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">+24.5% platform growth</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm space-y-1.5">
              <span className="text-[11px] font-bold uppercase text-purple-700">Platform Revenue</span>
              <div className="text-2xl font-serif font-bold text-espresso-950">
                ₹{platformFee.toFixed(0)}
              </div>
              <span className="text-[10px] text-purple-600 font-semibold">10% commission rake</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm space-y-1.5">
              <span className="text-[11px] font-bold uppercase text-purple-700">Verified Cafes</span>
              <div className="text-2xl font-serif font-bold text-espresso-950">
                {totalCafesCount}
              </div>
              <span className="text-[10px] text-coffee-400">{approvedCafesCount} active & approved</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm space-y-1.5">
              <span className="text-[11px] font-bold uppercase text-purple-700">Table Bookings</span>
              <div className="text-2xl font-serif font-bold text-espresso-950">
                {reservations.length}
              </div>
              <span className="text-[10px] text-coffee-400">Total dining seatings</span>
            </div>
          </div>

          {/* Quick Approvals Snapshot */}
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-espresso-950">
                Partner Cafes Directory
              </h3>
              <button
                onClick={() => setActiveTab('cafes')}
                className="text-xs font-bold text-purple-700 hover:underline"
              >
                Manage All Cafes →
              </button>
            </div>

            <div className="divide-y divide-cream-100">
              {cafes.slice(0, 4).map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img src={c.cover_image} alt={c.name} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-espresso-950">{c.name}</h4>
                      <p className="text-coffee-500 text-[11px]">{c.city} • {c.rating}★</p>
                    </div>
                  </div>
                  <Badge variant={c.is_approved ? 'success' : 'warning'} size="sm">
                    {c.is_approved ? 'Approved' : 'Pending Review'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CAFES MANAGEMENT                                        */}
      {/* ============================================================== */}
      {activeTab === 'cafes' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
          <div className="pb-3 border-b border-cream-100">
            <h2 className="font-serif font-bold text-xl text-espresso-950">
              Cafe Directory & Approvals
            </h2>
            <p className="text-xs text-coffee-500 mt-0.5">
              Review submitted merchant applications, grant platform access, or suspend bad actors.
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
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-xs"
                    >
                      Approve Cafe
                    </button>
                  ) : (
                    <button
                      onClick={() => suspendCafe(cafe.id)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-xl transition-colors"
                    >
                      Suspend Access
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: USERS & ROLES                                           */}
      {/* ============================================================== */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
          <div className="pb-3 border-b border-cream-100">
            <h2 className="font-serif font-bold text-xl text-espresso-950">
              User Permissions & Access Control
            </h2>
            <p className="text-xs text-coffee-500 mt-0.5">
              Assign and modify role access across customer, cafe_owner, and admin tiers. All modifications persist to Supabase & localStorage.
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
                    src={
                      u.avatar_url ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                    }
                    alt={u.full_name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-cream-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-espresso-950">{u.full_name}</h4>
                      <Badge
                        variant={
                          u.role === 'admin'
                            ? 'primary'
                            : u.role === 'cafe_owner'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {u.role.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-coffee-500 mt-0.5">{u.email}</p>
                    <p className="text-coffee-400 text-[10px]">ID: {u.id}</p>
                  </div>
                </div>

                {/* Persistent Role Selector */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-coffee-500 text-xs font-semibold">Change Role:</span>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                    className="bg-cream-50 border border-cream-300 font-bold rounded-xl px-3 py-2 text-xs text-espresso-900 outline-none cursor-pointer hover:bg-cream-100 transition-colors"
                  >
                    <option value="customer">Customer</option>
                    <option value="cafe_owner">Cafe Owner</option>
                    <option value="admin">Platform Admin</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: ORDERS AUDIT                                            */}
      {/* ============================================================== */}
      {activeTab === 'orders' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-cream-100">
            <div>
              <h2 className="font-serif font-bold text-xl text-espresso-950">
                Platform Orders Audit Feed
              </h2>
              <p className="text-xs text-coffee-500 mt-0.5">
                Comprehensive ledger of all transactions, order statuses, and cafe billings.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={orderCafeFilter}
                onChange={(e) => setOrderCafeFilter(e.target.value)}
                className="bg-cream-50 border border-cream-200 font-bold text-xs rounded-xl px-3 py-1.5 outline-none"
              >
                <option value="all">All Cafes</option>
                {cafes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-cream-50 border border-cream-200 font-bold text-xs rounded-xl px-3 py-1.5 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="order_placed">Placed</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-cream-100">
            {filteredOrders.map((o) => (
              <div
                key={o.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-espresso-950">#{o.order_number}</span>
                    <span className="text-coffee-600 font-semibold">• {o.cafe_name}</span>
                    <Badge variant="primary" size="sm">
                      {o.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-coffee-500 text-[11px] mt-0.5">
                    Customer: <span className="font-semibold text-espresso-900">{o.customer_name}</span> ({o.customer_phone}) • Channel: {o.order_type} • Paid via {o.payment_method}
                  </p>
                  <p className="text-coffee-400 text-[10px] mt-0.5">
                    Items: {o.items.map((i) => `${i.quantity}x ${i.item_name}`).join(', ')}
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

      {/* ============================================================== */}
      {/* TAB 5: RESERVATIONS AUDIT                                      */}
      {/* ============================================================== */}
      {activeTab === 'reservations' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-cream-100">
            <div>
              <h2 className="font-serif font-bold text-xl text-espresso-950">
                Platform Table Bookings Audit
              </h2>
              <p className="text-xs text-coffee-500 mt-0.5">
                Audit dining room seatings, track no-shows, and filter across partner cafes.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={resCafeFilter}
                onChange={(e) => setResCafeFilter(e.target.value)}
                className="bg-cream-50 border border-cream-200 font-bold text-xs rounded-xl px-3 py-1.5 outline-none"
              >
                <option value="all">All Cafes</option>
                {cafes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={resStatusFilter}
                onChange={(e) => setResStatusFilter(e.target.value)}
                className="bg-cream-50 border border-cream-200 font-bold text-xs rounded-xl px-3 py-1.5 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>

              <input
                type="date"
                value={resDateFilter}
                onChange={(e) => setResDateFilter(e.target.value)}
                className="bg-cream-50 border border-cream-200 font-semibold text-xs rounded-xl px-3 py-1.5 outline-none"
              />
            </div>
          </div>

          {filteredReservations.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Calendar className="w-10 h-10 text-cream-400 mx-auto" />
              <p className="text-sm font-semibold text-espresso-900">No reservations match the specified filters.</p>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {filteredReservations.map((res) => {
                const cafe = cafes.find((c) => c.id === res.cafe_id);
                return (
                  <div
                    key={res.id}
                    className="p-4 rounded-2xl border border-cream-200 bg-cream-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-espresso-950">
                          {res.reservation_code}
                        </span>
                        <span className="text-coffee-600 font-bold">• {cafe?.name || 'Cafe'}</span>
                        <Badge
                          variant={
                            res.status === 'confirmed'
                              ? 'success'
                              : res.status === 'completed'
                              ? 'primary'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {res.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-coffee-600 mt-1">
                        Guest: <span className="font-bold text-espresso-950">{res.guest_name}</span> ({res.guest_phone})
                      </p>
                      <p className="text-coffee-500 text-[11px] mt-0.5">
                        📅 Date: {res.reservation_date} • 🕒 Time: {res.reservation_time} • 👥 {res.guest_count} Guests
                      </p>
                      {res.special_requests && (
                        <p className="text-coffee-400 italic text-[11px] mt-0.5">
                          Note: "{res.special_requests}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: REVIEW MODERATION                                       */}
      {/* ============================================================== */}
      {activeTab === 'reviews' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
          <div className="pb-3 border-b border-cream-100">
            <h2 className="font-serif font-bold text-xl text-espresso-950">
              Community Review Moderation
            </h2>
            <p className="text-xs text-coffee-500 mt-0.5">
              Enforce community safety. Remove malicious, defamatory, or fraudulent reviews across any cafe.
            </p>
          </div>

          <div className="space-y-3">
            {reviews.map((rev) => {
              const cafe = cafes.find((c) => c.id === rev.cafe_id);
              return (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl border border-cream-200 bg-cream-50/50 flex items-start justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-espresso-950">{rev.user_name}</span>
                      <span className="text-coffee-500">• on {cafe?.name}</span>
                      <span className="text-amber-600 font-bold">★ {rev.rating}</span>
                    </div>
                    <p className="text-coffee-700 font-normal">"{rev.comment}"</p>
                    {rev.owner_response && (
                      <p className="text-coffee-500 italic text-[11px]">
                        Cafe Reply: "{rev.owner_response}"
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => deleteReview(rev.id)}
                    className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors shrink-0"
                    title="Remove from platform"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: FINANCIAL REPORTS & EXPORT                              */}
      {/* ============================================================== */}
      {activeTab === 'reports' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-cream-100">
            <div>
              <h2 className="font-serif font-bold text-xl text-espresso-950">
                Financial Reports & Statements
              </h2>
              <p className="text-xs text-coffee-500 mt-0.5">
                Download consolidated transaction logs, tax audits, and merchant payout statements.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-warm flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Ledger</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-purple-50 rounded-2xl border border-purple-200 space-y-1">
              <span className="text-[11px] font-bold uppercase text-purple-700">Gross Processed Volume</span>
              <div className="text-2xl font-serif font-bold text-purple-950">₹{totalRevenue.toFixed(2)}</div>
              <p className="text-[10px] text-purple-600">Total customer spend across all cafes</p>
            </div>

            <div className="p-5 bg-cream-50 rounded-2xl border border-cream-200 space-y-1">
              <span className="text-[11px] font-bold uppercase text-coffee-500">Platform Take-Rate (10%)</span>
              <div className="text-2xl font-serif font-bold text-espresso-950">₹{platformFee.toFixed(2)}</div>
              <p className="text-[10px] text-coffee-400">Retained software & payment facilitation revenue</p>
            </div>

            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-[11px] font-bold uppercase text-emerald-700">Net Merchant Payouts</span>
              <div className="text-2xl font-serif font-bold text-emerald-950">
                ₹{(totalRevenue - platformFee).toFixed(2)}
              </div>
              <p className="text-[10px] text-emerald-600">Disbursed to verified cafe bank accounts</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 8: SYSTEM SETTINGS                                          */}
      {/* ============================================================== */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
          <div className="pb-3 border-b border-cream-100">
            <h2 className="font-serif font-bold text-xl text-espresso-950">
              Platform Governance & Global Config
            </h2>
            <p className="text-xs text-coffee-500 mt-0.5">
              Control platform commission rates, security policies, and maintenance mode.
            </p>
          </div>

          <div className="space-y-4 max-w-xl text-xs">
            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-espresso-900">Platform Commission Rate</p>
                <p className="text-coffee-500 text-[11px]">Percentage deducted from every completed cafe order.</p>
              </div>
              <span className="font-mono font-bold text-base text-purple-900">10.0%</span>
            </div>

            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-espresso-900">New Merchant Verification Policy</p>
                <p className="text-coffee-500 text-[11px]">Require admin review before newly added cafes appear in search.</p>
              </div>
              <Badge variant="success" size="sm">Strict Manual Audit</Badge>
            </div>

            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-espresso-900">Supabase RLS & Role Isolation</p>
                <p className="text-coffee-500 text-[11px]">Strict database policies enforced for customer and owner isolation.</p>
              </div>
              <Badge variant="primary" size="sm">Enforced Active</Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
