import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Leaf } from 'lucide-react';

export const Protected = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <Leaf className="w-7 h-7 text-emerald-600 animate-pulse" />
        <div className="text-sm text-neutral-500 mt-2">Loading…</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};
