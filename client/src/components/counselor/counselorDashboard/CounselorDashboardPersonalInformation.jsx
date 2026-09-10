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
  Briefcase,
  Award,
  GraduationCap,
  FileText,
  CreditCard,
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
  Building,
  BadgeCheck,
  Languages,
  CheckCircle,
  AlertCircle,
  Clock,
  Crown,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

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
  SheetBody,
  SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { TIMEZONE } from '../../../constants/constants';
import { API_ENDPOINTS } from '@/config/api';
import api from '@/lib/axios';

// Configure Day.js plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

// Specializations from model
const specializationOptions = [
  'Mental Health',
  'Career Counselling',
  'Relationship & Family Therapy',
  'Life & Personal Development',
  'Financial Counselling',
  'Academic Counselling',
  'Health and Wellness Counselling',
];

// Languages from model
const LANGUAGES = [
  'English',
  'Hindi',
  'Bengali',
  'Marathi',
  'Telugu',
  'Tamil',
  'Gujarati',
  'Urdu',
  'Kannada',
  'Malayalam',
  'Punjabi',
];

// Helper to normalize and deduplicate language arrays/strings
const normalizeLanguages = (raw) => {
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return normalizeLanguages(parsed);
    } catch {
      return raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  if (!Array.isArray(raw)) return [];

  const result = [];
  const flatten = (arr) => {
    arr.forEach((item) => {
      if (Array.isArray(item)) {
        flatten(item);
      } else if (typeof item === 'string') {
        item.split(',').forEach((s) => {
          const trimmed = s.trim();
          if (trimmed && !result.includes(trimmed)) {
            result.push(trimmed);
          }
        });
      }
    });
  };
  flatten(raw);
  return result;
};

