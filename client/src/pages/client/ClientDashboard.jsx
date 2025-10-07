// import React, { useState } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import ProtectedRoute from '../../components/client/ClientProtectedRoute';
// import ClientDashboardTopbar from '../../components/client/clientDashboard/ClientDashboardTopbar'
// import ClientDashboardSidebar from '../../components/client/clientDashboard/ClientDashboardSidebar';


// // Import all dashboard components

// import { ClientDashboardAdminSupport } from '../../components/client/clientDashboard/ClientDashboardAdminSupport';
// import { ClientDashboardPayments } from '../../components/client/clientDashboard/ClientDashboardPayments';
// import { ClientDashboardBookNewSession } from '../../components/client/clientDashboard/ClientDashboardBookNewSession';
// import { ClientDashboardConnectedCounselors } from '../../components/client/clientDashboard/ClientDashboardConnectedCounselors';
// import { ClientDashboardHelpSupport } from '../../components/client/clientDashboard/ClientDashboardHelpSupport';
// import { ClientDashboardHome } from '../../components/client/clientDashboard/ClientDashboardHome';
// import { ClientDashboardNotifications } from '../../components/client/clientDashboard/ClientDashboardNotifications';
// import { ClientDashboardMyBookings } from '../../components/client/clientDashboard/ClientDashboardMyBookings';
// import { ClientDashboardResources } from '../../components/client/clientDashboard/ClientDashboardResources';

// import { useClientAuth } from '../../contexts/ClientAuthContext';

// const ClientDashboard = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const { client, clientLoading } = useClientAuth();

//   if (clientLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//       </div>
//     );
//   }

//   if (!client) {
//     return <Navigate to="/login" replace />;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 pt-9">
//       <div className="flex">
//         {/* Sidebar */}
//         <ClientDashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

//         {/* Main Content */}
//         <div className="flex-1 flex flex-col overflow-hidden">
//           {/* Top Navigation */}
//           <ClientDashboardTopbar setSidebarOpen={setSidebarOpen} client={client} />

//           {/* Page Content */}
//           <main className="flex-1 overflow-y-auto">
//             <motion.div
//               className="p-4 md:p-6"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.3 }}
//             >
//               <Routes>
//                 <Route
//                   path=""
//                   element={
//                     <ProtectedRoute>
//                       <ClientDashboardHome />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="bookings"
//                   element={
//                     <ProtectedRoute>
//                       <ClientDashboardMyBookings />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="payments"
//                   element={
//                     <ProtectedRoute>
//                       <ClientDashboardPayments />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="counselors"
//                   element={
//                     <ProtectedRoute>
//                       <ClientDashboardConnectedCounselors />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="book-session"
//                   element={
//                     <ProtectedRoute>
//                       <ClientDashboardBookNewSession />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="notifications"
//                   element={
//                     <ProtectedRoute>
//                       <ClientDashboardNotifications />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="support"
//                   element={
//                     <ProtectedRoute>
//                       <ClientDashboardHelpSupport />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="resources"
//                   element={
//                     <ProtectedRoute>
//                       <ClientDashboardResources />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="admin"
//                   element={
//                     <ProtectedRoute>
//                       <ClientDashboardAdminSupport />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
//               </Routes>
//             </motion.div>
//           </main>
//         </div>
//       </div>

//       {/* Mobile sidebar overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default ClientDashboard;
