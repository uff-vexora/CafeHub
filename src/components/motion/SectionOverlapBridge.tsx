import React from 'react';
import { useScrollParallax } from './useScrollParallax';

interface SectionOverlapBridgeProps {
  children?: React.ReactNode;
  overlapDistance?: number; // negative margin in pixels (default -48)
  className?: string;
  parallaxSpeed?: number;
  zIndex?: number;
}

export const SectionOverlapBridge: React.FC<SectionOverlapBridgeProps> = ({
  children,
  overlapDistance = -48,
  className = '',
  parallaxSpeed = 0.08,
  zIndex = 20,
}) => {
  const [ref, offset] = useScrollParallax<HTMLDivElement>({
    speed: parallaxSpeed,
    clamp: [-40, 40],
  });

  return (
    <div
      ref={ref}
      style={{
        marginTop: `${overlapDistance}px`,
        transform: `translate3d(0, ${offset.toFixed(1)}px, 0)`,
        zIndex,
        willChange: 'transform',
      }}
      className={`relative ${className}`}
    >
      {children}
    </div>
  );
};
