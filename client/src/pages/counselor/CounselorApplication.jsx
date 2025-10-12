// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useCounselorAuth } from '../../contexts/CounselorAuthContext';
// import { toast } from 'sonner';

// const CounselorApplication = () => {
//   const [formData, setFormData] = useState({
//     education: {
//       graduation: {
//         university: '',
//         degree: '',
//         year: '',
//       },
//       postGraduation: {
//         university: '',
//         degree: '',
//         year: '',
//       },
//     },
//     experience: '',
//     professionalSummary: '',
//     languages: [],
//     license: {
//       licenseNo: '',
//       issuingAuthority: '',
//     },
//     bankDetails: {
//       accountNo: '',
//       ifscCode: '',
//       branchName: '',
//     },
//   });

//   const [files, setFiles] = useState({
//     resume: null,
//     degreeCertificate: null,
//     governmentId: null,
//     licenseCertificate: null,
//   });

//   const [loading, setLoading] = useState(false);
//   const { submitApplication, counselor } = useCounselorAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (counselor?.applicationStatus === 'approved') {
//       navigate('/counselor/dashboard');
//     } else if (counselor?.applicationStatus === 'pending') {
//       navigate('/counselor/application-status');
//     }
//   }, [counselor?.applicationStatus, navigate]);

//   const handleInputChange = (e, section, subsection) => {
//     const { name, value } = e.target;

