import React, { createContext, useContext, useState, useEffect } from 'react';
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

interface DataContextType {
  cafes: Cafe[];
  menuItems: MenuItem[];
  orders: Order[];
  reservations: Reservation[];
  reviews: Review[];
  favorites: string[]; // cafe IDs
  notifications: InAppNotification[];
  // Cafe operations
  addCafe: (cafe: Omit<Cafe, 'id' | 'created_at' | 'rating' | 'review_count'>) => Cafe;
  updateCafe: (id: string, updates: Partial<Cafe>) => void;
  approveCafe: (id: string) => void;
  suspendCafe: (id: string) => void;
  // Menu operations
  addMenuItem: (item: Omit<MenuItem, 'id'>) => MenuItem;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;
  // Orders
  createOrder: (orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'status'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  // Reservations
  createReservation: (resData: Omit<Reservation, 'id' | 'reservation_code' | 'created_at' | 'status'>) => Reservation;
  updateReservationStatus: (resId: string, status: ReservationStatus) => void;
  cancelReservation: (resId: string) => void;
  // Favorites
  toggleFavorite: (cafeId: string) => void;
  isFavorite: (cafeId: string) => boolean;
  // Reviews
  addReview: (reviewData: Omit<Review, 'id' | 'created_at'>) => void;
  replyToReview: (reviewId: string, response: string) => void;
  deleteReview: (reviewId: string) => void;
  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (title: string, message: string, type: 'order' | 'reservation' | 'cafe' | 'system', link?: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'cafehub_data_store_v1';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from localStorage or seed
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

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Notifications
  const addNotification = (
    title: string,
    message: string,
    type: 'order' | 'reservation' | 'cafe' | 'system',
    link?: string
  ) => {
    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}`,
      user_id: 'current-user',
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
  const addCafe = (newCafeData: Omit<Cafe, 'id' | 'created_at' | 'rating' | 'review_count'>) => {
    const newCafe: Cafe = {
      ...newCafeData,
      id: `cafe-${Date.now()}`,
      rating: 5.0,
      review_count: 0,
      created_at: new Date().toISOString(),
    };
    setData((prev: typeof data) => ({
      ...prev,
      cafes: [newCafe, ...prev.cafes],
    }));
    addNotification('New Cafe Submitted ☕', `${newCafe.name} has been listed and is pending review.`, 'cafe', `/cafes/${newCafe.id}`);
    return newCafe;
  };

  const updateCafe = (id: string, updates: Partial<Cafe>) => {
    setData((prev: typeof data) => ({
      ...prev,
      cafes: prev.cafes.map((c: Cafe) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  };

  const approveCafe = (id: string) => {
    setData((prev: typeof data) => ({
      ...prev,
      cafes: prev.cafes.map((c: Cafe) => (c.id === id ? { ...c, is_approved: true } : c)),
    }));
    addNotification('Cafe Approved 🎉', 'Your cafe has been approved and is now live to customers.', 'cafe');
  };

  const suspendCafe = (id: string) => {
    setData((prev: typeof data) => ({
      ...prev,
      cafes: prev.cafes.map((c: Cafe) => (c.id === id ? { ...c, is_approved: false } : c)),
    }));
  };

  // Menu operations
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`,
    };
    setData((prev: typeof data) => ({
      ...prev,
      menuItems: [newItem, ...prev.menuItems],
    }));
    return newItem;
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setData((prev: typeof data) => ({
      ...prev,
      menuItems: prev.menuItems.map((m: MenuItem) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  };

  const deleteMenuItem = (id: string) => {
    setData((prev: typeof data) => ({
      ...prev,
      menuItems: prev.menuItems.filter((m: MenuItem) => m.id !== id),
    }));
  };

  const toggleItemAvailability = (id: string) => {
    setData((prev: typeof data) => ({
      ...prev,
      menuItems: prev.menuItems.map((m: MenuItem) =>
        m.id === id ? { ...m, is_available: !m.is_available } : m
      ),
    }));
  };

  // Orders
  const createOrder = (orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'status'>) => {
    const orderNumber = `CH-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}`,
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

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setData((prev: typeof data) => {
      const order = prev.orders.find((o: Order) => o.id === orderId);
      const updatedOrders = prev.orders.map((o: Order) =>
        o.id === orderId ? { ...o, status } : o
      );
      return {
        ...prev,
        orders: updatedOrders,
      };
    });

    const statusLabels: Record<OrderStatus, string> = {
      order_placed: 'Order Placed',
      confirmed: 'Confirmed by Cafe',
      preparing: 'Now Preparing 🍳',
      ready: 'Ready for pickup / delivery 🚀',
      completed: 'Completed ✅',
      cancelled: 'Cancelled ❌',
    };

    addNotification('Order Status Update', `Order status updated to: ${statusLabels[status]}`, 'order', '/orders');
  };

  // Reservations
  const createReservation = (
    resData: Omit<Reservation, 'id' | 'reservation_code' | 'created_at' | 'status'>
  ) => {
    const code = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRes: Reservation = {
      ...resData,
      id: `res-${Date.now()}`,
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

    return newRes;
  };

  const updateReservationStatus = (resId: string, status: ReservationStatus) => {
    setData((prev: typeof data) => ({
      ...prev,
      reservations: prev.reservations.map((r: Reservation) =>
        r.id === resId ? { ...r, status } : r
      ),
    }));
    addNotification('Reservation Update', `Reservation status changed to ${status}`, 'reservation', '/reservations');
  };

  const cancelReservation = (resId: string) => {
    updateReservationStatus(resId, 'cancelled');
  };

  // Favorites
  const toggleFavorite = (cafeId: string) => {
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

  const isFavorite = (cafeId: string) => data.favorites.includes(cafeId);

  // Reviews
  const addReview = (reviewData: Omit<Review, 'id' | 'created_at'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setData((prev: typeof data) => {
      const updatedReviews = [newReview, ...prev.reviews];
      // Recalculate cafe rating
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
  };

  const replyToReview = (reviewId: string, response: string) => {
    setData((prev: typeof data) => ({
      ...prev,
      reviews: prev.reviews.map((r: Review) =>
        r.id === reviewId
          ? { ...r, owner_response: response, owner_responded_at: new Date().toISOString() }
          : r
      ),
    }));
  };

  const deleteReview = (reviewId: string) => {
    setData((prev: typeof data) => ({
      ...prev,
      reviews: prev.reviews.filter((r: Review) => r.id !== reviewId),
    }));
  };

  return (
    <DataContext.Provider
      value={{
        cafes: data.cafes,
        menuItems: data.menuItems,
        orders: data.orders,
        reservations: data.reservations,
        reviews: data.reviews,
        favorites: data.favorites,
        notifications: data.notifications,
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
