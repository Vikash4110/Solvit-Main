import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Lock,
  Calendar,
  Clock,
  Tag,
  Check,
  Copy,
  Edit3,
  Loader2,
  AlertCircle,
  Sparkles,
  CalendarCheck,
  Save,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { TIMEZONE } from '../../../constants/constants';

dayjs.extend(utc);
dayjs.extend(timezone);

const CLINICAL_TAG_OPTIONS = [
  'Anxiety',
  'Depression',
  'Career Growth',
  'Academic Stress',
  'Relationships',
  'Goal Setting',
  'Coping Strategies',
  'Action Plan Assigned',
  'Crisis Risk Assessed',
  'Mindfulness Exercise',
  'Workplace Conflict',
  'Self-Esteem',
];

export const ClinicalNotesModal = ({
  isOpen,
  onClose,
  booking,
  onNotesSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Note data state
  const [noteData, setNoteData] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');

  const bookingId = booking?.bookingId || booking?._id;

  // Fetch note when modal opens
  useEffect(() => {
    if (!isOpen || !bookingId) return;

    let isMounted = true;
    const fetchNote = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/meeting/session/${bookingId}/notes`);
        if (!isMounted) return;

        const fetchedNote = response.data?.data;
        if (fetchedNote && fetchedNote.notes) {
          setNoteData(fetchedNote);
          setNotesText(fetchedNote.notes);
          setSelectedTags(Array.isArray(fetchedNote.tags) ? fetchedNote.tags : []);
          setFollowUpRequired(Boolean(fetchedNote.followUpRequired));
          setFollowUpDate(
            fetchedNote.followUpDate
              ? dayjs(fetchedNote.followUpDate).format('YYYY-MM-DD')
              : ''
          );
          setIsEditing(false);
        } else {
          setNoteData(null);
          setNotesText('');
          setSelectedTags([]);
          setFollowUpRequired(false);
          setFollowUpDate('');
          setIsEditing(true); // Open in edit mode if no notes exist yet
        }
      } catch (err) {
        console.error('Failed to fetch counselor note:', err);
        if (isMounted) {
          setNoteData(null);
          setNotesText('');
          setSelectedTags([]);
          setFollowUpRequired(false);
          setFollowUpDate('');
          setIsEditing(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNote();

    return () => {
      isMounted = false;
    };
  }, [isOpen, bookingId]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCopyNotes = async () => {
    if (!notesText) return;
    try {
      await navigator.clipboard.writeText(notesText);
      setCopied(true);
      toast.success('Clinical notes copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleSaveNotes = async (e) => {
    e?.preventDefault();
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

      const response = await api.post(`/meeting/session/${bookingId}/notes`, payload);
      const savedNote = response.data?.data;

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
  };

  if (!booking) return null;

  const clientName = booking?.clientName || 'Client Consultation';
  const initials =
    clientName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'CL';

  const formattedDate = booking?.startTime
    ? dayjs.utc(booking.startTime).tz(TIMEZONE).format('ddd, MMM D, YYYY')
    : 'N/A';
  const formattedTime = booking?.startTime
    ? `${dayjs.utc(booking.startTime).tz(TIMEZONE).format('h:mm A')} - ${dayjs.utc(booking.endTime).tz(TIMEZONE).format('h:mm A')}`
    : 'N/A';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="lg" className="p-0 gap-0 overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-2xl">
        {/* Header with Client Info & Privacy Badge */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-primary-50/80 via-white to-blue-50/50 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <Avatar className="w-12 h-12 border-2 border-primary-500/20 shadow-sm shrink-0">
                <AvatarImage src={booking.clientPhoto} alt={clientName} />
                <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <span>{clientName}</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                    {formattedDate}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                    {formattedTime}
                  </span>
                </DialogDescription>
              </div>
            </div>

            {/* Privacy Tag */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium shrink-0">
              <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Private Clinical Record</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Retrieving confidential clinical notes...
              </p>
            </div>
          ) : !isEditing && noteData ? (
            /* ── VIEW MODE ── */
            <div className="space-y-5">
              {/* Tags display */}
              {selectedTags.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                    Focus Areas & Interventions
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 border-primary-200/60 dark:border-primary-800 text-xs px-2.5 py-0.5 rounded-lg"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                    Session Summary & Progress Notes
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyNotes}
                    className="h-7 px-2 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" /> Copy Notes
                      </>
                    )}
                  </Button>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50/90 dark:bg-neutral-950/70 border border-neutral-200/80 dark:border-neutral-800/80 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 font-sans">
                  {noteData.notes}
                </div>
              </div>

              {/* Follow up status */}
              {noteData.followUpRequired && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
                  <CalendarCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <span className="font-semibold">Follow-up Consultation Recommended: </span>
                    {noteData.followUpDate
                      ? dayjs(noteData.followUpDate).format('MMMM D, YYYY')
                      : 'Flagged for follow-up'}
                  </div>
                </div>
              )}

              {/* Last updated footer */}
              <div className="text-[11px] text-neutral-400 dark:text-neutral-500 pt-2 flex items-center justify-between">
                <span>
                  Last saved:{' '}
                  {noteData.updatedAt
                    ? dayjs(noteData.updatedAt).tz(TIMEZONE).format('MMM D, YYYY [at] h:mm A')
                    : 'Recorded post-session'}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <Check className="w-3 h-3" /> Securely Stored
                </span>
              </div>
            </div>
          ) : (
            /* ── EDIT / CREATE MODE ── */
            <form onSubmit={handleSaveNotes} className="space-y-4">
              {/* Quick Tags Selection */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                  Focus Tags & Topics (Optional)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CLINICAL_TAG_OPTIONS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition font-medium ${
                          isSelected
                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                            : 'bg-neutral-100 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700/60 hover:bg-neutral-200 dark:hover:bg-neutral-700/80'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clinical Notes Text Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                    Clinical Summary & Action Plan *
                  </label>
                  <span className="text-[11px] text-neutral-400">
                    {notesText.length} / 5000 characters
                  </span>
                </div>
                <Textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Record client symptoms, session observations, cognitive reframing interventions, assigned homework, and coping strategies discussed..."
                  className="min-h-[160px] text-sm leading-relaxed p-3.5 rounded-xl bg-neutral-50/50 dark:bg-neutral-950/50 border-neutral-200 dark:border-neutral-800 focus:ring-2 focus:ring-primary-500/20"
                  maxLength={5000}
                  required
                />
              </div>

              {/* Follow-up Section */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={followUpRequired}
                    onChange={(e) => setFollowUpRequired(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-neutral-300 dark:border-neutral-700"
                  />
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Follow-up consultation recommended for this client
                  </span>
                </label>

                {followUpRequired && (
                  <div className="pl-6 pt-1 flex items-center gap-3">
                    <label className="text-xs text-neutral-600 dark:text-neutral-400">
                      Target Follow-up Date:
                    </label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      min={dayjs().format('YYYY-MM-DD')}
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-50/80 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-neutral-400" />
            <span>Strictly confidential</span>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && noteData ? (
              <>
                <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                  Edit Notes
                </Button>
              </>
            ) : (
              <>
                {noteData && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNotesText(noteData.notes || '');
                      setSelectedTags(noteData.tags || []);
                      setFollowUpRequired(Boolean(noteData.followUpRequired));
                      setFollowUpDate(
                        noteData.followUpDate
                          ? dayjs(noteData.followUpDate).format('YYYY-MM-DD')
                          : ''
                      );
                      setIsEditing(false);
                    }}
                    disabled={saving}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                )}
                {!noteData && (
                  <Button variant="outline" size="sm" onClick={onClose} disabled={saving} className="rounded-xl">
                    Close
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={saving || !notesText.trim()}
                  className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 mr-1.5" /> Save Clinical Notes
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
