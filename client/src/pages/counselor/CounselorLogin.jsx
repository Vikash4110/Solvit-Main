// import { motion } from 'framer-motion';
// import { Eye, EyeOff, Key, Lock, Mail } from 'lucide-react';
// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { toast } from 'sonner';
// import { Link, useNavigate } from 'react-router-dom';
// import loginImage from '../../assets/core/login.png';
// import { useCounselorAuth } from '../../contexts/CounselorAuthContext';

// const CounselorAuth = () => {
//   const [mode, setMode] = useState('login'); // "login", "forgot", or "reset"
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const { counselorLogin, forgotPassword, resetPassword } = useCounselorAuth();
//   const navigate = useNavigate();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//     watch,
//     getValues,
//   } = useForm();

//   // Password validation regex
//   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

//   // Email validation regex
//   const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

//   const handleLoginSubmit = async (data) => {
//     setIsLoading(true);
//     try {
//       // Validate email format
//       if (!emailRegex.test(data.email)) {
//         toast.error('Please enter a valid email address');
//         setIsLoading(false);
//         return;
//       }

//       // Validate password format
//       if (!passwordRegex.test(data.password)) {
//         toast.error(
//           'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character'
//         );
//         setIsLoading(false);
//         return;
//       }

//       const result = await counselorLogin(data.email, data.password);
//       if (result.success) {
//         toast.success('Login successful!');
//         navigate('/counselor/dashboard');
//       } else {
//         toast.error(result.error || 'Invalid email or password');
//       }
//     } catch (err) {
//       console.error('Login error:', err);
//       toast.error('An unexpected error occurred. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleForgotPasswordSubmit = async (data) => {
//     setIsLoading(true);
//     try {
//       if (!emailRegex.test(data.email)) {
//         toast.error('Please enter a valid email address');
//         setIsLoading(false);
//         return;
//       }

//       const result = await forgotPassword(data.email);
//       if (result.success) {
//         toast.success('OTP sent to your email. Please check your inbox.');
//         setMode('reset');
//         // Keep email in the form for reset password
//         reset({
//           email: data.email,
//           otp: '',
//           newPassword: '',
//           confirmPassword: '',
//         });
//       } else {
//         toast.error(result.error || 'Failed to send OTP');
//       }
//     } catch (err) {
//       console.error('Forgot password error:', err);
//       toast.error('Failed to send OTP. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleResetPasswordSubmit = async (data) => {
//     setIsLoading(true);
//     try {
//       // Validate OTP
//       if (!data.otp || data.otp.length !== 6) {
//         toast.error('Please enter a valid 6-digit OTP');
//         setIsLoading(false);
//         return;
//       }

//       // Validate new password
//       if (!passwordRegex.test(data.newPassword)) {
//         toast.error(
//           'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character'
//         );
//         setIsLoading(false);
//         return;
//       }

//       // Check if passwords match
//       if (data.newPassword !== data.confirmPassword) {
//         toast.error('Passwords do not match');
//         setIsLoading(false);
//         return;
//       }

//       const result = await resetPassword(data.email, data.otp, data.newPassword);
//       if (result.success) {
//         toast.success('Password reset successfully. Redirecting to login...');
//         setTimeout(() => {
//           setMode('login');
//           reset({
//             email: '',
//             password: '',
//             otp: '',
//             newPassword: '',
//             confirmPassword: '',
//           });
//         }, 2000);
//       } else {
//         toast.error(result.error || 'Failed to reset password');
//       }
//     } catch (err) {
//       console.error('Reset password error:', err);
//       toast.error('Failed to reset password. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleModeChange = (newMode) => {
//     setMode(newMode);
//     reset({
//       email: newMode === 'reset' ? getValues('email') : '',
//       password: '',
//       otp: '',
//       newPassword: '',
//       confirmPassword: '',
//     });
//   };

//   const bgVariants = {
//     animate: {
//       backgroundPosition: ['0% 0%', '100% 100%'],
//       transition: {
//         duration: 20,
//         ease: 'linear',
//         repeat: Infinity,
//         repeatType: 'reverse',
//       },
//     },
//   };

//   const formVariants = {
//     hidden: { opacity: 0, y: 50 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.8, ease: 'easeOut' },
//     },
//   };

//   const inputVariants = {
//     hidden: { opacity: 0, x: -20 },
//     visible: { opacity: 1, x: 0 },
//   };

