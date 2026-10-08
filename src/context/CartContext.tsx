import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, MenuItem, OrderType } from '../types';

interface CartContextType {
  items: CartItem[];
  cafeId: string | null;
  cafeName: string | null;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  addToCart: (
    item: MenuItem,
    quantity?: number,
    customizations?: Record<string, string>,
    instructions?: string,
    cafeInfo?: { id: string; name: string }
  ) => boolean;
  updateQuantity: (index: number, quantity: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  taxes: number;
  serviceFee: number;
  deliveryFee: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cafehub_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [orderType, setOrderType] = useState<OrderType>('dine_in');

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const cafeId = items.length > 0 ? items[0].cafe_id : null;
  const cafeName = items.length > 0 ? items[0].cafe_name : null;

  const addToCart = (
    item: MenuItem,
    quantity = 1,
    customizations?: Record<string, string>,
    instructions?: string,
    cafeInfo?: { id: string; name: string }
  ): boolean => {
    // Only available items can be added to cart
    if (!item.is_available) {
      alert(`"${item.name}" is currently sold out and unavailable.`);
      return false;
    }

    const targetCafeId = cafeInfo?.id || item.cafe_id;
    const targetCafeName = cafeInfo?.name || 'Cafe';

    // If cart has items from a different cafe, check
    if (items.length > 0 && items[0].cafe_id !== targetCafeId) {
      const confirmSwitch = window.confirm(
        `Your cart contains items from "${items[0].cafe_name}". Would you like to clear your cart and start an order from "${targetCafeName}"?`
      );
      if (!confirmSwitch) return false;
      setItems([
        {
          menu_item: item,
          quantity,
          selected_customizations: customizations,
          special_instructions: instructions,
          cafe_id: targetCafeId,
          cafe_name: targetCafeName,
        },
      ]);
      return true;
    }

    // Check if duplicate with identical customizations
    const existingIndex = items.findIndex(
      (cartItem) =>
        cartItem.menu_item.id === item.id &&
        JSON.stringify(cartItem.selected_customizations || {}) ===
          JSON.stringify(customizations || {})
    );

    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += quantity;
      setItems(updated);
    } else {
      setItems((prev) => [
        ...prev,
        {
          menu_item: item,
          quantity,
          selected_customizations: customizations,
          special_instructions: instructions,
          cafe_id: targetCafeId,
          cafe_name: targetCafeName,
        },
      ]);
    }

    return true;
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    let itemPrice = item.menu_item.price;
    // Add customization costs if any
    if (item.selected_customizations && item.menu_item.customization_options) {
      item.menu_item.customization_options.forEach((group) => {
        const selectedVal = item.selected_customizations?.[group.name];
        if (selectedVal) {
          const matchedOpt = group.options.find((opt) => opt.name === selectedVal);
          if (matchedOpt) {
            itemPrice += matchedOpt.price;
          }
        }
      });
    }
    return sum + itemPrice * item.quantity;
  }, 0);

  // 5% GST
  const taxes = Number((subtotal * 0.05).toFixed(2));
  // Small service fee
  const serviceFee = items.length > 0 ? (orderType === 'dine_in' ? 25 : 15) : 0;
  // Delivery fee if delivery
  const deliveryFee = items.length > 0 && orderType === 'delivery' ? 40 : 0;

  const totalAmount = Number((subtotal + taxes + serviceFee + deliveryFee).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        items,
        cafeId,
        cafeName,
        orderType,
        setOrderType,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
        subtotal,
        taxes,
        serviceFee,
        deliveryFee,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
