// import { useNavigate } from 'react-router-dom';
// import { useCounselorAuth } from '../../contexts/CounselorAuthContext';

// const ApplicationStatus = () => {
//   const { counselor } = useCounselorAuth();
//   const navigate = useNavigate();

//   if (!counselor || counselor.applicationStatus !== 'pending') {
//     return <Navigate to="/counselor/application" replace />;
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8 text-center">
//         <h2 className="mt-6 text-2xl font-extrabold text-gray-900">Application Submitted</h2>
//         <p className="mt-2 text-sm text-gray-600">
//           Your application has been submitted successfully. We will review it and get back to you
//           within 24-48 hours.
//         </p>
//         <button
//           onClick={() => navigate('/counselor/login')}
//           className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//         >
//           Back to Login
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ApplicationStatus;

// In ApplicationStatus.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCounselorAuth } from '../../contexts/CounselorAuthContext';

const ApplicationStatus = () => {
  const { counselor } = useCounselorAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on application status
    if (!counselor) {
      navigate('/counselor/login');
    } else if (counselor.applicationStatus === 'approved') {
      navigate('/counselor/dashboard');
    } else if (!counselor.applicationStatus || counselor.applicationStatus === 'not_submitted') {
      navigate('/counselor/application');
    }
    // Stay on this page if status is 'pending' or 'rejected'
  }, [counselor, navigate]);

  if (
    !counselor ||
    counselor.applicationStatus === 'approved' ||
    counselor.applicationStatus === 'not_submitted'
  ) {
    return null; // Will redirect in useEffect
  }

  const getStatusContent = () => {
    switch (counselor.applicationStatus) {
      case 'pending':
        return {
          title: 'Application Under Review',
          message:
            'Your application has been submitted successfully and is currently under review. We will notify you via email once your application has been processed. This usually takes 24-48 hours.',
          icon: '⏳',
          color: 'yellow',
        };
      case 'rejected':
        return {
          title: 'Application Rejected',
          message:
            "We're sorry, but your application has been rejected. Please contact support for more information.",
          icon: '❌',
          color: 'red',
        };
      default:
        return {
          title: 'Application Status',
          message: 'Your application status is being processed.',
          icon: 'ℹ️',
          color: 'blue',
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div
          className={`bg-white p-8 rounded-lg shadow-md border-l-4 border-${statusContent.color}-500`}
        >
          <div className="text-4xl mb-4">{statusContent.icon}</div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">{statusContent.title}</h2>
          <p className="text-gray-600 mb-6">{statusContent.message}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/counselor/login')}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Login
            </button>
            {counselor.applicationStatus === 'rejected' && (
              <button
                onClick={() => (window.location.href = 'mailto:support@example.com')}
                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;
