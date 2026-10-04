import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Coffee,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';

export const CheckoutPage: React.FC = () => {
  const { items, cafeId, cafeName, orderType, subtotal, taxes, serviceFee, deliveryFee, totalAmount, clearCart } = useCart();
  const { cafes, createOrder } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const cafe = cafes.find((c) => c.id === cafeId);

  // Form states
  const [customerName, setCustomerName] = useState(user?.full_name || 'Aravind Sharma');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+91 98765 43210');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'aravind@example.com');

  // Delivery / Dine-in details
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 402, Sea Green Apts, Hill Road, Bandra West');
  const [deliveryCity, setDeliveryCity] = useState(cafe?.city || 'Mumbai');
  const [deliveryPostalCode, setDeliveryPostalCode] = useState('400050');
  const [dineInTable, setDineInTable] = useState('Table 4 (Window Seat)');
  const [notes, setNotes] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Counter'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (items.length === 0 && !confirmedOrder) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const res = createOrder({
        cafe_id: cafeId || 'cafe-1',
        cafe_name: cafeName || 'Specialty Cafe',
        cafe_image: cafe?.cover_image || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
        order_type: orderType,
        items: items.map((ci, idx) => ({
          id: `oi-${Date.now()}-${idx}`,
          menu_item_id: ci.menu_item.id,
          item_name: ci.menu_item.name,
          item_price: ci.menu_item.price,
          quantity: ci.quantity,
          item_total: ci.menu_item.price * ci.quantity,
          customizations: ci.selected_customizations,
        })),
        subtotal,
        taxes,
        service_fee: serviceFee,
        delivery_fee: deliveryFee,
        total_amount: totalAmount,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        delivery_address: orderType === 'delivery' ? deliveryAddress : undefined,
        delivery_city: orderType === 'delivery' ? deliveryCity : undefined,
        delivery_postal_code: orderType === 'delivery' ? deliveryPostalCode : undefined,
        dine_in_table: orderType === 'dine_in' ? dineInTable : undefined,
        notes: notes.trim() || undefined,
        payment_status: 'paid',
        payment_method: paymentMethod === 'UPI' ? 'UPI (Google Pay / PhonePe)' : paymentMethod === 'Card' ? 'Credit / Debit Card' : 'Pay at Counter',
        estimated_time: orderType === 'delivery' ? '30-40 mins' : orderType === 'pickup' ? '15 mins' : '10-15 mins',
      });

      if (res.success && res.order) {
        setConfirmedOrder(res.order);
      }
      clearCart();
      setIsProcessing(false);

      // Trigger Confetti
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#DE6441', '#8C6543', '#E2971B', '#10B981'],
      });
    }, 1200);
  };

  // Confirmation View
  if (confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white p-8 sm:p-10 rounded-4xl border border-cream-200 shadow-warm-xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center border-2 border-emerald-200 shadow-warm animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3.5 py-1 rounded-full">
              Payment Successful • Order Placed
            </span>
            <h2 className="text-3xl font-serif font-bold text-espresso-950 mt-3">
              Order Confirmed!
            </h2>
            <p className="text-xs text-coffee-600 mt-1 max-w-sm mx-auto">
              Your order <span className="font-bold text-espresso-900">#{confirmedOrder.order_number}</span> has been sent to {confirmedOrder.cafe_name}.
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-cream-50 p-6 rounded-3xl border border-cream-200 text-left space-y-3.5 text-xs text-espresso-900">
            <div className="flex justify-between pb-2.5 border-b border-cream-200">
              <span className="text-coffee-500">Order ID:</span>
              <span className="font-mono font-bold text-espresso-950">#{confirmedOrder.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-coffee-500">Order Type:</span>
              <span className="font-bold uppercase tracking-wider text-terracotta-600">
                {confirmedOrder.order_type.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-coffee-500">Total Amount Paid:</span>
              <span className="font-bold text-base text-espresso-950">₹{confirmedOrder.total_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-coffee-500">Payment Mode:</span>
              <span className="font-semibold text-emerald-700">{confirmedOrder.payment_method}</span>
            </div>
            {confirmedOrder.dine_in_table && (
              <div className="flex justify-between">
                <span className="text-coffee-500">Dine-In Table:</span>
                <span className="font-bold">{confirmedOrder.dine_in_table}</span>
              </div>
            )}
            {confirmedOrder.delivery_address && (
              <div className="flex justify-between">
                <span className="text-coffee-500">Delivery Address:</span>
                <span className="font-semibold text-right max-w-[220px]">
                  {confirmedOrder.delivery_address}, {confirmedOrder.delivery_city}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 py-3.5 bg-espresso-900 hover:bg-espresso-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-warm flex items-center justify-center gap-2 transition-all"
            >
              <span>Track Live Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/cafes"
              className="py-3.5 px-6 bg-cream-100 hover:bg-cream-200 text-espresso-900 font-bold text-xs sm:text-sm rounded-2xl transition-colors text-center"
            >
              Back to Explore
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-terracotta-600">
          Almost Ready
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-espresso-950 mt-1">
          Complete Your Order
        </h1>
        <p className="text-xs text-coffee-600 mt-1">
          Ordering from {cafeName} • Total: ₹{totalAmount.toFixed(2)}
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Customer Info & Delivery Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm space-y-4">
            <h3 className="font-serif font-bold text-base text-espresso-950 pb-2 border-b border-cream-100">
              1. Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-espresso-900">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full mt-1.5 bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl px-3.5 py-2.5 text-xs text-espresso-900 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-espresso-900">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full mt-1.5 bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl px-3.5 py-2.5 text-xs text-espresso-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-espresso-900">Email Address *</label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full mt-1.5 bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl px-3.5 py-2.5 text-xs text-espresso-900 outline-none"
              />
            </div>
          </div>

          {/* Order-type specific details */}
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm space-y-4">
            <h3 className="font-serif font-bold text-base text-espresso-950 pb-2 border-b border-cream-100">
              2.{' '}
              {orderType === 'dine_in'
                ? 'Dine-In Details'
                : orderType === 'pickup'
                ? 'Takeaway Pickup Details'
                : 'Delivery Address'}
            </h3>

            {orderType === 'dine_in' && (
              <div>
                <label className="text-xs font-bold text-espresso-900">
                  Table Number or Seating Area
                </label>
                <input
                  type="text"
                  value={dineInTable}
                  onChange={(e) => setDineInTable(e.target.value)}
                  placeholder="e.g. Table 7 or Courtyard Balcony"
                  className="w-full mt-1.5 bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl px-3.5 py-2.5 text-xs text-espresso-900 outline-none"
                />
              </div>
            )}

            {orderType === 'delivery' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-espresso-900">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Building, Street, Landmark"
                    className="w-full mt-1.5 bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl px-3.5 py-2.5 text-xs text-espresso-900 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-espresso-900">City *</label>
                    <input
                      type="text"
                      required
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      className="w-full mt-1.5 bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl px-3.5 py-2.5 text-xs text-espresso-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-espresso-900">Postal Code *</label>
                    <input
                      type="text"
                      required
                      value={deliveryPostalCode}
                      onChange={(e) => setDeliveryPostalCode(e.target.value)}
                      className="w-full mt-1.5 bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl px-3.5 py-2.5 text-xs text-espresso-900 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {orderType === 'pickup' && (
              <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 text-xs text-coffee-700">
                <span className="font-bold text-espresso-900">Pickup Location: </span>
                {cafe?.address}, {cafe?.city}
                <p className="mt-1 text-[11px] text-coffee-500">
                  Your order will be ready in approximately 15 minutes at the barista counter.
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-espresso-900">
                Cooking / Delivery Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Leave package with security guard, extra hot milk..."
                className="w-full mt-1.5 bg-cream-50 border border-cream-200 focus:border-terracotta-500 rounded-xl px-3.5 py-2.5 text-xs text-espresso-900 outline-none"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm space-y-4">
            <h3 className="font-serif font-bold text-base text-espresso-950 pb-2 border-b border-cream-100 flex items-center justify-between">
              <span>3. Payment Method</span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Secure Flow
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'UPI' as const, title: 'Instant UPI', desc: 'GPay / PhonePe / Paytm', icon: <QrCode className="w-5 h-5 text-terracotta-600" /> },
                { id: 'Card' as const, title: 'Card', desc: 'Credit / Debit Cards', icon: <CreditCard className="w-5 h-5 text-terracotta-600" /> },
                { id: 'Counter' as const, title: 'Pay at Cafe', desc: 'Cash / Card in-person', icon: <Banknote className="w-5 h-5 text-terracotta-600" /> },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    paymentMethod === opt.id
                      ? 'bg-cream-100/70 border-terracotta-500 ring-2 ring-terracotta-400/20 shadow-sm'
                      : 'bg-white hover:bg-cream-50 border-cream-200'
                  }`}
                >
                  <div className="mb-2">{opt.icon}</div>
                  <div className="text-xs font-bold text-espresso-950">{opt.title}</div>
                  <div className="text-[10px] text-coffee-500 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-coffee-400 bg-cream-50 p-3 rounded-xl border border-cream-200">
              * Note: Running in test sandbox mode. No real money will be charged.
            </p>
          </div>
        </div>

        {/* Right Col: Order Summary & Place Button */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-warm space-y-4">
            <h3 className="font-serif font-bold text-lg text-espresso-950 pb-2 border-b border-cream-100">
              Order Summary
            </h3>

            <div className="max-h-56 overflow-y-auto divide-y divide-cream-100 pr-1">
              {items.map((cartItem, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-espresso-900">{cartItem.quantity}x </span>
                    <span className="text-espresso-800">{cartItem.menu_item.name}</span>
                  </div>
                  <span className="font-semibold text-espresso-900">
                    ₹{cartItem.menu_item.price * cartItem.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-cream-200 space-y-2 text-xs text-espresso-900">
              <div className="flex justify-between">
                <span className="text-coffee-600">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-coffee-600">GST (5%)</span>
                <span>₹{taxes.toFixed(2)}</span>
              </div>
              {serviceFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-coffee-600">Service Fee</span>
                  <span>₹{serviceFee.toFixed(2)}</span>
                </div>
              )}
              {deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-coffee-600">Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-cream-200 flex justify-between items-baseline font-bold text-base text-espresso-950">
                <span>Total Amount</span>
                <span className="text-xl text-terracotta-600">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-sm rounded-2xl shadow-warm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <span>Pay & Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
