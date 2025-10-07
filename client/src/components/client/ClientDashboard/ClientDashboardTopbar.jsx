import React from 'react';
import { FaBars, FaBell, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useClientAuth } from '../../../contexts/ClientAuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ClientDashboardTopbar = ({ setSidebarOpen, client }) => {
  const { clientLogout } = useClientAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await clientLogout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <FaBars className="h-5 w-5" />
          </button>
          <h1 className="ml-2 text-xl font-semibold text-gray-800 hidden sm:block">
            Welcome back, {client?.fullName || 'Client'}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <FaBell className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              {client?.profilePicture ? (
                <img
                  src={client.profilePicture}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <FaUser className="h-4 w-4 text-indigo-600" />
              )}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Logout"
            >
              <FaSignOutAlt className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardTopbar;
