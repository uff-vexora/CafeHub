import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Cafe,
  CafeOpeningHours,
  CafeStatus,
  AmenityKey,
  MenuCategory,
  MenuItem,
  CafeImage,
} from '../types';
import { SEED_CAFES, generateAllMenuItems } from '../data/seedData';

export interface SetupCompleteness {
  score: number; // 0 to 100
  isReadyForSubmission: boolean;
  steps: {
    basicProfile: boolean;
    locationContact: boolean;
    brandingImages: boolean;
    openingHours: boolean;
    amenities: boolean;
    menuSetup: boolean;
  };
  missingRequirements: string[];
}

// -------------------------------------------------------------
// LOCAL MOCK STATE STORE (Used ONLY when isSupabaseConfigured is false)
// Guarantees zero crashing during offline / demo evaluations.
// In production with Supabase configured, ALL calls hit Postgres & Storage.
// -------------------------------------------------------------
const localMockCafes: Map<string, Cafe> = new Map(
  SEED_CAFES.map((c) => [
    c.id,
    {
      ...c,
      status: (c.status || (c.is_approved ? 'approved' : 'draft')) as CafeStatus,
    },
  ])
);

const localMockHours: Map<string, CafeOpeningHours[]> = new Map();
const localMockAmenities: Map<string, AmenityKey[]> = new Map(
  SEED_CAFES.map((c) => [c.id, [...c.amenities]])
);

const localMockCategories: Map<string, MenuCategory[]> = new Map();
const localMockMenuItems: Map<string, MenuItem[]> = new Map();
const initialSeedItems = generateAllMenuItems(SEED_CAFES);
SEED_CAFES.forEach((c) => {
  const items = initialSeedItems.filter((i) => i.cafe_id === c.id);
  localMockMenuItems.set(c.id, items);

  const uniqueCats = Array.from(new Set(items.map((i) => i.category_name || 'Coffee')));
  localMockCategories.set(
    c.id,
    uniqueCats.map((name, idx) => ({
      id: `cat-${c.id}-${idx}`,
      cafe_id: c.id,
      name,
      display_order: idx,
    }))
  );
});

const localMockImages: Map<string, CafeImage[]> = new Map(
  SEED_CAFES.map((c) => [
    c.id,
    (c.images || []).map((url, idx) => ({
      id: `img-${c.id}-${idx}`,
      cafe_id: c.id,
      image_url: url,
      caption: `${c.name} Photo ${idx + 1}`,
      display_order: idx,
    })),
  ])
);

