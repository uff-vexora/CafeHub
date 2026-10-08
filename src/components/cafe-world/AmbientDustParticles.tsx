import React from 'react';

interface AmbientDustParticlesProps {
  count?: number;
  className?: string;
}

export const AmbientDustParticles: React.FC<AmbientDustParticlesProps> = ({
  count = 14,
  className = '',
}) => {
  // Deterministic particle positions and timings
  const particles = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const left = ((i * 37 + 13) % 94) + 3; // 3% to 97%
      const top = ((i * 53 + 7) % 88) + 6;  // 6% to 94%
      const size = (i % 3) + 2; // 2px to 4px
      const duration = 6 + (i % 5) * 1.5; // 6s to 12s
      const delay = (i % 7) * 0.8;
      const opacity = 0.25 + (i % 4) * 0.15;
      return { id: i, left, top, size, duration, delay, opacity };
    });
  }, [count]);

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-caramel-300 animate-float-slow"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            boxShadow: '0 0 6px rgba(232, 205, 148, 0.65)',
          }}
        />
      ))}
    </div>
  );
};
