import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSeller?: boolean;
}

export function ProtectedRoute({ children, requireSeller = false }: ProtectedRouteProps) {
  const { user, isSeller, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#058c42]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/seller-auth" replace />;
  }

  if (requireSeller && !isSeller) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}