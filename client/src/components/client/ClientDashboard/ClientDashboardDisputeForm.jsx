import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Upload,
  X,
  Phone,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Info,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { disputeFormSchema } from '@/validators/disputeFormSchema';

// Shadcn components
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { API_BASE_URL, API_ENDPOINTS } from '../../../config/api.js';

// ✅ CONSTANTS
const ISSUE_TYPES = [
  { value: 'counselor_did_not_join', label: 'Counselor did not join the session' },
  { value: 'counselor_joined_late', label: 'Counselor joined late' },
  { value: 'session_ended_early', label: 'Session ended earlier than expected' },
  { value: 'session_quality_poor', label: 'Session quality was poor' },
  { value: 'counselor_not_proper_guidance', label: 'Counselor did not provide proper guidance' },
  { value: 'counselor_rude_unprofessional', label: 'Counselor was rude or unprofessional' },
  { value: 'counselor_made_uncomfortable', label: 'Counselor made me uncomfortable' },
  { value: 'audio_problem', label: 'Audio problem' },
  { value: 'video_problem', label: 'Video problem' },
  { value: 'internet_disconnection', label: 'Internet disconnection' },
  { value: 'other', label: 'Other issue' },
];

const FILE_LIMITS = {
  MAX_FILES: 5,
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'video/mp4',
    'audio/mpeg',
    'audio/mp3',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf', '.mp4', '.mp3', '.docx'],
};

// ✅ HELPER FUNCTIONS
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const getFileIcon = (fileType) => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.startsWith('video/')) return '🎥';
  if (fileType.startsWith('audio/')) return '🎵';
  if (fileType === 'application/pdf') return '📄';
  return '📎';
};

