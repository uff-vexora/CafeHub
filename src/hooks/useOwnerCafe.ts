import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ownerService, SetupCompleteness } from '../services/ownerService';
import {
  Cafe,
  CafeOpeningHours,
  AmenityKey,
  MenuCategory,
  MenuItem,
  CafeImage,
} from '../types';

export const useOwnerCafe = () => {
  const { user } = useAuth();
  const { syncOwnerCafe } = useData();

  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [openingHours, setOpeningHours] = useState<CafeOpeningHours[]>([]);
  const [amenities, setAmenities] = useState<AmenityKey[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [images, setImages] = useState<CafeImage[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load all owner data
  const loadOwnerData = useCallback(async () => {
    if (!user || user.role !== 'cafe_owner') {
      setIsLoading(false);
      setCafe(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch Owner's Cafe (strictly tenant-isolated)
      const cafeRes = await ownerService.getOwnerCafe(user.id);
      if (!cafeRes.success) {
        setError(cafeRes.error || 'Failed to load cafe profile');
        setIsLoading(false);
        return;
      }

      const currentCafe = cafeRes.cafe;
      setCafe(currentCafe);

      if (currentCafe) {
        // Keep DataContext synced
        syncOwnerCafe(currentCafe);

        // 2. Fetch all dependent collections in parallel
        const [hoursRes, amenitiesRes, catsRes, itemsRes, imgsRes] = await Promise.all([
          ownerService.getOpeningHours(currentCafe.id),
          ownerService.getAmenities(currentCafe.id),
          ownerService.getMenuCategories(currentCafe.id),
          ownerService.getMenuItems(currentCafe.id),
          ownerService.getCafeImages(currentCafe.id),
        ]);

        if (hoursRes.success) setOpeningHours(hoursRes.hours);
        if (amenitiesRes.success) setAmenities(amenitiesRes.amenities);
        if (catsRes.success) setMenuCategories(catsRes.categories);
        if (itemsRes.success) setMenuItems(itemsRes.items);
        if (imgsRes.success) setImages(imgsRes.images);
      } else {
        setOpeningHours([]);
        setAmenities([]);
        setMenuCategories([]);
        setMenuItems([]);
        setImages([]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred loading your cafe data');
    } finally {
      setIsLoading(false);
    }
  }, [user, syncOwnerCafe]);

  useEffect(() => {
    loadOwnerData();
  }, [loadOwnerData]);

  // Compute live setup completeness score
  const completeness: SetupCompleteness = useMemo(() => {
    return ownerService.calculateSetupCompleteness(
      cafe,
      openingHours,
      amenities,
      menuCategories,
      menuItems
    );
  }, [cafe, openingHours, amenities, menuCategories, menuItems]);

  // Mutations
  const createCafe = async (params: {
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
  }) => {
    if (!user) return { success: false, error: 'User is not authenticated' };
    setActionLoading('createCafe');
    try {
      const res = await ownerService.createOwnerCafe({
        ...params,
        owner_id: user.id,
      });

      if (res.success && res.cafe) {
        setCafe(res.cafe);
        syncOwnerCafe(res.cafe);
        await loadOwnerData();
        return { success: true, cafe: res.cafe };
      }
      return { success: false, error: res.error || 'Failed to create cafe' };
    } finally {
      setActionLoading(null);
    }
  };

  const updateCafe = async (updates: Partial<Cafe>) => {
    if (!cafe) return { success: false, error: 'No cafe registered' };
    setActionLoading('updateCafe');
    try {
      const res = await ownerService.updateOwnerCafe(cafe.id, updates);
      if (res.success && res.cafe) {
        setCafe(res.cafe);
        syncOwnerCafe(res.cafe);
        return { success: true, cafe: res.cafe };
      }
      return { success: false, error: res.error || 'Failed to update cafe' };
    } finally {
      setActionLoading(null);
    }
  };

  const submitForApproval = async () => {
    if (!cafe) return { success: false, error: 'No cafe registered' };
    setActionLoading('submitForApproval');
    try {
      const res = await ownerService.submitCafeForApproval(cafe.id);
      if (res.success) {
        const updatedCafe: Cafe = {
          ...cafe,
          status: 'pending_approval',
          submitted_at: new Date().toISOString(),
        };
        setCafe(updatedCafe);
        syncOwnerCafe(updatedCafe);
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to submit cafe' };
    } finally {
      setActionLoading(null);
    }
  };

  const saveOpeningHours = async (hours: CafeOpeningHours[]) => {
    if (!cafe) return { success: false, error: 'No cafe registered' };
    setActionLoading('saveHours');
    try {
      const res = await ownerService.upsertOpeningHours(cafe.id, hours);
      if (res.success) {
        setOpeningHours(hours);
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to update opening hours' };
    } finally {
      setActionLoading(null);
    }
  };

  const saveAmenities = async (newAmenities: AmenityKey[]) => {
    if (!cafe) return { success: false, error: 'No cafe registered' };
    setActionLoading('saveAmenities');
    try {
      const res = await ownerService.updateAmenities(cafe.id, newAmenities);
      if (res.success) {
        setAmenities(newAmenities);
        const updatedCafe = { ...cafe, amenities: newAmenities };
        setCafe(updatedCafe);
        syncOwnerCafe(updatedCafe);
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to update amenities' };
    } finally {
      setActionLoading(null);
    }
  };

  const createCategory = async (name: string, displayOrder = 0) => {
    if (!cafe) return { success: false, error: 'No cafe registered' };
    setActionLoading('createCategory');
    try {
      const res = await ownerService.createMenuCategory(cafe.id, name, displayOrder);
      if (res.success && res.category) {
        setMenuCategories((prev) => [...prev, res.category!]);
        return { success: true, category: res.category };
      }
      return { success: false, error: res.error || 'Failed to create menu category' };
    } finally {
      setActionLoading(null);
    }
  };

  const updateCategory = async (categoryId: string, updates: { name?: string; display_order?: number }) => {
    setActionLoading('updateCategory');
    try {
      const res = await ownerService.updateMenuCategory(categoryId, updates);
      if (res.success) {
        setMenuCategories((prev) =>
          prev.map((c) => (c.id === categoryId ? { ...c, ...updates } : c))
        );
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to update category' };
    } finally {
      setActionLoading(null);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    setActionLoading('deleteCategory');
    try {
      const res = await ownerService.deleteMenuCategory(categoryId);
      if (res.success) {
        setMenuCategories((prev) => prev.filter((c) => c.id !== categoryId));
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to delete category' };
    } finally {
      setActionLoading(null);
    }
  };

  const createMenuItem = async (itemData: Omit<MenuItem, 'id' | 'cafe_id'>) => {
    if (!cafe) return { success: false, error: 'No cafe registered' };
    setActionLoading('createMenuItem');
    try {
      const res = await ownerService.createMenuItem({
        ...itemData,
        cafe_id: cafe.id,
      });
      if (res.success && res.item) {
        setMenuItems((prev) => [...prev, res.item!]);
        return { success: true, item: res.item };
      }
      return { success: false, error: res.error || 'Failed to create menu item' };
    } finally {
      setActionLoading(null);
    }
  };

  const updateMenuItem = async (itemId: string, updates: Partial<MenuItem>) => {
    setActionLoading('updateMenuItem');
    try {
      const res = await ownerService.updateMenuItem(itemId, updates);
      if (res.success && res.item) {
        setMenuItems((prev) => prev.map((item) => (item.id === itemId ? res.item! : item)));
        return { success: true, item: res.item };
      }
      return { success: false, error: res.error || 'Failed to update menu item' };
    } finally {
      setActionLoading(null);
    }
  };

  const toggleItemAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      const res = await ownerService.updateMenuItemAvailability(itemId, isAvailable);
      if (res.success) {
        setMenuItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, is_available: isAvailable } : item))
        );
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to toggle availability' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    setActionLoading('deleteMenuItem');
    try {
      const res = await ownerService.deleteMenuItem(itemId);
      if (res.success) {
        setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to delete menu item' };
    } finally {
      setActionLoading(null);
    }
  };

  const uploadImage = async (file: File, caption?: string) => {
    if (!cafe) return { success: false, error: 'No cafe registered' };
    setActionLoading('uploadImage');
    try {
      const res = await ownerService.uploadCafeImage(cafe.id, file, caption);
      if (res.success) {
        if (res.imageRecord) {
          setImages((prev) => [...prev, res.imageRecord!]);
        }
        return { success: true, url: res.url };
      }
      return { success: false, error: res.error || 'Upload failed' };
    } finally {
      setActionLoading(null);
    }
  };

  const deleteImage = async (imageId: string, imageUrl?: string) => {
    setActionLoading('deleteImage');
    try {
      const res = await ownerService.deleteCafeImage(imageId, imageUrl);
      if (res.success) {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
        return { success: true };
      }
      return { success: false, error: res.error || 'Failed to delete image' };
    } finally {
      setActionLoading(null);
    }
  };

  return {
    cafe,
    openingHours,
    amenities,
    menuCategories,
    menuItems,
    images,
    isLoading,
    actionLoading,
    error,
    completeness,
    refresh: loadOwnerData,
    createCafe,
    updateCafe,
    submitForApproval,
    saveOpeningHours,
    saveAmenities,
    createCategory,
    updateCategory,
    deleteCategory,
    createMenuItem,
    updateMenuItem,
    toggleItemAvailability,
    deleteMenuItem,
    uploadImage,
    deleteImage,
  };
};
