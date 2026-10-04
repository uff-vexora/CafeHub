import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/modals/AuthModal';

// Pages
import { HomePage } from './pages/HomePage';
import { DiscoveryPage } from './pages/DiscoveryPage';
import { CafeDetailPage } from './pages/CafeDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { AccountPage } from './pages/AccountPage';
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: ('customer' | 'cafe_owner' | 'admin')[];
  onOpenAuth: (mode: 'login' | 'signup') => void;
}> = ({ children, allowedRoles, onOpenAuth }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    onOpenAuth('login');
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-cream-200 text-center space-y-4 shadow-warm">
        <h3 className="font-serif font-bold text-xl text-espresso-950">Access Restricted</h3>
        <p className="text-xs text-coffee-600">
          This dashboard requires <strong>{allowedRoles.join(' or ')}</strong> privileges. Your current role is <strong>{user.role}</strong>.
        </p>
        <p className="text-xs text-coffee-500">
          Tip: Use the demo role switcher at the top of the page to switch roles instantly.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [selectedCity, setSelectedCity] = useState('All Cities');

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#1E140D]">
      <Navbar
        onOpenAuthModal={handleOpenAuth}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cafes" element={<DiscoveryPage />} />
          <Route path="/cafes/:id" element={<CafeDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute onOpenAuth={handleOpenAuth}>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner"
            element={
              <ProtectedRoute allowedRoles={['cafe_owner', 'admin']} onOpenAuth={handleOpenAuth}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']} onOpenAuth={handleOpenAuth}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
