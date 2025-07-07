import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.baseURL = 'http://localhost:8000/api/v1';
  axios.defaults.withCredentials = true;

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // You can add a verify token endpoint to check if token is still valid
      setUser(JSON.parse(localStorage.getItem('user')));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/clients/login-client', {
        email,
        password
      });

      const { user: userData, accessToken } = response.data.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const formData = new FormData();
      
      // Add all user data to formData
      Object.keys(userData).forEach(key => {
        if (key === 'profilePicture' && userData[key]) {
          formData.append(key, userData[key]);
        } else if (key !== 'profilePicture') {
          formData.append(key, userData[key]);
        }
      });

      const response = await axios.post('/clients/register-client', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Registration successful! Please login.');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const sendOtp = async (email) => {
    try {
        console.log(email)
      await axios.post('/clients/send-otp-register-email', { email });
      toast.success('OTP sent to your email!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      await axios.post('/clients/verify-otp-register-email', { email, otp });
      toast.success('OTP verified successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid OTP';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/clients/logout-client');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Logged out successfully!');
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    sendOtp,
    verifyOtp,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 