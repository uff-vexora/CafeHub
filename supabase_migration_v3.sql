-- =================================================================
-- CAFEHUB V3 MIGRATION — FINAL PRODUCTION COMPLETION
-- Run this AFTER supabase_schema.sql and supabase_migration_v2.sql
-- =================================================================

-- 1. RESERVATIONS DEFAULT STATUS & CAFE RATING TYPE
-- Set initial status of newly created reservations to 'pending' so cafe owner can review/accept.
ALTER TABLE reservations ALTER COLUMN status SET DEFAULT 'pending';

-- Ensure cafes rating column accommodates 2 decimal places (e.g. 4.67)
ALTER TABLE cafes ALTER COLUMN rating TYPE NUMERIC(3, 2);

-- 2. ENABLE ROW LEVEL SECURITY ON ORDERS, ORDER_ITEMS, RESERVATIONS, REVIEWS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 3. ORDERS RLS POLICIES
-- Cleanly drop legacy base-schema policy names if present
DROP POLICY IF EXISTS "Customers and cafe owners can view authorized orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
DROP POLICY IF EXISTS "Owners and admins can update order status" ON orders;

-- Drop V3 policy names before re-creating
DROP POLICY IF EXISTS "Customers can view their own orders" ON orders;
CREATE POLICY "Customers can view their own orders"
    ON orders FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Cafe owners can view their cafe orders" ON orders;
CREATE POLICY "Cafe owners can view their cafe orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM cafes WHERE cafes.id = orders.cafe_id AND cafes.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Customers can insert their own orders" ON orders;
CREATE POLICY "Customers can insert their own orders"
    ON orders FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

DROP POLICY IF EXISTS "Cafe owners can update their cafe orders" ON orders;
CREATE POLICY "Cafe owners can update their cafe orders"
    ON orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM cafes WHERE cafes.id = orders.cafe_id AND cafes.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 4. ORDER ITEMS RLS POLICIES
DROP POLICY IF EXISTS "Authorized users can view order items" ON order_items;
DROP POLICY IF EXISTS "Order items insertion allowed during checkout" ON order_items;

DROP POLICY IF EXISTS "Users can view order items for accessible orders" ON order_items;
CREATE POLICY "Users can view order items for accessible orders"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND (
                orders.user_id = auth.uid()
                OR EXISTS (SELECT 1 FROM cafes WHERE cafes.id = orders.cafe_id AND cafes.owner_id = auth.uid())
                OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
            )
        )
    );

DROP POLICY IF EXISTS "Customers can insert items for their orders" ON order_items;
CREATE POLICY "Customers can insert items for their orders"
    ON order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- 5. RESERVATIONS RLS POLICIES
DROP POLICY IF EXISTS "Authorized users can view reservations" ON reservations;
DROP POLICY IF EXISTS "Users can create reservations" ON reservations;
DROP POLICY IF EXISTS "Owners and customers can update reservations" ON reservations;

DROP POLICY IF EXISTS "Customers can view their own reservations" ON reservations;
CREATE POLICY "Customers can view their own reservations"
    ON reservations FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Cafe owners can view their cafe reservations" ON reservations;
CREATE POLICY "Cafe owners can view their cafe reservations"
    ON reservations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM cafes WHERE cafes.id = reservations.cafe_id AND cafes.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Customers can insert their own reservations" ON reservations;
CREATE POLICY "Customers can insert their own reservations"
    ON reservations FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

DROP POLICY IF EXISTS "Customers can cancel their own reservations" ON reservations;
CREATE POLICY "Customers can cancel their own reservations"
    ON reservations FOR UPDATE
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM cafes WHERE cafes.id = reservations.cafe_id AND cafes.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 6. REVIEWS RLS POLICIES
DROP POLICY IF EXISTS "Public can view reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Cafe owners can reply to reviews" ON reviews;
DROP POLICY IF EXISTS "Users and Admins can delete reviews" ON reviews;

DROP POLICY IF EXISTS "Public can view reviews for approved cafes" ON reviews;
CREATE POLICY "Public can view reviews for approved cafes"
    ON reviews FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Customers can insert/update their own reviews" ON reviews;
CREATE POLICY "Customers can insert/update their own reviews"
    ON reviews FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

DROP POLICY IF EXISTS "Customers can update their own reviews" ON reviews;
CREATE POLICY "Customers can update their own reviews"
    ON reviews FOR UPDATE
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM cafes WHERE cafes.id = reviews.cafe_id AND cafes.owner_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can delete reviews" ON reviews;
CREATE POLICY "Admins can delete reviews"
    ON reviews FOR DELETE
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 7. ROLE SELF-ESCALATION PREVENTION TRIGGER
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS TRIGGER AS $$
BEGIN
    -- If user is updating their own profile and is not already an admin, prevent changing role
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        IF NOT EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        ) THEN
            RAISE EXCEPTION 'Unauthorized: Users cannot change their account role.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON profiles;
DROP TRIGGER IF EXISTS trg_prevent_role_self_escalation ON profiles;
CREATE TRIGGER trg_prevent_role_self_escalation
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_role_self_escalation();

-- 8. CAFE AVERAGE RATING RECALCULATION TRIGGER
CREATE OR REPLACE FUNCTION public.sync_cafe_rating_on_review()
RETURNS TRIGGER AS $$
DECLARE
    target_cafe_id UUID;
    new_avg NUMERIC(3, 2);
    new_count INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_cafe_id := OLD.cafe_id;
    ELSE
        target_cafe_id := NEW.cafe_id;
    END IF;

    SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0.00), COUNT(*)
    INTO new_avg, new_count
    FROM reviews
    WHERE cafe_id = target_cafe_id;

    UPDATE cafes
    SET rating = new_avg,
        review_count = new_count,
        updated_at = NOW()
    WHERE id = target_cafe_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_cafe_rating ON reviews;
CREATE TRIGGER trg_sync_cafe_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_cafe_rating_on_review();

-- 9. SUPABASE REALTIME REPLICATION CONFIGURATION
-- Safely add tables to realtime publication if publication exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE orders;
        EXCEPTION WHEN duplicate_object THEN
            -- Table already in publication
        END;
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE reservations;
        EXCEPTION WHEN duplicate_object THEN
            -- Table already in publication
        END;
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
        EXCEPTION WHEN duplicate_object THEN
            -- Table already in publication
        END;
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE cafes;
        EXCEPTION WHEN duplicate_object THEN
            -- Table already in publication
        END;
    END IF;
END $$;
