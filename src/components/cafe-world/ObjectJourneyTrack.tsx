import React from 'react';
import { FloatingCoffeeBean } from './FloatingCoffeeBean';

interface ObjectJourneyTrackProps {
  className?: string;
  scrollY?: number;
}

export const ObjectJourneyTrack: React.FC<ObjectJourneyTrackProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`relative w-full pointer-events-none select-none overflow-visible ${className}`}
      aria-hidden="true"
    >
      {/* Journey Bean 1: Drifting past hero into categories */}
      <div className="absolute -top-8 left-[10%] hidden md:block">
        <FloatingCoffeeBean size={34} rotation={-14} depth="mid" delayMs={0} />
      </div>

      {/* Journey Bean 2: Far subtle depth bean near section bridge */}
      <div className="absolute top-1/2 right-[14%] hidden lg:block opacity-60">
        <FloatingCoffeeBean size={26} rotation={36} depth="far" delayMs={1400} />
      </div>
    </div>
  );
};
