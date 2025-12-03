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
import About from './pages/general/About';
import CounselorApplication from './pages/counselor/CounselorApplication';
import CounselorDashboard from './pages/counselor/CounselorDashboard';
import CounselorLogin from './pages/counselor/CounselorLogin';
import CounselorRegister from './pages/counselor/CounselorRegister';
import ApplicationStatus from './pages/counselor/CounselorApplicationStatus';
import Home from './pages/general/Home';
import Login from './pages/client/ClientLogin';
import Register from './pages/client/ClientRegister';
import ServicePage from './pages/general/ServicePage';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientDashboardDisputeForm from './components/client/ClientDashboard/ClientDashboardDisputeForm';
import BookCounselorCalendar from './pages/client/bookCounselor';
import BrowseCounselor from './pages/client/browseCounselor';
import Blogs from './pages/general/Blogs';
import ContactUs from './pages/general/ContactUs';
import BlogPost from './pages/counselor/BlogPost';
import VideoCallInterface from './videoCall/VideoCallInterface';

import AdminProtectedRoute from './pages/admin/AdminProtectedRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ApplicationDetail from './pages/admin/ApplicationDetail';
import AdminDisputeManagement from './components/admin/AdminDisputeManagement';
import AdminLayout from './components/admin/AdminLayout';
import ApplicationsPage from './components/admin/ApplicationsPage';
import AdminClientsManagement from './components/admin/AdminClientsManagement';
import AdminCounselorsManagement from './components/admin/AdminCounselorsManagement';
import AdminPaymentsManagement from './components/admin/AdminPaymentsManagement';

import { AdminAuthProvider } from './contexts/AdminAuthContext';

function App() {
  return (
    <ClientAuthProvider>
      <CounselorAuthProvider>
        <AdminAuthProvider>
          <div className="min-h-screen bg-gray-100">
            <Navbar />
            <ScrollToTop />
            <Routes>
              {/* 🌍 PUBLIC ROUTES */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<ContactUs />} />

              {/* ✅ BLOG ROUTES */}
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blogs/:slug" element={<BlogPost />} />

              {/* 🔐 CLIENT AUTHENTICATION ROUTES */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ClientForgotPassword />} />
              <Route path="/reset-password" element={<ClientResetPassword />} />

              {/* ✅ VIDEO CALL ROUTES */}
              <Route path="/meeting/:bookingId/:meetingId" element={<VideoCallInterface />} />

              {/* 👤 CLIENT PROTECTED ROUTES */}
              <Route
                path="/client/dashboard/*"
                element={
                  <ProtectedRoute>
                    <ClientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/dashboard/bookings/raiseIssue/:bookingId"
                element={
                  <ProtectedRoute>
                    <ClientDashboardDisputeForm />
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

              {/* 👩‍⚕️ COUNSELOR AUTHENTICATION ROUTES */}
              <Route path="/counselor/login" element={<CounselorLogin />} />
              <Route path="/counselor/register" element={<CounselorRegister />} />
              <Route path="/counselor/forgot-password" element={<CounselorForgotPassword />} />
              <Route path="/counselor/reset-password" element={<CounselorResetPassword />} />

              {/* 👩‍⚕️ COUNSELOR PROTECTED ROUTES */}
              <Route
                path="/counselor/dashboard/*"
                element={
                  <CounselorProtectedRoute>
                    <CounselorDashboard />
                  </CounselorProtectedRoute>
                }
              />
              <Route path="/counselor/application" element={<CounselorApplication />} />
              <Route path="/counselor/application-status" element={<ApplicationStatus />} />

              {/* 🏥 SERVICE ROUTES */}
              <Route path="/services/:serviceId" element={<ServicePage />} />

              {/* 📋 LEGAL ROUTES */}
              <Route path="/term-condition" element={<TermCondition />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />

              {/* 👨‍💼 ADMIN ROUTES */}
              <Route path="/admin/login" element={<AdminLogin />} />
              {/* Admin Routes (With sidebar) */}
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="disputes" element={<AdminDisputeManagement />} />
                <Route path="applications" element={<ApplicationsPage />} />
                <Route path="application/:counselorId" element={<ApplicationDetail />} />
                <Route path="clients" element={<AdminClientsManagement />} />
                <Route path="counselors" element={<AdminCounselorsManagement />} />
                <Route path="payments" element={<AdminPaymentsManagement />} />

                {/* <Route path="counselors" element={<CounselorsPage />} />
                <Route path="sessions" element={<SessionsPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="payouts" element={<PayoutsPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="security" element={<SecurityPage />} />
                <Route path="analytics" element={<AnalyticsPage />} /> */}
              </Route>

              {/* ❌ 404 FALLBACK */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <Toaster position="top-right" closeButton richColors expand={false} duration={4000} />
          </div>
        </AdminAuthProvider>
      </CounselorAuthProvider>
    </ClientAuthProvider>
  );
}

export default App;
