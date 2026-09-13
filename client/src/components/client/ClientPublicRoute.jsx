import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { useCounselorAuth } from '../../contexts/CounselorAuthContext';
import PageLoader from '../common/PageLoader';

const ClientPublicRoute = ({ children }) => {
  const { client, clientLoading } = useClientAuth();
  const { counselor, counselorLoading } = useCounselorAuth();
  const location = useLocation();

  if (clientLoading || counselorLoading) {
    return <PageLoader />;
  }

  if (client) {
    const from = location.state?.from?.pathname || '/client/dashboard';
    return <Navigate to={from} replace />;
  }

  if (counselor) {
    const from = location.state?.redirectTo || '/counselor/dashboard';
    return <Navigate to={from} replace />;
  }

  return children;
};

export default ClientPublicRoute;
