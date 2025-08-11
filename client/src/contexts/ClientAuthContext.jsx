// ClientAuthContext.js
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Create context
const ClientAuthContext = createContext();

// Custom hook
export const useClientAuth = () => {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error("useClientAuth must be used within a ClientAuthProvider");
  }
  return context;
};

// Provider
export const ClientAuthProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [clientLoading, setClientLoading] = useState(true);

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("clientAccessToken");
      if (token) {
        try {
          const storedClient = localStorage.getItem("client");
          if (storedClient) {
            setClient(JSON.parse(storedClient));
          }
        } catch (error) {
          console.error("Error initializing auth:", error);
          localStorage.removeItem("clientAccessToken");
          localStorage.removeItem("client");
        }
      }
      setClientLoading(false);
    };

    initializeAuth();
  }, []);

  // Helper for error messages
  const getErrorMessage = (error, fallback = "Something went wrong") =>
    error.response?.data?.message || error.message || fallback;

  const clientLogin = async (email, password) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.CLIENT_LOGIN, {
        email,
        password,
      });

      const { loggedInClient, accessToken } = response.data.data;

      localStorage.setItem("clientAccessToken", accessToken);
      localStorage.setItem("client", JSON.stringify(loggedInClient));
      setClient(loggedInClient);

      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, "Login failed");
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const clientRegister = async (clientData) => {
    try {
      const formData = new FormData();

      Object.keys(clientData).forEach((key) => {
        if (key === "profilePicture" && clientData[key]) {
          formData.append(key, clientData[key]);
        } else if (key !== "otp") {
          formData.append(key, clientData[key]);
        }
      });

      await axiosInstance.post(API_ENDPOINTS.CLIENT_REGISTER, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Registration successful! Please login.");
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, "Registration failed");
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

      await axiosInstance.post(endpoint, { email });
      toast.success("OTP sent to your email!");
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, "Failed to send OTP");
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      await axiosInstance.post(API_ENDPOINTS.CLIENT_VERIFY_OTP, { email, otp });
      toast.success("OTP verified successfully!");
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, "Invalid OTP");
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = (email) => sendOtp(email, "reset");

  const resetPassword = async (email, otp, newPassword) => {
    try {
      await axiosInstance.post(API_ENDPOINTS.CLIENT_RESET_PASSWORD, {
        email,
        otp,
        newPassword,
      });
      toast.success("Password reset successfully!");
      return { success: true };
    } catch (error) {
      const message = getErrorMessage(error, "Failed to reset password");
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const clientLogout = async () => {
    try {
      await axiosInstance.post(API_ENDPOINTS.CLIENT_LOGOUT);
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Logout failed. Clearing local data.");
    } finally {
      localStorage.removeItem("clientAccessToken");
      localStorage.removeItem("client");
      setClient(null);
    }
  };

  const value = {
    client,
    clientLoading,
    clientLogin,
    clientRegister,
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,
    clientLogout,
  };

  return (
    <ClientAuthContext.Provider value={value}>
      {children}
    </ClientAuthContext.Provider>
  );
};
