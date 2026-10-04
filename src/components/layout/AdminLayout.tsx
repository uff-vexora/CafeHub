import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Coffee,
  Shield,
  LayoutDashboard,
  Store,
  Users,
  ShoppingBag,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Bell,
  Menu as MenuIcon,
  X,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Badge } from '../common/Badge';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { cafes, orders, reservations, reviews, notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const pendingCafesCount = cafes.filter((c) => !c.is_approved).length;
  const unreadNotifs = notifications.filter((n) => !n.is_read);

  const navItems = [
    {
      to: '/admin',
      label: 'Platform Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
      exact: true,
    },
    {
      to: '/admin/cafes',
      label: 'Cafes & Approvals',
      icon: <Store className="w-5 h-5" />,
      badge: pendingCafesCount > 0 ? `${pendingCafesCount} Pending` : undefined,
      badgeColor: 'bg-amber-600 text-white',
    },
    {
      to: '/admin/users',
      label: 'User Permissions',
      icon: <Users className="w-5 h-5" />,
    },
    {
      to: '/admin/orders',
      label: 'Orders Audit',
      icon: <ShoppingBag className="w-5 h-5" />,
      badge: orders.length > 0 ? `${orders.length}` : undefined,
    },
    {
      to: '/admin/reservations',
      label: 'Reservations Audit',
      icon: <Calendar className="w-5 h-5" />,
      badge: reservations.length > 0 ? `${reservations.length}` : undefined,
    },
    {
      to: '/admin/reviews',
      label: 'Review Moderation',
      icon: <MessageSquare className="w-5 h-5" />,
      badge: reviews.length > 0 ? `${reviews.length}` : undefined,
    },
    {
      to: '/admin/reports',
      label: 'Financial Reports',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      to: '/admin/settings',
      label: 'System Settings',
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
    <div className="min-h-screen flex flex-col bg-[#F6F5F8] text-[#1E140D]">
      {/* 1. Super Admin Governance Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Left: Brand Logo & Admin Role Pill */}
            <div className="flex items-center gap-4 sm:gap-6">
              <Link to="/admin" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-800 flex items-center justify-center text-white shadow-warm group-hover:scale-105 transition-transform duration-200">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-2xl font-bold tracking-tight text-espresso-950 leading-none">
                    Cafe<span className="text-purple-700">Hub</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-purple-700 mt-1">
                    Super Admin Console
                  </span>
                </div>
              </Link>

              {/* Status Indicator */}
              <div className="hidden md:flex items-center gap-2 py-1.5 px-3.5 bg-purple-50 rounded-full border border-purple-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-purple-900">
                  Platform Live
                </span>
                <span className="text-[10px] text-purple-600 bg-white px-2 py-0.5 rounded-full border border-purple-200 font-semibold">
                  v2.4
                </span>
              </div>
            </div>

            {/* Right: Notifications & Admin Profile */}
            <div className="flex items-center gap-3">
              {/* In-App System Alerts */}
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2.5 text-purple-800 hover:text-purple-950 hover:bg-purple-50 rounded-full transition-colors"
                  aria-label="Platform Alerts"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifs.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-purple-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotifs.length}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-warm-xl border border-cream-200 overflow-hidden z-50 animate-in fade-in duration-150">
                    <div className="p-4 border-b border-cream-200 bg-purple-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-espresso-950">System Logs & Alerts</span>
                        {unreadNotifs.length > 0 && (
                          <Badge variant="primary" size="sm">
                            {unreadNotifs.length} New
                          </Badge>
                        )}
                      </div>
                      {unreadNotifs.length > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-xs text-purple-700 hover:text-purple-800 font-bold"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-cream-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-coffee-500">
                          No pending system notifications.
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
                              !n.is_read ? 'bg-purple-50/40' : ''
                            }`}
                          >
                            <div className="flex-1">
                              <p className="font-bold text-espresso-900">{n.title}</p>
                              <p className="text-coffee-600 mt-0.5">{n.message}</p>
                            </div>
                            {!n.is_read && (
                              <div className="w-2 h-2 rounded-full bg-purple-600 shrink-0 self-center" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Profile Pill & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-purple-200">
                <img
                  src={
                    user?.avatar_url ||
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
                  }
                  alt={user?.full_name || 'Admin'}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-600/30"
                />
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-espresso-950 truncate max-w-[120px]">
                    {user?.full_name}
                  </span>
                  <span className="text-[10px] text-purple-700 font-semibold">Super Administrator</span>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-1"
                  title="Sign Out of Admin Console"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-espresso-900 hover:bg-cream-100 rounded-xl lg:hidden"
                aria-label="Toggle Admin Navigation"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-purple-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200 shadow-warm-lg">
            <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-400">
              Governance Menu
            </div>
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-between ${
                    isLinkActive(item.to, item.exact)
                      ? 'bg-purple-900 text-white shadow-sm'
                      : 'bg-purple-50/60 text-espresso-900 hover:bg-purple-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-700 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* 2. Main Admin Workspace: Left Sidebar + Outlet */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white p-3.5 rounded-3xl border border-purple-200/80 shadow-warm space-y-1.5 sticky top-28">
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-purple-400">
                Governance Controls
              </div>

              {navItems.map((item) => {
                const active = isLinkActive(item.to, item.exact);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-purple-900 text-white shadow-warm'
                        : 'text-espresso-800 hover:bg-purple-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-purple-100 text-purple-900'}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              <div className="pt-3 mt-3 border-t border-purple-100">
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

      {/* 3. Mobile Bottom Navigation for Admin */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-purple-200 px-4 py-2 flex items-center justify-around shadow-warm-lg">
        <Link
          to="/admin"
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition-colors ${
            location.pathname === '/admin' ? 'text-purple-700' : 'text-coffee-600 hover:text-espresso-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Overview</span>
        </Link>

        <Link
          to="/admin/cafes"
          className={`relative flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition-colors ${
            location.pathname.startsWith('/admin/cafes') ? 'text-purple-700' : 'text-coffee-600 hover:text-espresso-900'
          }`}
        >
          <div className="relative">
            <Store className="w-5 h-5" />
            {pendingCafesCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-amber-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {pendingCafesCount}
              </span>
            )}
          </div>
          <span>Cafes</span>
        </Link>

        <Link
          to="/admin/users"
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition-colors ${
            location.pathname.startsWith('/admin/users') ? 'text-purple-700' : 'text-coffee-600 hover:text-espresso-900'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Users</span>
        </Link>

        <Link
          to="/admin/orders"
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition-colors ${
            location.pathname.startsWith('/admin/orders') ? 'text-purple-700' : 'text-coffee-600 hover:text-espresso-900'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Orders</span>
        </Link>

        <Link
          to="/admin/reservations"
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition-colors ${
            location.pathname.startsWith('/admin/reservations') ? 'text-purple-700' : 'text-coffee-600 hover:text-espresso-900'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Bookings</span>
        </Link>
      </div>
    </div>
  );
};
