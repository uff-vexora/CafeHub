-- =================================================================
-- CAFEHUB PRODUCTION DATABASE SCHEMA & SECURE RLS POLICIES
-- PostgreSQL / Supabase
-- =================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (strictly tied to auth.users)
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

-- Helper Security Functions (SECURITY DEFINER to prevent recursive RLS)
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- Trigger to prevent regular users from escalating their own role in profiles
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Access Denied: Only administrators can modify user roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON profiles;
CREATE TRIGGER trg_prevent_role_escalation
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_escalation();

-- Automatic profile creation on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Cafes Table
CREATE TABLE IF NOT EXISTS cafes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
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

-- Helper to verify if the authenticated user owns a specific cafe
CREATE OR REPLACE FUNCTION public.is_cafe_owner(p_cafe_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_cafe_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.cafes 
    WHERE id = p_cafe_id AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

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

-- 6. Cafe Categories
CREATE TABLE IF NOT EXISTS cafe_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    category_name TEXT NOT NULL,
    UNIQUE(cafe_id, category_name)
);

-- 7. Menu Categories
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
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
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

-- 14. Notifications
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
-- INDEXES
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

-- Enable RLS across all tables
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

-- -----------------------------------------------------------------
-- 1. Profiles Security Policies
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view basic profiles" ON profiles;
CREATE POLICY "Public can view basic profiles"
ON profiles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile"
ON profiles FOR ALL
USING (public.is_admin());

