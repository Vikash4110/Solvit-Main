import { Navigate } from 'react-router-dom';
import { useClientAuth } from '../../contexts/ClientAuthContext';

const ProtectedRoute = ({ children }) => {
  const { client, clientLoading } = useClientAuth();

  if (clientLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!client) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
