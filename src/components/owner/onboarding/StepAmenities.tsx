import React, { useState, useEffect } from 'react';
import { AmenityKey, ALL_AMENITY_OPTIONS } from '../../../types';
import { Sparkles, AlertCircle, ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface StepAmenitiesProps {
  initialAmenities: AmenityKey[];
  onSave: (amenities: AmenityKey[]) => Promise<{ success: boolean; error?: string }>;
  onBack: () => void;
  isSaving: boolean;
}

export const StepAmenities: React.FC<StepAmenitiesProps> = ({
  initialAmenities,
  onSave,
  onBack,
  isSaving,
}) => {
  const [selected, setSelected] = useState<AmenityKey[]>(initialAmenities || []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialAmenities) {
      setSelected(initialAmenities);
    }
  }, [initialAmenities]);

  const toggleAmenity = (key: AmenityKey) => {
    if (selected.includes(key)) {
      setSelected(selected.filter((k) => k !== key));
    } else {
      setSelected([...selected, key]);
    }
  };

  const selectAll = () => {
    setSelected(ALL_AMENITY_OPTIONS.map((a) => a.key));
  };

  const clearAll = () => {
    setSelected([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selected.length === 0) {
      setError('Please select at least one amenity so diners know what to expect.');
      return;
    }

    const res = await onSave(selected);
    if (!res.success) {
      setError(res.error || 'Failed to save amenities.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-serif font-bold text-espresso-950 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>Cafe Amenities & Features</span>
            </h3>
            <p className="text-xs text-coffee-600 mt-1">
              Highlight the comforts, facilities, and unique perks that attract diners to your space.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="px-3 py-1.5 bg-cream-100 hover:bg-cream-200 text-espresso-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="px-3 py-1.5 bg-cream-100 hover:bg-cream-200 text-espresso-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Amenity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ALL_AMENITY_OPTIONS.map((item) => {
            const isSelected = selected.includes(item.key);

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleAmenity(item.key)}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50/70 shadow-xs'
                    : 'border-cream-200 bg-cream-50/40 hover:bg-cream-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <span className="text-xs font-bold text-espresso-950 block">{item.label}</span>
                    <span className="text-[10px] text-coffee-500">
                      {isSelected ? 'Available at venue' : 'Click to enable'}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'border-amber-600 bg-amber-600 text-white'
                      : 'border-cream-300 bg-white text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
          <span>Selected Amenities:</span>
          <span className="font-bold">
            {selected.length} of {ALL_AMENITY_OPTIONS.length} enabled
          </span>
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
          <span>Back to Hours</span>
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-warm hover:shadow-warm-md flex items-center gap-2 text-xs cursor-pointer"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Save & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
