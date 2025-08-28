
// ✅ JobPortalProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const JobPortalProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('jobToken');
  return token ? children : <Navigate to="/jobportal/login" replace />;
};

export default JobPortalProtectedRoute;
