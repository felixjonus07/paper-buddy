import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (allowedRoles.includes('user') && user.role === 'student') {
      // Allow student to access user dashboard
    } else if (allowedRoles.includes('admin') && user.role === 'superadmin') {
      // Allow superadmin to access admin dashboard
    } else if (!allowedRoles.includes(user.role)) {
      // If they are logged in but have the wrong role, send them to their own dashboard
      if (user.role === 'admin' || user.role === 'superadmin') return <Navigate to="/admin/dashboard" replace />;
      if (user.role === 'cashier') return <Navigate to="/cashier/dashboard" replace />;
      if (user.role === 'mentor') return <Navigate to="/mentor/dashboard" replace />;
      return <Navigate to="/user/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
