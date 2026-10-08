import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { MenuItem } from '../../types';
import { VegNonVegIndicator } from '../common/Badge';
import { useCart } from '../../context/CartContext';

interface MenuItemCardProps {
  item: MenuItem;
  cafeName?: string;
  onSelect: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, cafeName, onSelect }) => {
  const { items, addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = items.find((ci) => ci.menu_item.id === item.id);
  const countInCart = cartItem?.quantity || 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.customization_options && item.customization_options.length > 0) {
      // If it has options, open customization modal
      onSelect(item);
    } else {
      addToCart(item, 1, undefined, undefined, { id: item.cafe_id, name: cafeName || 'Cafe' });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 500);
    }
  };

  return (
    <div
      onClick={() => onSelect(item)}
      className="group bg-white rounded-3xl border border-cream-200 p-4 sm:p-5 flex gap-4 card-lift hover:shadow-warm-lg hover:border-cream-300 transition-all cursor-pointer relative"
    >
      {/* Left Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <VegNonVegIndicator isVeg={item.is_veg} />
            {item.customization_options && item.customization_options.length > 0 && (
              <span className="text-[10px] font-semibold text-terracotta-600 bg-terracotta-50/80 px-2 py-0.5 rounded-full border border-terracotta-100">
                Customizable
              </span>
            )}
          </div>

          <h4 className="font-serif font-bold text-sm sm:text-base text-espresso-950 group-hover:text-terracotta-600 transition-colors line-clamp-1">
            {item.name}
          </h4>

          <div className="mt-1 font-bold text-sm sm:text-base text-espresso-900 tracking-tight">
            ₹{item.price}
          </div>

          <p className="text-xs text-coffee-600 mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {item.ingredients && (
          <div className="text-[11px] text-coffee-400 mt-2 line-clamp-1">
            <span className="font-semibold text-coffee-600">Ingredients:</span> {item.ingredients}
          </div>
        )}
      </div>

      {/* Right Image & Add Button */}
      <div className="relative shrink-0 flex flex-col items-center">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-cream-100 shadow-inner img-zoom">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Add / Added Button pill */}
        <div className="absolute -bottom-2.5">
          <button
            onClick={handleQuickAdd}
            disabled={!item.is_available}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs shadow-warm flex items-center gap-1.5 transition-all duration-200 active:scale-90 ${
              justAdded ? 'scale-110 ring-4 ring-emerald-500/30 ' : ''
            }${
              !item.is_available
                ? 'bg-cream-200 text-coffee-400 cursor-not-allowed'
                : countInCart > 0
                ? 'bg-emerald-600 text-white shadow-md hover:bg-emerald-700'
                : 'bg-white text-terracotta-600 border border-terracotta-300 hover:bg-terracotta-50 hover:border-terracotta-400 shadow-sm'
            }`}
          >
            {countInCart > 0 ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>ADDED ({countInCart})</span>
              </>
            ) : item.is_available ? (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>ADD</span>
              </>
            ) : (
              <span>SOLD OUT</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
