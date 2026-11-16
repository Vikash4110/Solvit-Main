import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { videoSessionService } from '../services/video';

/**
 * Enterprise Layer 3 State Hook for Counselor Clinical Session Notes.
 * Encapsulates clinical note retrieval, state normalization, tag selection,
 * follow-up configuration, and persistence.
 *
 * @param {Object} options - Configuration options.
 * @param {string} options.bookingId - Unique booking ID.
 * @param {boolean} [options.isOpen=false] - Whether the clinical notes view/modal is active.
 * @param {Function} [options.onNotesSaved] - Callback invoked when notes are committed.
 * @returns {Object} Notes state and mutation handlers.
 */
export const useClinicalNotes = ({ bookingId, isOpen = false, onNotesSaved } = {}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const [noteData, setNoteData] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');

  // Fetch clinical notes history when modal opens
  const fetchNote = useCallback(async () => {
    if (!bookingId) return;

    try {
      setLoading(true);
      const data = await videoSessionService.getClinicalNotes(bookingId);

      if (data && data.notes) {
        setNoteData(data);
        setNotesText(data.notes);
        setSelectedTags(Array.isArray(data.tags) ? data.tags : []);
        setFollowUpRequired(Boolean(data.followUpRequired));
        setFollowUpDate(data.followUpDate ? dayjs(data.followUpDate).format('YYYY-MM-DD') : '');
        setIsEditing(false);
      } else {
        setNoteData(null);
        setNotesText('');
        setSelectedTags([]);
        setFollowUpRequired(false);
        setFollowUpDate('');
        setIsEditing(true);
      }
    } catch (err) {
      console.error('Failed to fetch clinical note:', err);
      setNoteData(null);
      setNotesText('');
      setSelectedTags([]);
      setFollowUpRequired(false);
      setFollowUpDate('');
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchNote();
    }
  }, [isOpen, bookingId, fetchNote]);

  const toggleTag = useCallback((tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleCopyNotes = useCallback(async () => {
    if (!notesText) return;
    try {
      await navigator.clipboard.writeText(notesText);
      setCopied(true);
      toast.success('Clinical notes copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  }, [notesText]);

  const handleSaveNotes = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      if (!notesText.trim()) {
        toast.warning('Please enter clinical notes before saving');
        return;
      }

      try {
        setSaving(true);
        const payload = {
          notes: notesText.trim(),
          tags: selectedTags,
          followUpRequired,
          followUpDate: followUpRequired && followUpDate ? followUpDate : undefined,
        };

        const response = await videoSessionService.saveClinicalNotes(bookingId, payload);
        const savedNote = response?.data || response;

        setNoteData(savedNote);
        setIsEditing(false);
        toast.success('Clinical notes saved successfully');

        if (typeof onNotesSaved === 'function') {
          onNotesSaved(bookingId, savedNote);
        }
      } catch (err) {
        console.error('Failed to save clinical notes:', err);
        toast.error(err.response?.data?.message || 'Could not save clinical notes');
      } finally {
        setSaving(false);
      }
    },
    [bookingId, followUpDate, followUpRequired, notesText, onNotesSaved, selectedTags]
  );

  return {
    loading,
    saving,
    isEditing,
    setIsEditing,
    copied,
    noteData,
    notesText,
    setNotesText,
    selectedTags,
    setSelectedTags,
    toggleTag,
    followUpRequired,
    setFollowUpRequired,
    followUpDate,
    setFollowUpDate,
    fetchNote,
    handleCopyNotes,
    handleSaveNotes,
  };
};

export default useClinicalNotes;
