// File: src/pages/CounselorRegister.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCounselorAuth } from "../contexts/CounselorAuthContext";

const CounselorRegister = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    specialization: "",
    profilePicture: null,
    otp: "",
  });
  const { sendOtp, verifyOtp, register } = useCounselorAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const result = await sendOtp(formData.email);
    if (result.success) {
      setStep(2);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const result = await verifyOtp(formData.email, formData.otp);
    if (result.success) {
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) {
      navigate("/counselor/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Counselor Registration
          </h2>
        </div>

        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Send OTP
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  name="otp"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter OTP"
                  value={formData.otp}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Verify OTP
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  name="fullName"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <input
                  name="username"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <input
                  name="phone"
                  type="tel"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <input
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <select
                  name="gender"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <select
                  name="specialization"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  value={formData.specialization}
                  onChange={handleInputChange}
                >
                  <option value="">Select Specialization</option>
                  <option value="Mental Health">Mental Health</option>
                  <option value="Career Counselling">Career Counselling</option>
                  <option value="Relationship Counselling">
                    Relationship Counselling
                  </option>
                  <option value="Life Coaching">Life Coaching</option>
                  <option value="Financial Counselling">
                    Financial Counselling
                  </option>
                  <option value="Academic Counselling">
                    Academic Counselling
                  </option>
                  <option value="Health and Wellness Counselling">
                    Health and Wellness Counselling
                  </option>
                </select>
              </div>
              <div>
                <input
                  name="profilePicture"
                  type="file"
                  accept="image/*"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Register
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CounselorRegister;
