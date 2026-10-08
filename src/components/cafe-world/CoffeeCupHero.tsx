import React from 'react';
import { SteamEffect } from './SteamEffect';

interface CoffeeCupHeroProps {
  className?: string;
  scrollRotation?: number; // deg, controlled by scroll progress
  scrollScale?: number; // scale multiplier
  scrollTranslateX?: number; // px
  scrollTranslateY?: number; // px
  showSteam?: boolean;
}

export const CoffeeCupHero: React.FC<CoffeeCupHeroProps> = ({
  className = '',
  scrollRotation = 0,
  scrollScale = 1,
  scrollTranslateX = 0,
  scrollTranslateY = 0,
  showSteam = true,
}) => {
  return (
    <div
      className={`relative select-none pointer-events-none ${className}`}
      style={{
        transform: `translate3d(${scrollTranslateX.toFixed(1)}px, ${scrollTranslateY.toFixed(1)}px, 0) scale(${scrollScale.toFixed(3)}) rotate(${scrollRotation.toFixed(2)}deg)`,
        transformOrigin: '50% 65%',
        willChange: 'transform',
        transition: 'transform 0.08s ease-out',
      }}
      aria-hidden="true"
    >
      {/* Rising Steam Above Cup */}
      {showSteam && (
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-20">
          <SteamEffect size="lg" opacity={0.8} />
        </div>
      )}

      {/* Main Ceramic Cup Vector Composition */}
      <svg
        viewBox="0 0 340 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_25px_35px_rgba(18,11,7,0.45)]"
      >
        <defs>
          {/* Saucer Outer Gradient */}
          <linearGradient id="saucer-grad" x1="40" y1="210" x2="300" y2="250" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F9F6F0" />
            <stop offset="40%" stopColor="#EDE4D3" />
            <stop offset="70%" stopColor="#DECAB1" />
            <stop offset="100%" stopColor="#C9A986" />
          </linearGradient>

          {/* Cup Body Ceramic Gradient */}
          <linearGradient id="cup-body-grad" x1="70" y1="110" x2="250" y2="215" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#F9F6F0" />
            <stop offset="65%" stopColor="#E9DFC9" />
            <stop offset="100%" stopColor="#C9A986" />
          </linearGradient>

          {/* Espresso Crema & Latte Art Surface */}
          <radialGradient id="crema-surface" cx="160" cy="115" r="75" fx="150" fy="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F9F6F0" />
            <stop offset="22%" stopColor="#E8CD94" />
            <stop offset="55%" stopColor="#A9825F" />
            <stop offset="85%" stopColor="#533722" />
            <stop offset="100%" stopColor="#23160F" />
          </radialGradient>

          {/* Handle Gradient */}
          <linearGradient id="handle-grad" x1="230" y1="120" x2="295" y2="185" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#EDE4D3" />
            <stop offset="100%" stopColor="#C9A986" />
          </linearGradient>

          {/* Golden Rim Accent */}
          <linearGradient id="gold-rim" x1="70" y1="105" x2="250" y2="125" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FAF4E3" />
            <stop offset="50%" stopColor="#D9B064" />
            <stop offset="100%" stopColor="#A77526" />
          </linearGradient>
        </defs>

        {/* 1. Cast Shadow on Table */}
        <ellipse cx="160" cy="248" rx="135" ry="18" fill="rgba(18, 11, 7, 0.45)" filter="blur(8px)" />

        {/* 2. Saucer */}
        <ellipse cx="160" cy="225" rx="125" ry="24" fill="url(#saucer-grad)" stroke="#E9DFC9" strokeWidth="2" />
        <ellipse cx="160" cy="224" rx="90" ry="14" fill="#DECAB1" opacity="0.6" />
        <ellipse cx="160" cy="223" rx="85" ry="12" fill="none" stroke="url(#gold-rim)" strokeWidth="1.5" opacity="0.7" />

        {/* 3. Cup Handle */}
        <path
          d="M225 125 C265 125, 285 145, 275 175 C265 200, 230 195, 218 190"
          stroke="url(#handle-grad)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M225 125 C265 125, 285 145, 275 175 C265 200, 230 195, 218 190"
          stroke="#18100A"
          strokeWidth="1"
          opacity="0.2"
        />

        {/* 4. Cup Body */}
        <path
          d="M80 115 C85 175, 110 215, 160 215 C210 215, 235 175, 240 115 Z"
          fill="url(#cup-body-grad)"
          stroke="#F3EDE2"
          strokeWidth="1.5"
        />

        {/* Cup Shadow Contour */}
        <path
          d="M175 118 C205 155, 225 185, 238 120"
          stroke="rgba(70, 46, 32, 0.18)"
          strokeWidth="12"
          strokeLinecap="round"
          filter="blur(4px)"
        />

        {/* 5. Cup Rim & Crema Liquid Surface */}
        <ellipse cx="160" cy="115" rx="80" ry="18" fill="url(#crema-surface)" stroke="url(#gold-rim)" strokeWidth="3" />

        {/* 6. Handcrafted Latte Art Rosette / Heart in Foam */}
        <g opacity="0.92">
          {/* Heart Base */}
          <path
            d="M160 123 C150 112, 138 116, 145 106 C152 98, 160 105, 160 108 C160 105, 168 98, 175 106 C182 116, 170 112, 160 123 Z"
            fill="#FFFFFF"
            opacity="0.95"
            filter="blur(0.6px)"
          />
          {/* Inner Foam Leaves */}
          <path
            d="M160 120 C154 114, 147 114, 151 109 C155 104, 160 108, 160 108 C160 108, 165 104, 169 109 C173 114, 166 114, 160 120 Z"
            fill="#FAF4E3"
            opacity="0.85"
          />
          {/* Center Stem Line */}
          <path
            d="M160 104 L160 124"
            stroke="#A9825F"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
      </svg>
    </div>
  );
};
