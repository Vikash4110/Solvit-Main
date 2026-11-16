import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import clientProfileService from '../services/profile';

/**
 * Enterprise Layer 3 State Hook for Client Profile Management.
 * Encapsulates client profile retrieval, form input mutations, avatar uploads,
 * completeness checks, and localStorage synchronization.
 *
 * @returns {Object} Client profile states, form controllers, and server mutation handlers.
 */
export const useClientProfile = () => {
  const [clientData, setClientData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileCompleteness, setProfileCompleteness] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [customLanguageInput, setCustomLanguageInput] = useState('');

  // Normalize backend payload into uniform client profile structure
  const transformClientData = (data) => ({
    fullName: data?.fullName || '',
    username: data?.username || '',
    email: data?.email || '',
    phone: data?.phone || '',
    gender: data?.gender || '',
    profilePicture: data?.profilePicture || '',
    preferredLanguages: data?.preferredLanguages || [],
    bio: data?.bio ? data.bio.charAt(0).toUpperCase() + data.bio.slice(1) : '',
    address: {
      city: data?.address?.city || '',
      area: data?.address?.area || '',
      pincode: data?.address?.pincode || '',
    },
    prefferedTopics: data?.prefferedTopics || [],
    lastLogin: data?.lastLogin,
    createdAt: data?.createdAt,
  });

  // Fetch client profile from Layer 2 service
  const fetchClientData = useCallback(async () => {
    setIsFetching(true);
    setError(null);

    try {
      const data = await clientProfileService.getProfile();
      const transformed = transformClientData(data);
      setClientData(transformed);
      setFormData(transformed);
    } catch (err) {
      console.error('Error fetching client data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load profile data');
      toast.error('Failed to Load Profile', {
        description: 'Unable to fetch your profile data. Please try again.',
      });
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Fetch completeness score and missing fields
  const fetchProfileCompleteness = useCallback(async () => {
    try {
      const data = await clientProfileService.getProfileCompleteness();
      setProfileCompleteness(data);
    } catch (err) {
      console.error('Error fetching profile completeness:', err);
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    fetchClientData();
    fetchProfileCompleteness();
  }, [fetchClientData, fetchProfileCompleteness]);

  // Form field mutations
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleNestedInputChange = useCallback((parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev?.[parent],
        [field]: value,
      },
    }));
  }, []);

  // Custom preferred languages management
  const handleAddCustomLanguage = useCallback(
    (e) => {
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
    },
    [customLanguageInput, formData?.preferredLanguages, handleInputChange]
  );

  const handleRemoveCustomLanguage = useCallback(
    (langToRemove) => {
      const currentLangs = formData?.preferredLanguages || [];
      const updated = currentLangs.filter((l) => l !== langToRemove);
      handleInputChange('preferredLanguages', updated);
    },
    [formData?.preferredLanguages, handleInputChange]
  );

  // Submit profile edits
  const handleSaveChanges = useCallback(async () => {
    setIsLoading(true);

    try {
      await clientProfileService.updateProfile(formData);

      setClientData(formData);
      setIsEditDialogOpen(false);

      fetchProfileCompleteness();

      toast.success('Profile Updated Successfully', {
        description: 'Your personal information has been saved.',
      });
    } catch (err) {
      console.error('Error updating profile:', err);

      toast.error('Update Failed', {
        description:
          err.response?.data?.message ||
          err.message ||
          'Failed to update profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, fetchProfileCompleteness]);

  // Upload and persist avatar picture
  const uploadPhoto = useCallback(
    async (file) => {
      try {
        const data = await clientProfileService.uploadProfilePicture(file);
        const newProfilePicture = data.profilePicture;

        // Synchronize local cached client storage
        try {
          const storedClientData = JSON.parse(localStorage.getItem('client') || '{}');
          storedClientData.profilePicture = newProfilePicture;
          localStorage.setItem('client', JSON.stringify(storedClientData));
        } catch (storageErr) {
          console.warn('Could not update localStorage client profile picture:', storageErr);
        }

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
        return newProfilePicture;
      } catch (err) {
        console.error('Error uploading photo:', err);
        toast.error('Upload Failed', {
          description: err.message || 'Failed to upload photo. Please try again.',
        });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchProfileCompleteness]
  );

  return {
    clientData,
    setClientData,
    formData,
    setFormData,
    isFetching,
    isLoading,
    setIsLoading,
    error,
    profileCompleteness,
    isEditDialogOpen,
    setIsEditDialogOpen,
    customLanguageInput,
    setCustomLanguageInput,
    handleInputChange,
    handleNestedInputChange,
    handleAddCustomLanguage,
    handleRemoveCustomLanguage,
    handleSaveChanges,
    uploadPhoto,
    fetchClientData,
    fetchProfileCompleteness,
  };
};

export default useClientProfile;
