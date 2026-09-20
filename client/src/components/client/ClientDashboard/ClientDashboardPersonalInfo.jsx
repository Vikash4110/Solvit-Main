import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Cropper from 'react-easy-crop';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Heart,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Clock,
  Crown,
  Languages,
  Upload,
  Loader2,
  Eye,
  Pencil,
  Image as ImageIcon,
  AlertTriangle,
  Sparkles,
  RotateCw,
  Check,
  Globe,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import LocationDetector from '../../general/LocationDetector';
import { DEFAULT_LANGUAGES } from '../../../constants/constants';

// shadcn/ui imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { TIMEZONE } from '../../../constants/constants';
import { API_ENDPOINTS } from '@/config/api';
import api from '@/lib/axios';

// Configure Day.js plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

//const topics
const topics = [
  "Stress Management",
  "Anxiety",
  "Depression",
  "Emotional Well-being",
  "Self-esteem & Confidence",
  "Anger Management",
  "Mindfulness & Meditation",
  "Burnout Recovery",
  "Coping with Change",
  "Overthinking & Mental Clarity",
  "Grief & Loss Support",
  "Building Resilience",
  "Inner Peace & Self-Reflection",
  "Career Planning",
  "Career Change Guidance",
  "Job Search Support",
  "Resume & Interview Preparation",
  "Workplace Stress",
  "Professional Growth & Development",
  "Leadership & Communication Skills",
  "Work-Life Balance",
  "Decision-Making Support",
  "Relationship Issues",
  "Family Conflicts",
  "Parenting Support",
  "Couples Therapy",
  "Marriage Counselling",
  "Communication Improvement",
  "Life Purpose & Goal Setting",
  "Motivation & Productivity",
  "Building Healthy Habits",
  "Time Management",
  "Self-Discovery",
  "Financial Planning",
  "Budgeting",
  "Debt Management",
  "Savings & Investments",
  "Money-related Stress",
  "Academic Guidance",
  "Study Techniques",
  "Exam Preparation",
  "Course or Major Selection",
  "Student Motivation",
  "Health & Wellness",
  "Nutrition & Diet",
  "Fitness Motivation",
  "Sleep & Lifestyle Balance",
  "Body Image & Self-Care"
];

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
  transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