export const ownerService = {
  /**
   * Helper: Generate a URL-safe, clean slug from a cafe name
   */
  generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 60);
    return `${base || 'cafe'}-${Math.random().toString(36).substring(2, 7)}`;
  },

  /**
   * 1. Get cafe owned by the authenticated owner
   * STRICT SECURITY: Only searches by owner_id. Never returns another owner's cafe!
   */
  async getOwnerCafe(ownerId: string): Promise<{ success: boolean; cafe: Cafe | null; error?: string }> {
    if (!isSupabaseConfigured) {
      const found = Array.from(localMockCafes.values()).find((c) => c.owner_id === ownerId);
      if (!found) {
        return { success: true, cafe: null };
      }
      return {
        success: true,
        cafe: {
          ...found,
          amenities: localMockAmenities.get(found.id) || found.amenities || [],
          images: (localMockImages.get(found.id) || []).map((img) => img.image_url),
        },
      };
    }

    try {
      const { data, error } = await supabase
        .from('cafes')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        return { success: false, cafe: null, error: error.message };
      }

      if (!data) {
        return { success: true, cafe: null };
      }

      // Fetch related amenities and images to provide a complete Cafe model
      const [amenitiesRes, imagesRes] = await Promise.all([
        supabase.from('cafe_amenities').select('amenity_key').eq('cafe_id', data.id),
        supabase.from('cafe_images').select('image_url').eq('cafe_id', data.id).order('display_order', { ascending: true }),
      ]);

      const amenities: AmenityKey[] = amenitiesRes.data ? amenitiesRes.data.map((a: any) => a.amenity_key) : [];
      const images: string[] = imagesRes.data ? imagesRes.data.map((img: any) => img.image_url) : [];

      const fullCafe: Cafe = {
        ...data,
        status: data.status || (data.is_approved ? 'approved' : 'draft'),
        amenities: amenities.length > 0 ? amenities : (data.amenities || []),
        images: images.length > 0 ? images : (data.images || []),
        categories: data.categories || [],
      };

      return { success: true, cafe: fullCafe };
    } catch (err: any) {
      return { success: false, cafe: null, error: err.message || 'Failed to fetch owner cafe' };
    }
  },

  /**
   * 2. Create a new cafe for the authenticated owner (supports progressive onboarding)
   */
  async createOwnerCafe(params: {
    owner_id: string;
    name: string;
    tagline?: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    email?: string;
    price_range?: '₹' | '₹₹' | '₹₹₹';
    logo_url?: string;
    cover_image?: string;
  }): Promise<{ success: boolean; cafe: Cafe | null; error?: string }> {
    const slug = this.generateSlug(params.name);

    if (!isSupabaseConfigured) {
      const newId = `cafe-${Date.now()}`;
      const newCafe: Cafe = {
        id: newId,
        owner_id: params.owner_id,
        name: params.name.trim(),
        slug,
        tagline: params.tagline || '',
        description: params.description || '',
        address: params.address || '',
        city: params.city || 'Mumbai',
        state: params.state || 'Maharashtra',
        postal_code: params.postal_code || '',
        latitude: params.latitude ?? 19.076,
        longitude: params.longitude ?? 72.8777,
        phone: params.phone || '',
        email: params.email || '',
        logo_url: params.logo_url,
        cover_image: params.cover_image || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
        images: [],
        amenities: [],
        categories: [],
        price_range: params.price_range || '₹₹',
        rating: 5.0,
        review_count: 0,
        is_open: true,
        opening_time: '09:00 AM',
        closing_time: '10:00 PM',
        is_approved: false,
        status: 'draft',
        is_featured: false,
        created_at: new Date().toISOString(),
      };

      localMockCafes.set(newId, newCafe);

      // Initialize default 7-day schedule
      const defaultHours: CafeOpeningHours[] = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
        id: `hours-${newId}-${day}`,
        cafe_id: newId,
        day_of_week: day,
        is_open: true,
        open_time: '09:00',
        close_time: '22:00',
      }));
      localMockHours.set(newId, defaultHours);
      localMockAmenities.set(newId, []);
      localMockCategories.set(newId, []);
      localMockMenuItems.set(newId, []);
      localMockImages.set(newId, []);

      return { success: true, cafe: newCafe };
    }

    try {
      const newCafePayload = {
        owner_id: params.owner_id,
        name: params.name.trim(),
        slug,
        tagline: params.tagline || '',
        description: params.description || '',
        address: params.address || '',
        city: params.city || '',
        state: params.state || '',
        postal_code: params.postal_code || '',
        latitude: params.latitude ?? 19.076,
        longitude: params.longitude ?? 72.8777,
        phone: params.phone || '',
        email: params.email || '',
        logo_url: params.logo_url || null,
        cover_image: params.cover_image || '',
        price_range: params.price_range || '₹₹',
        rating: 5.0,
        review_count: 0,
        is_open: true,
        is_approved: false, // Security constraint: Never auto-approve on creation
        status: 'draft' as CafeStatus,
        is_featured: false,
      };

      const { data, error } = await supabase
        .from('cafes')
        .insert(newCafePayload)
        .select()
        .single();

      if (error) {
        return { success: false, cafe: null, error: error.message };
      }

      // Initialize default 7-day opening hours schedule (9 AM - 10 PM)
      const defaultHours: Omit<CafeOpeningHours, 'id'>[] = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
        cafe_id: data.id,
        day_of_week: day,
        is_open: true,
        open_time: '09:00',
        close_time: '22:00',
      }));

      await supabase.from('cafe_opening_hours').insert(defaultHours);

      return {
        success: true,
        cafe: {
          ...data,
          amenities: [],
          images: [],
          categories: [],
        },
      };
    } catch (err: any) {
      return { success: false, cafe: null, error: err.message || 'Failed to create cafe' };
    }
  },

  /**
   * 3. Update existing cafe profile
   */
  async updateOwnerCafe(
    cafeId: string,
    updates: Partial<Cafe>
  ): Promise<{ success: boolean; cafe?: Cafe; error?: string }> {
    // SECURITY FILTER: Strip fields owners are forbidden from changing directly
    const {
      id: _id,
      owner_id: _ownerId,
      is_approved: _isApproved,
      rating: _rating,
      review_count: _reviewCount,
      rejection_reason: _rejectionReason,
      approved_at: _approvedAt,
      status: _status, // Status changes must go through submitCafeForApproval
      amenities: _amenities, // Handled by updateAmenities
      images: _images,       // Handled by cafe_images
      ...allowedFields
    } = updates as any;

    if (!isSupabaseConfigured) {
      const existing = localMockCafes.get(cafeId);
      if (!existing) {
        return { success: false, error: 'Cafe not found in local store' };
      }
      const updated: Cafe = {
        ...existing,
        ...allowedFields,
      };
      localMockCafes.set(cafeId, updated);
      return { success: true, cafe: updated };
    }

    try {
      const { data, error } = await supabase
        .from('cafes')
        .update({
          ...allowedFields,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cafeId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, cafe: data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update cafe' };
    }
  },

  /**
   * 4. Submit cafe for admin review
   */
  async submitCafeForApproval(cafeId: string): Promise<{ success: boolean; error?: string }> {
    const timestamp = new Date().toISOString();

    if (!isSupabaseConfigured) {
      const existing = localMockCafes.get(cafeId);
      if (existing) {
        localMockCafes.set(cafeId, {
          ...existing,
          status: 'pending_approval',
          submitted_at: timestamp,
        });
      }
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('cafes')
        .update({
          status: 'pending_approval',
          submitted_at: timestamp,
          updated_at: timestamp,
        })
        .eq('id', cafeId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to submit cafe for approval' };
    }
  },

  /**
   * Admin: Approve a cafe for live customer activation
   */
  async adminApproveCafe(cafeId: string): Promise<{ success: boolean; error?: string }> {
    const approvedAt = new Date().toISOString();
    if (!isSupabaseConfigured) {
      const existing = localMockCafes.get(cafeId);
      if (existing) {
        localMockCafes.set(cafeId, {
          ...existing,
          status: 'approved',
          is_approved: true,
          approved_at: approvedAt,
        });
      }
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('cafes')
        .update({
          status: 'approved',
          is_approved: true,
          approved_at: approvedAt,
          updated_at: approvedAt,
        })
        .eq('id', cafeId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to approve cafe' };
    }
  },

  /**
   * Admin: Reject a cafe and provide revision feedback
   */
  async adminRejectCafe(cafeId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    const updatedAt = new Date().toISOString();
    if (!isSupabaseConfigured) {
      const existing = localMockCafes.get(cafeId);
      if (existing) {
        localMockCafes.set(cafeId, {
          ...existing,
          status: 'rejected',
          is_approved: false,
          rejection_reason: reason.trim(),
        });
      }
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('cafes')
        .update({
          status: 'rejected',
          is_approved: false,
          rejection_reason: reason.trim(),
          updated_at: updatedAt,
        })
        .eq('id', cafeId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to reject cafe' };
    }
  },

  /**
   * 5. Opening Hours CRUD
   */
  async getOpeningHours(cafeId: string): Promise<{ success: boolean; hours: CafeOpeningHours[]; error?: string }> {
    if (!isSupabaseConfigured) {
      let hours = localMockHours.get(cafeId);
      if (!hours || hours.length === 0) {
        hours = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
          id: `hours-${cafeId}-${day}`,
          cafe_id: cafeId,
          day_of_week: day,
          is_open: true,
          open_time: '09:00',
          close_time: '22:00',
        }));
        localMockHours.set(cafeId, hours);
      }
      return { success: true, hours };
    }

    try {
      const { data, error } = await supabase
        .from('cafe_opening_hours')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('day_of_week', { ascending: true });

      if (error) {
        return { success: false, hours: [], error: error.message };
      }

      return { success: true, hours: data || [] };
    } catch (err: any) {
      return { success: false, hours: [], error: err.message || 'Failed to fetch opening hours' };
    }
  },

  async upsertOpeningHours(
    cafeId: string,
    hours: CafeOpeningHours[]
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      localMockHours.set(cafeId, hours);
      return { success: true };
    }

    try {
      const payload = hours.map((h) => ({
        cafe_id: cafeId,
        day_of_week: h.day_of_week,
        is_open: h.is_open,
        open_time: h.open_time,
        close_time: h.close_time,
      }));

      const { error } = await supabase
        .from('cafe_opening_hours')
        .upsert(payload, { onConflict: 'cafe_id,day_of_week' });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update opening hours' };
    }
  },

  /**
   * 6. Amenities Persistence
   */
  async getAmenities(cafeId: string): Promise<{ success: boolean; amenities: AmenityKey[]; error?: string }> {
    if (!isSupabaseConfigured) {
      const list = localMockAmenities.get(cafeId) || [];
      return { success: true, amenities: list };
    }

    try {
      const { data, error } = await supabase
        .from('cafe_amenities')
        .select('amenity_key')
        .eq('cafe_id', cafeId);

      if (error) {
        return { success: false, amenities: [], error: error.message };
      }

      return { success: true, amenities: data ? data.map((d: any) => d.amenity_key as AmenityKey) : [] };
    } catch (err: any) {
      return { success: false, amenities: [], error: err.message || 'Failed to fetch amenities' };
    }
  },

  async updateAmenities(
    cafeId: string,
    amenities: AmenityKey[]
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      localMockAmenities.set(cafeId, amenities);
      const c = localMockCafes.get(cafeId);
      if (c) {
        localMockCafes.set(cafeId, { ...c, amenities });
      }
      return { success: true };
    }

    try {
      // 1. Delete existing amenities for this cafe
      const { error: delError } = await supabase
        .from('cafe_amenities')
        .delete()
        .eq('cafe_id', cafeId);

      if (delError) {
        return { success: false, error: delError.message };
      }

      // 2. Insert updated amenities
      if (amenities.length > 0) {
        const payload = amenities.map((key) => ({
          cafe_id: cafeId,
          amenity_key: key,
        }));

        const { error: insError } = await supabase.from('cafe_amenities').insert(payload);
        if (insError) {
          return { success: false, error: insError.message };
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update amenities' };
    }
  },

  /**
   * 7. Menu Categories CRUD
   */
  async getMenuCategories(cafeId: string): Promise<{ success: boolean; categories: MenuCategory[]; error?: string }> {
    if (!isSupabaseConfigured) {
      let cats = localMockCategories.get(cafeId);
      if (!cats || cats.length === 0) {
        cats = [
          { id: `cat-${cafeId}-1`, cafe_id: cafeId, name: 'Specialty Coffee', display_order: 0 },
          { id: `cat-${cafeId}-2`, cafe_id: cafeId, name: 'Artisan Bakes', display_order: 1 },
          { id: `cat-${cafeId}-3`, cafe_id: cafeId, name: 'Breakfast & Savouries', display_order: 2 },
        ];
        localMockCategories.set(cafeId, cats);
      }
      return { success: true, categories: cats };
    }

    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('display_order', { ascending: true });

      if (error) {
        return { success: false, categories: [], error: error.message };
      }

      return { success: true, categories: data || [] };
    } catch (err: any) {
      return { success: false, categories: [], error: err.message || 'Failed to fetch categories' };
    }
  },

  async createMenuCategory(
    cafeId: string,
    name: string,
    displayOrder = 0
  ): Promise<{ success: boolean; category: MenuCategory | null; error?: string }> {
    if (!isSupabaseConfigured) {
      const newCat: MenuCategory = {
        id: `cat-${Date.now()}`,
        cafe_id: cafeId,
        name: name.trim(),
        display_order: displayOrder,
      };
      const cats = localMockCategories.get(cafeId) || [];
      localMockCategories.set(cafeId, [...cats, newCat]);
      return { success: true, category: newCat };
    }

    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .insert({
          cafe_id: cafeId,
          name: name.trim(),
          display_order: displayOrder,
        })
        .select()
        .single();

      if (error) {
        return { success: false, category: null, error: error.message };
      }

      return { success: true, category: data };
    } catch (err: any) {
      return { success: false, category: null, error: err.message || 'Failed to create category' };
    }
  },

  async updateMenuCategory(
    categoryId: string,
    updates: { name?: string; display_order?: number }
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      for (const [cafeId, cats] of localMockCategories.entries()) {
        const found = cats.find((c) => c.id === categoryId);
        if (found) {
          localMockCategories.set(
            cafeId,
            cats.map((c) => (c.id === categoryId ? { ...c, ...updates } : c))
          );
          return { success: true };
        }
      }
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('menu_categories')
        .update(updates)
        .eq('id', categoryId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update category' };
    }
  },

  async deleteMenuCategory(categoryId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      for (const [cafeId, cats] of localMockCategories.entries()) {
        localMockCategories.set(
          cafeId,
          cats.filter((c) => c.id !== categoryId)
        );
      }
      return { success: true };
    }

    try {
      const { error } = await supabase.from('menu_categories').delete().eq('id', categoryId);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete category' };
    }
  },

  /**
   * 8. Menu Items CRUD
   */
  async getMenuItems(cafeId: string): Promise<{ success: boolean; items: MenuItem[]; error?: string }> {
    if (!isSupabaseConfigured) {
      const items = localMockMenuItems.get(cafeId) || [];
      return { success: true, items };
    }

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('display_order', { ascending: true });

      if (error) {
        return { success: false, items: [], error: error.message };
      }

      return { success: true, items: data || [] };
    } catch (err: any) {
      return { success: false, items: [], error: err.message || 'Failed to fetch menu items' };
    }
  },

  async createMenuItem(
    item: Omit<MenuItem, 'id'>
  ): Promise<{ success: boolean; item: MenuItem | null; error?: string }> {
    if (!isSupabaseConfigured) {
      const newItem: MenuItem = {
        ...item,
        id: `item-${Date.now()}`,
        price: Number(item.price),
        is_available: item.is_available ?? true,
      };
      const list = localMockMenuItems.get(item.cafe_id) || [];
      localMockMenuItems.set(item.cafe_id, [newItem, ...list]);
      return { success: true, item: newItem };
    }

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          cafe_id: item.cafe_id,
          category_id: item.category_id || null,
          category_name: item.category_name,
          name: item.name.trim(),
          description: item.description || '',
          price: Number(item.price),
          image_url: item.image_url || '',
          is_veg: item.is_veg,
          is_available: item.is_available ?? true,
          ingredients: item.ingredients || null,
          customization_options: item.customization_options || [],
          display_order: item.display_order || 0,
        })
        .select()
        .single();

      if (error) {
        return { success: false, item: null, error: error.message };
      }

      return { success: true, item: data };
    } catch (err: any) {
      return { success: false, item: null, error: err.message || 'Failed to create menu item' };
    }
  },

  async updateMenuItem(
    itemId: string,
    updates: Partial<MenuItem>
  ): Promise<{ success: boolean; item?: MenuItem; error?: string }> {
    if (!isSupabaseConfigured) {
      for (const [cafeId, items] of localMockMenuItems.entries()) {
        const found = items.find((i) => i.id === itemId);
        if (found) {
          const updated = { ...found, ...updates };
          localMockMenuItems.set(
            cafeId,
            items.map((i) => (i.id === itemId ? updated : i))
          );
          return { success: true, item: updated };
        }
      }
      return { success: true };
    }

    try {
      const { id: _id, cafe_id: _cafeId, ...validUpdates } = updates as any;

      const { data, error } = await supabase
        .from('menu_items')
        .update({
          ...validUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, item: data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update menu item' };
    }
  },

  async updateMenuItemAvailability(
    itemId: string,
    isAvailable: boolean
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      for (const [cafeId, items] of localMockMenuItems.entries()) {
        localMockMenuItems.set(
          cafeId,
          items.map((i) => (i.id === itemId ? { ...i, is_available: isAvailable } : i))
        );
      }
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
        .eq('id', itemId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to toggle availability' };
    }
  },

  async deleteMenuItem(itemId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      for (const [cafeId, items] of localMockMenuItems.entries()) {
        localMockMenuItems.set(
          cafeId,
          items.filter((i) => i.id !== itemId)
        );
      }
      return { success: true };
    }

    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', itemId);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete menu item' };
    }
  },

  /**
   * 9. Cafe Gallery & Tenant-Scoped Storage Uploads
   */
  async getCafeImages(cafeId: string): Promise<{ success: boolean; images: CafeImage[]; error?: string }> {
    if (!isSupabaseConfigured) {
      const imgs = localMockImages.get(cafeId) || [];
      return { success: true, images: imgs };
    }

    try {
      const { data, error } = await supabase
        .from('cafe_images')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('display_order', { ascending: true });

      if (error) {
        return { success: false, images: [], error: error.message };
      }

      return { success: true, images: data || [] };
    } catch (err: any) {
      return { success: false, images: [], error: err.message || 'Failed to fetch cafe images' };
    }
  },

  async uploadCafeImage(
    cafeId: string,
    file: File,
    caption?: string
  ): Promise<{ success: boolean; url: string; imageRecord?: CafeImage; error?: string }> {
    // 1. File validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        url: '',
        error: 'Invalid file type. Only JPG, PNG, WEBP, and GIF images are supported.',
      };
    }

    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE_BYTES) {
      return {
        success: false,
        url: '',
        error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 5 MB.`,
      };
    }

    if (!isSupabaseConfigured) {
      // Local evaluation fallback: Generate an object URL or base64 placeholder
      const mockUrl = URL.createObjectURL(file);
      const mockRecord: CafeImage = {
        id: `img-${Date.now()}`,
        cafe_id: cafeId,
        image_url: mockUrl,
        caption: caption || file.name,
        display_order: 0,
      };
      const imgs = localMockImages.get(cafeId) || [];
      localMockImages.set(cafeId, [...imgs, mockRecord]);
      return { success: true, url: mockUrl, imageRecord: mockRecord };
    }

    try {
      // 2. Tenant-scoped path: cafe-images/{cafe_id}/{timestamp}-{cleanFileName}
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanBase = file.name
        .substring(0, file.name.lastIndexOf('.'))
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 30);
      const uniqueFileName = `${Date.now()}-${cleanBase}.${fileExt}`;
      const filePath = `${cafeId}/${uniqueFileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cafe-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError || !uploadData) {
        return {
          success: false,
          url: '',
          error: uploadError?.message || 'Storage upload failed',
        };
      }

      // 3. Retrieve public URL
      const { data: publicUrlData } = supabase.storage.from('cafe-images').getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;

      // 4. Save metadata into cafe_images table
      const { data: imgRecord, error: imgError } = await supabase
        .from('cafe_images')
        .insert({
          cafe_id: cafeId,
          image_url: publicUrl,
          caption: caption || file.name,
          display_order: 0,
        })
        .select()
        .single();

      if (imgError) {
        console.warn('Failed to insert cafe_images record:', imgError);
      }

      return {
        success: true,
        url: publicUrl,
        imageRecord: imgRecord || undefined,
      };
    } catch (err: any) {
      return {
        success: false,
        url: '',
        error: err.message || 'An unexpected error occurred during image upload',
      };
    }
  },

  async deleteCafeImage(
    imageId: string,
    imageUrl?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) {
      for (const [cafeId, imgs] of localMockImages.entries()) {
        localMockImages.set(
          cafeId,
          imgs.filter((i) => i.id !== imageId)
        );
      }
      return { success: true };
    }

    try {
      // 1. Delete DB record
      const { error: dbError } = await supabase.from('cafe_images').delete().eq('id', imageId);
      if (dbError) {
        return { success: false, error: dbError.message };
      }

      // 2. Best-effort remove from storage bucket if URL contains path
      if (imageUrl && imageUrl.includes('/cafe-images/')) {
        const parts = imageUrl.split('/cafe-images/');
        if (parts.length > 1) {
          const storagePath = parts[1].split('?')[0];
          await supabase.storage.from('cafe-images').remove([storagePath]);
        }
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete cafe image' };
    }
  },

  /**
   * 10. Setup Completeness & Readiness Calculator
   */
  calculateSetupCompleteness(
    cafe: Cafe | null,
    hours: CafeOpeningHours[],
    amenities: AmenityKey[],
    categories: MenuCategory[],
    items: MenuItem[]
  ): SetupCompleteness {
    if (!cafe) {
      return {
        score: 0,
        isReadyForSubmission: false,
        steps: {
          basicProfile: false,
          locationContact: false,
          brandingImages: false,
          openingHours: false,
          amenities: false,
          menuSetup: false,
        },
        missingRequirements: ['Create initial cafe profile'],
      };
    }

    const missing: string[] = [];

    // 1. Basic Profile (Name, Description)
    const hasName = Boolean(cafe.name && cafe.name.trim().length >= 3);
    const hasDesc = Boolean(cafe.description && cafe.description.trim().length >= 10);
    const basicProfile = hasName && hasDesc;
    if (!basicProfile) missing.push('Complete cafe name and detailed description');

    // 2. Location & Contact (Address, City, Phone)
    const hasAddress = Boolean(cafe.address && cafe.address.trim().length >= 5);
    const hasCity = Boolean(cafe.city && cafe.city.trim().length >= 2);
    const hasPhone = Boolean(cafe.phone && cafe.phone.trim().length >= 8);
    const locationContact = hasAddress && hasCity && hasPhone;
    if (!locationContact) missing.push('Provide street address, city, and primary contact phone');

    // 3. Branding & Images (Cover image or Logo)
    const hasBranding = Boolean(cafe.cover_image || cafe.logo_url);
    if (!hasBranding) missing.push('Upload a cafe cover photo or logo');

    // 4. Opening Hours (At least 1 day configured with open status)
    const hasHours = hours.length > 0 && hours.some((h) => h.is_open);
    if (!hasHours) missing.push('Configure operating hours for at least one day');

    // 5. Amenities (At least 1 amenity selected)
    const hasAmenities = amenities.length > 0;
    if (!hasAmenities) missing.push('Select at least one cafe amenity');

    // 6. Menu Setup (At least 1 category and 1 item)
    const hasMenu = categories.length > 0 && items.length > 0;
    if (!hasMenu) missing.push('Create at least one menu category with at least one menu item');

    // Weighted Score
    let score = 0;
    if (basicProfile) score += 20;
    if (locationContact) score += 20;
    if (hasBranding) score += 15;
    if (hasHours) score += 15;
    if (hasAmenities) score += 10;
    if (hasMenu) score += 20;

    const isReadyForSubmission = basicProfile && locationContact && hasHours && hasMenu;

    return {
      score,
      isReadyForSubmission,
      steps: {
        basicProfile,
        locationContact,
        brandingImages: hasBranding,
        openingHours: hasHours,
        amenities: hasAmenities,
        menuSetup: hasMenu,
      },
      missingRequirements: missing,
    };
  },
};
