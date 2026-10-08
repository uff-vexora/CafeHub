import React from 'react';
import { useElementScrollProgress } from './useScrollParallax';
import { useReducedMotion } from './useReducedMotion';

interface ScrollScrubImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  startScale?: number; // e.g. 1.14
  endScale?: number; // e.g. 1.00
  translateYMax?: number; // px shift across scroll
  overlayGradient?: string;
  children?: React.ReactNode;
}

export const ScrollScrubImage: React.FC<ScrollScrubImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  startScale = 1.14,
  endScale = 1.0,
  translateYMax = 40,
  overlayGradient = 'linear-gradient(to top, rgba(20, 13, 8, 0.8) 0%, rgba(20, 13, 8, 0.2) 50%, transparent 100%)',
  children,
}) => {
  const [containerRef, progress] = useElementScrollProgress<HTMLDivElement>();
  const reducedMotion = useReducedMotion();

  // Interpolate scale: when entering (progress 0) -> startScale; when centered/leaving (progress 1) -> endScale
  const currentScale = reducedMotion ? 1 : startScale - (startScale - endScale) * progress;
  // Parallax shift: translateY moves opposite to scroll
  const currentTranslateY = reducedMotion ? 0 : (0.5 - progress) * translateYMax;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName}`}
    >
      <img
        src={src}
        alt={alt}
        style={{
          transform: `scale3d(${currentScale.toFixed(3)}, ${currentScale.toFixed(3)}, 1) translate3d(0, ${currentTranslateY.toFixed(1)}px, 0)`,
          transition: 'transform 0.08s linear',
          willChange: 'transform',
        }}
        className={`w-full h-full object-cover select-none ${className}`}
        loading="lazy"
      />

      {overlayGradient && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: overlayGradient }}
        />
      )}

      {children && <div className="absolute inset-0 z-10">{children}</div>}
    </div>
  );
};