//   const getFormTitle = () => {
//     switch (mode) {
//       case 'login':
//         return 'Counselor Sign In';
//       case 'forgot':
//         return 'Counselor Forgot Password';
//       case 'reset':
//         return 'Counselor Reset Password';
//       default:
//         return 'Counselor Sign In';
//     }
//   };

//   const getFormDescription = () => {
//     switch (mode) {
//       case 'login':
//         return (
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Or{' '}
//             <Link
//               to="/counselor/register"
//               className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
//             >
//               create a new counselor account
//             </Link>
//           </p>
//         );
//       case 'forgot':
//         return (
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Enter your email to receive a password reset OTP
//           </p>
//         );
//       case 'reset':
//         return (
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Enter the OTP and your new password
//           </p>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <motion.div
//       className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col lg:flex-row items-center justify-center px-4 lg:px-10 overflow-hidden"
//       variants={bgVariants}
//       animate="animate"
//       style={{ backgroundSize: '200% 200%' }}
//     >
//       <motion.div
//         className="hidden lg:flex w-1/2 justify-center"
//         initial={{ opacity: 0, x: -100 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 0.8, ease: 'easeOut' }}
//       >
//         <img
//           src={loginImage}
//           alt="Counselor Authentication"
//           className="w-3/4 h-auto object-contain"
//         />
//       </motion.div>

//       <motion.div
//         className="w-full lg:w-1/2 flex justify-center"
//         variants={formVariants}
//         initial="hidden"
//         animate="visible"
//       >
//         <div className="w-full max-w-md mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
//           <motion.h2
//             className="text-4xl font-extrabold text-indigo-600 text-center mb-8 tracking-tight"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2, duration: 0.6 }}
//           >
//             {getFormTitle()}
//           </motion.h2>
//           {getFormDescription()}

//           <form
//             className="mt-8 space-y-6"
//             onSubmit={handleSubmit(
//               mode === 'login'
//                 ? handleLoginSubmit
//                 : mode === 'forgot'
//                   ? handleForgotPasswordSubmit
//                   : handleResetPasswordSubmit
//             )}
//             noValidate
//           >
//             <div className="space-y-4">
//               {/* Email Field */}
//               <motion.div
//                 variants={inputVariants}
//                 initial="hidden"
//                 animate="visible"
//                 transition={{ delay: 0.3, duration: 0.5 }}
//               >
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Mail className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="email"
//                     type="email"
//                     autoComplete="email"
//                     {...register('email', {
//                       required: 'Email is required',
//                       pattern: {
//                         value: emailRegex,
//                         message: 'Invalid email address',
//                       },
//                     })}
//                     className={`appearance-none block w-full px-3 py-3 pl-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm shadow-sm transition-colors ${
//                       errors.email
//                         ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
//                         : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-600'
//                     }`}
//                     placeholder="Enter your email"
//                     disabled={mode === 'reset'}
//                   />
//                 </div>
//                 {errors.email && (
//                   <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
//                 )}
//               </motion.div>

//               {/* Password Field (Login Mode) */}
//               {mode === 'login' && (
//                 <motion.div
//                   variants={inputVariants}
//                   initial="hidden"
//                   animate="visible"
//                   transition={{ delay: 0.4, duration: 0.5 }}
//                 >
//                   <label
//                     htmlFor="password"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Password
//                   </label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <Lock className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="password"
//                       type={showPassword ? 'text' : 'password'}
//                       autoComplete="current-password"
//                       {...register('password', {
//                         required: 'Password is required',
//                         minLength: {
//                           value: 8,
//                           message: 'Password must be at least 8 characters',
//                         },
//                       })}
//                       className={`appearance-none block w-full px-3 py-3 pl-10 pr-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm shadow-sm transition-colors ${
//                         errors.password
//                           ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
//                           : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-600'
//                       }`}
//                       placeholder="Enter your password"
//                     />
//                     <button
//                       type="button"
//                       className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? (
//                         <EyeOff className="h-5 w-5 text-gray-400" />
//                       ) : (
//                         <Eye className="h-5 w-5 text-gray-400" />
//                       )}
//                     </button>
//                   </div>
//                   {errors.password && (
//                     <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
//                   )}
//                 </motion.div>
//               )}

