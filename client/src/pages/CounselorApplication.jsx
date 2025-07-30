import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCounselorAuth } from "../contexts/CounselorAuthContext";

const CounselorApplication = () => {
  const [formData, setFormData] = useState({
    education: {
      graduation: {
        university: "",
        degree: "",
        year: "",
      },
      postGraduation: {
        university: "",
        degree: "",
        year: "",
      },
    },
    experience: "",
    professionalSummary: "",
    languages: [],
    license: {
      licenseNo: "",
      issuingAuthority: "",
    },
    bankDetails: {
      accountNo: "",
      ifscCode: "",
      branchName: "",
    },
    resume: null,
    degreeCertificate: null,
    governmentId: null,
    licenseCertificate: null,
  });
  const { submitApplication, counselor } = useCounselorAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (counselor?.applicationStatus === "approved") {
      navigate("/counselor/dashboard");
    }
  }, [counselor?.applicationStatus, navigate]);

  if (counselor?.applicationStatus === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
            Application Submitted
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your application has been submitted successfully. We will review it
            and get back to you within 24-48 hours.
          </p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e, section, subsection) => {
    const { name, value, files } = e.target;

    if (files) {
      // Handle file inputs (resume, degreeCertificate, governmentId, licenseCertificate)
      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else if (section && subsection) {
      // Handle nested fields like education.graduation and education.postGraduation
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [subsection]: {
            ...formData[section][subsection],
            [name]: value,
          },
        },
      });
    } else if (section) {
      // Handle nested fields like license and bankDetails
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [name]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleLanguageChange = (e) => {
    const { value, checked } = e.target;
    setFormData({
      ...formData,
      languages: checked
        ? [...formData.languages, value]
        : formData.languages.filter((lang) => lang !== value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = {
      "education.graduation.university":
        formData.education.graduation.university?.trim(),
      "education.graduation.degree":
        formData.education.graduation.degree?.trim(),
      "education.graduation.year": formData.education.graduation.year,
      experience: formData.experience?.trim(),
      professionalSummary: formData.professionalSummary?.trim(),
      "languages.length": formData.languages.length > 0,
      "bankDetails.accountNo": formData.bankDetails.accountNo?.trim(),
      "bankDetails.ifscCode": formData.bankDetails.ifscCode?.trim(),
      "bankDetails.branchName": formData.bankDetails.branchName?.trim(),
      resume: formData.resume,
      degreeCertificate: formData.degreeCertificate,
      governmentId: formData.governmentId,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      toast.error(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    console.log("Submitting FormData:", formData); // Debug log

    await submitApplication(formData);
    // Do not navigate here; let useEffect handle navigation if approved
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
          Counselor Application
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Education
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Graduation
                </h4>
                <input
                  name="university"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="University"
                  value={formData.education.graduation.university}
                  onChange={(e) =>
                    handleInputChange(e, "education", "graduation")
                  }
                />
                <input
                  name="degree"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Degree"
                  value={formData.education.graduation.degree}
                  onChange={(e) =>
                    handleInputChange(e, "education", "graduation")
                  }
                />
                <input
                  name="year"
                  type="number"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Year"
                  value={formData.education.graduation.year}
                  onChange={(e) =>
                    handleInputChange(e, "education", "graduation")
                  }
                />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Post-Graduation (Optional)
                </h4>
                <input
                  name="university"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="University"
                  value={formData.education.postGraduation.university}
                  onChange={(e) =>
                    handleInputChange(e, "education", "postGraduation")
                  }
                />
                <input
                  name="degree"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Degree"
                  value={formData.education.postGraduation.degree}
                  onChange={(e) =>
                    handleInputChange(e, "education", "postGraduation")
                  }
                />
                <input
                  name="year"
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Year"
                  value={formData.education.postGraduation.year}
                  onChange={(e) =>
                    handleInputChange(e, "education", "postGraduation")
                  }
                />
              </div>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Professional Details
            </h3>
            <textarea
              name="experience"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Professional Experience"
              value={formData.experience}
              onChange={handleInputChange}
            />
            <textarea
              name="professionalSummary"
              required
              className="mt-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Professional Summary"
              value={formData.professionalSummary}
              onChange={handleInputChange}
            />
          </div>

          <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Languages
            </h3>
            <div className="space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  value="English"
                  checked={formData.languages.includes("English")}
                  onChange={handleLanguageChange}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <span className="ml-2">English</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  value="Hindi"
                  checked={formData.languages.includes("Hindi")}
                  onChange={handleLanguageChange}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <span className="ml-2">Hindi</span>
              </label>
            </div>
          </div>

          <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              License (Optional)
            </h3>
            <input
              name="licenseNo"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="License Number"
              value={formData.license.licenseNo}
              onChange={(e) => handleInputChange(e, "license")} // Remove null
            />
            <input
              name="issuingAuthority"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Issuing Authority"
              value={formData.license.issuingAuthority}
              onChange={(e) => handleInputChange(e, "license")} // Remove null
            />
          </div>

          <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Bank Details
            </h3>
            <input
              name="accountNo"
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Account Number"
              value={formData.bankDetails.accountNo}
              onChange={(e) => handleInputChange(e, "bankDetails")} // Remove null
            />
            <input
              name="ifscCode"
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="IFSC Code"
              value={formData.bankDetails.ifscCode}
              onChange={(e) => handleInputChange(e, "bankDetails")} // Remove null
            />
            <input
              name="branchName"
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Branch Name"
              value={formData.bankDetails.branchName}
              onChange={(e) => handleInputChange(e, "bankDetails")} // Remove null
            />
          </div>

          <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Documents
            </h3>
            <input
              name="resume"
              type="file"
              required
              accept=".pdf"
              className="mt-1 block w-full"
              onChange={handleInputChange}
            />
            <input
              name="degreeCertificate"
              type="file"
              required
              accept=".pdf"
              className="mt-1 block w-full"
              onChange={handleInputChange}
            />
            <input
              name="governmentId"
              type="file"
              required
              accept=".pdf"
              className="mt-1 block w-full"
              onChange={handleInputChange}
            />
            <input
              name="licenseCertificate"
              type="file"
              accept=".pdf"
              className="mt-1 block w-full"
              onChange={handleInputChange}
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CounselorApplication;
