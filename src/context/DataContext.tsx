import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Cafe,
  MenuItem,
  Order,
  OrderStatus,
  Reservation,
  ReservationStatus,
  Review,
  InAppNotification,
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

interface DataContextType {
  // Public or role-filtered collections
  cafes: Cafe[];
  menuItems: MenuItem[];
  orders: Order[];
  reservations: Reservation[];
  reviews: Review[];
  favorites: string[];
  notifications: InAppNotification[];

  // Cafe operations (Strictly Authorized)
  addCafe: (cafe: Omit<Cafe, 'id' | 'created_at' | 'rating' | 'review_count' | 'owner_id'>) => { success: boolean; cafe?: Cafe; error?: string };
  updateCafe: (id: string, updates: Partial<Cafe>) => { success: boolean; error?: string };
  approveCafe: (id: string) => { success: boolean; error?: string };
  suspendCafe: (id: string) => { success: boolean; error?: string };

  // Menu operations (Owner/Admin only)
  addMenuItem: (item: Omit<MenuItem, 'id'>) => { success: boolean; item?: MenuItem; error?: string };
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => { success: boolean; error?: string };
  deleteMenuItem: (id: string) => { success: boolean; error?: string };
  toggleItemAvailability: (id: string) => { success: boolean; error?: string };

  // Orders (Customer creates; Owner/Admin manages)
  createOrder: (orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'status' | 'user_id'>) => { success: boolean; order?: Order; error?: string };
  updateOrderStatus: (orderId: string, status: OrderStatus) => { success: boolean; error?: string };

  // Reservations
  createReservation: (resData: Omit<Reservation, 'id' | 'reservation_code' | 'created_at' | 'status' | 'user_id'>) => { success: boolean; reservation?: Reservation; error?: string };
  updateReservationStatus: (resId: string, status: ReservationStatus) => { success: boolean; error?: string };
  cancelReservation: (resId: string) => { success: boolean; error?: string };

  // Favorites
  toggleFavorite: (cafeId: string) => void;
  isFavorite: (cafeId: string) => boolean;

