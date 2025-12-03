// components/admin/DisputeDetailModal.jsx

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
import EvidenceFileViewer from './EvidenceFileViewer';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);
import { TIMEZONE } from '@/constants/constants';

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
      console.log(result.data);
      // Pre-fill payout amounts
      setResolutionData((prev) => ({
        ...prev,
        refundAmount: result.data.payout?.amountToPayToCounselor || 0,
        payoutAmount: result.data.payout?.amountToPayToCounselor || 0,
      }));
    } else {
      toast.error(result.error);
      onClose();
    }
    setLoading(false);
  };

  const handleUpdateStatus = async () => {
    if (!resolutionData.status) {
      toast.error('Please select a status');
      return;
    }

    if (!resolutionData.resolution.trim()) {
      toast.error('Please provide a resolution comment');
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
      toast.success('Dispute status updated successfully');
      setShowResolutionForm(false);
      onDisputeUpdated();
    } else {
      toast.error(result.error);
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
      toast.success('Note added successfully');
      setNote('');
      fetchDisputeDetail();
    } else {
      toast.error(result.error);
    }
    setAddingNote(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved_valid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'resolved_invalid':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'under_review':
        return <Clock className="w-4 h-4" />;
      case 'resolved_valid':
        return <CheckCircle className="w-4 h-4" />;
      case 'resolved_invalid':
        return <XCircle className="w-4 h-4" />;
      case 'closed':
        return <FileText className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getIssueTypeLabel = (issueType) => {
    const labels = {
      counselor_did_not_join: 'Counselor did not join',
      counselor_joined_late: 'Counselor joined late',
      session_ended_early: 'Session ended early',
      session_quality_poor: 'Poor session quality',
      counselor_not_proper_guidance: 'Improper guidance',
      counselor_rude_unprofessional: 'Rude/Unprofessional',
      counselor_made_uncomfortable: 'Made uncomfortable',
      audio_problem: 'Audio problem',
      video_problem: 'Video problem',
      internet_disconnection: 'Internet disconnection',
      other: 'Other',
    };
    return labels[issueType] || issueType;
  };

  // ✅ FIXED: Updated formatDate function using dayjs with timezone
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).tz(TIMEZONE).format('MMM DD, YYYY hh:mm A');
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType === 'application/pdf') return '📄';
    return '📎';
  };

  const calculateDuration = (start, end) => {
    const duration = Math.round((new Date(end) - new Date(start)) / (1000 * 60));
    return `${duration} minutes`;
  };

  if (!isOpen) return null;

  const counselor = dispute?.slotId?.counselorId;
  const client = dispute?.clientId;
  const session = dispute?.sessionId;
  const slot = dispute?.slotId;
  const payment = dispute?.paymentId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] p-0 overflow-hidden flex flex-col">
        {/* Header - Fixed at top */}
        <DialogHeader className="px-6 py-4 border-b bg-white flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            Complete Dispute Analysis
            {dispute && (
              <Badge
                variant="outline"
                className={`ml-auto ${getStatusColor(dispute.dispute?.status)}`}
              >
                {getStatusIcon(dispute.dispute?.status)}
                <span className="ml-1 capitalize">{dispute.dispute?.status.replace('_', ' ')}</span>
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Comprehensive view of dispute, client, counselor, session, and payment details
          </DialogDescription>
        </DialogHeader>

        {/* Main Content - Scrollable */}
        {loading ? (
          <div className="flex items-center justify-center py-12 flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6 pb-6">
              {/* Quick Summary Card */}
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-5 gap-4 text-center">
                    <div>
                      <p className="text-sm text-slate-600">Booking ID</p>
                      <code className="text-xs bg-white px-2 py-1 rounded mt-1 inline-block">
                        {dispute._id.slice(-8)}
                      </code>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Status</p>
                      <Badge className="mt-1 capitalize">{dispute.status.replace('_', ' ')}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Disputed At</p>
                      <p className="text-sm font-medium mt-1">
                        {formatDate(dispute.dispute.disputedAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Evidence Files</p>
                      <p className="text-sm font-medium mt-1">
                        {dispute.dispute?.evidence?.length || 0} files
                      </p>
                    </div>
                    {/* Jump to Evidence Button */}
                    <div className="flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-full"
                        onClick={() => {
                          document.getElementById('evidence-section')?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                          });
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Evidence
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Client & Counselor Side by Side */}
              <div className="grid grid-cols-2 gap-6">
                {/* Client Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Client Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      {client?.profilePicture ? (
                        <img
                          src={client.profilePicture}
                          alt={client.fullName}
                          className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-8 h-8 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-lg text-slate-900">{client?.fullName}</p>
                        <Badge variant="secondary">Client Id : {client?._id}</Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span className="text-slate-700">{client?.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span className="text-slate-700">{client?.phone}</span>
                      </div>
                    </div>

                    <Separator />
                  </CardContent>
                </Card>

                {/* Counselor Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                      Counselor Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      {counselor?.profilePicture ? (
                        <img
                          src={counselor.profilePicture}
                          alt={counselor.fullName}
                          className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                          <User className="w-8 h-8 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-lg text-slate-900">
                          {counselor?.fullName}
                        </p>
                        <Badge variant="secondary">{counselor?.experienceLevel}</Badge>
                        <Badge variant="secondary">CounselorID : {counselor?._id}</Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span className="text-slate-700">{counselor?.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span className="text-slate-700">{counselor?.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span className="text-slate-700">
                          {counselor?.experienceYears} years experience
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Session & Slot Details */}
              <div className="grid grid-cols-2 gap-6">
                {/* Session Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Video className="w-5 h-5 text-green-600" />
                      Session Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-slate-600">Session ID</Label>
                        <code className="block text-xs bg-slate-100 px-2 py-1 rounded mt-1">
                          {session?._id || 'N/A'}
                        </code>
                      </div>
                      <div></div>
                    </div>

                    <Separator />

                    {session && (
                      <>
                        <div>
                          <Label className="text-xs text-slate-600">Scheduled Time</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <p className="text-sm text-slate-700">
                              {formatDate(session.scheduledStartTime)}
                            </p>
                            <p>to</p>
                            <p className="text-sm text-slate-700">
                              {formatDate(session.scheduledEndTime)}
                            </p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600">Duration</Label>
                          <p className="text-sm text-slate-700 mt-1">
                            {calculateDuration(
                              session.scheduledStartTime,
                              session.scheduledEndTime
                            )}
                          </p>
                        </div>
                        {session.videoSDKRoomId && (
                          <div>
                            <Label className="text-xs text-slate-600">VideoSDK Room ID</Label>
                            <code className="block text-xs bg-slate-100 px-2 py-1 rounded mt-1">
                              {session.videoSDKRoomId}
                            </code>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Slot Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      Slot Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-slate-600">Slot ID</Label>
                        <code className="block text-xs bg-slate-100 px-2 py-1 rounded mt-1">
                          {slot?._id || 'N/A'}
                        </code>
                      </div>
                    </div>

                    <Separator />

                    {slot && (
                      <>
                        <div>
                          <Label className="text-xs text-slate-600">Slot Time</Label>
                          <div className="text-sm text-slate-700 mt-1">
                            <p>{formatDate(slot.startTime)}</p>
                            <p>to</p>
                            <p>{formatDate(slot.endTime)}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-slate-600">
                              Base Price As Set By Counselor
                            </Label>
                            <p className="text-lg font-semibold text-green-600 mt-1">
                              ₹{slot.basePrice}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-600">
                              Total Price After The Platform Fee
                            </Label>
                            <p className="text-lg font-semibold text-blue-600 mt-1">
                              ₹{slot.totalPriceAfterPlatformFee}
                            </p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600">Platform Fee</Label>
                          <p className="text-lg font-semibold text-slate-700 mt-1">
                            ₹
                            {slot?.totalPriceAfterPlatformFee && slot?.basePrice
                              ? slot.totalPriceAfterPlatformFee - slot.basePrice
                              : 0}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    {payment && (
                      <>
                        <div>
                          <Label className="text-xs text-slate-600">Payment ID</Label>
                          <code className="block text-xs bg-slate-100 px-2 py-1 rounded mt-1 truncate">
                            {payment.razorpay_payment_id}
                          </code>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600">Order ID</Label>
                          <code className="block text-xs bg-slate-100 px-2 py-1 rounded mt-1 truncate">
                            {payment.razorpay_order_id}
                          </code>
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600">Payment Created At</Label>
                          <code className="block text-xs bg-slate-100 px-2 py-1 rounded mt-1 truncate">
                            {formatDate(payment.createdAt)}
                          </code>
                        </div>
                      </>
                    )}

                    
                  </div>

                  

                  

                  
                </CardContent>
              </Card>

              {/* Payout Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    Payout Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label className="text-xs text-slate-600">Payout Status</Label>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {dispute.payout?.status || 'N/A'}
                    </Badge>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <Label className="text-xs text-green-700">Counselor Payout</Label>
                      <p className="text-2xl font-bold text-green-700 mt-1">
                        ₹{dispute.payout?.amountToPayToCounselor || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Label className="text-xs text-blue-700">Client Refund</Label>
                      <p className="text-2xl font-bold text-blue-700 mt-1">
                        ₹{dispute.payout?.amountToRefundToClient || 0}
                      </p>
                    </div>
                  </div>

                  {(dispute.payout?.releasedAt || dispute.payout?.refundedAt) && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs">
                      {dispute.payout.releasedAt && (
                        <p className="text-slate-600">
                          Payout released on: {formatDate(dispute.payout.releasedAt)}
                        </p>
                      )}
                      {dispute.payout.refundedAt && (
                        <p className="text-slate-600">
                          Refund processed on: {formatDate(dispute.payout.refundedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dispute Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    Dispute Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-600">Issue Type</Label>
                      <p className="mt-1 font-medium text-slate-900">
                        {getIssueTypeLabel(dispute.dispute?.issueType)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-slate-600">Disputed At</Label>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-700">
                        <Calendar className="w-4 h-4" />
                        {formatDate(dispute.dispute?.disputedAt)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-600">Follow-up Call</Label>
                      <Badge
                        variant={dispute.dispute?.needFollowUpCall ? 'default' : 'secondary'}
                        className="mt-1"
                      >
                        {dispute.dispute?.needFollowUpCall ? 'Requested' : 'Not Requested'}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-slate-600">Client's Description of Issue</Label>
                    <div className="mt-2 p-4 bg-slate-50 rounded-lg border max-h-32 overflow-y-auto">
                      <p className="text-slate-800 whitespace-pre-wrap">
                        {dispute.dispute?.description}
                      </p>
                    </div>
                  </div>

                  {/* Evidence Files - Enhanced */}
                  {dispute.dispute?.evidence && dispute.dispute.evidence.length > 0 && (
                    <div id="evidence-section">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-slate-600 text-base font-semibold">
                          📎 Evidence Files ({dispute.dispute.evidence.length})
                        </Label>
                        <Badge variant="secondary" className="text-xs">
                          Click to preview
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {dispute.dispute.evidence.map((file, index) => (
                          <div
                            key={index}
                            className="group flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => {
                              setSelectedFileIndex(index);
                              setShowFileViewer(true);
                            }}
                          >
                            <div className="text-3xl">{getFileIcon(file.fileType)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                {file.fileName}
                              </p>
                              <p className="text-xs text-slate-500">
                                {(file.fileSize / 1024).toFixed(2)} KB
                              </p>
                              <Badge variant="outline" className="text-xs mt-1">
                                {file.fileType.split('/')[0]}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFileIndex(index);
                                setShowFileViewer(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Alert className="mt-3">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Click on any file card to preview. Supported: Images, Videos, Audio, PDFs.
                          DOCX files will prompt download.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Activity Timeline */}
              {dispute.dispute?.activityLogs && dispute.dispute.activityLogs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      Activity Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {dispute.dispute.activityLogs.map((log, index) => (
                        <div key={index} className="flex gap-3 pb-3 border-b last:border-0">
                          <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="capitalize">
                                {log.role}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {formatDate(log.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-slate-900 mt-1 capitalize">
                              {log.action.replace('_', ' ')}
                            </p>
                            {log.comment && (
                              <p className="text-sm text-slate-600 mt-1">{log.comment}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Admin Actions */}
              {dispute.dispute?.status === 'under_review' && (
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      Admin Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Add Note Section */}
                    <div>
                      <Label htmlFor="admin-note">Add Internal Note</Label>
                      <div className="flex gap-2 mt-2">
                        <Textarea
                          id="admin-note"
                          placeholder="Add a note for internal tracking..."
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={2}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleAddNote}
                          disabled={addingNote || !note.trim()}
                          variant="outline"
                        >
                          {addingNote ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <MessageSquare className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Resolution Form */}
                    {!showResolutionForm ? (
                      <Button
                        onClick={() => setShowResolutionForm(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Resolve Dispute
                      </Button>
                    ) : (
                      <div className="space-y-4 p-4 bg-white rounded-lg border">
                        <div>
                          <Label htmlFor="status">Resolution Status *</Label>
                          <Select
                            value={resolutionData.status}
                            onValueChange={(value) =>
                              setResolutionData({ ...resolutionData, status: value })
                            }
                          >
                            <SelectTrigger id="status" className="mt-1">
                              <SelectValue placeholder="Select resolution status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="resolved_valid">
                                Resolved - Valid (Refund Client)
                              </SelectItem>
                              <SelectItem value="resolved_invalid">
                                Resolved - Invalid (Release Payout)
                              </SelectItem>
                              <SelectItem value="closed">Close Without Action</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {resolutionData.status === 'resolved_valid' && (
                          <div>
                            <Label htmlFor="refundAmount">Refund Amount (₹)</Label>
                            <Input
                              id="refundAmount"
                              type="number"
                              placeholder="Enter refund amount"
                              value={resolutionData.refundAmount}
                              onChange={(e) =>
                                setResolutionData({
                                  ...resolutionData,
                                  refundAmount: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="mt-1"
                            />
                          </div>
                        )}

                        {resolutionData.status === 'resolved_invalid' && (
                          <div>
                            <Label htmlFor="payoutAmount">Payout Amount (₹)</Label>
                            <Input
                              id="payoutAmount"
                              type="number"
                              placeholder="Enter payout amount"
                              value={resolutionData.payoutAmount}
                              onChange={(e) =>
                                setResolutionData({
                                  ...resolutionData,
                                  payoutAmount: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="mt-1"
                            />
                          </div>
                        )}

                        <div>
                          <Label htmlFor="resolution">Resolution Comment *</Label>
                          <Textarea
                            id="resolution"
                            placeholder="Explain the resolution decision..."
                            value={resolutionData.resolution}
                            onChange={(e) =>
                              setResolutionData({ ...resolutionData, resolution: e.target.value })
                            }
                            rows={4}
                            className="mt-1"
                          />
                        </div>

                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Important</AlertTitle>
                          <AlertDescription>
                            This action cannot be undone. Make sure all details are correct before
                            proceeding.
                          </AlertDescription>
                        </Alert>

                        <div className="flex gap-2">
                          <Button
                            onClick={handleUpdateStatus}
                            disabled={updating}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {updating ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Submit Resolution
                          </Button>
                          <Button
                            onClick={() => setShowResolutionForm(false)}
                            variant="outline"
                            disabled={updating}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Resolution Display (if already resolved) */}
              {dispute.dispute?.resolution && dispute.dispute.status !== 'under_review' && (
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Final Resolution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-white rounded-lg border">
                      <p className="text-slate-800 whitespace-pre-wrap">
                        {dispute.dispute.resolution}
                      </p>
                      {dispute.dispute.resolvedAt && (
                        <p className="text-sm text-slate-500 mt-2">
                          Resolved on: {formatDate(dispute.dispute.resolvedAt)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Footer - Fixed at bottom */}
        <DialogFooter className="border-t px-6 py-4 bg-white flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* File Viewer Modal */}
      {showFileViewer && dispute.dispute?.evidence && (
        <EvidenceFileViewer
          files={dispute.dispute.evidence}
          initialIndex={selectedFileIndex}
          isOpen={showFileViewer}
          onClose={() => setShowFileViewer(false)}
        />
      )}
    </Dialog>
  );
};

export default DisputeDetailModal;
