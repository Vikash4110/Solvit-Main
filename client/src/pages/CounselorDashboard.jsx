// File: src/pages/CounselorDashboard.js
import { Link } from "react-router-dom";
import { useCounselorAuth } from "../contexts/CounselorAuthContext";

const CounselorDashboard = () => {
  const { counselor, logout } = useCounselorAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Welcome, {counselor?.fullName}
          </h2>
          <button
            onClick={logout}
            className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
        {counselor?.applicationStatus === "pending" ? (
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">
              Application Status
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Your application is pending review. We'll notify you within 24-48
              hours.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">
              Complete Your Application
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Please complete your counselor application to start offering
              services.
            </p>
            <Link
              to="/counselor/application"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Complete Application
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounselorDashboard;