-- -----------------------------------------------------------------
-- 2. Cafes Security Policies
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view approved cafes" ON cafes;
CREATE POLICY "Public can view approved cafes"
ON cafes FOR SELECT
USING (
  is_approved = true 
  OR auth.uid() = owner_id 
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Owners can update only their own cafe" ON cafes;
CREATE POLICY "Owners can update only their own cafe"
ON cafes FOR UPDATE
USING (
  auth.uid() = owner_id 
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Owners can insert their cafe" ON cafes;
CREATE POLICY "Owners can insert their cafe"
ON cafes FOR INSERT
WITH CHECK (
  auth.uid() = owner_id 
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Admins can delete/suspend cafes" ON cafes;
CREATE POLICY "Admins can delete/suspend cafes"
ON cafes FOR DELETE
USING (public.is_admin());

-- -----------------------------------------------------------------
-- 2b. Cafe Images, Amenities, and Categories Security Policies
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view cafe images" ON cafe_images;
CREATE POLICY "Public can view cafe images"
ON cafe_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cafes 
    WHERE cafes.id = cafe_images.cafe_id 
    AND (cafes.is_approved = true OR cafes.owner_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "Owners can insert images for their cafe" ON cafe_images;
CREATE POLICY "Owners can insert images for their cafe"
ON cafe_images FOR INSERT
WITH CHECK (
  public.is_cafe_owner(cafe_id) 
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Owners can update their cafe images" ON cafe_images;
CREATE POLICY "Owners can update their cafe images"
ON cafe_images FOR UPDATE
USING (
  public.is_cafe_owner(cafe_id) 
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Owners can delete their cafe images" ON cafe_images;
CREATE POLICY "Owners can delete their cafe images"
ON cafe_images FOR DELETE
USING (
  public.is_cafe_owner(cafe_id) 
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Public can view cafe amenities" ON cafe_amenities;
CREATE POLICY "Public can view cafe amenities"
ON cafe_amenities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cafes 
    WHERE cafes.id = cafe_amenities.cafe_id 
    AND (cafes.is_approved = true OR cafes.owner_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "Owners can manage their cafe amenities" ON cafe_amenities;
CREATE POLICY "Owners can manage their cafe amenities"
ON cafe_amenities FOR ALL
USING (
  public.is_cafe_owner(cafe_id) 
  OR public.is_admin()
)
WITH CHECK (
  public.is_cafe_owner(cafe_id) 
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Public can view cafe categories" ON cafe_categories;
CREATE POLICY "Public can view cafe categories"
ON cafe_categories FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cafes 
    WHERE cafes.id = cafe_categories.cafe_id 
    AND (cafes.is_approved = true OR cafes.owner_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "Owners can manage their cafe categories" ON cafe_categories;
CREATE POLICY "Owners can manage their cafe categories"
ON cafe_categories FOR ALL
USING (
  public.is_cafe_owner(cafe_id) 
  OR public.is_admin()
)
WITH CHECK (
  public.is_cafe_owner(cafe_id) 
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Public can view menu categories" ON menu_categories;
CREATE POLICY "Public can view menu categories"
ON menu_categories FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cafes 
    WHERE cafes.id = menu_categories.cafe_id 
    AND (cafes.is_approved = true OR cafes.owner_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "Owners can insert menu categories" ON menu_categories;
CREATE POLICY "Owners can insert menu categories"
ON menu_categories FOR INSERT
WITH CHECK (
  public.is_cafe_owner(cafe_id) 
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Owners can update menu categories" ON menu_categories;
CREATE POLICY "Owners can update menu categories"
ON menu_categories FOR UPDATE
USING (
  public.is_cafe_owner(cafe_id) 
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Owners can delete menu categories" ON menu_categories;
CREATE POLICY "Owners can delete menu categories"
ON menu_categories FOR DELETE
USING (
  public.is_cafe_owner(cafe_id) 
  OR public.is_admin()
);

-- -----------------------------------------------------------------
-- 3. Menu Items Security Policies
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view menu items of approved cafes" ON menu_items;
CREATE POLICY "Anyone can view menu items of approved cafes"
ON menu_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cafes 
    WHERE cafes.id = menu_items.cafe_id 
    AND (cafes.is_approved = true OR cafes.owner_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "Owners can insert menu items for their own cafe" ON menu_items;
CREATE POLICY "Owners can insert menu items for their own cafe"
ON menu_items FOR INSERT
WITH CHECK (
  public.is_cafe_owner(cafe_id) 
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Owners can update menu items for their own cafe" ON menu_items;
CREATE POLICY "Owners can update menu items for their own cafe"
ON menu_items FOR UPDATE
USING (
  public.is_cafe_owner(cafe_id) 
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Owners can delete menu items for their own cafe" ON menu_items;
CREATE POLICY "Owners can delete menu items for their own cafe"
ON menu_items FOR DELETE
USING (
  public.is_cafe_owner(cafe_id) 
  OR public.is_admin()
);

-- -----------------------------------------------------------------
-- 4. Orders Security Policies
-- Customers can only see their own orders.
-- Owners can ONLY see and manage orders for their own cafe.
-- Admins can view all orders.
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Customers and cafe owners can view authorized orders" ON orders;
CREATE POLICY "Customers and cafe owners can view authorized orders"
ON orders FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.is_cafe_owner(cafe_id) 
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
CREATE POLICY "Authenticated users can create orders"
ON orders FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  OR user_id IS NULL
);

DROP POLICY IF EXISTS "Owners and admins can update order status" ON orders;
CREATE POLICY "Owners and admins can update order status"
ON orders FOR UPDATE
USING (
  public.is_cafe_owner(cafe_id) 
  OR public.is_admin()
);

-- -----------------------------------------------------------------
-- 5. Order Items Security Policies
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Authorized users can view order items" ON order_items;
CREATE POLICY "Authorized users can view order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR public.is_cafe_owner(orders.cafe_id) OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "Order items insertion allowed during checkout" ON order_items;
CREATE POLICY "Order items insertion allowed during checkout"
ON order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  )
);

-- -----------------------------------------------------------------
-- 6. Reservations Security Policies
-- Customers can only see and manage their own reservations.
-- Owners can ONLY see and manage reservations for their own cafe.
-- Admins can view all.
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Authorized users can view reservations" ON reservations;
CREATE POLICY "Authorized users can view reservations"
ON reservations FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.is_cafe_owner(cafe_id) 
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Users can create reservations" ON reservations;
CREATE POLICY "Users can create reservations"
ON reservations FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  OR user_id IS NULL
);

DROP POLICY IF EXISTS "Owners and customers can update reservations" ON reservations;
CREATE POLICY "Owners and customers can update reservations"
ON reservations FOR UPDATE
USING (
  auth.uid() = user_id 
  OR public.is_cafe_owner(cafe_id) 
  OR public.is_admin()
);

-- -----------------------------------------------------------------
-- 7. Reviews Security Policies
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view reviews" ON reviews;
CREATE POLICY "Public can view reviews"
ON reviews FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
CREATE POLICY "Authenticated users can create reviews"
ON reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Cafe owners can reply to reviews" ON reviews;
CREATE POLICY "Cafe owners can reply to reviews"
ON reviews FOR UPDATE
USING (
  public.is_cafe_owner(cafe_id) 
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Users and Admins can delete reviews" ON reviews;
CREATE POLICY "Users and Admins can delete reviews"
ON reviews FOR DELETE
USING (
  auth.uid() = user_id 
  OR public.is_admin()
);

-- -----------------------------------------------------------------
-- 8. Favorites Security Policies (Strictly User Isolated)
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Users manage their own favorites" ON favorites;
CREATE POLICY "Users manage their own favorites"
ON favorites FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------
-- 9. Notifications Security Policies (Strictly User Isolated)
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Users manage their own notifications" ON notifications;
CREATE POLICY "Users manage their own notifications"
ON notifications FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
