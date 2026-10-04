import React from 'react';

export const CafeCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl border border-cream-200 overflow-hidden shadow-warm animate-pulse">
      <div className="h-56 bg-cream-200 w-full" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start">
          <div className="h-6 bg-cream-200 rounded-lg w-2/3" />
          <div className="h-6 bg-cream-200 rounded-md w-12" />
        </div>
        <div className="h-4 bg-cream-200 rounded w-1/2" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 bg-cream-200 rounded-full w-16" />
          <div className="h-6 bg-cream-200 rounded-full w-20" />
        </div>
        <div className="pt-3 border-t border-cream-100 flex justify-between items-center">
          <div className="h-4 bg-cream-200 rounded w-20" />
          <div className="h-8 bg-cream-200 rounded-xl w-24" />
        </div>
      </div>
    </div>
  );
};

export const MenuItemSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-cream-200 p-4 flex gap-4 animate-pulse shadow-warm">
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-cream-200 shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-5 bg-cream-200 rounded w-3/4" />
        <div className="h-3.5 bg-cream-200 rounded w-full" />
        <div className="h-3.5 bg-cream-200 rounded w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-cream-200 rounded w-16" />
          <div className="h-8 bg-cream-200 rounded-xl w-20" />
        </div>
      </div>
    </div>
  );
};
