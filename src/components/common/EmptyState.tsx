import React from 'react';
import { Coffee, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-3xl border border-cream-200 shadow-warm">
      <div className="w-16 h-16 rounded-2xl bg-cream-100 flex items-center justify-center text-coffee-600 mb-4 shadow-inner">
        {icon || <Coffee className="w-8 h-8 text-terracotta-500" />}
      </div>
      <h3 className="text-xl font-serif font-bold text-espresso-900 mb-2">{title}</h3>
      <p className="text-coffee-600 max-w-sm mb-6 text-sm leading-relaxed">{description}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-espresso-900 hover:bg-espresso-800 text-white text-sm font-medium rounded-xl shadow-warm hover:shadow-warm-md transition-all active:scale-[0.98]"
        >
          {actionText}
        </Link>
      )}
      {actionText && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-terracotta-600 hover:bg-terracotta-700 text-white text-sm font-medium rounded-xl shadow-warm hover:shadow-warm-md transition-all active:scale-[0.98]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
