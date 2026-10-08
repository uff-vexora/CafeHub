import { useState, useEffect, useRef, RefObject } from 'react';
import { useReducedMotion, isTouchDevice } from './useReducedMotion';

interface ParallaxOptions {
  speed?: number; // e.g. -0.2 for slower background, 0.3 for faster foreground
  clamp?: [number, number]; // min and max px offset
  disabled?: boolean;
}

/**
 * Returns a translateY offset (in pixels) relative to the element's position in the viewport.
 * Uses requestAnimationFrame and passive scroll listeners for maximum performance.
 */
export function useScrollParallax<T extends HTMLElement = HTMLDivElement>(
  options: ParallaxOptions = {}
): [RefObject<T | null>, number] {
  const { speed = 0.15, clamp = [-150, 150], disabled = false } = options;
  const ref = useRef<T | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const reducedMotion = useReducedMotion();
  const isTouch = useRef(false);

  useEffect(() => {
    isTouch.current = isTouchDevice();
  }, []);

  useEffect(() => {
    if (disabled || reducedMotion) {
      setOffset(0);
      return;
    }

    let rafId: number | null = null;
    let lastOffset = 0;

    const onScroll = () => {
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        const el = ref.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;

        // Only calculate if element is within or near viewport
        if (rect.bottom < -100 || rect.top > windowHeight + 100) return;

        // Calculate progress where 0 is centered in viewport
        const centerOffset = rect.top + rect.height / 2 - windowHeight / 2;
        
        // Dampen on touch/mobile devices for smoother feeling
        const effectiveSpeed = isTouch.current ? speed * 0.4 : speed;
        let calculated = -centerOffset * effectiveSpeed;

        if (clamp) {
          calculated = Math.max(clamp[0], Math.min(clamp[1], calculated));
        }

        // Only trigger React state update if delta is significant (> 0.5px)
        if (Math.abs(calculated - lastOffset) > 0.5) {
          lastOffset = calculated;
          setOffset(calculated);
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [speed, clamp, disabled, reducedMotion]);

  return [ref, offset];
}

/**
 * Returns scroll progress [0, 1] for a target element as it moves through the viewport
 */
export function useElementScrollProgress<T extends HTMLElement = HTMLDivElement>(): [RefObject<T | null>, number] {
  const ref = useRef<T | null>(null);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setProgress(1);
      return;
    }

    let rafId: number | null = null;

    const update = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const el = ref.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const winH = window.innerHeight;
        const total = winH + rect.height;
        const current = winH - rect.top;
        const p = Math.max(0, Math.min(1, current / total));
        setProgress(p);
      });
    };

    window.addEventListener('scroll', update, { passive: true });
    update();

    return () => {
      window.removeEventListener('scroll', update);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  return [ref, progress];
}
