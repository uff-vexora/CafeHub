import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Coffee,
  ShoppingBag,
  Calendar,
  Heart,
  Search,
  ArrowRight,
  Clock,
  MapPin,
  ChevronRight,
  Star,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Badge } from '../components/common/Badge';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { cafes, orders, reservations, favorites } = useData();
  const navigate = useNavigate();

  const activeOrders = orders.filter(
    (o) => o.status === 'order_placed' || o.status === 'confirmed' || o.status === 'preparing' || o.status === 'ready'
  );
  const upcomingReservations = reservations.filter((r) => r.status === 'confirmed');
  const favoriteCafes = cafes.filter((c) => favorites.includes(c.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Customer Welcome Hero */}
      <div className="bg-gradient-to-r from-espresso-950 via-espresso-900 to-coffee-900 text-white p-6 sm:p-8 rounded-4xl shadow-warm-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-100/10 backdrop-blur-md border border-cream-100/20 text-cream-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-terracotta-400" />
            <span>Customer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-cream-50">
            Welcome back, {user?.full_name.split(' ')[0] || 'Coffee Lover'}!
          </h1>
          <p className="text-xs sm:text-sm text-cream-200/80 max-w-xl">
            Explore curated specialty cafes, view your active orders, manage table bookings, and order handcrafted coffee.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <Link
            to="/cafes"
            className="py-3 px-5 bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-bold rounded-2xl shadow-warm transition-all flex items-center gap-2 active:scale-95"
          >
            <Search className="w-4 h-4" />
            <span>Discover Cafes</span>
          </Link>
          <Link
            to="/orders"
            className="py-3 px-5 bg-white/10 hover:bg-white/20 text-cream-100 border border-white/20 text-xs font-bold rounded-2xl backdrop-blur-md transition-all flex items-center gap-2 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Track Orders</span>
          </Link>
        </div>

        {/* Ambient background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-terracotta-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/orders"
          className="p-5 bg-white rounded-3xl border border-cream-200 shadow-warm hover:shadow-warm-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-coffee-600">Active Orders</span>
            <div className="w-9 h-9 rounded-2xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-serif font-bold text-espresso-950">
              {activeOrders.length}
            </span>
            <span className="text-[11px] text-coffee-500 ml-2">in progress</span>
          </div>
        </Link>

        <Link
          to="/reservations"
          className="p-5 bg-white rounded-3xl border border-cream-200 shadow-warm hover:shadow-warm-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-coffee-600">Bookings</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-serif font-bold text-espresso-950">
              {upcomingReservations.length}
            </span>
            <span className="text-[11px] text-coffee-500 ml-2">upcoming tables</span>
          </div>
        </Link>

        <Link
          to="/account?tab=favorites"
          className="p-5 bg-white rounded-3xl border border-cream-200 shadow-warm hover:shadow-warm-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-coffee-600">Saved Cafes</span>
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-serif font-bold text-espresso-950">
              {favoriteCafes.length}
            </span>
            <span className="text-[11px] text-coffee-500 ml-2">favorites</span>
          </div>
        </Link>

        <Link
          to="/account"
          className="p-5 bg-white rounded-3xl border border-cream-200 shadow-warm hover:shadow-warm-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-coffee-600">Profile & Settings</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-sm font-serif font-bold text-espresso-950 truncate block">
              {user?.email}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">Verified Diner</span>
          </div>
        </Link>
      </div>

      {/* Main Grid: Active Orders & Upcoming Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Orders */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-cream-200 shadow-warm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-terracotta-600" />
              <h3 className="font-serif font-bold text-lg text-espresso-950">Active Orders</h3>
            </div>
            <Link
              to="/orders"
              className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-cream-100 text-coffee-500 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <p className="text-xs text-coffee-600">You haven't placed any orders yet.</p>
              <Link
                to="/cafes"
                className="inline-block py-2 px-4 bg-espresso-900 text-white text-xs font-bold rounded-xl"
              >
                Browse Menus
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-espresso-900">
                        {order.order_number}
                      </span>
                      <Badge
                        variant={
                          order.status === 'completed'
                            ? 'success'
                            : order.status === 'preparing'
                            ? 'warning'
                            : 'primary'
                        }
                        size="sm"
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-coffee-600 truncate max-w-xs">{order.cafe_name}</p>
                    <p className="text-[11px] text-coffee-500">
                      {order.items.length} items • ₹{order.total_amount}
                    </p>
                  </div>

                  <Link
                    to="/orders"
                    className="py-2 px-3 text-xs font-bold text-terracotta-600 hover:bg-terracotta-50 rounded-xl transition-colors shrink-0"
                  >
                    View Status →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Reservations */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-cream-200 shadow-warm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              <h3 className="font-serif font-bold text-lg text-espresso-950">Upcoming Bookings</h3>
            </div>
            <Link
              to="/reservations"
              className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {reservations.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-cream-100 text-coffee-500 mx-auto flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-xs text-coffee-600">No active table reservations booked.</p>
              <Link
                to="/cafes"
                className="inline-block py-2 px-4 bg-espresso-900 text-white text-xs font-bold rounded-xl"
              >
                Reserve a Table
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.slice(0, 3).map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-espresso-900">{res.cafe_name}</span>
                      <Badge variant="primary" size="sm">
                        {res.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-coffee-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {res.reservation_date} at {res.reservation_time}
                      </span>
                      <span>•</span>
                      <span>{res.guest_count} Guests</span>
                    </div>
                  </div>

                  <Link
                    to="/reservations"
                    className="py-2 px-3 text-xs font-bold text-amber-700 hover:bg-amber-50 rounded-xl transition-colors shrink-0"
                  >
                    Manage →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Featured Cafes to Explore */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif font-bold text-espresso-950">Recommended Cafes</h3>
            <p className="text-xs text-coffee-600">Hand-selected specialty roasters and bakeries</p>
          </div>
          <Link
            to="/cafes"
            className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1"
          >
            <span>View All ({cafes.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cafes.slice(0, 3).map((cafe) => (
            <div
              key={cafe.id}
              className="bg-white rounded-3xl border border-cream-200 shadow-warm overflow-hidden group hover:shadow-warm-lg transition-all flex flex-col"
            >
              <div className="h-44 overflow-hidden relative">
                <img
                  src={cafe.cover_image}
                  alt={cafe.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-espresso-950 flex items-center gap-1 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{cafe.rating}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-espresso-950 text-base group-hover:text-terracotta-600 transition-colors">
                    {cafe.name}
                  </h4>
                  <p className="text-xs text-coffee-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-terracotta-600" />
                    <span>{cafe.city}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-cream-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-coffee-700">{cafe.price_range}</span>
                  <Link
                    to={`/cafes/${cafe.id}`}
                    className="py-1.5 px-3 bg-cream-100 hover:bg-espresso-900 hover:text-white rounded-xl text-xs font-bold text-espresso-900 transition-colors"
                  >
                    View Menu & Reserve
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
