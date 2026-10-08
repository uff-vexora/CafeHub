import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Heart, Clock, ArrowUpRight } from 'lucide-react';
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
    <Link
      to={`/cafes/${cafe.id}`}
      className={`group block bg-white rounded-3xl border border-cream-200 overflow-hidden shadow-warm card-lift hover:shadow-warm-xl hover:border-cream-300 flex flex-col ${className}`}
    >
      {/* Image Container */}
      <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-cream-200 img-zoom">
        <img
          src={cafe.cover_image}
          alt={cafe.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Gradient overlay — stronger at bottom for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/75 via-espresso-900/10 to-transparent pointer-events-none" />

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3.5 right-3.5 w-9 h-9 rounded-full backdrop-blur-md shadow-lg flex items-center justify-center transition-all active:scale-90 z-10 ${
            favorite
              ? 'bg-rose-500 text-white shadow-glow-terra'
              : 'bg-white/90 hover:bg-white text-espresso-800'
          }`}
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 transition-all ${favorite ? 'fill-white text-white scale-110' : ''}`} />
        </button>

        {/* Open/Closed status */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm ${
              cafe.is_open
                ? 'bg-emerald-500/90 text-white'
                : 'bg-espresso-900/85 text-cream-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cafe.is_open ? 'bg-white animate-pulse' : 'bg-rose-400'}`} />
            {cafe.is_open ? 'Open Now' : 'Closed'}
          </span>
        </div>

        {/* Bottom info bar inside image */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3.5 pt-6 flex items-end justify-between z-10">
          <div className="flex items-center gap-1.5 text-white text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-terracotta-300 shrink-0" />
            <span>{cafe.city}</span>
            {cafe.distance_km && (
              <span className="text-cream-300 font-normal">• {cafe.distance_km} km</span>
            )}
          </div>
          <span className="text-xs font-bold text-white bg-espresso-950/60 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/15">
            {cafe.price_range}
          </span>
        </div>
      </div>

      {/* Content body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Name + Rating row */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-serif font-bold text-espresso-950 group-hover:text-terracotta-600 transition-colors leading-snug line-clamp-1">
              {cafe.name}
            </h3>
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-amber-800 font-bold text-xs shrink-0 shadow-inner">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 star-glow" />
              <span>{cafe.rating}</span>
              <span className="text-amber-600/70 font-normal text-[10px]">({cafe.review_count})</span>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-xs text-coffee-500 mt-1.5 line-clamp-2 leading-relaxed">
            {cafe.tagline || cafe.description}
          </p>

          {/* Category tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {cafe.categories.slice(0, 3).map((cat) => (
              <Badge key={cat} variant="neutral" size="sm">{cat}</Badge>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-cream-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-coffee-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{cafe.opening_time} – {cafe.closing_time}</span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-terracotta-600 group-hover:text-terracotta-700 transition-colors">
            <span>View Cafe</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
};