//               {/* OTP Field (Reset Mode) */}
//               {mode === 'reset' && (
//                 <motion.div
//                   variants={inputVariants}
//                   initial="hidden"
//                   animate="visible"
//                   transition={{ delay: 0.4, duration: 0.5 }}
//                 >
//                   <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
//                     OTP
//                   </label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                       <Key className="h-5 w-5 text-gray-400" />
//                     </div>
//                     <input
//                       id="otp"
//                       type="text"
//                       maxLength={6}
//                       {...register('otp', {
//                         required: 'OTP is required',
//                         pattern: {
//                           value: /^\d{6}$/,
//                           message: 'OTP must be a 6-digit number',
//                         },
//                       })}
//                       className={`appearance-none block w-full px-3 py-3 pl-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm shadow-sm transition-colors ${
//                         errors.otp
//                           ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
//                           : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-600'
//                       }`}
//                       placeholder="Enter 6-digit OTP"
//                     />
//                   </div>
//                   {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>}
//                 </motion.div>
//               )}

//               {/* New Password and Confirm Password Fields (Reset Mode) */}
//               {mode === 'reset' && (
//                 <>
//                   <motion.div
//                     variants={inputVariants}
//                     initial="hidden"
//                     animate="visible"
//                     transition={{ delay: 0.5, duration: 0.5 }}
//                   >
//                     <label
//                       htmlFor="newPassword"
//                       className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                       New Password
//                     </label>
//                     <div className="relative">
//                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <Lock className="h-5 w-5 text-gray-400" />
//                       </div>
//                       <input
//                         id="newPassword"
//                         type={showPassword ? 'text' : 'password'}
//                         {...register('newPassword', {
//                           required: 'New password is required',
//                           minLength: {
//                             value: 8,
//                             message: 'Password must be at least 8 characters',
//                           },
//                           pattern: {
//                             value: passwordRegex,
//                             message:
//                               'Password must include uppercase, lowercase, number, and special character',
//                           },
//                         })}
//                         className={`appearance-none block w-full px-3 py-3 pl-10 pr-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm shadow-sm transition-colors ${
//                           errors.newPassword
//                             ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
//                             : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-600'
//                         }`}
//                         placeholder="Enter new password"
//                       />
//                       <button
//                         type="button"
//                         className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
//                         onClick={() => setShowPassword(!showPassword)}
//                       >
//                         {showPassword ? (
//                           <EyeOff className="h-5 w-5 text-gray-400" />
//                         ) : (
//                           <Eye className="h-5 w-5 text-gray-400" />
//                         )}
//                       </button>
//                     </div>
//                     {errors.newPassword && (
//                       <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
//                     )}
//                   </motion.div>

//                   <motion.div
//                     variants={inputVariants}
//                     initial="hidden"
//                     animate="visible"
//                     transition={{ delay: 0.6, duration: 0.5 }}
//                   >
//                     <label
//                       htmlFor="confirmPassword"
//                       className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                       Confirm Password
//                     </label>
//                     <div className="relative">
//                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <Lock className="h-5 w-5 text-gray-400" />
//                       </div>
//                       <input
//                         id="confirmPassword"
//                         type={showConfirmPassword ? 'text' : 'password'}
//                         {...register('confirmPassword', {
//                           required: 'Confirm password is required',
//                           validate: (value) =>
//                             value === watch('newPassword') || 'Passwords do not match',
//                         })}
//                         className={`appearance-none block w-full px-3 py-3 pl-10 pr-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm shadow-sm transition-colors ${
//                           errors.confirmPassword
//                             ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
//                             : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-600'
//                         }`}
//                         placeholder="Confirm new password"
//                       />
//                       <button
//                         type="button"
//                         className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
//                         onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                       >
//                         {showConfirmPassword ? (
//                           <EyeOff className="h-5 w-5 text-gray-400" />
//                         ) : (
//                           <Eye className="h-5 w-5 text-gray-400" />
//                         )}
//                       </button>
//                     </div>
//                     {errors.confirmPassword && (
//                       <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
//                     )}
//                   </motion.div>
//                 </>
//               )}
//             </div>

//             {/* Navigation Links */}
//             {mode === 'login' && (
//               <motion.div
//                 className="text-sm text-right"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.5, duration: 0.5 }}
//               >
//                 <button
//                   type="button"
//                   onClick={() => handleModeChange('forgot')}
//                   className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
//                 >
//                   Forgot your password?
//                 </button>
//               </motion.div>
//             )}

