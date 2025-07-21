// File: src/App.js
import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";
import CounselorProtectedRoute from "./components/CounselorProtectedRoute";
import Navbar from "./components/Home/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { CounselorAuthProvider } from "./contexts/CounselorAuthContext";
import CounselorApplication from "./pages/CounselorApplication";
import CounselorDashboard from "./pages/CounselorDashboard";
import CounselorLogin from "./pages/CounselorLogin";
import CounselorRegister from "./pages/CounselorRegister";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

function App() {
  return (
    <AuthProvider>
      <CounselorAuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Client Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            {/* Counselor Routes */}
            <Route path="/counselor/login" element={<CounselorLogin />} />
            <Route path="/counselor/register" element={<CounselorRegister />} />
            <Route
              path="/counselor/dashboard"
              element={
                <CounselorProtectedRoute>
                  <CounselorDashboard />
                </CounselorProtectedRoute>
              }
            />
            <Route
              path="/counselor/application"
              element={
                <CounselorProtectedRoute>
                  <CounselorApplication />
                </CounselorProtectedRoute>
              }
            />

            {/* Redirect root to login if needed */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
        </div>
      </CounselorAuthProvider>
    </AuthProvider>
  );
}

export default App;