const ClientDashboardPersonalInfo = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [isViewPhotoDialogOpen, setIsViewPhotoDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [profileCompleteness, setProfileCompleteness] = useState(null);

  // Cropper states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const fileInputRef = useRef(null);

  const [clientData, setClientData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [customLanguageInput, setCustomLanguageInput] = useState('');

  const handleAddCustomLanguage = (e) => {
    if (e) e.preventDefault();
    const trimmed = customLanguageInput.trim();
    if (!trimmed) return;
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    const currentLangs = formData?.preferredLanguages || [];
    if (currentLangs.some((l) => l.toLowerCase() === formatted.toLowerCase())) {
      toast.info(`${formatted} is already in your selected languages`);
      setCustomLanguageInput('');
      return;
    }
    const updated = [...currentLangs, formatted];
    handleInputChange('preferredLanguages', updated);
    setCustomLanguageInput('');
    toast.success(`Added ${formatted} to preferred languages`);
  };

  const handleRemoveCustomLanguage = (langToRemove) => {
    const currentLangs = formData?.preferredLanguages || [];
    const updated = currentLangs.filter((l) => l !== langToRemove);
    handleInputChange('preferredLanguages', updated);
  };

  // Fetch client data and profile completeness
  useEffect(() => {
    fetchClientData();
    fetchProfileCompleteness();
  }, []);

  const fetchClientData = async () => {
    setIsFetching(true);
    setError(null);

    try {
      const response = await api.get(API_ENDPOINTS.CLIENT_PROFILE_GET_AND_UPDATE);
      const result = response.data;
      const data = result?.data || result;

      const transformedData = {
        fullName: data?.fullName ,
        username: data?.username,        
        email: data?.email,
        phone: data?.phone,
        gender: data?.gender,
        profilePicture: data?.profilePicture || '',
        preferredLanguages: data?.preferredLanguages || [],
        bio: data?.bio ? (data.bio.charAt(0).toUpperCase() + data.bio.slice(1)) : '',
        address: {
          city: data?.address?.city || '',
          area: data?.address?.area || '',
          pincode: data?.address?.pincode || '',
        },
        prefferedTopics: data?.prefferedTopics || [],
        lastLogin: data?.lastLogin,
        createdAt: data?.createdAt,
      };

      setClientData(transformedData);
      setFormData(transformedData);
    } catch (err) {
      console.error('Error fetching client data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load profile data');

      toast.error('Failed to Load Profile', {
        description: 'Unable to fetch your profile data. Please try again.',
      });
    } finally {
      setIsFetching(false);
    }
  };

  const fetchProfileCompleteness = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CLIENT_PROFILE_COMPLETENESS_VALIDATE);
      const result = response.data;
      setProfileCompleteness(result.data || result);
    } catch (err) {
      console.error('Error fetching profile completeness:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);

    try {
      await api.put(API_ENDPOINTS.CLIENT_PROFILE_GET_AND_UPDATE, formData);

      setClientData(formData);
      setIsEditDialogOpen(false);

      fetchProfileCompleteness();

      toast.success('Profile Updated Successfully', {
        description: 'Your personal information has been saved.',
      });
    } catch (err) {
      console.error('Error updating profile:', err);

      toast.error('Update Failed', {
        description: err.response?.data?.message || err.message || 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      setIsLoading(true);

      const croppedImageBlob = await getCroppedImg(selectedImage, croppedAreaPixels, rotation);

      const file = new File([croppedImageBlob], 'profile-picture.jpg', {
        type: 'image/jpeg',
      });

      await uploadPhoto(file);

      setIsCropDialogOpen(false);
      setSelectedImage(null);
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Crop Failed', {
        description: 'Failed to crop image. Please try again.',
      });
      setIsLoading(false);
    }
  };

  const uploadPhoto = async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await api.put(
        API_ENDPOINTS.CLIENT_PROFILE_PROFILEPICTURE_UPDATE_DELETE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const result = response.data;
      const data = result.data || result;

      const newProfilePicture = data.profilePicture;
      
      const storedClientData = JSON.parse(localStorage.getItem("client") || "{}");
      storedClientData.profilePicture = newProfilePicture;
      localStorage.setItem("client", JSON.stringify(storedClientData));

      setClientData((prev) => ({
        ...prev,
        profilePicture: newProfilePicture,
      }));

      setFormData((prev) => ({
        ...prev,
        profilePicture: newProfilePicture,
      }));

      fetchProfileCompleteness();

      toast.success('Photo Updated', {
        description: 'Your profile picture has been changed successfully.',
      });
    } catch (err) {
      console.error('Error uploading photo:', err);

      toast.error('Upload Failed', {
        description: err.message || 'Failed to upload photo. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Day.js date formatting functions
  const formatDate = (utcDate) => {
    if (!utcDate) return 'N/A';
    return dayjs.utc(utcDate).tz(TIMEZONE).format('DD MMMM YYYY');
  };

  const formatDateTime = (utcDate) => {
    if (!utcDate) return 'N/A';
    return dayjs.utc(utcDate).tz(TIMEZONE).format('DD MMM YYYY, hh:mm A');
  };

  const formatSmartDate = (utcDate) => {
    if (!utcDate) return 'N/A';

    const date = dayjs.utc(utcDate).tz(TIMEZONE);
    const now = dayjs().tz(TIMEZONE);

    if (date.isSame(now, 'day')) {
      return `Today at ${date.format('hh:mm A')}`;
    }

    if (date.isSame(now.subtract(1, 'day'), 'day')) {
      return `Yesterday at ${date.format('hh:mm A')}`;
    }

    if (date.isAfter(now.subtract(7, 'day'))) {
      return date.format('dddd at hh:mm A');
    }

    return date.format('DD MMM YYYY, hh:mm A');
  };

  const getTimezoneInfo = () => {
    const now = dayjs().tz(TIMEZONE);
    return {
      timezone: TIMEZONE,
      offset: now.format('Z'),
    };
  };

  const hasAddress =
    clientData?.address?.city || clientData?.address?.area || clientData?.address?.pincode;

  // Loading skeleton
  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-40 w-40 lg:h-48 lg:w-48 rounded-full mb-4" />
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-24 mb-3" />
                    <Skeleton className="h-6 w-28 mb-4" />
                    <Skeleton className="h-20 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !clientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <div className="flex flex-col gap-4">
                <p>{error}</p>
                <Button onClick={fetchClientData} variant="outline" size="sm" className="w-fit">
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return null;
  }

  const timezoneInfo = getTimezoneInfo();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div variants={fadeInUp} className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#1c3c63] to-[#2563eb] rounded-xl">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1c3c63] dark:text-white tracking-tight">
                  Personal Information
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                  Manage your profile and preferences
                </p>
              </div>
            </div>

            {/* Profile Completeness Badge */}
            {profileCompleteness && !profileCompleteness.isComplete &&(
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl p-3 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      Profile Completeness
                    </span>
                  </div>
                  <Progress value={profileCompleteness.completionPercentage} className="h-2 w-32" />
                </div>
                <div className="text-2xl font-bold text-[#1c3c63] dark:text-white">
                  {profileCompleteness.completionPercentage}%
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <motion.div variants={fadeInUp} className="lg:col-span-1">
            <Card className="border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl bg-white dark:bg-slate-900 transition-all duration-300">
              <CardContent className="p-6 sm:p-7">
                <div className="flex flex-col items-center">
                  {/* Top Circular Profile Picture with Camera Action */}
                  <div className="relative group mb-4">
                    <Avatar className="h-32 w-32 sm:h-36 sm:w-36 ring-4 ring-blue-500/20 dark:ring-blue-400/20 shadow-xl transition-all duration-300 rounded-full border-2 border-white dark:border-slate-800">
                      <AvatarImage
                        src={clientData.profilePicture}
                        alt={clientData.fullName}
                        className="object-cover rounded-full"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-[#1c3c63] to-[#2563eb] text-white font-bold text-4xl rounded-full">
                        {clientData.fullName?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute bottom-0 right-1 h-10 w-10 rounded-full shadow-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-2 border-white dark:border-slate-800 transition-all hover:scale-110 flex items-center justify-center cursor-pointer"
                          title="Change or view profile photo"
                        >
                          <Camera className="h-4.5 w-4.5 text-slate-700 dark:text-slate-200" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 shadow-lg rounded-xl z-50">
                        <DropdownMenuItem
                          onClick={() => setIsViewPhotoDialogOpen(true)}
                          disabled={!clientData.profilePicture}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Photo
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setIsPhotoDialogOpen(true)}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Update Photo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Name and Username */}
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center tracking-tight">
                    {clientData.fullName}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1 mb-3.5">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      @{clientData.username}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-0.5">
                      <Shield className="w-3 h-3 inline" /> Verified
                    </span>
                  </div>

                  {/* Bio */}
                  {clientData.bio &&
                  clientData.bio.trim() !== '' &&
                  clientData.bio.toLowerCase() !== 'undefined' &&
                  clientData.bio.toLowerCase() !== 'null' ? (
                    <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 text-center mb-4">
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-normal line-clamp-3 leading-relaxed">
                        {clientData.bio.trim()}
                      </p>
                    </div>
                  ) : (
                    <div className="w-full py-1.5 text-center mb-3">
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                        No bio added yet
                      </p>
                    </div>
                  )}

                  {/* Quick Stats with Modern Cards */}
                  <div className="grid grid-cols-2 gap-2.5 w-full mb-5">
                    <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-center space-y-1">
                      <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <Calendar className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span>Joined</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={formatDate(clientData.createdAt)}>
                        {dayjs.utc(clientData.createdAt).tz(TIMEZONE).format('DD MMM YYYY')}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-center space-y-1">
                      <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <Clock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Last Active</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={formatSmartDate(clientData.lastLogin)}>
                        {clientData.lastLogin ? dayjs.utc(clientData.lastLogin).tz(TIMEZONE).format('DD MMM, hh:mm A') : 'Recently'}
                      </p>
                    </div>
                  </div>

                  {/* Edit Profile Button */}
                  <Sheet open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <SheetTrigger asChild>
                      <Button className="w-full h-11 bg-gradient-to-r from-[#1c3c63] to-[#2563eb] hover:from-[#152f4f] hover:to-[#1e40af] text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl font-semibold text-sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-hidden p-0 flex flex-col bg-slate-50/80 dark:bg-slate-950">
                      {/* Sticky Modal Header */}
                      <div className="p-5 sm:p-6 pb-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                        <SheetHeader>
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
                              <Edit className="h-5 w-5" />
                            </div>
                            <div>
                              <SheetTitle className="text-xl font-bold text-slate-900 dark:text-white">
                                Edit Profile Information
                              </SheetTitle>
                              <SheetDescription className="text-xs text-slate-500 dark:text-slate-400">
                                Update your personal details, address, and therapy preferences
                              </SheetDescription>
                            </div>
                          </div>
                        </SheetHeader>
                      </div>

                      {/* Scrollable Form Body */}
                      <ScrollArea className="flex-1">
                        <div className="p-5 sm:p-6 space-y-6">
                          {/* Card 1: Basic Information */}
                          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
                            <div className="flex items-center gap-2.5 pb-1 border-b border-slate-100 dark:border-slate-800/80">
                              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                  Basic Information
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  Your name, contact details, and public bio
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <Label htmlFor="fullName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  Full Name <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                  id="fullName"
                                  value={formData.fullName}
                                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                                  placeholder="Enter your full name"
                                  className="h-10 text-sm bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-primary-500/20"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <Label htmlFor="username" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  Username <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                  id="username"
                                  value={formData.username}
                                  onChange={(e) => handleInputChange('username', e.target.value)}
                                  placeholder="Choose a username"
                                  className="h-10 text-sm bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-primary-500/20"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  Email Address <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={formData.email}
                                  onChange={(e) => handleInputChange('email', e.target.value)}
                                  placeholder="your.email@example.com"
                                  className="h-10 text-sm bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-primary-500/20"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <Label htmlFor="phone" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  Phone Number <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                  id="phone"
                                  value={formData.phone}
                                  onChange={(e) => handleInputChange('phone', e.target.value)}
                                  placeholder="+91 98765 43210"
                                  className="h-10 text-sm bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-primary-500/20"
                                />
                              </div>

                              <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="gender" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  Gender
                                </Label>
                                <Select
                                  value={formData.gender}
                                  onValueChange={(value) => handleInputChange('gender', value)}
                                >
                                  <SelectTrigger id="gender" className="h-10 text-sm bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                    <SelectItem value="Prefer not to say">
                                      Prefer not to say
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="bio" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  Bio / About You
                                </Label>
                                <span className="text-[11px] text-slate-400">
                                  {formData.bio?.length || 0}/500 characters
                                </span>
                              </div>
                              <Textarea
                                id="bio"
                                value={formData.bio || ''}
                                onChange={(e) => handleInputChange('bio', e.target.value)}
                                placeholder="Share a brief introduction about yourself..."
                                rows={3}
                                maxLength={500}
                                className="text-sm bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 resize-none focus-visible:ring-primary-500/20"
                              />
                            </div>
                          </div>

                          {/* Card 2: Address Information */}
                          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800/80">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                  <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Address & Location
                                  </h3>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Helps connect you with counselors in your region
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Auto-Detect Location */}
                            <LocationDetector
                              onLocationDetected={(address) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  address: {
                                    city: address.city || prev.address.city,
                                    area: address.area || prev.address.area,
                                    pincode: address.pincode || prev.address.pincode,
                                  },
                                }));
                              }}
                              disabled={isLoading}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1.5">
                                <Label htmlFor="city" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  City
                                </Label>
                                <Input
                                  id="city"
                                  value={formData.address?.city || ''}
                                  onChange={(e) =>
                                    handleNestedInputChange('address', 'city', e.target.value)
                                  }
                                  placeholder="e.g., Mumbai"
                                  className="h-10 text-sm bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <Label htmlFor="area" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  Area
                                </Label>
                                <Input
                                  id="area"
                                  value={formData.address?.area || ''}
                                  onChange={(e) =>
                                    handleNestedInputChange('address', 'area', e.target.value)
                                  }
                                  placeholder="e.g., Andheri West"
                                  className="h-10 text-sm bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <Label htmlFor="pincode" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  Pincode
                                </Label>
                                <Input
                                  id="pincode"
                                  value={formData.address?.pincode || ''}
                                  onChange={(e) =>
                                    handleNestedInputChange('address', 'pincode', e.target.value)
                                  }
                                  placeholder="e.g., 400058"
                                  className="h-10 text-sm bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Card 3: Therapy Preferences */}
                          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-5">
                            <div className="flex items-center gap-2.5 pb-1 border-b border-slate-100 dark:border-slate-800/80">
                              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <Sparkles className="h-4 w-4" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                  Therapy Preferences
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  Select your comfortable languages and areas of interest
                                </p>
                              </div>
                            </div>

                            {/* Preferred Languages */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                  <Globe className="h-3.5 w-3.5 text-slate-500" />
                                  Preferred Languages
                                </Label>
                                <Badge variant="secondary" className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-0">
                                  {formData.preferredLanguages?.length || 0} selected
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-0.5">
                                {DEFAULT_LANGUAGES.map((lang) => {
                                  const isSelected = formData.preferredLanguages?.includes(lang);
                                  return (
                                    <button
                                      key={lang}
                                      type="button"
                                      onClick={() => {
                                        const updated = isSelected
                                          ? formData.preferredLanguages.filter((l) => l !== lang)
                                          : [...(formData.preferredLanguages || []), lang];
                                        handleInputChange('preferredLanguages', updated);
                                      }}
                                      className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${
                                        isSelected
                                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/50 text-primary-800 dark:text-primary-200 ring-1 ring-primary-600/30 shadow-xs'
                                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                                      }`}
                                    >
                                      <span className="truncate">{lang}</span>
                                      {isSelected ? (
                                        <Check className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400 shrink-0 ml-1.5" />
                                      ) : (
                                        <span className="h-3.5 w-3.5 rounded-full border border-slate-300 dark:border-slate-700 shrink-0 ml-1.5" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Custom / Other Languages Added */}
                              {formData.preferredLanguages?.filter(
                                (l) => !DEFAULT_LANGUAGES.includes(l)
                              ).length > 0 && (
                                <div className="pt-2 space-y-1.5">
                                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Custom Added Languages:
                                  </Label>
                                  <div className="flex flex-wrap gap-2">
                                    {formData.preferredLanguages
                                      .filter((l) => !DEFAULT_LANGUAGES.includes(l))
                                      .map((customLang) => (
                                        <Badge
                                          key={customLang}
                                          variant="secondary"
                                          className="bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200 border border-primary-300 dark:border-primary-700 pl-2.5 pr-1 py-1 gap-1 flex items-center text-xs rounded-lg"
                                        >
                                          <span>{customLang}</span>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveCustomLanguage(customLang)}
                                            className="h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-primary-200 dark:hover:bg-primary-800 text-primary-700 dark:text-primary-300 transition-colors"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </Badge>
                                      ))}
                                  </div>
                                </div>
                              )}

                              {/* Write / Add Custom Language Input */}
                              <div className="pt-1 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                                <div className="relative flex-1">
                                  <Input
                                    type="text"
                                    placeholder="Other language? Type here (e.g., French, Marwari)..."
                                    value={customLanguageInput}
                                    onChange={(e) => setCustomLanguageInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddCustomLanguage();
                                      }
                                    }}
                                    className="h-9 text-xs pr-8 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                                  />
                                  {customLanguageInput && (
                                    <button
                                      type="button"
                                      onClick={() => setCustomLanguageInput('')}
                                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={handleAddCustomLanguage}
                                  className="h-9 px-3 text-xs gap-1.5 shrink-0 hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-950/50 border-slate-200 dark:border-slate-700"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  Add Language
                                </Button>
                              </div>
                            </div>

                            {/* Preferred Topics */}
                            <div className="space-y-3 pt-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                  <Heart className="h-3.5 w-3.5 text-slate-500" />
                                  Preferred Topics
                                </Label>
                                <Badge variant="secondary" className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-0">
                                  {formData.prefferedTopics?.length || 0} selected
                                </Badge>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Select all topics you would like support or counseling for:
                              </p>

                              <div className="flex gap-2 flex-wrap max-h-56 overflow-y-auto pr-1 pt-1">
                                {topics.map((topic) => {
                                  const isSelected = formData.prefferedTopics?.includes(topic);
                                  return (
                                    <button
                                      key={topic}
                                      type="button"
                                      onClick={() => {
                                        const updated = isSelected
                                          ? formData.prefferedTopics.filter((t) => t !== topic)
                                          : [...(formData.prefferedTopics || []), topic];
                                        handleInputChange('prefferedTopics', updated);
                                      }}
                                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                                        isSelected
                                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/50 text-primary-800 dark:text-primary-200 ring-1 ring-primary-600/30 shadow-xs'
                                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                                      }`}
                                    >
                                      {isSelected ? (
                                        <Check className="h-3 w-3 text-primary-600 dark:text-primary-400 shrink-0" />
                                      ) : (
                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                      )}
                                      <span>{topic}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>

                      {/* Sticky Elevated Modal Footer */}
                      <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0 z-10 flex gap-3 shadow-lg shrink-0">
                        <Button
                          type="button"
                          onClick={() => setIsEditDialogOpen(false)}
                          variant="outline"
                          className="flex-1 h-10 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={handleSaveChanges}
                          disabled={isLoading}
                          className="flex-1 h-10 bg-gradient-to-r from-[#1c3c63] to-[#2563eb] hover:from-[#152f4f] hover:to-[#1e40af] text-white shadow-md transition-all font-semibold"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving Changes...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Information Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <motion.div variants={fadeInUp}>
              <Card className="border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1c3c63] dark:text-white">
                    <Mail className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                  <CardDescription>Your primary contact details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem icon={Mail} label="Email Address" value={clientData.email} />
                    <InfoItem icon={Phone} label="Phone Number" value={clientData.phone} />
                    <InfoItem
                      icon={User}
                      label="Gender"
                      value={clientData.gender}
                      badge
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Address Information */}
            <motion.div variants={fadeInUp}>
              <Card className="border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1c3c63] dark:text-white">
                    <MapPin className="h-5 w-5" />
                    Address Information
                  </CardTitle>
                  <CardDescription>Your location details</CardDescription>
                </CardHeader>
                <CardContent>
                  {hasAddress ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                        <MapPin className="h-5 w-5 text-[#1c3c63] dark:text-white mt-0.5 flex-shrink-0" />
                        <div>
                          {clientData.address.area && (
                            <p className="font-medium text-slate-900 dark:text-white">
                              {clientData.address.area}
                            </p>
                          )}
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {[clientData.address.city, clientData.address.pincode]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertDescription className="text-sm text-amber-900 dark:text-amber-300 ml-2">
                        No address information provided. Please add your address to complete your
                        profile.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Therapy Preferences */}
            <motion.div variants={fadeInUp}>
              <Card className="border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1c3c63] dark:text-white">
                    <Heart className="h-5 w-5" />
                    Therapy Preferences
                  </CardTitle>
                  <CardDescription>Your counseling preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <Label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">
                        Preferred Languages
                      </Label>
                      <div className="flex gap-2 flex-wrap">
                        {clientData.preferredLanguages.length > 0 ? (
                          clientData.preferredLanguages.map((language) => (
                            <Badge
                              key={language}
                              variant="secondary"
                              className="bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                            >
                              {language}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            Not specified
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">
                        Preferred Topics
                      </Label>
                      <div className="flex gap-2 flex-wrap">
                        {clientData.prefferedTopics.length > 0 ? (
                          clientData.prefferedTopics.map((topic) => (
                            <Badge
                              key={topic}
                              variant="secondary"
                              className="bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                            >
                              {topic}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            Not specified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Account Status with Day.js formatting */}
            <motion.div variants={fadeInUp}>
              <Card className="border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1c3c63] dark:text-white">
                    <Shield className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                  <CardDescription>Your account status and activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InfoItem
                      icon={Calendar}
                      label="Member Since"
                      value={formatDate(clientData.createdAt)}
                    />
                    <div className="flex flex-col space-y-2">
                      <Label className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Last Login
                      </Label>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {formatSmartDate(clientData.lastLogin)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {formatDateTime(clientData.lastLogin)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Upload Dialog */}
        <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Profile Picture</DialogTitle>
              <DialogDescription>
                Select an image to crop and upload. Max size: 5MB
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div
                className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                  dragActive
                    ? 'border-[#1c3c63] bg-blue-50 dark:bg-blue-950/30 scale-105'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-[#1c3c63]'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="p-4 bg-[#1c3c63]/10 rounded-full mb-4">
                    <Upload className="h-10 w-10 text-[#1c3c63]" />
                  </div>
                  <p className="mb-2 text-sm text-slate-700 dark:text-slate-300 font-medium">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    PNG, JPG, JPEG or WEBP (MAX. 5MB)
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                    You can crop and adjust after selecting
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileInput}
                />
              </div>

              
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Cropper Dialog (WhatsApp Style) */}
        <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
          <DialogContent className="sm:max-w-2xl p-0 gap-0">
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle>Crop Profile Picture</DialogTitle>
              <DialogDescription>
                Drag to reposition. Use sliders to zoom and rotate.
              </DialogDescription>
            </DialogHeader>

            <div className="relative w-full h-[400px] bg-black">
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Controls */}
            <div className="px-6 py-4 space-y-4 bg-slate-50 dark:bg-slate-900">
              {/* Zoom Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">Zoom</Label>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#1c3c63]"
                />
              </div>

              {/* Rotation Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <RotateCw className="h-4 w-4" />
                    Rotation
                  </Label>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#1c3c63]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => {
                    setIsCropDialogOpen(false);
                    setSelectedImage(null);
                    setIsPhotoDialogOpen(true);
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleCropConfirm}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-[#1c3c63] to-[#2563eb] hover:from-[#152f4f] hover:to-[#1e40af] text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Confirm & Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Photo Dialog */}
        <Dialog open={isViewPhotoDialogOpen} onOpenChange={setIsViewPhotoDialogOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Profile Picture</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <img
                src={clientData.profilePicture}
                alt={clientData.fullName}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};

// Helper component for displaying information items
const InfoItem = ({ icon: Icon, label, value, badge }) => {
  return (
    <div className="flex flex-col space-y-2">
      <Label className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </Label>
      {badge ? (
        <Badge
          variant="secondary"
          className="w-fit bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
        >
          {value}
        </Badge>
      ) : (
        <p className="text-sm font-medium text-slate-900 dark:text-white">{value}</p>
      )}
    </div>
  );
};

export default ClientDashboardPersonalInfo;