// Experience levels
const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Experienced', 'Specialist'];

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
  transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const CounselorDashboardPersonalInfo = () => {
  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [isViewPhotoDialogOpen, setIsViewPhotoDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);

  // Image upload states
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Cropper states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const fileInputRef = useRef(null);

  // Data states
  const [counselorData, setCounselorData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [profileCompleteness, setProfileCompleteness] = useState(null);

  // Fetch counselor data on mount
  useEffect(() => {
    fetchCounselorData();
    fetchProfileCompleteness();
  }, []);

  const fetchCounselorData = async () => {
    setIsFetching(true);
    setError(null);
    try {
      const response = await api.get(API_ENDPOINTS.COUNSELOR_PROFILE_GET);
      const data = response.data?.data || response.data;

      const transformedData = {
        fullName: data.fullName || '',
        username: data.username || '',
        email: data.email || '',
        phone: data.phone || '',
        gender: data.gender || '',
        profilePicture: data.profilePicture || '',
        specialization: Array.isArray(data.specialization)
          ? data.specialization
          : data.specialization
            ? [data.specialization]
            : [],

        experienceYears: data.experienceYears || 0,
        experienceLevel: data.experienceLevel || '',
        application: {
          education: {
            graduation: {
              university: data.application?.education?.graduation?.university || '',
              degree: data.application?.education?.graduation?.degree || '',
              year: data.application?.education?.graduation?.year || '',
            },
            postGraduation: {
              university: data.application?.education?.postGraduation?.university || '',
              degree: data.application?.education?.postGraduation?.degree || '',
              year: data.application?.education?.postGraduation?.year || '',
            },
          },
          professionalSummary: data.application?.professionalSummary || '',
          languages: normalizeLanguages(data.application?.languages),
          license: {
            licenseNo: data.application?.license?.licenseNo || '',
            issuingAuthority: data.application?.license?.issuingAuthority || '',
          },
          bankDetails: {
            accountNo: data.application?.bankDetails?.accountNo || '',
            ifscCode: data.application?.bankDetails?.ifscCode || '',
            branchName: data.application?.bankDetails?.branchName || '',
            accountType: data.application?.bankDetails?.accountType || 'Savings',
          },
          applicationStatus: data.application?.applicationStatus || 'not_submitted',
          applicationSubmittedAt: data.application?.applicationSubmittedAt || null,
        },
      };

      setCounselorData(transformedData);
      setFormData(transformedData);
      setProfileCompleteness((prev) => ({
        ...prev,
        isCompleted: true,
      }));
    } catch (err) {
      console.error('Error fetching counselor data:', err);
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
      const response = await api.get(API_ENDPOINTS.COUNSELOR_PROFILE_COMPLETENESS);
      const result = response.data;
      setProfileCompleteness(result.data || result);
    } catch (err) {
      console.error('Error fetching profile completeness:', err);
    }
  };
  const handleOpenEditModal = (initialTab = 'basic') => {
    if (counselorData) {
      setFormData({
        ...counselorData,
        specialization: Array.isArray(counselorData.specialization)
          ? [...counselorData.specialization]
          : counselorData.specialization
            ? [counselorData.specialization]
            : [],
        application: {
          ...counselorData.application,
          education: {
            graduation: {
              university: counselorData.application?.education?.graduation?.university || '',
              degree: counselorData.application?.education?.graduation?.degree || '',
              year: counselorData.application?.education?.graduation?.year || '',
            },
            postGraduation: {
              university: counselorData.application?.education?.postGraduation?.university || '',
              degree: counselorData.application?.education?.postGraduation?.degree || '',
              year: counselorData.application?.education?.postGraduation?.year || '',
            },
          },
          languages: normalizeLanguages(counselorData.application?.languages),
          professionalSummary: counselorData.application?.professionalSummary || '',
          license: {
            licenseNo: counselorData.application?.license?.licenseNo || '',
            issuingAuthority: counselorData.application?.license?.issuingAuthority || '',
          },
          bankDetails: {
            accountNo: counselorData.application?.bankDetails?.accountNo || '',
            ifscCode: counselorData.application?.bankDetails?.ifscCode || '',
            branchName: counselorData.application?.bankDetails?.branchName || '',
          },
        },
      });
    }
    setActiveTab(initialTab);
    setIsEditDialogOpen(true);
  };

  const handleSpecializationSelect = (value) => {
    if (!formData?.specialization?.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        specialization: [...(prev?.specialization || []), value],
      }));
    }
  };

  const removeSpecialization = (specialization) => {
    setFormData((prev) => ({
      ...prev,
      specialization: (prev?.specialization || []).filter((spec) => spec !== specialization),
    }));
  };

  const handleLanguageToggle = (lang) => {
    const currentLangs = normalizeLanguages(formData?.application?.languages);
    const newLangs = currentLangs.includes(lang)
      ? currentLangs.filter((l) => l !== lang)
      : [...currentLangs, lang];
    handleNestedInputChange('application', 'languages', newLangs);
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

  const handleDeepNestedInputChange = (parent, child, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: {
          ...prev[parent][child],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmitApplication = async () => {
    setIsLoading(true);
    try {
      await api.post(API_ENDPOINTS.COUNSELOR_APPLICATION_SUBMIT);
      toast.success('Application Submitted', {
        description: 'Your verification application has been submitted for review.',
      });
      await fetchCounselorData();
      await fetchProfileCompleteness();
    } catch (err) {
      console.error('Error submitting application:', err);
      toast.error('Submission Failed', {
        description:
          err.response?.data?.message ||
          'Please complete all required fields before submitting your application.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!formData?.username?.trim()) {
      toast.error('Validation Error', {
        description: 'Please enter a valid username.',
      });
      setActiveTab('basic');
      return;
    }

    if (!formData?.phone?.trim()) {
      toast.error('Validation Error', {
        description: 'Please enter a valid phone number.',
      });
      setActiveTab('basic');
      return;
    }

    if (!formData?.gender) {
      toast.error('Validation Error', {
        description: 'Please select your gender.',
      });
      setActiveTab('basic');
      return;
    }

    if (!formData?.specialization || formData.specialization.length === 0) {
      toast.error('Validation Error', {
        description: 'Please select at least one area of specialization.',
      });
      setActiveTab('professional');
      return;
    }

    if (
      formData.experienceYears === undefined ||
      formData.experienceYears === '' ||
      isNaN(Number(formData.experienceYears)) ||
      Number(formData.experienceYears) < 0
    ) {
      toast.error('Validation Error', {
        description: 'Please enter a valid number for years of experience.',
      });
      setActiveTab('professional');
      return;
    }

    // Optional bank validation
    const ifsc = formData.application?.bankDetails?.ifscCode?.trim();
    if (ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase())) {
      toast.error('Invalid IFSC Code', {
        description: 'IFSC should be 11 characters (e.g. HDFC0001234, SBIN0004321).',
      });
      setActiveTab('bank');
      return;
    }

    // Optional education year validations
    const gradYear = formData.application?.education?.graduation?.year;
    if (
      gradYear &&
      (isNaN(Number(gradYear)) ||
        Number(gradYear) < 1960 ||
        Number(gradYear) > new Date().getFullYear() + 5)
    ) {
      toast.error('Invalid Graduation Year', {
        description: `Please enter a valid graduation year (1960 - ${new Date().getFullYear() + 5}).`,
      });
      setActiveTab('education');
      return;
    }

    const postGradYear = formData.application?.education?.postGraduation?.year;
    if (
      postGradYear &&
      (isNaN(Number(postGradYear)) ||
        Number(postGradYear) < 1960 ||
        Number(postGradYear) > new Date().getFullYear() + 5)
    ) {
      toast.error('Invalid Post-Graduation Year', {
        description: `Please enter a valid year (1960 - ${new Date().getFullYear() + 5}).`,
      });
      setActiveTab('education');
      return;
    }

    setIsLoading(true);

    try {
      const changedData = {
        username: formData.username.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        specialization: formData.specialization,
        experienceYears: parseInt(formData.experienceYears, 10) || 0,
        professionalSummary: formData.application?.professionalSummary || '',
        languages: normalizeLanguages(formData?.application?.languages),
        education: {
          graduation: {
            university: formData.application?.education?.graduation?.university?.trim() || '',
            degree: formData.application?.education?.graduation?.degree?.trim() || '',
            year: formData.application?.education?.graduation?.year
              ? parseInt(formData.application.education.graduation.year, 10)
              : undefined,
          },
          postGraduation: {
            university: formData.application?.education?.postGraduation?.university?.trim() || '',
            degree: formData.application?.education?.postGraduation?.degree?.trim() || '',
            year: formData.application?.education?.postGraduation?.year
              ? parseInt(formData.application.education.postGraduation.year, 10)
              : undefined,
          },
        },
        license: {
          licenseNo: formData.application?.license?.licenseNo?.trim() || '',
          issuingAuthority: formData.application?.license?.issuingAuthority?.trim() || '',
        },
        bankDetails: {
          accountNo: formData.application?.bankDetails?.accountNo?.trim() || '',
          ifscCode: formData.application?.bankDetails?.ifscCode?.trim()?.toUpperCase() || '',
          branchName: formData.application?.bankDetails?.branchName?.trim() || '',
        },
      };

      await api.put(API_ENDPOINTS.COUNSELOR_PROFILE_UPDATE, changedData);

      await fetchCounselorData();
      await fetchProfileCompleteness();
      setIsEditDialogOpen(false);

      toast.success('Profile Updated Successfully', {
        description: 'All your profile details and credentials have been saved.',
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Update Failed', {
        description:
          err.response?.data?.message || err.message || 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Image upload handlers
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
        API_ENDPOINTS.COUNSELOR_PROFILE_PICTURE_UPDATE,
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

      try {
        const rawData = localStorage.getItem('counselor');
        if (rawData) {
          const storedCounselorData = JSON.parse(rawData);
          if (storedCounselorData && typeof storedCounselorData === 'object') {
            storedCounselorData.profilePicture = newProfilePicture;
            localStorage.setItem('counselor', JSON.stringify(storedCounselorData));
          }
        }
      } catch (storageErr) {
        console.warn('Could not sync profile picture to localStorage:', storageErr);
      }

      setCounselorData((prev) => ({
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

  // Date formatting functions
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

  const getExperienceLevelBadge = (level) => {
    const badges = {
      Beginner: {
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: null,
      },
      Intermediate: {
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: null,
      },
      Experienced: {
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        icon: Crown,
      },
      Specialist: {
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        icon: Sparkles,
      },
    };
    return badges[level] || badges.Beginner;
  };

  const getApplicationStatusBadge = (status) => {
    const statuses = {
      not_submitted: {
        label: 'Not Submitted',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      },
      pending: {
        label: 'Under Review',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      },
      approved: {
        label: 'Approved',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      },
      rejected: {
        label: 'Rejected',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      },
    };
    return statuses[status] || statuses.not_submitted;
  };

  // Loading skeleton
  if (isFetching) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardHeader>
            <div className="flex items-center gap-6">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!counselorData) return null;

  const experienceBadge = getExperienceLevelBadge(counselorData.experienceLevel);
  const applicationStatus = getApplicationStatusBadge(counselorData.application.applicationStatus);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Professional Profile
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Manage your professional information 
          </p>
        </div>

        {profileCompleteness && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                  Profile Completeness
                </p>
                <Progress value={profileCompleteness.completionPercentage} className="h-2" />
              </div>
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {profileCompleteness.completionPercentage}%
              </span>
            </div>
          </Card>
        )}
      </motion.div>

      {/* Profile Header Card */}
      <motion.div variants={fadeInUp}>
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700" />
          <CardContent className="relative pt-0 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 md:-mt-20">
              {/* Profile Picture */}
              <div className="relative group">
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white dark:border-neutral-900 shadow-xl">
                  <AvatarImage src={counselorData.profilePicture} alt={counselorData.fullName} />
                  <AvatarFallback className="text-3xl md:text-4xl bg-primary-100 dark:bg-primary-900/30">
                    {counselorData.fullName?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>

                {/* Edit Photo Button */}
                <Button
                  size="sm"
                  variant="default"
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full shadow-lg p-0"
                  onClick={() => setIsPhotoDialogOpen(true)}
                >
                  <Camera className="h-5 w-5" />
                </Button>

                {/* View Photo Button */}
                {counselorData.profilePicture && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-0 right-0 h-8 w-8 rounded-full shadow-md p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setIsViewPhotoDialogOpen(true)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">
                      {counselorData.fullName}
                    </h2>
                    {counselorData.application.applicationStatus === 'approved' && (
                      <BadgeCheck className="h-6 w-6 text-neutral-100" />
                    )}
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                    @{counselorData.username}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={experienceBadge.color}>
                    {experienceBadge.icon && <experienceBadge.icon className="h-3 w-3 mr-1" />}
                    {counselorData.experienceLevel} (
                    {counselorData.experienceYears <= 1 ? (
                      <span>{counselorData.experienceYears}year</span>
                    ) : (
                      <span>{counselorData.experienceYears}years</span>
                    )}{' '}
                    )
                  </Badge>
                </div>

                {counselorData.application.professionalSummary && (
                  <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base max-w-3xl">
                    {counselorData.application.professionalSummary}
                  </p>
                )}
              </div>

              {/* Edit Button */}
              <Button
                onClick={handleOpenEditModal}
                size="lg"
                className="gap-2 mt-4 md:mt-0"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Information */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary-600" />
                  Basic Information
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEditModal('basic')}
                  className="h-8 gap-1.5 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow icon={User} label="Full Name" value={counselorData.fullName} />
                <InfoRow icon={Mail} label="Email" value={counselorData.email} />
                <InfoRow icon={Phone} label="Phone" value={counselorData.phone} />
                <InfoRow icon={User} label="Gender" value={counselorData.gender} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Education */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-5 w-5 text-primary-600" />
                  Education
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEditModal('education')}
                  className="h-8 gap-1.5 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Graduation */}
                <div>
                  <Label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider block mb-2">
                    Graduation
                  </Label>
                  <div className="space-y-2">
                    <InfoRow
                      icon={Building}
                      label="University"
                      value={
                        counselorData.application.education?.graduation?.university || 'Not specified'
                      }
                      compact
                    />
                    <InfoRow
                      icon={GraduationCap}
                      label="Degree"
                      value={counselorData.application.education?.graduation?.degree || 'Not specified'}
                      compact
                    />
                    <InfoRow
                      icon={Calendar}
                      label="Year"
                      value={counselorData.application.education?.graduation?.year || 'Not specified'}
                      compact
                    />
                  </div>
                </div>

                {/* Post Graduation */}
                {(counselorData.application.education?.postGraduation?.university ||
                  counselorData.application.education?.postGraduation?.degree) && (
                  <div className="border-t border-neutral-200/80 dark:border-neutral-800 pt-4">
                    <Label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider block mb-3">
                      Post Graduation
                    </Label>
                    <div className="space-y-2">
                      <InfoRow
                        icon={Building}
                        label="University"
                        value={
                          counselorData.application.education?.postGraduation?.university ||
                          'Not specified'
                        }
                        compact
                      />
                      <InfoRow
                        icon={GraduationCap}
                        label="Degree"
                        value={
                          counselorData.application.education?.postGraduation?.degree ||
                          'Not specified'
                        }
                        compact
                      />
                      <InfoRow
                        icon={Calendar}
                        label="Year"
                        value={
                          counselorData.application.education?.postGraduation?.year || 'Not specified'
                        }
                        compact
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Bank Details */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-primary-600" />
                  Bank Details
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEditModal('bank')}
                  className="h-8 gap-1.5 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow
                  icon={CreditCard}
                  label="Account Number"
                  value={
                    counselorData.application.bankDetails?.accountNo
                      ? `${counselorData.application.bankDetails.accountNo}`
                      : 'Not specified'
                  }
                />
                <InfoRow
                  icon={FileText}
                  label="IFSC Code"
                  value={counselorData.application.bankDetails?.ifscCode || 'Not specified'}
                />
                <InfoRow
                  icon={Building}
                  label="Branch"
                  value={counselorData.application.bankDetails?.branchName || 'Not specified'}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Professional Details */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="h-5 w-5 text-primary-600" />
                  Professional Details
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEditModal('professional')}
                  className="h-8 gap-1.5 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow
                  icon={Briefcase}
                  label="Specialization"
                  value={(Array.isArray(counselorData.specialization)
                    ? counselorData.specialization
                    : counselorData.specialization
                      ? [counselorData.specialization]
                      : []
                  ).map((specialization) => (
                    <Badge key={specialization} variant="outline" className="m-1">
                      {specialization}
                    </Badge>
                  ))}
                />
                <InfoRow
                  icon={Award}
                  label="Experience"
                  value={`${counselorData.experienceYears} years (${counselorData.experienceLevel})`}
                />
                <InfoRow
                  icon={Languages}
                  label="Languages"
                  value={
                    normalizeLanguages(counselorData.application.languages).length > 0
                      ? normalizeLanguages(counselorData.application.languages).join(', ')
                      : 'Not specified'
                  }
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* License Information */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BadgeCheck className="h-5 w-5 text-primary-600" />
                  License Information
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEditModal('license')}
                  className="h-8 gap-1.5 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow
                  icon={FileText}
                  label="License Number"
                  value={counselorData.application.license?.licenseNo || 'Not specified'}
                />
                <InfoRow
                  icon={Building}
                  label="Issuing Authority"
                  value={counselorData.application.license?.issuingAuthority || 'Not specified'}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Status */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-primary-600" />
                  Account Status
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEditModal('status')}
                  className="h-8 gap-1.5 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/50"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Status
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <InfoRow
                  icon={Calendar}
                  label="Member Since"
                  value={formatDate(counselorData.createdAt)}
                />
                <InfoRow
                  icon={Clock}
                  label="Last Login"
                  value={formatSmartDate(counselorData.lastLogin)}
                  tooltip={formatDateTime(counselorData.lastLogin)}
                />
                {counselorData.application.applicationSubmittedAt && (
                  <InfoRow
                    icon={CheckCircle}
                    label="Application Submitted"
                    value={formatDate(counselorData.application.applicationSubmittedAt)}
                  />
                )}
                <InfoRow
                  icon={Shield}
                  label="Account Status"
                  value={
                    <Badge variant={counselorData.isBlocked ? 'destructive' : 'outline'}>
                      {counselorData.isBlocked ? 'Blocked' : 'Active'}
                    </Badge>
                  }
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Sheet open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col h-full bg-white dark:bg-neutral-900 shadow-2xl border-l border-neutral-200 dark:border-neutral-800 focus:outline-none"
        >
          <SheetHeader className="p-5 sm:p-6 pb-4 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 shadow-sm">
                <Edit className="h-5 w-5" />
              </div>
              <div className="text-left">
                <SheetTitle className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Edit Professional Profile
                </SheetTitle>
                <SheetDescription className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                  Update your personal details and counselling practice information
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Scrollable Tabs Bar */}
            <div className="px-4 sm:px-6 pt-3 pb-2 shrink-0 bg-white dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800">
              <div className="overflow-x-auto no-scrollbar pb-1">
                <TabsList className="flex w-max min-w-full p-1.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl h-auto gap-1 border border-neutral-200/80 dark:border-neutral-700">
                  <TabsTrigger
                    value="basic"
                    className="flex items-center gap-1.5 rounded-lg font-semibold text-xs sm:text-sm py-2 px-3 transition-all cursor-pointer select-none data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm data-[state=active]:text-primary-700 dark:data-[state=active]:text-primary-300 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 whitespace-nowrap"
                  >
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span>Basic</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="professional"
                    className="flex items-center gap-1.5 rounded-lg font-semibold text-xs sm:text-sm py-2 px-3 transition-all cursor-pointer select-none data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm data-[state=active]:text-primary-700 dark:data-[state=active]:text-primary-300 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 whitespace-nowrap"
                  >
                    <Briefcase className="h-3.5 w-3.5 shrink-0" />
                    <span>Professional</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="education"
                    className="flex items-center gap-1.5 rounded-lg font-semibold text-xs sm:text-sm py-2 px-3 transition-all cursor-pointer select-none data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm data-[state=active]:text-primary-700 dark:data-[state=active]:text-primary-300 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 whitespace-nowrap"
                  >
                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                    <span>Education</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="license"
                    className="flex items-center gap-1.5 rounded-lg font-semibold text-xs sm:text-sm py-2 px-3 transition-all cursor-pointer select-none data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm data-[state=active]:text-primary-700 dark:data-[state=active]:text-primary-300 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 whitespace-nowrap"
                  >
                    <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>License</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="bank"
                    className="flex items-center gap-1.5 rounded-lg font-semibold text-xs sm:text-sm py-2 px-3 transition-all cursor-pointer select-none data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm data-[state=active]:text-primary-700 dark:data-[state=active]:text-primary-300 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 whitespace-nowrap"
                  >
                    <CreditCard className="h-3.5 w-3.5 shrink-0" />
                    <span>Bank Details</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="status"
                    className="flex items-center gap-1.5 rounded-lg font-semibold text-xs sm:text-sm py-2 px-3 transition-all cursor-pointer select-none data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm data-[state=active]:text-primary-700 dark:data-[state=active]:text-primary-300 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 whitespace-nowrap"
                  >
                    <Shield className="h-3.5 w-3.5 shrink-0" />
                    <span>Status</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <SheetBody className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-6">
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="mt-0 space-y-5 focus-visible:outline-none">
                {/* Read-only Account Info notice */}
                <div className="rounded-xl p-4 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Account Credentials
                    </span>
                    <Badge variant="outline" className="text-[10px] gap-1 py-0.5 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700">
                      <Lock className="h-3 w-3" />
                      Verified
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">Full Name</span>
                      <p className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                        {formData?.fullName || counselorData?.fullName || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">Email Address</span>
                      <p className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                        {formData?.email || counselorData?.email || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-sm font-semibold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                      <User className="h-3.5 w-3.5 text-neutral-500" />
                      Username <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="username"
                      value={formData?.username || ''}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="e.g. javed_counselor"
                      className="h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus-visible:ring-primary-500 text-sm"
                    />
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Your unique counselor username on the platform.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                      <Phone className="h-3.5 w-3.5 text-neutral-500" />
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData?.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+91 9876543210"
                      className="h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus-visible:ring-primary-500 text-sm"
                    />
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Used for critical alerts, slot confirmations, and notifications.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="gender" className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                      Gender <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData?.gender || ''}
                      onValueChange={(value) => handleInputChange('gender', value)}
                    >
                      <SelectTrigger id="gender" className="h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-sm">
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Professional Info Tab */}
              <TabsContent value="professional" className="mt-0 space-y-5 focus-visible:outline-none">
                {/* Specialization Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="specialization" className="text-sm font-semibold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                      <Award className="h-3.5 w-3.5 text-neutral-500" />
                      Areas of Specialization <span className="text-red-500">*</span>
                    </Label>
                    <span className="text-[11px] text-neutral-500 font-medium">
                      {formData?.specialization?.length || 0} selected
                    </span>
                  </div>

                  <Select onValueChange={handleSpecializationSelect} value="">
                    <SelectTrigger className="h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-sm">
                      <span className="text-neutral-500">Choose a specialization to add...</span>
                    </SelectTrigger>
                    <SelectContent>
                      {specializationOptions.map((spec) => (
                        <SelectItem
                          key={spec}
                          value={spec}
                          disabled={formData?.specialization?.includes(spec)}
                          className="text-sm"
                        >
                          {spec} {formData?.specialization?.includes(spec) ? '(Added)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Selected Specialization Badges */}
                  {formData?.specialization?.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {formData.specialization.map((spec) => (
                        <Badge
                          key={spec}
                          variant="secondary"
                          className="px-3 py-1.5 bg-primary-50 dark:bg-primary-950/40 text-primary-800 dark:text-primary-200 border border-primary-200 dark:border-primary-800/60 text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <span>{spec}</span>
                          <button
                            type="button"
                            onClick={() => removeSpecialization(spec)}
                            className="p-0.5 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 text-primary-700 dark:text-primary-300 transition-colors"
                            aria-label={`Remove ${spec}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/50">
                      Please add at least one specialization for client discovery.
                    </p>
                  )}
                </div>

                {/* Experience Years */}
                <div className="space-y-1.5">
                  <Label htmlFor="experienceYears" className="text-sm font-semibold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                    <Briefcase className="h-3.5 w-3.5 text-neutral-500" />
                    Years of Experience <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="experienceYears"
                    type="number"
                    min="0"
                    max="60"
                    value={formData?.experienceYears ?? ''}
                    onChange={(e) =>
                      handleInputChange(
                        'experienceYears',
                        e.target.value === '' ? '' : parseInt(e.target.value, 10)
                      )
                    }
                    placeholder="e.g. 5"
                    className="h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus-visible:ring-primary-500 text-sm"
                  />
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Total years of verified practice in counselling or mental wellness.
                  </p>
                </div>

                {/* Languages */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                      <Globe className="h-3.5 w-3.5 text-neutral-500" />
                      Languages Spoken
                    </Label>
                    <span className="text-[11px] text-neutral-500 font-medium">
                      {normalizeLanguages(formData?.application?.languages).length} selected
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Select languages in which you can fluently conduct counselling sessions:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {LANGUAGES.map((lang) => {
                      const selectedLangs = normalizeLanguages(formData?.application?.languages);
                      const isChecked = selectedLangs.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleLanguageToggle(lang)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer ${
                            isChecked
                              ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40 text-primary-800 dark:text-primary-200 shadow-sm ring-1 ring-primary-600/30'
                              : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                          }`}
                        >
                          <span className="truncate">{lang}</span>
                          {isChecked ? (
                            <Check className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400 shrink-0 ml-1.5" />
                          ) : (
                            <span className="h-3.5 w-3.5 rounded-full border border-neutral-300 dark:border-neutral-600 shrink-0 ml-1.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="professionalSummary" className="text-sm font-semibold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                      <FileText className="h-3.5 w-3.5 text-neutral-500" />
                      Professional Summary
                    </Label>
                    <span
                      className={`text-[11px] ${
                        (formData?.application?.professionalSummary?.length || 0) > 900
                          ? 'text-amber-600 font-medium'
                          : 'text-neutral-400'
                      }`}
                    >
                      {formData?.application?.professionalSummary?.length || 0}/1000
                    </span>
                  </div>
                  <Textarea
                    id="professionalSummary"
                    value={formData?.application?.professionalSummary || ''}
                    onChange={(e) =>
                      handleNestedInputChange('application', 'professionalSummary', e.target.value)
                    }
                    placeholder="Describe your expertise, therapeutic approach, areas of focus, and background..."
                    rows={4}
                    maxLength={1000}
                    className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 focus-visible:ring-primary-500 text-sm resize-y leading-relaxed"
                  />
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Brief summary visible to clients exploring your counsellor profile.
                  </p>
                </div>
              </TabsContent>

              {/* Education Tab */}
              <TabsContent value="education" className="mt-0 space-y-6 focus-visible:outline-none">
                <div className="rounded-xl p-4 bg-primary-50/60 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50 flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-primary-900 dark:text-primary-200 space-y-1">
                    <p className="font-semibold">Academic & Professional Credentials</p>
                    <p className="text-primary-700/80 dark:text-primary-300/80 leading-relaxed">
                      Adding your university degrees helps clients understand your training in psychology, counselling, or healthcare.
                    </p>
                  </div>
                </div>

                {/* Graduation Section */}
                <div className="rounded-xl p-4 sm:p-5 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-primary-600" />
                      Graduation (Primary Degree)
                    </span>
                    <Badge variant="outline" className="text-[10px] font-semibold text-primary-600 border-primary-300">
                      Primary
                    </Badge>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <Label htmlFor="gradUniversity" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        University / College / Institute
                      </Label>
                      <Input
                        id="gradUniversity"
                        value={formData?.application?.education?.graduation?.university || ''}
                        onChange={(e) =>
                          handleDeepNestedInputChange('application', 'education', 'graduation', {
                            ...formData?.application?.education?.graduation,
                            university: e.target.value,
                          })
                        }
                        placeholder="e.g. University of Delhi"
                        className="h-10 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1.5">
                        <Label htmlFor="gradDegree" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          Degree Title
                        </Label>
                        <Input
                          id="gradDegree"
                          value={formData?.application?.education?.graduation?.degree || ''}
                          onChange={(e) =>
                            handleDeepNestedInputChange('application', 'education', 'graduation', {
                              ...formData?.application?.education?.graduation,
                              degree: e.target.value,
                            })
                          }
                          placeholder="e.g. B.A. Psychology (Hons)"
                          className="h-10 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="gradYear" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          Passing Year
                        </Label>
                        <Input
                          id="gradYear"
                          type="number"
                          min="1960"
                          max={new Date().getFullYear() + 5}
                          value={formData?.application?.education?.graduation?.year || ''}
                          onChange={(e) =>
                            handleDeepNestedInputChange('application', 'education', 'graduation', {
                              ...formData?.application?.education?.graduation,
                              year: e.target.value,
                            })
                          }
                          placeholder="e.g. 2018"
                          className="h-10 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Graduation Section */}
                <div className="rounded-xl p-4 sm:p-5 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-primary-600" />
                      Post Graduation Degree (Master's / M.Phil / Ph.D)
                    </span>
                    <Badge variant="outline" className="text-[10px] text-neutral-500 border-neutral-300">
                      Optional
                    </Badge>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <Label htmlFor="postGradUniversity" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        University / Institute
                      </Label>
                      <Input
                        id="postGradUniversity"
                        value={formData?.application?.education?.postGraduation?.university || ''}
                        onChange={(e) =>
                          handleDeepNestedInputChange('application', 'education', 'postGraduation', {
                            ...formData?.application?.education?.postGraduation,
                            university: e.target.value,
                          })
                        }
                        placeholder="e.g. Tata Institute of Social Sciences (TISS)"
                        className="h-10 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1.5">
                        <Label htmlFor="postGradDegree" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          Degree Title
                        </Label>
                        <Input
                          id="postGradDegree"
                          value={formData?.application?.education?.postGraduation?.degree || ''}
                          onChange={(e) =>
                            handleDeepNestedInputChange('application', 'education', 'postGraduation', {
                              ...formData?.application?.education?.postGraduation,
                              degree: e.target.value,
                            })
                          }
                          placeholder="e.g. M.Sc. Clinical Psychology"
                          className="h-10 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="postGradYear" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          Passing Year
                        </Label>
                        <Input
                          id="postGradYear"
                          type="number"
                          min="1960"
                          max={new Date().getFullYear() + 5}
                          value={formData?.application?.education?.postGraduation?.year || ''}
                          onChange={(e) =>
                            handleDeepNestedInputChange('application', 'education', 'postGraduation', {
                              ...formData?.application?.education?.postGraduation,
                              year: e.target.value,
                            })
                          }
                          placeholder="e.g. 2021"
                          className="h-10 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* License Info Tab */}
              <TabsContent value="license" className="mt-0 space-y-5 focus-visible:outline-none">
                <div className="rounded-xl p-4 bg-primary-50/60 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50 flex items-start gap-3">
                  <BadgeCheck className="h-5 w-5 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-primary-900 dark:text-primary-200 space-y-1">
                    <p className="font-semibold">Professional License & Accreditation</p>
                    <p className="text-primary-700/80 dark:text-primary-300/80 leading-relaxed">
                      Your clinical license or registration details establish practitioner trust and will display a verified badge on your profile once approved.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="licenseNo" className="text-sm font-semibold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                      <FileText className="h-3.5 w-3.5 text-neutral-500" />
                      License / Registration Number
                    </Label>
                    <Input
                      id="licenseNo"
                      value={formData?.application?.license?.licenseNo || ''}
                      onChange={(e) =>
                        handleNestedInputChange('application', 'license', {
                          ...formData?.application?.license,
                          licenseNo: e.target.value,
                        })
                      }
                      placeholder="e.g. RCI/CRR/2023/12345"
                      className="h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-sm"
                    />
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Registration number issued by your professional licensing authority or council.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="issuingAuthority" className="text-sm font-semibold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                      <Building className="h-3.5 w-3.5 text-neutral-500" />
                      Issuing Authority / Council
                    </Label>
                    <Input
                      id="issuingAuthority"
                      value={formData?.application?.license?.issuingAuthority || ''}
                      onChange={(e) =>
                        handleNestedInputChange('application', 'license', {
                          ...formData?.application?.license,
                          issuingAuthority: e.target.value,
                        })
                      }
                      placeholder="e.g. Rehabilitation Council of India (RCI)"
                      className="h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-sm"
                    />
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      The official body or state council that issued your practitioner certification.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Bank Details Tab */}
              <TabsContent value="bank" className="mt-0 space-y-5 focus-visible:outline-none">
                <div className="rounded-xl p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                    <p className="font-semibold">Direct Payout Settlement Account</p>
                    <p className="text-emerald-700/80 dark:text-emerald-300/80 leading-relaxed">
                      Counselor session payouts and earnings will be directly transferred via automated NEFT/IMPS to this bank account.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="accountNo" className="text-sm font-semibold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                      <CreditCard className="h-3.5 w-3.5 text-neutral-500" />
                      Bank Account Number
                    </Label>
                    <Input
                      id="accountNo"
                      type="text"
                      value={formData?.application?.bankDetails?.accountNo || ''}
                      onChange={(e) =>
                        handleNestedInputChange('application', 'bankDetails', {
                          ...formData?.application?.bankDetails,
                          accountNo: e.target.value.replace(/[^a-zA-Z0-9]/g, ''),
                        })
                      }
                      placeholder="e.g. 50100234567891"
                      className="h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-sm font-mono"
                    />
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Double-check your account number to prevent payout transfer delays.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ifscCode" className="text-sm font-semibold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                      <Building className="h-3.5 w-3.5 text-neutral-500" />
                      Bank IFSC Code
                    </Label>
                    <Input
                      id="ifscCode"
                      type="text"
                      maxLength={11}
                      value={formData?.application?.bankDetails?.ifscCode || ''}
                      onChange={(e) =>
                        handleNestedInputChange('application', 'bankDetails', {
                          ...formData?.application?.bankDetails,
                          ifscCode: e.target.value.toUpperCase().trim(),
                        })
                      }
                      placeholder="e.g. HDFC0001234"
                      className="h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-sm font-mono tracking-wider"
                    />
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      11-character bank branch identification code (e.g. HDFC0001234, SBIN0004321).
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="branchName" className="text-sm font-semibold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                      <FileText className="h-3.5 w-3.5 text-neutral-500" />
                      Bank & Branch Name
                    </Label>
                    <Input
                      id="branchName"
                      type="text"
                      value={formData?.application?.bankDetails?.branchName || ''}
                      onChange={(e) =>
                        handleNestedInputChange('application', 'bankDetails', {
                          ...formData?.application?.bankDetails,
                          branchName: e.target.value,
                        })
                      }
                      placeholder="e.g. HDFC Bank, Indiranagar Branch, Bengaluru"
                      className="h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-sm"
                    />
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Branch location or bank name matching your account passbook / statement.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Account Status Tab */}
              <TabsContent value="status" className="mt-0 space-y-5 focus-visible:outline-none">
                {/* Application Status Banner */}
                <div className="rounded-xl p-4 sm:p-5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Practitioner Application Status
                    </span>
                    <Badge className={applicationStatus.color}>
                      {applicationStatus.label}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                    {counselorData.application?.applicationStatus === 'approved' && (
                      <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-lg text-xs text-green-800 dark:text-green-300 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        <span>Your counselor application has been verified and approved. You are eligible to take bookings.</span>
                      </div>
                    )}
                    {counselorData.application?.applicationStatus === 'pending' && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                        <span>Your application is currently under review by our clinical verification team.</span>
                      </div>
                    )}
                    {counselorData.application?.applicationStatus === 'rejected' && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-800 dark:text-red-300 space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                          <span className="font-semibold">Application Requires Updates</span>
                        </div>
                        <p>Please update your credentials and submit again for verification.</p>
                      </div>
                    )}
                    {counselorData.application?.applicationStatus === 'not_submitted' && (
                      <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs text-neutral-700 dark:text-neutral-300 space-y-2">
                        <p>Complete all required profile sections to submit your application for practitioner verification.</p>
                        {profileCompleteness && (
                          <div className="flex items-center justify-between pt-1">
                            <span>Current Completeness:</span>
                            <span className="font-bold text-primary-600">{profileCompleteness.completionPercentage}%</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {(counselorData.application?.applicationStatus === 'not_submitted' ||
                    counselorData.application?.applicationStatus === 'rejected') && (
                    <Button
                      type="button"
                      onClick={handleSubmitApplication}
                      disabled={isLoading || (profileCompleteness && profileCompleteness.completionPercentage < 100)}
                      className="w-full gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium text-xs h-10"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Submit Application for Review
                    </Button>
                  )}
                </div>

                {/* Platform Standing */}
                <div className="rounded-xl p-4 sm:p-5 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Account & Security Overview
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
                      <span className="text-xs text-neutral-500 block">Member Since</span>
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">{formatDate(counselorData.createdAt)}</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
                      <span className="text-xs text-neutral-500 block">Last Active</span>
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">{formatSmartDate(counselorData.lastLogin)}</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60 sm:col-span-2 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-neutral-500 block">Account Status</span>
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">
                          {counselorData.isBlocked ? 'Blocked / Restricted' : 'Active & In Good Standing'}
                        </span>
                      </div>
                      <Badge variant={counselorData.isBlocked ? 'destructive' : 'default'} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        {counselorData.isBlocked ? 'Blocked' : 'Active'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </SheetBody>

            {/* Sticky Footer */}
            <SheetFooter className="p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur shrink-0 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="w-full sm:w-auto text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveChanges}
                className="w-full sm:w-auto gap-2 bg-primary-600 hover:bg-primary-700 text-white shadow-md font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </SheetFooter>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Photo Upload Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a new profile picture. Maximum file size: 5MB
            </DialogDescription>
          </DialogHeader>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                : 'border-neutral-300 dark:border-neutral-700'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              Drag and drop your image here, or
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mx-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            <p className="text-xs text-neutral-500 mt-4">
              Supported formats: PNG, JPG, JPEG, WEBP (Max: 5MB)
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Crop Dialog */}
      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop Profile Picture</DialogTitle>
            <DialogDescription>Adjust the crop area and rotation to your liking</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Cropper */}
            <div className="relative h-96 bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-hidden">
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

            {/* Controls */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm flex items-center justify-between mb-2">
                  <span>Zoom</span>
                  <span className="text-neutral-500">{Math.round(zoom * 100)}%</span>
                </Label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <Label className="text-sm flex items-center justify-between mb-2">
                  <span>Rotation</span>
                  <span className="text-neutral-500">{rotation}°</span>
                </Label>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCropDialogOpen(false);
                  setSelectedImage(null);
                }}
                className="flex-1"
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleCropConfirm} className="flex-1" disabled={isLoading}>
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            <img
              src={counselorData?.profilePicture}
              alt={counselorData?.fullName}
              className="max-h-[70vh] rounded-lg object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

// Helper Component for Info Rows
const InfoRow = ({ icon: Icon, label, value, tooltip, compact = false }) => {
  const content = (
    <div className={`flex items-start gap-3 ${compact ? 'py-1' : 'py-2'}`}>
      {Icon && (
        <Icon className="h-5 w-5 text-neutral-500 dark:text-neutral-400 mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{label}</p>
        <p className="text-base font-medium text-neutral-900 dark:text-neutral-100 break-words">
          {value || 'Not provided'}
        </p>
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <div title={tooltip} className="cursor-help">
        {content}
      </div>
    );
  }

  return content;
};

export default CounselorDashboardPersonalInfo;
