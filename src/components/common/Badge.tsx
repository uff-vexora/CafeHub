import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    primary: 'bg-terracotta-50 text-terracotta-600 border border-terracotta-200',
    secondary: 'bg-coffee-50 text-coffee-700 border border-coffee-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    outline: 'border border-[#E2D5C0] text-espresso-700 bg-transparent',
    neutral: 'bg-cream-100 text-espresso-800 border border-cream-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 font-medium rounded-full',
    md: 'text-sm px-3 py-1 font-medium rounded-full',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const VegNonVegIndicator: React.FC<{ isVeg: boolean; className?: string }> = ({
  isVeg,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center justify-center w-4 h-4 border-2 rounded-sm ${
        isVeg ? 'border-emerald-600' : 'border-rose-600'
      } ${className}`}
      title={isVeg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
    >
      <span
        className={`w-2 h-2 rounded-full ${isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`}
      />
    </span>
  );
};
