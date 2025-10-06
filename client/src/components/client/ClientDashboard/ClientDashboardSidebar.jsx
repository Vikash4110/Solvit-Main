import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaTachometerAlt,
  FaCalendarCheck,
  FaCreditCard,
  FaUserFriends,
  FaPlusCircle,
  FaUserCog,
  FaBell,
  FaLifeRing,
  FaBook,
  FaTools,
  FaTimes,
} from 'react-icons/fa';

const sidebarItems = [
  {
    path: '/client/dashboard',
    name: 'Home',
    icon: <FaTachometerAlt />,
    color: 'text-blue-600',
  },
  {
    path: '/client/dashboard/bookings',
    name: 'My Bookings',
    icon: <FaCalendarCheck />,
    color: 'text-green-600',
  },
  {
    path: '/client/dashboard/payments',
    name: 'Payments',
    icon: <FaCreditCard />,
    color: 'text-yellow-600',
  },
  {
    path: '/client/dashboard/counselors',
    name: 'Connected Counselors',
    icon: <FaUserFriends />,
    color: 'text-purple-600',
  },
  {
    path: '/client/dashboard/book-session',
    name: 'Book New Session',
    icon: <FaPlusCircle />,
    color: 'text-indigo-600',
  },
  {
    path: '/client/dashboard/notifications',
    name: 'Notifications',
    icon: <FaBell />,
    color: 'text-red-600',
  },
  {
    path: '/client/dashboard/support',
    name: 'Help & Support',
    icon: <FaLifeRing />,
    color: 'text-orange-600',
  },
  {
    path: '/client/dashboard/resources',
    name: 'Resources',
    icon: <FaBook />,
    color: 'text-teal-600',
  },
  {
    path: '/client/dashboard/admin',
    name: 'Admin Support',
    icon: <FaTools />,
    color: 'text-pink-600',
  },
];

const ClientDashboardSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h2 className="text-lg font-semibold text-gray-800">Client Portal</h2>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {sidebarItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path === '/client/dashboard' && location.pathname === '/client/dashboard/');

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span
                      className={`mr-3 flex-shrink-0 h-6 w-6 ${isActive ? 'text-indigo-500' : item.color}`}
                    >
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Client Portal</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span
                    className={`mr-3 flex-shrink-0 h-6 w-6 ${isActive ? 'text-indigo-500' : item.color}`}
                  >
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </motion.div>
    </>
  );
};

export default ClientDashboardSidebar;
