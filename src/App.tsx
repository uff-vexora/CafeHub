import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { CartProvider } from './context/CartContext';

// Layouts
import { CustomerLayout } from './components/layout/CustomerLayout';
import { OwnerLayout } from './components/layout/OwnerLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public & Auth Pages
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

// Customer Pages
import { CustomerDashboard } from './pages/CustomerDashboard';
import { DiscoveryPage } from './pages/DiscoveryPage';
import { CafeDetailPage } from './pages/CafeDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { AccountPage } from './pages/AccountPage';

// Owner & Admin Dashboards
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import { OwnerOnboardingPage } from './pages/owner/OwnerOnboardingPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserRole } from './types';

// Root Intelligent Redirector: STRICT LOGIN FIRST
// Logged-out visitor -> /login
// Customer -> /dashboard
// Cafe Owner -> /owner
// Admin -> /admin
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading, getRedirectPathForRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getRedirectPathForRole(user.role)} replace />;
};

// Strict Protected Route Wrapper
const ProtectedRoute: React.FC<{
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta-600"></div>
      </div>
    );
  }

  // 1. Unauthenticated users -> Redirect immediately to /login with preserved redirect target
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

  return children ? <>{children}</> : <Outlet />;
};

const AppContent: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState('All Cities');

  return (
    <Routes>
      {/* Root Entrypoint: Strict Login-First */}
      <Route path="/" element={<RootRedirect />} />

      {/* Strictly Public Authentication & Error Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ============================================================== */}
      {/* 1. CUSTOMER APPLICATION EXPERIENCE                             */}
      {/* Strictly scoped to 'customer' role. Zero Owner/Admin leakage. */}
      {/* ============================================================== */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerLayout selectedCity={selectedCity} onSelectCity={setSelectedCity} />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/cafes" element={<DiscoveryPage />} />
        <Route path="/cafes/:id" element={<CafeDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>

      {/* ============================================================== */}
      {/* 2. CAFE OWNER APPLICATION EXPERIENCE                           */}
      {/* Strictly scoped to 'cafe_owner' role. Zero Customer cart.     */}
      {/* ============================================================== */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['cafe_owner']}>
            <OwnerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/owner" element={<OwnerDashboard defaultTab="overview" />} />
        <Route path="/owner/onboarding" element={<OwnerOnboardingPage />} />
        <Route path="/owner/orders" element={<OwnerDashboard defaultTab="orders" />} />
        <Route path="/owner/reservations" element={<OwnerDashboard defaultTab="reservations" />} />
        <Route path="/owner/menu" element={<OwnerDashboard defaultTab="menu" />} />
        <Route path="/owner/profile" element={<OwnerDashboard defaultTab="cafe" />} />
        <Route path="/owner/reviews" element={<OwnerDashboard defaultTab="reviews" />} />
        <Route path="/owner/analytics" element={<OwnerDashboard defaultTab="analytics" />} />
        <Route path="/owner/settings" element={<OwnerDashboard defaultTab="settings" />} />
      </Route>

      {/* ============================================================== */}
      {/* 3. PLATFORM ADMIN APPLICATION EXPERIENCE                       */}
      {/* Strictly scoped to 'admin' role. Zero Consumer UI.             */}
      {/* ============================================================== */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard defaultTab="metrics" />} />
        <Route path="/admin/cafes" element={<AdminDashboard defaultTab="cafes" />} />
        <Route path="/admin/users" element={<AdminDashboard defaultTab="users" />} />
        <Route path="/admin/orders" element={<AdminDashboard defaultTab="orders" />} />
        <Route path="/admin/reservations" element={<AdminDashboard defaultTab="reservations" />} />
        <Route path="/admin/reviews" element={<AdminDashboard defaultTab="reviews" />} />
        <Route path="/admin/reports" element={<AdminDashboard defaultTab="reports" />} />
        <Route path="/admin/settings" element={<AdminDashboard defaultTab="settings" />} />
      </Route>

      {/* Catch-all route -> Root intelligent redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
