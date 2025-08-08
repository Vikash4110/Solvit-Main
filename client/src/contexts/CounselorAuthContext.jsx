import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const CounselorAuthContext = createContext();

export const useCounselorAuth = () => {
  const context = useContext(CounselorAuthContext);
  if (!context) {
    throw new Error(
      "useCounselorAuth must be used within a CounselorAuthProvider"
    );
  }
  return context;
};

export const CounselorAuthProvider = ({ children }) => {
  const [counselor, setCounselor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.baseURL =
    import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
  axios.defaults.withCredentials = true;

  // Check for existing token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("counselorToken");
      if (token) {
        try {
          const storedCounselor = localStorage.getItem("counselor");
          if (storedCounselor) {
            setCounselor(JSON.parse(storedCounselor));
          }
        } catch (error) {
          console.error("Error initializing auth:", error);
          localStorage.removeItem("counselorToken");
          localStorage.removeItem("counselor");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post("/counselors/login-counselor", {
        email,
        password,
      });

      const { loggedInCounselor, accessToken } = response.data.data;

      localStorage.setItem("counselorToken", accessToken);
      localStorage.setItem("counselor", JSON.stringify(loggedInCounselor));
      setCounselor(loggedInCounselor);

      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const formData = new FormData();
      Object.keys(userData).forEach((key) => {
        if (key === "profilePicture" && userData[key]) {
          formData.append(key, userData[key]);
        } else if (key !== "otp") {
          formData.append(key, userData[key]);
        }
      });

      // Log FormData for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`Register FormData - ${key}:`, value);
      }

      const response = await axios.post(
        "/counselors/register-counselor",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Registration successful! Please log in.");
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error.response?.data || error);
      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const sendOtp = async (email, purpose = "register") => {
    try {
      const endpoint =
        purpose === "reset"
          ? "/counselors/forgot-password"
          : "/counselors/send-otp-register-email";
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
      await axios.post("/counselors/verify-otp-register-email", { email, otp });
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
      const response = await axios.post("/counselors/reset-password", {
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

  const submitApplication = async (applicationData) => {
    try {
      const token = localStorage.getItem("counselorToken");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      // Validate required fields
      const requiredFields = {
        "education.graduation.university":
          applicationData.education?.graduation?.university?.trim(),
        "education.graduation.degree":
          applicationData.education?.graduation?.degree?.trim(),
        "education.graduation.year":
          applicationData.education?.graduation?.year,
        experience: applicationData.experience?.trim(),
        professionalSummary: applicationData.professionalSummary?.trim(),
        "languages.length": applicationData.languages?.length > 0,
        "bankDetails.accountNo": applicationData.bankDetails?.accountNo?.trim(),
        "bankDetails.ifscCode": applicationData.bankDetails?.ifscCode?.trim(),
        "bankDetails.branchName":
          applicationData.bankDetails?.branchName?.trim(),
        resume: applicationData.resume,
        degreeCertificate: applicationData.degreeCertificate,
        governmentId: applicationData.governmentId,
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      const formData = new FormData();
      formData.append("education", JSON.stringify(applicationData.education));
      formData.append("experience", applicationData.experience);
      formData.append(
        "professionalSummary",
        applicationData.professionalSummary
      );
      formData.append("languages", JSON.stringify(applicationData.languages));
      if (
        applicationData.license?.licenseNo ||
        applicationData.license?.issuingAuthority
      ) {
        formData.append("license", JSON.stringify(applicationData.license));
      }
      formData.append(
        "bankDetails",
        JSON.stringify(applicationData.bankDetails)
      );
      formData.append("resume", applicationData.resume);
      formData.append("degreeCertificate", applicationData.degreeCertificate);
      formData.append("governmentId", applicationData.governmentId);
      if (applicationData.licenseCertificate) {
        formData.append(
          "licenseCertificate",
          applicationData.licenseCertificate
        );
      }

      // Log FormData for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`Submit FormData - ${key}:`, value);
      }

      const response = await axios.post(
        "/counselors/submit-application",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Application submitted successfully!");
      setCounselor({ ...counselor, applicationStatus: "pending" });
      return { success: true };
    } catch (error) {
      console.error(
        "Application submission error:",
        error.response?.data || error
      );
      const message =
        error.response?.data?.message ||
        error.message ||
        "Application submission failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await axios.post("/counselors/logout-counselor");
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Clearing local data.");
    } finally {
      localStorage.removeItem("counselorToken");
      localStorage.removeItem("counselor");
      setCounselor(null);
    }
  };

  const value = {
    counselor,
    login,
    register,
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,
    submitApplication,
    logout,
    loading,
  };

  return (
    <CounselorAuthContext.Provider value={value}>
      {children}
    </CounselorAuthContext.Provider>
  );
};
