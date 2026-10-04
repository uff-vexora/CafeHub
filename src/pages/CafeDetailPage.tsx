import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Heart,
  Calendar,
  ShoppingBag,
  Navigation,
  CheckCircle2,
  Wifi,
  Wind,
  Car,
  Dog,
  Zap,
  Briefcase,
  Share2,
  Search,
  MessageSquare,
  Sparkles,
  Coffee,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { MenuItemCard } from '../components/cards/MenuItemCard';
import { MenuItemModal } from '../components/modals/MenuItemModal';
import { TableBookingModal } from '../components/modals/TableBookingModal';
import { ReviewModal } from '../components/modals/ReviewModal';
import { Badge, VegNonVegIndicator } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { AmenityKey, MenuItem } from '../types';

const AMENITY_ICONS: Record<AmenityKey, { icon: React.ReactNode; label: string }> = {
  wifi: { icon: <Wifi className="w-4 h-4" />, label: 'High-speed Wi-Fi' },
  air_conditioning: { icon: <Wind className="w-4 h-4" />, label: 'Air Conditioned' },
  outdoor_seating: { icon: <Coffee className="w-4 h-4" />, label: 'Outdoor Garden & Patio' },
  parking: { icon: <Car className="w-4 h-4" />, label: 'Valet & Street Parking' },
  pet_friendly: { icon: <Dog className="w-4 h-4" />, label: 'Pet Friendly' },
  power_outlets: { icon: <Zap className="w-4 h-4" />, label: 'Power Outlets Everywhere' },
  work_friendly: { icon: <Briefcase className="w-4 h-4" />, label: 'Dedicated Coworking Space' },
};

