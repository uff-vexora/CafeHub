-- =================================================================
-- CAFEHUB V2 MIGRATION — PRODUCTION OWNER ONBOARDING
-- Run this AFTER the base schema (supabase_schema.sql)
-- =================================================================

-- 1. Add status enum to cafes (replaces is_approved boolean logic)
--    States: draft, pending_approval, approved, rejected, suspended
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cafe_status') THEN
    CREATE TYPE cafe_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected', 'suspended');
  END IF;
END $$;

-- 2. Add new columns to cafes
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS status cafe_status DEFAULT 'draft';
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
ALTER TABLE cafes ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Adjust is_approved default to false for new cafes (requires admin review)
ALTER TABLE cafes ALTER COLUMN is_approved SET DEFAULT false;

-- Migrate existing data to consistent status
UPDATE cafes SET status = 'approved' WHERE is_approved = true AND status = 'draft';
UPDATE cafes SET status = 'pending_approval' WHERE is_approved = false AND status = 'draft';

-- Make columns nullable for draft cafes (enabling progressive onboarding)
ALTER TABLE cafes ALTER COLUMN description DROP NOT NULL;
ALTER TABLE cafes ALTER COLUMN address DROP NOT NULL;
ALTER TABLE cafes ALTER COLUMN city DROP NOT NULL;
ALTER TABLE cafes ALTER COLUMN state DROP NOT NULL;
ALTER TABLE cafes ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE cafes ALTER COLUMN email DROP NOT NULL;
ALTER TABLE cafes ALTER COLUMN cover_image DROP NOT NULL;

-- Add safe defaults for nullable fields
ALTER TABLE cafes ALTER COLUMN description SET DEFAULT '';
ALTER TABLE cafes ALTER COLUMN address SET DEFAULT '';
ALTER TABLE cafes ALTER COLUMN city SET DEFAULT '';
ALTER TABLE cafes ALTER COLUMN state SET DEFAULT '';
ALTER TABLE cafes ALTER COLUMN phone SET DEFAULT '';
ALTER TABLE cafes ALTER COLUMN email SET DEFAULT '';
ALTER TABLE cafes ALTER COLUMN cover_image SET DEFAULT '';

-- 3. Per-day opening hours table
CREATE TABLE IF NOT EXISTS cafe_opening_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    is_open BOOLEAN DEFAULT true,
    open_time TEXT DEFAULT '09:00',
    close_time TEXT DEFAULT '22:00',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cafe_id, day_of_week)
);

-- Index for opening hours lookups
CREATE INDEX IF NOT EXISTS idx_cafe_opening_hours_cafe ON cafe_opening_hours(cafe_id);

-- Enable RLS on cafe_opening_hours
ALTER TABLE cafe_opening_hours ENABLE ROW LEVEL SECURITY;

