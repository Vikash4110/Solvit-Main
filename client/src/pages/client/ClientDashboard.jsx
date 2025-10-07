import React, { useState } from 'react';

import { useClientAuth } from '../../contexts/ClientAuthContext';

const ClientDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { client, clientLoading } = useClientAuth();

  if (clientLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!client) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-9">
      </div>
  );
};

export default ClientDashboard;
