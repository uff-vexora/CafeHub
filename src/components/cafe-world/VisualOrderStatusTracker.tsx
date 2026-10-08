import React from 'react';
import { ShoppingBag, Flame, Coffee, CheckCircle2, AlertCircle } from 'lucide-react';
import { OrderStatus } from '../../types';
import { SteamEffect } from './SteamEffect';

interface VisualOrderStatusTrackerProps {
  status: OrderStatus;
  orderNumber: string;
  estimatedTime?: string;
}

interface StepMeta {
  key: OrderStatus;
  title: string;
  story: string;
  icon: React.ReactNode;
}

const STEPS: StepMeta[] = [
  {
    key: 'order_placed',
    title: 'Ticket Received',
    story: 'Roaster tickets printed & sent to barista bar',
    icon: <ShoppingBag className="w-4 h-4" />,
  },
  {
    key: 'confirmed',
    title: 'Grind & Tamp',
    story: 'Single-origin beans ground & dialed in',
    icon: <Flame className="w-4 h-4" />,
  },
  {
    key: 'preparing',
    title: 'Brewing & Steam',
    story: 'Espresso extraction & milk steaming in progress',
    icon: <Coffee className="w-4 h-4" />,
  },
  {
    key: 'ready',
    title: 'Ready on Counter',
    story: 'Your artisan order is hot, plated & waiting',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  {
    key: 'completed',
    title: 'Served & Enjoyed',
    story: 'Experience completed. Savor every sip!',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
];

export const VisualOrderStatusTracker: React.FC<VisualOrderStatusTrackerProps> = ({
  status,
  orderNumber,
  estimatedTime = '15-20 mins',
}) => {
  const getIndex = (st: OrderStatus) => {
    if (st === 'cancelled') return -1;
    return STEPS.findIndex((s) => s.key === st);
  };

  const currentIndex = getIndex(status);

  if (status === 'cancelled') {
    return (
      <div className="p-5 bg-rose-50 text-rose-800 border border-rose-200 rounded-3xl flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
        <div>
          <div className="font-bold text-sm">Order Cancelled</div>
          <div className="text-xs text-rose-700/80 mt-0.5">
            This ticket was voided. Any captured funds have been credited back.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-4xl border border-cream-200 shadow-warm space-y-6 relative overflow-hidden">
      {/* Background warm glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-caramel-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Header story */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-cream-200 relative z-10">
        <div>
          <span className="text-[11px] font-bold text-terracotta-600 uppercase tracking-wider">
            Live Barista Progression
          </span>
          <h3 className="font-serif font-bold text-2xl text-espresso-950 mt-1">
            Order #{orderNumber}
          </h3>
        </div>

        {/* Live status badge */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-cream-50 border border-cream-200 text-xs text-espresso-900 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ETA: {estimatedTime}</span>
          </div>
        </div>
      </div>

      {/* Visual Kitchen / Brew Steps Progression */}
      <div className="relative py-6">
        {/* Track Line */}
        <div className="absolute left-6 right-6 top-11 h-1.5 bg-cream-200 rounded-full z-0" />
        <div
          className="absolute left-6 top-11 h-1.5 bg-gradient-to-r from-terracotta-500 via-caramel-500 to-emerald-500 rounded-full transition-all duration-700 z-0"
          style={{
            width: `${Math.max(0, (currentIndex / (STEPS.length - 1)) * 100)}%`,
          }}
        />

        <div className="relative z-10 grid grid-cols-5 gap-2 text-center">
          {STEPS.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step.key} className="flex flex-col items-center group">
                {/* Step Circle with micro-interactions */}
                <div className="relative">
                  {/* Steam effect on preparing state */}
                  {isCurrent && step.key === 'preparing' && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none">
                      <SteamEffect size="sm" opacity={0.8} />
                    </div>
                  )}

                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-sm ${
                      isCompleted
                        ? 'bg-espresso-900 text-white shadow-warm'
                        : 'bg-white text-coffee-400 border-2 border-cream-200'
                    } ${
                      isCurrent
                        ? 'ring-4 ring-terracotta-500/25 scale-110 bg-terracotta-600 text-white shadow-glow-terra'
                        : ''
                    }`}
                  >
                    {step.icon}
                  </div>
                </div>

                {/* Step Label */}
                <span
                  className={`text-xs font-bold mt-3 leading-tight transition-colors line-clamp-1 ${
                    isCurrent
                      ? 'text-terracotta-600'
                      : isCompleted
                      ? 'text-espresso-950'
                      : 'text-coffee-400'
                  }`}
                >
                  {step.title}
                </span>

                {/* Micro story snippet (desktop only) */}
                <p className="hidden md:block text-[10px] text-coffee-500 mt-1 max-w-[110px] leading-snug">
                  {step.story}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
