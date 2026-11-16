import { useState } from 'react';
import { toast } from 'sonner';
import { contactService } from '../services/support';

/**
 * Enterprise Layer 3 State Hook for Campus Ambassador Enrollment.
 * Encapsulates ambassador form data, inline field validation,
 * UPI/contact validation, and asynchronous registration dispatch.
 *
 * @returns {Object} Ambassador enrollment reactive state and dispatchers.
 */
export const useCampusAmbassador = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    collegeName: '',
    degreeAndYear: '',
    upiId: '',
    reasonToJoin: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      errs.fullName = 'Full name must be at least 3 characters.';
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone.trim().replace(/[\s-]/g, ''))) {
      errs.phone = 'Please enter a valid phone number with country code if applicable.';
    }
    if (!formData.collegeName.trim() || formData.collegeName.trim().length < 3) {
      errs.collegeName = 'College name is required.';
    }
    if (!formData.degreeAndYear.trim() || formData.degreeAndYear.trim().length < 2) {
      errs.degreeAndYear = 'Please provide your degree and year (e.g. B.Tech 3rd Year).';
    }
    if (!formData.upiId.trim() || !formData.upiId.includes('@')) {
      errs.upiId = 'Please enter a valid UPI ID (e.g. yourname@oksbi).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (!validate()) {
      toast.error('Please resolve validation errors before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        collegeName: formData.collegeName.trim(),
        degreeAndYear: formData.degreeAndYear.trim(),
        upiId: formData.upiId.trim(),
        reasonToJoin: formData.reasonToJoin.trim(),
      };

      const response = await contactService.registerCampusAmbassador(payload);

      if (response?.success) {
        setSubmitted(true);
        setSubmittedData(response.data);
        toast.success('Application submitted successfully!');
      } else {
        toast.error(response?.message || 'Failed to submit application.');
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'An unexpected error occurred during registration.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    submitting,
    submitted,
    submittedData,
    handleChange,
    validate,
    handleSubmit,
  };
};

export default useCampusAmbassador;
