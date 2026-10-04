import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Coffee,
  Search,
  MapPin,
  Sparkles,
  Calendar,
  ShoppingBag,
  Star,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { CafeCard } from '../components/cards/CafeCard';
import { CITIES } from '../components/layout/Navbar';

const POPULAR_CATEGORIES = [
  { name: 'Coffee', icon: '☕', description: 'Single-origin & cold brews', query: 'Coffee' },
  { name: 'Breakfast', icon: '🥞', description: 'Pancakes, eggs & waffles', query: 'Breakfast' },
  { name: 'Brunch', icon: '🥑', description: 'Sourdough & tartines', query: 'Brunch' },
  { name: 'Bakery', icon: '🥐', description: 'Croissants & fresh bakes', query: 'Bakery' },
  { name: 'Desserts', icon: '🍰', description: 'Cheesecakes & brownies', query: 'Desserts' },
  { name: 'Work-friendly', icon: '💻', description: 'High-speed Wi-Fi & plugs', query: 'Work-friendly' },
  { name: 'Outdoor seating', icon: '🌿', description: 'Courtyards & garden patios', query: 'Outdoor seating' },
  { name: 'Date night', icon: '✨', description: 'Cozy romantic ambiances', query: 'Date night' },
];

export const HomePage: React.FC = () => {
  const { cafes } = useData();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCity !== 'All Cities') params.set('city', selectedCity);
    navigate(`/cafes?${params.toString()}`);
  };

  const featuredCafes = cafes.filter((c) => c.is_featured && c.is_approved).slice(0, 3);
  const trendingCafes = cafes.filter((c) => c.is_approved).slice(0, 6);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. Hero Section */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center rounded-b-4xl overflow-hidden px-4 sm:px-6 lg:px-8 bg-espresso-950 text-white">
        {/* Hero Background with High Quality Cafe Photo */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=2000&q=85"
            alt="Warm artisanal coffee shop interior"
            className="w-full h-full object-cover opacity-35 scale-105 animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-espresso-950/75 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 pt-12 pb-16">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cream-100/10 border border-cream-200/20 text-cream-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-terracotta-400" />
            <span>Discover India's Handcrafted Specialty Cafes</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-cream-50 leading-tight">
            Find your next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta-400 via-amber-300 to-caramel-300">
              favorite cafe.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base text-cream-200/90 max-w-2xl mx-auto font-normal leading-relaxed">
            Discover great cafes, explore their menus, book a table, and order your favorites with zero hassle.
          </p>

          {/* Search Box Card */}
          <form
            onSubmit={handleHeroSearch}
            className="bg-white/95 backdrop-blur-lg p-2.5 sm:p-3 rounded-3xl shadow-warm-xl border border-cream-200/50 max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-2 text-espresso-900"
          >
            {/* City Selector */}
            <div className="flex items-center gap-2 px-3 py-2 bg-cream-100/70 rounded-2xl w-full sm:w-44 border border-cream-200">
              <MapPin className="w-4 h-4 text-terracotta-600 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-xs font-bold text-espresso-900 outline-none w-full cursor-pointer"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword Input */}
            <div className="flex items-center gap-2 px-3 py-2 flex-1 w-full">
              <Search className="w-4 h-4 text-coffee-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cafes, coffee, croissants, pasta..."
                className="w-full bg-transparent text-xs sm:text-sm text-espresso-900 placeholder:text-coffee-400 outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 bg-terracotta-600 hover:bg-terracotta-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-warm flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
            >
              <span>Find Cafes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Tags under search */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-cream-300/80 pt-2">
            <span className="font-semibold text-cream-200">Trending:</span>
            {['Pour Over', 'Iced Latte', 'Waffles', 'Sourdough', 'Cheesecake'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => navigate(`/cafes?q=${tag}`)}
                className="bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded-full text-[11px] transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta-600">
              Curated Moods
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-espresso-950 mt-1">
              Popular Categories
            </h2>
          </div>
          <Link
            to="/cafes"
            className="text-xs font-bold text-coffee-700 hover:text-terracotta-600 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {POPULAR_CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/cafes?category=${encodeURIComponent(cat.query)}`}
              className="group bg-white rounded-3xl p-4 border border-cream-200 shadow-warm hover:shadow-warm-lg hover:border-cream-300 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-cream-100 group-hover:bg-cream-200/80 flex items-center justify-center text-2xl transition-colors shadow-inner mb-3">
                {cat.icon}
              </div>
              <span className="font-serif font-bold text-sm text-espresso-950 group-hover:text-terracotta-600 transition-colors">
                {cat.name}
              </span>
              <span className="text-[10px] text-coffee-500 mt-1 line-clamp-1">
                {cat.description}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Cafes (Top Picked) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta-600">
              Handpicked by Editors
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-espresso-950 mt-1">
              Featured Cafes
            </h2>
          </div>
          <Link
            to="/cafes"
            className="text-xs font-bold text-coffee-700 hover:text-terracotta-600 flex items-center gap-1 transition-colors"
          >
            <span>See more</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredCafes.map((cafe) => (
            <CafeCard key={cafe.id} cafe={cafe} />
          ))}
        </div>
      </section>

      {/* 4. Trending Near You (Horizontal Scroll on Mobile) */}
      <section className="bg-cream-100/60 py-16 border-y border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
                <TrendingUp className="w-4 h-4" />
                <span>Buzzing This Week</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-espresso-950 mt-1">
                Trending Near You
              </h2>
            </div>
            <Link
              to="/cafes"
              className="text-xs font-bold text-coffee-700 hover:text-terracotta-600 flex items-center gap-1 transition-colors"
            >
              <span>Explore all</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Horizontal scroll container on mobile, grid on desktop */}
          <div className="flex overflow-x-auto gap-6 pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible no-scrollbar">
            {trendingCafes.map((cafe) => (
              <div key={cafe.id} className="min-w-[280px] sm:min-w-0">
                <CafeCard cafe={cafe} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why CafeHub */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta-600">
            Why Foodies Love Us
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-espresso-950">
            Engineered for Coffee Lovers & Cafes
          </h2>
          <p className="text-xs sm:text-sm text-coffee-600">
            We eliminate the guesswork so you enjoy world-class roasts, cozy work corners, and instant table bookings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl border border-amber-200">
              ☕
            </div>
            <h4 className="font-serif font-bold text-base text-espresso-950">Discover Hidden Gems</h4>
            <p className="text-xs text-coffee-600 leading-relaxed">
              Find secret roasteries, heritage village cafes, and cozy corners filterable by Wi-Fi, pets, and outdoor seating.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center font-bold text-xl border border-terracotta-200">
              📅
            </div>
            <h4 className="font-serif font-bold text-base text-espresso-950">Easy Table Reservations</h4>
            <p className="text-xs text-coffee-600 leading-relaxed">
              Reserve your spot without calling ahead. Instant confirmation for weekend brunch or important work meets.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl border border-emerald-200">
              🛍️
            </div>
            <h4 className="font-serif font-bold text-base text-espresso-950">Order Directly</h4>
            <p className="text-xs text-coffee-600 leading-relaxed">
              Dine-in table QR ordering, quick takeaway pickup, or home delivery directly supporting independent cafes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl border border-purple-200">
              ⭐
            </div>
            <h4 className="font-serif font-bold text-base text-espresso-950">Trusted Reviews</h4>
            <p className="text-xs text-coffee-600 leading-relaxed">
              Read transparent reviews from real coffee lovers, with active responses from cafe founders and head baristas.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Own a Cafe CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-4xl bg-gradient-to-br from-espresso-950 via-espresso-900 to-coffee-800 text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-warm-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-600/30">
              For Cafe Owners & Roasters
            </span>
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-cream-50 leading-tight">
              Own a cafe? Grow your community with CafeHub.
            </h3>
            <p className="text-xs sm:text-sm text-coffee-200 leading-relaxed">
              Manage your digital menus, receive online orders, streamline table reservations, and respond to diner reviews — all from one unified merchant dashboard.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/owner"
                className="px-6 py-3.5 bg-terracotta-600 hover:bg-terracotta-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-warm flex items-center gap-2 transition-all active:scale-95"
              >
                <span>List Your Cafe Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/owner"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-cream-100 font-semibold text-xs sm:text-sm rounded-2xl border border-white/20 transition-colors"
              >
                Explore Owner Portal
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
