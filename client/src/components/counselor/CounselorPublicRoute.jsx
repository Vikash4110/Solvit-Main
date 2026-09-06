import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCounselorAuth } from '../../contexts/CounselorAuthContext';
import PageLoader from '../common/PageLoader';

const CounselorPublicRoute = ({ children }) => {
  const { counselor, counselorLoading } = useCounselorAuth();

  if (counselorLoading) {
    return <PageLoader />;
  }

  if (counselor) {
    if (!counselor.application?.applicationStatus || counselor.application.applicationStatus === 'not_submitted') {
      return <Navigate to="/counselor/application" replace />;
    }
    if (counselor.application.applicationStatus === 'pending') {
      return <Navigate to="/counselor/application-status" replace />;
    }
    return <Navigate to="/counselor/dashboard" replace />;
  }

  return children;
};

export default CounselorPublicRoute;
