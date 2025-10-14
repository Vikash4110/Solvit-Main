'use client';

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
} from 'lucide-react';
import { toast } from 'sonner';
import LocationDetector from '../../general/LocationDetector';

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
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

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

  // Fetch client data and profile completeness
  useEffect(() => {
    fetchClientData();
    fetchProfileCompleteness();
  }, []);

  const fetchClientData = async () => {
    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CLIENT_PROFILE_GET_AND_UPDATE}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch client data');
      }

      const result = await response.json();
      const data = result.data || result;

      const transformedData = {
        fullName: data.fullName || '',
        username: data.username || '',
        email: data.email || '',
        phone: data.phone || '',
        gender: data.gender || '',
        profilePicture: data.profilePicture || '',
        preferredLanguages: data.preferredLanguages || [],
        bio: data.bio[0].toUpperCase() + data.bio.slice(1, data.bio.length) || '',
        address: {
          city: data.address?.city || '',
          area: data.address?.area || '',
          pincode: data.address?.pincode || '',
        },
        prefferedTopics: data.prefferedTopics || [],
        lastLogin: data.lastLogin,
        createdAt: data.createdAt,
      };

      setClientData(transformedData);
      setFormData(transformedData);
    } catch (err) {
      console.error('Error fetching client data:', err);
      setError(err.message || 'Failed to load profile data');

      toast.error('Failed to Load Profile', {
        description: 'Unable to fetch your profile data. Please try again.',
      });
    } finally {
      setIsFetching(false);
    }
  };

  const fetchProfileCompleteness = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CLIENT_PROFILE_COMPLETENESS_VALIDATE}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        setProfileCompleteness(result.data || result);
      }
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
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CLIENT_PROFILE_GET_AND_UPDATE}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      setClientData(formData);
      setIsEditDialogOpen(false);

      fetchProfileCompleteness();

      toast.success('Profile Updated Successfully', {
        description: 'Your personal information has been saved.',
      });
    } catch (err) {
      console.error('Error updating profile:', err);

      toast.error('Update Failed', {
        description: err.message || 'Failed to update profile. Please try again.',
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

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CLIENT_PROFILE_PROFILEPICTURE_UPDATE_DELETE}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const result = await response.json();
      const data = result.data || result;

      const newProfilePicture = data.profilePicture;
      
      const storedClientData = JSON.parse(localStorage.getItem("client"))
      storedClientData.profilePicture = newProfilePicture
      localStorage.setItem("client",JSON.stringify(storedClientData))

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
            {profileCompleteness && (
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
            <Card className="border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  {/* Profile Picture with Dropdown Menu */}
                  <div className="relative group mb-4">
                    <Avatar className="h-40 w-40 lg:h-48 lg:w-48 ring-4 ring-[#1c3c63] dark:ring-slate-800 shadow-xl transition-all duration-300 ">
                      <AvatarImage
                        src={clientData.profilePicture}
                        alt={clientData.fullName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-[#1c3c63] to-[#2563eb] text-white text-4xl lg:text-5xl font-semibold">
                        {clientData.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute bottom-0 right-0 h-12 w-12 rounded-full shadow-lg  group-hover: transition-opacity duration-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Camera className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => setIsViewPhotoDialogOpen(true)}
                          disabled={!clientData.profilePicture}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Photo
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsPhotoDialogOpen(true)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Update Photo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Name and Username */}
                  <h2 className="text-2xl font-bold text-[#1c3c63] dark:text-white mb-1 text-center">
                    {clientData.fullName}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    @{clientData.username}
                  </p>

                  <Separator className="my-4" />

                  {/* Bio */}
                  {clientData.bio && (
                    <div className="w-full">
                      <p className="text-sm text-slate-700 dark:text-slate-300 text-center leading-relaxed mb-4 px-2">
                        {clientData.bio}
                      </p>
                      <Separator className="my-4" />
                    </div>
                  )}

                  {/* Quick Stats with Day.js formatting */}
                  <div className="w-full space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Joined
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatDate(clientData.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Last Login
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatSmartDate(clientData.lastLogin)}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Edit Profile Button */}
                  <Sheet open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <SheetTrigger asChild>
                      <Button className="w-full bg-gradient-to-r from-[#1c3c63] to-[#2563eb] hover:from-[#152f4f] hover:to-[#1e40af] text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:max-w-2xl overflow-hidden p-0">
                      <ScrollArea className="h-full">
                        <div className="p-6">
                          <SheetHeader className="mb-6">
                            <SheetTitle className="text-2xl text-[#1c3c63] dark:text-white">
                              Edit Profile Information
                            </SheetTitle>
                            <SheetDescription>
                              Update your personal details and preferences
                            </SheetDescription>
                          </SheetHeader>

                          <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-[#1c3c63] dark:text-white flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Basic Information
                              </h3>
                              <Separator />

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="fullName">Full Name *</Label>
                                  <Input
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                    placeholder="Enter your full name"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="username">Username *</Label>
                                  <Input
                                    id="username"
                                    value={formData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    placeholder="Choose a username"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="email">Email Address *</Label>
                                  <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="your.email@example.com"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="phone">Phone Number *</Label>
                                  <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="+91 98765 43210"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="gender">Gender</Label>
                                  <Select
                                    value={formData.gender}
                                    onValueChange={(value) => handleInputChange('gender', value)}
                                  >
                                    <SelectTrigger id="gender">
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

                              <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                  id="bio"
                                  value={formData.bio}
                                  onChange={(e) => handleInputChange('bio', e.target.value)}
                                  placeholder="Tell us about yourself..."
                                  rows={3}
                                  maxLength={500}
                                />
                                <p className="text-xs text-slate-500 text-right">
                                  {formData.bio?.length || 0}/500 characters
                                </p>
                              </div>
                            </div>

                            {/* Address Information */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-[#1c3c63] dark:text-white flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Address Information
                              </h3>
                              <Separator />

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

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="city">City</Label>
                                  <Input
                                    id="city"
                                    value={formData.address.city}
                                    onChange={(e) =>
                                      handleNestedInputChange('address', 'city', e.target.value)
                                    }
                                    placeholder="Mumbai"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="area">Area</Label>
                                  <Input
                                    id="area"
                                    value={formData.address.area}
                                    onChange={(e) =>
                                      handleNestedInputChange('address', 'area', e.target.value)
                                    }
                                    placeholder="Andheri West"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="pincode">Pincode</Label>
                                  <Input
                                    id="pincode"
                                    value={formData.address.pincode}
                                    onChange={(e) =>
                                      handleNestedInputChange('address', 'pincode', e.target.value)
                                    }
                                    placeholder="400058"
                                  />
                                </div>
                              </div>
                            </div>

                            {/*Therapy Preferences */}
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-[#1c3c63] dark:text-white flex items-center gap-2">
                                Therapy Preferences
                              </h3>
                              <Separator />

                              <div className="space-y-3">
                                <Label>Preferred Languages</Label>
                               
                                <div className="flex gap-4">
                                  {['Hindi', 'English'].map((lang) => (
                                    <div key={lang} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={lang}
                                        checked={formData.preferredLanguages?.includes(lang)}
                                        onCheckedChange={(checked) => {
                                          const updated = checked
                                            ? [...formData.preferredLanguages, lang]
                                            : formData.preferredLanguages.filter((l) => l !== lang);
                                          handleInputChange('preferredLanguages', updated);
                                        }}
                                      />
                                      <Label htmlFor={lang} className="cursor-pointer">
                                        {lang}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <Label>Preferred Topics</Label>
    
                                <div className="flex gap-4 flex-wrap">
                                  {topics.map((topic) => (
                                    <div key={topic} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={topic}
                                        checked={formData.prefferedTopics.includes(topic)}
                                        onCheckedChange={(checked) => {
                                          const updated = checked
                                            ? [...formData.prefferedTopics, topic]
                                            : formData.prefferedTopics.filter(
                                                (t) => t !== topic
                                              );
                                          handleInputChange('prefferedTopics', updated);
                                        }}
                                      />

                                      <Label htmlFor={topic} className="cursor-pointer">
                                        {topic}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 mt-8 pt-6 border-t sticky bottom-0 bg-white dark:bg-slate-950 pb-6">
                            <Button
                              onClick={() => setIsEditDialogOpen(false)}
                              variant="outline"
                              className="flex-1"
                              disabled={isLoading}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSaveChanges}
                              disabled={isLoading}
                              className="flex-1 bg-gradient-to-r from-[#1c3c63] to-[#2563eb] hover:from-[#152f4f] hover:to-[#1e40af] text-white"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Changes
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </ScrollArea>
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
                      value={clientData.gender || 'Not specified'}
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
