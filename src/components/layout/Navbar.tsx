import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Coffee,
  MapPin,
  Search,
  ShoppingBag,
  Bell,
  User,
  Heart,
  Calendar,
  LogOut,
  Menu as MenuIcon,
  X,
  ChevronDown,
  Check,
  Clock,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useData } from '../../context/DataContext';
import { Badge } from '../common/Badge';

export const CITIES = ['All Cities', 'Mumbai', 'Bengaluru', 'New Delhi', 'Pune', 'Hyderabad', 'Jaipur'];

interface NavbarProps {
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedCity = 'All Cities',
  onSelectCity,
}) => {
  const { user, isAuthenticated, logout, getRedirectPathForRole } = useAuth();
  const { itemCount } = useCart();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setIsCityDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const brandHomeLink = user ? getRedirectPathForRole(user.role) : '/login';

  return (
    <>
      {/* Main Navbar */}
      <header className="sticky top-0 z-40 glass-nav border-b border-cream-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Left: Brand Logo & City selector */}
            <div className="flex items-center gap-6">
              <Link to={brandHomeLink} className="flex items-center gap-2.5 group">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-terracotta-500 to-terracotta-600 flex items-center justify-center text-white shadow-warm group-hover:scale-105 transition-transform duration-200">
                  <Coffee className="w-6 h-6 transform group-hover:-rotate-6 transition-transform" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-2xl font-bold tracking-tight text-espresso-950 leading-none">
                    Cafe<span className="text-terracotta-600">Hub</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-coffee-500 mt-1">
                    Specialty & Dining
                  </span>
                </div>
              </Link>

              {/* Location Selector Dropdown (Authenticated Only) */}
              {isAuthenticated && (
                <div className="relative hidden md:block" ref={cityDropdownRef}>
                  <button
                    onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream-100 hover:bg-cream-200/80 text-espresso-900 text-xs font-semibold border border-cream-300 transition-colors shadow-sm"
                  >
                    <MapPin className="w-3.5 h-3.5 text-terracotta-600" />
                    <span>{selectedCity}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-coffee-500" />
                  </button>

                  {isCityDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-warm-lg border border-cream-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-coffee-400">
                        Select City
                      </div>
                      {CITIES.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            onSelectCity?.(city);
                            setIsCityDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-cream-100 transition-colors ${
                            selectedCity === city
                              ? 'font-bold text-terracotta-600 bg-cream-50'
                              : 'text-espresso-800'
                          }`}
                        >
                          {city}
                          {selectedCity === city && <Check className="w-3.5 h-3.5 text-terracotta-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Middle: Navigation Links (Strictly Authenticated Only) */}
            {isAuthenticated && user && (
              <nav className="hidden lg:flex items-center gap-1 bg-cream-100/70 p-1.5 rounded-full border border-cream-200">
                {user.role === 'customer' && (
                  <>
                    <Link
                      to="/dashboard"
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        isActive('/dashboard')
                          ? 'bg-white text-espresso-950 shadow-sm'
                          : 'text-coffee-700 hover:text-espresso-900 hover:bg-white/50'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/cafes"
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        isActive('/cafes')
                          ? 'bg-white text-espresso-950 shadow-sm'
                          : 'text-coffee-700 hover:text-espresso-900 hover:bg-white/50'
                      }`}
                    >
                      Cafes
                    </Link>
                    <Link
                      to="/reservations"
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        isActive('/reservations')
                          ? 'bg-white text-espresso-950 shadow-sm'
                          : 'text-coffee-700 hover:text-espresso-900 hover:bg-white/50'
                      }`}
                    >
                      Reservations
                    </Link>
                    <Link
                      to="/orders"
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        isActive('/orders')
                          ? 'bg-white text-espresso-950 shadow-sm'
                          : 'text-coffee-700 hover:text-espresso-900 hover:bg-white/50'
                      }`}
                    >
                      Orders
                    </Link>
                  </>
                )}
              </nav>
            )}

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {isAuthenticated && user ? (
                <>
                  {/* Quick Search trigger */}
                  <Link
                    to="/cafes"
                    className="p-2.5 text-coffee-600 hover:text-espresso-900 hover:bg-cream-100 rounded-full transition-colors hidden sm:flex"
                    title="Search cafes & menus"
                  >
                    <Search className="w-5 h-5" />
                  </Link>

                  {/* In-App Notifications Bell */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={() => setIsNotifOpen(!isNotifOpen)}
                      className="relative p-2.5 text-coffee-600 hover:text-espresso-900 hover:bg-cream-100 rounded-full transition-colors"
                      aria-label="View notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-terracotta-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {isNotifOpen && (
                      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-warm-xl border border-cream-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-4 border-b border-cream-200 bg-cream-50/50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-espresso-900">Notifications</span>
                            {unreadCount > 0 && (
                              <Badge variant="primary" size="sm">
                                {unreadCount} New
                              </Badge>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllNotificationsRead}
                              className="text-xs text-terracotta-600 hover:text-terracotta-700 font-semibold"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto divide-y divide-cream-100">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-sm text-coffee-500">
                              No notifications yet.
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => {
                                  markNotificationRead(notif.id);
                                  if (notif.link) {
                                    navigate(notif.link);
                                    setIsNotifOpen(false);
                                  }
                                }}
                                className={`p-3.5 hover:bg-cream-50 transition-colors cursor-pointer flex gap-3 ${
                                  !notif.is_read ? 'bg-cream-50/60' : ''
                                }`}
                              >
                                <div className="w-8 h-8 rounded-full bg-cream-200 flex items-center justify-center text-coffee-700 shrink-0 mt-0.5">
                                  {notif.type === 'order' && <ShoppingBag className="w-4 h-4 text-terracotta-600" />}
                                  {notif.type === 'reservation' && <Calendar className="w-4 h-4 text-amber-600" />}
                                  {notif.type === 'cafe' && <Coffee className="w-4 h-4 text-emerald-600" />}
                                  {notif.type === 'system' && <Bell className="w-4 h-4 text-coffee-600" />}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-espresso-900">{notif.title}</p>
                                    <span className="text-[10px] text-coffee-400">{notif.created_at}</span>
                                  </div>
                                  <p className="text-xs text-coffee-700 mt-0.5 leading-snug">
                                    {notif.message}
                                  </p>
                                </div>
                                {!notif.is_read && (
                                  <div className="w-2 h-2 rounded-full bg-terracotta-600 shrink-0 self-center" />
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cart Button */}
                  <Link
                    to="/cart"
                    className="relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-cream-100 hover:bg-cream-200/80 text-espresso-900 font-semibold text-xs border border-cream-300 transition-all shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4 text-terracotta-600" />
                    <span className="hidden sm:inline">Cart</span>
                    {itemCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-espresso-900 text-white text-[11px] font-bold flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>

                  {/* User Profile Dropdown Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-cream-300 bg-white hover:bg-cream-50 shadow-sm transition-all"
                    >
                      <img
                        src={
                          user.avatar_url ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                        }
                        alt={user.full_name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-cream-200"
                      />
                      <span className="text-xs font-bold text-espresso-900 max-w-[100px] truncate hidden md:inline">
                        {user.full_name.split(' ')[0]}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-coffee-500" />
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-warm-xl border border-cream-200 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                        {/* User Header */}
                        <div className="px-4 py-3 border-b border-cream-100">
                          <p className="text-sm font-bold text-espresso-900">{user.full_name}</p>
                          <p className="text-xs text-coffee-500 truncate">{user.email}</p>
                          <div className="mt-2">
                            <Badge
                              variant={
                                user.role === 'admin'
                                  ? 'danger'
                                  : user.role === 'cafe_owner'
                                  ? 'warning'
                                  : 'primary'
                              }
                              size="sm"
                            >
                              {user.role === 'admin'
                                ? 'Admin'
                                : user.role === 'cafe_owner'
                                ? 'Cafe Owner'
                                : 'Customer'}
                            </Badge>
                          </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="py-1">
                          {user.role === 'customer' && (
                            <Link
                              to="/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-espresso-800 hover:bg-cream-100 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 text-terracotta-600" />
                              Customer Dashboard
                            </Link>
                          )}
                          <Link
                            to="/account"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-espresso-800 hover:bg-cream-100 transition-colors"
                          >
                            <User className="w-4 h-4 text-coffee-500" />
                            My Profile & Account
                          </Link>
                          <Link
                            to="/orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-espresso-800 hover:bg-cream-100 transition-colors"
                          >
                            <ShoppingBag className="w-4 h-4 text-coffee-500" />
                            My Orders
                          </Link>
                          <Link
                            to="/reservations"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-espresso-800 hover:bg-cream-100 transition-colors"
                          >
                            <Calendar className="w-4 h-4 text-coffee-500" />
                            My Reservations
                          </Link>
                          <Link
                            to="/account?tab=favorites"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-espresso-800 hover:bg-cream-100 transition-colors"
                          >
                            <Heart className="w-4 h-4 text-coffee-500" />
                            Saved Favorites
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="pt-1 border-t border-cream-100">
                          <button
                            onClick={() => {
                              logout();
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile Menu Toggle Button */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-espresso-900 hover:bg-cream-100 rounded-xl lg:hidden transition-colors"
                    aria-label="Toggle Navigation Menu"
                  >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                  </button>
                </>
              ) : (
                /* Strictly Logged Out Header Actions: No Private Links */
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-xs font-bold text-espresso-900 hover:text-terracotta-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-espresso-900 hover:bg-espresso-800 text-white text-xs font-bold rounded-full shadow-warm transition-all active:scale-95"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer (Authenticated Only) */}
        {isAuthenticated && isMobileMenuOpen && (
          <div className="lg:hidden border-t border-cream-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
            {/* Mobile city selector */}
            <div className="flex items-center gap-2 p-2 bg-cream-100 rounded-xl">
              <MapPin className="w-4 h-4 text-terracotta-600 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => onSelectCity?.(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-espresso-900 outline-none"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {user?.role === 'customer' && (
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-3 rounded-2xl text-xs font-bold text-center ${
                    isActive('/dashboard') ? 'bg-espresso-900 text-white' : 'bg-cream-100 text-espresso-900'
                  }`}
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/cafes"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-3 rounded-2xl text-xs font-bold text-center ${
                  isActive('/cafes') ? 'bg-espresso-900 text-white' : 'bg-cream-100 text-espresso-900'
                }`}
              >
                Cafes
              </Link>
              <Link
                to="/reservations"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-3 rounded-2xl text-xs font-bold text-center ${
                  isActive('/reservations')
                    ? 'bg-espresso-900 text-white'
                    : 'bg-cream-100 text-espresso-900'
                }`}
              >
                Book Table
              </Link>
              <Link
                to="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-3 rounded-2xl text-xs font-bold text-center ${
                  isActive('/orders')
                    ? 'bg-espresso-900 text-white'
                    : 'bg-cream-100 text-espresso-900'
                }`}
              >
                Track Orders
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Sticky Bottom App Bar (Authenticated Customers Only) */}
      {isAuthenticated && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-cream-200 px-4 py-2 flex items-center justify-around shadow-warm-lg">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition-colors ${
              isActive('/dashboard')
                ? 'text-terracotta-600'
                : 'text-coffee-600 hover:text-espresso-900'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/cafes"
            className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition-colors ${
              isActive('/cafes') ? 'text-terracotta-600' : 'text-coffee-600 hover:text-espresso-900'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Cafes</span>
          </Link>
          <Link
            to="/cart"
            className={`relative flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition-colors ${
              isActive('/cart') ? 'text-terracotta-600' : 'text-coffee-600 hover:text-espresso-900'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-terracotta-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </Link>
          <Link
            to="/orders"
            className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition-colors ${
              isActive('/orders') ? 'text-terracotta-600' : 'text-coffee-600 hover:text-espresso-900'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>Orders</span>
          </Link>
          <Link
            to="/account"
            className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition-colors ${
              isActive('/account') ? 'text-terracotta-600' : 'text-coffee-600 hover:text-espresso-900'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Account</span>
          </Link>
        </div>
      )}
    </>
  );
};
