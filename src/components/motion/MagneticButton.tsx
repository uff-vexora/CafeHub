import React from 'react';
import { useMagnetic } from './useMagnetic';

interface MagneticButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  strength?: number; // 2 to 8px
  className?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  strength = 5,
  className = '',
  ...props
}) => {
  const { ref, style, bind } = useMagnetic<HTMLDivElement>({ strength });

  return (
    <div
      ref={ref}
      style={style}
      {...bind}
      className={`inline-block ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
