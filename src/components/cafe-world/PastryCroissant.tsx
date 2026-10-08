import React from 'react';

interface PastryCroissantProps {
  className?: string;
  size?: number;
  rotation?: number;
  depth?: 'near' | 'mid' | 'far';
}

export const PastryCroissant: React.FC<PastryCroissantProps> = ({
  className = '',
  size = 54,
  rotation = -12,
  depth = 'mid',
}) => {
  const depthStyles = {
    near: { filter: 'drop-shadow(0 14px 20px rgba(18,11,7,0.3))', opacity: 0.95 },
    mid: { filter: 'drop-shadow(0 8px 14px rgba(18,11,7,0.22))', opacity: 0.85 },
    far: { filter: 'blur(1.5px) drop-shadow(0 4px 8px rgba(18,11,7,0.14))', opacity: 0.55 },
  };

  return (
    <div
      className={`pointer-events-none select-none inline-block ${className}`}
      style={{
        width: size,
        height: size * 0.72,
        transform: `rotate(${rotation}deg)`,
        ...depthStyles[depth],
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="croissant-gold" x1="10" y1="10" x2="90" y2="65" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F3E4C0" />
            <stop offset="25%" stopColor="#E8CD94" />
            <stop offset="60%" stopColor="#D9B064" />
            <stop offset="85%" stopColor="#C6933B" />
            <stop offset="100%" stopColor="#845F40" />
          </linearGradient>
          <linearGradient id="crust-bake" x1="30" y1="20" x2="70" y2="55" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C2573B" />
            <stop offset="60%" stopColor="#8D321D" />
            <stop offset="100%" stopColor="#3D2717" />
          </linearGradient>
        </defs>

        {/* Back Horns */}
        <path
          d="M15 48 C8 38, 12 25, 26 22 C32 20, 42 22, 50 25 C58 22, 68 20, 74 22 C88 25, 92 38, 85 48 C78 54, 70 48, 64 42 C58 37, 42 37, 36 42 C30 48, 22 54, 15 48 Z"
          fill="url(#croissant-gold)"
        />

        {/* Center Plump Segment */}
        <ellipse cx="50" cy="34" rx="26" ry="19" fill="url(#croissant-gold)" stroke="#C6933B" strokeWidth="1" />

        {/* Golden Baked Crust Rings */}
        <path
          d="M36 22 C34 32, 35 44, 40 50"
          stroke="url(#crust-bake)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M48 16 C48 30, 48 42, 52 52"
          stroke="url(#crust-bake)"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M62 22 C64 32, 63 44, 58 50"
          stroke="url(#crust-bake)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Flaky Glaze Highlights */}
        <path
          d="M42 20 C46 18, 54 18, 58 20"
          stroke="#FAF4E3"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M32 30 C35 28, 40 29, 42 32"
          stroke="#FAF4E3"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    </div>
  );
};
