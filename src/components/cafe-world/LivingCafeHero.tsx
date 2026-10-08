import React, { useEffect, useState } from 'react';
import { Sparkles, Search, X } from 'lucide-react';
import { CoffeeCupHero } from './CoffeeCupHero';
import { FloatingCoffeeBean } from './FloatingCoffeeBean';
import { AmbientDustParticles } from './AmbientDustParticles';
import { useReducedMotion } from '../motion/useReducedMotion';

interface LivingCafeHeroProps {
  totalCafesCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategorySelect: (cat: string) => void;
  categories: string[];
}

export const LivingCafeHero: React.FC<LivingCafeHeroProps> = ({
  totalCafesCount,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  categories,
}) => {
  const reducedMotion = useReducedMotion();
  const [scrollProgress, setScrollProgress] = useState(0);

  // Measure hero-relative scroll progress smoothly with requestAnimationFrame
  useEffect(() => {
    if (reducedMotion) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const heroHeight = 650;
          const p = Math.min(1, Math.max(0, scrollY / heroHeight));
          setScrollProgress(p);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [reducedMotion]);

  // Storytelling rotation and coordinates:
  // 0% scroll: Cup slightly angled (2.5 deg), natural size
  // 40% scroll: Cup subtly rotates (7 deg), shifts gently
  // 100% scroll: Cup settles down toward discovery section
  const cupRotation = reducedMotion ? 2 : 2.5 + scrollProgress * 9;
  const cupScale = reducedMotion ? 1 : 1 - scrollProgress * 0.08;
  const cupTranslateX = reducedMotion ? 0 : scrollProgress * 20;
  const cupTranslateY = reducedMotion ? 0 : scrollProgress * 30;

  return (
    <div className="relative rounded-4xl hero-mesh-dark shadow-glow-espresso border border-white/10 overflow-hidden text-white min-h-[520px] sm:min-h-[580px] flex flex-col justify-between p-6 sm:p-9 lg:p-11">
      {/* ── AMBIENT ENVIRONMENT LAYERS ─────────────────────────── */}
      {/* Warm Golden Dawn Radial Light (Refined soft glow) */}
      <div className="absolute -top-28 -right-16 w-[480px] h-[480px] rounded-full bg-caramel-400/15 blur-[90px] pointer-events-none" />
      {/* Tuscan Terracotta Glow Behind Cup */}
      <div className="absolute top-1/4 right-1/4 w-[360px] h-[360px] rounded-full bg-terracotta-500/14 blur-[80px] pointer-events-none" />
      {/* Subtle Aroma Particles Floating in Light Beam (Restrained to 10) */}
      <AmbientDustParticles count={10} />

      {/* ── FLOATING BEANS WITH RESTRAINED DEPTH ─────────────────── */}
      <div
        className="absolute top-14 right-[36%] hidden md:block pointer-events-none"
        style={{
          transform: `translate3d(0, ${(-scrollProgress * 28).toFixed(1)}px, 0)`,
          transition: 'transform 0.05s linear',
        }}
      >
        <FloatingCoffeeBean size={38} rotation={-18} depth="near" delayMs={0} />
      </div>

      <div
        className="absolute top-36 right-[7%] hidden lg:block pointer-events-none"
        style={{
          transform: `translate3d(0, ${(-scrollProgress * 45).toFixed(1)}px, 0)`,
          transition: 'transform 0.05s linear',
        }}
      >
        <FloatingCoffeeBean size={28} rotation={32} depth="far" delayMs={800} />
      </div>

      {/* ── VISUAL ANCHOR: THE LIVING ARTISAN COFFEE CUP ────────── */}
      <div className="absolute right-2 sm:right-6 lg:right-12 top-1/2 -translate-y-1/2 w-[260px] sm:w-[330px] lg:w-[390px] pointer-events-none z-10 hidden sm:block">
        <CoffeeCupHero
          scrollRotation={cupRotation}
          scrollScale={cupScale}
          scrollTranslateX={cupTranslateX}
          scrollTranslateY={cupTranslateY}
          showSteam={true}
        />
      </div>

      {/* ── EDITORIAL CONTENT & INTERACTION LAYER ──────────────── */}
      <div className="relative z-20 max-w-xl space-y-6 sm:space-y-8 my-auto">
        {/* Curated Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-terra text-terracotta-300 text-xs font-bold border border-terracotta-500/30">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-caramel-400" />
          <span>{totalCafesCount} Verified Artisan Roasters & Cafes</span>
        </div>

        {/* Editorial Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-cream-50 leading-[1.12] tracking-tight">
            Step into the<br />
            <span className="text-gradient-cream">World of Coffee</span>
          </h1>
          <p className="text-sm sm:text-base text-cream-200/80 font-light leading-relaxed max-w-md">
            Handcrafted pour-overs, golden morning pastries, and quiet neighborhood sanctuaries curated with love across India.
          </p>
        </div>

        {/* Interactive Search Bar (100% stationary, accessible, clickable) */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-cream-200/60 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search cafe name, city, signature brew, pastries..."
            className="w-full glass-dark text-white placeholder:text-cream-200/40 rounded-2xl pl-11 pr-10 py-3.5 text-sm outline-none focus:border-terracotta-400 border border-white/15 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-cream-200/60 hover:text-white transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── TACTILE MENU / CATEGORY STRIP ──────────────────────── */}
      <div className="relative z-20 pt-6 border-t border-white/10 mt-6 sm:mt-8">
        <div className="text-[11px] font-bold uppercase tracking-wider text-caramel-300/80 mb-3 flex items-center gap-2">
          <span>Curated Disciplines</span>
          <span className="w-12 h-px bg-caramel-400/30" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.slice(0, 8).map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategorySelect(cat)}
                type="button"
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-terracotta-600 text-white border-terracotta-500 shadow-glow-terra scale-105'
                    : 'glass-dark text-cream-200/75 border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
