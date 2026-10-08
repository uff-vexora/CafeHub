import React, { useState } from 'react';
import { MenuItem, MenuCategory } from '../../../types';
import { VegNonVegIndicator } from '../../common/Badge';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { ownerService } from '../../../services/ownerService';

interface StepMenuItemsProps {
  cafeId: string;
  categories: MenuCategory[];
  items: MenuItem[];
  onCreateItem: (item: Omit<MenuItem, 'id' | 'cafe_id'>) => Promise<{ success: boolean; item?: MenuItem; error?: string }>;
  onUpdateItem: (id: string, updates: Partial<MenuItem>) => Promise<{ success: boolean; item?: MenuItem; error?: string }>;
  onDeleteItem: (id: string) => Promise<{ success: boolean; error?: string }>;
  onToggleAvailability: (id: string, isAvailable: boolean) => Promise<{ success: boolean; error?: string }>;
  onNext: () => void;
  onBack: () => void;
}

export const StepMenuItems: React.FC<StepMenuItemsProps> = ({
  cafeId,
  categories,
  items,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  onToggleAvailability,
  onNext,
  onBack,
}) => {
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('All');
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [price, setPrice] = useState<number>(200);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setPrice(220);
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1572442388796-11668ba67e53?auto=format&fit=crop&w=600&q=80');
    setIsVeg(true);
    setIsAvailable(true);
    setError(null);
    setShowItemModal(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategoryId(item.category_id || categories[0]?.id || '');
    setPrice(item.price);
    setDescription(item.description || '');
    setImageUrl(item.image_url || '');
    setIsVeg(item.is_veg);
    setIsAvailable(item.is_available);
    setError(null);
    setShowItemModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const res = await ownerService.uploadCafeImage(cafeId, file, name || 'Menu Item');
      if (res.success && res.url) {
        setImageUrl(res.url);
      } else {
        setError(res.error || 'Failed to upload image.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Item name is required.');
      return;
    }
    if (price <= 0) {
      setError('Price must be greater than zero.');
      return;
    }

    const matchedCategory = categories.find((c) => c.id === categoryId);
    const categoryName = matchedCategory ? matchedCategory.name : 'General';

    setError(null);
    setIsSubmitting(true);
    try {
      if (editingItem) {
        const res = await onUpdateItem(editingItem.id, {
          name: name.trim(),
          category_id: categoryId,
          category_name: categoryName,
          price: Number(price),
          description: description.trim(),
          image_url: imageUrl,
          is_veg: isVeg,
          is_available: isAvailable,
        });
        if (!res.success) {
          setError(res.error || 'Failed to update item.');
          return;
        }
      } else {
        const res = await onCreateItem({
          category_id: categoryId,
          category_name: categoryName,
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          image_url: imageUrl,
          is_veg: isVeg,
          is_available: isAvailable,
        });
        if (!res.success) {
          setError(res.error || 'Failed to create item.');
          return;
        }
      }
      setShowItemModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    const res = await onDeleteItem(itemId);
    if (!res.success) {
      alert(res.error || 'Failed to delete menu item.');
    }
  };

  const filteredItems = selectedFilterCategory === 'All'
    ? items
    : items.filter((i) => i.category_id === selectedFilterCategory || i.category_name === selectedFilterCategory);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-serif font-bold text-espresso-950 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-amber-600" />
              <span>Menu Items & Catalog</span>
            </h3>
            <p className="text-xs text-coffee-600 mt-1">
              Add your beverages, specialty roasts, savory plates, and desserts.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-warm hover:shadow-warm-md cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>

        {/* Filter Categories Bar */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedFilterCategory('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedFilterCategory === 'All'
                  ? 'bg-espresso-900 text-white'
                  : 'bg-cream-100 text-espresso-900 hover:bg-cream-200'
              }`}
            >
              All Items ({items.length})
            </button>
            {categories.map((c) => {
              const count = items.filter((i) => i.category_id === c.id).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedFilterCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    selectedFilterCategory === c.id
                      ? 'bg-espresso-900 text-white'
                      : 'bg-cream-100 text-espresso-900 hover:bg-cream-200'
                  }`}
                >
                  {c.name} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Item List / Grid */}
        {filteredItems.length === 0 ? (
          <div className="p-10 text-center bg-cream-50/50 rounded-2xl border border-dashed border-cream-300">
            <UtensilsCrossed className="w-10 h-10 text-coffee-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-espresso-900">No menu items added yet</p>
            <p className="text-[11px] text-coffee-500 mt-1 max-w-sm mx-auto">
              Add your signature items, pricing, and dietary preferences to complete your menu setup.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Item</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border border-cream-200 bg-white hover:border-amber-300 transition-all flex items-start gap-3 shadow-xs"
              >
                {/* Image */}
                <img
                  src={
                    item.image_url ||
                    'https://images.unsplash.com/photo-1572442388796-11668ba67e53?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 bg-cream-100"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <VegNonVegIndicator isVeg={item.is_veg} />
                    <span className="text-xs font-bold text-espresso-950 truncate">{item.name}</span>
                  </div>
                  <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                    {item.category_name || 'General'}
                  </div>
                  <p className="text-[11px] text-coffee-500 line-clamp-1 mt-0.5">
                    {item.description || 'No description provided.'}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-cream-100">
                    <span className="text-xs font-bold text-espresso-900 font-serif">₹{item.price}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onToggleAvailability(item.id, !item.is_available)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                          item.is_available
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.is_available ? 'In Stock' : 'Out of Stock'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="p-1 text-coffee-600 hover:text-espresso-950 hover:bg-cream-100 rounded-lg cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add / Edit Item */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-espresso-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-cream-200 shadow-warm-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-cream-200 bg-cream-50/60 flex items-center justify-between">
              <span className="font-serif font-bold text-base text-espresso-950">
                {editingItem ? 'Edit Menu Item' : 'New Menu Item'}
              </span>
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="p-1.5 text-coffee-400 hover:text-espresso-950 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-espresso-900 mb-1">
                  Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pour Over (Ethiopia Yirgacheffe)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 outline-none font-medium text-xs focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-espresso-900 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3 py-2.5 outline-none font-medium text-xs focus:border-amber-600 focus:bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-espresso-900 mb-1">
                    Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 outline-none font-medium text-xs focus:border-amber-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-espresso-900 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Tasting notes, portion size, roast profile..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-cream-50 border border-cream-200 rounded-xl p-3 outline-none text-xs focus:border-amber-600 focus:bg-white"
                />
              </div>

              {/* Photo Upload & URL */}
              <div>
                <label className="block font-bold text-espresso-900 mb-1">Item Photo</label>
                <div className="flex items-center gap-3">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-cream-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-cream-100 flex items-center justify-center text-coffee-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream-100 hover:bg-cream-200 rounded-xl text-xs font-bold text-espresso-900 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-coffee-400 block mt-1">Or paste a direct photo URL</span>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between pt-2 border-t border-cream-100">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-espresso-900">
                  <input
                    type="checkbox"
                    checked={isVeg}
                    onChange={(e) => setIsVeg(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <VegNonVegIndicator isVeg={isVeg} />
                  <span>Vegetarian</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-espresso-900">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Currently Available</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-cream-100">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-coffee-600 hover:text-espresso-950 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-warm cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 text-xs font-bold text-coffee-700 hover:text-espresso-950 hover:bg-cream-100 rounded-2xl transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Categories</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl transition-all shadow-warm hover:shadow-warm-md flex items-center gap-2 text-xs cursor-pointer"
        >
          <span>Continue to Photos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
