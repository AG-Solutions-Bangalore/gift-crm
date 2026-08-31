import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export default function AuthRoute() {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}
