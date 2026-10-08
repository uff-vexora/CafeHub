import React from 'react';

interface FloatingCoffeeBeanProps {
  className?: string;
  size?: number; // width in px
  rotation?: number; // static initial rotation in deg
  depth?: 'near' | 'mid' | 'far';
  delayMs?: number;
}

export const FloatingCoffeeBean: React.FC<FloatingCoffeeBeanProps> = ({
  className = '',
  size = 38,
  rotation = 24,
  depth = 'mid',
  delayMs = 0,
}) => {
  const depthStyles = {
    near: { filter: 'drop-shadow(0 12px 18px rgba(18,11,7,0.35))', opacity: 0.95 },
    mid: { filter: 'drop-shadow(0 6px 12px rgba(18,11,7,0.25))', opacity: 0.85 },
    far: { filter: 'blur(1.5px) drop-shadow(0 2px 6px rgba(18,11,7,0.15))', opacity: 0.55 },
  };

  const currentDepth = depthStyles[depth];

  return (
    <div
      className={`pointer-events-none select-none inline-block ${className}`}
      style={{
        width: size,
        height: size * 1.35,
        transform: `rotate(${rotation}deg)`,
        animationDelay: `${delayMs}ms`,
        ...currentDepth,
      }}
      aria-hidden="true"
    >
      <div className="w-full h-full animate-bean-drift">
        <svg
          viewBox="0 0 40 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Bean Body */}
          <ellipse
            cx="20"
            cy="27"
            rx="18"
            ry="25"
            fill="url(#bean-body-grad)"
          />
          {/* Inner Highlight / Gloss */}
          <path
            d="M8 20 C10 12, 18 6, 26 8"
            stroke="rgba(217, 176, 100, 0.45)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Iconic Center Cleft (The S-curve) */}
          <path
            d="M20 4 C17 14, 23 23, 19 32 C16 39, 21 47, 20 50"
            stroke="#120B07"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M20 6 C17 15, 23 23, 19 32 C16 39, 21 46, 20 48"
            stroke="#FAF4E3"
            strokeWidth="1"
            strokeOpacity="0.45"
            strokeLinecap="round"
          />

          <defs>
            <linearGradient id="bean-body-grad" x1="6" y1="6" x2="34" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#462E20" />
              <stop offset="45%" stopColor="#322016" />
              <stop offset="85%" stopColor="#18100A" />
              <stop offset="100%" stopColor="#120B07" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};
