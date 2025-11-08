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
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { TIMEZONE } from '../../../constants/constants';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

// Configure Day.js plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

// Specializations from model
const SPECIALIZATIONS = [
  'Mental Health',
  'Career Counselling',
  'Relationship & Family Therapy',
  'Life & Personal Development',
  'Financial Counselling',
  'Academic Counselling',
  'Health and Wellness Counselling',
];

// Languages from model
const LANGUAGES = ['English', 'Hindi'];

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
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.COUNSELOR_PROFILE_GET}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch counselor data');
      }

      const result = await response.json();
      console.log(result);
      const data = result.data || result;

      const transformedData = {
        fullName: data.fullName || '',
        username: data.username || '',
        email: data.email || '',
        phone: data.phone || '',
        gender: data.gender || '',
        profilePicture: data.profilePicture || '',
        // specialization: data.specialization || '',
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
          languages: data.application?.languages || [],
          license: {
            licenseNo: data.application?.license?.licenseNo || '',
            issuingAuthority: data.application?.license?.issuingAuthority || '',
          },
          bankDetails: {
            accountNo: data.application?.bankDetails?.accountNo || '',
            ifscCode: data.application?.bankDetails?.ifscCode || '',
            branchName: data.application?.bankDetails?.branchName || '',
          },
          applicationStatus: data.application?.applicationStatus || 'not_submitted',
          applicationSubmittedAt: data.application?.applicationSubmittedAt || null,
        },
        lastLogin: data.lastLogin,
        createdAt: data.createdAt,
        isBlocked: data.isBlocked || false,
      };

      setCounselorData(transformedData);
      setFormData(transformedData);
    } catch (err) {
      console.error('Error fetching counselor data:', err);
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
        `${API_BASE_URL}${API_ENDPOINTS.COUNSELOR_PROFILE_COMPLETENESS}`,
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

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.COUNSELOR_PROFILE_UPDATE}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      setCounselorData(formData);
      setIsEditDialogOpen(false);
      fetchProfileCompleteness();

      toast.success('Profile Updated Successfully', {
        description: 'Your professional information has been saved.',
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

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.COUNSELOR_PROFILE_PICTURE_UPDATE}`,
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

      const storedCounselorData = JSON.parse(localStorage.getItem('counselor'));
      storedCounselorData.profilePicture = newProfilePicture;
      localStorage.setItem('counselor', JSON.stringify(storedCounselorData));

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
            Manage your professional information and credentials
          </p>
        </div>

        {profileCompleteness && (!profileCompleteness.isComplete)(
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
                onClick={() => setIsEditDialogOpen(true)}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow icon={User} label="Full Name" value={counselorData.fullName} />
              <InfoRow icon={Mail} label="Email" value={counselorData.email} />
              <InfoRow icon={Phone} label="Phone" value={counselorData.phone} />
              <InfoRow icon={User} label="Gender" value={counselorData.gender} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Professional Details */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary-600" />
                Professional Details
              </CardTitle>
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
                value={counselorData.application.languages.join(', ') || 'Not specified'}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Education */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary-600" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Graduation */}
              <div>
                <Label className="text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                  Graduation
                </Label>
                <div className="mt-2 space-y-2">
                  <InfoRow
                    icon={Building}
                    label="University"
                    value={
                      counselorData.application.education.graduation.university || 'Not specified'
                    }
                    compact
                  />
                  <InfoRow
                    icon={GraduationCap}
                    label="Degree"
                    value={counselorData.application.education.graduation.degree || 'Not specified'}
                    compact
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Year"
                    value={counselorData.application.education.graduation.year || 'Not specified'}
                    compact
                  />
                </div>
              </div>

              {/* Post Graduation */}
              {(counselorData.application.education.postGraduation.university ||
                counselorData.application.education.postGraduation.degree) && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-xs text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                      Post Graduation
                    </Label>
                    <div className="mt-2 space-y-2">
                      <InfoRow
                        icon={Building}
                        label="University"
                        value={
                          counselorData.application.education.postGraduation.university ||
                          'Not specified'
                        }
                        compact
                      />
                      <InfoRow
                        icon={GraduationCap}
                        label="Degree"
                        value={
                          counselorData.application.education.postGraduation.degree ||
                          'Not specified'
                        }
                        compact
                      />
                      <InfoRow
                        icon={Calendar}
                        label="Year"
                        value={
                          counselorData.application.education.postGraduation.year || 'Not specified'
                        }
                        compact
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* License Information */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-primary-600" />
                License Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow
                icon={FileText}
                label="License Number"
                value={counselorData.application.license.licenseNo || 'Not specified'}
              />
              <InfoRow
                icon={Building}
                label="Issuing Authority"
                value={counselorData.application.license.issuingAuthority || 'Not specified'}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Bank Details */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary-600" />
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow
                icon={CreditCard}
                label="Account Number"
                value={
                  counselorData.application.bankDetails.accountNo
                    ? `****${counselorData.application.bankDetails.accountNo.slice(-4)}`
                    : 'Not specified'
                }
              />
              <InfoRow
                icon={FileText}
                label="IFSC Code"
                value={counselorData.application.bankDetails.ifscCode || 'Not specified'}
              />
              <InfoRow
                icon={Building}
                label="Branch"
                value={counselorData.application.bankDetails.branchName || 'Not specified'}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Status */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-600" />
                Account Status
              </CardTitle>
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

      {/* Edit Profile Dialog */}
      <Sheet open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Professional Profile
            </SheetTitle>
            <SheetDescription>
              Update your professional information and credentials
            </SheetDescription>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData?.fullName || ''}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData?.username || ''}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData?.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 1234567890"
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData?.gender || ''}
                    onValueChange={(value) => handleInputChange('gender', value)}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
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
            <TabsContent value="professional" className="space-y-4 mt-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Select
                    value={formData?.specialization || ''}
                    onValueChange={(value) => handleInputChange('specialization', value)}
                  >
                    <SelectTrigger id="specialization">
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALIZATIONS.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experienceYears">Years of Experience *</Label>
                  <Input
                    id="experienceYears"
                    type="number"
                    min="0"
                    value={formData?.experienceYears || ''}
                    onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value))}
                    placeholder="Enter years of experience"
                  />
                </div>

                <div>
                  <Label htmlFor="professionalSummary">Professional Summary</Label>
                  <Textarea
                    id="professionalSummary"
                    value={formData?.application?.professionalSummary || ''}
                    onChange={(e) =>
                      handleNestedInputChange('application', 'professionalSummary', e.target.value)
                    }
                    placeholder="Brief summary of your professional background..."
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    {formData?.application?.professionalSummary?.length || 0}/1000 characters
                  </p>
                </div>

                <div>
                  <Label>Languages</Label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {LANGUAGES.map((lang) => (
                      <div key={lang} className="flex items-center space-x-2">
                        <Checkbox
                          id={`lang-${lang}`}
                          checked={formData?.application?.languages?.includes(lang) || false}
                          onCheckedChange={(checked) => {
                            const currentLangs = formData?.application?.languages || [];
                            const newLangs = checked
                              ? [...currentLangs, lang]
                              : currentLangs.filter((l) => l !== lang);
                            handleNestedInputChange('application', 'languages', newLangs);
                          }}
                        />
                        <Label htmlFor={`lang-${lang}`} className="cursor-pointer">
                          {lang}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Credentials Tab */}
            <TabsContent value="credentials" className="space-y-4 mt-6">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="grid gap-6 pr-4">
                  {/* Education */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Graduation</Label>
                    <div className="grid gap-4 pl-4 border-l-2 border-primary-200 dark:border-primary-800">
                      <div>
                        <Label htmlFor="gradUniv">University</Label>
                        <Input
                          id="gradUniv"
                          value={formData?.application?.education?.graduation?.university || ''}
                          onChange={(e) =>
                            handleDeepNestedInputChange('application', 'education', 'graduation', {
                              ...formData.application.education.graduation,
                              university: e.target.value,
                            })
                          }
                          placeholder="University name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gradDegree">Degree</Label>
                        <Input
                          id="gradDegree"
                          value={formData?.application?.education?.graduation?.degree || ''}
                          onChange={(e) =>
                            handleDeepNestedInputChange('application', 'education', 'graduation', {
                              ...formData.application.education.graduation,
                              degree: e.target.value,
                            })
                          }
                          placeholder="Degree name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gradYear">Year</Label>
                        <Input
                          id="gradYear"
                          type="number"
                          value={formData?.application?.education?.graduation?.year || ''}
                          onChange={(e) =>
                            handleDeepNestedInputChange('application', 'education', 'graduation', {
                              ...formData.application.education.graduation,
                              year: parseInt(e.target.value),
                            })
                          }
                          placeholder="Graduation year"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Post Graduation */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Post Graduation (Optional)</Label>
                    <div className="grid gap-4 pl-4 border-l-2 border-primary-200 dark:border-primary-800">
                      <div>
                        <Label htmlFor="pgUniv">University</Label>
                        <Input
                          id="pgUniv"
                          value={formData?.application?.education?.postGraduation?.university || ''}
                          onChange={(e) =>
                            handleDeepNestedInputChange(
                              'application',
                              'education',
                              'postGraduation',
                              {
                                ...formData.application.education.postGraduation,
                                university: e.target.value,
                              }
                            )
                          }
                          placeholder="University name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pgDegree">Degree</Label>
                        <Input
                          id="pgDegree"
                          value={formData?.application?.education?.postGraduation?.degree || ''}
                          onChange={(e) =>
                            handleDeepNestedInputChange(
                              'application',
                              'education',
                              'postGraduation',
                              {
                                ...formData.application.education.postGraduation,
                                degree: e.target.value,
                              }
                            )
                          }
                          placeholder="Degree name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pgYear">Year</Label>
                        <Input
                          id="pgYear"
                          type="number"
                          value={formData?.application?.education?.postGraduation?.year || ''}
                          onChange={(e) =>
                            handleDeepNestedInputChange(
                              'application',
                              'education',
                              'postGraduation',
                              {
                                ...formData.application.education.postGraduation,
                                year: parseInt(e.target.value),
                              }
                            )
                          }
                          placeholder="Graduation year"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* License */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">License Information</Label>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="licenseNo">License Number</Label>
                        <Input
                          id="licenseNo"
                          value={formData?.application?.license?.licenseNo || ''}
                          onChange={(e) =>
                            handleDeepNestedInputChange(
                              'application',
                              'license',
                              'licenseNo',
                              e.target.value
                            )
                          }
                          placeholder="License number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="issuingAuth">Issuing Authority</Label>
                        <Input
                          id="issuingAuth"
                          value={formData?.application?.license?.issuingAuthority || ''}
                          onChange={(e) =>
                            handleDeepNestedInputChange(
                              'application',
                              'license',
                              'issuingAuthority',
                              e.target.value
                            )
                          }
                          placeholder="Issuing authority name"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Bank Details */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Bank Details</Label>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="accountNo">Account Number</Label>
                        <Input
                          id="accountNo"
                          value={formData?.application?.bankDetails?.accountNo || ''}
                          onChange={(e) =>
                            handleDeepNestedInputChange(
                              'application',
                              'bankDetails',
                              'accountNo',
                              e.target.value
                            )
                          }
                          placeholder="Bank account number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ifscCode">IFSC Code</Label>
                        <Input
                          id="ifscCode"
                          value={formData?.application?.bankDetails?.ifscCode || ''}
                          onChange={(e) =>
                            handleDeepNestedInputChange(
                              'application',
                              'bankDetails',
                              'ifscCode',
                              e.target.value
                            )
                          }
                          placeholder="IFSC code"
                        />
                      </div>
                      <div>
                        <Label htmlFor="branchName">Branch Name</Label>
                        <Input
                          id="branchName"
                          value={formData?.application?.bankDetails?.branchName || ''}
                          onChange={(e) =>
                            handleDeepNestedInputChange(
                              'application',
                              'bankDetails',
                              'branchName',
                              e.target.value
                            )
                          }
                          placeholder="Branch name"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setFormData(counselorData);
                setIsEditDialogOpen(false);
              }}
              className="flex-1"
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} className="flex-1" disabled={isLoading}>
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
