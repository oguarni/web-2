import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    // You might want to render a spinner or loading indicator here
    return <div>Loading...</div>;
  }

  // If the user is authenticated and is an admin, render the nested routes.
  // Otherwise, redirect them to a different page.
  return isAuthenticated && isAdmin() ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;