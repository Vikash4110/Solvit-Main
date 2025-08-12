// File: src/components/CounselorProtectedRoute.js
import { Navigate } from "react-router-dom";
import { useCounselorAuth } from "../contexts/CounselorAuthContext";

const CounselorProtectedRoute = ({ children }) => {
  const { counselor, counselorLoading } = useCounselorAuth();

  if (counselorLoading) {
    return <div>Loading...</div>;
  }

  if (!counselor) {
    return <Navigate to="/counselor/login" replace />;
  }

  return children;
};
export default CounselorProtectedRoute;
