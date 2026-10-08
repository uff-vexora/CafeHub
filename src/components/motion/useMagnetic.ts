import { useRef, useEffect, MouseEvent } from 'react';
import { useReducedMotion, isTouchDevice } from './useReducedMotion';

interface MagneticOptions {
  strength?: number; // Distance in pixels to pull (default 5px, strictly within 2-8px)
}

/**
 * Creates subtle magnetic attraction towards the cursor for primary CTA buttons.
 * On mouse leave or pointer down/click, springs back smoothly to original position.
 * Disabled on touch screens and when prefers-reduced-motion is active.
 * Uses direct DOM manipulation to eliminate React re-renders and guarantee 100% click reliability.
 */
export function useMagnetic<T extends HTMLElement = HTMLDivElement>(options: MagneticOptions = {}) {
  const { strength = 5 } = options;
  const ref = useRef<T | null>(null);
  const reducedMotion = useReducedMotion();
  const rafId = useRef<number | null>(null);

  const resetPosition = (smooth = true) => {
    if (!ref.current) return;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    ref.current.style.transition = smooth
      ? 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      : 'none';
    ref.current.style.transform = 'translate3d(0, 0, 0)';
  };

  const handleMouseMove = (e: MouseEvent<T>) => {
    if (reducedMotion || isTouchDevice() || !ref.current) return;

    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    const pullX = (distanceX / (rect.width / 2)) * strength;
    const pullY = (distanceY / (rect.height / 2)) * strength;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (!el) return;
      el.style.transition = 'transform 0.12s cubic-bezier(0.25, 1, 0.5, 1)';
      el.style.transform = `translate3d(${pullX.toFixed(1)}px, ${pullY.toFixed(1)}px, 0)`;
    });
  };

  const handleMouseEnter = () => {
    if (reducedMotion || isTouchDevice()) return;
  };

  const handleMouseLeave = () => {
    resetPosition(true);
  };

  // Crucial: on mousedown, immediately snap back to 0,0 so clicks never miss
  const handleMouseDown = () => {
    resetPosition(false);
  };

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return {
    ref,
    style: { willChange: 'transform' } as React.CSSProperties,
    bind: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseDown: handleMouseDown,
    },
  };
}
