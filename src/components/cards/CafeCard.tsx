import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Heart, Clock, ArrowRight } from 'lucide-react';
import { Cafe } from '../../types';
import { useData } from '../../context/DataContext';
import { Badge } from '../common/Badge';

interface CafeCardProps {
  cafe: Cafe;
  className?: string;
}

export const CafeCard: React.FC<CafeCardProps> = ({ cafe, className = '' }) => {
  const { isFavorite, toggleFavorite } = useData();
  const favorite = isFavorite(cafe.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(cafe.id);
  };

  return (
    <div
      className={`group bg-white rounded-3xl border border-cream-200 overflow-hidden shadow-warm hover:shadow-warm-xl transition-all duration-300 flex flex-col hover:-translate-y-1.5 ${className}`}
    >
      {/* Cover Image Container */}
      <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-cream-200">
        <img
          src={cafe.cover_image}
          alt={cafe.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/70 via-transparent to-black/20 pointer-events-none" />

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-espresso-900 shadow-md backdrop-blur-md flex items-center justify-center transition-transform active:scale-90"
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              favorite ? 'fill-rose-500 text-rose-500' : 'text-espresso-800'
            }`}
          />
        </button>

        {/* Status Pill (Open / Closed) */}
        <div className="absolute top-3.5 left-3.5">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm ${
              cafe.is_open
                ? 'bg-emerald-500/90 text-white'
                : 'bg-espresso-900/80 text-cream-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                cafe.is_open ? 'bg-white animate-pulse' : 'bg-rose-400'
              }`}
            />
            {cafe.is_open ? 'Open Now' : 'Closed'}
          </span>
        </div>

        {/* Bottom Banner inside Image: City & Price */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-terracotta-400" />
            <span>{cafe.city}</span>
            {cafe.distance_km && (
              <span className="text-cream-300 font-normal">
                • {cafe.distance_km} km away
              </span>
            )}
          </div>
          <span className="bg-espresso-950/60 px-2.5 py-0.5 rounded-full border border-white/20">
            {cafe.price_range}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header: Name and Rating */}
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/cafes/${cafe.id}`}
              className="text-lg font-serif font-bold text-espresso-950 hover:text-terracotta-600 transition-colors line-clamp-1"
            >
              {cafe.name}
            </Link>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-amber-800 font-bold text-xs shrink-0 shadow-inner">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{cafe.rating}</span>
              <span className="text-amber-700/70 font-normal text-[10px]">
                ({cafe.review_count})
              </span>
            </div>
          </div>

          {/* Tagline / Description snippet */}
          <p className="text-xs text-coffee-600 mt-1 line-clamp-2 leading-relaxed">
            {cafe.tagline || cafe.description}
          </p>

          {/* Categories / Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {cafe.categories.slice(0, 3).map((cat) => (
              <Badge key={cat} variant="neutral" size="sm">
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Footer: Opening hours & View Cafe button */}
        <div className="pt-4 mt-4 border-t border-cream-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-coffee-500">
            <Clock className="w-3.5 h-3.5 text-coffee-400" />
            <span>
              {cafe.opening_time} - {cafe.closing_time}
            </span>
          </div>

          <Link
            to={`/cafes/${cafe.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cream-100 hover:bg-espresso-900 text-espresso-900 hover:text-white font-semibold text-xs transition-all shadow-sm group-hover:bg-espresso-900 group-hover:text-white active:scale-95"
          >
            <span>View Cafe</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
