import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { disputeFormSchema } from '../validators/disputeFormSchema';
import { disputeService } from '../services/dispute';
import { useClientAuth } from '../contexts/ClientAuthContext';

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

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Enterprise Layer 3 State Hook for Dispute & Incident Raising.
 * Encapsulates form validation, file attachment checks, upload progress simulation,
 * confirmation modals, and asynchronous dispute submission.
 *
 * @param {string} bookingId - Consultation booking identifier.
 * @returns {Object} Form reactive state and dispatchers.
 */
export const useDisputeForm = (bookingId) => {
  const navigate = useNavigate();
  const { client, isAuthenticated } = useClientAuth();

  const form = useForm({
    resolver: zodResolver(disputeFormSchema),
    defaultValues: {
      issueType: '',
      description: '',
      needFollowUpCall: false,
    },
  });

  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const description = form.watch('description');
  const remainingChars = 2000 - (description?.length || 0);

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
    [files.length, validateFile]
  );

  const handleFileChange = useCallback(
    (e) => {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
      e.target.value = '';
    },
    [processFiles]
  );

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

  const removeFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    toast.info('File removed');
  }, []);

  const onSubmit = () => {
    setShowWarningModal(true);
  };

  const confirmSubmit = useCallback(async () => {
    setShowWarningModal(false);
    setIsSubmitting(true);
    setUploadProgress(0);
    let progressInterval;

    try {
      if (!isAuthenticated && !client) {
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

      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const data = await disputeService.raiseDispute(formDataToSend);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (data?.success) {
        setSubmitSuccess(true);
        toast.success(data.message || 'Complaint submitted successfully!');

        setTimeout(() => {
          navigate('/client/dashboard/bookings');
        }, 3000);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Submit error:', error);

      const status = error.response?.status;
      const data = error.response?.data || {};

      if (status === 400) {
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err) => {
            toast.error(err.message || err.field + ': ' + err.message || err);
          });
        } else {
          toast.error(data.message || 'Validation failed');
        }
      } else if (status === 403) {
        toast.error('You are not authorized to raise a dispute for this booking');
      } else if (status === 404) {
        toast.error('Booking not found');
      } else if (status === 429) {
        toast.error('Too many requests. Please try again later.');
      } else if (status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error(data.message || 'Failed to submit complaint');
      }

      setIsSubmitting(false);
      setUploadProgress(0);
    }
  }, [bookingId, client, files, form, isAuthenticated, navigate]);

  return {
    form,
    files,
    setFiles,
    isSubmitting,
    submitSuccess,
    uploadProgress,
    showWarningModal,
    setShowWarningModal,
    isDragging,
    description,
    remainingChars,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeFile,
    onSubmit,
    confirmSubmit,
  };
};

export default useDisputeForm;
