-- =================================================================
-- CAFEHUB PRODUCTION DATABASE SCHEMA FOR SUPABASE / POSTGRESQL
-- =================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'cafe_owner', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Cafes Table
CREATE TABLE IF NOT EXISTS cafes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tagline TEXT,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    price_range TEXT NOT NULL DEFAULT '₹₹' CHECK (price_range IN ('₹', '₹₹', '₹₹₹')),
    rating NUMERIC(2, 1) DEFAULT 4.5,
    review_count INTEGER DEFAULT 0,
    is_open BOOLEAN DEFAULT true,
    opening_time TEXT DEFAULT '08:00 AM',
    closing_time TEXT DEFAULT '11:00 PM',
    cover_image TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Cafe Images Gallery
CREATE TABLE IF NOT EXISTS cafe_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Cafe Amenities
CREATE TABLE IF NOT EXISTS cafe_amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    amenity_key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cafe_id, amenity_key)
);

-- 6. Cafe Categories (e.g. Coffee, Artisan, Bakery, Work-friendly)
CREATE TABLE IF NOT EXISTS cafe_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    category_name TEXT NOT NULL,
    UNIQUE(cafe_id, category_name)
);

-- 7. Menu Categories (e.g., Coffee, Tea, Breakfast, Snacks, Desserts, Cold Drinks)
CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
    category_name TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT NOT NULL,
    is_veg BOOLEAN DEFAULT true,
    is_available BOOLEAN DEFAULT true,
    ingredients TEXT,
    customization_options JSONB DEFAULT '[]'::jsonb,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Favorites
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, cafe_id)
);

-- 10. Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE RESTRICT,
    order_type TEXT NOT NULL CHECK (order_type IN ('dine_in', 'pickup', 'delivery')),
    status TEXT NOT NULL DEFAULT 'order_placed' CHECK (status IN ('order_placed', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
    subtotal NUMERIC(10, 2) NOT NULL,
    taxes NUMERIC(10, 2) NOT NULL,
    service_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    delivery_address TEXT,
    delivery_city TEXT,
    delivery_postal_code TEXT,
    dine_in_table TEXT,
    notes TEXT,
    payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    payment_method TEXT DEFAULT 'UPI / Card' CHECK (payment_method IN ('UPI / Card', 'Cash on Pickup', 'Card at Cafe')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    item_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    item_total NUMERIC(10, 2) NOT NULL,
    customizations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Reservations
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_code TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE RESTRICT,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    guest_count INTEGER NOT NULL CHECK (guest_count > 0 AND guest_count <= 20),
    reservation_date DATE NOT NULL,
    reservation_time TEXT NOT NULL,
    special_requests TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    owner_response TEXT,
    owner_responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, cafe_id)
);

-- 14. In-App Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'system' CHECK (type IN ('order', 'reservation', 'cafe', 'system')),
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- INDEXES FOR MAXIMUM QUERY SPEED
-- =================================================================
CREATE INDEX IF NOT EXISTS idx_cafes_city ON cafes(city);
CREATE INDEX IF NOT EXISTS idx_cafes_rating ON cafes(rating DESC);
CREATE INDEX IF NOT EXISTS idx_cafes_owner ON cafes(owner_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_cafe ON menu_items(cafe_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_cafe ON orders(cafe_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_cafe ON reservations(cafe_id);
CREATE INDEX IF NOT EXISTS idx_reviews_cafe ON reviews(cafe_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- =================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can read, users can update own profile
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Cafes: Approved cafes are viewable by all; owners can edit their cafe; admins can edit any
CREATE POLICY "Anyone can view approved cafes" ON cafes FOR SELECT USING (is_approved = true OR auth.uid() = owner_id);
CREATE POLICY "Owners can update own cafe" ON cafes FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can insert cafe" ON cafes FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Menu items: Anyone can view, cafe owners can manage
CREATE POLICY "Anyone can view menu items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Owners can manage menu items" ON menu_items FOR ALL USING (
    EXISTS (SELECT 1 FROM cafes WHERE cafes.id = menu_items.cafe_id AND cafes.owner_id = auth.uid())
);

-- Orders: Customers see own orders; Cafe owners see their cafe's orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM cafes WHERE cafes.id = orders.cafe_id AND cafes.owner_id = auth.uid())
);
CREATE POLICY "Users can insert orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update order status" ON orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM cafes WHERE cafes.id = orders.cafe_id AND cafes.owner_id = auth.uid())
);

-- Reservations: User sees own reservations; Cafe owners see cafe reservations
CREATE POLICY "Users see own reservations" ON reservations FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM cafes WHERE cafes.id = reservations.cafe_id AND cafes.owner_id = auth.uid())
);
CREATE POLICY "Users can insert reservations" ON reservations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can manage cafe reservations" ON reservations FOR UPDATE USING (
    EXISTS (SELECT 1 FROM cafes WHERE cafes.id = reservations.cafe_id AND cafes.owner_id = auth.uid())
);

-- Reviews: Viewable by anyone, inserted by authenticated users
CREATE POLICY "Reviews viewable by anyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can reply to reviews" ON reviews FOR UPDATE USING (
    EXISTS (SELECT 1 FROM cafes WHERE cafes.id = reviews.cafe_id AND cafes.owner_id = auth.uid())
);

-- Favorites: Private to each user
CREATE POLICY "Users manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- Notifications: Private to each user
CREATE POLICY "Users view own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
