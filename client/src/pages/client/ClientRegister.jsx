import { ArrowLeft, Camera, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useClientAuth } from '../../contexts/ClientAuthContext';

const Register = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const { register: clientRegister, sendOtp, verifyOtp } = useClientAuth();
  const navigate = useNavigate();

  // Step 1: Email and OTP
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    watch: watchEmail,
    formState: { errors: errorsEmail },
    setValue: setValueEmail,
  } = useForm();

  // Step 2: Registration fields
  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    formState: { errors: errorsForm },
    setValue: setValueForm,
  } = useForm();

  const handleSendOtp = async (data) => {
    setIsLoading(true);
    const result = await sendOtp(data.email);
    setIsLoading(false);
    if (result.success) {
      setEmail(data.email);
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = async (data) => {
    setIsLoading(true);
    const result = await verifyOtp(email, data.otp);
    setIsLoading(false);
    if (result.success) {
      setOtpVerified(true);
      setStep(2);
    }
  };

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

  const onSubmitRegister = async (data) => {
    setIsLoading(true);
    const userData = {
      ...data,
      email,
      profilePicture,
      preferredLanguages: data.preferredLanguages || ['Hindi', 'English'],
      prefferedTopics: data.prefferedTopics || ['Stress', 'mentalHealth'],
      gender: data.gender || 'Prefer not to say',
    };
    const result = await registerUser(userData);
    setIsLoading(false);
    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <Link to="/login" className="inline-flex items-center text-blue-600 hover:text-blue-500">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">Join us and start your journey</p>
          </div>

          {/* Step 1: Email and OTP */}
          {step === 1 && (
            <form
              onSubmit={
                otpSent ? handleSubmitEmail(handleVerifyOtp) : handleSubmitEmail(handleSendOtp)
              }
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    {...registerEmail('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your email"
                    disabled={otpSent}
                  />
                </div>
                {errorsEmail.email && (
                  <p className="mt-1 text-sm text-red-600">{errorsEmail.email.message}</p>
                )}
              </div>
              {otpSent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">OTP *</label>
                  <input
                    type="text"
                    {...registerEmail('otp', { required: 'OTP is required' })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                  {errorsEmail.otp && (
                    <p className="mt-1 text-sm text-red-600">{errorsEmail.otp.message}</p>
                  )}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading
                  ? otpSent
                    ? 'Verifying...'
                    : 'Sending...'
                  : otpSent
                    ? 'Verify OTP'
                    : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step 2: Registration Form */}
          {step === 2 && (
            <form onSubmit={handleSubmitForm(onSubmitRegister)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  {...registerForm('fullName', {
                    required: 'Full name is required',
                    minLength: {
                      value: 3,
                      message: 'Name must be at least 3 characters',
                    },
                    maxLength: {
                      value: 30,
                      message: 'Name cannot exceed 30 characters',
                    },
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your full name"
                />
                {errorsForm.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errorsForm.fullName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username *</label>
                <input
                  type="text"
                  {...registerForm('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters',
                    },
                    maxLength: {
                      value: 10,
                      message: 'Username cannot exceed 10 characters',
                    },
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Choose a username"
                />
                {errorsForm.username && (
                  <p className="mt-1 text-sm text-red-600">{errorsForm.username.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password *</label>
                <input
                  type="password"
                  {...registerForm('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Create a password"
                />
                {errorsForm.password && (
                  <p className="mt-1 text-sm text-red-600">{errorsForm.password.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                <input
                  type="tel"
                  {...registerForm('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\+?[1-9]\d{1,14}$/,
                      message: 'Please enter a valid phone number',
                    },
                  })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your phone number"
                />
                {errorsForm.phone && (
                  <p className="mt-1 text-sm text-red-600">{errorsForm.phone.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  {...registerForm('gender')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Preferred Language
                </label>
                <div className="mt-2 space-y-2">
                  {['Hindi', 'English'].map((lang) => (
                    <label key={lang} className="flex items-center">
                      <input
                        type="checkbox"
                        value={lang}
                        {...registerForm('preferredLanguages')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Topics</label>
                <div className="mt-2 space-y-2">
                  {['Stress', 'mentalHealth'].map((topic) => (
                    <label key={topic} className="flex items-center">
                      <input
                        type="checkbox"
                        value={topic}
                        {...registerForm('prefferedTopics')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{topic}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  {...registerForm('bio', {
                    maxLength: {
                      value: 500,
                      message: 'Bio must not exceed 500 characters',
                    },
                  })}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Tell us about yourself..."
                />
                {errorsForm.bio && (
                  <p className="mt-1 text-sm text-red-600">{errorsForm.bio.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  {...registerForm('address.city')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Area</label>
                <input
                  type="text"
                  {...registerForm('address.area')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your area"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pincode</label>
                <input
                  type="text"
                  {...registerForm('address.pincode')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter pincode"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Upload a profile picture (optional)</p>
                    <p className="text-xs text-gray-400">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Registering...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
