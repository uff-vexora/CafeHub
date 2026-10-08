import { useState, useRef, useEffect, MouseEvent } from 'react';
import { useReducedMotion, isTouchDevice } from './useReducedMotion';

interface MagneticOptions {
  strength?: number; // Distance in pixels to pull (default 5px, strictly within 2-8px)
  radius?: number; // Trigger radius threshold
}

/**
 * Creates subtle magnetic attraction towards the cursor for primary CTA buttons.
 * On mouse leave, springs back smoothly to original position.
 * Disabled on touch screens and when prefers-reduced-motion is active.
 */
export function useMagnetic<T extends HTMLElement = HTMLButtonElement>(options: MagneticOptions = {}) {
  const { strength = 5 } = options;
  const ref = useRef<T | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();
  const isTouch = useRef(false);

  useEffect(() => {
    isTouch.current = isTouchDevice();
  }, []);

  const handleMouseMove = (e: MouseEvent<T>) => {
    if (reducedMotion || isTouch.current || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    // Normalize and scale to subtle magnetic pull (capped at strength px)
    const pullX = (distanceX / (rect.width / 2)) * strength;
    const pullY = (distanceY / (rect.height / 2)) * strength;

    setPosition({ x: pullX, y: pullY });
  };

  const handleMouseEnter = () => {
    if (reducedMotion || isTouch.current) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  const style = {
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
    transition: isHovered
      ? 'transform 0.12s cubic-bezier(0.25, 1, 0.5, 1)'
      : 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
    willChange: isHovered ? 'transform' : 'auto',
  };

  return {
    ref,
    style,
    bind: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
}