const RaiseIssueForm = () => {
  const { bookingId } = useParams();
  console.log(bookingId)
  const navigate = useNavigate();

  // ✅ REACT HOOK FORM WITH ZOD
  const form = useForm({
    resolver: zodResolver(disputeFormSchema),
    defaultValues: {
      issueType: '',
      description: '',
      needFollowUpCall: false,
    },
  });

  // ✅ STATE
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Watch description for character count
  const description = form.watch('description');
  const remainingChars = 2000 - (description?.length || 0);

  // ✅ VALIDATE FILE
  const validateFile = useCallback((file) => {
    if (file.size > FILE_LIMITS.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File too large (max ${formatFileSize(FILE_LIMITS.MAX_FILE_SIZE)})`,
      };
    }

    if (!FILE_LIMITS.ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid file type' };
    }

    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!FILE_LIMITS.ALLOWED_EXTENSIONS.includes(extension)) {
      return { valid: false, error: 'Invalid file extension' };
    }

    return { valid: true };
  }, []);

  // ✅ PROCESS FILES
  const processFiles = useCallback(
    (selectedFiles) => {
      if (files.length + selectedFiles.length > FILE_LIMITS.MAX_FILES) {
        toast.error(`Maximum ${FILE_LIMITS.MAX_FILES} files allowed`);
        return;
      }

      const validFiles = [];
      const errors = [];

      for (const file of selectedFiles) {
        const validation = validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          errors.push(`${file.name}: ${validation.error}`);
        }
      }

      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error));
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
        toast.success(`${validFiles.length} file(s) added`);
      }
    },
    [files, validateFile]
  );

  // ✅ HANDLE FILE UPLOAD
  const handleFileChange = useCallback(
    (e) => {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
      e.target.value = '';
    },
    [processFiles]
  );

  // ✅ DRAG AND DROP
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    },
    [processFiles]
  );

  // ✅ REMOVE FILE
  const removeFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    toast.info('File removed');
  }, []);

  // ✅ HANDLE FORM SUBMIT
  const onSubmit = async (data) => {
    setShowWarningModal(true);
  };

  // ✅ CONFIRM SUBMIT
  const confirmSubmit = useCallback(async () => {
    setShowWarningModal(false);
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('clientAccessToken');

      if (!token) {
        toast.error('Authentication required. Please login again.');
        navigate('/login');
        return;
      }

      const formValues = form.getValues();
      const formDataToSend = new FormData();

      formDataToSend.append('bookingId', bookingId);
      formDataToSend.append('issueType', formValues.issueType);
      formDataToSend.append('description', formValues.description.trim());
      formDataToSend.append('needFollowUpCall', formValues.needFollowUpCall);

      files.forEach((file) => {
        formDataToSend.append('evidence', file);
      });

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const response = await fetch(`${API_BASE_URL}/client/bookings/dispute/raise`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: formDataToSend 
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitSuccess(true);
        toast.success(data.message || 'Complaint submitted successfully!');

        setTimeout(() => {
          navigate('/client/dashboard/bookings');
        }, 3000);
      } else {
        if (response.status === 400) {
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach((error) => {
              toast.error(error.message || error.field + ': ' + error.message || error);
            });
          } else {
            toast.error(data.message || 'Validation failed');
          }
        } else if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
        } else if (response.status === 403) {
          toast.error('You are not authorized to raise a dispute for this booking');
        } else if (response.status === 404) {
          toast.error('Booking not found');
        } else if (response.status === 429) {
          toast.error('Too many requests. Please try again later.');
        } else {
          toast.error(data.message || 'Failed to submit complaint');
        }

        setIsSubmitting(false);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Submit error:', error);

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }

      setIsSubmitting(false);
      setUploadProgress(0);
    }
  }, [bookingId, files, form, navigate]);

  // ✅ SUCCESS SCREEN
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full"
        >
          <Card className="border-2 border-green-200 shadow-xl">
            <CardContent className="pt-12 pb-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Complaint Submitted Successfully
              </h2>
              <p className="text-gray-600 mb-6">
                Our team will review your complaint and get back to you within 24-48 hours.
              </p>
              <Badge variant="outline" className="text-sm mb-6">
                Status: Under Review
              </Badge>
              <Button
                onClick={() => navigate('/client/dashboard/bookings')}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Go to My Bookings
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ✅ MAIN FORM
  return (
    <div className="min-h-screen mt-[80px] bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Raise an Issue</h1>
          <p className="text-gray-600">
            Help us improve by reporting any problems you experienced during your session
          </p>
        </motion.div>

        {/* Info Alert */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Alert className="border-primary-200 bg-primary-50">
            <Info className="h-4 w-4 text-primary-600" />
            <AlertTitle className="text-primary-900">Important</AlertTitle>
            <AlertDescription className="text-primary-800">
              You can only raise an issue within 24 hours of session completion. Please provide
              accurate information for faster resolution.
            </AlertDescription>
          </Alert>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Issue Type */}
                  <FormField
                    control={form.control}
                    name="issueType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Issue Type <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select the type of issue" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ISSUE_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          Detailed Description <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe what happened during the session in detail..."
                            className="min-h-[150px] resize-none"
                            maxLength={2000}
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-between items-center">
                          <FormDescription>Minimum 30 characters required</FormDescription>
                          <p
                            className={`text-sm ${
                              remainingChars < 100
                                ? 'text-orange-500 font-semibold'
                                : 'text-gray-400'
                            }`}
                          >
                            {field.value?.length || 0}/2000
                          </p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  {/* Evidence Upload */}
                  <div>
                    <Label className="text-base font-semibold mb-2 flex items-center gap-2">
                      Upload Evidence{' '}
                      <span className="text-sm text-gray-500 font-normal">(Optional)</span>
                    </Label>
                    <p className="text-sm text-gray-600 mb-3">
                      Upload screenshots, recordings, or documents (Max {FILE_LIMITS.MAX_FILES}{' '}
                      files, {formatFileSize(FILE_LIMITS.MAX_FILE_SIZE)} each)
                    </p>

                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                        isDragging
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                      } ${files.length >= FILE_LIMITS.MAX_FILES ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="file"
                        id="evidence"
                        multiple
                        accept={FILE_LIMITS.ALLOWED_EXTENSIONS.join(',')}
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={files.length >= FILE_LIMITS.MAX_FILES}
                      />
                      <label
                        htmlFor="evidence"
                        className={`cursor-pointer ${
                          files.length >= FILE_LIMITS.MAX_FILES ? 'cursor-not-allowed' : ''
                        }`}
                      >
                        <Upload
                          className={`w-10 h-10 mx-auto mb-2 ${
                            isDragging ? 'text-primary-500' : 'text-gray-400'
                          }`}
                        />
                        <p className="text-sm text-gray-600 font-medium">
                          {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG, PDF, MP4, MP3, DOCX (max{' '}
                          {formatFileSize(FILE_LIMITS.MAX_FILE_SIZE)})
                        </p>
                        {files.length > 0 && (
                          <p className="text-xs text-primary-600 mt-2 font-semibold">
                            {files.length}/{FILE_LIMITS.MAX_FILES} files selected
                          </p>
                        )}
                      </label>
                    </div>

                    {/* File List */}
                    <AnimatePresence>
                      {files.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 space-y-2"
                        >
                          {files.map((file, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="text-2xl">{getFileIcon(file.type)}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(file.size)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Separator />

                  {/* Follow-up Call */}
                  <FormField
                    control={form.control}
                    name="needFollowUpCall"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary-100 rounded-lg">
                            <Phone className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <FormLabel className="font-semibold cursor-pointer">
                              Need a follow-up call?
                            </FormLabel>
                            <FormDescription className="text-sm text-gray-600">
                              Our support team will contact you
                            </FormDescription>
                          </div>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Security Notice */}
                  <Alert className="border-blue-200 bg-blue-50">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-900">Privacy & Security</AlertTitle>
                    <AlertDescription className="text-blue-800 text-sm">
                      Your complaint is confidential and will only be reviewed by our authorized
                      team members. All evidence files are securely stored.
                    </AlertDescription>
                  </Alert>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !form.formState.isValid}
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Submitting Complaint...
                        </>
                      ) : (
                        'Submit Complaint'
                      )}
                    </Button>

                    {/* Upload Progress */}
                    {isSubmitting && uploadProgress > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4"
                      >
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-sm text-center text-gray-600 mt-2">
                          {uploadProgress < 100
                            ? `Uploading... ${uploadProgress}%`
                            : 'Processing...'}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Warning Modal */}
        <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <DialogTitle className="text-center text-xl">Important Notice</DialogTitle>
              <DialogDescription className="text-center text-base">
                Please ensure all information provided is accurate and truthful. False claims may
                lead to account restrictions or suspension.
              </DialogDescription>
            </DialogHeader>
            <Separator />
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                By submitting this complaint, you confirm that:
              </p>
              <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                <li>All information provided is true and accurate</li>
                <li>Evidence files are relevant to this issue</li>
                <li>You understand false claims may result in penalties</li>
              </ul>
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowWarningModal(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmSubmit}
                className="flex-1 bg-primary-600 hover:bg-primary-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'I Understand, Submit'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default RaiseIssueForm;