-- 4. Slug generation helper function
CREATE OR REPLACE FUNCTION public.generate_unique_slug(cafe_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Fallback if name is empty
    base_slug := lower(regexp_replace(trim(COALESCE(cafe_name, 'cafe')), '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    
    IF base_slug IS NULL OR base_slug = '' THEN
        base_slug := 'cafe';
    END IF;
    
    -- Truncate to reasonable length
    IF length(base_slug) > 60 THEN
        base_slug := left(base_slug, 60);
        base_slug := trim(both '-' from base_slug);
    END IF;
    
    final_slug := base_slug;
    
    -- Check for collisions and append counter
    WHILE EXISTS (SELECT 1 FROM cafes WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- 5. Security Trigger: Prevent owners from approving their own cafes
CREATE OR REPLACE FUNCTION public.prevent_owner_self_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Administrators can perform any updates
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Owners cannot change status to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    RAISE EXCEPTION 'Access Denied: Cafe owners cannot approve their own cafes.';
  END IF;

  -- Owners cannot change is_approved to true
  IF NEW.is_approved = true AND (OLD.is_approved IS DISTINCT FROM true) THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can grant cafe approval.';
  END IF;

  -- Owners cannot edit rejection_reason
  IF NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason THEN
    RAISE EXCEPTION 'Access Denied: Cafe owners cannot modify rejection reasons.';
  END IF;

  -- Owners cannot alter approved_at
  IF NEW.approved_at IS DISTINCT FROM OLD.approved_at THEN
    RAISE EXCEPTION 'Access Denied: Cafe owners cannot alter the approved timestamp.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_owner_self_approval ON cafes;
CREATE TRIGGER trg_prevent_owner_self_approval
BEFORE UPDATE ON cafes
FOR EACH ROW
EXECUTE FUNCTION public.prevent_owner_self_approval();

-- =================================================================
-- 6. RLS POLICIES FOR ALL HELPER AND CORE TABLES
-- =================================================================

-- -----------------------------------------------------------------
-- cafes RLS (Updated to check status = 'approved')
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view approved cafes" ON cafes;
CREATE POLICY "Public can view approved cafes"
ON cafes FOR SELECT
USING (
  is_approved = true 
  OR status = 'approved'
  OR auth.uid() = owner_id 
  OR public.is_admin()
);

-- -----------------------------------------------------------------
-- cafe_images RLS
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view cafe images" ON cafe_images;
CREATE POLICY "Public can view cafe images"
ON cafe_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cafes 
    WHERE cafes.id = cafe_images.cafe_id 
    AND (cafes.is_approved = true OR cafes.status = 'approved' OR cafes.owner_id = auth.uid() OR public.is_admin())
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

-- -----------------------------------------------------------------
-- cafe_amenities RLS
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view cafe amenities" ON cafe_amenities;
CREATE POLICY "Public can view cafe amenities"
ON cafe_amenities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cafes 
    WHERE cafes.id = cafe_amenities.cafe_id 
    AND (cafes.is_approved = true OR cafes.status = 'approved' OR cafes.owner_id = auth.uid() OR public.is_admin())
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

-- -----------------------------------------------------------------
-- cafe_categories RLS
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view cafe categories" ON cafe_categories;
CREATE POLICY "Public can view cafe categories"
ON cafe_categories FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cafes 
    WHERE cafes.id = cafe_categories.cafe_id 
    AND (cafes.is_approved = true OR cafes.status = 'approved' OR cafes.owner_id = auth.uid() OR public.is_admin())
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

-- -----------------------------------------------------------------
-- menu_categories RLS
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view menu categories" ON menu_categories;
CREATE POLICY "Public can view menu categories"
ON menu_categories FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cafes 
    WHERE cafes.id = menu_categories.cafe_id 
    AND (cafes.is_approved = true OR cafes.status = 'approved' OR cafes.owner_id = auth.uid() OR public.is_admin())
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
-- menu_items RLS update
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view menu items of approved cafes" ON menu_items;
CREATE POLICY "Anyone can view menu items of approved cafes"
ON menu_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cafes 
    WHERE cafes.id = menu_items.cafe_id 
    AND (cafes.is_approved = true OR cafes.status = 'approved' OR cafes.owner_id = auth.uid() OR public.is_admin())
  )
);

-- -----------------------------------------------------------------
-- cafe_opening_hours RLS
-- -----------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view opening hours" ON cafe_opening_hours;
CREATE POLICY "Public can view opening hours"
ON cafe_opening_hours FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cafes 
    WHERE cafes.id = cafe_opening_hours.cafe_id 
    AND (cafes.is_approved = true OR cafes.status = 'approved' OR cafes.owner_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "Owners can manage their opening hours" ON cafe_opening_hours;
CREATE POLICY "Owners can manage their opening hours"
ON cafe_opening_hours FOR ALL
USING (
  public.is_cafe_owner(cafe_id) 
  OR public.is_admin()
)
WITH CHECK (
  public.is_cafe_owner(cafe_id) 
  OR public.is_admin()
);

-- =================================================================
-- 7. STORAGE BUCKET & TENANT-ISOLATED STORAGE POLICIES
-- =================================================================
-- Path convention: cafe-images/{cafe_id}/{filename}

DO $$
BEGIN
  -- 1. Create bucket if storage schema and buckets table exist
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'storage' AND table_name = 'buckets'
  ) THEN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('cafe-images', 'cafe-images', true) 
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 2. Storage Policies on storage.objects
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'storage' AND table_name = 'objects'
  ) THEN
    -- Storage Policy 1: Anyone can view cafe images in the public bucket
    DROP POLICY IF EXISTS "Public can view cafe images in storage" ON storage.objects;
    CREATE POLICY "Public can view cafe images in storage"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'cafe-images');

    -- Storage Policy 2: Authenticated cafe owners can upload only into their own cafe folder
    DROP POLICY IF EXISTS "Owners can upload to their cafe folder" ON storage.objects;
    CREATE POLICY "Owners can upload to their cafe folder"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'cafe-images'
      AND auth.role() = 'authenticated'
      AND (
        public.is_admin()
        OR (
          array_length(storage.foldername(name), 1) >= 1
          AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          AND public.is_cafe_owner(((storage.foldername(name))[1])::uuid)
        )
      )
    );

    -- Storage Policy 3: Owners can update files only in their own cafe folder
    DROP POLICY IF EXISTS "Owners can update in their cafe folder" ON storage.objects;
    CREATE POLICY "Owners can update in their cafe folder"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'cafe-images'
      AND (
        public.is_admin()
        OR (
          array_length(storage.foldername(name), 1) >= 1
          AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          AND public.is_cafe_owner(((storage.foldername(name))[1])::uuid)
        )
      )
    );

    -- Storage Policy 4: Owners can delete files only in their own cafe folder
    DROP POLICY IF EXISTS "Owners can delete in their cafe folder" ON storage.objects;
    CREATE POLICY "Owners can delete in their cafe folder"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'cafe-images'
      AND (
        public.is_admin()
        OR (
          array_length(storage.foldername(name), 1) >= 1
          AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          AND public.is_cafe_owner(((storage.foldername(name))[1])::uuid)
        )
      )
    );
  END IF;
END $$;
