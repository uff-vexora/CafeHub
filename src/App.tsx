import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { DashboardRedirect } from './pages/DashboardRedirect';
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserRole } from './types';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta-600"></div>
      </div>
    );
  }

  // 1. Unauthenticated users -> Redirect to /login with redirect query param
  if (!isAuthenticated || !user) {
    const redirectUrl = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;
    return <Navigate to={redirectUrl} replace />;
  }

  // 2. Role authorization check -> Render 403 Forbidden UnauthorizedPage
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <UnauthorizedPage
        requiredRole={allowedRoles.join(' or ')}
        attemptedPath={location.pathname}
      />
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
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/cafes" element={<DiscoveryPage />} />
          <Route path="/cafes/:id" element={<CafeDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Intelligent Dashboard Router */}
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* Protected Routes: Require Authentication */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['customer', 'cafe_owner', 'admin']}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute allowedRoles={['customer', 'cafe_owner', 'admin']}>
                <ReservationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute allowedRoles={['customer', 'cafe_owner', 'admin']}>
                <AccountPage />
              </ProtectedRoute>
            }
          />

          {/* Role-Restricted: Cafe Owner & Admin only */}
          <Route
            path="/owner/*"
            element={
              <ProtectedRoute allowedRoles={['cafe_owner', 'admin']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner"
            element={
              <ProtectedRoute allowedRoles={['cafe_owner', 'admin']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Role-Restricted: Super Admin ONLY */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
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
