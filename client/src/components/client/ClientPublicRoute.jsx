import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import PageLoader from '../common/PageLoader';

const ClientPublicRoute = ({ children }) => {
  const { client, clientLoading } = useClientAuth();
  const location = useLocation();

  if (clientLoading) {
    return <PageLoader />;
  }

  if (client) {
    const from = location.state?.from?.pathname || '/client/dashboard';
    return <Navigate to={from} replace />;
  }

  return children;
};

export default ClientPublicRoute;
