// File: src/App.js
import { Toaster } from '@/components/ui/sonner';
import { Navigate, Route, Routes } from 'react-router-dom';
import CounselorProtectedRoute from './components/counselor/CounselorProtectedRoute';
import Navbar from './components/Home/Navbar';
import PrivacyPolicy from './components/Legals/PrivacyPolicy';
import TermCondition from './components/Legals/TermCondition';
import ProtectedRoute from './components/client/ClientProtectedRoute';
import ClientForgotPassword from './components/client/clientLoginRegister/ClientForgotPassword';
import ClientResetPassword from './components/client/clientLoginRegister/ClientResetPassword';
import CounselorForgotPassword from './components/counselor/counselorLoginRegister/CounselorForgotPassword';
import CounselorResetPassword from './components/counselor/counselorLoginRegister/CounselorResetPassword';
import ScrollToTop from './components/general/ScrollToTop';
import { ClientAuthProvider } from './contexts/ClientAuthContext';
import { CounselorAuthProvider } from './contexts/CounselorAuthContext';

// Existing Pages
import About from './pages/general/About';
import CounselorApplication from './pages/counselor/CounselorApplication';
import CounselorDashboard from './pages/counselor/CounselorDashboard';
import CounselorLogin from './pages/counselor/CounselorLogin';
import CounselorRegister from './pages/counselor/CounselorRegister';

import Home from './pages/general/Home';
import Login from './pages/client/ClientLogin';
// import Profile from './pages/Profile';
import Register from './pages/client/ClientRegister';
import ServicePage from './pages/general/ServicePage';
import ClientDashboard from './pages/client/ClientDashboard';
import BookCounselorCalendar from './pages/client/bookCounselor';
import BrowseCounselor from './pages/client/browseCounselor';
import Blogs from './pages/general/Blogs';
import ContactUs from './pages/general/ContactUs';
import BlogPost from './pages/counselor/BlogPost';

import VideoCallInterface from './videoCall/VideoCallInterface';
// import SessionSuccess from './components/SessionSuccess';

function App() {
  return (
    <ClientAuthProvider>
      <CounselorAuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <ScrollToTop />
          <Routes>
            {/* 🌍 PUBLIC ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactUs />} />

            {/* ✅ BLOG ROUTES - Public Access (No authentication required for viewing) */}
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<BlogPost />} />

            {/* 🔐 CLIENT AUTHENTICATION ROUTES */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ClientForgotPassword />} />
            <Route path="/reset-password" element={<ClientResetPassword />} />

            {/* ✅ VIDEO CALL ROUTES - Main implementation */}
            <Route path="/meeting/:bookingId/:meetingId" element={<VideoCallInterface />} />

            {/* Session Analytics Route */}
            {/* <Route 
              path="/session/:sessionId/analytics" 
              element={
                <ProtectedRoute allowedRoles={['client', 'counselor']}>
                  <SessionAnalytics />
                </ProtectedRoute>
              } 
            /> */}

            {/* Session Recordings Route */}
            {/* <Route 
              path="/session/:sessionId/recordings" 
              element={
                <ProtectedRoute allowedRoles={['client', 'counselor']}>
                  <SessionRecordings />
                </ProtectedRoute>
              } 
            />
           */}
            {/* <Route
              path="/session-success/:bookingId"
              element={
                <ProtectedRoute>
                  <SessionSuccess />
                </ProtectedRoute>
              }
            /> */}

            {/* 👤 CLIENT PROTECTED ROUTES */}
            <Route
              path="/client/dashboard/*"
              element={
                <ProtectedRoute>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />

            {/* <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            /> */}
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

            {/* 👩‍⚕️ COUNSELOR AUTHENTICATION ROUTES */}
            <Route path="/counselor/login" element={<CounselorLogin />} />
            <Route path="/counselor/register" element={<CounselorRegister />} />
            <Route path="/counselor/forgot-password" element={<CounselorForgotPassword />} />
            <Route path="/counselor/reset-password" element={<CounselorResetPassword />} />

            {/* 👩‍⚕️ COUNSELOR PROTECTED ROUTES */}
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

            {/* 🏥 SERVICE ROUTES */}
            <Route path="/services/:serviceId" element={<ServicePage />} />

            {/* 📋 LEGAL ROUTES */}
            <Route path="/term-condition" element={<TermCondition />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            {/* ❌ 404 FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* 🔥 TOAST NOTIFICATIONS */}
          <Toaster 
          position="top-right"
          closeButton
          richColors
          expand={false}
          duration={4000}
        />
        </div>
      </CounselorAuthProvider>
    </ClientAuthProvider>
  );
}

export default App;
