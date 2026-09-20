import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  RotateCcw,
  Star,
  FileText,
  Calendar,
  Send,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import api from '../../../lib/axios';
import { toast } from 'react-toastify';

export function LeaveScreen({
  setIsMeetingLeft,
  participantId,
  leaveReason,
  setLeaveReason,
  sessionData,
}) {
  const navigate = useNavigate();
  const role = participantId?.startsWith('counselor') ? 'counselor' : 'client';
  const bookingId = sessionData?.booking?._id || sessionData?._id;

  const endTimeStr =
    sessionData?.booking?.slotId?.endTime ||
    sessionData?.booking?.endTime ||
    sessionData?.slotId?.endTime;

  const isSessionExpired =
    leaveReason === 'The scheduled session time has ended.' ||
    (endTimeStr && new Date(endTimeStr).getTime() <= Date.now());

  // Client Feedback Form State
  const [clientRating, setClientRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [clientReview, setClientReview] = useState('');
  const [selectedClientTags, setSelectedClientTags] = useState([]);
  const [callQuality, setCallQuality] = useState(5);

  // Counselor Notes Form State - Pre-filled from in-session live notes draft
  const [counselorNotes, setCounselorNotes] = useState(() => {
    if (bookingId) {
      try {
        const savedDraft = sessionStorage.getItem(`live_session_notes_${bookingId}`);
        if (savedDraft) return savedDraft;
      } catch (err) {}
    }
    return '';
  });
  const [selectedCounselorTags, setSelectedCounselorTags] = useState([]);
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const clientTagOptions = [
    'Great Listener',
    'Actionable Advice',
    'Very Empathetic',
    'Helpful Tools',
    'Clear Explanations',
    'Comfortable Space',
  ];

  const counselorTagOptions = [
    'Anxiety',
    'Career Growth',
    'Academic Stress',
    'Relationships',
    'Goal Setting',
    'Coping Strategies',
    'Action Plan Assigned',
  ];

  const toggleClientTag = (tag) => {
    setSelectedClientTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleCounselorTag = (tag) => {
    setSelectedCounselorTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClientFeedbackSubmit = async (e) => {
    e?.preventDefault();
    if (!clientRating) {
      toast.warning('Please select a star rating before submitting');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post(`/meeting/session/${bookingId}/feedback`, {
        rating: clientRating,
        review: clientReview,
        tags: selectedClientTags,
        callQualityRating: callQuality,
        isPublic: true,
      });
      setIsSubmitted(true);
      toast.success('Thank you! Your feedback has been recorded.');
      setTimeout(() => {
        navigate('/client/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      toast.error(err.response?.data?.message || 'Could not submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCounselorNotesSubmit = async (e) => {
    e?.preventDefault();
    if (!counselorNotes.trim()) {
      toast.warning('Please enter clinical notes before saving.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post(`/meeting/session/${bookingId}/notes`, {
        notes: counselorNotes,
        tags: selectedCounselorTags,
        followUpRequired,
        followUpDate: followUpRequired && followUpDate ? followUpDate : undefined,
      });
      setIsSubmitted(true);
      if (bookingId) {
        try {
          sessionStorage.removeItem(`live_session_notes_${bookingId}`);
        } catch (err) {}
      }
      toast.success('Clinical notes saved securely.');
      setTimeout(() => {
        navigate('/counselor/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Failed to save notes:', err);
      toast.error(err.response?.data?.message || 'Could not save clinical notes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingDescriptions = {
    1: 'Needs Improvement',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Exceptional',
  };

  return (
    <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-primary-950/40 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 text-neutral-100">
      <div className="max-w-xl w-full bg-neutral-900/90 border border-neutral-800 shadow-2xl rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
        {/* Header section */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400 shrink-0">
            {isSessionExpired ? <Clock className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
          </div>
          <div className="text-left flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isSessionExpired ? 'Session Completed' : 'You Left the Meeting'}
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm">
              {isSessionExpired
                ? 'The scheduled consultation time has ended.'
                : 'You have exited the session room.'}
            </p>
          </div>

          {!isSessionExpired && (
            <button
              onClick={() => {
                if (typeof setLeaveReason === 'function') setLeaveReason(null);
                setIsMeetingLeft(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700 transition"
              title="Rejoin this active session"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              Rejoin
            </button>
          )}
        </div>

        {/* ── CLIENT VIEW: Star Rating & Review ── */}
        {role === 'client' && (
          <div className="bg-neutral-950/60 rounded-xl p-5 border border-neutral-800/80 space-y-4 text-left">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-neutral-200">
                How was your session experience?
              </h2>
            </div>

            {isSubmitted ? (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <p className="font-semibold text-white">Feedback Submitted!</p>
                <p className="text-xs text-neutral-400">Redirecting to your dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleClientFeedbackSubmit} className="space-y-4">
                {/* Star Rating */}
                <div className="flex flex-col items-center justify-center py-2 space-y-1">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setClientRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-150 ${
                            (hoverRating || clientRating) >= star
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                              : 'text-neutral-600 hover:text-neutral-500'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-medium text-amber-300 min-h-[16px]">
                    {(hoverRating || clientRating)
                      ? ratingDescriptions[hoverRating || clientRating]
                      : 'Tap a star to rate'}
                  </span>
                </div>

                {/* Quick Tags */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2">
                    What stood out? (Optional)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {clientTagOptions.map((tag) => {
                      const isSelected = selectedClientTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleClientTag(tag)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                            isSelected
                              ? 'bg-primary-600/30 text-primary-300 border-primary-500/50'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Review textarea */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                    Additional Comments (Optional)
                  </label>
                  <textarea
                    value={clientReview}
                    onChange={(e) => setClientReview(e.target.value)}
                    placeholder="Share any thoughts on your consultation..."
                    rows={2}
                    className="w-full text-xs sm:text-sm bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/client/dashboard')}
                    className="text-xs text-neutral-400 hover:text-neutral-200 px-3 py-2 transition"
                  >
                    Skip & Return
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !clientRating}
                    className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold py-2.5 px-5 rounded-xl shadow-lg transition active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      'Submitting...'
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Submit Feedback
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ── COUNSELOR VIEW: Clinical Notes & Follow-up ── */}
        {role === 'counselor' && (
          <div className="bg-neutral-950/60 rounded-xl p-5 border border-neutral-800/80 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-400" />
                <h2 className="text-sm font-semibold text-neutral-200">
                  Post-Session Clinical Notes
                </h2>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                Private & Confidential
              </div>
            </div>

            {isSubmitted ? (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <p className="font-semibold text-white">Clinical Notes Saved!</p>
                <p className="text-xs text-neutral-400">Redirecting to counselor dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleCounselorNotesSubmit} className="space-y-4">
                {/* Notes Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <label className="block text-xs font-medium text-neutral-400">
                      Summary, Observations & Homework / Action Items *
                    </label>
                    {counselorNotes && (
                      <span className="text-[10.5px] text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full border border-primary-500/20 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-primary-400" />
                        In-Session Draft Restored
                      </span>
                    )}
                  </div>
                  <textarea
                    value={counselorNotes}
                    onChange={(e) => setCounselorNotes(e.target.value)}
                    placeholder="E.g., Client discussed coping mechanisms for exam anxiety. Recommended 10-min daily mindfulness. Follow-up on progress in 2 weeks."
                    rows={5}
                    required
                    className="w-full text-xs sm:text-sm bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none leading-relaxed"
                  />
                </div>

                {/* Session Focus Tags */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2">
                    Session Topics / Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {counselorTagOptions.map((tag) => {
                      const isSelected = selectedCounselorTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleCounselorTag(tag)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                            isSelected
                              ? 'bg-primary-600/30 text-primary-300 border-primary-500/50'
                              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Follow-up Section */}
                <div className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800 space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={followUpRequired}
                      onChange={(e) => setFollowUpRequired(e.target.checked)}
                      className="rounded border-neutral-700 bg-neutral-800 text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-neutral-200">
                      Follow-up session recommended
                    </span>
                  </label>

                  {followUpRequired && (
                    <div className="flex items-center gap-2 pt-1">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="text-xs bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-200 focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/counselor/dashboard')}
                    className="text-xs text-neutral-400 hover:text-neutral-200 px-3 py-2 transition"
                  >
                    Skip & Return
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !counselorNotes.trim()}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold py-2.5 px-5 rounded-xl shadow-lg transition active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      'Saving...'
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Save Clinical Notes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Fallback Return button if neither form is shown */}
        {role !== 'client' && role !== 'counselor' && (
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all active:scale-[0.99]"
          >
            <ArrowRight className="w-4 h-4" />
            Return Home
          </button>
        )}
      </div>
    </div>
  );
}
