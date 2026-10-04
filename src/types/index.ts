export type UserRole = 'customer' | 'cafe_owner' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at?: string;
}

export type AmenityKey =
  | 'wifi'
  | 'air_conditioning'
  | 'outdoor_seating'
  | 'parking'
  | 'pet_friendly'
  | 'power_outlets'
  | 'work_friendly';

export interface CafeImage {
  id: string;
  cafe_id: string;
  image_url: string;
  caption?: string;
  display_order?: number;
}

export interface Cafe {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  price_range: '₹' | '₹₹' | '₹₹₹';
  rating: number;
  review_count: number;
  is_open: boolean;
  opening_time: string;
  closing_time: string;
  cover_image: string;
  images: string[];
  amenities: AmenityKey[];
  categories: string[];
  is_approved: boolean;
  is_featured: boolean;
  distance_km?: number;
  created_at: string;
}

export interface MenuItemCustomization {
  id: string;
  name: string;
  options: {
    name: string;
    price: number;
  }[];
}

export interface MenuItem {
  id: string;
  cafe_id: string;
  category_id: string;
  category_name: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_veg: boolean;
  is_available: boolean;
  ingredients?: string;
  customization_options?: MenuItemCustomization[];
  display_order?: number;
}

export interface MenuCategory {
  id: string;
  cafe_id: string;
  name: string;
  display_order: number;
}

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  selected_customizations?: Record<string, string>;
  special_instructions?: string;
  cafe_id: string;
  cafe_name: string;
}

export type OrderType = 'dine_in' | 'pickup' | 'delivery';

export type OrderStatus =
  | 'order_placed'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export interface OrderItem {
  id: string;
  menu_item_id: string;
  item_name: string;
  item_price: number;
  quantity: number;
  item_total: number;
  customizations?: Record<string, string>;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  cafe_id: string;
  cafe_name: string;
  cafe_image: string;
  order_type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  taxes: number;
  service_fee: number;
  delivery_fee: number;
  total_amount: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_postal_code?: string;
  dine_in_table?: string;
  notes?: string;
  payment_status: 'pending' | 'paid' | 'failed';
  payment_method: string;
  created_at: string;
  estimated_time?: string;
}

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface Reservation {
  id: string;
  reservation_code: string;
  user_id: string;
  cafe_id: string;
  cafe_name: string;
  cafe_image: string;
  cafe_address: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guest_count: number;
  reservation_date: string;
  reservation_time: string;
  special_requests?: string;
  status: ReservationStatus;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  cafe_id: string;
  rating: number;
  comment: string;
  user_name: string;
  user_avatar?: string;
  created_at: string;
  owner_response?: string;
  owner_responded_at?: string;
}

export interface InAppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'reservation' | 'cafe' | 'system';
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface CafeFilters {
  searchQuery: string;
  city: string;
  category: string;
  minRating: number;
  priceRange: string[];
  openNow: boolean;
  amenities: AmenityKey[];
  sortBy: 'recommended' | 'rating' | 'distance' | 'reviews' | 'price_asc' | 'price_desc';
}
