import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { contactService } from '../services/support';
import { useClientAuth } from '../contexts/ClientAuthContext';
import { useCounselorAuth } from '../contexts/CounselorAuthContext';

/**
 * Enterprise Layer 3 State Hook for Contact & General Inquiries.
 * Encapsulates authentication context auto-prefill, field locking,
 * format validation, and asynchronous contact email dispatch.
 *
 * @returns {Object} Contact form state and dispatchers.
 */
export const useContactForm = () => {
  const { client } = useClientAuth();
  const { counselor } = useCounselorAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'general',
    message: '',
    userType: 'client',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [prefilledFromProfile, setPrefilledFromProfile] = useState(false);
  const [lockedFields, setLockedFields] = useState({
    firstName: false,
    lastName: false,
    email: false,
    userType: false,
  });

  useEffect(() => {
    const activeUser = client || counselor;
    if (activeUser) {
      setIsAuthenticated(true);
      const userType = client ? 'client' : 'counselor';
      const firstName = activeUser.firstName || activeUser.fullName?.split(' ')[0] || '';
      const lastName =
        activeUser.lastName || activeUser.fullName?.split(' ').slice(1).join(' ') || '';
      const email = activeUser.email || '';

      setFormData((prev) => ({
        ...prev,
        firstName,
        lastName,
        email,
        userType,
      }));

      setLockedFields({
        firstName: Boolean(firstName),
        lastName: Boolean(lastName),
        email: Boolean(email),
        userType: true,
      });

      setPrefilledFromProfile(Boolean(firstName || email));
    }
  }, [client, counselor]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (lockedFields[name]) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        submittedAt: new Date().toISOString(),
        prefilledFromProfile,
        authenticatedUser: isAuthenticated,
      };

      const data = await contactService.sendContactEmail(payload);

      if (data?.success || data) {
        setSubmitted(true);
        toast.success("Message sent successfully! We'll get back to you soon.", {
          duration: 4000,
        });

        setTimeout(() => {
          setFormData((prev) => ({
            ...prev,
            subject: 'general',
            message: '',
          }));
          setSubmitted(false);
        }, 3000);
      } else {
        toast.error(data?.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    submitted,
    isAuthenticated,
    prefilledFromProfile,
    lockedFields,
    handleChange,
    handleSubmit,
  };
};

export default useContactForm;