export const CafeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { cafes, menuItems, reviews, isFavorite, toggleFavorite } = useData();
  const { user } = useAuth();

  const cafe = cafes.find((c) => c.id === id);

  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'reviews' | 'photos' | 'location'>('menu');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Menu filters
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedMenuCategory, setSelectedMenuCategory] = useState<string>('All');
  const [vegOnly, setVegOnly] = useState(false);

  // Modals state
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const favorite = cafe ? isFavorite(cafe.id) : false;
  const cafeReviews = cafe ? reviews.filter((r) => r.cafe_id === cafe.id) : [];

  // Menu items for this cafe (strictly scoped to this cafe)
  const cafeMenuItems = cafe ? menuItems.filter((item) => item.cafe_id === cafe.id) : [];

  // Categories present in this cafe's menu
  const menuCategories = ['All', ...Array.from(new Set(cafeMenuItems.map((item) => item.category_name)))];

  const filteredMenuItems = useMemo(() => {
    return cafeMenuItems.filter((item) => {
      if (selectedMenuCategory !== 'All' && item.category_name !== selectedMenuCategory) {
        return false;
      }
      if (vegOnly && !item.is_veg) {
        return false;
      }
      if (menuSearch.trim()) {
        const q = menuSearch.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [cafeMenuItems, selectedMenuCategory, vegOnly, menuSearch]);

  if (!cafe) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <EmptyState
          title="Cafe Not Found"
          description="The cafe you are looking for does not exist or may have been relocated."
          actionText="Explore Other Cafes"
          actionLink="/cafes"
        />
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const imagesList = cafe.images && cafe.images.length > 0 ? cafe.images : [cafe.cover_image];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Top Image Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Big Photo */}
        <div className="lg:col-span-2 relative h-[360px] sm:h-[460px] rounded-3xl overflow-hidden shadow-warm bg-cream-200">
          <img
            src={imagesList[activePhotoIndex] || cafe.cover_image}
            alt={cafe.name}
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/70 via-transparent to-transparent pointer-events-none" />

          {/* Quick Badges inside main photo */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm ${
                cafe.is_open ? 'bg-emerald-500/90 text-white' : 'bg-espresso-900/80 text-cream-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  cafe.is_open ? 'bg-white animate-pulse' : 'bg-rose-400'
                }`}
              />
              {cafe.is_open ? 'Open Now' : 'Closed'}
            </span>
            <span className="bg-espresso-950/70 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md">
              {cafe.price_range}
            </span>
          </div>
        </div>

        {/* Side Thumbnails */}
        <div className="hidden lg:grid grid-rows-2 gap-4 h-[460px]">
          {imagesList.slice(1, 3).map((img, idx) => (
            <div
              key={idx}
              onClick={() => setActivePhotoIndex(idx + 1)}
              className="relative rounded-3xl overflow-hidden bg-cream-200 cursor-pointer group shadow-warm border border-cream-200"
            >
              <img
                src={img}
                alt="Cafe ambient"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
          {imagesList.length < 3 && (
            <div
              onClick={() => setActivePhotoIndex(0)}
              className="relative rounded-3xl overflow-hidden bg-cream-200 cursor-pointer group shadow-warm border border-cream-200"
            >
              <img
                src={cafe.cover_image}
                alt="Cafe ambient"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. Cafe Header Section */}
      <div className="bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-warm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            {cafe.categories.map((c) => (
              <Badge key={c} variant="secondary">
                {c}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-espresso-950 leading-tight">
            {cafe.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-coffee-600">
            {/* Rating pill */}
            <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 text-amber-900 font-bold">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="text-sm">{cafe.rating}</span>
              <span className="text-coffee-500 font-normal">({cafe.review_count} reviews)</span>
            </div>

            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-terracotta-500" />
              <span>{cafe.address}, {cafe.city}</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-coffee-500" />
              <span>{cafe.opening_time} - {cafe.closing_time}</span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Favorite Toggle */}
          <button
            onClick={() => toggleFavorite(cafe.id)}
            className={`p-3 rounded-2xl border transition-all ${
              favorite
                ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
                : 'bg-cream-50 hover:bg-cream-100 border-cream-200 text-espresso-900'
            }`}
            title={favorite ? 'Remove Favorite' : 'Save Favorite'}
          >
            <Heart className={`w-5 h-5 ${favorite ? 'fill-rose-500' : ''}`} />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-3 rounded-2xl bg-cream-50 hover:bg-cream-100 border border-cream-200 text-espresso-900 transition-colors relative"
            title="Share Cafe"
          >
            <Share2 className="w-5 h-5" />
            {copiedLink && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-espresso-950 text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap animate-in fade-in">
                Link Copied!
              </span>
            )}
          </button>

          {/* Book Table Button */}
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-espresso-900 hover:bg-espresso-800 text-white text-xs sm:text-sm font-bold shadow-warm flex items-center gap-2 transition-all active:scale-95"
          >
            <Calendar className="w-4 h-4" />
            <span>Book a Table</span>
          </button>

          {/* Order Online Button */}
          <button
            onClick={() => setActiveTab('menu')}
            className="px-5 py-3 rounded-2xl bg-terracotta-600 hover:bg-terracotta-500 text-white text-xs sm:text-sm font-bold shadow-warm flex items-center gap-2 transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order Online</span>
          </button>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="border-b border-cream-200 flex gap-6 overflow-x-auto no-scrollbar">
        {[
          { key: 'menu', label: 'Digital Menu' },
          { key: 'overview', label: 'Overview & Amenities' },
          { key: 'reviews', label: `Reviews (${cafe.review_count})` },
          { key: 'photos', label: 'Photo Gallery' },
          { key: 'location', label: 'Location & Map' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap ${
              activeTab === tab.key
                ? 'text-terracotta-600'
                : 'text-coffee-600 hover:text-espresso-900'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* 4. Tab Contents */}

      {/* Tab: Digital Menu */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Menu Search & Category Bar */}
          <div className="bg-white p-4 rounded-3xl border border-cream-200 shadow-warm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-coffee-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Search menu items..."
                className="w-full bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl pl-10 pr-3.5 py-2 text-xs text-espresso-900 outline-none"
              />
            </div>

            {/* Category horizontal pills */}
            <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
              {menuCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedMenuCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedMenuCategory === cat
                      ? 'bg-espresso-900 text-white'
                      : 'bg-cream-100 hover:bg-cream-200 text-espresso-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Veg toggle */}
            <label className="flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-cream-300 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-espresso-900 flex items-center gap-1">
                <VegNonVegIndicator isVeg={true} /> Veg Only
              </span>
            </label>
          </div>

          {/* Menu Items Grid */}
          {filteredMenuItems.length === 0 ? (
            <EmptyState
              title="No items found"
              description="No menu items matched your current search and dietary filter."
              actionText="Reset Menu Filters"
              onAction={() => {
                setMenuSearch('');
                setSelectedMenuCategory('All');
                setVegOnly(false);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filteredMenuItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  cafeName={cafe.name}
                  onSelect={(item) => setSelectedMenuItem(item)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Overview & Amenities */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-4">
              <h3 className="font-serif font-bold text-xl text-espresso-950">About {cafe.name}</h3>
              <p className="text-sm text-coffee-700 leading-relaxed font-normal">
                {cafe.description}
              </p>
            </div>

            {/* Amenities Checklist */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-4">
              <h3 className="font-serif font-bold text-xl text-espresso-950">Features & Amenities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cafe.amenities.map((key) => {
                  const item = AMENITY_ICONS[key];
                  if (!item) return null;
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-cream-50 border border-cream-200 text-espresso-900"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-terracotta-600 shadow-sm shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-xs font-semibold">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm space-y-4 text-xs text-espresso-900">
              <h4 className="font-serif font-bold text-base text-espresso-950">Contact & Hours</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-terracotta-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">Address</span>
                    <p className="text-coffee-600 mt-0.5">{cafe.address}, {cafe.city}, {cafe.postal_code}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-terracotta-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">Opening Hours</span>
                    <p className="text-coffee-600 mt-0.5">Mon - Sun: {cafe.opening_time} to {cafe.closing_time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-terracotta-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">Phone Number</span>
                    <p className="text-coffee-600 mt-0.5">{cafe.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-terracotta-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">Email Support</span>
                    <p className="text-coffee-600 mt-0.5">{cafe.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-8">
          {/* Rating Summary Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="text-center sm:text-left">
                <div className="text-5xl font-serif font-bold text-espresso-950">{cafe.rating}</div>
                <div className="flex items-center justify-center sm:justify-start gap-1 my-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(cafe.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-cream-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-coffee-500">Based on {cafeReviews.length} diner reviews</span>
              </div>
            </div>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-6 py-3 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs rounded-2xl shadow-warm flex items-center gap-2 transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {cafeReviews.length === 0 ? (
              <EmptyState
                title="Be the First to Review"
                description={`Have you visited or ordered from ${cafe.name}? Share your thoughts to help fellow coffee enthusiasts!`}
                actionText="Write Review"
                onAction={() => setIsReviewModalOpen(true)}
              />
            ) : (
              cafeReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt={rev.user_name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-cream-200"
                      />
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-espresso-950">{rev.user_name}</h4>
                        <span className="text-[11px] text-coffee-400">
                          {new Date(rev.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-amber-800 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{rev.rating}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-coffee-700 leading-relaxed font-normal">
                    {rev.comment}
                  </p>

                  {/* Owner Response */}
                  {rev.owner_response && (
                    <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-espresso-900">Response from Cafe Owner</span>
                        <span className="text-[10px] text-coffee-400">
                          {rev.owner_responded_at ? new Date(rev.owner_responded_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-xs text-coffee-700 leading-relaxed italic">
                        "{rev.owner_response}"
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Photos */}
      {activeTab === 'photos' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {imagesList.map((img, i) => (
            <div
              key={i}
              className="h-64 rounded-3xl overflow-hidden shadow-warm border border-cream-200 group"
            >
              <img
                src={img}
                alt={`${cafe.name} gallery ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}

      {/* Tab: Location & Directions */}
      {activeTab === 'location' && (
        <div className="bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-warm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-xl text-espresso-950">Location & Getting Here</h3>
              <p className="text-xs text-coffee-600 mt-1">{cafe.address}, {cafe.city}, {cafe.postal_code}</p>
            </div>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(`${cafe.name} ${cafe.address}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-espresso-900 hover:bg-espresso-800 text-white font-bold text-xs rounded-xl shadow-warm flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <Navigation className="w-4 h-4" />
              <span>Open in Google Maps</span>
            </a>
          </div>

          {/* Interactive Simulated Map Card */}
          <div className="relative h-80 rounded-2xl overflow-hidden border border-cream-300 bg-cream-100 flex items-center justify-center text-center p-6">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#CFC0A4_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10 max-w-sm space-y-3 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-cream-200 shadow-warm">
              <div className="w-12 h-12 rounded-2xl bg-terracotta-600 text-white flex items-center justify-center mx-auto shadow-warm animate-bounce">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-espresso-950">{cafe.name}</h4>
              <p className="text-xs text-coffee-600">{cafe.address}</p>
              <div className="text-[11px] text-coffee-400 font-mono">
                Coordinates: {cafe.latitude}, {cafe.longitude}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <MenuItemModal
        item={selectedMenuItem}
        cafeName={cafe.name}
        isOpen={!!selectedMenuItem}
        onClose={() => setSelectedMenuItem(null)}
      />

      <TableBookingModal
        cafe={cafe}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />

      <ReviewModal
        cafeId={cafe.id}
        cafeName={cafe.name}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </div>
  );
};
