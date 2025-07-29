// File: src/App.js
import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";
import CounselorProtectedRoute from "./components/CounselorProtectedRoute";
import Navbar from "./components/Home/Navbar";

import TermCondition from "./components/Legals/TermCondition";
import PrivacyPolicy from "./components/Legals/PrivacyPolicy";

import ProtectedRoute from "./components/ProtectedRoute";

import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import { CounselorAuthProvider } from "./contexts/CounselorAuthContext";
import About from "./pages/About";
import CounselorApplication from "./pages/CounselorApplication";
import CounselorDashboard from "./pages/CounselorDashboard";
import CounselorLogin from "./pages/CounselorLogin";
import CounselorRegister from "./pages/CounselorRegister";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import ServicePage from "./pages/ServicePage";

import BrowseCounselor from "./pages/browseCounselor";
import BookCounselorCalendar from "./pages/bookCounselor";
function App() {
  return (
    <AuthProvider>
      <CounselorAuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <ScrollToTop />
          <Routes>
            {/* Client Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
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
            <Route
              path="/browse-counselors"
              element={
                <ProtectedRoute>
                  <BrowseCounselor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book-counselor/:counselorId"
              element={
                <ProtectedRoute>
                  <BookCounselorCalendar />
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
            <Route path="/services/:serviceId" element={<ServicePage />} />

            <Route path="/term-condition" element={<TermCondition />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

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
