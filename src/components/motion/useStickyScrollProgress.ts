import { useState, useEffect, useRef, RefObject } from 'react';
import { useReducedMotion, isTouchDevice } from './useReducedMotion';

interface StickyProgressOptions {
  disabled?: boolean;
}

/**
 * Hook for pinned/sticky container scroll progress [0, 1].
 * Progress 0: Top of sticky container reaches top of viewport.
 * Progress 1: Bottom of sticky container reaches bottom of viewport.
 * Automatically throttled via requestAnimationFrame and passive listeners.
 */
export function useStickyScrollProgress<T extends HTMLElement = HTMLDivElement>(
  options: StickyProgressOptions = {}
): [RefObject<T | null>, number] {
  const { disabled = false } = options;
  const containerRef = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useReducedMotion();
  const isTouch = useRef(false);

  useEffect(() => {
    isTouch.current = isTouchDevice();
  }, []);

  useEffect(() => {
    if (disabled || reducedMotion) {
      setProgress(0);
      return;
    }

    let rafId: number | null = null;
    let lastProgress = -1;

    const handleScroll = () => {
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        const el = containerRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const totalScrollableDistance = rect.height - window.innerHeight;

        if (totalScrollableDistance <= 0) {
          setProgress(0);
          return;
        }

        // How much of the container has scrolled past the top of the viewport
        const scrolled = -rect.top;
        const rawProgress = Math.max(0, Math.min(1, scrolled / totalScrollableDistance));

        // State update only when delta is noticeable to avoid wasted renders
        if (Math.abs(rawProgress - lastProgress) > 0.003) {
          lastProgress = rawProgress;
          setProgress(rawProgress);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [disabled, reducedMotion]);

  return [containerRef, progress];
}