  // Reviews
  addReview: (reviewData: Omit<Review, 'id' | 'created_at' | 'user_id' | 'user_name'>) => { success: boolean; error?: string };
  replyToReview: (reviewId: string, response: string) => { success: boolean; error?: string };
  deleteReview: (reviewId: string) => { success: boolean; error?: string };

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
      return data.cafes.filter((c: Cafe) => c.is_approved);
    }
    if (user.role === 'admin') {
      return data.cafes;
    }
    if (user.role === 'cafe_owner') {
      return data.cafes.filter((c: Cafe) => c.is_approved || c.owner_id === user.id);
    }
    return data.cafes.filter((c: Cafe) => c.is_approved);
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

  // Notifications:
  // Isolated per user
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
  const addCafe = (newCafeData: Omit<Cafe, 'id' | 'created_at' | 'rating' | 'review_count' | 'owner_id'>) => {
    if (!user) {
      return { success: false, error: 'Authentication required: Please log in to list a cafe.' };
    }
    if (user.role !== 'cafe_owner' && user.role !== 'admin') {
      return { success: false, error: 'Forbidden: Only cafe owners or administrators can list new cafes.' };
    }

    const newCafe: Cafe = {
      ...newCafeData,
      id: `cafe-${Date.now()}`,
      owner_id: user.id, // Strictly tied to authenticated user ID
      rating: 5.0,
      review_count: 0,
      is_approved: user.role === 'admin', // Auto-approved if admin, else pending
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

  const updateCafe = (id: string, updates: Partial<Cafe>) => {
    if (!user) {
      return { success: false, error: 'Authentication required.' };
    }

    const targetCafe = data.cafes.find((c: Cafe) => c.id === id);
    if (!targetCafe) {
      return { success: false, error: 'Cafe not found.' };
    }

    // CROSS-TENANT SECURITY CHECK:
    // Owner A must NEVER be able to edit Owner B's cafe!
    if (user.role !== 'admin' && targetCafe.owner_id !== user.id) {
      console.warn(`SECURITY VIOLATION: User ${user.id} attempted to edit unauthorized cafe ${id} owned by ${targetCafe.owner_id}`);
      return { success: false, error: 'Access Denied: You do not have permission to manage this cafe.' };
    }

    // Non-admins cannot alter is_approved or owner_id
    const safeUpdates = { ...updates };
    if (user.role !== 'admin') {
      delete safeUpdates.is_approved;
      delete safeUpdates.owner_id;
    }

    setData((prev: typeof data) => ({
      ...prev,
      cafes: prev.cafes.map((c: Cafe) => (c.id === id ? { ...c, ...safeUpdates } : c)),
    }));

    return { success: true };
  };

  const approveCafe = (id: string) => {
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Access Denied: Only administrators can approve cafes.' };
    }

    setData((prev: typeof data) => ({
      ...prev,
      cafes: prev.cafes.map((c: Cafe) => (c.id === id ? { ...c, is_approved: true } : c)),
    }));

    return { success: true };
  };

  const suspendCafe = (id: string) => {
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Access Denied: Only administrators can suspend cafes.' };
    }

    setData((prev: typeof data) => ({
      ...prev,
      cafes: prev.cafes.map((c: Cafe) => (c.id === id ? { ...c, is_approved: false } : c)),
    }));

    return { success: true };
  };

  // Menu operations
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    if (!user) {
      return { success: false, error: 'Authentication required.' };
    }

    const targetCafe = data.cafes.find((c: Cafe) => c.id === item.cafe_id);
    if (!targetCafe) {
      return { success: false, error: 'Target cafe does not exist.' };
    }

    // CROSS-TENANT CHECK:
    // Owner A cannot add menu items to Owner B's cafe
    if (user.role !== 'admin' && targetCafe.owner_id !== user.id) {
      return { success: false, error: 'Access Denied: You cannot modify another owner’s menu.' };
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

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
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

    setData((prev: typeof data) => ({
      ...prev,
      menuItems: prev.menuItems.map((m: MenuItem) => (m.id === id ? { ...m, ...updates } : m)),
    }));

    return { success: true };
  };

  const deleteMenuItem = (id: string) => {
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

    setData((prev: typeof data) => ({
      ...prev,
      menuItems: prev.menuItems.filter((m: MenuItem) => m.id !== id),
    }));

    return { success: true };
  };

  const toggleItemAvailability = (id: string) => {
    if (!user) return { success: false, error: 'Authentication required.' };

    const targetItem = data.menuItems.find((m: MenuItem) => m.id === id);
    if (!targetItem) return { success: false, error: 'Menu item not found.' };

    const targetCafe = data.cafes.find((c: Cafe) => c.id === targetItem.cafe_id);
    if (user.role !== 'admin' && targetCafe?.owner_id !== user.id) {
      return { success: false, error: 'Access Denied: You cannot change availability for another cafe.' };
    }

    setData((prev: typeof data) => ({
      ...prev,
      menuItems: prev.menuItems.map((m: MenuItem) =>
        m.id === id ? { ...m, is_available: !m.is_available } : m
      ),
    }));

    return { success: true };
  };

  // Orders
  const createOrder = (orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'status' | 'user_id'>) => {
    if (!user) {
      return { success: false, error: 'Authentication required: Please log in to complete your order.' };
    }

    const orderNumber = `CH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}`,
      user_id: user.id, // Strictly tied to authenticated user ID
      order_number: orderNumber,
      created_at: new Date().toISOString(),
      status: 'order_placed',
    };

    setData((prev: typeof data) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
    }));

    addNotification(
      'Order Confirmed! 🛍️',
      `Order #${orderNumber} placed with ${newOrder.cafe_name}. Total: ₹${newOrder.total_amount}.`,
      'order',
      '/orders'
    );

    return { success: true, order: newOrder };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    if (!user) {
      return { success: false, error: 'Authentication required.' };
    }

    const targetOrder = data.orders.find((o: Order) => o.id === orderId);
    if (!targetOrder) {
      return { success: false, error: 'Order not found.' };
    }

    const targetCafe = data.cafes.find((c: Cafe) => c.id === targetOrder.cafe_id);

    // Only the cafe owner of this order or admin can change order status
    if (user.role !== 'admin' && targetCafe?.owner_id !== user.id) {
      return { success: false, error: 'Access Denied: You cannot modify orders for another cafe.' };
    }

    setData((prev: typeof data) => ({
      ...prev,
      orders: prev.orders.map((o: Order) => (o.id === orderId ? { ...o, status } : o)),
    }));

    return { success: true };
  };

  // Reservations
  const createReservation = (
    resData: Omit<Reservation, 'id' | 'reservation_code' | 'created_at' | 'status' | 'user_id'>
  ) => {
    if (!user) {
      return { success: false, error: 'Authentication required: Please log in to book a table.' };
    }

    const code = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRes: Reservation = {
      ...resData,
      id: `res-${Date.now()}`,
      user_id: user.id, // Strictly tied to authenticated user ID
      reservation_code: code,
      status: 'confirmed',
      created_at: new Date().toISOString(),
    };

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

  const updateReservationStatus = (resId: string, status: ReservationStatus) => {
    if (!user) return { success: false, error: 'Authentication required.' };

    const targetRes = data.reservations.find((r: Reservation) => r.id === resId);
    if (!targetRes) return { success: false, error: 'Reservation not found.' };

    const targetCafe = data.cafes.find((c: Cafe) => c.id === targetRes.cafe_id);

    // Customer can only cancel their own reservation
    if (user.role === 'customer') {
      if (targetRes.user_id !== user.id) {
        return { success: false, error: 'Access Denied: You cannot modify another customer’s reservation.' };
      }
      if (status !== 'cancelled') {
        return { success: false, error: 'Customers may only cancel their own reservation.' };
      }
    } else if (user.role === 'cafe_owner') {
      if (targetCafe?.owner_id !== user.id) {
        return { success: false, error: 'Access Denied: You cannot modify reservations for another cafe.' };
      }
    }

    setData((prev: typeof data) => ({
      ...prev,
      reservations: prev.reservations.map((r: Reservation) =>
        r.id === resId ? { ...r, status } : r
      ),
    }));

    return { success: true };
  };

  const cancelReservation = (resId: string) => {
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
  const addReview = (reviewData: Omit<Review, 'id' | 'created_at' | 'user_id' | 'user_name'>) => {
    if (!user) {
      return { success: false, error: 'Authentication required to write reviews.' };
    }

    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      user_id: user.id,
      user_name: user.full_name,
      user_avatar: user.avatar_url,
      created_at: new Date().toISOString(),
    };

    setData((prev: typeof data) => {
      const updatedReviews = [newReview, ...prev.reviews];
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

  const replyToReview = (reviewId: string, response: string) => {
    if (!user) return { success: false, error: 'Authentication required.' };

    const targetRev = data.reviews.find((r: Review) => r.id === reviewId);
    if (!targetRev) return { success: false, error: 'Review not found.' };

    const targetCafe = data.cafes.find((c: Cafe) => c.id === targetRev.cafe_id);
    if (user.role !== 'admin' && targetCafe?.owner_id !== user.id) {
      return { success: false, error: 'Access Denied: You cannot reply to reviews for another cafe.' };
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

  const deleteReview = (reviewId: string) => {
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Access Denied: Only administrators can moderate reviews.' };
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
        addCafe,
        updateCafe,
        approveCafe,
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
