import React, { useState, useEffect } from 'react';
import { Cafe } from '../../../types';
import { Store, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

interface StepBasicInfoProps {
  cafe: Cafe | null;
  onSave: (data: {
    name: string;
    tagline: string;
    description: string;
    price_range: '₹' | '₹₹' | '₹₹₹';
  }) => Promise<{ success: boolean; error?: string }>;
  isSaving: boolean;
}

export const StepBasicInfo: React.FC<StepBasicInfoProps> = ({ cafe, onSave, isSaving }) => {
  const [name, setName] = useState(cafe?.name || '');
  const [tagline, setTagline] = useState(cafe?.tagline || '');
  const [description, setDescription] = useState(cafe?.description || '');
  const [priceRange, setPriceRange] = useState<'₹' | '₹₹' | '₹₹₹'>(cafe?.price_range || '₹₹');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cafe) {
      setName(cafe.name || '');
      setTagline(cafe.tagline || '');
      setDescription(cafe.description || '');
      setPriceRange(cafe.price_range || '₹₹');
    }
  }, [cafe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanTagline = tagline.trim();
    const cleanDesc = description.trim();

    if (!cleanName || cleanName.length < 3) {
      setError('Cafe name is required and must be at least 3 characters long.');
      return;
    }

    if (!cleanDesc || cleanDesc.length < 10) {
      setError('Please provide a meaningful description of at least 10 characters.');
      return;
    }

    const res = await onSave({
      name: cleanName,
      tagline: cleanTagline,
      description: cleanDesc,
      price_range: priceRange,
    });

    if (!res.success) {
      setError(res.error || 'Failed to save cafe information. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-6">
        <div>
          <h3 className="text-lg font-serif font-bold text-espresso-950 flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-600" />
            <span>Tell Us About Your Cafe</span>
          </h3>
          <p className="text-xs text-coffee-600 mt-1">
            This information will be displayed on your public storefront and search cards.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Cafe Name */}
        <div>
          <label className="block text-xs font-bold text-espresso-900 mb-1.5">
            Cafe Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={80}
            placeholder="e.g. Subko Coffee Roasters, Third Wave Coffee..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-cream-50 border border-cream-200 rounded-2xl px-4 py-3 text-xs text-espresso-950 font-medium outline-none focus:border-amber-600 focus:bg-white transition-all shadow-xs"
          />
          <p className="text-[11px] text-coffee-400 mt-1">
            Must be at least 3 characters. This will be used to generate your permanent URL slug.
          </p>
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-xs font-bold text-espresso-900 mb-1.5">
            Tagline / One-line Pitch
          </label>
          <input
            type="text"
            maxLength={100}
            placeholder="e.g. Specialty Micro-Roastery & Sourdough Bakehouse"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full bg-cream-50 border border-cream-200 rounded-2xl px-4 py-3 text-xs text-espresso-950 outline-none focus:border-amber-600 focus:bg-white transition-all shadow-xs"
          />
          <p className="text-[11px] text-coffee-400 mt-1">
            A short subtitle that captures your cafe's essence (up to 100 characters).
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-espresso-900 mb-1.5">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            maxLength={1000}
            placeholder="Describe your coffee origin, brewing methods, cafe ambiance, seating capacity, signature eats..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-cream-50 border border-cream-200 rounded-2xl p-4 text-xs text-espresso-950 outline-none focus:border-amber-600 focus:bg-white transition-all leading-relaxed shadow-xs"
          />
          <div className="flex justify-between items-center text-[11px] text-coffee-400 mt-1">
            <span>Minimum 10 characters required for admin verification.</span>
            <span>{description.length} / 1000</span>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-xs font-bold text-espresso-900 mb-2">
            Average Price Range
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: '₹', label: 'Budget Friendly', desc: 'Under ₹200 / person' },
              { id: '₹₹', label: 'Mid Range', desc: '₹200 - ₹500 / person' },
              { id: '₹₹₹', label: 'Fine / Specialty', desc: '₹500+ / person' },
            ].map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => setPriceRange(tier.id as any)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  priceRange === tier.id
                    ? 'border-amber-600 bg-amber-50/60 shadow-xs'
                    : 'border-cream-200 bg-cream-50/40 hover:bg-cream-100'
                }`}
              >
                <div className="text-sm font-bold text-amber-700">{tier.id}</div>
                <div className="text-xs font-bold text-espresso-900 mt-1">{tier.label}</div>
                <div className="text-[10px] text-coffee-500 mt-0.5">{tier.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs text-coffee-500 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Progress auto-saves to your secure merchant profile.</span>
        </div>

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