//     if (section && subsection) {
//       setFormData((prev) => ({
//         ...prev,
//         [section]: {
//           ...prev[section],
//           [subsection]: {
//             ...prev[section][subsection],
//             [name]: value,
//           },
//         },
//       }));
//     } else if (section) {
//       setFormData((prev) => ({
//         ...prev,
//         [section]: {
//           ...prev[section],
//           [name]: value,
//         },
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleFileChange = (e) => {
//     const { name, files: selectedFiles } = e.target;
//     if (selectedFiles && selectedFiles[0]) {
//       setFiles((prev) => ({
//         ...prev,
//         [name]: selectedFiles[0],
//       }));
//     }
//   };

//   const handleLanguageChange = (e) => {
//     const { value, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       languages: checked
//         ? [...prev.languages, value]
//         : prev.languages.filter((lang) => lang !== value),
//     }));
//   };

//   const validateForm = () => {
//     // Required fields validation
//     const requiredFields = {
//       'Graduation University': formData.education.graduation.university?.trim(),
//       'Graduation Degree': formData.education.graduation.degree?.trim(),
//       'Graduation Year': formData.education.graduation.year,
//       Experience: formData.experience?.trim(),
//       'Professional Summary': formData.professionalSummary?.trim(),
//       Languages: formData.languages.length > 0,
//       'Bank Account Number': formData.bankDetails.accountNo?.trim(),
//       'IFSC Code': formData.bankDetails.ifscCode?.trim(),
//       'Branch Name': formData.bankDetails.branchName?.trim(),
//       Resume: files.resume,
//       'Degree Certificate': files.degreeCertificate,
//       'Government ID': files.governmentId,
//     };

//     const missingFields = Object.entries(requiredFields)
//       .filter(([_, value]) => !value)
//       .map(([key]) => key);

//     if (missingFields.length > 0) {
//       toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
//       return false;
//     }

//     // Year validation
//     const currentYear = new Date().getFullYear();
//     if (formData.education.graduation.year) {
//       const gradYear = parseInt(formData.education.graduation.year);
//       if (isNaN(gradYear) || gradYear < 1900 || gradYear > currentYear) {
//         toast.error('Please enter a valid graduation year (1900 - current year)');
//         return false;
//       }
//     }

//     if (formData.education.postGraduation.year) {
//       const postGradYear = parseInt(formData.education.postGraduation.year);
//       if (isNaN(postGradYear) || postGradYear < 1900 || postGradYear > currentYear) {
//         toast.error('Please enter a valid post-graduation year (1900 - current year)');
//         return false;
//       }
//     }

//     // Professional summary length validation
//     if (formData.professionalSummary.length > 1000) {
//       toast.error('Professional Summary must not exceed 1000 characters');
//       return false;
//     }

//     // File type validation
//     const validateFileType = (file, fieldName) => {
//       if (file && file.type !== 'application/pdf') {
//         toast.error(`${fieldName} must be a PDF file`);
//         return false;
//       }
//       return true;
//     };

//     if (!validateFileType(files.resume, 'Resume')) return false;
//     if (!validateFileType(files.degreeCertificate, 'Degree Certificate')) return false;
//     if (!validateFileType(files.governmentId, 'Government ID')) return false;
//     if (
//       files.licenseCertificate &&
//       !validateFileType(files.licenseCertificate, 'License Certificate')
//     )
//       return false;

//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       // Create FormData for file upload
//       const submissionData = new FormData();

//       // Ensure all data is properly formatted before sending
//       const submissionFormData = {
//         education: {
//           graduation: {
//             university: formData.education.graduation.university || '',
//             degree: formData.education.graduation.degree || '',
//             year: formData.education.graduation.year || '',
//           },
//           postGraduation: {
//             university: formData.education.postGraduation.university || '',
//             degree: formData.education.postGraduation.degree || '',
//             year: formData.education.postGraduation.year || '',
//           },
//         },
//         experience: formData.experience || '',
//         professionalSummary: formData.professionalSummary || '',
//         languages: formData.languages || [],
//         license: {
//           licenseNo: formData.license.licenseNo || '',
//           issuingAuthority: formData.license.issuingAuthority || '',
//         },
//         bankDetails: {
//           accountNo: formData.bankDetails.accountNo || '',
//           ifscCode: formData.bankDetails.ifscCode || '',
//           branchName: formData.bankDetails.branchName || '',
//         },
//       };

//       // Append form data as JSON strings with proper fallbacks
//       submissionData.append('education', JSON.stringify(submissionFormData.education));
//       submissionData.append('experience', submissionFormData.experience);
//       submissionData.append('professionalSummary', submissionFormData.professionalSummary);
//       submissionData.append('languages', JSON.stringify(submissionFormData.languages));
//       submissionData.append('license', JSON.stringify(submissionFormData.license));
//       submissionData.append('bankDetails', JSON.stringify(submissionFormData.bankDetails));

//       // Append files
//       if (files.resume) submissionData.append('resume', files.resume);
//       if (files.degreeCertificate)
//         submissionData.append('degreeCertificate', files.degreeCertificate);
//       if (files.governmentId) submissionData.append('governmentId', files.governmentId);
//       if (files.licenseCertificate)
//         submissionData.append('licenseCertificate', files.licenseCertificate);

//       // Log the data being sent for debugging
//       console.log('Submitting application data:', submissionFormData);

//       const result = await submitApplication(submissionData);
//       if (result.success) {
//         toast.success('Application submitted successfully! We will review it within 24-48 hours.');
//         navigate('/counselor/application-status');
//       } else {
//         toast.error(result.error || 'Application submission failed. Please try again.');
//       }
//     } catch (error) {
//       console.error('Submission error:', error);
//       toast.error(error.message || 'An error occurred during application submission.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (counselor?.applicationStatus === 'pending') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full space-y-8 text-center">
//           <h2 className="mt-6 text-2xl font-extrabold text-gray-900">Application Submitted</h2>
//           <p className="mt-2 text-sm text-gray-600">
//             Your application has been submitted successfully. We will review it and get back to you
//             within 24-48 hours.
//           </p>
//           <button
//             onClick={() => navigate('/counselor/login')}
//             className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//           >
//             Back to Login
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-3xl mx-auto">
//         <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Counselor Application</h2>
//         <form className="space-y-6" onSubmit={handleSubmit}>
//           {/* Education Section */}
//           <div className="bg-white shadow sm:rounded-lg p-6">
//             <h3 className="text-lg font-medium text-gray-900 mb-4">Education</h3>
//             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//               <div>
//                 <h4 className="text-sm font-medium text-gray-700">Graduation *</h4>
//                 <input
//                   name="university"
//                   type="text"
//                   required
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                   placeholder="University"
//                   value={formData.education.graduation.university}
//                   onChange={(e) => handleInputChange(e, 'education', 'graduation')}
//                 />
//                 <input
//                   name="degree"
//                   type="text"
//                   required
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                   placeholder="Degree"
//                   value={formData.education.graduation.degree}
//                   onChange={(e) => handleInputChange(e, 'education', 'graduation')}
//                 />
//                 <input
//                   name="year"
//                   type="number"
//                   required
//                   min="1900"
//                   max={new Date().getFullYear()}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                   placeholder="Year"
//                   value={formData.education.graduation.year}
//                   onChange={(e) => handleInputChange(e, 'education', 'graduation')}
//                 />
//               </div>
//               <div>
//                 <h4 className="text-sm font-medium text-gray-700">Post-Graduation (Optional)</h4>
//                 <input
//                   name="university"
//                   type="text"
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                   placeholder="University"
//                   value={formData.education.postGraduation.university}
//                   onChange={(e) => handleInputChange(e, 'education', 'postGraduation')}
//                 />
//                 <input
//                   name="degree"
//                   type="text"
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                   placeholder="Degree"
//                   value={formData.education.postGraduation.degree}
//                   onChange={(e) => handleInputChange(e, 'education', 'postGraduation')}
//                 />
//                 <input
//                   name="year"
//                   type="number"
//                   min="1900"
//                   max={new Date().getFullYear()}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                   placeholder="Year"
//                   value={formData.education.postGraduation.year}
//                   onChange={(e) => handleInputChange(e, 'education', 'postGraduation')}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Professional Details */}
//           <div className="bg-white shadow sm:rounded-lg p-6">
//             <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Details</h3>
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Professional Experience *
//               </label>
//               <textarea
//                 name="experience"
//                 required
//                 rows={3}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                 placeholder="Describe your professional experience..."
//                 value={formData.experience}
//                 onChange={handleInputChange}
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Professional Summary * ({formData.professionalSummary.length}/1000)
//               </label>
//               <textarea
//                 name="professionalSummary"
//                 required
//                 rows={4}
//                 maxLength={1000}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                 placeholder="Provide a professional summary..."
//                 value={formData.professionalSummary}
//                 onChange={handleInputChange}
//               />
//               <p className="text-xs text-gray-500 mt-1">Maximum 1000 characters</p>
//             </div>
//           </div>

//           {/* Languages */}
//           <div className="bg-white shadow sm:rounded-lg p-6">
//             <h3 className="text-lg font-medium text-gray-900 mb-4">Languages *</h3>
//             <div className="space-y-2">
//               {['English', 'Hindi', 'Spanish', 'French', 'German', 'Other'].map((language) => (
//                 <label key={language} className="inline-flex items-center mr-4">
//                   <input
//                     type="checkbox"
//                     value={language}
//                     checked={formData.languages.includes(language)}
//                     onChange={handleLanguageChange}
//                     className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                   />
//                   <span className="ml-2">{language}</span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* License */}
//           <div className="bg-white shadow sm:rounded-lg p-6">
//             <h3 className="text-lg font-medium text-gray-900 mb-4">License (Optional)</h3>
//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//               <div>
//                 <input
//                   name="licenseNo"
//                   type="text"
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                   placeholder="License Number"
//                   value={formData.license.licenseNo}
//                   onChange={(e) => handleInputChange(e, 'license')}
//                 />
//               </div>
//               <div>
//                 <input
//                   name="issuingAuthority"
//                   type="text"
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                   placeholder="Issuing Authority"
//                   value={formData.license.issuingAuthority}
//                   onChange={(e) => handleInputChange(e, 'license')}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Bank Details */}
//           <div className="bg-white shadow sm:rounded-lg p-6">
//             <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Details</h3>
//             <div className="space-y-4">
//               <input
//                 name="accountNo"
//                 type="text"
//                 required
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                 placeholder="Account Number"
//                 value={formData.bankDetails.accountNo}
//                 onChange={(e) => handleInputChange(e, 'bankDetails')}
//               />
//               <input
//                 name="ifscCode"
//                 type="text"
//                 required
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                 placeholder="IFSC Code"
//                 value={formData.bankDetails.ifscCode}
//                 onChange={(e) => handleInputChange(e, 'bankDetails')}
//               />
//               <input
//                 name="branchName"
//                 type="text"
//                 required
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                 placeholder="Branch Name"
//                 value={formData.bankDetails.branchName}
//                 onChange={(e) => handleInputChange(e, 'bankDetails')}
//               />
//             </div>
//           </div>

//           {/* Documents */}
//           <div className="bg-white shadow sm:rounded-lg p-6">
//             <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Resume (PDF) *
//                 </label>
//                 <input
//                   name="resume"
//                   type="file"
//                   required
//                   accept=".pdf,application/pdf"
//                   className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
//                   onChange={handleFileChange}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Degree Certificate (PDF) *
//                 </label>
//                 <input
//                   name="degreeCertificate"
//                   type="file"
//                   required
//                   accept=".pdf,application/pdf"
//                   className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
//                   onChange={handleFileChange}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Government ID (PDF) *
//                 </label>
//                 <input
//                   name="governmentId"
//                   type="file"
//                   required
//                   accept=".pdf,application/pdf"
//                   className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
//                   onChange={handleFileChange}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   License Certificate (PDF) - Optional
//                 </label>
//                 <input
//                   name="licenseCertificate"
//                   type="file"
//                   accept=".pdf,application/pdf"
//                   className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
//                   onChange={handleFileChange}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <div>
//             <button
//               type="submit"
//               disabled={loading}
//               className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
//                 loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
//               } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
//             >
//               {loading ? (
//                 <>
//                   <svg
//                     className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                   Submitting...
//                 </>
//               ) : (
//                 'Submit Application'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CounselorApplication;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCounselorAuth } from '../../contexts/CounselorAuthContext';
import { toast } from 'sonner';

const CounselorApplication = () => {
  const [formData, setFormData] = useState({
    education: {
      graduation: {
        university: '',
        degree: '',
        year: '',
      },
      postGraduation: {
        university: '',
        degree: '',
        year: '',
      },
    },
    experience: '',
    professionalSummary: '',
    languages: [],
    license: {
      licenseNo: '',
      issuingAuthority: '',
    },
    bankDetails: {
      accountNo: '',
      ifscCode: '',
      branchName: '',
    },
  });

  const [files, setFiles] = useState({
    resume: null,
    degreeCertificate: null,
    governmentId: null,
    licenseCertificate: null,
  });

  const [loading, setLoading] = useState(false);
  const { submitApplication, counselor } = useCounselorAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (counselor?.applicationStatus === 'approved') {
      navigate('/counselor/dashboard');
    } else if (counselor?.applicationStatus === 'pending') {
      navigate('/counselor/application-status');
    }
  }, [counselor, navigate]);

  const handleInputChange = (e, section, subsection) => {
    const { name, value } = e.target;

    if (section && subsection) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subsection]: {
            ...prev[section][subsection],
            [name]: value,
          },
        },
      }));
    } else if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      setFiles((prev) => ({
        ...prev,
        [name]: selectedFiles[0],
      }));
    }
  };

  const handleLanguageChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      languages: checked
        ? [...prev.languages, value]
        : prev.languages.filter((lang) => lang !== value),
    }));
  };

  const validateForm = () => {
    const requiredFields = {
      'Graduation University': formData.education.graduation.university?.trim(),
      'Graduation Degree': formData.education.graduation.degree?.trim(),
      'Graduation Year': formData.education.graduation.year,
      Experience: formData.experience?.trim(),
      'Professional Summary': formData.professionalSummary?.trim(),
      Languages: formData.languages.length > 0,
      'Bank Account Number': formData.bankDetails.accountNo?.trim(),
      'IFSC Code': formData.bankDetails.ifscCode?.trim(),
      'Branch Name': formData.bankDetails.branchName?.trim(),
      Resume: files.resume,
      'Degree Certificate': files.degreeCertificate,
      'Government ID': files.governmentId,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }

    const currentYear = new Date().getFullYear();
    if (formData.education.graduation.year) {
      const gradYear = parseInt(formData.education.graduation.year);
      if (isNaN(gradYear) || gradYear < 1900 || gradYear > currentYear) {
        toast.error('Please enter a valid graduation year (1900 - current year)');
        return false;
      }
    }

    if (formData.education.postGraduation.year) {
      const postGradYear = parseInt(formData.education.postGraduation.year);
      if (isNaN(postGradYear) || postGradYear < 1900 || postGradYear > currentYear) {
        toast.error('Please enter a valid post-graduation year (1900 - current year)');
        return false;
      }
    }

    if (formData.professionalSummary.length > 1000) {
      toast.error('Professional Summary must not exceed 1000 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submissionData = new FormData();

      // Append form data
      submissionData.append('education', JSON.stringify(formData.education));
      submissionData.append('experience', formData.experience);
      submissionData.append('professionalSummary', formData.professionalSummary);
      submissionData.append('languages', JSON.stringify(formData.languages));
      submissionData.append('license', JSON.stringify(formData.license));
      submissionData.append('bankDetails', JSON.stringify(formData.bankDetails));

      // Append files
      if (files.resume) submissionData.append('resume', files.resume);
      if (files.degreeCertificate)
        submissionData.append('degreeCertificate', files.degreeCertificate);
      if (files.governmentId) submissionData.append('governmentId', files.governmentId);
      if (files.licenseCertificate)
        submissionData.append('licenseCertificate', files.licenseCertificate);

      const result = await submitApplication(submissionData);
      if (result.success) {
        toast.success('Application submitted successfully! We will review it within 24-48 hours.');
        navigate('/counselor/application-status');
      } else {
        toast.error(result.error || 'Application submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An error occurred during application submission.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading if checking application status for approved/pending
  if (counselor?.applicationStatus === 'pending' || counselor?.applicationStatus === 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Complete Your Counselor Application
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please fill out all required information to complete your counselor profile
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Education Section */}
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Education</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Graduation *</h4>
                <input
                  name="university"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="University"
                  value={formData.education.graduation.university}
                  onChange={(e) => handleInputChange(e, 'education', 'graduation')}
                />
                <input
                  name="degree"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Degree"
                  value={formData.education.graduation.degree}
                  onChange={(e) => handleInputChange(e, 'education', 'graduation')}
                />
                <input
                  name="year"
                  type="number"
                  required
                  min="1900"
                  max={new Date().getFullYear()}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Year"
                  value={formData.education.graduation.year}
                  onChange={(e) => handleInputChange(e, 'education', 'graduation')}
                />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Post-Graduation (Optional)</h4>
                <input
                  name="university"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="University"
                  value={formData.education.postGraduation.university}
                  onChange={(e) => handleInputChange(e, 'education', 'postGraduation')}
                />
                <input
                  name="degree"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Degree"
                  value={formData.education.postGraduation.degree}
                  onChange={(e) => handleInputChange(e, 'education', 'postGraduation')}
                />
                <input
                  name="year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Year"
                  value={formData.education.postGraduation.year}
                  onChange={(e) => handleInputChange(e, 'education', 'postGraduation')}
                />
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Details</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Professional Experience *
              </label>
              <textarea
                name="experience"
                required
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Describe your professional experience..."
                value={formData.experience}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Professional Summary * ({formData.professionalSummary.length}/1000)
              </label>
              <textarea
                name="professionalSummary"
                required
                rows={4}
                maxLength={1000}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Provide a professional summary..."
                value={formData.professionalSummary}
                onChange={handleInputChange}
              />
              <p className="text-xs text-gray-500 mt-1">Maximum 1000 characters</p>
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Languages *</h3>
            <div className="space-y-2">
              {['English', 'Hindi', 'Spanish', 'French', 'German', 'Other'].map((language) => (
                <label key={language} className="inline-flex items-center mr-4">
                  <input
                    type="checkbox"
                    value={language}
                    checked={formData.languages.includes(language)}
                    onChange={handleLanguageChange}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2">{language}</span>
                </label>
              ))}
            </div>
          </div>

          {/* License */}
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">License (Optional)</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <input
                  name="licenseNo"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="License Number"
                  value={formData.license.licenseNo}
                  onChange={(e) => handleInputChange(e, 'license')}
                />
              </div>
              <div>
                <input
                  name="issuingAuthority"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="Issuing Authority"
                  value={formData.license.issuingAuthority}
                  onChange={(e) => handleInputChange(e, 'license')}
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Details</h3>
            <div className="space-y-4">
              <input
                name="accountNo"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Account Number"
                value={formData.bankDetails.accountNo}
                onChange={(e) => handleInputChange(e, 'bankDetails')}
              />
              <input
                name="ifscCode"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="IFSC Code"
                value={formData.bankDetails.ifscCode}
                onChange={(e) => handleInputChange(e, 'bankDetails')}
              />
              <input
                name="branchName"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Branch Name"
                value={formData.bankDetails.branchName}
                onChange={(e) => handleInputChange(e, 'bankDetails')}
              />
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resume (PDF) *
                </label>
                <input
                  name="resume"
                  type="file"
                  required
                  accept=".pdf,application/pdf"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  onChange={handleFileChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Degree Certificate (PDF) *
                </label>
                <input
                  name="degreeCertificate"
                  type="file"
                  required
                  accept=".pdf,application/pdf"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  onChange={handleFileChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Government ID (PDF) *
                </label>
                <input
                  name="governmentId"
                  type="file"
                  required
                  accept=".pdf,application/pdf"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  onChange={handleFileChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  License Certificate (PDF) - Optional
                </label>
                <input
                  name="licenseCertificate"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CounselorApplication;
