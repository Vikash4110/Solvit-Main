import { Navigate } from 'react-router-dom';
import { useCounselorAuth } from '../../contexts/CounselorAuthContext';

const CounselorProtectedRoute = ({ children }) => {
  const { counselor, counselorLoading } = useCounselorAuth();

  if (counselorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!counselor) {
    return <Navigate to="/counselor/login" replace />;
  }

  const applicationStatus = counselor.applicationStatus || counselor.application?.applicationStatus || 'not_submitted';

  // If application is not submitted, redirect to application
  if (applicationStatus === 'not_submitted') {
    return <Navigate to="/counselor/application" replace />;
  }

  // If application is pending or rejected, redirect to status page
  if (applicationStatus === 'pending' || applicationStatus === 'rejected') {
    return <Navigate to="/counselor/application-status" replace />;
  }

  // Only allow access if application is approved
  return children;
};

export default CounselorProtectedRoute;
