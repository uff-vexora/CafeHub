import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FlyToCartContainer } from '../cafe-world/FlyToCartProxy';

interface CustomerLayoutProps {
  selectedCity?: string;
  onSelectCity?: (city: string) => void;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({
  selectedCity = 'All Cities',
  onSelectCity,
}) => {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col font-sans selection:bg-terracotta-100 selection:text-terracotta-900 texture-paper">
      <Navbar selectedCity={selectedCity} onSelectCity={onSelectCity} />
      
      {/* Decorative Add to Cart Fly Animation Container */}
      <FlyToCartContainer />

      {/* Main Customer Content */}
      <main className="flex-1 pb-20 lg:pb-8">
        <Outlet />
      </main>

      {/* Customer Footer */}
      <Footer />
    </div>
  );
};
