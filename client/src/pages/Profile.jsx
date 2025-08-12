import { useState } from 'react';
import { useClientAuth } from '../contexts/ClientAuthContext';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Settings, ArrowLeft, Camera, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { client } = useClientAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      fullName: client?.fullName || '',
      username: client?.username || '',
      email: client?.email || '',
      phone: client?.phone || '',
      gender: client?.gender || 'Prefer not to say',
      bio: client?.bio || '',
      'address.city': client?.address?.city || '',
      'address.area': client?.address?.area || '',
      'address.pincode': client?.address?.pincode || '',
      preferredLanguages: client?.preferredLanguages || ['Hindi', 'English'],
      prefferedTopics: client?.prefferedTopics || ['Stress', 'mentalHealth'],
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    reset();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfilePicture(null);
    setPreviewImage(null);
    reset();
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Here you would typically make an API call to update the user profile
      // For now, we'll just show a success message
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 flex items-center mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Dashboard
              </Link>
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">Profile</h1>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Profile Picture Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="h-24 w-24 object-cover" />
                    ) : client?.profilePicture ? (
                      <img src={client.profilePicture} alt="Profile" className="h-24 w-24 object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {isEditing
                      ? 'Click the camera icon to upload a new profile picture'
                      : 'Your profile picture'}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      {...register('fullName', {
                        required: 'Full name is required',
                        minLength: { value: 3, message: 'Name must be at least 3 characters' },
                        maxLength: { value: 30, message: 'Name cannot exceed 30 characters' }
                      })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{client?.fullName}</p>
                  )}
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  {isEditing ? (
                    <input
                      type="text"
                      {...register('username', {
                        required: 'Username is required',
                        minLength: { value: 3, message: 'Username must be at least 3 characters' },
                        maxLength: { value: 10, message: 'Username cannot exceed 10 characters' }
                      })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">@{client?.username}</p>
                  )}
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{client?.email}</p>
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^\+?[1-9]\d{1,14}$/,
                          message: 'Please enter a valid phone number'
                        }
                      })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{client?.phone}</p>
                  )}
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  {isEditing ? (
                    <select
                      {...register('gender')}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="Prefer not to say">Prefer not to say</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{client?.gender}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bio</h3>
              {isEditing ? (
                <textarea
                  {...register('bio', {
                    maxLength: { value: 500, message: 'Bio must not exceed 500 characters' }
                  })}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-sm text-gray-900">{client?.bio || 'No bio added yet.'}</p>
              )}
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
              )}
            </div>

            {/* Preferences */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Languages
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {['Hindi', 'English'].map(lang => (
                        <label key={lang} className="flex items-center">
                          <input
                            type="checkbox"
                            value={lang}
                            {...register('preferredLanguages')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{lang}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900">
                      {client?.preferredLanguages?.join(', ')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Topics
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {['Stress', 'mentalHealth'].map(topic => (
                        <label key={topic} className="flex items-center">
                          <input
                            type="checkbox"
                            value={topic}
                            {...register('prefferedTopics')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{topic}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900">
                      {client?.prefferedTopics?.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      {...register('address.city')}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{client?.address?.city || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Area</label>
                  {isEditing ? (
                    <input
                      type="text"
                      {...register('address.area')}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{client?.address?.area || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Pincode</label>
                  {isEditing ? (
                    <input
                      type="text"
                      {...register('address.pincode')}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{client?.address?.pincode || 'Not specified'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 