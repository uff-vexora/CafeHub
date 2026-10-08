import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MapPin,
  SlidersHorizontal,
  X,
  Star,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { CafeCard } from '../components/cards/CafeCard';
import { EmptyState } from '../components/common/EmptyState';
import { AmenityKey } from '../types';
import { CITIES } from '../components/layout/Navbar';
import {
  TiltCard,
  Reveal,
  PinnedStoryScene,
  SectionOverlapBridge,
} from '../components/motion';
import { LivingCafeHero, ObjectJourneyTrack } from '../components/cafe-world';

const AMENITY_LABELS: Record<AmenityKey, string> = {
  wifi: 'Fast Wi-Fi',
  air_conditioning: 'Air Conditioning',
  outdoor_seating: 'Outdoor Seating',
  parking: 'Parking Available',
  pet_friendly: 'Pet Friendly',
  power_outlets: 'Power Outlets',
  work_friendly: 'Work Friendly',
};

const CATEGORIES = [
  'All Categories',
  'Coffee',
  'Breakfast',
  'Brunch',
  'Bakery',
  'Desserts',
  'Work-friendly',
  'Outdoor seating',
  'Date night',
  'Snacks',
];

export const DiscoveryPage: React.FC = () => {
  const { cafes } = useData();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search params state
  const queryParam = searchParams.get('q') || '';
  const cityParam = searchParams.get('city') || 'All Cities';
  const categoryParam = searchParams.get('category') || 'All Categories';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCity, setSelectedCity] = useState(cityParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<AmenityKey[]>([]);
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'distance' | 'reviews' | 'price_asc'>('recommended');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state if URL query params change
  useEffect(() => {
    if (queryParam !== searchQuery) setSearchQuery(queryParam);
    if (cityParam !== selectedCity) setSelectedCity(cityParam);
    if (categoryParam !== selectedCategory) setSelectedCategory(categoryParam);
  }, [queryParam, cityParam, categoryParam]);

  const toggleAmenity = (key: AmenityKey) => {
    setSelectedAmenities((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
  };

  const togglePriceRange = (range: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(range) ? prev.filter((p) => p !== range) : [...prev, range]
    );
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCity('All Cities');
    setSelectedCategory('All Categories');
    setMinRating(0);
    setSelectedPriceRanges([]);
    setOnlyOpenNow(false);
    setSelectedAmenities([]);
    setSortBy('recommended');
    setSearchParams({});
  };

  const activeFiltersCount =
    (selectedCity !== 'All Cities' ? 1 : 0) +
    (selectedCategory !== 'All Categories' ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    selectedPriceRanges.length +
    (onlyOpenNow ? 1 : 0) +
    selectedAmenities.length;

  // Filter & Sort Logic
  const filteredCafes = useMemo(() => {
    return cafes
      .filter((cafe) => {
        // Must be approved and live (never show draft, pending_approval, rejected, or suspended)
        if (!cafe.is_approved || (cafe.status && cafe.status !== 'approved')) return false;

        // Search text: cafe name, location, categories, description
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = cafe.name.toLowerCase().includes(q);
          const matchCity = cafe.city.toLowerCase().includes(q);
          const matchDesc = cafe.description.toLowerCase().includes(q);
          const matchCat = cafe.categories.some((c) => c.toLowerCase().includes(q));
          if (!matchName && !matchCity && !matchDesc && !matchCat) return false;
        }

        // City
        if (selectedCity !== 'All Cities' && cafe.city.toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }

        // Category
        if (selectedCategory !== 'All Categories' && !cafe.categories.includes(selectedCategory)) {
          return false;
        }

        // Min Rating
        if (minRating > 0 && cafe.rating < minRating) {
          return false;
        }

        // Price range
        if (selectedPriceRanges.length > 0 && !selectedPriceRanges.includes(cafe.price_range)) {
          return false;
        }

        // Open now
        if (onlyOpenNow && !cafe.is_open) {
          return false;
        }

        // Amenities (all selected must be present)
        if (
          selectedAmenities.length > 0 &&
          !selectedAmenities.every((amenity) => cafe.amenities.includes(amenity))
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'distance') return (a.distance_km || 99) - (b.distance_km || 99);
        if (sortBy === 'reviews') return b.review_count - a.review_count;
        if (sortBy === 'price_asc') {
          const map: Record<string, number> = { '₹': 1, '₹₹': 2, '₹₹₹': 3 };
          return (map[a.price_range] || 1) - (map[b.price_range] || 1);
        }
        // Recommended
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || b.rating - a.rating;
      });
  }, [
    cafes,
    searchQuery,
    selectedCity,
    selectedCategory,
    minRating,
    selectedPriceRanges,
    onlyOpenNow,
    selectedAmenities,
    sortBy,
  ]);

  // Sidebar Filter Form Content (Shared between desktop and mobile bottom sheet)
  const FilterContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-cream-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-terracotta-600" />
          <h3 className="font-serif font-bold text-base text-espresso-950">Filters</h3>
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={resetAllFilters}
            className="text-xs text-terracotta-600 hover:text-terracotta-700 font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset all
          </button>
        )}
      </div>

      {/* Category selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-coffee-500">
          Cafe Category
        </label>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                selectedCategory === cat
                  ? 'bg-espresso-900 text-white font-bold'
                  : 'text-espresso-800 hover:bg-cream-100'
              }`}
            >
              <span>{cat}</span>
              {selectedCategory === cat && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Rating filter */}
      <div className="space-y-2 pt-4 border-t border-cream-200">
        <label className="text-xs font-bold uppercase tracking-wider text-coffee-500">
          Minimum Rating
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[0, 4.0, 4.5].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setMinRating(val)}
              className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-1 ${
                minRating === val
                  ? 'bg-espresso-900 text-white border-espresso-900 shadow-sm'
                  : 'bg-white hover:bg-cream-100 text-espresso-800 border-cream-200'
              }`}
            >
              {val === 0 ? (
                'Any'
              ) : (
                <>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{val}+</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="space-y-2 pt-4 border-t border-cream-200">
        <label className="text-xs font-bold uppercase tracking-wider text-coffee-500">
          Price Range
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {['₹', '₹₹', '₹₹₹'].map((price) => {
            const isSelected = selectedPriceRanges.includes(price);
            return (
              <button
                key={price}
                type="button"
                onClick={() => togglePriceRange(price)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  isSelected
                    ? 'bg-espresso-900 text-white border-espresso-900 shadow-sm'
                    : 'bg-white hover:bg-cream-100 text-espresso-800 border-cream-200'
                }`}
              >
                {price}
              </button>
            );
          })}
        </div>
      </div>

      {/* Open now switch */}
      <div className="pt-4 border-t border-cream-200">
        <label className="flex items-center justify-between cursor-pointer py-1">
          <span className="text-xs font-bold text-espresso-900">Open Now Only</span>
          <input
            type="checkbox"
            checked={onlyOpenNow}
            onChange={(e) => setOnlyOpenNow(e.target.checked)}
            className="w-4 h-4 text-terracotta-600 rounded border-cream-300 focus:ring-terracotta-500 cursor-pointer"
          />
        </label>
      </div>

      {/* Amenities checklist */}
      <div className="space-y-2 pt-4 border-t border-cream-200">
        <label className="text-xs font-bold uppercase tracking-wider text-coffee-500">
          Amenities & Features
        </label>
        <div className="space-y-2">
          {(Object.keys(AMENITY_LABELS) as AmenityKey[]).map((key) => {
            const isChecked = selectedAmenities.includes(key);
            return (
              <label
                key={key}
                className="flex items-center gap-2.5 text-xs text-espresso-800 cursor-pointer hover:text-espresso-950"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleAmenity(key)}
                  className="w-4 h-4 text-terracotta-600 rounded border-cream-300 focus:ring-terracotta-500 cursor-pointer"
                />
                <span>{AMENITY_LABELS[key]}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7 animate-fade-up">

      {/* ── LIVING CINEMATIC HERO WORLD ─────────────────────────── */}
      <Reveal variant="scale-in" durationMs={650}>
        <LivingCafeHero
          totalCafesCount={filteredCafes.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          categories={CATEGORIES}
        />
      </Reveal>

      {/* ── INTER-SECTION OBJECT JOURNEY BRIDGE ────────────────── */}
      <ObjectJourneyTrack />

      {/* ── PINNED CINEMATIC STORY SCENE ───────────────────────── */}
      <PinnedStoryScene
        totalCafesCount={cafes.length}
        onExploreClick={() => {
          document.getElementById('directory-grid')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* ── TOOLBAR / CONTROLS WITH OVERLAPPING BRIDGE ───────── */}
      <div id="directory-grid" className="scroll-mt-24">
        <SectionOverlapBridge overlapDistance={-20} parallaxSpeed={0}>
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-cream-200 shadow-warm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Quick Location & Status info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-cream-50 hover:bg-cream-100 border border-cream-200 rounded-2xl transition-colors">
            <MapPin className="w-4 h-4 text-terracotta-600 shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-bold text-espresso-900 outline-none cursor-pointer"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-coffee-600 bg-cream-50/60 px-3.5 py-2.5 rounded-2xl border border-cream-200/60">
            <Sparkles className="w-3.5 h-3.5 text-caramel-500" />
            <span>
              <strong className="text-espresso-950 font-semibold">{filteredCafes.length}</strong> cafes available
            </span>
          </div>
        </div>

        {/* Right: Filter status and Mobile filter toggle */}
        <div className="flex items-center gap-2.5 justify-end">
          {searchQuery && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-terracotta-50 border border-terracotta-200 rounded-xl text-xs text-terracotta-700">
              <span>Searching: "{searchQuery}"</span>
              <button onClick={() => setSearchQuery('')} className="hover:text-terracotta-900">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-4 py-2.5 bg-espresso-900 hover:bg-espresso-850 text-white rounded-2xl text-xs font-bold shadow-warm shrink-0 transition-transform active:scale-95"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters ({activeFiltersCount})</span>
          </button>
        </div>
      </div>
    </SectionOverlapBridge>
  </div>

  {/* Main Grid: Sidebar Filters + Cafe Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm sticky top-28">
            {FilterContent}
          </div>
        </aside>

        {/* Right: Results Header & Cafe Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Controls Bar: Total Count & Sort By */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-espresso-950">
                {selectedCategory === 'All Categories' ? 'Specialty Cafes' : selectedCategory}
                {selectedCity !== 'All Cities' && (
                  <span className="text-coffee-600 font-normal"> in {selectedCity}</span>
                )}
              </h2>
              <p className="text-xs text-coffee-500 mt-0.5">
                Showing {filteredCafes.length} verified cafe{filteredCafes.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-coffee-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-cream-200 rounded-xl px-3 py-1.5 text-xs font-bold text-espresso-900 outline-none shadow-sm cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="rating">Highest Rated</option>
                <option value="distance">Nearest Distance</option>
                <option value="reviews">Most Reviewed</option>
                <option value="price_asc">Price: Low to High</option>
              </select>
            </div>
          </div>

          {/* Active Filter Badges */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-coffee-400 font-semibold">Active:</span>
              {selectedCity !== 'All Cities' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-cream-100 border border-cream-200 rounded-full text-xs font-semibold text-espresso-900">
                  {selectedCity}
                  <button onClick={() => setSelectedCity('All Cities')}>
                    <X className="w-3 h-3 text-coffee-500 hover:text-espresso-900" />
                  </button>
                </span>
              )}
              {selectedCategory !== 'All Categories' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-cream-100 border border-cream-200 rounded-full text-xs font-semibold text-espresso-900">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('All Categories')}>
                    <X className="w-3 h-3 text-coffee-500 hover:text-espresso-900" />
                  </button>
                </span>
              )}
              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-cream-100 border border-cream-200 rounded-full text-xs font-semibold text-espresso-900">
                  ★ {minRating}+
                  <button onClick={() => setMinRating(0)}>
                    <X className="w-3 h-3 text-coffee-500 hover:text-espresso-900" />
                  </button>
                </span>
              )}
              {selectedPriceRanges.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-cream-100 border border-cream-200 rounded-full text-xs font-semibold text-espresso-900"
                >
                  {p}
                  <button onClick={() => togglePriceRange(p)}>
                    <X className="w-3 h-3 text-coffee-500 hover:text-espresso-900" />
                  </button>
                </span>
              ))}
              {onlyOpenNow && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-800">
                  Open Now
                  <button onClick={() => setOnlyOpenNow(false)}>
                    <X className="w-3 h-3 text-emerald-600 hover:text-emerald-900" />
                  </button>
                </span>
              )}
              {selectedAmenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-cream-100 border border-cream-200 rounded-full text-xs font-semibold text-espresso-900"
                >
                  {AMENITY_LABELS[amenity]}
                  <button onClick={() => toggleAmenity(amenity)}>
                    <X className="w-3 h-3 text-coffee-500 hover:text-espresso-900" />
                  </button>
                </span>
              ))}
              <button
                onClick={resetAllFilters}
                className="text-xs text-terracotta-600 font-bold hover:underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Cafes Grid with Staggered Entrance and 3D Tilt */}
          {filteredCafes.length === 0 ? (
            <EmptyState
              title="No cafes found"
              description="We couldn't find any cafes matching your current search criteria. Try removing some filters or searching for another city."
              actionText="Reset All Filters"
              onAction={resetAllFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCafes.map((cafe, index) => (
                <Reveal key={cafe.id} variant="fade-up" delayMs={(index % 6) * 50} durationMs={550}>
                  <TiltCard maxTiltDeg={3} className="h-full">
                    <CafeCard cafe={cafe} />
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center lg:hidden">
          <div
            className="fixed inset-0 bg-espresso-950/60 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-warm-xl max-h-[85vh] overflow-y-auto p-6 z-10 animate-in slide-in-from-bottom-8 duration-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-cream-200">
              <h3 className="font-serif font-bold text-lg text-espresso-950">Filter Cafes</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-full text-coffee-500 hover:text-espresso-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {FilterContent}
            <div className="pt-6 border-t border-cream-200 sticky bottom-0 bg-white">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-espresso-900 text-white font-bold text-sm rounded-2xl shadow-warm"
              >
                Show {filteredCafes.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
