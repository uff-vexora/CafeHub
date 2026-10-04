import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Coffee,
  LayoutDashboard,
  ShoppingBag,
  Calendar,
  UtensilsCrossed,
  Store,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Menu as MenuIcon,
  X,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Badge } from '../common/Badge';

export const OwnerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { cafes, orders, reservations, notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Find owner's cafe
  const myCafe = cafes.find((c) => c.owner_id === user?.id) || cafes[0];

  const cafeOrders = myCafe ? orders.filter((o) => o.cafe_id === myCafe.id) : [];
  const activeOrdersCount = cafeOrders.filter(
    (o) => o.status === 'order_placed' || o.status === 'confirmed' || o.status === 'preparing'
  ).length;

  const cafeReservations = myCafe ? reservations.filter((r) => r.cafe_id === myCafe.id) : [];
  const upcomingResCount = cafeReservations.filter((r) => r.status === 'confirmed').length;

  const unreadNotifs = notifications.filter((n) => !n.is_read);

  const navItems = [
    {
      to: '/owner',
      label: 'Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
      exact: true,
    },
    {
      to: '/owner/orders',
      label: 'Live Orders',
      icon: <ShoppingBag className="w-5 h-5" />,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
      badgeColor: 'bg-terracotta-600 text-white',
    },
    {
      to: '/owner/reservations',
      label: 'Table Bookings',
      icon: <Calendar className="w-5 h-5" />,
      badge: upcomingResCount > 0 ? upcomingResCount : undefined,
      badgeColor: 'bg-amber-600 text-white',
    },
    {
      to: '/owner/menu',
      label: 'Menu Management',
      icon: <UtensilsCrossed className="w-5 h-5" />,
    },
    {
      to: '/owner/profile',
      label: 'Cafe Profile',
      icon: <Store className="w-5 h-5" />,
    },
    {
      to: '/owner/reviews',
      label: 'Diner Reviews',
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      to: '/owner/analytics',
      label: 'Sales & Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      to: '/owner/settings',
      label: 'Store Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const isLinkActive = (to: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === to;
    }
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] text-[#1E140D]">
      {/* 1. Merchant Portal Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cream-300 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Left: Role Logo & Store Pill */}
            <div className="flex items-center gap-4 sm:gap-6">
              <Link to="/owner" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white shadow-warm group-hover:scale-105 transition-transform duration-200">
                  <Coffee className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-2xl font-bold tracking-tight text-espresso-950 leading-none">
                    Cafe<span className="text-amber-600">Hub</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700 mt-1">
                    Merchant Backoffice
                  </span>
                </div>
              </Link>

              {/* Store Identifier Badge */}
              {myCafe && (
                <div className="hidden md:flex items-center gap-2 py-1.5 px-3.5 bg-cream-100 rounded-full border border-cream-300">
                  <Store className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-bold text-espresso-900 truncate max-w-[200px]">
                    {myCafe.name}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" title="Accepting Orders" />
                </div>
              )}
            </div>

            {/* Right: Notification Bell & Owner User Profile */}
            <div className="flex items-center gap-3">
              {/* Store Status Pill */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Store Open</span>
              </div>

              {/* In-App Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2.5 text-coffee-700 hover:text-espresso-900 hover:bg-cream-100 rounded-full transition-colors"
                  aria-label="Merchant Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifs.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-amber-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotifs.length}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-warm-xl border border-cream-200 overflow-hidden z-50 animate-in fade-in duration-150">
                    <div className="p-4 border-b border-cream-200 bg-cream-50/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-espresso-950">Store Alerts</span>
                        {unreadNotifs.length > 0 && (
                          <Badge variant="warning" size="sm">
                            {unreadNotifs.length} New
                          </Badge>
                        )}
                      </div>
                      {unreadNotifs.length > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-xs text-amber-700 hover:text-amber-800 font-bold"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-cream-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-coffee-500">
                          No store notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markNotificationRead(n.id);
                              if (n.link) {
                                navigate(n.link);
                                setIsNotifOpen(false);
                              }
                            }}
                            className={`p-3.5 hover:bg-cream-50 transition-colors cursor-pointer flex gap-3 text-xs ${
                              !n.is_read ? 'bg-amber-50/40' : ''
                            }`}
                          >
                            <div className="flex-1">
                              <p className="font-bold text-espresso-900">{n.title}</p>
                              <p className="text-coffee-600 mt-0.5">{n.message}</p>
                            </div>
                            {!n.is_read && (
                              <div className="w-2 h-2 rounded-full bg-amber-600 shrink-0 self-center" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Merchant Profile Pill & Sign Out */}
              <div className="flex items-center gap-2 pl-2 border-l border-cream-300">
                <img
                  src={
                    user?.avatar_url ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={user?.full_name || 'Owner'}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-500/30"
                />
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-espresso-950 truncate max-w-[120px]">
                    {user?.full_name}
                  </span>
                  <span className="text-[10px] text-amber-700 font-semibold">Store Manager</span>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-1"
                  title="Sign Out of Merchant Console"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-espresso-900 hover:bg-cream-100 rounded-xl lg:hidden"
                aria-label="Toggle Merchant Navigation"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-cream-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200 shadow-warm-lg">
            <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-coffee-400">
              Merchant Navigation
            </div>
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-between ${
                    isLinkActive(item.to, item.exact)
                      ? 'bg-espresso-900 text-white shadow-sm'
                      : 'bg-cream-100 text-espresso-900 hover:bg-cream-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* 2. Main Portal Workspace: Left SaaS Sidebar + Main Outlet */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white p-3.5 rounded-3xl border border-cream-200 shadow-warm space-y-1.5 sticky top-28">
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-coffee-400">
                Merchant Controls
              </div>

              {navItems.map((item) => {
                const active = isLinkActive(item.to, item.exact);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-espresso-900 text-white shadow-warm'
                        : 'text-espresso-800 hover:bg-cream-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-amber-600 text-white'}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              <div className="pt-3 mt-3 border-t border-cream-100">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Right Main Content */}
          <main className="lg:col-span-3">
            <Outlet />
          </main>
        </div>
      </div>

      {/* 3. Mobile Bottom Navigation for Cafe Owner */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-cream-200 px-4 py-2 flex items-center justify-around shadow-warm-lg">
        <Link
          to="/owner"
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition-colors ${
            location.pathname === '/owner' ? 'text-amber-700' : 'text-coffee-600 hover:text-espresso-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Overview</span>
        </Link>

        <Link
          to="/owner/orders"
          className={`relative flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition-colors ${
            location.pathname.startsWith('/owner/orders') ? 'text-amber-700' : 'text-coffee-600 hover:text-espresso-900'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-terracotta-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {activeOrdersCount}
              </span>
            )}
          </div>
          <span>Orders</span>
        </Link>

        <Link
          to="/owner/reservations"
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition-colors ${
            location.pathname.startsWith('/owner/reservations') ? 'text-amber-700' : 'text-coffee-600 hover:text-espresso-900'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Bookings</span>
        </Link>

        <Link
          to="/owner/menu"
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition-colors ${
            location.pathname.startsWith('/owner/menu') ? 'text-amber-700' : 'text-coffee-600 hover:text-espresso-900'
          }`}
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span>Menu</span>
        </Link>

        <Link
          to="/owner/profile"
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition-colors ${
            location.pathname.startsWith('/owner/profile') ? 'text-amber-700' : 'text-coffee-600 hover:text-espresso-900'
          }`}
        >
          <Store className="w-5 h-5" />
          <span>My Cafe</span>
        </Link>
      </div>
    </div>
  );
};
