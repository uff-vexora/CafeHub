import React, { useRef, useEffect, MouseEvent } from 'react';
import { useReducedMotion, isTouchDevice } from './useReducedMotion';

interface ScrollSpotlightProps {
  children?: React.ReactNode;
  className?: string;
  size?: number; // radius in px (default 350)
  color?: string; // default warm terracotta/amber highlight
  opacity?: number;
}

export const ScrollSpotlight: React.FC<ScrollSpotlightProps> = ({
  children,
  className = '',
  size = 350,
  color = 'rgba(222, 100, 65, 0.12)',
  opacity = 1,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const rafId = useRef<number | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || isTouchDevice() || !containerRef.current || !spotlightRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (!spotlightRef.current) return;
      spotlightRef.current.style.opacity = `${opacity}`;
      spotlightRef.current.style.background = `radial-gradient(${size}px circle at ${x}px ${y}px, ${color}, transparent 80%)`;
    });
  };

  const handleMouseLeave = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (spotlightRef.current) {
      spotlightRef.current.style.opacity = '0';
    }
  };

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Dynamic ambient spotlight overlay — zero React state re-renders */}
      {!reducedMotion && (
        <div
          ref={spotlightRef}
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 ease-out z-0 opacity-0"
        />
      )}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};
