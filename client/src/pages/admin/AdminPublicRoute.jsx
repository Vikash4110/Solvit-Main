import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import PageLoader from '../../components/common/PageLoader';

const AdminPublicRoute = ({ children }) => {
  const { admin, adminLoading } = useAdminAuth();

  if (adminLoading) {
    return <PageLoader />;
  }

  if (admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default AdminPublicRoute;
