// import { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Configure axios defaults
//   axios.defaults.baseURL = 'http://localhost:8000/api/v1';
//   axios.defaults.withCredentials = true;

//   useEffect(() => {
//     // Check if user is already logged in
//     const userStr = localStorage.getItem('user');
//     if (userStr && userStr !== "undefined") {
//       setUser(JSON.parse(userStr));
//     }
//     setLoading(false);
//   }, []);

//   const login = async (email, password) => {
//     try {
//       const response = await axios.post('/clients/login-client', {
//         email,
//         password
//       });

//       const { loggedInClient, accessToken } = response.data.data;

//       localStorage.setItem('token', accessToken);
//       localStorage.setItem('user', JSON.stringify(loggedInClient));
//       setUser(loggedInClient);

//       toast.success('Login successful!');
//       return { success: true };
//     } catch (error) {
//       const message = error.response?.data?.message || 'Login failed';
//       toast.error(message);
//       return { success: false, error: message };
//     }
//   };

//   const register = async (userData) => {
//     try {
//       const formData = new FormData();

//       // Add all user data to formData
//       Object.keys(userData).forEach(key => {
//         if (key === 'profilePicture' && userData[key]) {
//           formData.append(key, userData[key]);
//         } else if (key !== 'profilePicture') {
//           formData.append(key, userData[key]);
//         }
//       });

//       const response = await axios.post('/clients/register-client', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       toast.success('Registration successful! Please login.');
//       return { success: true };
//     } catch (error) {
//       const message = error.response?.data?.message || 'Registration failed';
//       toast.error(message);
//       return { success: false, error: message };
//     }
//   };

//   const sendOtp = async (email) => {
//     try {
//         console.log(email)
//       await axios.post('/clients/send-otp-register-email', { email });
//       toast.success('OTP sent to your email!');
//       return { success: true };
//     } catch (error) {
//       const message = error.response?.data?.message || 'Failed to send OTP';
//       toast.error(message);
//       return { success: false, error: message };
//     }
//   };

//   const verifyOtp = async (email, otp) => {
//     try {
//       await axios.post('/clients/verify-otp-register-email', { email, otp });
//       toast.success('OTP verified successfully!');
//       return { success: true };
//     } catch (error) {
//       const message = error.response?.data?.message || 'Invalid OTP';
//       toast.error(message);
//       return { success: false, error: message };
//     }
//   };

//   const logout = async () => {
//     try {
//       await axios.post('/clients/logout-client');
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       setUser(null);
//       toast.success('Logged out successfully!');
//     }
//   };

//   const value = {
//     user,
//     login,
//     register,
//     logout,
//     sendOtp,
//     verifyOtp,
//     loading
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.baseURL = API_BASE_URL;
  axios.defaults.withCredentials = true;

  useEffect(() => {
    // Check if user is already logged in
    const userStr = localStorage.getItem("user");
    if (userStr && userStr !== "undefined") {
      setUser(JSON.parse(userStr));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(API_ENDPOINTS.CLIENT_LOGIN, {
        email,
        password,
      });

      const { loggedInClient, accessToken } = response.data.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(loggedInClient));
      setUser(loggedInClient);

      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const formData = new FormData();

      // Add all user data to formData
      Object.keys(userData).forEach((key) => {
        if (key === "profilePicture" && userData[key]) {
          formData.append(key, userData[key]);
        } else if (key !== "otp") {
          formData.append(key, userData[key]);
        }
      });

      const response = await axios.post(API_ENDPOINTS.CLIENT_REGISTER, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Registration successful! Please login.");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const sendOtp = async (email, purpose = "register") => {
    try {
      const endpoint =
        purpose === "reset"
          ? API_ENDPOINTS.CLIENT_FORGOT_PASSWORD
          : API_ENDPOINTS.CLIENT_SEND_OTP;
      await axios.post(endpoint, { email });
      toast.success("OTP sent to your email!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send OTP";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      await axios.post(API_ENDPOINTS.CLIENT_VERIFY_OTP, { email, otp });
      toast.success("OTP verified successfully!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Invalid OTP";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    return await sendOtp(email, "reset");
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await axios.post(API_ENDPOINTS.CLIENT_RESET_PASSWORD, {
        email,
        otp,
        newPassword,
      });
      // toast.success("Password reset successfully!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to reset password";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await axios.post(API_ENDPOINTS.CLIENT_LOGOUT);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      toast.success("Logged out successfully!");
    }
  };

  const value = {
    user,
    login,
    register,
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
