
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { toast } from 'sonner';
import Cropper from 'react-easy-crop';
import {
  Mail,
  Lock,
  User,
  Phone,
  Shield,
  CheckCircle,
  Upload,
  X,
  Loader2,
  ArrowRight,
  ArrowLeft,
  UserCircle,
  Eye,
  EyeOff,
  Camera,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
} from 'lucide-react';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {Slider} from '@/components/ui/slider'

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

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

const ClientRegister = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    profilePicture: null,
    otp: '',
  });
  const [loading, setLoading] = useState(false);

  // Image cropping states
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [isViewPhotoDialogOpen, setIsViewPhotoDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const { sendOtp, verifyOtp, clientRegister } = useClientAuth();
  const navigate = useNavigate();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const validateStep1 = () => {
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (formData.fullName.trim().length < 3 || formData.fullName.trim().length > 30) {
      toast.error('Full name must be between 3 and 30 characters');
      return false;
    }

    if (formData.username.trim().length < 3 || formData.username.trim().length > 10) {
      toast.error('Username must be between 3 and 10 characters');
      return false;
    }

    if (!passwordRegex.test(formData.password)) {
      toast.error(
        'Password must be at least 8 characters long, include uppercase, lowercase, number, and special character'
      );
      return false;
    }

    if (!phoneRegex.test(formData.phone.trim())) {
      toast.error('Please enter a valid phone number');
      return false;
    }

   

    return true;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateStep1()) return;

    setLoading(true);
    try {
      const result = await sendOtp(formData.email);
      if (result.success) {
        toast.success('Verification code sent to your email!');
        setStep(2);
      } else {
        toast.error(result.error || 'Failed to send verification code.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred while sending the OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(formData.otp)) {
      toast.error('OTP must be a 6-digit number');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtp(formData.email, formData.otp);
      if (result.success) {
        toast.success('OTP verified successfully!');
        setStep(3);
      } else {
        toast.error(result.error || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred while verifying the OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    try {
      const result = await clientRegister(formData);
      if (result.success) {
        toast.success('Registration completed successfully!');
        navigate('/client/dashboard/personal-info');
      } else {
        toast.error(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  // Image handling functions
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File Too Large', {
        description: 'Please upload an image smaller than 5MB.',
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid File Type', {
        description: 'Please upload an image file (PNG, JPG, JPEG, or WEBP).',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      setIsPhotoDialogOpen(false);
      setIsCropDialogOpen(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(image, safeArea / 2 - image.width * 0.5, safeArea / 2 - image.height * 0.5);

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        0.95
      );
    });
  };

  const handleCropConfirm = async () => {
    try {
      setLoading(true);
      const croppedImageBlob = await getCroppedImg(selectedImage, croppedAreaPixels, rotation);
      const file = new File([croppedImageBlob], 'profile-picture.jpg', {
        type: 'image/jpeg',
      });

      const previewUrl = URL.createObjectURL(file);

      setFormData((prev) => ({
        ...prev,
        profilePicture: file,
        profilePicturePreview: previewUrl,
      }));

      setIsCropDialogOpen(false);
      setSelectedImage(null);

      toast.success('Photo Selected', {
        description: 'Your profile picture has been selected successfully.',
      });
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Crop Failed', {
        description: 'Failed to crop image. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Email Verification', icon: Mail },
    { number: 2, title: 'OTP Confirmation', icon: Shield },
    { number: 3, title: 'Profile Setup', icon: User },
  ];

  const progress = (step / 3) * 100;

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
        {/* Registration Form Card - Positioned in the white/light area */}
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
                    <UserCircle className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                      Client Registration
                    </h1>
                  </div>
                </div>

                {/* Step Indicators */}
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
                            className={`absolute top-4 sm:top-5 left-1/2 w-full h-0.5 -z-10 ${
                              isCompleted ? 'bg-green-500 dark:bg-green-600' : 'bg-neutral-200 dark:bg-neutral-800'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Scrollable Form Content - Using custom scrollbar */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              <Card className="border-none shadow-3xl bg-transparent">
                <CardContent className="p-0">
                  <AnimatePresence mode="wait">
                    {/* Step 1: Email Verification */}
                    {step === 1 && (
                      <motion.form
                        key="step1"
                        variants={stepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        onSubmit={handleSendOtp}
                        className="space-y-5 p-3 sm:p-4"
                      >
                        <div className="text-center space-y-2">
                          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950/30 dark:to-primary-900/30 mb-3 shadow-md">
                            <Mail
                              className="h-7 w-7 sm:h-8 sm:w-8 text-primary-700 dark:text-primary-400"
                              aria-hidden="true"
                            />
                          </div>
                          <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-white">
                            Verify Your Email
                          </h3>
                          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                            We'll send a verification code to your email
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-neutral-900 dark:text-white font-medium text-sm sm:text-base"
                          >
                            Email Address *
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

                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full h-11 sm:h-12 bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white font-semibold shadow-lg shadow-primary-500/30 transition-all duration-200"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Sending Code...
                            </>
                          ) : (
                            <>
                              Send Verification Code
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>
                      </motion.form>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 2 && (
                      <motion.form
                        key="step2"
                        variants={stepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        onSubmit={handleVerifyOtp}
                        className="space-y-5 p-3 sm:p-4"
                      >
                        <div className="text-center space-y-2">
                          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950/30 dark:to-primary-900/30 mb-3 shadow-md">
                            <Shield
                              className="h-7 w-7 sm:h-8 sm:w-8 text-primary-700 dark:text-primary-400"
                              aria-hidden="true"
                            />
                          </div>
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
                            Verification Code *
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
                              onClick={handleSendOtp}
                              className="font-medium text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
                            >
                              Resend
                            </button>
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            type="button"
                            onClick={() => setStep(1)}
                            variant="outline"
                            className="flex-1 h-11 sm:h-12 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm sm:text-base"
                          >
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back
                          </Button>
                          <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-11 sm:h-12 bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white font-semibold shadow-lg shadow-primary-500/30"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                Verify
                                <ArrowRight className="ml-2 h-5 w-5" />
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.form>
                    )}

                    {/* Step 3: Profile Setup */}
                    {step === 3 && (
                      <motion.form
                        key="step3"
                        variants={stepVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        onSubmit={handleSubmit}
                        className="space-y-5 p-3 sm:p-4"
                      >
                        <div className="text-center space-y-2">
                          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950/30 dark:to-primary-900/30 mb-3 shadow-md">
                            <User
                              className="h-7 w-7 sm:h-8 sm:w-8 text-primary-700 dark:text-primary-400"
                              aria-hidden="true"
                            />
                          </div>
                          <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-white">
                            Complete Your Profile
                          </h3>
                          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                            Your personal details
                          </p>
                        </div>

                        {/* Profile Picture Upload */}
                        <div className="flex flex-col items-center space-y-3">
                          <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-primary-100 dark:border-primary-900/30 shadow-lg">
                            {formData.profilePicturePreview ? (
                              <AvatarImage src={formData.profilePicturePreview} alt="Profile" />
                            ) : (
                              <AvatarFallback className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950/30 dark:to-primary-900/30">
                                <UserCircle className="h-12 w-12 sm:h-14 sm:w-14 text-primary-700 dark:text-primary-400" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex gap-2">
                            {formData.profilePicturePreview && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsViewPhotoDialogOpen(true)}
                                className="text-xs"
                              >
                                <ImageIcon className="h-3 w-3 mr-1" />
                                View Photo
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setIsPhotoDialogOpen(true)}
                              className="text-xs"
                            >
                              <Camera className="h-3 w-3 mr-1" />
                              {formData.profilePicturePreview ? 'Change' : 'Upload'}
                            </Button>
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="fullName"
                              className="text-neutral-900 dark:text-white font-medium text-sm sm:text-base"
                            >
                              Full Name *
                            </Label>
                            <div className="relative">
                              <User
                                className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-neutral-400"
                                aria-hidden="true"
                              />
                              <Input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="pl-10 sm:pl-12 h-11 sm:h-12 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-primary-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="username"
                              className="text-neutral-900 dark:text-white font-medium text-sm sm:text-base"
                            >
                              Username *
                            </Label>
                            <div className="relative">
                              <User
                                className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-neutral-400"
                                aria-hidden="true"
                              />
                              <Input
                                id="username"
                                name="username"
                                type="text"
                                required
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={handleInputChange}
                                className="pl-10 sm:pl-12 h-11 sm:h-12 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-primary-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="phone"
                              className="text-neutral-900 dark:text-white font-medium text-sm sm:text-base"
                            >
                              Contact Number *
                            </Label>
                            <div className="relative">
                              <Phone
                                className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-neutral-400"
                                aria-hidden="true"
                              />
                              <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                placeholder="+1234567890"
                                value={formData.phone}
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
                              Password *
                            </Label>
                            <div className="relative">
                              <Lock
                                className="absolute  z-10 left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-neutral-400"
                                aria-hidden="true"
                              />
                              <Input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                placeholder="Create a secure password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="pl-10 sm:pl-12 pr-10 h-11 sm:h-12 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-primary-500"
                              />
                              
                            </div>
                          </div>

                          
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button
                            type="button"
                            onClick={() => setStep(2)}
                            variant="outline"
                            className="flex-1 h-10 sm:h-11 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm sm:text-base"
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
                                Registering...
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

            {/* Footer - Fixed at bottom */}
            <div className="flex-shrink-0 pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-800">
              <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-medium text-primary-700 dark:text-primary-400 hover:underline transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Dialogs */}
      {/* Photo Upload Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Upload Profile Picture</DialogTitle>
            <DialogDescription>
              Choose a photo that represents you well
            </DialogDescription>
          </DialogHeader>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                : 'border-neutral-300 dark:border-neutral-700'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-neutral-400" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Drag and drop your photo here, or
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="text-primary-700 dark:text-primary-400 border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/30"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileInput}
              className="hidden"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4">
              PNG, JPG, JPEG or WEBP (max. 5MB)
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Cropper Dialog */}
      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Crop Your Photo</DialogTitle>
            <DialogDescription>
              Adjust your photo to get the perfect profile picture
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative h-96 bg-neutral-900 rounded-lg overflow-hidden">
              {selectedImage && (
                <Cropper
                  image={selectedImage}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete}
                  cropShape="round"
                  showGrid={false}
                />
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Zoom</Label>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <ZoomOut className="h-4 w-4 text-neutral-400" />
                  <Slider
                    value={[zoom]}
                    min={1}
                    max={3}
                    step={0.1}
                    onValueChange={(value) => setZoom(value[0])}
                    className="flex-1"
                  />
                  <ZoomIn className="h-4 w-4 text-neutral-400" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Rotation</Label>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {rotation}°
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCw className="h-4 w-4 text-neutral-400" />
                  <Slider
                    value={[rotation]}
                    min={0}
                    max={360}
                    step={1}
                    onValueChange={(value) => setRotation(value[0])}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCropDialogOpen(false);
                setSelectedImage(null);
              }}
              className="border-neutral-300 dark:border-neutral-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCropConfirm}
              disabled={loading}
              className="bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Photo Dialog */}
      <Dialog open={isViewPhotoDialogOpen} onOpenChange={setIsViewPhotoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            <Avatar className="h-64 w-64 border-4 border-primary-100 dark:border-primary-900/30 shadow-xl">
              <AvatarImage src={formData.profilePicturePreview} alt="Profile" />
              <AvatarFallback>
                <UserCircle className="h-32 w-32 text-primary-700 dark:text-primary-400" />
              </AvatarFallback>
            </Avatar>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ClientRegister;
