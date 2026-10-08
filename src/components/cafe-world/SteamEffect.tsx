import React from 'react';

interface SteamEffectProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  opacity?: number;
}

export const SteamEffect: React.FC<SteamEffectProps> = ({
  className = '',
  size = 'md',
  opacity = 0.65,
}) => {
  const sizeMap = {
    sm: { w: 40, h: 60, scale: 0.7 },
    md: { w: 60, h: 90, scale: 1 },
    lg: { w: 90, h: 130, scale: 1.4 },
  };

  const { w, h } = sizeMap[size];

  return (
    <div
      className={`pointer-events-none select-none relative ${className}`}
      style={{ width: w, height: h, opacity }}
      aria-hidden="true"
    >
      {/* Plume 1 */}
      <svg
        className="absolute bottom-0 left-1/2 -translate-x-1/2 animate-steam-1"
        width={w}
        height={h}
        viewBox="0 0 60 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M30 85 C22 70, 36 55, 26 40 C16 25, 34 12, 28 0"
          stroke="url(#steam-grad-1)"
          strokeWidth="6"
          strokeLinecap="round"
          filter="blur(3px)"
        />
        <defs>
          <linearGradient id="steam-grad-1" x1="30" y1="85" x2="28" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FAF4E3" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F9F6F0" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Plume 2 */}
      <svg
        className="absolute bottom-0 left-1/2 -translate-x-1/2 animate-steam-2"
        width={w}
        height={h}
        viewBox="0 0 60 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M32 85 C40 68, 24 50, 35 32 C44 18, 26 8, 32 0"
          stroke="url(#steam-grad-2)"
          strokeWidth="5"
          strokeLinecap="round"
          filter="blur(3.5px)"
        />
        <defs>
          <linearGradient id="steam-grad-2" x1="32" y1="85" x2="32" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="55%" stopColor="#FAF4E3" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F9F6F0" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Plume 3 */}
      <svg
        className="absolute bottom-0 left-1/2 -translate-x-1/2 animate-steam-3"
        width={w}
        height={h}
        viewBox="0 0 60 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M28 85 C32 66, 26 46, 30 28 C34 14, 25 6, 29 0"
          stroke="url(#steam-grad-3)"
          strokeWidth="4.5"
          strokeLinecap="round"
          filter="blur(4px)"
        />
        <defs>
          <linearGradient id="steam-grad-3" x1="28" y1="85" x2="29" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
            <stop offset="60%" stopColor="#FAF4E3" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F9F6F0" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
