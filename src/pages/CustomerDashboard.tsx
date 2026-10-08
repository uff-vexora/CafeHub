import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Calendar,
  Heart,
  Search,
  ArrowRight,
  Clock,
  ChevronRight,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Coffee,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { CafeCard } from '../components/cards/CafeCard';
import {
  ScrollSpotlight,
  ParallaxLayer,
  MagneticButton,
  TiltCard,
  NumberTicker,
  Reveal,
  SectionOverlapBridge,
} from '../components/motion';

const TIME_OF_DAY = () => {
  const h = new Date().getHours();
  if (h < 12) return { greeting: 'Good morning', emoji: '☀️' };
  if (h < 17) return { greeting: 'Good afternoon', emoji: '☕' };
  return { greeting: 'Good evening', emoji: '🌙' };
};

const STATUS_COLORS: Record<string, string> = {
  order_placed: 'text-blue-600 bg-blue-50 border-blue-200',
  confirmed: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  preparing: 'text-amber-600 bg-amber-50 border-amber-200',
  ready: 'text-purple-600 bg-purple-50 border-purple-200',
  completed: 'text-coffee-600 bg-cream-50 border-cream-200',
  cancelled: 'text-rose-600 bg-rose-50 border-rose-200',
};

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { cafes, orders, reservations, favorites } = useData();
  const { greeting, emoji } = TIME_OF_DAY();

  const activeOrders = orders.filter(
    (o) => o.status === 'order_placed' || o.status === 'confirmed' || o.status === 'preparing' || o.status === 'ready'
  );
  const upcomingReservations = reservations.filter((r) => r.status === 'confirmed' || r.status === 'pending');
  const favoriteCafes = cafes.filter((c) => favorites.includes(c.id));
  const firstName = user?.full_name?.split(' ')[0] || 'Coffee Lover';

  const statCards = [
    {
      to: '/orders',
      label: 'Active Orders',
      value: activeOrders.length,
      sub: 'in progress',
      icon: ShoppingBag,
      iconBg: 'bg-terracotta-50',
      iconColor: 'text-terracotta-600',
      accent: 'hover:border-terracotta-200',
    },
    {
      to: '/reservations',
      label: 'Upcoming Bookings',
      value: upcomingReservations.length,
      sub: 'tables reserved',
      icon: Calendar,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      accent: 'hover:border-amber-200',
    },
    {
      to: '/account?tab=favorites',
      label: 'Saved Cafes',
      value: favoriteCafes.length,
      sub: 'in your list',
      icon: Heart,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-500',
      accent: 'hover:border-rose-200',
    },
    {
      to: '/orders',
      label: 'Total Orders',
      value: orders.length,
      sub: 'all time',
      icon: TrendingUp,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      accent: 'hover:border-emerald-200',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      {/* ── CINEMATIC HERO BANNER ───────────────────────────────────── */}
      <Reveal variant="scale-in" durationMs={700}>
        <ScrollSpotlight
          size={420}
          color="rgba(222, 100, 65, 0.16)"
          className="rounded-4xl hero-mesh-dark shadow-glow-espresso border border-white/10"
        >
          {/* Depth Parallax Ambient Background Elements */}
          <ParallaxLayer depth="background" className="absolute -top-10 -right-10 w-96 h-96 pointer-events-none">
            <div className="w-full h-full rounded-full bg-terracotta-500/20 blur-3xl ambient-glow" />
          </ParallaxLayer>

          <ParallaxLayer depth="background" className="absolute -bottom-10 left-1/4 w-80 h-80 pointer-events-none">
            <div className="w-full h-full rounded-full bg-caramel-400/15 blur-3xl ambient-glow" style={{ animationDelay: '2.5s' }} />
          </ParallaxLayer>

          <div className="stripe-pattern absolute inset-0 pointer-events-none opacity-40" />

          {/* Content Composition with Spatial Depth */}
          <div className="relative z-10 p-7 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-terra text-terracotta-300 text-xs font-bold border border-terracotta-500/30">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Customer Portal & Discovery
              </div>

              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white leading-[1.15] tracking-tight">
                {emoji} {greeting},<br />
                <span className="text-gradient-cream">{firstName}!</span>
              </h1>

              <p className="text-sm sm:text-base text-cream-200/75 leading-relaxed font-light">
                Discover artisan roasters, track your active barista brews, and reserve premium tables with seamless spatial ease.
              </p>
            </div>

            {/* Magnetic CTA Group */}
            <div className="flex flex-wrap items-center gap-3.5">
              <MagneticButton strength={6}>
                <Link
                  to="/cafes"
                  className="py-3.5 px-7 bg-gradient-to-r from-terracotta-600 to-terracotta-700 hover:from-terracotta-700 hover:to-terracotta-800 text-white text-sm font-bold rounded-2xl shadow-glow-terra transition-all flex items-center gap-2 active:scale-95 group"
                >
                  <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>Discover Cafes</span>
                </Link>
              </MagneticButton>

              <MagneticButton strength={4}>
                <Link
                  to="/orders"
                  className="py-3.5 px-6 glass-dark hover:bg-white/10 text-cream-100 text-sm font-bold rounded-2xl transition-all flex items-center gap-2 active:scale-95 border border-white/10"
                >
                  <ShoppingBag className="w-4 h-4 text-cream-200" />
                  <span>Track Orders</span>
                </Link>
              </MagneticButton>
            </div>
          </div>
        </ScrollSpotlight>
      </Reveal>

      {/* ── STAT CARDS (3D TILT + NUMBER TICKER + SPATIAL OVERLAP) ────────────────────── */}
      <SectionOverlapBridge overlapDistance={-28} zIndex={20}>
        <Reveal variant="fade-up" delayMs={100}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <TiltCard key={card.label} maxTiltDeg={3.5} className="h-full">
              <Link
                to={card.to}
                className={`p-5 h-full bg-white rounded-3xl border border-cream-200 shadow-warm card-lift hover:shadow-warm-lg ${card.accent} transition-all flex flex-col justify-between group`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-coffee-500">{card.label}</span>
                  <div className={`w-9 h-9 rounded-2xl ${card.iconBg} ${card.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <card.icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-espresso-950">
                    <NumberTicker value={card.value} durationMs={800 + i * 150} />
                  </span>
                  <span className="text-[11px] text-coffee-400 font-medium">{card.sub}</span>
                </div>
              </Link>
            </TiltCard>
          ))}
        </div>
      </Reveal>
      </SectionOverlapBridge>

      {/* ── MAIN GRID: Active Orders + Bookings ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Orders */}
        <Reveal variant="fade-up" delayMs={150}>
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-cream-200 shadow-warm space-y-5 h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center">
                  <ShoppingBag className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-espresso-950">Active Orders</h3>
              </div>
              <Link to="/orders" className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1 transition-colors">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-cream-100 text-coffee-400 mx-auto flex items-center justify-center">
                  <Coffee className="w-6 h-6" />
                </div>
                <p className="text-sm text-coffee-500">No orders yet — explore menus!</p>
                <Link to="/cafes" className="inline-block py-2 px-5 bg-espresso-900 text-white text-xs font-bold rounded-xl hover:bg-espresso-800 transition-colors">
                  Browse Cafes
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-cream-50 border border-cream-200 hover:border-cream-300 transition-all flex items-center justify-between gap-4 card-lift"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-espresso-900">{order.order_number}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status] || STATUS_COLORS.order_placed}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-espresso-800 truncate">{order.cafe_name}</p>
                      <p className="text-[11px] text-coffee-400">{order.items.length} items · ₹{order.total_amount}</p>
                    </div>
                    <Link to="/orders" className="shrink-0 text-xs font-bold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-0.5 transition-colors">
                      Track <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        {/* Upcoming Reservations */}
        <Reveal variant="fade-up" delayMs={200}>
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-cream-200 shadow-warm space-y-5 h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-espresso-950">Upcoming Bookings</h3>
              </div>
              <Link to="/reservations" className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1 transition-colors">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {reservations.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-cream-100 text-coffee-400 mx-auto flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <p className="text-sm text-coffee-500">No upcoming table reservations.</p>
                <Link to="/cafes" className="inline-block py-2 px-5 bg-espresso-900 text-white text-xs font-bold rounded-xl hover:bg-espresso-800 transition-colors">
                  Reserve a Table
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {reservations.slice(0, 3).map((res) => (
                  <div
                    key={res.id}
                    className="p-4 rounded-2xl bg-cream-50 border border-cream-200 hover:border-cream-300 transition-all flex items-center justify-between gap-4 card-lift"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-espresso-900 truncate">{res.cafe_name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          res.status === 'confirmed' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-amber-600 bg-amber-50 border-amber-200'
                        }`}>{res.status}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-coffee-500">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{res.reservation_date} at {res.reservation_time}</span>
                        <span>·</span>
                        <span>{res.guest_count} guests</span>
                      </div>
                    </div>
                    <Link to="/reservations" className="shrink-0 text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5 transition-colors">
                      Manage <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      </div>

      {/* ── FAVORITE CAFES ────────────────────────────────────────────── */}
      {favoriteCafes.length > 0 && (
        <Reveal variant="fade-up" delayMs={200}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-espresso-950 flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-rose-500 text-rose-500" /> Your Favourite Cafes
                </h3>
                <p className="text-xs text-coffee-500 mt-0.5">Cafes you've saved for later</p>
              </div>
              <Link to="/account?tab=favorites" className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1 transition-colors">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {favoriteCafes.slice(0, 3).map((cafe) => (
                <TiltCard key={cafe.id} maxTiltDeg={3}>
                  <CafeCard cafe={cafe} />
                </TiltCard>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* ── RECOMMENDED CAFES ─────────────────────────────────────────── */}
      <Reveal variant="fade-up" delayMs={250}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-serif font-bold text-espresso-950 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-terracotta-500" /> Recommended for You
              </h3>
              <p className="text-xs text-coffee-500 mt-0.5">Hand-selected specialty roasters & bakeries</p>
            </div>
            <Link to="/cafes" className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1 transition-colors">
              View All ({cafes.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cafes.slice(0, 3).map((cafe) => (
              <TiltCard key={cafe.id} maxTiltDeg={3}>
                <CafeCard cafe={cafe} />
              </TiltCard>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── QUICK ACTIONS CTA BANNER ───────────────────────────────────── */}
      <Reveal variant="scale-in" delayMs={200}>
        <ScrollSpotlight
          size={380}
          color="rgba(228, 169, 68, 0.15)"
          className="hero-mesh-dark rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-white/10 shadow-glow-espresso"
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-terracotta-400/15 blur-3xl ambient-glow pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1">
              <h4 className="text-lg font-serif font-bold text-white">Ready to explore?</h4>
              <p className="text-xs text-cream-200/70">Discover the best cafes in your city, filter by amenities, and book a table in seconds.</p>
            </div>
            <MagneticButton strength={5}>
              <Link
                to="/cafes"
                className="shrink-0 py-3 px-7 bg-gradient-to-r from-terracotta-600 to-terracotta-700 hover:from-terracotta-700 hover:to-terracotta-800 text-white text-sm font-bold rounded-2xl shadow-glow-terra transition-all flex items-center gap-2 active:scale-95 group"
              >
                <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>Discover All Cafes</span>
              </Link>
            </MagneticButton>
          </div>
        </ScrollSpotlight>
      </Reveal>

    </div>
  );
};