//             {(mode === 'forgot' || mode === 'reset') && (
//               <motion.p
//                 className="text-sm text-center text-gray-600 cursor-pointer hover:text-indigo-600 transition-colors"
//                 onClick={() => handleModeChange('login')}
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.7, duration: 0.5 }}
//               >
//                 Back to{' '}
//                 <span className="font-medium text-indigo-600 hover:text-indigo-500">Login</span>
//               </motion.p>
//             )}

//             {/* Submit Button */}
//             <motion.div
//               variants={inputVariants}
//               initial="hidden"
//               animate="visible"
//               transition={{ delay: 0.6, duration: 0.5 }}
//               className="pt-4"
//             >
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="group relative w-full flex justify-center py-3 px-6 border border-transparent rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all duration-200"
//               >
//                 {isLoading ? (
//                   <div className="flex items-center">
//                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                     Processing...
//                   </div>
//                 ) : mode === 'login' ? (
//                   'Sign In'
//                 ) : mode === 'forgot' ? (
//                   'Send OTP'
//                 ) : (
//                   'Reset Password'
//                 )}
//               </button>
//             </motion.div>
//           </form>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default CounselorAuth;

import { motion } from 'framer-motion';
import { Eye, EyeOff, Key, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import loginImage from '../../assets/core/login.png';
import { useCounselorAuth } from '../../contexts/CounselorAuthContext';

const CounselorAuth = () => {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { counselorLogin, forgotPassword, resetPassword } = useCounselorAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    getValues,
  } = useForm();

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  // In CounselorAuth.js - handleLoginSubmit function
  const handleLoginSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (!emailRegex.test(data.email)) {
        toast.error('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      if (!passwordRegex.test(data.password)) {
        toast.error(
          'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character'
        );
        setIsLoading(false);
        return;
      }

      const result = await counselorLogin(data.email, data.password);
      if (result.success) {
        toast.success('Login successful!');

        // Redirect based on application status
        const counselorData = result.data;

        // FIX: Handle 'not_submitted' status
        if (
          !counselorData.applicationStatus ||
          counselorData.applicationStatus === 'not_submitted'
        ) {
          navigate('/counselor/application');
        } else if (counselorData.applicationStatus === 'pending') {
          navigate('/counselor/application-status');
        } else if (counselorData.applicationStatus === 'approved') {
          navigate('/counselor/dashboard');
        } else if (counselorData.applicationStatus === 'rejected') {
          navigate('/counselor/application-status');
        } else {
          // Fallback
          navigate('/counselor/application');
        }
      } else {
        toast.error(result.error || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (!emailRegex.test(data.email)) {
        toast.error('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      const result = await forgotPassword(data.email);
      if (result.success) {
        toast.success('OTP sent to your email. Please check your inbox.');
        setMode('reset');
        reset({
          email: data.email,
          otp: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(result.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (!data.otp || data.otp.length !== 6) {
        toast.error('Please enter a valid 6-digit OTP');
        setIsLoading(false);
        return;
      }

      if (!passwordRegex.test(data.newPassword)) {
        toast.error(
          'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character'
        );
        setIsLoading(false);
        return;
      }

      if (data.newPassword !== data.confirmPassword) {
        toast.error('Passwords do not match');
        setIsLoading(false);
        return;
      }

      const result = await resetPassword(data.email, data.otp, data.newPassword);
      if (result.success) {
        toast.success('Password reset successfully. Redirecting to login...');
        setTimeout(() => {
          setMode('login');
          reset({
            email: '',
            password: '',
            otp: '',
            newPassword: '',
            confirmPassword: '',
          });
        }, 2000);
      } else {
        toast.error(result.error || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    reset({
      email: newMode === 'reset' ? getValues('email') : '',
      password: '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const bgVariants = {
    animate: {
      backgroundPosition: ['0% 0%', '100% 100%'],
      transition: {
        duration: 20,
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'reverse',
      },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const getFormTitle = () => {
    switch (mode) {
      case 'login':
        return 'Counselor Sign In';
      case 'forgot':
        return 'Counselor Forgot Password';
      case 'reset':
        return 'Counselor Reset Password';
      default:
        return 'Counselor Sign In';
    }
  };

  const getFormDescription = () => {
    switch (mode) {
      case 'login':
        return (
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/counselor/register"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              create a new counselor account
            </Link>
          </p>
        );
      case 'forgot':
        return (
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email to receive a password reset OTP
          </p>
        );
      case 'reset':
        return (
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the OTP and your new password
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col lg:flex-row items-center justify-center px-4 lg:px-10 overflow-hidden"
      variants={bgVariants}
      animate="animate"
      style={{ backgroundSize: '200% 200%' }}
    >
      <motion.div
        className="hidden lg:flex w-1/2 justify-center"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <img
          src={loginImage}
          alt="Counselor Authentication"
          className="w-3/4 h-auto object-contain"
        />
      </motion.div>

      <motion.div
        className="w-full lg:w-1/2 flex justify-center"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="w-full max-w-md mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
          <motion.h2
            className="text-4xl font-extrabold text-indigo-600 text-center mb-8 tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {getFormTitle()}
          </motion.h2>
          {getFormDescription()}

          <form
            className="mt-8 space-y-6"
            onSubmit={handleSubmit(
              mode === 'login'
                ? handleLoginSubmit
                : mode === 'forgot'
                  ? handleForgotPasswordSubmit
                  : handleResetPasswordSubmit
            )}
            noValidate
          >
            <div className="space-y-4">
              {/* Email Field */}
              <motion.div
                variants={inputVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: emailRegex,
                        message: 'Invalid email address',
                      },
                    })}
                    className={`appearance-none block w-full px-3 py-3 pl-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm shadow-sm transition-colors ${
                      errors.email
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-600'
                    }`}
                    placeholder="Enter your email"
                    disabled={mode === 'reset'}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </motion.div>

              {/* Password Field (Login Mode) */}
              {mode === 'login' && (
                <motion.div
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters',
                        },
                      })}
                      className={`appearance-none block w-full px-3 py-3 pl-10 pr-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm shadow-sm transition-colors ${
                        errors.password
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-600'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </motion.div>
              )}

              {/* OTP Field (Reset Mode) */}
              {mode === 'reset' && (
                <motion.div
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    OTP
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="otp"
                      type="text"
                      maxLength={6}
                      {...register('otp', {
                        required: 'OTP is required',
                        pattern: {
                          value: /^\d{6}$/,
                          message: 'OTP must be a 6-digit number',
                        },
                      })}
                      className={`appearance-none block w-full px-3 py-3 pl-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm shadow-sm transition-colors ${
                        errors.otp
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-600'
                      }`}
                      placeholder="Enter 6-digit OTP"
                    />
                  </div>
                  {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>}
                </motion.div>
              )}

              {/* New Password and Confirm Password Fields (Reset Mode) */}
              {mode === 'reset' && (
                <>
                  <motion.div
                    variants={inputVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        {...register('newPassword', {
                          required: 'New password is required',
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters',
                          },
                          pattern: {
                            value: passwordRegex,
                            message:
                              'Password must include uppercase, lowercase, number, and special character',
                          },
                        })}
                        className={`appearance-none block w-full px-3 py-3 pl-10 pr-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm shadow-sm transition-colors ${
                          errors.newPassword
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-600'
                        }`}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                    )}
                  </motion.div>

                  <motion.div
                    variants={inputVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('confirmPassword', {
                          required: 'Confirm password is required',
                          validate: (value) =>
                            value === watch('newPassword') || 'Passwords do not match',
                        })}
                        className={`appearance-none block w-full px-3 py-3 pl-10 pr-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm shadow-sm transition-colors ${
                          errors.confirmPassword
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-600'
                        }`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </motion.div>
                </>
              )}
            </div>

            {/* Navigation Links */}
            {mode === 'login' && (
              <motion.div
                className="text-sm text-right"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <button
                  type="button"
                  onClick={() => handleModeChange('forgot')}
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Forgot your password?
                </button>
              </motion.div>
            )}

            {(mode === 'forgot' || mode === 'reset') && (
              <motion.p
                className="text-sm text-center text-gray-600 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => handleModeChange('login')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                Back to{' '}
                <span className="font-medium text-indigo-600 hover:text-indigo-500">Login</span>
              </motion.p>
            )}

            {/* Submit Button */}
            <motion.div
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.6, duration: 0.5 }}
              className="pt-4"
            >
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-6 border border-transparent rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : mode === 'login' ? (
                  'Sign In'
                ) : mode === 'forgot' ? (
                  'Send OTP'
                ) : (
                  'Reset Password'
                )}
              </button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CounselorAuth;
