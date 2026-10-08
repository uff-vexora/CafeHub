import React, { useRef, useState, useEffect, MouseEvent } from 'react';
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
  const [coords, setCoords] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });
  const reducedMotion = useReducedMotion();
  const isTouch = useRef(false);

  useEffect(() => {
    isTouch.current = isTouchDevice();
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || isTouch.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true,
    });
  };

  const handleMouseLeave = () => {
    setCoords((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Dynamic ambient spotlight */}
      {!reducedMotion && coords.visible && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-500 ease-out z-0"
          style={{
            opacity: coords.visible ? opacity : 0,
            background: `radial-gradient(${size}px circle at ${coords.x}px ${coords.y}px, ${color}, transparent 80%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
