import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, LogOut, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';

interface UnauthorizedPageProps {
  requiredRole?: string;
  attemptedPath?: string;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({
  requiredRole,
  attemptedPath,
}) => {
  const { user, logout, getRedirectPathForRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = attemptedPath || location.pathname;
  const userRole = user?.role || 'unauthenticated';
  const roleName =
    userRole === 'admin'
      ? 'Platform Admin'
      : userRole === 'cafe_owner'
      ? 'Cafe Owner'
      : userRole === 'customer'
      ? 'Customer'
      : 'Visitor';

  const userDashboard = user ? getRedirectPathForRole(user.role) : '/login';

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-rose-200/80 shadow-warm-xl text-center space-y-6">
        {/* Security Shield Icon */}
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold uppercase tracking-wider">
            <Lock className="w-3 h-3" /> 403 Forbidden
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-espresso-950">
            Access Restricted
          </h2>
          <p className="text-xs text-coffee-600 leading-relaxed">
            You do not have the authorization required to view or modify resources at{' '}
            <code className="px-1.5 py-0.5 bg-cream-100 text-espresso-900 rounded font-mono font-semibold">
              {currentPath}
            </code>
          </p>
        </div>

        {/* User Role Context Card */}
        <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 text-left space-y-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-coffee-400">
            Current Session Details
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-coffee-600">Logged in as:</span>
            <span className="font-bold text-espresso-900 truncate max-w-[180px]">
              {user?.full_name || 'Anonymous'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-coffee-600">Your Current Role:</span>
            <Badge
              variant={
                userRole === 'admin'
                  ? 'danger'
                  : userRole === 'cafe_owner'
                  ? 'warning'
                  : 'primary'
              }
              size="sm"
            >
              {roleName}
            </Badge>
          </div>
          {requiredRole && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-cream-200">
              <span className="text-rose-600 font-semibold">Required Role:</span>
              <span className="font-bold text-rose-700 capitalize">{requiredRole}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => navigate(userDashboard, { replace: true })}
            className="w-full py-3 bg-espresso-900 hover:bg-espresso-800 text-white font-bold text-xs rounded-xl shadow-warm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>Go to My Allowed Dashboard</span>
          </button>

          <button
            onClick={() => {
              logout();
              navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
            }}
            className="w-full py-2.5 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Switch or Sign In with Different Account</span>
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full py-2 text-coffee-500 hover:text-espresso-900 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};
