'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCounselorAuth } from '../../contexts/CounselorAuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Briefcase,
  Languages,
  Shield,
  Building2,
  Upload,
  FileText,
  CheckCircle,
  Loader2,
  User,
  Calendar,
  BookOpen,
  AlertCircle,
  CreditCard,
  Award,
} from 'lucide-react';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const cardVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
};

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

  const handleLanguageChange = (language) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((lang) => lang !== language)
        : [...prev.languages, language],
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

      submissionData.append('education', JSON.stringify(formData.education));
      submissionData.append('experience', formData.experience);
      submissionData.append('professionalSummary', formData.professionalSummary);
      submissionData.append('languages', JSON.stringify(formData.languages));
      submissionData.append('license', JSON.stringify(formData.license));
      submissionData.append('bankDetails', JSON.stringify(formData.bankDetails));

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

  // Calculate completion percentage
  const calculateProgress = () => {
    let completed = 0;
    const total = 12;

    if (formData.education.graduation.university) completed++;
    if (formData.education.graduation.degree) completed++;
    if (formData.education.graduation.year) completed++;
    if (formData.experience) completed++;
    if (formData.professionalSummary) completed++;
    if (formData.languages.length > 0) completed++;
    if (formData.bankDetails.accountNo) completed++;
    if (formData.bankDetails.ifscCode) completed++;
    if (formData.bankDetails.branchName) completed++;
    if (files.resume) completed++;
    if (files.degreeCertificate) completed++;
    if (files.governmentId) completed++;

    return Math.round((completed / total) * 100);
  };

  const progressPercentage = calculateProgress();

  // Loading state for checking application status
  if (counselor?.applicationStatus === 'pending' || counselor?.applicationStatus === 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-primary-50 dark:from-neutral-900 dark:to-neutral-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary-700 dark:text-primary-400" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading application...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
      className="min-h-screen  bg-gradient-to-br from-neutral-50 via-primary-50/30 to-neutral-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 mt-[80px] py-8 sm:py-12 px-3 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-600 dark:from-primary-600 dark:to-primary-500 mb-4 shadow-lg">
            <Briefcase className="h-8 w-8 sm:h-10 sm:w-10 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-2">
            Complete Your Application
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Please fill out all required information to complete your counselor profile. We'll
            review your application within 24-48 hours.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 sm:mb-8"
        >
          <Card className="border-primary-200 dark:border-primary-800 shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  Application Progress
                </span>
                <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">
                  {progressPercentage}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                {progressPercentage === 100
                  ? 'All required fields completed!'
                  : 'Complete all required fields to submit'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Education Section */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
          >
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                    <GraduationCap className="h-5 w-5 text-primary-700 dark:text-primary-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-neutral-900 dark:text-white">
                      Education
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Your academic qualifications
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Graduation */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Graduation *
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="grad-university" className="text-xs sm:text-sm">
                        University *
                      </Label>
                      <Input
                        id="grad-university"
                        name="university"
                        type="text"
                        required
                        placeholder="e.g., Harvard University"
                        value={formData.education.graduation.university}
                        onChange={(e) => handleInputChange(e, 'education', 'graduation')}
                        className="h-10 sm:h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grad-degree" className="text-xs sm:text-sm">
                        Degree *
                      </Label>
                      <Input
                        id="grad-degree"
                        name="degree"
                        type="text"
                        required
                        placeholder="e.g., Bachelor of Psychology"
                        value={formData.education.graduation.degree}
                        onChange={(e) => handleInputChange(e, 'education', 'graduation')}
                        className="h-10 sm:h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="grad-year" className="text-xs sm:text-sm">
                        Year of Completion *
                      </Label>
                      <Input
                        id="grad-year"
                        name="year"
                        type="number"
                        required
                        min="1900"
                        max={new Date().getFullYear()}
                        placeholder="e.g., 2020"
                        value={formData.education.graduation.year}
                        onChange={(e) => handleInputChange(e, 'education', 'graduation')}
                        className="h-10 sm:h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Post-Graduation */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-neutral-400" />
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Post-Graduation{' '}
                      <span className="text-xs text-neutral-500 font-normal">(Optional)</span>
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postgrad-university" className="text-xs sm:text-sm">
                        University
                      </Label>
                      <Input
                        id="postgrad-university"
                        name="university"
                        type="text"
                        placeholder="e.g., Stanford University"
                        value={formData.education.postGraduation.university}
                        onChange={(e) => handleInputChange(e, 'education', 'postGraduation')}
                        className="h-10 sm:h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postgrad-degree" className="text-xs sm:text-sm">
                        Degree
                      </Label>
                      <Input
                        id="postgrad-degree"
                        name="degree"
                        type="text"
                        placeholder="e.g., Master of Clinical Psychology"
                        value={formData.education.postGraduation.degree}
                        onChange={(e) => handleInputChange(e, 'education', 'postGraduation')}
                        className="h-10 sm:h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="postgrad-year" className="text-xs sm:text-sm">
                        Year of Completion
                      </Label>
                      <Input
                        id="postgrad-year"
                        name="year"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        placeholder="e.g., 2022"
                        value={formData.education.postGraduation.year}
                        onChange={(e) => handleInputChange(e, 'education', 'postGraduation')}
                        className="h-10 sm:h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Professional Details */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.5 }}
          >
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                    <Briefcase className="h-5 w-5 text-primary-700 dark:text-primary-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-neutral-900 dark:text-white">
                      Professional Details
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Your work experience and expertise
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-xs sm:text-sm font-medium">
                    Professional Experience *
                  </Label>
                  <Textarea
                    id="experience"
                    name="experience"
                    required
                    rows={4}
                    placeholder="Describe your professional experience, including years of practice, specializations, and notable achievements..."
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 resize-none text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="professionalSummary" className="text-xs sm:text-sm font-medium">
                      Professional Summary *
                    </Label>
                    <span
                      className={`text-xs ${
                        formData.professionalSummary.length > 900
                          ? 'text-warning-600 dark:text-warning-400'
                          : 'text-neutral-500 dark:text-neutral-400'
                      }`}
                    >
                      {formData.professionalSummary.length}/1000
                    </span>
                  </div>
                  <Textarea
                    id="professionalSummary"
                    name="professionalSummary"
                    required
                    rows={5}
                    maxLength={1000}
                    placeholder="Provide a comprehensive professional summary highlighting your counseling philosophy, approach, and what makes you unique..."
                    value={formData.professionalSummary}
                    onChange={handleInputChange}
                    className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 resize-none text-sm"
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Maximum 1000 characters
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Languages */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.6 }}
          >
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                    <Languages className="h-5 w-5 text-primary-700 dark:text-primary-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-neutral-900 dark:text-white">
                      Languages *
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Select languages you can counsel in
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['English', 'Hindi'].map((language) => (
                    <motion.div
                      key={language}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center space-x-3 p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 ${
                        formData.languages.includes(language)
                          ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                      }`}
                    >
                      <Checkbox
                        id={`lang-${language}`}
                        checked={formData.languages.includes(language)}
                        onCheckedChange={() => handleLanguageChange(language)}
                        className="border-neutral-400 dark:border-neutral-600"
                      />
                      <Label
                        htmlFor={`lang-${language}`}
                        className="text-sm font-medium cursor-pointer flex-1"
                      >
                        {language}
                      </Label>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* License (Optional) */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.7 }}
          >
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <Shield className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-neutral-900 dark:text-white">
                      License{' '}
                      <span className="text-sm text-neutral-500 font-normal">(Optional)</span>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Professional license information
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNo" className="text-xs sm:text-sm">
                      License Number
                    </Label>
                    <Input
                      id="licenseNo"
                      name="licenseNo"
                      type="text"
                      placeholder="e.g., LPC-12345"
                      value={formData.license.licenseNo}
                      onChange={(e) => handleInputChange(e, 'license')}
                      className="h-10 sm:h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issuingAuthority" className="text-xs sm:text-sm">
                      Issuing Authority
                    </Label>
                    <Input
                      id="issuingAuthority"
                      name="issuingAuthority"
                      type="text"
                      placeholder="e.g., State Board of Psychology"
                      value={formData.license.issuingAuthority}
                      onChange={(e) => handleInputChange(e, 'license')}
                      className="h-10 sm:h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bank Details */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.8 }}
          >
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                    <CreditCard className="h-5 w-5 text-primary-700 dark:text-primary-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-neutral-900 dark:text-white">
                      Bank Details
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      For payment processing
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountNo" className="text-xs sm:text-sm">
                      Account Number *
                    </Label>
                    <Input
                      id="accountNo"
                      name="accountNo"
                      type="text"
                      required
                      placeholder="Enter your bank account number"
                      value={formData.bankDetails.accountNo}
                      onChange={(e) => handleInputChange(e, 'bankDetails')}
                      className="h-10 sm:h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ifscCode" className="text-xs sm:text-sm">
                        IFSC Code *
                      </Label>
                      <Input
                        id="ifscCode"
                        name="ifscCode"
                        type="text"
                        required
                        placeholder="e.g., SBIN0001234"
                        value={formData.bankDetails.ifscCode}
                        onChange={(e) => handleInputChange(e, 'bankDetails')}
                        className="h-10 sm:h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branchName" className="text-xs sm:text-sm">
                        Branch Name *
                      </Label>
                      <Input
                        id="branchName"
                        name="branchName"
                        type="text"
                        required
                        placeholder="e.g., Main Branch"
                        value={formData.bankDetails.branchName}
                        onChange={(e) => handleInputChange(e, 'bankDetails')}
                        className="h-10 sm:h-11 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Documents */}
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.9 }}
          >
            <Card className="border-neutral-200 dark:border-neutral-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                    <FileText className="h-5 w-5 text-primary-700 dark:text-primary-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-neutral-900 dark:text-white">
                      Documents
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Upload required verification documents (PDF only)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Resume */}
                  <div className="space-y-2">
                    <Label htmlFor="resume" className="text-xs sm:text-sm font-medium">
                      Resume (PDF) *
                    </Label>
                    <div className="relative">
                      <input
                        id="resume"
                        name="resume"
                        type="file"
                        required
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                      <Label
                        htmlFor="resume"
                        className="flex items-center justify-center w-full h-24 sm:h-28 px-4 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 border-neutral-300 dark:border-neutral-700"
                      >
                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                          <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-neutral-400" />
                          <div className="text-xs sm:text-sm">
                            {files.resume ? (
                              <span className="font-medium text-primary-700 dark:text-primary-400">
                                {files.resume.name}
                              </span>
                            ) : (
                              <>
                                <span className="font-medium text-neutral-900 dark:text-white">
                                  Click to upload
                                </span>
                                <span className="text-neutral-500 dark:text-neutral-400">
                                  {' '}
                                  or drag and drop
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>

                  {/* Degree Certificate */}
                  <div className="space-y-2">
                    <Label htmlFor="degreeCertificate" className="text-xs sm:text-sm font-medium">
                      Degree Certificate (PDF) *
                    </Label>
                    <div className="relative">
                      <input
                        id="degreeCertificate"
                        name="degreeCertificate"
                        type="file"
                        required
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                      <Label
                        htmlFor="degreeCertificate"
                        className="flex items-center justify-center w-full h-24 sm:h-28 px-4 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 border-neutral-300 dark:border-neutral-700"
                      >
                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                          <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-neutral-400" />
                          <div className="text-xs sm:text-sm">
                            {files.degreeCertificate ? (
                              <span className="font-medium text-primary-700 dark:text-primary-400">
                                {files.degreeCertificate.name}
                              </span>
                            ) : (
                              <>
                                <span className="font-medium text-neutral-900 dark:text-white">
                                  Click to upload
                                </span>
                                <span className="text-neutral-500 dark:text-neutral-400">
                                  {' '}
                                  or drag and drop
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>

                  {/* Government ID */}
                  <div className="space-y-2">
                    <Label htmlFor="governmentId" className="text-xs sm:text-sm font-medium">
                      Government ID (PDF) *
                    </Label>
                    <div className="relative">
                      <input
                        id="governmentId"
                        name="governmentId"
                        type="file"
                        required
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                      <Label
                        htmlFor="governmentId"
                        className="flex items-center justify-center w-full h-24 sm:h-28 px-4 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 border-neutral-300 dark:border-neutral-700"
                      >
                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                          <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-neutral-400" />
                          <div className="text-xs sm:text-sm">
                            {files.governmentId ? (
                              <span className="font-medium text-primary-700 dark:text-primary-400">
                                {files.governmentId.name}
                              </span>
                            ) : (
                              <>
                                <span className="font-medium text-neutral-900 dark:text-white">
                                  Click to upload
                                </span>
                                <span className="text-neutral-500 dark:text-neutral-400">
                                  {' '}
                                  or drag and drop
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>

                  {/* License Certificate (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="licenseCertificate" className="text-xs sm:text-sm font-medium">
                      License Certificate (PDF){' '}
                      <span className="text-neutral-500 font-normal">(Optional)</span>
                    </Label>
                    <div className="relative">
                      <input
                        id="licenseCertificate"
                        name="licenseCertificate"
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                      <Label
                        htmlFor="licenseCertificate"
                        className="flex items-center justify-center w-full h-24 sm:h-28 px-4 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 border-neutral-300 dark:border-neutral-700"
                      >
                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                          <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-neutral-400" />
                          <div className="text-xs sm:text-sm">
                            {files.licenseCertificate ? (
                              <span className="font-medium text-primary-700 dark:text-primary-400">
                                {files.licenseCertificate.name}
                              </span>
                            ) : (
                              <>
                                <span className="font-medium text-neutral-900 dark:text-white">
                                  Click to upload
                                </span>
                                <span className="text-neutral-500 dark:text-neutral-400">
                                  {' '}
                                  or drag and drop
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="pt-4"
          >
            <Button
              type="submit"
              disabled={loading || progressPercentage < 100}
              className="w-full h-12 sm:h-14 bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 dark:from-primary-600 dark:to-primary-500 dark:hover:from-primary-700 dark:hover:to-primary-600 text-white text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  Submitting Application...
                </>
              ) : progressPercentage < 100 ? (
                <>
                  <AlertCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                  Complete All Required Fields
                </>
              ) : (
                <>
                  Submit Application
                  <CheckCircle className="ml-2 h-5 w-5" aria-hidden="true" />
                </>
              )}
            </Button>
            <p className="text-xs text-center text-neutral-500 dark:text-neutral-400 mt-3">
              By submitting, you agree to our terms of service and privacy policy
            </p>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
};

export default CounselorApplication;
