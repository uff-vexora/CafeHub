import React, { useRef, useState, MouseEvent } from 'react';
import { useReducedMotion, isTouchDevice } from './useReducedMotion';

interface TiltCardProps {
  children: React.ReactNode;
  maxTiltDeg?: number; // default 3 degrees (subtle, non-distracting)
  scale?: number; // default 1.015
  className?: string;
  sheen?: boolean; // specular highlight effect
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  maxTiltDeg = 3,
  scale = 1.015,
  className = '',
  sheen = true,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
  const [sheenPosition, setSheenPosition] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();
  const isTouch = isTouchDevice();

  // If user prefers reduced motion or is on touch/mobile, render clean static container
  if (reducedMotion || isTouch) {
    return <div className={className}>{children}</div>;
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normalizedX = (x / rect.width) * 2 - 1; // -1 to 1
    const normalizedY = (y / rect.height) * 2 - 1; // -1 to 1

    // Tilt opposite to cursor for natural 3D depth
    const rotateX = -normalizedY * maxTiltDeg;
    const rotateY = normalizedX * maxTiltDeg;

    setTransform({ rotateX, rotateY, scale });

    if (sheen) {
      setSheenPosition({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        opacity: 0.12,
      });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform({ rotateX: 0, rotateY: 0, scale: 1 });
    if (sheen) {
      setSheenPosition((prev) => ({ ...prev, opacity: 0 }));
    }
  };

  // On mouse down / click, immediately stabilize card to neutral orientation
  const handleMouseDown = () => {
    setTransform({ rotateX: 0, rotateY: 0, scale: 1 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      style={{
        perspective: 1000,
      }}
      className={`relative ${className}`}
    >
      <div
        style={{
          transform: `perspective(1000px) rotateX(${transform.rotateX.toFixed(2)}deg) rotateY(${transform.rotateY.toFixed(2)}deg) scale3d(${transform.scale}, ${transform.scale}, 1)`,
          transition: isHovered
            ? 'transform 0.15s cubic-bezier(0.2, 0.8, 0.4, 1)'
            : 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
          willChange: isHovered ? 'transform' : 'auto',
        }}
        className="h-full w-full relative"
      >
        {children}

        {/* Specular sheen overlay (strictly pointer-events-none) */}
        {sheen && (
          <div
            className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300 overflow-hidden"
            style={{
              opacity: sheenPosition.opacity,
              background: `radial-gradient(circle 240px at ${sheenPosition.x.toFixed(1)}% ${sheenPosition.y.toFixed(1)}%, rgba(255,255,255,0.35) 0%, transparent 80%)`,
            }}
          />
        )}
      </div>
    </div>
  );
};
