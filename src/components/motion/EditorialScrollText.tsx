import React from 'react';
import { useElementScrollProgress } from './useScrollParallax';
import { useReducedMotion } from './useReducedMotion';

interface EditorialScrollTextProps {
  headingLine1: string;
  headingLine2?: string;
  accentText?: string;
  description?: string;
  badgeText?: string;
  className?: string;
  align?: 'left' | 'center';
}

export const EditorialScrollText: React.FC<EditorialScrollTextProps> = ({
  headingLine1,
  headingLine2,
  accentText,
  description,
  badgeText,
  className = '',
  align = 'left',
}) => {
  const [ref, progress] = useElementScrollProgress<HTMLDivElement>();
  const reducedMotion = useReducedMotion();

  // Subtle differential parallax shifts based on scroll progress [0, 1]
  // 0.5 is element centered in viewport
  const delta = progress - 0.5;
  const line1Offset = reducedMotion ? 0 : delta * -25;
  const line2Offset = reducedMotion ? 0 : delta * -12;
  const descOffset = reducedMotion ? 0 : delta * -5;
  const scale = reducedMotion ? 1 : 0.98 + (1 - Math.abs(delta)) * 0.03; // Subtle focus breathing

  const isCenter = align === 'center';

  return (
    <div
      ref={ref}
      style={{
        transform: `scale3d(${scale.toFixed(3)}, ${scale.toFixed(3)}, 1)`,
        transition: 'transform 0.08s linear',
        willChange: 'transform',
      }}
      className={`space-y-3 ${isCenter ? 'text-center mx-auto' : ''} ${className}`}
    >
      {badgeText && (
        <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-terra text-terracotta-400 text-xs font-bold border border-terracotta-500/30 ${isCenter ? 'mx-auto' : ''}`}>
          <span>{badgeText}</span>
        </div>
      )}

      <h2 className="text-3xl sm:text-5xl font-serif font-bold text-espresso-950 leading-[1.12] tracking-tight">
        <span
          style={{
            display: 'block',
            transform: `translate3d(0, ${line1Offset.toFixed(1)}px, 0)`,
            willChange: 'transform',
          }}
        >
          {headingLine1}
        </span>
        {headingLine2 && (
          <span
            style={{
              display: 'block',
              transform: `translate3d(0, ${line2Offset.toFixed(1)}px, 0)`,
              willChange: 'transform',
            }}
          >
            {headingLine2}
          </span>
        )}
        {accentText && (
          <span className="text-gradient-terra block mt-1">
            {accentText}
          </span>
        )}
      </h2>

      {description && (
        <p
          style={{
            transform: `translate3d(0, ${descOffset.toFixed(1)}px, 0)`,
            willChange: 'transform',
          }}
          className={`text-sm sm:text-base text-coffee-600 font-light leading-relaxed max-w-xl ${isCenter ? 'mx-auto' : ''}`}
        >
          {description}
        </p>
      )}
    </div>
  );
};
