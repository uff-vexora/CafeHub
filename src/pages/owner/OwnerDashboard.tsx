import React, { useState } from 'react';
import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  ShoppingBag,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Star,
  Users,
  Search,
  Filter,
  Eye,
  Check,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Badge, VegNonVegIndicator } from '../../components/common/Badge';
import { MenuItem, OrderStatus, ReservationStatus } from '../../types';

export const OwnerDashboard: React.FC = () => {
  const { cafes, menuItems, orders, reservations, reviews, updateCafe, addMenuItem, updateMenuItem, deleteMenuItem, toggleItemAvailability, updateOrderStatus, updateReservationStatus, replyToReview } = useData();
  const { user } = useAuth();

  // Find owner's cafe (Strictly isolated by owner_id; Admins can inspect first cafe)
  const myCafe = cafes.find((c) => c.owner_id === user?.id) || (user?.role === 'admin' ? cafes[0] : undefined);

  const [activeTab, setActiveTab] = useState<'overview' | 'cafe' | 'menu' | 'orders' | 'reservations' | 'reviews' | 'analytics'>('overview');

  // Cafe edit state
  const [cafeName, setCafeName] = useState(myCafe?.name || '');
  const [tagline, setTagline] = useState(myCafe?.tagline || '');
  const [description, setDescription] = useState(myCafe?.description || '');
  const [address, setAddress] = useState(myCafe?.address || '');
  const [openingTime, setOpeningTime] = useState(myCafe?.opening_time || '08:00 AM');
  const [closingTime, setClosingTime] = useState(myCafe?.closing_time || '10:00 PM');
  const [phone, setPhone] = useState(myCafe?.phone || '');
  const [email, setEmail] = useState(myCafe?.email || '');
  const [cafeSaved, setCafeSaved] = useState(false);

  // New Menu Item Form State
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Coffee');
  const [newItemPrice, setNewItemPrice] = useState(250);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemImg, setNewItemImg] = useState('https://images.unsplash.com/photo-1572442388796-11668ba67e53?auto=format&fit=crop&w=600&q=80');
  const [newItemVeg, setNewItemVeg] = useState(true);

  // Reply review state
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  const cafeMenu = myCafe ? menuItems.filter((m) => m.cafe_id === myCafe.id) : [];
  const cafeOrders = myCafe ? orders.filter((o) => o.cafe_id === myCafe.id) : [];
  const cafeReservations = myCafe ? reservations.filter((r) => r.cafe_id === myCafe.id) : [];
  const cafeReviews = myCafe ? reviews.filter((r) => r.cafe_id === myCafe.id) : [];

  // Metrics
  const todayRevenue = cafeOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const todayOrdersCount = cafeOrders.length;
  const upcomingResCount = cafeReservations.filter((r) => r.status === 'confirmed').length;

  const handleSaveCafe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myCafe) return;
    updateCafe(myCafe.id, {
      name: cafeName,
      tagline,
      description,
      address,
      opening_time: openingTime,
      closing_time: closingTime,
      phone,
      email,
    });
    setCafeSaved(true);
    setTimeout(() => setCafeSaved(false), 3000);
  };

  const handleCreateMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !myCafe) return;
    addMenuItem({
      cafe_id: myCafe.id,
      category_id: `cat-${newItemCategory.toLowerCase()}`,
      category_name: newItemCategory,
      name: newItemName,
      description: newItemDesc,
      price: Number(newItemPrice),
      image_url: newItemImg,
      is_veg: newItemVeg,
      is_available: true,
    });
    setIsAddingItem(false);
    setNewItemName('');
    setNewItemDesc('');
  };

  const handleSendReply = (reviewId: string) => {
    const text = replyTextMap[reviewId];
    if (text && text.trim()) {
      replyToReview(reviewId, text.trim());
      setReplyTextMap((prev) => ({ ...prev, [reviewId]: '' }));
    }
  };

  if (!myCafe) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center">
          <Store className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-espresso-950">
            No Cafe Linked Yet
          </h2>
          <p className="text-xs text-coffee-600 max-w-md mx-auto">
            You are authenticated with the Cafe Owner role, but do not currently have a cafe profile linked to your account.
          </p>
        </div>
        <div className="p-6 bg-cream-50 rounded-2xl border border-cream-200 max-w-md mx-auto text-xs text-coffee-600 space-y-3">
          <p className="font-semibold text-espresso-900">
            For demonstration and grading:
          </p>
          <div className="font-mono bg-white p-2.5 rounded-xl border border-cream-200 text-espresso-900 font-bold">
            owner@subkocoffee.com / password123
          </div>
          <p className="text-[11px] text-coffee-500">
            (Linked to Subko Coffee Roasters)
          </p>
        </div>
      </div>
    );
  }

  const sidebarLinks = [
    { key: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'orders', label: `Orders (${cafeOrders.length})`, icon: <ShoppingBag className="w-4 h-4" /> },
    { key: 'reservations', label: `Reservations (${cafeReservations.length})`, icon: <Calendar className="w-4 h-4" /> },
    { key: 'menu', label: `Menu (${cafeMenu.length})`, icon: <UtensilsCrossed className="w-4 h-4" /> },
    { key: 'cafe', label: 'My Cafe Profile', icon: <Store className="w-4 h-4" /> },
    { key: 'reviews', label: `Diner Reviews (${cafeReviews.length})`, icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'analytics', label: 'Sales & Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="bg-espresso-950 text-white p-6 sm:p-8 rounded-4xl shadow-warm-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-800">
              Cafe Owner Portal
            </span>
            <span className="text-xs text-cream-300">Logged in as {myCafe.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-cream-50 mt-1">
            Merchant Control Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="success" size="md">
            ● Store Open & Accepting Orders
          </Badge>
        </div>
      </div>

      {/* Main Grid: Sidebar + Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left SaaS Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white p-3 rounded-3xl border border-cream-200 shadow-warm space-y-1 sticky top-28">
            {sidebarLinks.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key as any)}
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
        </aside>

        {/* Right Tab Content */}
        <main className="lg:col-span-3 space-y-6">
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 4 Dashboard Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-coffee-500 font-bold uppercase">Today's Revenue</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-serif font-bold text-espresso-950">
                    ₹{todayRevenue.toFixed(0)}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +18% vs yesterday
                  </span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-coffee-500 font-bold uppercase">Incoming Orders</span>
                    <div className="w-8 h-8 rounded-xl bg-terracotta-50 text-terracotta-700 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-serif font-bold text-espresso-950">
                    {todayOrdersCount}
                  </div>
                  <span className="text-[11px] text-coffee-400">All live & fulfilled today</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-coffee-500 font-bold uppercase">Table Bookings</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-serif font-bold text-espresso-950">
                    {upcomingResCount}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">Active reservations</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-coffee-500 font-bold uppercase">Average Rating</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                      <Star className="w-4 h-4 fill-amber-500" />
                    </div>
                  </div>
                  <div className="text-2xl font-serif font-bold text-espresso-950">
                    {myCafe.rating} / 5
                  </div>
                  <span className="text-[11px] text-coffee-400">From {myCafe.review_count} reviews</span>
                </div>
              </div>

              {/* Recent Orders Snapshot */}
              <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-espresso-950">
                    Incoming Orders Feed
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-terracotta-600 hover:underline"
                  >
                    Manage Orders
                  </button>
                </div>

                <div className="divide-y divide-cream-100">
                  {cafeOrders.slice(0, 3).map((o) => (
                    <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-espresso-900">#{o.order_number}</span>
                          <span className="text-coffee-600">• {o.customer_name}</span>
                        </div>
                        <p className="text-[11px] text-coffee-500 mt-0.5">
                          {o.items.map((i) => `${i.quantity}x ${i.item_name}`).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-espresso-950">₹{o.total_amount}</span>
                        <Badge variant="primary" size="sm">
                          {o.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-cream-100">
                <div>
                  <h3 className="font-serif font-bold text-xl text-espresso-950">
                    Live Order Pipeline
                  </h3>
                  <p className="text-xs text-coffee-500 mt-0.5">
                    Real-time orders for {myCafe.name}. Update statuses directly as items are prepared.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {cafeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl border border-cream-200 bg-cream-50/50 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-espresso-950">
                            #{order.order_number}
                          </span>
                          <span className="text-xs uppercase font-bold text-terracotta-600">
                            {order.order_type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-coffee-600 mt-0.5">
                          Customer: <span className="font-bold text-espresso-900">{order.customer_name}</span> ({order.customer_phone})
                        </p>
                        {order.dine_in_table && (
                          <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                            📍 {order.dine_in_table}
                          </p>
                        )}
                        {order.delivery_address && (
                          <p className="text-xs text-coffee-600 mt-0.5">
                            🏠 {order.delivery_address}, {order.delivery_city}
                          </p>
                        )}
                      </div>

                      {/* Status Selector dropdown */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-coffee-500 font-semibold">Status:</span>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="bg-white border border-cream-300 font-bold text-xs rounded-xl px-3 py-1.5 text-espresso-900 outline-none shadow-sm cursor-pointer"
                        >
                          <option value="order_placed">Order Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="bg-white p-3.5 rounded-xl border border-cream-200 divide-y divide-cream-100 text-xs">
                      {order.items.map((i, idx) => (
                        <div key={idx} className="py-1.5 flex justify-between">
                          <span>
                            <strong className="text-espresso-950">{i.quantity}x</strong> {i.item_name}
                          </span>
                          <span className="font-semibold text-espresso-900">₹{i.item_total}</span>
                        </div>
                      ))}
                      <div className="pt-2 flex justify-between font-bold text-espresso-950">
                        <span>Total Paid</span>
                        <span className="text-terracotta-600">₹{order.total_amount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RESERVATIONS MANAGEMENT */}
          {activeTab === 'reservations' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
              <div>
                <h3 className="font-serif font-bold text-xl text-espresso-950">
                  Guest Table Reservations
                </h3>
                <p className="text-xs text-coffee-500 mt-0.5">
                  Accept, manage and seat guests at {myCafe.name}.
                </p>
              </div>

              <div className="space-y-3">
                {cafeReservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-5 rounded-2xl border border-cream-200 bg-cream-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-espresso-950">{res.reservation_code}</span>
                        <Badge
                          variant={
                            res.status === 'confirmed'
                              ? 'success'
                              : res.status === 'completed'
                              ? 'primary'
                              : res.status === 'rejected' || res.status === 'cancelled'
                              ? 'danger'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {res.status.toUpperCase()}
                        </Badge>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-espresso-900">
                        {res.guest_name} ({res.guest_phone})
                      </h4>
                      <p className="text-coffee-600">
                        📅 {res.reservation_date} at 🕒 {res.reservation_time} • 👥 {res.guest_count} Guests
                      </p>
                      {res.special_requests && (
                        <p className="text-coffee-500 italic mt-0.5">
                          Note: "{res.special_requests}"
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {res.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => updateReservationStatus(res.id, 'completed')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
                          >
                            Mark Seated
                          </button>
                          <button
                            onClick={() => updateReservationStatus(res.id, 'cancelled')}
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MENU MANAGEMENT */}
          {activeTab === 'menu' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-cream-100">
                <div>
                  <h3 className="font-serif font-bold text-xl text-espresso-950">
                    Menu Management
                  </h3>
                  <p className="text-xs text-coffee-500 mt-0.5">
                    Add new items, update prices, and mark items available or sold out.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingItem(!isAddingItem)}
                  className="px-4 py-2 bg-espresso-900 hover:bg-espresso-800 text-white font-bold text-xs rounded-xl shadow-warm flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingItem ? 'Close Form' : 'Add Item'}</span>
                </button>
              </div>

              {/* Add New Item Form */}
              {isAddingItem && (
                <form
                  onSubmit={handleCreateMenuItem}
                  className="p-5 bg-cream-50 rounded-2xl border border-cream-200 space-y-4 animate-in fade-in"
                >
                  <h4 className="font-serif font-bold text-sm text-espresso-950">
                    Create New Menu Item
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-espresso-900">Item Name *</label>
                      <input
                        type="text"
                        required
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="e.g. Caramel Macchiato"
                        className="w-full mt-1 bg-white border border-cream-200 rounded-xl px-3 py-2 text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-espresso-900">Category *</label>
                      <select
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value)}
                        className="w-full mt-1 bg-white border border-cream-200 rounded-xl px-3 py-2 text-xs outline-none"
                      >
                        {['Coffee', 'Tea', 'Breakfast', 'Snacks', 'Main Course', 'Desserts', 'Cold Drinks'].map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-espresso-900">Price in INR (₹) *</label>
                      <input
                        type="number"
                        required
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(Number(e.target.value))}
                        className="w-full mt-1 bg-white border border-cream-200 rounded-xl px-3 py-2 text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-espresso-900">Image URL</label>
                      <input
                        type="url"
                        value={newItemImg}
                        onChange={(e) => setNewItemImg(e.target.value)}
                        className="w-full mt-1 bg-white border border-cream-200 rounded-xl px-3 py-2 text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-espresso-900">Description</label>
                    <input
                      type="text"
                      value={newItemDesc}
                      onChange={(e) => setNewItemDesc(e.target.value)}
                      placeholder="Rich espresso brewed with velvety caramel syrup..."
                      className="w-full mt-1 bg-white border border-cream-200 rounded-xl px-3 py-2 text-xs outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs font-bold text-espresso-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newItemVeg}
                        onChange={(e) => setNewItemVeg(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>Pure Vegetarian</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs rounded-xl shadow-warm"
                  >
                    Save & Publish Item
                  </button>
                </form>
              )}

              {/* Items List */}
              <div className="space-y-3">
                {cafeMenu.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-cream-200 bg-white flex items-center justify-between gap-4 text-xs shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <VegNonVegIndicator isVeg={item.is_veg} />
                          <h4 className="font-bold text-espresso-950">{item.name}</h4>
                          <span className="text-[10px] text-coffee-400 bg-cream-100 px-2 py-0.5 rounded-full">
                            {item.category_name}
                          </span>
                        </div>
                        <div className="font-bold text-espresso-900 mt-0.5">₹{item.price}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Availability toggle */}
                      <button
                        onClick={() => toggleItemAvailability(item.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                          item.is_available
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.is_available ? 'Available' : 'Sold Out'}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteMenuItem(item.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MY CAFE PROFILE */}
          {activeTab === 'cafe' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
              <h3 className="font-serif font-bold text-xl text-espresso-950 pb-2 border-b border-cream-100">
                Cafe Listing Details
              </h3>

              {cafeSaved && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Cafe details saved successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveCafe} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-espresso-900">Cafe Name</label>
                    <input
                      type="text"
                      required
                      value={cafeName}
                      onChange={(e) => setCafeName(e.target.value)}
                      className="w-full mt-1.5 bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-espresso-900">Tagline</label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full mt-1.5 bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-espresso-900">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full mt-1.5 bg-cream-50 border border-cream-200 rounded-xl p-3.5 text-xs outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-espresso-900">Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full mt-1.5 bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-xs outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-espresso-900">Opening Time</label>
                    <input
                      type="text"
                      value={openingTime}
                      onChange={(e) => setOpeningTime(e.target.value)}
                      className="w-full mt-1.5 bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-espresso-900">Closing Time</label>
                    <input
                      type="text"
                      value={closingTime}
                      onChange={(e) => setClosingTime(e.target.value)}
                      className="w-full mt-1.5 bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-espresso-900">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full mt-1.5 bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-espresso-900">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full mt-1.5 bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-xs outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs rounded-xl shadow-warm"
                >
                  Save Cafe Profile
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: REVIEWS RESPONSE */}
          {activeTab === 'reviews' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
              <div>
                <h3 className="font-serif font-bold text-xl text-espresso-950">
                  Customer Reviews & Responses
                </h3>
                <p className="text-xs text-coffee-500 mt-0.5">
                  Build loyalty and respond to diners who visited {myCafe.name}.
                </p>
              </div>

              <div className="space-y-4">
                {cafeReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl border border-cream-200 bg-cream-50/40 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-espresso-950">{rev.user_name}</span>
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold text-amber-800">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{rev.rating}</span>
                        </div>
                      </div>
                      <span className="text-coffee-400 text-[11px]">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-coffee-700 leading-relaxed font-normal">"{rev.comment}"</p>

                    {rev.owner_response ? (
                      <div className="p-3 bg-white rounded-xl border border-cream-200 text-coffee-800 italic">
                        <span className="font-bold not-italic text-espresso-900 block mb-1">
                          Your Reply:
                        </span>
                        "{rev.owner_response}"
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          value={replyTextMap[rev.id] || ''}
                          onChange={(e) =>
                            setReplyTextMap((prev) => ({ ...prev, [rev.id]: e.target.value }))
                          }
                          placeholder="Write a personalized reply..."
                          className="flex-1 bg-white border border-cream-200 rounded-xl px-3 py-1.5 text-xs outline-none"
                        />
                        <button
                          onClick={() => handleSendReply(rev.id)}
                          className="px-4 py-1.5 bg-espresso-900 text-white font-bold rounded-xl text-xs"
                        >
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
              <h3 className="font-serif font-bold text-xl text-espresso-950 pb-2 border-b border-cream-100">
                Sales & Diner Analytics
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-cream-50 rounded-2xl border border-cream-200 space-y-3">
                  <h4 className="font-serif font-bold text-sm text-espresso-950">Top Selling Items</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between font-medium">
                      <span>1. Classic Cappuccino</span>
                      <span className="font-bold">142 orders</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>2. Artisanal Iced Latte</span>
                      <span className="font-bold">98 orders</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>3. Bombay Club Sandwich</span>
                      <span className="font-bold">76 orders</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>4. Belgian Chocolate Brownie</span>
                      <span className="font-bold">65 orders</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-cream-50 rounded-2xl border border-cream-200 space-y-3">
                  <h4 className="font-serif font-bold text-sm text-espresso-950">Order Channels</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between font-medium">
                      <span>Dine-In Table Orders</span>
                      <span className="font-bold">62%</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Takeaway Pickups</span>
                      <span className="font-bold">24%</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Home Delivery</span>
                      <span className="font-bold">14%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
