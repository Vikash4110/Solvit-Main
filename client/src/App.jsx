import React, { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Navigate, Route, Routes } from 'react-router-dom';

// Core layout, shell, providers & route guards (statically loaded for immediate bootstrap)
import Navbar from './components/Home/Navbar';
import ScrollToTop from './components/general/ScrollToTop';
import ProtectedRoute from './components/client/ClientProtectedRoute';
import CounselorProtectedRoute from './components/counselor/CounselorProtectedRoute';
import AdminProtectedRoute from './pages/admin/AdminProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import PageLoader from './components/common/PageLoader';

import { ClientAuthProvider } from './contexts/ClientAuthContext';
import { CounselorAuthProvider } from './contexts/CounselorAuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';

// PUBLIC & GENERAL PAGES (Lazy Loaded)
const Home = lazy(() => import('./pages/general/Home'));
const About = lazy(() => import('./pages/general/About'));
const ContactUs = lazy(() => import('./pages/general/ContactUs'));
const Blogs = lazy(() => import('./pages/general/Blogs'));
const ServicePage = lazy(() => import('./pages/general/ServicePage'));
const PrivacyPolicy = lazy(() => import('./components/Legals/PrivacyPolicy'));
const TermCondition = lazy(() => import('./components/Legals/TermCondition'));

// CLIENT PAGES (Lazy Loaded)
const Login = lazy(() => import('./pages/client/ClientLogin'));
const Register = lazy(() => import('./pages/client/ClientRegister'));
const ClientForgotPassword = lazy(() => import('./components/client/clientLoginRegister/ClientForgotPassword'));
const ClientResetPassword = lazy(() => import('./components/client/clientLoginRegister/ClientResetPassword'));
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'));
const ClientDashboardDisputeForm = lazy(() => import('./components/client/ClientDashboard/ClientDashboardDisputeForm'));
const BrowseCounselor = lazy(() => import('./pages/client/browseCounselor'));
const BookCounselorCalendar = lazy(() => import('./pages/client/bookCounselor'));

// COUNSELOR PAGES (Lazy Loaded)
const CounselorLogin = lazy(() => import('./pages/counselor/CounselorLogin'));
const CounselorRegister = lazy(() => import('./pages/counselor/CounselorRegister'));
const CounselorForgotPassword = lazy(() => import('./components/counselor/counselorLoginRegister/CounselorForgotPassword'));
const CounselorResetPassword = lazy(() => import('./components/counselor/counselorLoginRegister/CounselorResetPassword'));
const CounselorDashboard = lazy(() => import('./pages/counselor/CounselorDashboard'));
const CounselorApplication = lazy(() => import('./pages/counselor/CounselorApplication'));
const ApplicationStatus = lazy(() => import('./pages/counselor/CounselorApplicationStatus'));
const BlogPost = lazy(() => import('./pages/counselor/BlogPost'));

// HEAVY WEBRTC VIDEO CALL (Lazy Loaded)
const VideoCallInterface = lazy(() => import('./videoCall/VideoCallInterface'));

// ADMIN PAGES (Lazy Loaded)
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ApplicationDetail = lazy(() => import('./pages/admin/ApplicationDetail'));
const ApplicationsPage = lazy(() => import('./components/admin/ApplicationsPage'));
const AdminDisputeManagement = lazy(() => import('./components/admin/AdminDisputeManagement'));
const AdminClientsManagement = lazy(() => import('./components/admin/AdminClientsManagement'));
const AdminCounselorsManagement = lazy(() => import('./components/admin/AdminCounselorsManagement'));
const AdminPaymentsManagement = lazy(() => import('./components/admin/AdminPaymentsManagement'));
const AdminBookingsManagement = lazy(() => import('./components/admin/AdminBookingsManagement'));

function App() {
  return (
    <ClientAuthProvider>
      <CounselorAuthProvider>
        <AdminAuthProvider>
          <div className="min-h-screen bg-gray-100">
            <Navbar />
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<ContactUs />} />

                {/* BLOG ROUTES */}
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/blogs/:slug" element={<BlogPost />} />

                {/* CLIENT AUTHENTICATION ROUTES */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ClientForgotPassword />} />
                <Route path="/reset-password" element={<ClientResetPassword />} />

                {/* VIDEO CALL ROUTES */}
                <Route path="/meeting/:bookingId/:meetingId" element={<VideoCallInterface />} />

                {/* CLIENT PROTECTED ROUTES */}
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
                <Route path="/browse-counselors" element={<BrowseCounselor />} />
                <Route path="/book-counselor/:counselorId" element={<BookCounselorCalendar />} />

                {/* COUNSELOR AUTHENTICATION ROUTES */}
                <Route path="/counselor/login" element={<CounselorLogin />} />
                <Route path="/counselor/register" element={<CounselorRegister />} />
                <Route path="/counselor/forgot-password" element={<CounselorForgotPassword />} />
                <Route path="/counselor/reset-password" element={<CounselorResetPassword />} />

                {/* COUNSELOR PROTECTED ROUTES */}
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

                {/* SERVICE ROUTES */}
                <Route path="/services/:serviceId" element={<ServicePage />} />

                {/* LEGAL ROUTES */}
                <Route path="/term-condition" element={<TermCondition />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                {/* ADMIN ROUTES */}
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
                  <Route path="bookings" element={<AdminBookingsManagement />} />
                </Route>

                {/* 404 FALLBACK */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>

            <Toaster position="top-right" closeButton richColors expand={false} duration={4000} />
          </div>
        </AdminAuthProvider>
      </CounselorAuthProvider>
    </ClientAuthProvider>
  );
}

export default App;
