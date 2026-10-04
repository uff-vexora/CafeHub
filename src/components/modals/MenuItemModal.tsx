import React, { useState } from 'react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { MenuItem } from '../../types';
import { Modal } from '../common/Modal';
import { VegNonVegIndicator } from '../common/Badge';
import { useCart } from '../../context/CartContext';

interface MenuItemModalProps {
  item: MenuItem | null;
  cafeName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const MenuItemModal: React.FC<MenuItemModalProps> = ({
  item,
  cafeName,
  isOpen,
  onClose,
}) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string>>({});
  const [instructions, setInstructions] = useState('');

  if (!item) return null;

  // Set default customizations
  const handleOptionSelect = (groupName: string, optionName: string) => {
    setSelectedCustomizations((prev) => ({
      ...prev,
      [groupName]: optionName,
    }));
  };

  // Calculate unit price with selected customizations
  let unitPrice = item.price;
  if (item.customization_options) {
    item.customization_options.forEach((group) => {
      const selected = selectedCustomizations[group.name];
      if (selected) {
        const opt = group.options.find((o) => o.name === selected);
        if (opt) unitPrice += opt.price;
      } else if (group.options.length > 0) {
        // default first option
        const firstOpt = group.options[0];
        if (firstOpt && firstOpt.price > 0 && selectedCustomizations[group.name] === undefined) {
          // not selected yet
        }
      }
    });
  }

  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(
      item,
      quantity,
      selectedCustomizations,
      instructions.trim() || undefined,
      { id: item.cafe_id, name: cafeName || 'Cafe' }
    );
    onClose();
    setQuantity(1);
    setInstructions('');
    setSelectedCustomizations({});
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="flex flex-col">
        {/* Large Image Header */}
        <div className="relative h-60 sm:h-72 w-full bg-cream-200">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/60 to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <VegNonVegIndicator isVeg={item.is_veg} className="bg-white" />
              <span className="text-xs font-semibold uppercase tracking-wider bg-black/40 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                {item.category_name}
              </span>
            </div>
            <span className="text-xl font-bold text-white bg-terracotta-600/90 px-3 py-1 rounded-xl shadow-warm">
              ₹{item.price}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-2xl font-serif font-bold text-espresso-950">{item.name}</h3>
            <p className="text-sm text-coffee-600 mt-2 leading-relaxed">{item.description}</p>
            {item.ingredients && (
              <div className="mt-3 p-3 bg-cream-50 rounded-2xl border border-cream-200 text-xs text-coffee-700">
                <span className="font-bold text-espresso-900">Key Ingredients: </span>
                {item.ingredients}
              </div>
            )}
          </div>

          {/* Customization Groups */}
          {item.customization_options && item.customization_options.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-cream-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-coffee-500">
                Customizations
              </h4>
              {item.customization_options.map((group) => {
                const currentVal = selectedCustomizations[group.name] || group.options[0]?.name;
                return (
                  <div key={group.id} className="space-y-2">
                    <label className="text-xs font-bold text-espresso-900">
                      {group.name}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {group.options.map((opt) => {
                        const isSelected = currentVal === opt.name;
                        return (
                          <button
                            key={opt.name}
                            type="button"
                            onClick={() => handleOptionSelect(group.name, opt.name)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
                              isSelected
                                ? 'bg-espresso-900 text-white border-espresso-900 shadow-sm'
                                : 'bg-cream-50 hover:bg-cream-100 text-espresso-800 border-cream-200'
                            }`}
                          >
                            <span>{opt.name}</span>
                            {opt.price > 0 && (
                              <span className={`text-[10px] ${isSelected ? 'text-cream-200' : 'text-coffee-500'}`}>
                                +₹{opt.price}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Special Instructions Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-espresso-900">
              Special Instructions (Optional)
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Less sugar, extra hot, no cutlery..."
              maxLength={150}
              className="w-full bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl px-4 py-2.5 text-xs text-espresso-900 placeholder:text-coffee-400 outline-none transition-colors"
            />
          </div>

          {/* Bottom Bar: Quantity Stepper & Add to Cart */}
          <div className="pt-4 border-t border-cream-200 flex items-center justify-between gap-4">
            {/* Quantity Stepper */}
            <div className="flex items-center gap-3 bg-cream-100 border border-cream-200 rounded-2xl p-1.5">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-xl bg-white hover:bg-cream-200/80 text-espresso-900 flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-espresso-950 w-6 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                className="w-8 h-8 rounded-xl bg-white hover:bg-cream-200/80 text-espresso-900 flex items-center justify-center transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold py-3 px-6 rounded-2xl shadow-warm flex items-center justify-between transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <span className="text-sm">Add to Cart</span>
              </div>
              <span className="text-base font-bold">₹{totalPrice}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
