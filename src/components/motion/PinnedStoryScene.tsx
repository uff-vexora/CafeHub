import React from 'react';
import { Sparkles, Coffee, Compass, ArrowDown, ChevronRight } from 'lucide-react';
import { useStickyScrollProgress } from './useStickyScrollProgress';
import { useReducedMotion, isTouchDevice } from './useReducedMotion';
import { MagneticButton } from './MagneticButton';

interface PinnedStorySceneProps {
  onExploreClick?: () => void;
  totalCafesCount?: number;
}

export const PinnedStoryScene: React.FC<PinnedStorySceneProps> = ({
  onExploreClick,
  totalCafesCount = 18,
}) => {
  const [containerRef, progress] = useStickyScrollProgress<HTMLDivElement>();
  const reducedMotion = useReducedMotion();
  const isTouch = isTouchDevice();

  // If user prefers reduced motion or is on mobile touch screen, render a static, elegant editorial banner
  if (reducedMotion || isTouch) {
    return (
      <div className="relative rounded-4xl overflow-hidden hero-mesh-dark p-8 sm:p-12 text-white border border-white/10 shadow-glow-espresso my-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-terra text-terracotta-300 text-xs font-bold border border-terracotta-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Artisan Roaster Discovery</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-cream-50 leading-tight">
            Every Cup Tells a Story.<br />
            <span className="text-gradient-cream">Curated Sanctuaries Across India.</span>
          </h2>
          <p className="text-sm sm:text-base text-cream-200/75 leading-relaxed font-light">
            From single-origin pour-overs in Bengaluru to rooftop espresso bars in Mumbai, find your next neighborhood haven.
          </p>
        </div>
      </div>
    );
  }

  // Phase Calculations (Desktop continuous scroll choreography)
  // Phase 1: 0.0 - 0.38
  const phase1Opacity = Math.max(0, Math.min(1, 1 - progress * 2.8));
  const phase1TranslateY = progress * -60;

  // Phase 2: 0.28 - 0.72 (Peaks at 0.50)
  const phase2Progress = Math.max(0, Math.min(1, (progress - 0.28) / 0.22));
  const phase2Exit = Math.max(0, Math.min(1, (progress - 0.58) / 0.18));
  const phase2Opacity = Math.max(0, phase2Progress - phase2Exit);
  const phase2Scale = 0.96 + phase2Progress * 0.06;

  // Phase 3: 0.65 - 1.0 (Peaks toward end)
  const phase3Progress = Math.max(0, Math.min(1, (progress - 0.65) / 0.25));
  const phase3Opacity = phase3Progress;
  const phase3TranslateY = (1 - phase3Progress) * 40;

  // Background Image Scale & Depth Scrub (Continuous across all phases)
  const bgImageScale = 1.18 - progress * 0.16; // 1.18 -> 1.02
  const bgImageTranslateY = progress * -40; // Parallax translation
  const overlayDarkness = 0.55 + progress * 0.25; // Darkens subtly for contrast

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[230vh] -mt-2 mb-10"
      style={{ perspective: 1200 }}
    >
      {/* Viewport Anchored Sticky Stage */}
      <div className="sticky top-16 h-[calc(100vh-5rem)] rounded-4xl overflow-hidden shadow-glow-espresso border border-white/10 hero-mesh-dark flex items-center justify-center">
        
        {/* Continuous Scrub Background Imagery */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1800&q=80"
            alt="Artisan Roastery Atmosphere"
            style={{
              transform: `scale3d(${bgImageScale.toFixed(3)}, ${bgImageScale.toFixed(3)}, 1) translate3d(0, ${bgImageTranslateY.toFixed(1)}px, 0)`,
              willChange: 'transform',
            }}
            className="w-full h-full object-cover transition-transform duration-75"
          />
          {/* Dynamic dark scrim linked to scrub */}
          <div
            className="absolute inset-0 transition-opacity duration-75"
            style={{
              background: `radial-gradient(ellipse 90% 70% at 50% 50%, rgba(20, 13, 8, ${overlayDarkness.toFixed(2)}) 0%, rgba(20, 13, 8, 0.95) 100%)`,
            }}
          />
        </div>

        {/* Storytelling Progress Indicator Pill */}
        <div className="absolute top-6 left-8 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-dark border border-white/10 text-xs font-semibold text-cream-200">
          <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-pulse" />
          <span>Curated Journey</span>
          <span className="text-cream-200/40">•</span>
          <span className="text-terracotta-300 font-mono text-[11px]">
            {progress < 0.38 ? '01 / Origin' : progress < 0.72 ? '02 / Sanctuaries' : '03 / Exploration'}
          </span>
        </div>

        {/* Scroll Progress Bar at Top of Sticky Viewport */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30">
          <div
            className="h-full bg-gradient-to-r from-terracotta-500 to-amber-500 transition-all duration-75"
            style={{ width: `${(progress * 100).toFixed(1)}%` }}
          />
        </div>

        {/* ── SCENE 1: THE ORIGIN STATEMENT ───────────────────────── */}
        <div
          style={{
            opacity: phase1Opacity.toFixed(3),
            transform: `translate3d(0, ${phase1TranslateY.toFixed(1)}px, 0)`,
            pointerEvents: progress > 0.4 ? 'none' : 'auto',
          }}
          className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 sm:px-12 z-20 max-w-4xl mx-auto space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-terra text-terracotta-300 text-xs font-bold border border-terracotta-500/30">
            <Coffee className="w-3.5 h-3.5" />
            <span>Chapter I · The Beans & The Craft</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-serif font-bold text-white tracking-tight leading-[1.12]">
            Every Great Cup Begins with <br />
            <span className="text-gradient-cream">Single-Origin Passion.</span>
          </h2>

          <p className="text-sm sm:text-base text-cream-200/80 max-w-xl font-light leading-relaxed">
            We partner exclusively with certified artisan roasters, ethical estate growers, and master baristas dedicated to the art of coffee.
          </p>

          <div className="pt-4 flex items-center gap-2 text-xs text-cream-200/50">
            <span>Scroll to explore the sanctuaries</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </div>
        </div>

        {/* ── SCENE 2: THE SPATIAL SANCTUARY ───────────────────────── */}
        <div
          style={{
            opacity: phase2Opacity.toFixed(3),
            transform: `scale3d(${phase2Scale.toFixed(3)}, ${phase2Scale.toFixed(3)}, 1)`,
            pointerEvents: progress < 0.28 || progress > 0.72 ? 'none' : 'auto',
          }}
          className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 sm:px-12 z-20 max-w-3xl mx-auto space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-terra text-terracotta-300 text-xs font-bold border border-terracotta-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chapter II · Atmosphere & Purpose</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-serif font-bold text-white tracking-tight leading-[1.12]">
            More than Caffeine.<br />
            <span className="text-gradient-cream">Spaces That Inspire.</span>
          </h2>

          <p className="text-sm sm:text-base text-cream-200/80 max-w-lg font-light leading-relaxed">
            Quiet corners with high-speed Wi-Fi, open sunlit garden patios, and lively weekend brunch destinations — tailored to your mood.
          </p>

          {/* Floating Pill Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {['Fast Fiber Wi-Fi', 'Pet Friendly Patios', 'Power At Every Table', 'Artisan Bakery', 'Zero-Wait Booking'].map((perk) => (
              <span
                key={perk}
                className="px-3.5 py-1.5 rounded-xl glass-dark border border-white/15 text-cream-100 text-xs font-medium shadow-sm"
              >
                ✓ {perk}
              </span>
            ))}
          </div>
        </div>

        {/* ── SCENE 3: THE DISCOVERY RELEASE (BRIDGING INTO GRID) ───── */}
        <div
          style={{
            opacity: phase3Opacity.toFixed(3),
            transform: `translate3d(0, ${phase3TranslateY.toFixed(1)}px, 0)`,
            pointerEvents: progress < 0.65 ? 'none' : 'auto',
          }}
          className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 sm:px-12 z-20 max-w-3xl mx-auto space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-terra text-terracotta-300 text-xs font-bold border border-terracotta-500/30">
            <Compass className="w-3.5 h-3.5" />
            <span>Chapter III · Begin Discovery</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-serif font-bold text-white tracking-tight leading-[1.12]">
            {totalCafesCount} Verified Havens.<br />
            <span className="text-gradient-cream">Ready For You.</span>
          </h2>

          <p className="text-sm sm:text-base text-cream-200/80 max-w-md font-light leading-relaxed">
            Discover detailed pour-over menus, reserve tables with instant confirmation, and support local roasters.
          </p>

          <MagneticButton strength={6}>
            <button
              onClick={onExploreClick}
              className="py-3.5 px-8 bg-gradient-to-r from-terracotta-600 to-terracotta-700 hover:from-terracotta-700 hover:to-terracotta-800 text-white text-sm font-bold rounded-2xl shadow-glow-terra flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <span>Explore The Directory Below</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </MagneticButton>
        </div>

      </div>
    </div>
  );
};
