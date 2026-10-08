import React from 'react';
import { useScrollParallax } from './useScrollParallax';

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number; // e.g. -0.15 for background, 0.1 for mid, 0.25 for foreground
  clamp?: [number, number];
  className?: string;
  depth?: 'background' | 'mid' | 'foreground' | 'custom';
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  speed,
  clamp = [-100, 100],
  className = '',
  depth = 'mid',
}) => {
  // Determine speed from depth preset if speed not explicitly provided
  let effectiveSpeed = speed;
  if (effectiveSpeed === undefined) {
    switch (depth) {
      case 'background':
        effectiveSpeed = -0.12;
        break;
      case 'foreground':
        effectiveSpeed = 0.18;
        break;
      case 'mid':
      default:
        effectiveSpeed = 0.08;
        break;
    }
  }

  const [ref, offset] = useScrollParallax<HTMLDivElement>({
    speed: effectiveSpeed,
    clamp,
  });

  return (
    <div
      ref={ref}
      style={{
        transform: `translate3d(0, ${offset.toFixed(1)}px, 0)`,
        transition: 'transform 0.1s linear',
        willChange: 'transform',
      }}
      className={className}
    >
      {children}
    </div>
  );
};
