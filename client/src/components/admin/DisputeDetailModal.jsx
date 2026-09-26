// components/admin/DisputeDetailModal.jsx - Modern, Responsive Dispute Arbitration Dossier

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'sonner';
import {
  X,
  User,
  Calendar,
  Phone,
  Mail,
  FileText,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  MessageSquare,
  Loader2,
  AlertTriangle,
  Shield,
  Activity,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Video,
  CreditCard,
  Building2,
  Copy,
  Check,
  Paperclip,
  ShieldAlert,
  Send,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import EvidenceFileViewer from './EvidenceFileViewer';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { TIMEZONE } from '@/constants/constants';

dayjs.extend(utc);
dayjs.extend(timezone);

// Helper component for clean copyable field
function CopyableField({ label, value, mono = true, truncate = false, className = '' }) {
  const [copied, setCopied] = useState(false);

  if (!value && value !== 0) return null;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    toast.success(`${label || 'Value'} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <p className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400 tracking-wider uppercase">
          {label}
        </p>
      )}
      <div
        onClick={handleCopy}
        title="Click to copy"
        className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50/80 hover:bg-slate-100/90 dark:bg-neutral-800/60 dark:hover:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700/60 transition-all cursor-pointer select-all"
      >
        <span
          className={`text-xs text-slate-800 dark:text-neutral-200 ${
            mono ? 'font-mono' : 'font-medium'
          } ${truncate ? 'truncate max-w-[170px]' : 'break-all'}`}
        >
          {String(value)}
        </span>
        <button
          type="button"
          className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 transition-colors p-0.5"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

// Helper for initials
const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const DisputeDetailModal = ({ bookingId, isOpen, onClose, onDisputeUpdated }) => {
  const { getDisputeDetail, updateDisputeStatus, addDisputeNote } = useAdminAuth();

  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [resolutionData, setResolutionData] = useState({
    status: '',
    resolution: '',
    refundAmount: 0,
    payoutAmount: 0,
  });
  const [note, setNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchDisputeDetail();
    }
  }, [bookingId, isOpen]);

  const fetchDisputeDetail = async () => {
    setLoading(true);
    const result = await getDisputeDetail(bookingId);

    if (result.success) {
      setDispute(result.data);
      const totalAmount = result.data.slotId?.totalPriceAfterPlatformFee || result.data.amount || 0;
      const counselorBase = result.data.slotId?.basePrice || 0;

      setResolutionData((prev) => ({
        ...prev,
        refundAmount: totalAmount,
        payoutAmount: counselorBase,
      }));
    } else {
      toast.error(result.error || 'Failed to fetch dispute details');
      onClose();
    }
    setLoading(false);
  };

  const handleUpdateStatus = async () => {
    if (!resolutionData.status) {
      toast.error('Please select a resolution status');
      return;
    }

    if (!resolutionData.resolution.trim()) {
      toast.error('Please provide a resolution explanation');
      return;
    }

    setUpdating(true);
    const result = await updateDisputeStatus(
      bookingId,
      resolutionData.status,
      resolutionData.resolution,
      resolutionData.refundAmount,
      resolutionData.payoutAmount
    );

    if (result.success) {
      toast.success('Dispute arbitrated and updated successfully');
      setShowResolutionForm(false);
      onDisputeUpdated();
    } else {
      toast.error(result.error || 'Failed to update dispute');
    }
    setUpdating(false);
  };

  const handleAddNote = async () => {
    if (!note.trim()) {
      toast.error('Please enter a note');
      return;
    }

    setAddingNote(true);
    const result = await addDisputeNote(bookingId, note);

    if (result.success) {
      toast.success('Note recorded successfully');
      setNote('');
      fetchDisputeDetail();
    } else {
      toast.error(result.error || 'Failed to add note');
    }
    setAddingNote(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'under_review':
        return 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'resolved_valid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'resolved_invalid':
        return 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
      case 'closed':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-neutral-800 dark:text-neutral-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'under_review':
        return <Clock className="w-3.5 h-3.5 shrink-0" />;
      case 'resolved_valid':
        return <CheckCircle className="w-3.5 h-3.5 shrink-0" />;
      case 'resolved_invalid':
        return <XCircle className="w-3.5 h-3.5 shrink-0" />;
      case 'closed':
        return <FileText className="w-3.5 h-3.5 shrink-0" />;
      default:
        return <AlertTriangle className="w-3.5 h-3.5 shrink-0" />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      under_review: 'Under Review',
      resolved_valid: 'Resolved (Valid)',
      resolved_invalid: 'Resolved (Invalid)',
      closed: 'Closed',
    };
    return labels[status] || (status ? status.replace(/_/g, ' ') : 'N/A');
  };

  const getIssueTypeLabel = (issueType) => {
    const labels = {
      counselor_did_not_join: 'Counselor did not join',
      counselor_joined_late: 'Counselor joined late',
      session_ended_early: 'Session ended early',
      session_quality_poor: 'Poor session quality',
      counselor_not_proper_guidance: 'Improper guidance',
      counselor_rude_unprofessional: 'Rude / Unprofessional',
      counselor_made_uncomfortable: 'Made uncomfortable',
      audio_problem: 'Audio problem',
      video_problem: 'Video problem',
      internet_disconnection: 'Internet disconnection',
      other: 'Other',
    };
    return labels[issueType] || issueType || 'Unspecified';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).tz(TIMEZONE).format('MMM DD, YYYY • hh:mm A');
  };

  const getFileIcon = (fileType = '') => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType === 'application/pdf') return '📄';
    return '📎';
  };

  if (!isOpen) return null;

  const counselor = dispute?.slotId?.counselorId;
  const client = dispute?.clientId;
  const videoSDKRoomId = dispute?.videoSDKRoomId;
  const slot = dispute?.slotId;
  const payment = dispute?.paymentId;
  const disputeObj = dispute?.dispute || {};
  const evidenceList = disputeObj.evidence || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        size="xl"
        className="w-[96vw] sm:w-[92vw] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[94vh] sm:max-h-[90vh] p-0 flex flex-col overflow-hidden bg-slate-50/80 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 shadow-2xl rounded-2xl"
      >
        {/* Header */}
        <DialogHeader className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-2">
                  Complete Dispute Analysis
                </DialogTitle>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                  Arbitration dossier for Booking #{dispute?._id ? dispute._id.substring(0, 10) : 'N/A'}
                </p>
              </div>
            </div>

            {dispute && (
              <Badge
                variant="outline"
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                  disputeObj.status || dispute.status
                )}`}
              >
                {getStatusIcon(disputeObj.status || dispute.status)}
                <span>{getStatusLabel(disputeObj.status || dispute.status)}</span>
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 flex-1 text-slate-500 dark:text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-2.5" />
            <span className="text-sm font-medium">Loading dispute dossier...</span>
          </div>
        ) : !dispute ? (
          <div className="flex flex-col items-center justify-center py-20 flex-1 text-slate-500">
            <AlertTriangle className="w-10 h-10 text-slate-400 mb-2" />
            <p className="text-sm font-semibold">Dispute record could not be found</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Top Quick Summary Hero Banner */}
            <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-xs">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                        Booking ID:
                      </span>
                      <code className="text-xs bg-slate-100 dark:bg-neutral-800 px-2.5 py-0.5 rounded-md font-mono text-slate-800 dark:text-neutral-200 font-semibold">
                        {dispute._id}
                      </code>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 dark:text-neutral-400">
                      <Badge variant="secondary" className="font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 border-amber-200/80">
                        Issue: {getIssueTypeLabel(disputeObj.issueType)}
                      </Badge>
                      <span className="text-slate-300 dark:text-neutral-700">•</span>
                      <span>Disputed on: <strong className="text-slate-800 dark:text-neutral-200">{formatDate(disputeObj.disputedAt || dispute.createdAt)}</strong></span>
                      {disputeObj.needFollowUpCall && (
                        <>
                          <span className="text-slate-300 dark:text-neutral-700">•</span>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Follow-up Requested
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>

                  {evidenceList.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFileIndex(0);
                        setShowFileViewer(true);
                      }}
                      className="text-xs h-8 px-3 font-medium border-slate-200 dark:border-neutral-700 hover:bg-slate-100 shrink-0"
                    >
                      <Paperclip className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                      View Evidence ({evidenceList.length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Client & Counselor Profile Cards (2-Column Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Card */}
              <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-xs">
                <CardHeader className="py-2.5 px-4 border-b border-slate-100 dark:border-neutral-800">
                  <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    Complainant (Client)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 rounded-xl border border-blue-100 dark:border-blue-900 shadow-xs shrink-0">
                      <AvatarImage src={client?.profilePicture} alt={client?.fullName} />
                      <AvatarFallback className="rounded-xl bg-blue-50 text-blue-700 font-bold text-sm">
                        {getInitials(client?.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-neutral-100 truncate">
                        {client?.fullName || 'Client Name Unavailable'}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        @{client?.username || 'client'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <CopyableField label="Email" value={client?.email} mono={false} />
                      <CopyableField label="Phone" value={client?.phone} />
                    </div>
                    {client?._id && (
                      <CopyableField label="Client ID" value={client._id} />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Counselor Card */}
              <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-xs">
                <CardHeader className="py-2.5 px-4 border-b border-slate-100 dark:border-neutral-800">
                  <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    Assigned Counselor
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 rounded-xl border border-purple-100 dark:border-purple-900 shadow-xs shrink-0">
                      <AvatarImage src={counselor?.profilePicture} alt={counselor?.fullName} />
                      <AvatarFallback className="rounded-xl bg-purple-50 text-purple-700 font-bold text-sm">
                        {getInitials(counselor?.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-neutral-100 truncate">
                        {counselor?.fullName || 'Counselor Name Unavailable'}
                      </p>
                      <span className="inline-block text-[11px] px-2 py-0.5 rounded font-semibold text-purple-700 bg-purple-50 dark:bg-purple-950/50">
                        {counselor?.experienceLevel || 'Professional Counselor'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <CopyableField label="Email" value={counselor?.email} mono={false} />
                      <CopyableField label="Phone" value={counselor?.phone} />
                    </div>
                    {counselor?._id && (
                      <CopyableField label="Counselor ID" value={counselor._id} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Session, Slot & Financial Details */}
            <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-xs">
              <CardHeader className="py-2.5 px-4 border-b border-slate-100 dark:border-neutral-800">
                <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  Session & Financial Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <CopyableField label="Slot ID" value={slot?._id} />
                  <CopyableField label="Video SDK Room ID" value={videoSDKRoomId || slot?.videoSDKRoomId || 'N/A'} />
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400 tracking-wider uppercase">
                      Scheduled Session Time
                    </p>
                    <p className="text-xs font-medium text-slate-800 dark:text-neutral-200 mt-1.5">
                      {slot?.startTime ? formatDate(slot.startTime) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* 3-Stage Financial Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-neutral-800">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200/70 dark:border-neutral-700/70">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Counselor Base Fee
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-neutral-100 mt-0.5">
                      ₹{slot?.basePrice || 0}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Counselor's share</p>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60">
                    <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                      Platform Fee
                    </p>
                    <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">
                      ₹
                      {slot?.totalPriceAfterPlatformFee && slot?.basePrice
                        ? slot.totalPriceAfterPlatformFee - slot.basePrice
                        : 0}
                    </p>
                    <p className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70 mt-0.5">Solvit Commission</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60">
                    <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                      Total Client Paid
                    </p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                      ₹{slot?.totalPriceAfterPlatformFee || dispute.amount || 0}
                    </p>
                    <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">Total transaction value</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Grievance Statement */}
            <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-xs">
              <CardHeader className="py-2.5 px-4 border-b border-slate-100 dark:border-neutral-800">
                <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  Client Grievance & Description
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs sm:text-sm text-slate-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                  {disputeObj.description || 'No detailed written description provided by client.'}
                </div>

                {/* Evidence Thumbnails */}
                {evidenceList.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Evidence Attachments ({evidenceList.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {evidenceList.map((file, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedFileIndex(idx);
                            setShowFileViewer(true);
                          }}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 hover:bg-slate-100 dark:bg-neutral-800/50 cursor-pointer transition-colors group"
                        >
                          <span className="text-xl shrink-0">{getFileIcon(file.fileType)}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 dark:text-neutral-200 truncate group-hover:text-blue-600">
                              {file.fileName || `Evidence #${idx + 1}`}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {(file.fileSize / 1024).toFixed(1)} KB • {file.fileType?.split('/')[1] || 'file'}
                            </p>
                          </div>
                          <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Arbitration Actions or Resolution Result */}
            {disputeObj.status === 'under_review' ? (
              <Card className="bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 dark:from-neutral-900 dark:to-neutral-900 border-amber-200/80 dark:border-neutral-800 shadow-sm">
                <CardHeader className="py-2.5 px-4 border-b border-amber-100 dark:border-neutral-800">
                  <CardTitle className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                    Admin Arbitration Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Internal Notes Section */}
                  <div>
                    <Label htmlFor="admin-note" className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
                      Record Internal Audit Note
                    </Label>
                    <div className="flex gap-2 mt-1.5">
                      <Input
                        id="admin-note"
                        placeholder="Add internal observation or verification note..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="text-xs bg-white dark:bg-neutral-900 border-slate-200"
                      />
                      <Button
                        type="button"
                        onClick={handleAddNote}
                        disabled={addingNote || !note.trim()}
                        variant="outline"
                        size="sm"
                        className="text-xs h-9 px-3 shrink-0"
                      >
                        {addingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Resolution Form Toggle */}
                  {!showResolutionForm ? (
                    <Button
                      type="button"
                      onClick={() => setShowResolutionForm(true)}
                      className="w-full h-9 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      Arbitrate & Submit Resolution
                    </Button>
                  ) : (
                    <div className="space-y-3 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-amber-200 dark:border-neutral-800">
                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Resolution Decision *</Label>
                        <Select
                          value={resolutionData.status}
                          onValueChange={(val) => setResolutionData({ ...resolutionData, status: val })}
                        >
                          <SelectTrigger className="mt-1 h-9 text-xs">
                            <SelectValue placeholder="Select outcome..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="resolved_valid">
                              Resolved (Valid) — Refund Client ₹{slot?.totalPriceAfterPlatformFee || dispute.amount || 0}
                            </SelectItem>
                            <SelectItem value="resolved_invalid">
                              Resolved (Invalid) — Release Counselor Payout ₹{slot?.basePrice || 0}
                            </SelectItem>
                            <SelectItem value="closed">Close Dispute Without Financial Action</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {resolutionData.status === 'resolved_valid' && (
                        <div>
                          <Label className="text-xs font-semibold text-slate-700">Refund Amount (₹)</Label>
                          <Input
                            type="number"
                            value={resolutionData.refundAmount}
                            onChange={(e) => setResolutionData({ ...resolutionData, refundAmount: parseFloat(e.target.value) || 0 })}
                            className="mt-1 h-8 text-xs"
                          />
                        </div>
                      )}

                      {resolutionData.status === 'resolved_invalid' && (
                        <div>
                          <Label className="text-xs font-semibold text-slate-700">Counselor Payout Amount (₹)</Label>
                          <Input
                            type="number"
                            value={resolutionData.payoutAmount}
                            onChange={(e) => setResolutionData({ ...resolutionData, payoutAmount: parseFloat(e.target.value) || 0 })}
                            className="mt-1 h-8 text-xs"
                          />
                        </div>
                      )}

                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Resolution Explanation / Decision Notes *</Label>
                        <Textarea
                          placeholder="Document the arbitration reasoning for client and counselor records..."
                          value={resolutionData.resolution}
                          onChange={(e) => setResolutionData({ ...resolutionData, resolution: e.target.value })}
                          rows={3}
                          className="mt-1 text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          type="button"
                          onClick={handleUpdateStatus}
                          disabled={updating}
                          size="sm"
                          className="flex-1 h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
                          Confirm & Apply Resolution
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowResolutionForm(false)}
                          className="h-9 px-3 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              /* Already Resolved Card */
              <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-xs">
                <CardHeader className="py-2.5 px-4 border-b border-slate-100 dark:border-neutral-800">
                  <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    Final Arbitration Outcome
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200/70 dark:border-neutral-700/70 text-slate-800 dark:text-neutral-200">
                    <p className="font-semibold text-slate-900 dark:text-neutral-100">
                      Outcome: <span className="capitalize">{getStatusLabel(disputeObj.status)}</span>
                    </p>
                    <p className="mt-1 text-slate-700 dark:text-neutral-300 leading-relaxed">
                      {disputeObj.resolution || 'Dispute was formally resolved and closed.'}
                    </p>
                    {disputeObj.resolvedAt && (
                      <p className="text-[11px] text-slate-400 mt-2">
                        Arbitrated on: {formatDate(disputeObj.resolvedAt)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-shrink-0 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-8 px-4 font-medium border-slate-300 dark:border-neutral-700"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Evidence File Viewer Modal */}
      {showFileViewer && evidenceList.length > 0 && (
        <EvidenceFileViewer
          files={evidenceList}
          initialIndex={selectedFileIndex}
          isOpen={showFileViewer}
          onClose={() => setShowFileViewer(false)}
        />
      )}
    </Dialog>
  );
};

export default DisputeDetailModal;
