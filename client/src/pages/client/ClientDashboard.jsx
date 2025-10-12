import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import ProtectedRoute from '../../client/ClientProtectedRoute.jsx';
// import ClientDashboardTopbar from '../../components/client/clientDashboard/ClientDashbardTopbar';
import ClientDashboardSidebar from '../../client/clientDashboard/ClientDashboardSidebar.jsx';

// Import only required dashboard components
import { ClientDashboardPayments } from '../../client/clientDashboard/ClientDashboardPayments.jsx';
import { ClientDashboardHelpSupport } from '../../client/clientDashboard/ClientDashboardHelpSupport.jsx';
import { ClientDashboardNotifications } from '../../client/clientDashboard/ClientDashboardNotifications.jsx';
import { ClientDashboardMyBookings } from '../../client/clientDashboard/ClientDashboardMyBookings.jsx';
import { ClientDashboardPersonalInfo } from '../../client/clientDashboard/ClientDashboardPersonalInfo.jsx';
import { ClientDashboardConnectedCounselors } from '../../client/clientDashboard/ClientDashboardConnectedCounselors.jsx';
import { ClientDashboardAccountSettings } from '../../client/clientDashboard/ClientDashboardAccountSettings.jsx';
import { ClientDashboardPrivacySecurity } from '../../client/clientDashboard/ClientDashboardPrivacySecurity.jsx';

import { useClientAuth } from '../../contexts/ClientAuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } 
  },
};

const ClientDashboard = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { client, clientLoading } = useClientAuth();

  if (clientLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 via-primary-50/30 to-blue-50/20 dark:from-neutral-950 dark:via-primary-950/20 dark:to-blue-950/10 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-200/20 dark:bg-primary-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-200/20 dark:bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 flex flex-col items-center gap-6"
        >
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-200/50 border-t-primary-600 dark:border-primary-800/50 dark:border-t-primary-400" />
            <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-4 border-primary-300/30 dark:border-primary-600/20" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
              Loading your dashboard...
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Please wait a moment
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-80px)] bg-gradient-to-br from-neutral-50 via-primary-50/30 to-blue-50/20 dark:from-neutral-950 dark:via-primary-950/20 dark:to-blue-950/10 flex overflow-hidden mt-[80px] fixed w-full">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200/10 dark:bg-primary-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/10 dark:bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="relative z-10 hidden lg:flex w-72 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-r border-primary-200/50 dark:border-primary-800/30 flex-col shadow-xl shadow-primary-500/5">
        <ClientDashboardSidebar />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent 
          side="left" 
          className="w-72 p-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-r border-primary-200/50 dark:border-primary-800/30"
        >
          <ClientDashboardSidebar 
            onNavigate={() => setMobileMenuOpen(false)} 
            showCloseButton={true}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="flex lg:hidden items-center justify-between border-b border-primary-200/50 dark:border-primary-800/30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl px-4 py-3 shadow-lg shadow-primary-500/5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="h-10 w-10 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:scale-110 transition-all duration-300"
          >
            <Menu className="h-5 w-5 text-primary-700 dark:text-primary-400" />
          </Button>
          <h1 className="text-base font-bold bg-gradient-to-r from-primary-700 to-blue-600 dark:from-primary-400 dark:to-blue-400 bg-clip-text text-transparent">
            Client Dashboard
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeIn}
              className="h-full"
            >
              <Routes>
                <Route index element={<Navigate to="personal-info" replace />} />
                
                <Route
                  path="personal-info"
                  element={
                    <ProtectedRoute>
                      <ClientDashboardPersonalInfo />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="bookings"
                  element={
                    <ProtectedRoute>
                      <ClientDashboardMyBookings />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="connected-counselors"
                  element={
                    <ProtectedRoute>
                      <ClientDashboardConnectedCounselors />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="payments"
                  element={
                    <ProtectedRoute>
                      <ClientDashboardPayments />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="account-settings"
                  element={
                    <ProtectedRoute>
                      <ClientDashboardAccountSettings />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="notifications"
                  element={
                    <ProtectedRoute>
                      <ClientDashboardNotifications />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="privacy-security"
                  element={
                    <ProtectedRoute>
                      <ClientDashboardPrivacySecurity />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="help-support"
                  element={
                    <ProtectedRoute>
                      <ClientDashboardHelpSupport />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;
