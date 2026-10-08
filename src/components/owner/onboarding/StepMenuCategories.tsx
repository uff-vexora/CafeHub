import React, { useState } from 'react';
import { MenuCategory } from '../../../types';
import { Layers, Plus, Edit2, Trash2, Check, X, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface StepMenuCategoriesProps {
  categories: MenuCategory[];
  onCreateCategory: (name: string, displayOrder: number) => Promise<{ success: boolean; error?: string }>;
  onUpdateCategory: (id: string, updates: { name?: string; display_order?: number }) => Promise<{ success: boolean; error?: string }>;
  onDeleteCategory: (id: string) => Promise<{ success: boolean; error?: string }>;
  onNext: () => void;
  onBack: () => void;
}

const POPULAR_CATEGORY_SUGGESTIONS = [
  'Specialty Coffee',
  'Manual Brews',
  'Tea & Matcha',
  'Artisan Bakes & Sourdough',
  'All-Day Breakfast',
  'Gourmet Sandwiches',
  'Desserts & Cakes',
  'Cold Beverages',
];

export const StepMenuCategories: React.FC<StepMenuCategoriesProps> = ({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onNext,
  onBack,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (nameToCreate?: string) => {
    const targetName = (nameToCreate || newCatName).trim();
    if (!targetName) return;

    if (categories.some((c) => c.name.toLowerCase() === targetName.toLowerCase())) {
      setError(`Category "${targetName}" already exists.`);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const res = await onCreateCategory(targetName, categories.length);
      if (res.success) {
        setNewCatName('');
      } else {
        setError(res.error || 'Failed to create menu category.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (cat: MenuCategory) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleSaveEdit = async (catId: string) => {
    if (!editingName.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await onUpdateCategory(catId, { name: editingName.trim() });
      if (res.success) {
        setEditingId(null);
        setEditingName('');
      } else {
        setError(res.error || 'Failed to update category name.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (catId: string) => {
    if (!confirm('Are you sure you want to remove this category?')) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await onDeleteCategory(catId);
      if (!res.success) {
        setError(res.error || 'Failed to delete category.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
        <div>
          <h3 className="text-lg font-serif font-bold text-espresso-950 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            <span>Menu Categories</span>
          </h3>
          <p className="text-xs text-coffee-600 mt-1">
            Organize your dishes and drinks into sections like Coffee, Breakfast, and Bakery.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Add new category (e.g. Pour Over Bar, Brunch Specials)..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreate())}
            className="flex-1 bg-cream-50 border border-cream-200 rounded-2xl px-4 py-3 text-xs text-espresso-950 font-medium outline-none focus:border-amber-600 focus:bg-white transition-all shadow-xs"
          />
          <button
            type="button"
            onClick={() => handleCreate()}
            disabled={!newCatName.trim() || isSubmitting}
            className="px-5 py-3 bg-espresso-900 hover:bg-espresso-950 disabled:opacity-50 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Popular Suggestions */}
        <div>
          <span className="text-[11px] font-bold text-coffee-500 uppercase tracking-wider block mb-2">
            Quick Add Suggestions:
          </span>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CATEGORY_SUGGESTIONS.map((preset) => {
              const alreadyAdded = categories.some(
                (c) => c.name.toLowerCase() === preset.toLowerCase()
              );
              if (alreadyAdded) return null;

              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleCreate(preset)}
                  className="px-3 py-1.5 bg-cream-100 hover:bg-amber-100/70 border border-cream-200 text-espresso-900 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-amber-700" />
                  <span>{preset}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Existing Categories List */}
        <div className="space-y-2 pt-2 border-t border-cream-100">
          <span className="text-xs font-bold text-espresso-900 block mb-3">
            Active Categories ({categories.length})
          </span>

          {categories.length === 0 ? (
            <div className="p-8 text-center bg-cream-50/50 rounded-2xl border border-dashed border-cream-300">
              <Layers className="w-8 h-8 text-coffee-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-espresso-900">No categories created yet</p>
              <p className="text-[11px] text-coffee-500 mt-0.5">
                Add at least one category above or click a quick suggestion to organize your menu items.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-cream-100 border border-cream-200 rounded-2xl overflow-hidden">
              {categories.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="p-3.5 sm:p-4 bg-white hover:bg-cream-50/50 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-cream-100 text-coffee-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    {editingId === cat.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="bg-cream-50 border border-cream-300 rounded-xl px-3 py-1.5 text-xs text-espresso-900 outline-none w-full max-w-sm"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(cat.id)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1.5 text-coffee-400 hover:bg-cream-100 rounded-lg cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-espresso-950 truncate">{cat.name}</span>
                    )}
                  </div>

                  {editingId !== cat.id && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        className="p-2 text-coffee-600 hover:text-espresso-950 hover:bg-cream-100 rounded-xl transition-colors cursor-pointer"
                        title="Rename Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 text-xs font-bold text-coffee-700 hover:text-espresso-950 hover:bg-cream-100 rounded-2xl transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Amenities</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (categories.length === 0) {
              setError('Please create at least one menu category (or select from popular suggestions above) before proceeding.');
              return;
            }
            onNext();
          }}
          className="px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl transition-all shadow-warm hover:shadow-warm-md flex items-center gap-2 text-xs cursor-pointer"
        >
          <span>Continue to Menu Items</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
