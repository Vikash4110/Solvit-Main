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

  // If application is not submitted, redirect to application
  if (!counselor.application.applicationStatus || counselor.application.applicationStatus === 'not_submitted') {
    return <Navigate to="/counselor/application" replace />;
  }

  // If application is pending, redirect to status page
  if (counselor.application.applicationStatus === 'pending') {
    return <Navigate to="/counselor/application-status" replace />;
  }

  // If application is rejected, show rejection message
  if (counselor.application.applicationStatus === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Application Rejected</h2>
            <p className="text-red-600 mb-4">
              We're sorry, but your application has been rejected. Please contact support for more
              information.
            </p>
            <button
              onClick={() => (window.location.href = '/contact')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Only allow access if application is approved
  return children;
};

export default CounselorProtectedRoute;
