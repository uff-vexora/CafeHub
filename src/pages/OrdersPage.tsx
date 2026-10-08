import React, { useState } from 'react';
import {
  ChevronRight,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { Reveal } from '../components/motion';
import { VisualOrderStatusTracker } from '../components/cafe-world/VisualOrderStatusTracker';

export const OrdersPage: React.FC = () => {
  const { orders } = useData();
  const { user } = useAuth();

  // Filter orders strictly for the authenticated customer
  const userOrders = orders.filter((o) => o.user_id === user?.id);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(userOrders[0]?.id || '');

  const activeOrder = userOrders.find((o) => o.id === selectedOrderId) || userOrders[0];

  if (userOrders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="No Orders Yet"
          description="You haven't placed any orders yet. Discover delicious brews and fresh bakery items from nearby cafes."
          actionText="Find Cafes"
          actionLink="/cafes"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-terracotta-600">
          Order Tracking
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-espresso-950 mt-1">
          Your Cafe Orders
        </h1>
        <p className="text-xs text-coffee-600 mt-1">
          Live visual progress and past history of orders placed on CafeHub.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Orders List */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-base text-espresso-950">
            Recent Orders ({userOrders.length})
          </h3>

          <div className="space-y-3">
            {userOrders.map((order, idx) => {
              const isSelected = order.id === selectedOrderId;
              return (
                <Reveal key={order.id} variant="fade-up" delayMs={idx * 50} durationMs={400}>
                  <div
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer card-lift ${
                      isSelected
                        ? 'bg-white border-terracotta-500 shadow-warm-md ring-2 ring-terracotta-500/20'
                        : 'bg-white hover:bg-cream-50 border-cream-200 shadow-warm'
                    }`}
                  >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-espresso-900">
                      #{order.order_number}
                    </span>
                    <Badge
                      variant={
                        order.status === 'completed'
                          ? 'success'
                          : order.status === 'cancelled'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-espresso-950 line-clamp-1">
                    {order.cafe_name}
                  </h4>

                  <div className="text-[11px] text-coffee-500 mt-1">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} • ₹{order.total_amount.toFixed(2)}
                  </div>

                  <div className="pt-2 mt-2 border-t border-cream-100 flex items-center justify-between text-[11px] text-coffee-400">
                    <span>
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="font-semibold text-terracotta-600 flex items-center gap-0.5">
                      Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Reveal>
            );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Active Order Visual Progress & Details */}
        {activeOrder && (
          <div className="lg:col-span-2 space-y-6">
            {/* Visual Living Kitchen / Barista Tracker */}
            <VisualOrderStatusTracker
              status={activeOrder.status}
              orderNumber={activeOrder.order_number}
              estimatedTime={activeOrder.estimated_time}
            />

            {/* Items Breakdown Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-warm space-y-4">
              <h4 className="font-serif font-bold text-base text-espresso-950 pb-2 border-b border-cream-100">
                Items in this Order
              </h4>

              <div className="divide-y divide-cream-100">
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-espresso-900">
                        {item.quantity}x {item.item_name}
                      </div>
                      {item.customizations && (
                        <div className="text-[11px] text-coffee-500">
                          {Object.entries(item.customizations)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-espresso-900">
                      ₹{item.item_total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financials */}
              <div className="pt-3 border-t border-cream-200 space-y-1.5 text-xs text-espresso-900">
                <div className="flex justify-between text-coffee-600">
                  <span>Subtotal</span>
                  <span>₹{activeOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-coffee-600">
                  <span>Taxes</span>
                  <span>₹{activeOrder.taxes.toFixed(2)}</span>
                </div>
                {activeOrder.service_fee > 0 && (
                  <div className="flex justify-between text-coffee-600">
                    <span>Service Fee</span>
                    <span>₹{activeOrder.service_fee.toFixed(2)}</span>
                  </div>
                )}
                {activeOrder.delivery_fee > 0 && (
                  <div className="flex justify-between text-coffee-600">
                    <span>Delivery Fee</span>
                    <span>₹{activeOrder.delivery_fee.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-cream-100 flex justify-between font-bold text-base text-espresso-950">
                  <span>Total Paid</span>
                  <span className="text-terracotta-600">₹{activeOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
