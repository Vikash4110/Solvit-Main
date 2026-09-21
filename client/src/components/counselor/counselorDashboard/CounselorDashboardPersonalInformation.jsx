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
  Plus,
  FileQuestion,
  ArrowRight,
  Send,
  ShieldCheck,
  Layers,
  Share2,
} from 'lucide-react';
import ShareProfileModal from '@/components/common/ShareProfileModal.jsx';
import { toast } from 'sonner';
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

// Languages from model / constants
const LANGUAGES = DEFAULT_LANGUAGES;

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
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
  const [customLanguageInput, setCustomLanguageInput] = useState('');

  const handleAddCustomLanguage = (e) => {
    if (e) e.preventDefault();
    const trimmed = customLanguageInput.trim();
    if (!trimmed) return;
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    const currentLangs = normalizeLanguages(formData?.application?.languages);
    if (currentLangs.some((l) => l.toLowerCase() === formatted.toLowerCase())) {
      toast.info(`${formatted} is already selected`);
      setCustomLanguageInput('');
      return;
    }
    const newLangs = [...currentLangs, formatted];
    handleNestedInputChange('application', 'languages', newLangs);
    setCustomLanguageInput('');
    toast.success(`Added ${formatted} to languages spoken`);
  };

  const handleRemoveCustomLanguage = (langToRemove) => {
    const currentLangs = normalizeLanguages(formData?.application?.languages);
    const newLangs = currentLangs.filter((l) => l !== langToRemove);
    handleNestedInputChange('application', 'languages', newLangs);
  };

  // Profile Requests state
  const [profileRequests, setProfileRequests] = useState([]);
  const [isRequestChangeModalOpen, setIsRequestChangeModalOpen] = useState(false);
  const [requestedSpecialization, setRequestedSpecialization] = useState([]);
  const [requestedExperienceYears, setRequestedExperienceYears] = useState(0);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmittingChangeRequest, setIsSubmittingChangeRequest] = useState(false);

  const fetchProfileRequests = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.COUNSELOR_PROFILE_REQUESTS_GET);
      setProfileRequests(res.data?.data || []);
    } catch (err) {
      console.warn('Could not fetch profile requests:', err);
    }
  };

  const handleOpenRequestChangeModal = () => {
    const pendingReq = profileRequests.find((r) => r.status === 'pending');
    if (pendingReq) {
      toast.info('You already have a change request pending admin review');
      return;
    }
    setRequestedSpecialization(
      Array.isArray(counselorData?.specialization)
        ? [...counselorData.specialization]
        : counselorData?.specialization
        ? [counselorData.specialization]
        : []
    );
    setRequestedExperienceYears(counselorData?.experienceYears ?? 0);
    setRequestMessage('');
    setIsRequestChangeModalOpen(true);
  };

  const handleToggleRequestedSpec = (val) => {
    if (requestedSpecialization.includes(val)) {
      if (requestedSpecialization.length === 1) {
        toast.warning('Please keep at least one specialization selected.');
        return;
      }
      setRequestedSpecialization((prev) => prev.filter((s) => s !== val));
    } else {
      setRequestedSpecialization((prev) => [...prev, val]);
    }
  };

  const handleAddRequestedSpec = (val) => {
    if (!requestedSpecialization.includes(val)) {
      setRequestedSpecialization((prev) => [...prev, val]);
    }
  };

  const handleRemoveRequestedSpec = (val) => {
    if (requestedSpecialization.length === 1) {
      toast.warning('Please keep at least one specialization selected.');
      return;
    }
    setRequestedSpecialization((prev) => prev.filter((s) => s !== val));
  };

  const getComputedLevel = (years) => {
    const num = Number(years) || 0;
    if (num < 2) return 'Beginner';
    if (num < 5) return 'Intermediate';
    if (num < 10) return 'Experienced';
    return 'Specialist';
  };

  const handleSubmitProfileChangeRequest = async (e) => {
    if (e) e.preventDefault();
    if (!requestedSpecialization || requestedSpecialization.length === 0) {
      toast.error('Validation Error', {
        description: 'Please select at least one area of specialization.',
      });
      return;
    }
    if (
      requestedExperienceYears === undefined ||
      requestedExperienceYears === '' ||
      isNaN(Number(requestedExperienceYears)) ||
      Number(requestedExperienceYears) < 0
    ) {
      toast.error('Validation Error', {
        description: 'Please enter a valid number for years of experience.',
      });
      return;
    }
    if (!requestMessage.trim()) {
      toast.error('Validation Error', {
        description: 'Please provide a message / reason explaining your request for admin.',
      });
      return;
    }

    setIsSubmittingChangeRequest(true);
    try {
      await api.post(API_ENDPOINTS.COUNSELOR_PROFILE_REQUEST_SUBMIT, {
        requestedSpecialization,
        requestedExperienceYears: Number(requestedExperienceYears),
        message: requestMessage.trim(),
      });
      toast.success('Change Request Submitted', {
        description: 'Your request has been submitted and is pending review by Solvit Admin.',
      });
      setIsRequestChangeModalOpen(false);
      await fetchProfileRequests();
    } catch (err) {
      toast.error('Submission Failed', {
        description: err.response?.data?.message || err.message || 'Failed to submit change request',
      });
    } finally {
      setIsSubmittingChangeRequest(false);
    }
  };

  // Fetch counselor data on mount
  useEffect(() => {
    fetchCounselorData();
    fetchProfileCompleteness();
    fetchProfileRequests();
  }, []);

  const fetchCounselorData = async () => {
    setIsFetching(true);
    setError(null);
    try {
      const response = await api.get(API_ENDPOINTS.COUNSELOR_PROFILE_GET);
      const data = response.data?.data || response.data;

      const transformedData = {
        _id: data._id || data.id || '',
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

    const isVerified = counselorData?.application?.applicationStatus === 'approved';

    if (!isVerified) {
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

      // Optional education year validations when not verified
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

    setIsLoading(true);

    try {
      const changedData = {
        username: formData.username.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        professionalSummary: formData.application?.professionalSummary || '',
        languages: normalizeLanguages(formData?.application?.languages),
        bankDetails: {
          accountNo: formData.application?.bankDetails?.accountNo?.trim() || '',
          ifscCode: formData.application?.bankDetails?.ifscCode?.trim()?.toUpperCase() || '',
          branchName: formData.application?.bankDetails?.branchName?.trim() || '',
        },
      };

      if (!isVerified) {
        changedData.specialization = formData.specialization;
        changedData.experienceYears = parseInt(formData.experienceYears, 10) || 0;
        changedData.education = {
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
        };
        changedData.license = {
          licenseNo: formData.application?.license?.licenseNo?.trim() || '',
          issuingAuthority: formData.application?.license?.issuingAuthority?.trim() || '',
        };
      }

      await api.put(API_ENDPOINTS.COUNSELOR_PROFILE_UPDATE, changedData);

      await fetchCounselorData();
      await fetchProfileCompleteness();
      setIsEditDialogOpen(false);

      toast.success('Profile Updated Successfully', {
        description: 'Your profile changes have been saved.',
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
          <div className="h-32 sm:h-36 lg:h-40 bg-gradient-to-r from-primary-500 to-primary-700" />
          <CardContent className="relative pt-0 pb-6 sm:pb-8">
            <div className="flex flex-col md:flex-row items-start justify-between gap-5 sm:gap-6 -mt-16 sm:mt-0">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 flex-1 min-w-0">
                {/* Profile Picture */}
                <div className="relative group shrink-0 sm:-mt-18 lg:-mt-20">
                  <Avatar className="h-28 w-28 sm:h-36 sm:w-36 lg:h-40 lg:w-40 border-4 border-white dark:border-neutral-900 shadow-xl ring-4 ring-primary-500/10">
                    <AvatarImage src={counselorData.profilePicture} alt={counselorData.fullName} />
                    <AvatarFallback className="text-3xl md:text-4xl bg-primary-100 dark:bg-primary-900/30">
                      {counselorData.fullName?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Edit Photo Button */}
                  <Button
                    size="sm"
                    variant="default"
                    className="absolute bottom-0 right-0 h-9 w-9 sm:h-10 sm:w-10 rounded-full shadow-lg p-0 cursor-pointer"
                    onClick={() => setIsPhotoDialogOpen(true)}
                  >
                    <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>

                  {/* View Photo Button */}
                  {counselorData.profilePicture && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-0 right-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full shadow-md p-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => setIsViewPhotoDialogOpen(true)}
                    >
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-2 sm:space-y-2.5 min-w-0 sm:pt-3 lg:pt-4">
                  <div>
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap min-w-0">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                        {counselorData.fullName}
                      </h2>
                      {counselorData.application?.applicationStatus === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs shrink-0 whitespace-nowrap" title="Verified Counselor">
                          <BadgeCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 fill-blue-500/20 shrink-0" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-0.5 font-medium text-xs sm:text-sm">
                      @{counselorData.username}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={experienceBadge.color}>
                      {experienceBadge.icon && <experienceBadge.icon className="h-3.5 w-3.5 mr-1" />}
                      {counselorData.experienceLevel} ({counselorData.experienceYears}{' '}
                      {counselorData.experienceYears <= 1 ? 'year' : 'years'})
                    </Badge>
                  </div>

                  {counselorData.application?.professionalSummary &&
                    !['na', 'n/a', 'none', 'null', 'undefined', '-'].includes(
                      counselorData.application.professionalSummary.trim().toLowerCase()
                    ) && (
                      <p className="text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm md:text-base max-w-3xl leading-relaxed">
                        {counselorData.application.professionalSummary}
                      </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 mt-3 md:mt-0 w-full md:w-auto shrink-0 self-stretch sm:self-start md:self-start md:pt-3 lg:pt-4">
                <Button
                  onClick={() => setIsShareModalOpen(true)}
                  variant="outline"
                  size="default"
                  className="gap-2 border-primary-500/40 hover:bg-primary-50 dark:hover:bg-primary-950/50 text-primary-700 dark:text-primary-300 font-medium shadow-sm flex-1 md:flex-initial justify-center whitespace-nowrap cursor-pointer"
                >
                  <Share2 className="h-4 w-4 shrink-0" />
                  <span>Share Profile</span>
                </Button>

                <Button
                  onClick={handleOpenEditModal}
                  size="default"
                  className="gap-2 flex-1 md:flex-initial justify-center whitespace-nowrap cursor-pointer"
                >
                  <Edit className="h-4 w-4 shrink-0" />
                  <span>Edit Profile</span>
                </Button>
              </div>
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
                {counselorData.application?.applicationStatus === 'approved' ? (
                  <Badge
                    variant="outline"
                    className="h-7 text-xs gap-1.5 px-2.5 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800"
                  >
                    <Lock className="h-3 w-3 text-emerald-600" />
                    Verified & Locked
                  </Badge>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditModal('education')}
                    className="h-8 gap-1.5 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                )}
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
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="h-5 w-5 text-primary-600 shrink-0" />
                  <span>Professional Details</span>
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  {counselorData.application?.applicationStatus === 'approved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenRequestChangeModal}
                      className="h-8 gap-1.5 text-xs text-blue-700 border-blue-200 bg-blue-50/60 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900 whitespace-nowrap shrink-0"
                    >
                      <FileQuestion className="h-3.5 w-3.5 shrink-0" />
                      <span>Request Change</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditModal('professional')}
                    className="h-8 gap-1.5 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/50 whitespace-nowrap shrink-0"
                  >
                    <Pencil className="h-3.5 w-3.5 shrink-0" />
                    <span>Edit</span>
                  </Button>
                </div>
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
                {counselorData.application?.applicationStatus === 'approved' ? (
                  <Badge
                    variant="outline"
                    className="h-7 text-xs gap-1.5 px-2.5 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800"
                  >
                    <Lock className="h-3 w-3 text-emerald-600" />
                    Verified & Locked
                  </Badge>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditModal('license')}
                    className="h-8 gap-1.5 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                )}
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
                    {counselorData.application?.applicationStatus === 'approved' && (
                      <Lock className="h-2.5 w-2.5 text-neutral-400 ml-0.5" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="license"
                    className="flex items-center gap-1.5 rounded-lg font-semibold text-xs sm:text-sm py-2 px-3 transition-all cursor-pointer select-none data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm data-[state=active]:text-primary-700 dark:data-[state=active]:text-primary-300 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 whitespace-nowrap"
                  >
                    <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>License</span>
                    {counselorData.application?.applicationStatus === 'approved' && (
                      <Lock className="h-2.5 w-2.5 text-neutral-400 ml-0.5" />
                    )}
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
                {/* Active Pending Request Banner */}
                {profileRequests.find((r) => r.status === 'pending') && (
                  <div className="rounded-xl p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
                    <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Specialization & Experience Change Request Pending</p>
                      <p className="text-amber-700 dark:text-amber-300 mt-0.5">
                        Your submitted change request ({profileRequests.find((r) => r.status === 'pending')?.requestedSpecialization?.join(', ')} | {profileRequests.find((r) => r.status === 'pending')?.requestedExperienceYears} yrs) is currently under review by Solvit Admin.
                      </p>
                    </div>
                  </div>
                )}

                {/* Specialization Selection */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Label htmlFor="specialization" className="text-sm font-semibold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                        <Award className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                        <span>Areas of Specialization</span> <span className="text-red-500">*</span>
                      </Label>
                      {counselorData.application?.applicationStatus === 'approved' && (
                        <Badge variant="outline" className="text-[10px] gap-1 text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 font-normal shrink-0">
                          <Lock className="h-2.5 w-2.5" /> Verified
                        </Badge>
                      )}
                    </div>
                    {counselorData.application?.applicationStatus === 'approved' ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleOpenRequestChangeModal}
                        className="h-7 text-xs gap-1.5 text-blue-700 border-blue-300 bg-blue-50/60 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800 whitespace-nowrap shrink-0"
                      >
                        <FileQuestion className="h-3 w-3 shrink-0" />
                        <span>Request Change</span>
                      </Button>
                    ) : (
                      <span className="text-[11px] text-neutral-500 font-medium shrink-0">
                        {formData?.specialization?.length || 0} selected
                      </span>
                    )}
                  </div>

                  {counselorData.application?.applicationStatus === 'approved' ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 pt-1">
                        {formData?.specialization?.map((spec) => (
                          <Badge
                            key={spec}
                            variant="secondary"
                            className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 text-xs font-medium rounded-lg shadow-sm"
                          >
                            <span>{spec}</span>
                          </Badge>
                        ))}
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        Since your profile is verified, specialization areas cannot be directly edited. Use the <strong>Request Change</strong> button above to propose updates.
                      </p>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>

                {/* Experience Years */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Label htmlFor="experienceYears" className="text-sm font-semibold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                        <Briefcase className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                        <span>Years of Experience</span> <span className="text-red-500">*</span>
                      </Label>
                      {counselorData.application?.applicationStatus === 'approved' && (
                        <Badge variant="outline" className="text-[10px] gap-1 text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 font-normal shrink-0">
                          <Lock className="h-2.5 w-2.5" /> Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Input
                    id="experienceYears"
                    type="number"
                    min="0"
                    max="60"
                    disabled={counselorData.application?.applicationStatus === 'approved'}
                    value={formData?.experienceYears ?? ''}
                    onChange={(e) =>
                      handleInputChange(
                        'experienceYears',
                        e.target.value === '' ? '' : parseInt(e.target.value, 10)
                      )
                    }
                    placeholder="e.g. 5"
                    className={`h-11 border-neutral-300 dark:border-neutral-700 text-sm ${
                      counselorData.application?.applicationStatus === 'approved'
                        ? 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 cursor-not-allowed'
                        : 'bg-white dark:bg-neutral-800 focus-visible:ring-primary-500'
                    }`}
                  />
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {counselorData.application?.applicationStatus === 'approved'
                      ? 'Years of experience is locked based on clinical verification. Request updates via admin.'
                      : 'Total years of verified practice in counselling or mental wellness.'}
                  </p>
                </div>

                {/* Languages - ALWAYS DIRECTLY EDITABLE */}
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

                  {/* Custom Languages Added */}
                  {normalizeLanguages(formData?.application?.languages).filter(
                    (l) => !LANGUAGES.includes(l)
                  ).length > 0 && (
                    <div className="pt-2 space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                        Custom Added Languages:
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {normalizeLanguages(formData?.application?.languages)
                          .filter((l) => !LANGUAGES.includes(l))
                          .map((customLang) => (
                            <Badge
                              key={customLang}
                              variant="secondary"
                              className="bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200 border border-primary-300 dark:border-primary-700 pl-2.5 pr-1 py-1 gap-1 flex items-center text-xs"
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
                        placeholder="Other language not listed? Type here (e.g., French, Marwari)..."
                        value={customLanguageInput}
                        onChange={(e) => setCustomLanguageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomLanguage();
                          }
                        }}
                        className="h-9 text-xs pr-8"
                      />
                      {customLanguageInput && (
                        <button
                          type="button"
                          onClick={() => setCustomLanguageInput('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
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
                      className="h-9 px-3 text-xs gap-1.5 shrink-0 hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-950/50 border-neutral-300 dark:border-neutral-700"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Language
                    </Button>
                  </div>
                </div>

                {/* Professional Summary - ALWAYS DIRECTLY EDITABLE */}
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
                {counselorData.application?.applicationStatus === 'approved' ? (
                  <div className="rounded-xl p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
                    <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                      <p className="font-semibold">Academic Credentials Verified & Locked</p>
                      <p className="text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                        Your university degrees were verified during your counselor application approval. Verified qualifications cannot be edited directly.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl p-4 bg-primary-50/60 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50 flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-primary-900 dark:text-primary-200 space-y-1">
                      <p className="font-semibold">Academic & Professional Credentials</p>
                      <p className="text-primary-700/80 dark:text-primary-300/80 leading-relaxed">
                        Adding your university degrees helps clients understand your training in psychology, counselling, or healthcare.
                      </p>
                    </div>
                  </div>
                )}

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
                        disabled={counselorData.application?.applicationStatus === 'approved'}
                        value={formData?.application?.education?.graduation?.university || ''}
                        onChange={(e) =>
                          handleDeepNestedInputChange('application', 'education', 'graduation', {
                            ...formData?.application?.education?.graduation,
                            university: e.target.value,
                          })
                        }
                        placeholder="e.g. University of Delhi"
                        className={`h-10 border-neutral-300 dark:border-neutral-700 text-sm ${
                          counselorData.application?.applicationStatus === 'approved'
                            ? 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 cursor-not-allowed'
                            : 'bg-white dark:bg-neutral-800'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1.5">
                        <Label htmlFor="gradDegree" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          Degree Title
                        </Label>
                        <Input
                          id="gradDegree"
                          disabled={counselorData.application?.applicationStatus === 'approved'}
                          value={formData?.application?.education?.graduation?.degree || ''}
                          onChange={(e) =>
                            handleDeepNestedInputChange('application', 'education', 'graduation', {
                              ...formData?.application?.education?.graduation,
                              degree: e.target.value,
                            })
                          }
                          placeholder="e.g. B.A. Psychology (Hons)"
                          className={`h-10 border-neutral-300 dark:border-neutral-700 text-sm ${
                            counselorData.application?.applicationStatus === 'approved'
                              ? 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 cursor-not-allowed'
                              : 'bg-white dark:bg-neutral-800'
                          }`}
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
                          disabled={counselorData.application?.applicationStatus === 'approved'}
                          value={formData?.application?.education?.graduation?.year || ''}
                          onChange={(e) =>
                            handleDeepNestedInputChange('application', 'education', 'graduation', {
                              ...formData?.application?.education?.graduation,
                              year: e.target.value,
                            })
                          }
                          placeholder="e.g. 2018"
                          className={`h-10 border-neutral-300 dark:border-neutral-700 text-sm ${
                            counselorData.application?.applicationStatus === 'approved'
                              ? 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 cursor-not-allowed'
                              : 'bg-white dark:bg-neutral-800'
                          }`}
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
                        disabled={counselorData.application?.applicationStatus === 'approved'}
                        value={formData?.application?.education?.postGraduation?.university || ''}
                        onChange={(e) =>
                          handleDeepNestedInputChange('application', 'education', 'postGraduation', {
                            ...formData?.application?.education?.postGraduation,
                            university: e.target.value,
                          })
                        }
                        placeholder="e.g. Tata Institute of Social Sciences (TISS)"
                        className={`h-10 border-neutral-300 dark:border-neutral-700 text-sm ${
                          counselorData.application?.applicationStatus === 'approved'
                            ? 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 cursor-not-allowed'
                            : 'bg-white dark:bg-neutral-800'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1.5">
                        <Label htmlFor="postGradDegree" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          Degree Title
                        </Label>
                        <Input
                          id="postGradDegree"
                          disabled={counselorData.application?.applicationStatus === 'approved'}
                          value={formData?.application?.education?.postGraduation?.degree || ''}
                          onChange={(e) =>
                            handleDeepNestedInputChange('application', 'education', 'postGraduation', {
                              ...formData?.application?.education?.postGraduation,
                              degree: e.target.value,
                            })
                          }
                          placeholder="e.g. M.Sc. Clinical Psychology"
                          className={`h-10 border-neutral-300 dark:border-neutral-700 text-sm ${
                            counselorData.application?.applicationStatus === 'approved'
                              ? 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 cursor-not-allowed'
                              : 'bg-white dark:bg-neutral-800'
                          }`}
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
                          disabled={counselorData.application?.applicationStatus === 'approved'}
                          value={formData?.application?.education?.postGraduation?.year || ''}
                          onChange={(e) =>
                            handleDeepNestedInputChange('application', 'education', 'postGraduation', {
                              ...formData?.application?.education?.postGraduation,
                              year: e.target.value,
                            })
                          }
                          placeholder="e.g. 2021"
                          className={`h-10 border-neutral-300 dark:border-neutral-700 text-sm ${
                            counselorData.application?.applicationStatus === 'approved'
                              ? 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 cursor-not-allowed'
                              : 'bg-white dark:bg-neutral-800'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* License Info Tab */}
              <TabsContent value="license" className="mt-0 space-y-5 focus-visible:outline-none">
                {counselorData.application?.applicationStatus === 'approved' ? (
                  <div className="rounded-xl p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
                    <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                      <p className="font-semibold">Professional License Verified & Locked</p>
                      <p className="text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                        Your licensing and council registration credentials were validated during your practitioner application approval. License details cannot be edited directly on verified profiles.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl p-4 bg-primary-50/60 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50 flex items-start gap-3">
                    <BadgeCheck className="h-5 w-5 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-primary-900 dark:text-primary-200 space-y-1">
                      <p className="font-semibold">Professional License & Accreditation</p>
                      <p className="text-primary-700/80 dark:text-primary-300/80 leading-relaxed">
                        Your clinical license or registration details establish practitioner trust and will display a verified badge on your profile once approved.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="licenseNo" className="text-sm font-semibold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                      <FileText className="h-3.5 w-3.5 text-neutral-500" />
                      License / Registration Number
                    </Label>
                    <Input
                      id="licenseNo"
                      disabled={counselorData.application?.applicationStatus === 'approved'}
                      value={formData?.application?.license?.licenseNo || ''}
                      onChange={(e) =>
                        handleNestedInputChange('application', 'license', {
                          ...formData?.application?.license,
                          licenseNo: e.target.value,
                        })
                      }
                      placeholder="e.g. RCI/CRR/2023/12345"
                      className={`h-11 border-neutral-300 dark:border-neutral-700 text-sm ${
                        counselorData.application?.applicationStatus === 'approved'
                          ? 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 cursor-not-allowed'
                          : 'bg-white dark:bg-neutral-800'
                      }`}
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
                      disabled={counselorData.application?.applicationStatus === 'approved'}
                      value={formData?.application?.license?.issuingAuthority || ''}
                      onChange={(e) =>
                        handleNestedInputChange('application', 'license', {
                          ...formData?.application?.license,
                          issuingAuthority: e.target.value,
                        })
                      }
                      placeholder="e.g. Rehabilitation Council of India (RCI)"
                      className={`h-11 border-neutral-300 dark:border-neutral-700 text-sm ${
                        counselorData.application?.applicationStatus === 'approved'
                          ? 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 cursor-not-allowed'
                          : 'bg-white dark:bg-neutral-800'
                      }`}
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

      {/* Request Change for Specialization & Experience Dialog */}
      <Dialog open={isRequestChangeModalOpen} onOpenChange={setIsRequestChangeModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[92vh] p-0 overflow-hidden flex flex-col rounded-2xl shadow-2xl border-neutral-200/80 dark:border-neutral-800">
          {/* Header Banner */}
          <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 text-white p-5 sm:p-6 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white shadow-inner">
                  <Sparkles className="h-6 w-6 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-xl font-bold text-white tracking-tight">
                      Request Credential Updates
                    </DialogTitle>
                    <Badge className="bg-emerald-400/20 text-emerald-100 border-emerald-300/30 text-[10px] font-semibold px-2 py-0.5">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Verified Profile
                    </Badge>
                  </div>
                  <DialogDescription className="text-xs text-primary-100/90 mt-1">
                    Specialization and experience are verified credentials that undergo admin review before publishing.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </div>

          {/* Form Scroll Area */}
          <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">
            <form id="credential-change-form" onSubmit={handleSubmitProfileChangeRequest} className="space-y-6">
              
              {/* Live Comparison Preview Card */}
              <div className="rounded-xl p-4 bg-gradient-to-br from-neutral-50 via-slate-50 to-primary-50/30 dark:from-neutral-900/90 dark:via-neutral-900/50 dark:to-primary-950/20 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200/70 dark:border-neutral-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary-600" />
                    Live Credentials Comparison
                  </span>
                  <span className="text-[11px] text-neutral-400">Current vs Proposed</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Current State */}
                  <div className="p-3 rounded-lg bg-white dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase text-neutral-500">Current In Profile</span>
                      <Badge variant="outline" className="text-[10px] text-neutral-600 dark:text-neutral-300 border-neutral-300">
                        {counselorData?.experienceYears || 0} Yrs ({counselorData?.experienceLevel || 'Beginner'})
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(counselorData?.specialization)
                        ? counselorData.specialization
                        : counselorData?.specialization
                        ? [counselorData.specialization]
                        : []
                      ).map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px] py-0.5 px-2 bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Proposed State */}
                  <div className="p-3 rounded-lg bg-primary-50/70 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase text-primary-700 dark:text-primary-300 flex items-center gap-1">
                        <ArrowRight className="h-3 w-3" /> Proposed Request
                      </span>
                      <Badge className="bg-primary-600 text-white text-[10px]">
                        {requestedExperienceYears || 0} Yrs ({getComputedLevel(requestedExperienceYears)})
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {requestedSpecialization.length > 0 ? (
                        requestedSpecialization.map((s) => (
                          <Badge key={s} className="text-[10px] py-0.5 px-2 bg-primary-100 dark:bg-primary-900/60 text-primary-800 dark:text-primary-200 border border-primary-300 dark:border-primary-700">
                            {s}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-[11px] text-amber-600 italic">No specialization chosen</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Specialization Selection Grid */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-primary-600" />
                    Requested Specializations <span className="text-red-500">*</span>
                  </Label>
                  <span className="text-[11px] font-medium text-neutral-500">
                    {requestedSpecialization.length} of {specializationOptions.length} selected
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Click on the specializations to add or remove them from your request:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {specializationOptions.map((opt) => {
                    const isSelected = requestedSpecialization.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleToggleRequestedSpec(opt)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all text-left group ${
                          isSelected
                            ? 'bg-primary-50/90 dark:bg-primary-950/40 border-primary-500 text-primary-900 dark:text-primary-100 shadow-sm ring-1 ring-primary-500/30'
                            : 'bg-white dark:bg-neutral-800/70 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50/50'
                        }`}
                      >
                        <span className="truncate pr-2">{opt}</span>
                        {isSelected ? (
                          <div className="h-5 w-5 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <Check className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center shrink-0 group-hover:border-neutral-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Experience Years */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="req-exp-years" className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-primary-600" />
                    Years of Clinical / Practice Experience <span className="text-red-500">*</span>
                  </Label>
                  <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5 bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 border border-primary-200">
                    Tier: {getComputedLevel(requestedExperienceYears)}
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-neutral-50 dark:bg-neutral-800/40 p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60">
                  <div className="flex-1 w-full space-y-1.5">
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="1"
                      value={requestedExperienceYears || 0}
                      onChange={(e) => setRequestedExperienceYears(e.target.value)}
                      className="w-full accent-primary-600 cursor-pointer h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400">
                      <span>0 Yrs (Beginner)</span>
                      <span>5 Yrs (Experienced)</span>
                      <span>10+ Yrs (Specialist)</span>
                    </div>
                  </div>
                  <div className="w-full sm:w-28 shrink-0">
                    <Input
                      id="req-exp-years"
                      type="number"
                      min="0"
                      max="60"
                      value={requestedExperienceYears}
                      onChange={(e) => setRequestedExperienceYears(e.target.value)}
                      placeholder="Years"
                      className="h-10 text-center font-bold text-sm bg-white dark:bg-neutral-800"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Message / Reason with Quick Fill Helper Tags */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="req-message" className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-primary-600" />
                    Request Reason / Context for Admin <span className="text-red-500">*</span>
                  </Label>
                  <span className={`text-[11px] ${requestMessage.length > 900 ? 'text-amber-600 font-medium' : 'text-neutral-400'}`}>
                    {requestMessage.length}/1000
                  </span>
                </div>

                {/* Quick Suggestion Chips */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-neutral-500 mr-1">Quick prompts:</span>
                  {[
                    'Annual Clinical Practice Update',
                    'Completed Specialty Certification',
                    'Expanded Therapeutic Focus',
                    'Updated Hospital / Clinic Affiliation',
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => {
                        setRequestMessage((prev) =>
                          prev ? `${prev.trim()}\n- ${prompt}` : `Reason for request: ${prompt}`
                        );
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-primary-50 dark:bg-neutral-800 dark:hover:bg-primary-950/40 text-neutral-600 hover:text-primary-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 transition-colors"
                    >
                      + {prompt}
                    </button>
                  ))}
                </div>

                <Textarea
                  id="req-message"
                  rows={3}
                  maxLength={1000}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Explain why you are requesting these updates (e.g., Completed a 2-year certification in Relationship & Family Therapy, additional clinical hours completed)..."
                  className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-xs leading-relaxed resize-none focus-visible:ring-primary-500"
                  required
                />
              </div>
            </form>
          </div>

          {/* Sticky Dialog Footer */}
          <div className="p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900/90 backdrop-blur shrink-0 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRequestChangeModalOpen(false)}
              disabled={isSubmittingChangeRequest}
              className="text-xs h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="credential-change-form"
              disabled={isSubmittingChangeRequest}
              className="text-xs h-10 px-5 gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-md transition-all"
            >
              {isSubmittingChangeRequest ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Request to Admin</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Profile Modal */}
      <ShareProfileModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        counselor={counselorData}
      />
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
