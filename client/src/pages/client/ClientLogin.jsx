
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { toast } from 'sonner';
import {
  Mail,
  Lock,
  Shield,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  User,
} from 'lucide-react';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';

// Import your background image
import BackgroundImage from '../../assets/registerAndLogin/image.jpg';

// Animation variants
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const stepVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

const ClientLogin = () => {
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const { clientLogin, forgotPassword, resetPassword } = useClientAuth();
  const navigate = useNavigate();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateEmail = () => {
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    if (!passwordRegex.test(formData.password)) {
      toast.error(
        'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character'
      );
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail() || !validatePassword()) return;

    setLoading(true);
    try {
      const result = await clientLogin(formData.email, formData.password);
      if (result.success) {
        toast.success('Login successful!');
        navigate('/client/dashboard/personal-info');
      } else {
        toast.error(result.error || 'Invalid email or password');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSendOtp = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setLoading(true);
    setResendLoading(true);
    try {
      const result = await forgotPassword(formData.email);
      if (result.success) {
        toast.success('OTP sent to your email!');
        setStep(2);
      } else {
        toast.error(result.error || 'Failed to send OTP.');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred while sending OTP.');
    } finally {
      setLoading(false);
      setResendLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(formData.otp)) {
      toast.error('OTP must be a 6-digit number');
      return;
    }

    if (!passwordRegex.test(formData.newPassword)) {
      toast.error(
        'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character'
      );
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(formData.email, formData.otp, formData.newPassword);
      if (result.success) {
        toast.success('Password reset successfully!');
        setMode('login');
        setStep(1);
        setFormData({ email: '', password: '', otp: '', newPassword: '' });
      } else {
        toast.error(result.error || 'Failed to reset password.');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred during password reset.');
    } finally {
      setLoading(false);
    }
  };

  const switchToForgotPassword = () => {
    setMode('forgot');
    setStep(1);
    setFormData({ ...formData, otp: '', newPassword: '' });
  };

  const switchToLogin = () => {
    setMode('login');
    setStep(1);
    setFormData({ email: '', password: '', otp: '', newPassword: '' });
  };

  const steps = [
    { number: 1, title: 'Email Verification', icon: Mail },
    { number: 2, title: 'Reset Password', icon: Shield },
  ];

  return (
    <section className="relative h-screen pt-[80px] flex items-center overflow-hidden justify-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-contain bg-left bg-no-repeat"
        style={{
          backgroundImage: `url(${BackgroundImage})`,
        }}
      />

      {/* Gradient Overlay to blend right side with blue tones */}
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full h-screen flex items-center justify-end px-2 sm:px-6 md:px-10 lg:px-16 xl:px-24"
      >
        {/* Login Form Card - Positioned in the white/light area */}
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md sm:max-w-md md:max-w-lg xl:max-w-xl relative"
        >
          <div className="bg-gradient-to-br from-[#f5f7fa]/98 to-white/98 dark:bg-neutral-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#c5cbd4]/30 dark:border-neutral-800/50 p-3 sm:p-6 lg:p-8 h-[calc(100vh-100px)] flex flex-col">
            {/* Header - Fixed at top */}
            <div className="flex-shrink-0">
              <div className="flex mb-2 justify-between">
                {/* Logo/Brand */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-700 to-primary-600 dark:from-primary-600 dark:to-primary-500 flex items-center justify-center shadow-lg">
                    <User className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                      User Login
                    </h1>
                  </div>
                </div>
                {/* Step Indicators */}
                {mode === 'login' ? (
                  <></>
                ) : (
                  <div className="flex justify-between items-center mb-1">
                    {steps.map((item, index) => {
                      const Icon = item.icon;
                      const isActive = step === item.number;
                      const isCompleted = step > item.number;

                      return (
                        <div key={item.number} className="flex flex-col items-center flex-1 relative">
                          <motion.div
                            initial={false}
                            animate={{
                              scale: isActive ? 1.05 : 1,
                            }}
                            className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-300 ${
                              isCompleted
                                ? 'bg-green-500 dark:bg-green-600 shadow-md shadow-green-500/20'
                                : isActive
                                ? 'bg-gradient-to-br from-primary-700 to-primary-600 dark:from-primary-600 dark:to-primary-500 ring-3 ring-primary-100 dark:ring-primary-900/30 shadow-md shadow-primary-500/20'
                                : 'bg-neutral-200 dark:bg-neutral-800'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle
                                className="h-4 w-4 sm:h-5 sm:w-5 text-white"
                                aria-hidden="true"
                              />
                            ) : (
                              <Icon
                                className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                  isActive ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'
                                }`}
                                aria-hidden="true"
                              />
                            )}
                          </motion.div>
                          <span
                            className={`mt-1.5 text-[9px] sm:text-[10px] font-medium text-center hidden sm:block ${
                              isActive
                                ? 'text-primary-700 dark:text-primary-400'
                                : 'text-neutral-500 dark:text-neutral-400'
                            }`}
                          >
                            {item.title}
                          </span>

                          {index < steps.length - 1 && (
                            <div
                              className={`absolute top-4 sm:top-5 left-12 w-full h-0.5 -z-10 ${
                                isCompleted
                                  ? 'bg-green-500 dark:bg-green-600'
                                  : 'bg-neutral-200 dark:bg-neutral-800'
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable Form Content - Using custom scrollbar */}
            <div className="flex-1 space-y-3 pr-1">
              <Card className="border-none shadow-3xl bg-transparent">
                <CardContent className="p-0">
                  <AnimatePresence mode="wait">
                    {/* Login Mode */}
                    {mode === 'login' && (
                      <motion.form
                        key="login"
                        variants={stepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        onSubmit={handleLogin}
                        className="space-y-5 p-3 sm:p-4"
                      >
                        <div className="text-center space-y-2">
                          <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-white">
                            Welcome Back
                          </h3>
                          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                            Sign in to access your dashboard
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-neutral-900 dark:text-white font-medium text-sm sm:text-base"
                          >
                            Email Address
                          </Label>
                          <div className="relative">
                            <Mail
                              className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-neutral-400"
                              aria-hidden="true"
                            />
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              required
                              placeholder="your.email@example.com"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="pl-10 sm:pl-12 h-11 sm:h-12 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-primary-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="password"
                            className="text-neutral-900 dark:text-white font-medium text-sm sm:text-base"
                          >
                            Password
                          </Label>
                          <div className="relative">
                            <Lock
                              className="z-10 absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-neutral-400"
                              aria-hidden="true"
                            />
                            <Input
                              id="password"
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              required
                              placeholder="Enter your password"
                              value={formData.password}
                              onChange={handleInputChange}
                              className="pl-10 sm:pl-12 h-11 sm:h-12 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-primary-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={switchToForgotPassword}
                            className="text-sm font-medium text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
                          >
                            Forgot password?
                          </button>
                        </div>

                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full h-11 sm:h-12 bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white font-semibold shadow-lg shadow-primary-500/30 transition-all duration-200"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            <>
                              Sign In
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-300 dark:border-neutral-700" />
                          </div>
                        </div>

                        <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                          Don't have an account?{' '}
                          <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="font-medium text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
                          >
                            Sign up here
                          </button>
                        </p>
                      </motion.form>
                    )}

                    {/* Forgot Password Mode - Step 1: Email */}
                    {mode === 'forgot' && step === 1 && (
                      <motion.form
                        key="forgot-step-1"
                        variants={stepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        onSubmit={handleForgotPasswordSendOtp}
                        className="space-y-5 p-3 sm:p-4"
                      >
                        <div className="text-center space-y-2">
                          <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-white">
                            Reset Your Password
                          </h3>
                          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                            We'll send a verification code to your email
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="forgot-email"
                            className="text-neutral-900 dark:text-white font-medium text-sm sm:text-base"
                          >
                            Email Address
                          </Label>
                          <div className="relative">
                            <Mail
                              className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-neutral-400"
                              aria-hidden="true"
                            />
                            <Input
                              id="forgot-email"
                              name="email"
                              type="email"
                              required
                              placeholder="your.email@example.com"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="pl-10 sm:pl-12 h-11 sm:h-12 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-primary-500"
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button
                            type="button"
                            onClick={switchToLogin}
                            variant="outline"
                            className="flex-1 h-10 sm:h-11 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                          </Button>
                          <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-10 sm:h-11 bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white font-semibold shadow-lg shadow-primary-500/30"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                Send Code
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.form>
                    )}

                    {/* Forgot Password Mode - Step 2: OTP & New Password */}
                    {mode === 'forgot' && step === 2 && (
                      <motion.form
                        key="forgot-step-2"
                        variants={stepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        onSubmit={handleResetPassword}
                        className="space-y-5 p-3 sm:p-4"
                      >
                        <div className="text-center space-y-2">
                          <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-white">
                            Enter Verification Code
                          </h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Code sent to
                          </p>
                          <p className="text-sm font-medium text-primary-700 dark:text-primary-400">
                            {formData.email}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-neutral-900 dark:text-white font-medium text-sm sm:text-base block text-center">
                            Verification Code
                          </Label>
                          <div className="flex justify-center">
                            <InputOTP
                              maxLength={6}
                              value={formData.otp}
                              onChange={(value) => setFormData({ ...formData, otp: value })}
                            >
                              <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                              </InputOTPGroup>
                              <InputOTPSeparator />
                              <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                          <p className="text-center text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-3">
                            Didn't receive?{' '}
                            <button
                              type="button"
                              onClick={handleForgotPasswordSendOtp}
                              disabled={resendLoading}
                              className="font-medium text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors disabled:opacity-50"
                            >
                              Resend
                            </button>
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="newPassword"
                            className="text-neutral-900 dark:text-white font-medium text-sm sm:text-base"
                          >
                            New Password
                          </Label>
                          <div className="relative">
                            <Lock
                              className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-neutral-400"
                              aria-hidden="true"
                            />
                            <Input
                              id="newPassword"
                              name="newPassword"
                              type={showNewPassword ? 'text' : 'password'}
                              required
                              placeholder="Enter new password"
                              value={formData.newPassword}
                              onChange={handleInputChange}
                              className="pl-10 sm:pl-12 h-11 sm:h-12 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-primary-500"
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button
                            type="button"
                            onClick={() => setStep(1)}
                            variant="outline"
                            className="flex-1 h-10 sm:h-11 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                          </Button>
                          <Button
                            type="submit"
                            disabled={loading || resendLoading}
                            className="flex-1 h-10 sm:h-11 bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white font-semibold shadow-lg shadow-primary-500/30"
                          >
                            {resendLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Resending...
                              </>
                            ) : loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Resetting...
                              </>
                            ) : (
                              <>
                                Complete
                                <CheckCircle className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ClientLogin;
