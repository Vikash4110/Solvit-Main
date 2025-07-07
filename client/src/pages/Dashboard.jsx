import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { User, Settings, LogOut, Calendar, MapPin, Phone, Mail, Heart } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">Solvit</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <Settings className="h-5 w-5 mr-1" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-blue-600" />
                    )}
                  </div>
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Welcome back, {user?.fullName}!
                  </h2>
                  <p className="text-gray-600">
                    We're here to support your mental health journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Information Cards */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Personal Information */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Personal Information
              </h3>
              <dl className="space-y-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="text-sm text-gray-900">{user?.fullName}</dd>
                  </div>
                </div>
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Username</dt>
                    <dd className="text-sm text-gray-900">@{user?.username}</dd>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{user?.email}</dd>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="text-sm text-gray-900">{user?.phone}</dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Preferences
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="text-sm text-gray-900">{user?.gender}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Preferred Languages</dt>
                  <dd className="text-sm text-gray-900">
                    {user?.preferredLanguages?.join(', ')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Preferred Topics</dt>
                  <dd className="text-sm text-gray-900">
                    {user?.prefferedTopics?.join(', ')}
                  </dd>
                </div>
                {user?.bio && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Bio</dt>
                    <dd className="text-sm text-gray-900">{user.bio}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Address Information
              </h3>
              <dl className="space-y-3">
                {user?.address?.city && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">City</dt>
                      <dd className="text-sm text-gray-900">{user.address.city}</dd>
                    </div>
                  </div>
                )}
                {user?.address?.area && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Area</dt>
                    <dd className="text-sm text-gray-900">{user.address.area}</dd>
                  </div>
                )}
                {user?.address?.pincode && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Pincode</dt>
                    <dd className="text-sm text-gray-900">{user.address.pincode}</dd>
                  </div>
                )}
                {user?.lastLogin && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                  to="/profile"
                  className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                      <Settings className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Edit Profile
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Update your personal information and preferences
                    </p>
                  </div>
                </Link>

                <div className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                      <Heart className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Mental Health Resources
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Access helpful resources and support materials
                    </p>
                  </div>
                </div>

                <div className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                      <Calendar className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Schedule Session
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Book a session with a mental health professional
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 