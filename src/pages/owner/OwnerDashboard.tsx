import React, { useState, useEffect, useRef } from 'react';
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
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Coffee,
  X,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Badge, VegNonVegIndicator } from '../../components/common/Badge';
import { MenuItem, OrderStatus, ReservationStatus, AmenityKey } from '../../types';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

interface OwnerDashboardProps {
  defaultTab?: 'overview' | 'orders' | 'reservations' | 'menu' | 'cafe' | 'reviews' | 'analytics' | 'settings';
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ defaultTab = 'overview' }) => {
  const {
    cafes,
    menuItems,
    orders,
    reservations,
    reviews,
    updateCafe,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
    updateOrderStatus,
    updateReservationStatus,
    replyToReview,
  } = useData();
  const { user } = useAuth();

  // Find owner's cafe (Strictly isolated by owner_id; Admins fallback to first cafe for inspection)
  const myCafe = cafes.find((c) => c.owner_id === user?.id) || (user?.role === 'admin' ? cafes[0] : undefined);

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'reservations' | 'menu' | 'cafe' | 'reviews' | 'analytics' | 'settings'>(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Cafe edit state
  const [cafeName, setCafeName] = useState(myCafe?.name || '');
  const [tagline, setTagline] = useState(myCafe?.tagline || '');
  const [description, setDescription] = useState(myCafe?.description || '');
  const [address, setAddress] = useState(myCafe?.address || '');
  const [openingTime, setOpeningTime] = useState(myCafe?.opening_time || '08:00 AM');
  const [closingTime, setClosingTime] = useState(myCafe?.closing_time || '10:00 PM');
  const [phone, setPhone] = useState(myCafe?.phone || '');
  const [email, setEmail] = useState(myCafe?.email || '');
  const [coverImage, setCoverImage] = useState(myCafe?.cover_image || '');
  const [galleryImages, setGalleryImages] = useState<string[]>(myCafe?.images || []);
  const [amenities, setAmenities] = useState<AmenityKey[]>(
    myCafe?.amenities || ['wifi', 'air_conditioning', 'power_outlets', 'work_friendly']
  );
  const [cafeSaved, setCafeSaved] = useState(false);

  // Sync cafe state if myCafe changes
  useEffect(() => {
    if (myCafe) {
      setCafeName(myCafe.name);
      setTagline(myCafe.tagline);
      setDescription(myCafe.description);
      setAddress(myCafe.address);
      setOpeningTime(myCafe.opening_time);
      setClosingTime(myCafe.closing_time);
      setPhone(myCafe.phone);
      setEmail(myCafe.email);
      setCoverImage(myCafe.cover_image);
      setGalleryImages(myCafe.images || []);
      setAmenities(myCafe.amenities || ['wifi', 'air_conditioning', 'power_outlets', 'work_friendly']);
    }
  }, [myCafe]);

  // Menu Category Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [customCategories, setCustomCategories] = useState<string[]>([
    'Coffee',
    'Tea',
    'Breakfast',
    'Snacks',
    'Main Course',
    'Desserts',
    'Cold Drinks',
  ]);
  const [newCatInput, setNewCatInput] = useState('');
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // New Menu Item Form State
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Coffee');
  const [newItemPrice, setNewItemPrice] = useState(250);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemImg, setNewItemImg] = useState('https://images.unsplash.com/photo-1572442388796-11668ba67e53?auto=format&fit=crop&w=600&q=80');
  const [newItemVeg, setNewItemVeg] = useState(true);

  // Edit Menu Item Modal State
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPrice, setEditPrice] = useState(0);
  const [editDesc, setEditDesc] = useState('');
  const [editImg, setEditImg] = useState('');
  const [editVeg, setEditVeg] = useState(true);
  const [editAvailable, setEditAvailable] = useState(true);

  // Orders and Reservations filter tabs
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [resStatusFilter, setResStatusFilter] = useState<string>('all');

  // Reply review state
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // Settings State
  const [storeOpen, setStoreOpen] = useState(true);
  const [tableCount, setTableCount] = useState(12);
  const [autoConfirmOrders, setAutoConfirmOrders] = useState(false);
  const [taxRate, setTaxRate] = useState(5);
  const [minOrderAmount, setMinOrderAmount] = useState(150);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // File upload helper
  const handleFileUpload = (file: File, onDone: (url: string) => void) => {
    if (isSupabaseConfigured) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      supabase.storage
        .from('cafe-images')
        .upload(fileName, file)
        .then(({ data, error }) => {
          if (!error && data) {
            const { data: publicUrlData } = supabase.storage.from('cafe-images').getPublicUrl(fileName);
            onDone(publicUrlData.publicUrl);
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => onDone(reader.result as string);
          reader.readAsDataURL(file);
        })
        .catch(() => {
          const reader = new FileReader();
          reader.onloadend = () => onDone(reader.result as string);
          reader.readAsDataURL(file);
        });
    } else {
      const reader = new FileReader();
      reader.onloadend = () => onDone(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Cafe data collections
  const cafeMenu = myCafe ? menuItems.filter((m) => m.cafe_id === myCafe.id) : [];
  const cafeOrders = myCafe ? orders.filter((o) => o.cafe_id === myCafe.id) : [];
  const cafeReservations = myCafe ? reservations.filter((r) => r.cafe_id === myCafe.id) : [];
  const cafeReviews = myCafe ? reviews.filter((r) => r.cafe_id === myCafe.id) : [];

  // Filtered menu
  const filteredMenu = selectedCategory === 'All'
    ? cafeMenu
    : cafeMenu.filter((m) => m.category_name?.toLowerCase() === selectedCategory.toLowerCase());

  // Filtered Orders
  const filteredOrders = cafeOrders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    if (orderStatusFilter === 'active') {
      return o.status === 'order_placed' || o.status === 'confirmed' || o.status === 'preparing';
    }
    return o.status === orderStatusFilter;
  });

  // Filtered Reservations
  const filteredReservations = cafeReservations.filter((r) => {
    if (resStatusFilter === 'all') return true;
    return r.status === resStatusFilter;
  });

  // Dynamic Sales Metrics
  const todayRevenue = cafeOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const todayOrdersCount = cafeOrders.length;
  const avgOrderValue = todayOrdersCount > 0 ? (todayRevenue / todayOrdersCount).toFixed(0) : '0';
  const upcomingResCount = cafeReservations.filter((r) => r.status === 'confirmed').length;

  // Aggregate Top Selling Items dynamically from orders
  const itemSalesMap: Record<string, { count: number; name: string; revenue: number }> = {};
  cafeOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (!itemSalesMap[item.menu_item_id]) {
        itemSalesMap[item.menu_item_id] = { count: 0, name: item.item_name, revenue: 0 };
      }
      itemSalesMap[item.menu_item_id].count += item.quantity;
      itemSalesMap[item.menu_item_id].revenue += item.item_total;
    });
  });
  const topSellingItems = Object.values(itemSalesMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

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
      cover_image: coverImage,
      images: galleryImages,
      amenities,
    });
    setCafeSaved(true);
    setTimeout(() => setCafeSaved(false), 3000);
  };

  const handleCreateMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !myCafe) return;
    addMenuItem({
      cafe_id: myCafe.id,
      category_id: `cat-${newItemCategory.toLowerCase().replace(/\s+/g, '-')}`,
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
    setNewItemPrice(250);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditCategory(item.category_name || 'Coffee');
    setEditPrice(item.price);
    setEditDesc(item.description || '');
    setEditImg(item.image_url || '');
    setEditVeg(item.is_veg);
    setEditAvailable(item.is_available);
  };

  const handleSaveEditedItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateMenuItem(editingItem.id, {
      name: editName,
      category_name: editCategory,
      category_id: `cat-${editCategory.toLowerCase().replace(/\s+/g, '-')}`,
      price: Number(editPrice),
      description: editDesc,
      image_url: editImg,
      is_veg: editVeg,
      is_available: editAvailable,
    });
    setEditingItem(null);
  };

  const handleSendReply = (reviewId: string) => {
    const text = replyTextMap[reviewId];
    if (text && text.trim()) {
      replyToReview(reviewId, text.trim());
      setReplyTextMap((prev) => ({ ...prev, [reviewId]: '' }));
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const ALL_AMENITY_OPTIONS: { key: AmenityKey; label: string }[] = [
    { key: 'wifi', label: 'Free Wi-Fi' },
    { key: 'air_conditioning', label: 'Air Conditioning' },
    { key: 'outdoor_seating', label: 'Outdoor Patio' },
    { key: 'parking', label: 'Dedicated Parking' },
    { key: 'pet_friendly', label: 'Pet Friendly' },
    { key: 'power_outlets', label: 'Power Outlets' },
    { key: 'work_friendly', label: 'Work Friendly' },
  ];

  const toggleAmenity = (key: AmenityKey) => {
    if (amenities.includes(key)) {
      setAmenities(amenities.filter((a) => a !== key));
    } else {
      setAmenities([...amenities, key]);
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
          <p className="font-semibold text-espresso-900">For demonstration and test accounts:</p>
          <div className="font-mono bg-white p-2.5 rounded-xl border border-cream-200 text-espresso-900 font-bold">
            owner@subkocoffee.com / password123
          </div>
          <p className="text-[11px] text-coffee-500">(Linked to Subko Coffee Roasters)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* TAB 1: OVERVIEW METRICS                                         */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-espresso-950 via-espresso-900 to-amber-950 text-white p-6 sm:p-7 rounded-3xl shadow-warm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-800">
                  {myCafe.name}
                </span>
                <span className="text-xs text-cream-300">Live Merchant Overview</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-cream-50 mt-1">
                Operations & Performance
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success" size="md">
                ● Store Open & Accepting Orders
              </Badge>
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs text-coffee-500 font-bold uppercase">Total Revenue</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-serif font-bold text-espresso-950">
                ₹{todayRevenue.toFixed(0)}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Real-time order revenue
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs text-coffee-500 font-bold uppercase">Orders Processed</span>
                <div className="w-8 h-8 rounded-xl bg-terracotta-50 text-terracotta-700 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-serif font-bold text-espresso-950">
                {todayOrdersCount}
              </div>
              <span className="text-[11px] text-coffee-500 font-medium">Avg Order Value: ₹{avgOrderValue}</span>
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
                <span className="text-xs text-coffee-500 font-bold uppercase">Cafe Rating</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
              </div>
              <div className="text-2xl font-serif font-bold text-espresso-950">
                {myCafe.rating} ★
              </div>
              <span className="text-[11px] text-coffee-400">From {myCafe.review_count} verified reviews</span>
            </div>
          </div>

          {/* Quick Actions & Recent Orders Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-espresso-950">
                  Recent Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-terracotta-600 hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              {cafeOrders.length === 0 ? (
                <p className="text-xs text-coffee-500 py-6 text-center">No incoming orders yet.</p>
              ) : (
                <div className="divide-y divide-cream-100">
                  {cafeOrders.slice(0, 4).map((o) => (
                    <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-espresso-900">#{o.order_number}</span>
                          <span className="text-coffee-600">• {o.customer_name}</span>
                        </div>
                        <p className="text-[11px] text-coffee-500 mt-0.5 truncate max-w-[200px]">
                          {o.items.map((i) => `${i.quantity}x ${i.item_name}`).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-espresso-950">₹{o.total_amount}</span>
                        <Badge
                          variant={
                            o.status === 'completed'
                              ? 'success'
                              : o.status === 'cancelled'
                              ? 'danger'
                              : o.status === 'ready'
                              ? 'primary'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {o.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Menu Overview */}
            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-espresso-950">
                  Published Menu Items ({cafeMenu.length})
                </h3>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="text-xs font-bold text-terracotta-600 hover:underline"
                >
                  Manage Menu →
                </button>
              </div>

              <div className="divide-y divide-cream-100">
                {cafeMenu.slice(0, 4).map((m) => (
                  <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img src={m.image_url} alt={m.name} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <VegNonVegIndicator isVeg={m.is_veg} />
                          <span className="font-bold text-espresso-950">{m.name}</span>
                        </div>
                        <span className="text-[10px] text-coffee-400">{m.category_name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-espresso-900">₹{m.price}</span>
                      <button
                        onClick={() => toggleItemAvailability(m.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.is_available ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {m.is_available ? 'In Stock' : 'Sold Out'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: LIVE ORDERS MANAGEMENT                                   */}
      {/* ============================================================== */}
      {activeTab === 'orders' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-200">
            <div>
              <h2 className="font-serif font-bold text-xl text-espresso-950">
                Live Orders Pipeline
              </h2>
              <p className="text-xs text-coffee-500 mt-0.5">
                Real-time incoming orders for {myCafe.name}. Progress statuses from preparation to delivery.
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-cream-100 p-1 rounded-2xl overflow-x-auto">
              {['all', 'active', 'order_placed', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'].map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                      orderStatusFilter === st
                        ? 'bg-espresso-900 text-white shadow-xs'
                        : 'text-coffee-600 hover:text-espresso-900'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                )
              )}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-cream-400 mx-auto" />
              <p className="text-sm font-semibold text-espresso-900">No orders match this filter.</p>
              <p className="text-xs text-coffee-500">Orders placed by customers will automatically appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl border border-cream-200 bg-cream-50/50 space-y-4 hover:border-cream-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-espresso-950">
                          #{order.order_number}
                        </span>
                        <span className="text-[11px] uppercase font-bold text-terracotta-600 bg-terracotta-50 px-2 py-0.5 rounded-full border border-terracotta-200">
                          {order.order_type.replace('_', ' ')}
                        </span>
                        <Badge
                          variant={
                            order.status === 'completed'
                              ? 'success'
                              : order.status === 'cancelled'
                              ? 'danger'
                              : order.status === 'ready'
                              ? 'primary'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {order.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-coffee-600 mt-1">
                        Customer: <span className="font-bold text-espresso-900">{order.customer_name}</span> ({order.customer_phone})
                      </p>
                      {order.dine_in_table && (
                        <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                          📍 Table: {order.dine_in_table}
                        </p>
                      )}
                      {order.delivery_address && (
                        <p className="text-xs text-coffee-600 mt-0.5">
                          🏠 Address: {order.delivery_address}, {order.delivery_city}
                        </p>
                      )}
                      {order.notes && (
                        <p className="text-xs text-amber-800 italic mt-0.5">
                          Note: "{order.notes}"
                        </p>
                      )}
                    </div>

                    {/* Operational Action Pipeline Buttons */}
                    <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
                      {order.status === 'order_placed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-warm transition-all"
                        >
                          Accept & Confirm
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-warm transition-all"
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="px-3.5 py-1.5 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs rounded-xl shadow-warm transition-all"
                        >
                          Mark Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-warm transition-all"
                        >
                          Mark Completed
                        </button>
                      )}
                      {order.status !== 'completed' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                      )}

                      {/* Manual Override dropdown */}
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="bg-white border border-cream-300 font-bold text-xs rounded-xl px-2.5 py-1.5 text-espresso-900 outline-none shadow-xs cursor-pointer ml-1"
                      >
                        <option value="order_placed">Placed</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Itemized Receipt */}
                  <div className="bg-white p-3.5 rounded-xl border border-cream-200 divide-y divide-cream-100 text-xs">
                    {order.items.map((i, idx) => (
                      <div key={idx} className="py-1.5 flex justify-between">
                        <span>
                          <strong className="text-espresso-950">{i.quantity}x</strong> {i.item_name}
                        </span>
                        <span className="font-semibold text-espresso-900">₹{i.item_total}</span>
                      </div>
                    ))}
                    <div className="pt-2 flex justify-between font-bold text-espresso-950 text-sm">
                      <span>Total Billed</span>
                      <span className="text-terracotta-600">₹{order.total_amount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: TABLE RESERVATIONS                                       */}
      {/* ============================================================== */}
      {activeTab === 'reservations' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-200">
            <div>
              <h2 className="font-serif font-bold text-xl text-espresso-950">
                Table Bookings
              </h2>
              <p className="text-xs text-coffee-500 mt-0.5">
                Manage guest seatings, reservations, and table assignments for {myCafe.name}.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-cream-100 p-1 rounded-2xl overflow-x-auto">
              {['all', 'confirmed', 'completed', 'cancelled', 'rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setResStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                    resStatusFilter === st
                      ? 'bg-espresso-900 text-white shadow-xs'
                      : 'text-coffee-600 hover:text-espresso-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {filteredReservations.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Calendar className="w-10 h-10 text-cream-400 mx-auto" />
              <p className="text-sm font-semibold text-espresso-900">No table bookings match this filter.</p>
              <p className="text-xs text-coffee-500">Guest table bookings will appear here in real-time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReservations.map((res) => (
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
                      📅 Date: {res.reservation_date} • 🕒 Time: {res.reservation_time} • 👥 {res.guest_count} Guests
                    </p>
                    {res.special_requests && (
                      <p className="text-coffee-500 italic mt-0.5">
                        Special Request: "{res.special_requests}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {res.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => updateReservationStatus(res.id, 'completed')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
                        >
                          Seat Guests
                        </button>
                        <button
                          onClick={() => updateReservationStatus(res.id, 'cancelled')}
                          className="px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {res.status !== 'confirmed' && res.status !== 'completed' && (
                      <button
                        onClick={() => updateReservationStatus(res.id, 'confirmed')}
                        className="px-3.5 py-1.5 bg-espresso-900 hover:bg-espresso-800 text-white font-bold rounded-xl transition-colors"
                      >
                        Re-confirm
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: MENU MANAGEMENT                                          */}
      {/* ============================================================== */}
      {activeTab === 'menu' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-200">
            <div>
              <h2 className="font-serif font-bold text-xl text-espresso-950">
                Menu Management
              </h2>
              <p className="text-xs text-coffee-500 mt-0.5">
                Organize categories, create artisanal offerings, edit pricing, and toggle item availability.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCategoryManager(!showCategoryManager)}
                className="px-3.5 py-2 bg-cream-100 hover:bg-cream-200 text-espresso-900 font-bold text-xs rounded-xl transition-colors"
              >
                Categories
              </button>
              <button
                onClick={() => setIsAddingItem(!isAddingItem)}
                className="px-4 py-2 bg-espresso-900 hover:bg-espresso-800 text-white font-bold text-xs rounded-xl shadow-warm flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingItem ? 'Cancel' : 'Add Item'}</span>
              </button>
            </div>
          </div>

          {/* Category Manager Drawer */}
          {showCategoryManager && (
            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-3 animate-in fade-in">
              <h3 className="font-bold text-xs text-espresso-950 uppercase tracking-wider">
                Manage Menu Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {customCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-cream-300 rounded-xl text-xs font-semibold text-espresso-900"
                  >
                    <span>{cat}</span>
                    <button
                      onClick={() => setCustomCategories(customCategories.filter((c) => c !== cat))}
                      className="text-rose-500 hover:text-rose-700"
                      title="Remove category"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 max-w-sm pt-1">
                <input
                  type="text"
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  placeholder="New category name..."
                  className="flex-1 bg-white border border-cream-200 rounded-xl px-3 py-1.5 text-xs outline-none"
                />
                <button
                  onClick={() => {
                    if (newCatInput.trim() && !customCategories.includes(newCatInput.trim())) {
                      setCustomCategories([...customCategories, newCatInput.trim()]);
                      setNewCatInput('');
                    }
                  }}
                  className="px-3.5 py-1.5 bg-espresso-900 text-white font-bold text-xs rounded-xl"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Add New Item Form */}
          {isAddingItem && (
            <form
              onSubmit={handleCreateMenuItem}
              className="p-6 bg-cream-50 rounded-3xl border border-cream-200 space-y-4 animate-in fade-in"
            >
              <h3 className="font-serif font-bold text-base text-espresso-950">
                Add New Menu Item to {myCafe.name}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-espresso-900">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. Lavender Honey Cold Brew"
                    className="w-full mt-1 bg-white border border-cream-200 rounded-xl px-3.5 py-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-espresso-900">Category *</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full mt-1 bg-white border border-cream-200 rounded-xl px-3.5 py-2 text-xs outline-none cursor-pointer"
                  >
                    {customCategories.map((cat) => (
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
                    min={1}
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(Number(e.target.value))}
                    className="w-full mt-1 bg-white border border-cream-200 rounded-xl px-3.5 py-2 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-espresso-900">Upload Image / Photo</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, (url) => setNewItemImg(url));
                        }
                      }}
                      className="text-xs text-coffee-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-espresso-900 file:text-white hover:file:bg-espresso-800"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-espresso-900">Description</label>
                <textarea
                  rows={2}
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="Rich single-origin espresso steeped for 16 hours..."
                  className="w-full mt-1 bg-white border border-cream-200 rounded-xl p-3 text-xs outline-none"
                />
              </div>

              <div className="flex items-center gap-6">
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

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs rounded-xl shadow-warm transition-all"
                >
                  Save & Publish Item
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingItem(false)}
                  className="px-4 py-2.5 bg-cream-200 hover:bg-cream-300 text-espresso-900 font-bold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'All'
                  ? 'bg-espresso-900 text-white shadow-xs'
                  : 'bg-cream-100 text-coffee-700 hover:bg-cream-200'
              }`}
            >
              All Items ({cafeMenu.length})
            </button>
            {customCategories.map((cat) => {
              const count = cafeMenu.filter((m) => m.category_name?.toLowerCase() === cat.toLowerCase()).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-espresso-900 text-white shadow-xs'
                      : 'bg-cream-100 text-coffee-700 hover:bg-cream-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMenu.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-cream-200 bg-white flex items-center justify-between gap-4 text-xs shadow-xs hover:border-cream-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-14 h-14 rounded-2xl object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <VegNonVegIndicator isVeg={item.is_veg} />
                      <h4 className="font-bold text-sm text-espresso-950">{item.name}</h4>
                    </div>
                    <p className="text-coffee-500 text-[11px] line-clamp-1 mt-0.5">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-espresso-900">₹{item.price}</span>
                      <span className="text-[10px] text-coffee-400 bg-cream-100 px-2 py-0.5 rounded-full">
                        {item.category_name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Availability toggle */}
                  <button
                    onClick={() => toggleItemAvailability(item.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                      item.is_available
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {item.is_available ? 'In Stock' : 'Sold Out'}
                  </button>

                  {/* Edit Item Modal Trigger */}
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 text-coffee-600 hover:text-espresso-900 hover:bg-cream-100 rounded-xl transition-colors"
                    title="Edit Item"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete Item */}
                  <button
                    onClick={() => deleteMenuItem(item.id)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Item Modal */}
          {editingItem && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-warm-xl border border-cream-200 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-cream-100">
                  <h3 className="font-serif font-bold text-lg text-espresso-950">
                    Edit Menu Item
                  </h3>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="p-1.5 text-coffee-400 hover:text-espresso-900 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEditedItem} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-espresso-900">Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full mt-1 bg-cream-50 border border-cream-200 rounded-xl px-3 py-2 outline-none font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-espresso-900">Category</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full mt-1 bg-cream-50 border border-cream-200 rounded-xl px-3 py-2 outline-none font-medium"
                      >
                        {customCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-espresso-900">Price (₹)</label>
                      <input
                        type="number"
                        required
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        className="w-full mt-1 bg-cream-50 border border-cream-200 rounded-xl px-3 py-2 outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-espresso-900">Image</label>
                    <div className="flex items-center gap-3 mt-1">
                      <img src={editImg} alt="Preview" className="w-12 h-12 rounded-xl object-cover border" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, (url) => setEditImg(url));
                        }}
                        className="text-xs text-coffee-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-espresso-900 file:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-espresso-900">Description</label>
                    <textarea
                      rows={2}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full mt-1 bg-cream-50 border border-cream-200 rounded-xl p-2.5 outline-none font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-1">
                    <label className="flex items-center gap-2 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editVeg}
                        onChange={(e) => setEditVeg(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>Vegetarian</span>
                    </label>

                    <label className="flex items-center gap-2 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editAvailable}
                        onChange={(e) => setEditAvailable(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>In Stock & Available</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-cream-100">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-espresso-900 font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-espresso-900 hover:bg-espresso-800 text-white font-bold rounded-xl shadow-warm"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: CAFE PROFILE                                             */}
      {/* ============================================================== */}
      {activeTab === 'cafe' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
          <div className="pb-3 border-b border-cream-100">
            <h2 className="font-serif font-bold text-xl text-espresso-950">
              Cafe Profile & Visual Showcase
            </h2>
            <p className="text-xs text-coffee-500 mt-0.5">
              Upload storefront photography, manage operating hours, contact details, and visitor amenities.
            </p>
          </div>

          {cafeSaved && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Cafe profile & photographs saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveCafe} className="space-y-6">
            {/* Visual Photography Upload Section */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-espresso-900 block">
                Primary Storefront Cover Photo
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-cream-50 rounded-2xl border border-cream-200">
                <img
                  src={coverImage}
                  alt={cafeName}
                  className="w-full sm:w-44 h-28 rounded-xl object-cover border border-cream-300"
                />
                <div className="space-y-2 text-xs">
                  <p className="text-coffee-600">
                    Upload a high-resolution hero photo for your cafe directory card.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, (url) => setCoverImage(url));
                    }}
                    className="text-xs text-coffee-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-espresso-900 file:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Gallery Photos */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-espresso-900 block">
                Gallery Photos ({galleryImages.length})
              </label>
              <div className="flex flex-wrap gap-3">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-cream-300">
                    <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </button>
                  </div>
                ))}

                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-cream-300 hover:border-amber-600 flex flex-col items-center justify-center cursor-pointer text-coffee-500 hover:text-amber-700 transition-colors">
                  <Upload className="w-5 h-5" />
                  <span className="text-[9px] font-bold mt-1">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, (url) => setGalleryImages([...galleryImages, url]));
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Name & Tagline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-espresso-900">Cafe Name *</label>
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

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-espresso-900">About / Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mt-1.5 bg-cream-50 border border-cream-200 rounded-xl p-3.5 text-xs outline-none leading-relaxed"
              />
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-bold text-espresso-900">Physical Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full mt-1.5 bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-xs outline-none"
              />
            </div>

            {/* Hours */}
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

            {/* Contact */}
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
                <label className="text-xs font-bold text-espresso-900">Contact Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1.5 bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-xs outline-none"
                />
              </div>
            </div>

            {/* Amenities Management */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-espresso-900 block">
                Amenities & Guest Features
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_AMENITY_OPTIONS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleAmenity(item.key)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-colors ${
                      amenities.includes(item.key)
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-cream-50 border-cream-200 text-coffee-600'
                    }`}
                  >
                    <span>{item.label}</span>
                    {amenities.includes(item.key) && <Check className="w-3.5 h-3.5 text-amber-700" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs rounded-xl shadow-warm transition-all"
            >
              Save Cafe Profile
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: DINER REVIEWS                                            */}
      {/* ============================================================== */}
      {activeTab === 'reviews' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
          <div className="pb-3 border-b border-cream-100">
            <h2 className="font-serif font-bold text-xl text-espresso-950">
              Customer Reviews & Responses
            </h2>
            <p className="text-xs text-coffee-500 mt-0.5">
              Build loyalty and reply directly to diner experiences at {myCafe.name}.
            </p>
          </div>

          {cafeReviews.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <MessageSquare className="w-10 h-10 text-cream-400 mx-auto" />
              <p className="text-sm font-semibold text-espresso-900">No diner reviews yet.</p>
              <p className="text-xs text-coffee-500">Diners will share feedback after visiting your cafe.</p>
            </div>
          ) : (
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
                        Your Merchant Reply:
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
                        placeholder="Write a personalized response to this diner..."
                        className="flex-1 bg-white border border-cream-200 rounded-xl px-3 py-1.5 text-xs outline-none"
                      />
                      <button
                        onClick={() => handleSendReply(rev.id)}
                        className="px-4 py-1.5 bg-espresso-900 text-white font-bold rounded-xl text-xs hover:bg-espresso-800"
                      >
                        Post Reply
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: SALES & ANALYTICS                                        */}
      {/* ============================================================== */}
      {activeTab === 'analytics' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
          <div className="pb-3 border-b border-cream-100">
            <h2 className="font-serif font-bold text-xl text-espresso-950">
              Live Sales & Analytics
            </h2>
            <p className="text-xs text-coffee-500 mt-0.5">
              Dynamic operational statistics computed directly from {myCafe.name}'s transaction history.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Selling Offerings */}
            <div className="p-5 bg-cream-50 rounded-2xl border border-cream-200 space-y-3">
              <h3 className="font-serif font-bold text-sm text-espresso-950">
                Top Selling Offerings
              </h3>
              {topSellingItems.length === 0 ? (
                <p className="text-xs text-coffee-500 py-4">No item orders recorded yet.</p>
              ) : (
                <div className="space-y-2 text-xs">
                  {topSellingItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between font-medium py-1 border-b border-cream-200/50">
                      <span>{idx + 1}. {item.name}</span>
                      <span className="font-bold text-espresso-900">
                        {item.count} orders (₹{item.revenue})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Fulfillment Breakdown */}
            <div className="p-5 bg-cream-50 rounded-2xl border border-cream-200 space-y-3">
              <h3 className="font-serif font-bold text-sm text-espresso-950">
                Fulfillment Channels
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-medium">
                  <span>Dine-In Table Orders</span>
                  <span className="font-bold">
                    {cafeOrders.filter((o) => o.order_type === 'dine_in').length} orders
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Takeaway Pickups</span>
                  <span className="font-bold">
                    {cafeOrders.filter((o) => o.order_type === 'pickup').length} orders
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Home Delivery</span>
                  <span className="font-bold">
                    {cafeOrders.filter((o) => o.order_type === 'delivery').length} orders
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 8: STORE SETTINGS                                           */}
      {/* ============================================================== */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
          <div className="pb-3 border-b border-cream-100">
            <h2 className="font-serif font-bold text-xl text-espresso-950">
              Store & Operations Settings
            </h2>
            <p className="text-xs text-coffee-500 mt-0.5">
              Configure store availability, dining room capacity, and billing defaults.
            </p>
          </div>

          {settingsSaved && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Store settings saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl text-xs">
            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-espresso-900">Store Ordering Status</p>
                <p className="text-coffee-500 text-[11px]">When disabled, customers cannot place new orders.</p>
              </div>
              <button
                type="button"
                onClick={() => setStoreOpen(!storeOpen)}
                className={`px-4 py-1.5 rounded-full font-bold transition-colors ${
                  storeOpen ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {storeOpen ? 'Open' : 'Closed'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-espresso-900 block mb-1">Dine-in Tables Count</label>
                <input
                  type="number"
                  value={tableCount}
                  onChange={(e) => setTableCount(Number(e.target.value))}
                  className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-espresso-900 block mb-1">Applicable GST / Tax (%)</label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2 outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-espresso-900">Auto-Confirm Incoming Orders</p>
                <p className="text-coffee-500 text-[11px]">Automatically mark newly placed orders as confirmed.</p>
              </div>
              <input
                type="checkbox"
                checked={autoConfirmOrders}
                onChange={(e) => setAutoConfirmOrders(e.target.checked)}
                className="w-5 h-5 text-amber-600 rounded"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-espresso-900 hover:bg-espresso-800 text-white font-bold rounded-xl shadow-warm"
            >
              Save Store Settings
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
