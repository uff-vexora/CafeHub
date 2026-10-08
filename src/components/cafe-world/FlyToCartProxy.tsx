import React, { useEffect, useState } from 'react';

interface FlyProxyItem {
  id: string;
  startX: number;
  startY: number;
  imageUrl?: string;
}

export const triggerFlyToCart = (startX: number, startY: number, imageUrl?: string) => {
  const event = new CustomEvent('cafehub-fly-to-cart', {
    detail: {
      id: Math.random().toString(36).substring(2, 9),
      startX,
      startY,
      imageUrl,
    },
  });
  window.dispatchEvent(event);
};

export const FlyToCartContainer: React.FC = () => {
  const [activeItems, setActiveItems] = useState<FlyProxyItem[]>([]);

  useEffect(() => {
    const handleFly = (e: Event) => {
      const customEvent = e as CustomEvent<FlyProxyItem>;
      if (!customEvent.detail) return;

      const item = customEvent.detail;
      setActiveItems((prev) => [...prev, item]);

      // Remove after 750ms animation finishes
      setTimeout(() => {
        setActiveItems((prev) => prev.filter((i) => i.id !== item.id));
      }, 750);
    };

    window.addEventListener('cafehub-fly-to-cart', handleFly);
    return () => window.removeEventListener('cafehub-fly-to-cart', handleFly);
  }, []);

  if (activeItems.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
    >
      {activeItems.map((item) => (
        <FlyProxyElement key={item.id} item={item} />
      ))}
    </div>
  );
};

const FlyProxyElement: React.FC<{ item: FlyProxyItem }> = ({ item }) => {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Next frame trigger transition
    const req = requestAnimationFrame(() => {
      setAnimating(true);
    });
    return () => cancelAnimationFrame(req);
  }, []);

  // Target coordinates: standard position of cart icon in header (top right of viewport)
  // Usually around top: 28px, right: 90px
  const targetX = window.innerWidth - 100;
  const targetY = 32;

  const currentX = animating ? targetX : item.startX;
  const currentY = animating ? targetY : item.startY;
  const scale = animating ? 0.25 : 1;
  const opacity = animating ? 0.2 : 0.95;

  return (
    <div
      className="absolute top-0 left-0 transition-all duration-700 pointer-events-none"
      style={{
        transform: `translate3d(${currentX}px, ${currentY}px, 0) scale(${scale})`,
        opacity,
        transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        willChange: 'transform, opacity',
      }}
    >
      <div className="w-12 h-12 -ml-6 -mt-6 rounded-2xl overflow-hidden border-2 border-white shadow-warm-lg bg-terracotta-500 flex items-center justify-center">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-4 h-4 rounded-full bg-caramel-300" />
        )}
      </div>
    </div>
  );
};
