import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Cafe,
  MenuItem,
  Order,
  OrderStatus,
  Reservation,
  ReservationStatus,
  Review,
  InAppNotification,
  OrderType,
} from '../types';
import {
  SEED_CAFES,
  generateAllMenuItems,
  SEED_ORDERS,
  SEED_RESERVATIONS,
  SEED_REVIEWS,
  SEED_NOTIFICATIONS,
} from '../data/seedData';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ownerService } from '../services/ownerService';
import { orderService } from '../services/orderService';
import { reservationService } from '../services/reservationService';
import { reviewService } from '../services/reviewService';

interface DataContextType {
  // Public or role-filtered collections
  cafes: Cafe[];
  menuItems: MenuItem[];
  orders: Order[];
  reservations: Reservation[];
  reviews: Review[];
  favorites: string[];
  notifications: InAppNotification[];
  refreshData: () => Promise<void>;

  // Cafe operations (Strictly Authorized)
  addCafe: (cafe: Omit<Cafe, 'id' | 'created_at' | 'rating' | 'review_count' | 'owner_id' | 'is_approved'> & { is_approved?: boolean }) => Promise<{ success: boolean; cafe?: Cafe; error?: string }>;
  updateCafe: (id: string, updates: Partial<Cafe>) => Promise<{ success: boolean; error?: string }>;
  syncOwnerCafe: (cafe: Cafe) => void;
  approveCafe: (id: string) => Promise<{ success: boolean; error?: string }>;
  rejectCafe: (id: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  suspendCafe: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Menu operations (Owner/Admin only)
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<{ success: boolean; item?: MenuItem; error?: string }>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<{ success: boolean; error?: string }>;
  deleteMenuItem: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleItemAvailability: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Orders (Customer creates; Owner/Admin manages)
  createOrder: (orderData: {
    cafe_id: string;
    order_type: OrderType;
    items: {
      menu_item_id: string;
      quantity: number;
      customizations?: Record<string, string>;
    }[];
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    delivery_address?: string;
    delivery_city?: string;
    delivery_postal_code?: string;
    dine_in_table?: string;
    notes?: string;
    payment_method?: 'UPI / Card' | 'Cash on Pickup' | 'Card at Cafe';
  }) => Promise<{ success: boolean; order?: Order; error?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<{ success: boolean; error?: string }>;

  // Reservations
  createReservation: (resData: {
    cafe_id: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    guest_count: number;
    reservation_date: string;
    reservation_time: string;
    special_requests?: string;
  }) => Promise<{ success: boolean; reservation?: Reservation; error?: string }>;
  updateReservationStatus: (resId: string, status: ReservationStatus) => Promise<{ success: boolean; error?: string }>;
  cancelReservation: (resId: string) => Promise<{ success: boolean; error?: string }>;

  // Favorites
  toggleFavorite: (cafeId: string) => void;
  isFavorite: (cafeId: string) => boolean;

  // Reviews
  addReview: (reviewData: {
    cafe_id: string;
    rating: number;
    comment: string;
  }) => Promise<{ success: boolean; error?: string }>;
  replyToReview: (reviewId: string, response: string) => Promise<{ success: boolean; error?: string }>;
  deleteReview: (reviewId: string) => Promise<{ success: boolean; error?: string }>;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (title: string, message: string, type: 'order' | 'reservation' | 'cafe' | 'system', link?: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'cafehub_secure_data_store_v2';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached cafehub data:', e);
      }
    }

    const initialCafes = SEED_CAFES;
    const initialMenuItems = generateAllMenuItems(initialCafes);

    return {
      cafes: initialCafes,
      menuItems: initialMenuItems,
      orders: SEED_ORDERS,
      reservations: SEED_RESERVATIONS,
      reviews: SEED_REVIEWS,
      favorites: ['cafe-1', 'cafe-2'],
      notifications: SEED_NOTIFICATIONS,
    };
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Synchronize with Supabase database
  const refreshData = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    try {
      const [cafesRes, menuItemsRes, ordersRes, resRes, revsRes] = await Promise.all([
        supabase.from('cafes').select('*'),
        supabase.from('menu_items').select('*'),
        orderService.getOrders({
          userId: user?.id,
          role: user?.role,
          ownedCafeIds: user?.role === 'cafe_owner'
            ? data.cafes.filter((c: Cafe) => c.owner_id === user.id).map((c: Cafe) => c.id)
            : undefined,
        }),
        reservationService.getReservations({
          userId: user?.id,
          role: user?.role,
          ownedCafeIds: user?.role === 'cafe_owner'
            ? data.cafes.filter((c: Cafe) => c.owner_id === user.id).map((c: Cafe) => c.id)
            : undefined,
        }),
        reviewService.getReviews(),
      ]);

      setData((prev: typeof data) => {
        let nextCafes = prev.cafes;
        if (cafesRes.data && cafesRes.data.length > 0) {
          const dbCafeMap = new Map(cafesRes.data.map((c: any) => [c.id, c]));
          nextCafes = [
            ...cafesRes.data,
            ...prev.cafes.filter((c: Cafe) => !dbCafeMap.has(c.id)),
          ];
        }

        let nextMenuItems = prev.menuItems;
        if (menuItemsRes.data && menuItemsRes.data.length > 0) {
          const dbItemMap = new Map(menuItemsRes.data.map((i: any) => [i.id, i]));
          nextMenuItems = [
            ...menuItemsRes.data,
            ...prev.menuItems.filter((i: MenuItem) => !dbItemMap.has(i.id)),
          ];
        }

        let nextOrders = prev.orders;
        if (ordersRes.success && ordersRes.orders) {
          const orderMap = new Map(ordersRes.orders.map((o: Order) => [o.id, o]));
          nextOrders = [
            ...ordersRes.orders,
            ...prev.orders.filter((o: Order) => !orderMap.has(o.id)),
          ];
        }

        let nextReservations = prev.reservations;
        if (resRes.success && resRes.reservations) {
          const resMap = new Map(resRes.reservations.map((r: Reservation) => [r.id, r]));
          nextReservations = [
            ...resRes.reservations,
            ...prev.reservations.filter((r: Reservation) => !resMap.has(r.id)),
          ];
        }

        let nextReviews = prev.reviews;
        if (revsRes.success && revsRes.reviews) {
          const revMap = new Map(revsRes.reviews.map((r: Review) => [r.id, r]));
          nextReviews = [
            ...revsRes.reviews,
            ...prev.reviews.filter((r: Review) => !revMap.has(r.id)),
          ];
        }

        return {
          ...prev,
          cafes: nextCafes,
          menuItems: nextMenuItems,
          orders: nextOrders,
          reservations: nextReservations,
          reviews: nextReviews,
        };
      });
    } catch (err) {
      console.warn('DataContext Supabase synchronization error:', err);
    }
  }, [user]);

  useEffect(() => {
    refreshData();

    if (isSupabaseConfigured) {
      // Wire up Supabase Realtime channel for live customer <-> owner synchronization
      const channel = supabase
        .channel('cafehub_realtime_data')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          refreshData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
          refreshData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
          refreshData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cafes' }, () => {
          refreshData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [refreshData]);

  // Find cafes owned by current user (if cafe_owner)
  const myOwnedCafeIds = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return data.cafes.map((c: Cafe) => c.id);
    return data.cafes.filter((c: Cafe) => c.owner_id === user.id).map((c: Cafe) => c.id);
  }, [data.cafes, user]);

  // -------------------------------------------------------------
  // SECURE ROLE-BASED ACCESS CONTROL FOR QUERIES
  // -------------------------------------------------------------

  // Cafes:
  // Public/Customer can only view approved cafes.
  // Cafe Owner can view approved cafes + their own unapproved cafe.
  // Admin can view all cafes.
  const authorizedCafes = useMemo(() => {
    if (!user) {
      return data.cafes.filter((c: Cafe) => c.is_approved && (!c.status || c.status === 'approved'));
    }
    if (user.role === 'admin') {
      return data.cafes;
    }
    if (user.role === 'cafe_owner') {
      return data.cafes.filter((c: Cafe) => (c.is_approved && (!c.status || c.status === 'approved')) || c.owner_id === user.id);
    }
    return data.cafes.filter((c: Cafe) => c.is_approved && (!c.status || c.status === 'approved'));
  }, [data.cafes, user]);

  // Orders:
  // Customers only see their own orders.
  // Cafe owners only see orders for cafes they own.
  // Admins see all platform orders.
  // Logged-out users see zero orders.
  const authorizedOrders = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return data.orders;
    if (user.role === 'cafe_owner') {
      return data.orders.filter((o: Order) => myOwnedCafeIds.includes(o.cafe_id));
    }
    // Customer
    return data.orders.filter((o: Order) => o.user_id === user.id);
  }, [data.orders, user, myOwnedCafeIds]);

  // Reservations:
  // Customers only see their own reservations.
  // Cafe owners only see reservations for their cafes.
  // Admins see all platform reservations.
  // Logged-out users see zero reservations.
  const authorizedReservations = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return data.reservations;
    if (user.role === 'cafe_owner') {
      return data.reservations.filter((r: Reservation) => myOwnedCafeIds.includes(r.cafe_id));
    }
    // Customer
    return data.reservations.filter((r: Reservation) => r.user_id === user.id);
  }, [data.reservations, user, myOwnedCafeIds]);

  // Notifications: Isolated per user
  const authorizedNotifications = useMemo(() => {
    if (!user) return [];
    return data.notifications.filter((n: InAppNotification) => n.user_id === user.id || n.user_id === 'current-user');
  }, [data.notifications, user]);

  // -------------------------------------------------------------
  // SECURE MUTATIONS & AUTHORIZATION CHECKS
  // -------------------------------------------------------------

  const addNotification = (
    title: string,
    message: string,
    type: 'order' | 'reservation' | 'cafe' | 'system',
    link?: string
  ) => {
    if (!user) return;
    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}`,
      user_id: user.id,
      title,
      message,
      type,
      is_read: false,
      link,
      created_at: 'Just now',
    };
    setData((prev: typeof data) => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications],
    }));
  };

  const markNotificationRead = (id: string) => {
    setData((prev: typeof data) => ({
      ...prev,
      notifications: prev.notifications.map((n: InAppNotification) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
    }));
  };

  const markAllNotificationsRead = () => {
    setData((prev: typeof data) => ({
      ...prev,
      notifications: prev.notifications.map((n: InAppNotification) => ({ ...n, is_read: true })),
    }));
  };

  // Cafe operations
  const addCafe = async (newCafeData: Omit<Cafe, 'id' | 'created_at' | 'rating' | 'review_count' | 'owner_id' | 'is_approved'> & { is_approved?: boolean }) => {
    if (!user) {
      return { success: false, error: 'Authentication required: Please log in to list a cafe.' };
    }
    if (user.role !== 'cafe_owner' && user.role !== 'admin') {
      return { success: false, error: 'Forbidden: Only cafe owners or administrators can list new cafes.' };
    }

    if (isSupabaseConfigured) {
      const dbRes = await ownerService.createOwnerCafe({
        owner_id: user.id,
        name: newCafeData.name,
        tagline: newCafeData.tagline,
        description: newCafeData.description,
        address: newCafeData.address,
        city: newCafeData.city,
        state: newCafeData.state,
        postal_code: newCafeData.postal_code,
        phone: newCafeData.phone,
        email: newCafeData.email,
        cover_image: newCafeData.cover_image,
      });

      if (!dbRes.success || !dbRes.cafe) {
        return { success: false, error: dbRes.error || 'Failed to create cafe in Supabase database' };
      }

      setData((prev: typeof data) => ({
        ...prev,
        cafes: [dbRes.cafe!, ...prev.cafes],
      }));

      addNotification(
        'New Cafe Submitted ☕',
        `${dbRes.cafe.name} has been created and saved to the database.`,
        'cafe',
        `/cafes/${dbRes.cafe.id}`
      );

      return { success: true, cafe: dbRes.cafe };
    }

    // Local fallback
    const newCafe: Cafe = {
      ...newCafeData,
      id: `cafe-${Date.now()}`,
      owner_id: user.id,
      rating: 5.0,
      review_count: 0,
      is_approved: user.role === 'admin',
      status: user.role === 'admin' ? 'approved' : 'draft',
      created_at: new Date().toISOString(),
    };

    setData((prev: typeof data) => ({
      ...prev,
      cafes: [newCafe, ...prev.cafes],
    }));

    addNotification(
      'New Cafe Submitted ☕',
      `${newCafe.name} has been submitted and is pending administrative approval.`,
      'cafe',
      `/cafes/${newCafe.id}`
    );

    return { success: true, cafe: newCafe };
  };

  const updateCafe = async (id: string, updates: Partial<Cafe>) => {
    if (!user) {
      return { success: false, error: 'Authentication required.' };
    }

    const targetCafe = data.cafes.find((c: Cafe) => c.id === id);
    if (!targetCafe) {
      return { success: false, error: 'Cafe not found.' };
    }

    if (user.role !== 'admin' && targetCafe.owner_id !== user.id) {
      return { success: false, error: 'Access Denied: You do not have permission to manage this cafe.' };
    }

    const safeUpdates = { ...updates };
    if (user.role !== 'admin') {
      delete safeUpdates.is_approved;
      delete safeUpdates.owner_id;
      delete safeUpdates.rejection_reason;
      delete safeUpdates.approved_at;
    }

    if (isSupabaseConfigured) {
      const dbRes = await ownerService.updateOwnerCafe(id, safeUpdates);
      if (!dbRes.success) {
        return { success: false, error: dbRes.error || 'Failed to update cafe in database' };
      }
    }

    setData((prev: typeof data) => ({
      ...prev,
      cafes: prev.cafes.map((c: Cafe) => (c.id === id ? { ...c, ...safeUpdates } : c)),
    }));

    return { success: true };
  };

  const syncOwnerCafe = (updatedCafe: Cafe) => {
    setData((prev: typeof data) => {
      const exists = prev.cafes.some((c: Cafe) => c.id === updatedCafe.id);
      return {
        ...prev,
        cafes: exists
          ? prev.cafes.map((c: Cafe) => (c.id === updatedCafe.id ? { ...c, ...updatedCafe } : c))
          : [updatedCafe, ...prev.cafes],
      };
    });
  };

  const approveCafe = async (id: string) => {
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Access Denied: Only administrators can approve cafes.' };
    }

    const res = await ownerService.adminApproveCafe(id);
    if (!res.success) {
      return { success: false, error: res.error || 'Failed to approve cafe' };
    }

    setData((prev: typeof data) => ({
      ...prev,
      cafes: prev.cafes.map((c: Cafe) =>
        c.id === id
          ? { ...c, is_approved: true, status: 'approved', approved_at: new Date().toISOString() }
          : c
      ),
    }));

    return { success: true };
  };

  const rejectCafe = async (id: string, reason: string) => {
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Access Denied: Only administrators can reject cafes.' };
    }

    const res = await ownerService.adminRejectCafe(id, reason);
    if (!res.success) {
      return { success: false, error: res.error || 'Failed to reject cafe' };
    }

    setData((prev: typeof data) => ({
      ...prev,
      cafes: prev.cafes.map((c: Cafe) =>
        c.id === id
          ? { ...c, is_approved: false, status: 'rejected', rejection_reason: reason.trim() }
          : c
      ),
    }));

    return { success: true };
  };

  const suspendCafe = async (id: string) => {
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Access Denied: Only administrators can suspend cafes.' };
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('cafes')
        .update({
          is_approved: false,
          status: 'suspended',
        })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }
    }

    setData((prev: typeof data) => ({
      ...prev,
      cafes: prev.cafes.map((c: Cafe) =>
        c.id === id ? { ...c, is_approved: false, status: 'suspended' } : c
      ),
    }));

    return { success: true };
  };

  // Menu operations
  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    if (!user) {
      return { success: false, error: 'Authentication required.' };
    }

    const targetCafe = data.cafes.find((c: Cafe) => c.id === item.cafe_id);
    if (!targetCafe) {
      return { success: false, error: 'Target cafe does not exist.' };
    }

    if (user.role !== 'admin' && targetCafe.owner_id !== user.id) {
      return { success: false, error: 'Access Denied: You cannot modify another owner’s menu.' };
    }

    if (isSupabaseConfigured) {
      const dbRes = await ownerService.createMenuItem(item);
      if (!dbRes.success || !dbRes.item) {
        return { success: false, error: dbRes.error || 'Failed to save menu item to database' };
      }

      setData((prev: typeof data) => ({
        ...prev,
        menuItems: [dbRes.item!, ...prev.menuItems],
      }));

      return { success: true, item: dbRes.item };
    }

    const newItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`,
    };

    setData((prev: typeof data) => ({
      ...prev,
      menuItems: [newItem, ...prev.menuItems],
    }));

    return { success: true, item: newItem };
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    if (!user) {
      return { success: false, error: 'Authentication required.' };
    }

    const targetItem = data.menuItems.find((m: MenuItem) => m.id === id);
    if (!targetItem) {
      return { success: false, error: 'Menu item not found.' };
    }

    const targetCafe = data.cafes.find((c: Cafe) => c.id === targetItem.cafe_id);
    if (user.role !== 'admin' && targetCafe?.owner_id !== user.id) {
      return { success: false, error: 'Access Denied: You cannot modify another owner’s menu item.' };
    }

    if (isSupabaseConfigured) {
      const dbRes = await ownerService.updateMenuItem(id, updates);
      if (!dbRes.success) {
        return { success: false, error: dbRes.error || 'Failed to update menu item in database' };
      }
    }

    setData((prev: typeof data) => ({
      ...prev,
      menuItems: prev.menuItems.map((m: MenuItem) => (m.id === id ? { ...m, ...updates } : m)),
    }));

    return { success: true };
  };

  const deleteMenuItem = async (id: string) => {
    if (!user) {
      return { success: false, error: 'Authentication required.' };
    }

    const targetItem = data.menuItems.find((m: MenuItem) => m.id === id);
    if (!targetItem) {
      return { success: false, error: 'Menu item not found.' };
    }

    const targetCafe = data.cafes.find((c: Cafe) => c.id === targetItem.cafe_id);
    if (user.role !== 'admin' && targetCafe?.owner_id !== user.id) {
      return { success: false, error: 'Access Denied: You cannot delete another owner’s menu item.' };
    }

    if (isSupabaseConfigured) {
      const dbRes = await ownerService.deleteMenuItem(id);
      if (!dbRes.success) {
        return { success: false, error: dbRes.error || 'Failed to delete menu item from database' };
      }
    }

    setData((prev: typeof data) => ({
      ...prev,
      menuItems: prev.menuItems.filter((m: MenuItem) => m.id !== id),
    }));

    return { success: true };
  };

  const toggleItemAvailability = async (id: string) => {
    if (!user) return { success: false, error: 'Authentication required.' };

    const targetItem = data.menuItems.find((m: MenuItem) => m.id === id);
    if (!targetItem) return { success: false, error: 'Menu item not found.' };

    const targetCafe = data.cafes.find((c: Cafe) => c.id === targetItem.cafe_id);
    if (user.role !== 'admin' && targetCafe?.owner_id !== user.id) {
      return { success: false, error: 'Access Denied: You cannot change availability for another cafe.' };
    }

    const nextAvailability = !targetItem.is_available;

    if (isSupabaseConfigured) {
      const dbRes = await ownerService.updateMenuItemAvailability(id, nextAvailability);
      if (!dbRes.success) {
        return { success: false, error: dbRes.error || 'Failed to toggle availability in database' };
      }
    }

    setData((prev: typeof data) => ({
      ...prev,
      menuItems: prev.menuItems.map((m: MenuItem) =>
        m.id === id ? { ...m, is_available: nextAvailability } : m
      ),
    }));

    return { success: true };
  };

  // Orders: Complete with server validation & Supabase persistence
  const createOrder = async (orderData: {
    cafe_id: string;
    order_type: OrderType;
    items: {
      menu_item_id: string;
      quantity: number;
      customizations?: Record<string, string>;
    }[];
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    delivery_address?: string;
    delivery_city?: string;
    delivery_postal_code?: string;
    dine_in_table?: string;
    notes?: string;
    payment_method?: 'UPI / Card' | 'Cash on Pickup' | 'Card at Cafe';
  }) => {
    if (!user) {
      return { success: false, error: 'Authentication required: Please log in to complete your order.' };
    }

    const res = await orderService.createOrder({
      userId: user.id,
      cafeId: orderData.cafe_id,
      orderType: orderData.order_type,
      items: orderData.items.map((i) => ({
        menuItemId: i.menu_item_id,
        quantity: i.quantity,
        customizations: i.customizations,
      })),
      customerName: orderData.customer_name,
      customerPhone: orderData.customer_phone,
      customerEmail: orderData.customer_email,
      deliveryAddress: orderData.delivery_address,
      deliveryCity: orderData.delivery_city,
      deliveryPostalCode: orderData.delivery_postal_code,
      dineInTable: orderData.dine_in_table,
      notes: orderData.notes,
      paymentMethod: orderData.payment_method || 'UPI / Card',
    });

    if (!res.success || !res.order) {
      return { success: false, error: res.error || 'Failed to create order.' };
    }

    const newOrder = res.order;

    setData((prev: typeof data) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
    }));

    addNotification(
      'Order Confirmed! 🛍️',
      `Order #${newOrder.order_number} placed with ${newOrder.cafe_name}. Total: ₹${newOrder.total_amount}.`,
      'order',
      '/orders'
    );

    return { success: true, order: newOrder };
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (!user) {
      return { success: false, error: 'Authentication required.' };
    }

    const res = await orderService.updateOrderStatus(orderId, status, {
      userId: user.id,
      role: user.role,
      ownedCafeIds: myOwnedCafeIds,
    });

    if (!res.success) {
      return { success: false, error: res.error };
    }

    setData((prev: typeof data) => ({
      ...prev,
      orders: prev.orders.map((o: Order) => (o.id === orderId ? { ...o, status } : o)),
    }));

    return { success: true };
  };

  // Reservations: Complete with Supabase persistence
  const createReservation = async (resData: {
    cafe_id: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    guest_count: number;
    reservation_date: string;
    reservation_time: string;
    special_requests?: string;
  }) => {
    if (!user) {
      return { success: false, error: 'Authentication required: Please log in to book a table.' };
    }

    const res = await reservationService.createReservation({
      userId: user.id,
      cafeId: resData.cafe_id,
      guestName: resData.guest_name,
      guestEmail: resData.guest_email,
      guestPhone: resData.guest_phone,
      guestCount: resData.guest_count,
      reservationDate: resData.reservation_date,
      reservationTime: resData.reservation_time,
      specialRequests: resData.special_requests,
    });

    if (!res.success || !res.reservation) {
      return { success: false, error: res.error || 'Failed to book table.' };
    }

    const newRes = res.reservation;

    setData((prev: typeof data) => ({
      ...prev,
      reservations: [newRes, ...prev.reservations],
    }));

    addNotification(
      'Table Reserved! 🍽️',
      `Table for ${newRes.guest_count} booked at ${newRes.cafe_name} on ${newRes.reservation_date} at ${newRes.reservation_time}.`,
      'reservation',
      '/reservations'
    );

    return { success: true, reservation: newRes };
  };

  const updateReservationStatus = async (resId: string, status: ReservationStatus) => {
    if (!user) return { success: false, error: 'Authentication required.' };

    const res = await reservationService.updateReservationStatus(resId, status, {
      userId: user.id,
      role: user.role,
      ownedCafeIds: myOwnedCafeIds,
    });

    if (!res.success) {
      return { success: false, error: res.error };
    }

    setData((prev: typeof data) => ({
      ...prev,
      reservations: prev.reservations.map((r: Reservation) =>
        r.id === resId ? { ...r, status } : r
      ),
    }));

    return { success: true };
  };

  const cancelReservation = async (resId: string) => {
    return updateReservationStatus(resId, 'cancelled');
  };

  // Favorites
  const toggleFavorite = (cafeId: string) => {
    if (!user) return;
    setData((prev: typeof data) => {
      const isFav = prev.favorites.includes(cafeId);
      const nextFavs = isFav
        ? prev.favorites.filter((id: string) => id !== cafeId)
        : [...prev.favorites, cafeId];
      return {
        ...prev,
        favorites: nextFavs,
      };
    });
  };

  const isFavorite = (cafeId: string) => {
    if (!user) return false;
    return data.favorites.includes(cafeId);
  };

  // Reviews
  const addReview = async (reviewData: {
    cafe_id: string;
    rating: number;
    comment: string;
  }) => {
    if (!user) {
      return { success: false, error: 'Authentication required to write reviews.' };
    }

    const res = await reviewService.addReview({
      userId: user.id,
      cafeId: reviewData.cafe_id,
      rating: reviewData.rating,
      comment: reviewData.comment,
      userName: user.full_name,
      userAvatar: user.avatar_url,
    });

    if (!res.success || !res.review) {
      return { success: false, error: res.error || 'Failed to publish review.' };
    }

    const savedReview = res.review;

    setData((prev: typeof data) => {
      const existingIdx = prev.reviews.findIndex(
        (r: Review) => r.user_id === user.id && r.cafe_id === reviewData.cafe_id
      );
      let updatedReviews: Review[];
      if (existingIdx > -1) {
        updatedReviews = prev.reviews.map((r: Review, i: number) =>
          i === existingIdx ? savedReview : r
        );
      } else {
        updatedReviews = [savedReview, ...prev.reviews];
      }

      const cafeReviews = updatedReviews.filter((r) => r.cafe_id === reviewData.cafe_id);
      const avgRating =
        cafeReviews.reduce((sum, r) => sum + r.rating, 0) / (cafeReviews.length || 1);

      const updatedCafes = prev.cafes.map((c: Cafe) =>
        c.id === reviewData.cafe_id
          ? {
              ...c,
              rating: Number(avgRating.toFixed(1)),
              review_count: cafeReviews.length,
            }
          : c
      );

      return {
        ...prev,
        reviews: updatedReviews,
        cafes: updatedCafes,
      };
    });

    addNotification('Review Published ⭐', 'Thank you for your rating and review on CafeHub!', 'system');
    return { success: true };
  };

  const replyToReview = async (reviewId: string, response: string) => {
    if (!user) return { success: false, error: 'Authentication required.' };

    const res = await reviewService.replyToReview(reviewId, response, {
      userId: user.id,
      role: user.role,
      ownedCafeIds: myOwnedCafeIds,
    });

    if (!res.success) {
      return { success: false, error: res.error };
    }

    setData((prev: typeof data) => ({
      ...prev,
      reviews: prev.reviews.map((r: Review) =>
        r.id === reviewId
          ? { ...r, owner_response: response, owner_responded_at: new Date().toISOString() }
          : r
      ),
    }));

    return { success: true };
  };

  const deleteReview = async (reviewId: string) => {
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Access Denied: Only administrators can moderate reviews.' };
    }

    const res = await reviewService.deleteReview(reviewId, { role: user.role });
    if (!res.success) {
      return { success: false, error: res.error };
    }

    setData((prev: typeof data) => ({
      ...prev,
      reviews: prev.reviews.filter((r: Review) => r.id !== reviewId),
    }));

    return { success: true };
  };

  return (
    <DataContext.Provider
      value={{
        cafes: authorizedCafes,
        menuItems: data.menuItems,
        orders: authorizedOrders,
        reservations: authorizedReservations,
        reviews: data.reviews,
        favorites: data.favorites,
        notifications: authorizedNotifications,
        refreshData,
        addCafe,
        updateCafe,
        syncOwnerCafe,
        approveCafe,
        rejectCafe,
        suspendCafe,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        createOrder,
        updateOrderStatus,
        createReservation,
        updateReservationStatus,
        cancelReservation,
        toggleFavorite,
        isFavorite,
        addReview,
        replyToReview,
        deleteReview,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
