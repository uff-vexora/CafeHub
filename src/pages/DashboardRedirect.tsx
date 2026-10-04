import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const DashboardRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading, getRedirectPathForRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login?redirect=/dashboard" replace />;
  }

  return <Navigate to={getRedirectPathForRole(user.role)} replace />;
};
