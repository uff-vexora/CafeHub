import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Utensils,
  Bike,
  Package,
  Info,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { VegNonVegIndicator } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { OrderType } from '../types';

export const CartPage: React.FC = () => {
  const {
    items,
    cafeName,
    cafeId,
    orderType,
    setOrderType,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    taxes,
    serviceFee,
    deliveryFee,
    totalAmount,
  } = useCart();

  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="Your Cart is Empty"
          description="Explore gourmet menus, single-origin coffees, and artisanal pastries from the best cafes near you."
          actionText="Browse Specialty Cafes"
          actionLink="/cafes"
          icon={<ShoppingBag className="w-8 h-8 text-terracotta-500" />}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta-600">
            Order Review
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-espresso-950 mt-1">
            Your Cart
          </h1>
          {cafeName && (
            <p className="text-xs text-coffee-600 mt-1">
              Ordering from{' '}
              <Link to={`/cafes/${cafeId}`} className="font-bold text-espresso-900 hover:underline">
                {cafeName}
              </Link>
            </p>
          )}
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Cart Items & Order Type */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Type Selector */}
          <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-warm space-y-3">
            <h3 className="font-serif font-bold text-sm text-espresso-950">
              How would you like your order?
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'dine_in' as OrderType, label: 'Dine-In', icon: <Utensils className="w-4 h-4" /> },
                { type: 'pickup' as OrderType, label: 'Takeaway', icon: <Package className="w-4 h-4" /> },
                { type: 'delivery' as OrderType, label: 'Delivery', icon: <Bike className="w-4 h-4" /> },
              ].map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setOrderType(opt.type)}
                  className={`py-3 px-2 rounded-2xl border text-center font-bold text-xs flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                    orderType === opt.type
                      ? 'bg-espresso-900 text-white border-espresso-900 shadow-warm'
                      : 'bg-cream-50 hover:bg-cream-100 text-espresso-800 border-cream-200'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white rounded-3xl border border-cream-200 shadow-warm divide-y divide-cream-100 overflow-hidden">
            {items.map((cartItem, index) => {
              const item = cartItem.menu_item;
              return (
                <div key={index} className="p-5 flex items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex items-center gap-3.5">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 bg-cream-100"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <VegNonVegIndicator isVeg={item.is_veg} />
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-espresso-950">
                          {item.name}
                        </h4>
                      </div>
                      <div className="text-xs font-bold text-espresso-900">
                        ₹{item.price}
                      </div>

                      {/* Customizations display */}
                      {cartItem.selected_customizations && (
                        <div className="flex flex-wrap gap-1 text-[11px] text-coffee-600">
                          {Object.entries(cartItem.selected_customizations).map(([k, v]) => (
                            <span key={k} className="bg-cream-100 px-2 py-0.5 rounded-md">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}

                      {cartItem.special_instructions && (
                        <p className="text-[11px] text-coffee-500 italic">
                          Note: "{cartItem.special_instructions}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Quantity Stepper & Subtotal */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-cream-100 border border-cream-200 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(index, cartItem.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-white text-espresso-900 flex items-center justify-center hover:bg-cream-200 shadow-sm"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-espresso-900 w-4 text-center">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(index, cartItem.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-white text-espresso-900 flex items-center justify-center hover:bg-cream-200 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <div className="font-bold text-sm text-espresso-950">
                        ₹{item.price * cartItem.quantity}
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to={cafeId ? `/cafes/${cafeId}` : '/cafes'}
            className="inline-flex items-center gap-2 text-xs font-bold text-coffee-700 hover:text-terracotta-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Add more items from {cafeName || 'Cafe'}</span>
          </Link>
        </div>

        {/* Right Col: Bill Summary Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm space-y-4">
            <h3 className="font-serif font-bold text-lg text-espresso-950 pb-3 border-b border-cream-100">
              Bill Summary
            </h3>

            <div className="space-y-2.5 text-xs text-espresso-900">
              <div className="flex justify-between">
                <span className="text-coffee-600">Item Subtotal</span>
                <span className="font-bold">₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-coffee-600 flex items-center gap-1">
                  GST (5%)
                  <Info className="w-3 h-3 text-coffee-400" />
                </span>
                <span className="font-semibold">₹{taxes.toFixed(2)}</span>
              </div>

              {serviceFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-coffee-600">Cafe Service Fee</span>
                  <span className="font-semibold">₹{serviceFee.toFixed(2)}</span>
                </div>
              )}

              {deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-coffee-600">Delivery Fee</span>
                  <span className="font-semibold">₹{deliveryFee.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-cream-200 flex justify-between items-baseline">
                <div>
                  <span className="font-serif font-bold text-base text-espresso-950">Grand Total</span>
                  <p className="text-[10px] text-coffee-400">Inclusive of all taxes</p>
                </div>
                <span className="text-2xl font-bold text-terracotta-600">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-sm rounded-2xl shadow-warm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-coffee-400">
              🔒 Safe & secure simulated checkout with instant confirmation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
