import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { axiosInstance } from '../../axiosUtils';

const ProtectedRoute = ({ children, isAdmin }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get('/user', { withCredentials: true });
        setIsAuthenticated(true);
        setUser(res.data.user);
      } catch (error) {
        console.log("Auth check failed:", error.response?.data || error.message);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated === false) {
    return <Navigate to="/login" />;
  }

  if (isAdmin && !user?.isAdmin) {
    return <Navigate to="/dashboard/user" />;
  }

  return children;
};

export default ProtectedRoute;