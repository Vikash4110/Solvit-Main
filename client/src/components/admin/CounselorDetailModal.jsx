// components/admin/CounselorDetailModal.jsx - Complete Production-Grade Component

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Loader2,
  UserX,
  UserCheck,
  Activity,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  CreditCard,
  Languages,
  Shield,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Share2,
  Copy,
  Check,
  Building2,
  ExternalLink,
  ShieldCheck,
  Hash,
  Sparkles,
} from 'lucide-react';
import ShareProfileModal from '@/components/common/ShareProfileModal.jsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

dayjs.extend(utc);
dayjs.extend(timezone);
const TIMEZONE = 'Asia/Kolkata';

// Helper component for clean, copyable metadata fields
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
        <p className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400 tracking-wide uppercase">
          {label}
        </p>
      )}
      <div
        onClick={handleCopy}
        title="Click to copy"
        className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100/80 hover:bg-slate-200/80 dark:bg-neutral-800/80 dark:hover:bg-neutral-700/80 border border-slate-200/60 dark:border-neutral-700/60 transition-all cursor-pointer select-all"
      >
        <span
          className={`text-xs text-slate-800 dark:text-neutral-200 ${
            mono ? 'font-mono' : 'font-medium'
          } ${truncate ? 'truncate max-w-[180px] sm:max-w-[240px]' : 'break-all'}`}
        >
          {String(value)}
        </span>
        <button
          type="button"
          className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-neutral-200 shrink-0 transition-colors p-0.5"
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
  if (!name) return 'C';
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const CounselorDetailModal = ({ counselorId, isOpen, onClose, onCounselorUpdated }) => {
  const { getCounselorDetails, toggleCounselorBlock } = useAdminAuth();

  const [counselor, setCounselor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blocking, setBlocking] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && counselorId) {
      fetchCounselorDetails();
    }
  }, [counselorId, isOpen]);

  const fetchCounselorDetails = async () => {
    setLoading(true);
    try {
      const result = await getCounselorDetails(counselorId);

      if (result.success) {
        setCounselor(result.data);
      } else {
        toast.error(result.error || 'Failed to fetch counselor details');
        onClose();
      }
    } catch (err) {
      console.error('Error fetching counselor details:', err);
      toast.error('Failed to load counselor details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    if (
      !window.confirm(
        `Are you sure you want to ${counselor.isBlocked ? 'unblock' : 'block'} this counselor?`
      )
    ) {
      return;
    }

    setBlocking(true);
    try {
      const result = await toggleCounselorBlock(counselorId, !counselor.isBlocked);

      if (result.success) {
        toast.success(`Counselor ${counselor.isBlocked ? 'unblocked' : 'blocked'} successfully`);
        fetchCounselorDetails();
        if (onCounselorUpdated) onCounselorUpdated();
      } else {
        toast.error(result.error || 'Failed to update counselor status');
      }
    } catch (err) {
      console.error('Error toggling block:', err);
      toast.error('Failed to update status');
    } finally {
      setBlocking(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).tz(TIMEZONE).format('MMM DD, YYYY • hh:mm A');
  };

  const getExperienceLevelColor = (level) => {
    switch (level) {
      case 'Beginner':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
      case 'Intermediate':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'Experienced':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
      case 'Specialist':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-neutral-800 dark:text-neutral-300';
    }
  };

  const getApplicationStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <Badge
            variant="outline"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
          >
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge
            variant="outline"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
          >
            <XCircle className="w-3.5 h-3.5 shrink-0" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border bg-slate-100 text-slate-600 border-slate-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700"
          >
            Not Submitted
          </Badge>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        size="xl"
        className="w-[96vw] sm:w-[92vw] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl max-h-[94vh] sm:max-h-[90vh] p-0 flex flex-col overflow-hidden bg-slate-50/90 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 shadow-2xl rounded-2xl"
      >
        {/* Modal Header */}
        <DialogHeader className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
                <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-2">
                  Counselor Complete Profile
                </DialogTitle>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                  Registered on{' '}
                  {counselor?.createdAt ? formatDate(counselor.createdAt) : 'N/A'}
                </p>
              </div>
            </div>
            {counselor && (
              <div className="flex items-center gap-2 flex-wrap">
                {getApplicationStatusBadge(counselor.application?.applicationStatus)}
                <Badge
                  variant="outline"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                    counselor.isBlocked
                      ? 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  }`}
                >
                  {counselor.isBlocked ? (
                    <>
                      <UserX className="w-3.5 h-3.5 shrink-0" />
                      <span>Blocked</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Active</span>
                    </>
                  )}
                </Badge>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Modal Scrollable Body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 flex-1 text-slate-500 dark:text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
            <span className="text-sm font-medium">Loading counselor dossier...</span>
          </div>
        ) : counselor ? (
          <div className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-5 space-y-4 sm:space-y-5">
            {/* 1. Hero Overview Profile Card */}
            <Card className="bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent border-purple-500/20 shadow-sm overflow-hidden">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-purple-300 dark:border-purple-800 shadow-md">
                    {counselor.profilePicture && (
                      <AvatarImage
                        src={counselor.profilePicture}
                        alt={counselor.fullName}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-2xl">
                      {getInitials(counselor.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-neutral-100 truncate">
                        {counselor.fullName}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400">
                        @{counselor.username}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs bg-white dark:bg-neutral-900 border-slate-200">
                        {counselor.gender || 'Not specified'}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs font-semibold ${getExperienceLevelColor(
                          counselor.experienceLevel
                        )}`}
                      >
                        <Award className="w-3.5 h-3.5 mr-1" />
                        {counselor.experienceLevel || 'Beginner'}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-white dark:bg-neutral-900 border-slate-200">
                        {counselor.experienceYears || 0} years experience
                      </Badge>
                    </div>

                    <div className="pt-1">
                      <CopyableField
                        label="Counselor Database ID"
                        value={counselor._id}
                        className="max-w-md"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Contact Information & Payout Bank Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Information Card */}
              <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-start">
                <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-neutral-800">
                  <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    Contact & Communication
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-start">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <CopyableField
                      label="Email Address"
                      value={counselor.email}
                    />
                    <CopyableField
                      label="Phone / Mobile"
                      value={counselor.phone}
                    />
                  </div>

                  <div className="mt-2 pt-3 border-t border-slate-100 dark:border-neutral-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      Account Activity
                    </span>
                    <div className="p-2.5 rounded-lg bg-slate-50/70 dark:bg-neutral-950/40 border border-slate-200/60 dark:border-neutral-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-neutral-400">Registered:</span>
                        <span className="font-medium text-slate-800 dark:text-neutral-200">
                          {formatDate(counselor.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-neutral-400">Last Login:</span>
                        <span className="font-medium text-slate-800 dark:text-neutral-200">
                          {counselor.lastLogin ? formatDate(counselor.lastLogin) : 'Never logged in'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Account Details (For Payouts) */}
              <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-start">
                <CardHeader className="py-2.5 px-4 border-b border-slate-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap min-w-0">
                      <Building2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span className="truncate">Direct Payout Bank Details</span>
                    </CardTitle>
                    {counselor.application?.bankDetails?.accountNo && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-5 px-1.5 py-0 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60 border-indigo-200/60 dark:border-indigo-800/60 whitespace-nowrap shrink-0 flex items-center gap-1 shadow-none transition-all"
                        onClick={() => {
                          const bank = counselor.application?.bankDetails || {};
                          const bankText = `Beneficiary Name: ${counselor.fullName || 'N/A'}\nAccount Number: ${bank.accountNo || 'N/A'}\nIFSC Code: ${bank.ifscCode || 'N/A'}\nBranch Name: ${bank.branchName || 'N/A'}`;
                          navigator.clipboard.writeText(bankText);
                          toast.success('Counselor bank details copied to clipboard');
                        }}
                      >
                        <Copy className="h-2.5 w-2.5 shrink-0" />
                        <span>Copy Bank Info</span>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-start">
                  {counselor.application?.bankDetails?.accountNo ? (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <CopyableField
                          label="Bank Account No."
                          value={counselor.application.bankDetails.accountNo}
                        />
                        <CopyableField
                          label="IFSC Code"
                          value={counselor.application.bankDetails.ifscCode}
                        />
                      </div>
                      {counselor.application.bankDetails.branchName && (
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-neutral-800">
                          <span className="text-slate-500 dark:text-neutral-400">Branch Name:</span>
                          <span className="font-medium text-slate-800 dark:text-neutral-200">
                            {counselor.application.bankDetails.branchName}
                          </span>
                        </div>
                      )}
                      <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Verified for automated or manual session payouts</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200/60 dark:border-neutral-800 text-center space-y-1">
                      <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
                        No Bank Details Submitted
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                        This counselor has not yet provided their banking details in their profile.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 3. Professional Specializations & Languages */}
            <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
              <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-neutral-800">
                <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  Specializations & Language Proficiencies
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-2">
                    Core Specializations ({counselor.specialization?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {counselor.specialization?.map((spec, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200"
                      >
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator className="bg-slate-100 dark:border-neutral-800" />

                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-2">
                    Languages Spoken
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {counselor.application?.languages && counselor.application.languages.length > 0 ? (
                      counselor.application.languages.map((lang, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs bg-slate-50 dark:bg-neutral-900"
                        >
                          <Languages className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {lang}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">English, Hindi (Default)</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Educational Qualifications & License Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Education Card */}
              <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-start">
                <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-neutral-800">
                  <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    Educational Qualifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-start">
                  {/* Graduation */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide text-[11px]">
                        Graduation Degree
                      </span>
                      {counselor.application?.education?.graduation?.year && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                          {counselor.application.education.graduation.year}
                        </Badge>
                      )}
                    </div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-neutral-100">
                      {counselor.application?.education?.graduation?.degree || 'Not provided'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                      {counselor.application?.education?.graduation?.university || 'University not provided'}
                    </p>
                  </div>

                  {/* Post Graduation */}
                  <div className="p-3.5 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide text-[11px]">
                        Post Graduation
                      </span>
                      {counselor.application?.education?.postGraduation?.year && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                          {counselor.application.education.postGraduation.year}
                        </Badge>
                      )}
                    </div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-neutral-100">
                      {counselor.application?.education?.postGraduation?.degree || 'Not provided'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                      {counselor.application?.education?.postGraduation?.university || 'University not provided'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* License & Professional Summary */}
              <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-start">
                <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-neutral-800">
                  <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    License & Practice Certification
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3.5 flex-1 flex flex-col justify-start">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <CopyableField
                      label="License / Cert No."
                      value={counselor.application?.license?.licenseNo || 'Not specified'}
                    />
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400 tracking-wide uppercase mb-1">
                        Issuing Authority
                      </p>
                      <div className="px-2.5 py-1.5 rounded-lg bg-slate-100/80 dark:bg-neutral-800/80 border border-slate-200/60 dark:border-neutral-700/60 text-xs font-medium text-slate-800 dark:text-neutral-200">
                        {counselor.application?.license?.issuingAuthority || 'Not specified'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 pt-3 border-t border-slate-100 dark:border-neutral-800 space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400 tracking-wide uppercase">
                      Professional Summary
                    </p>
                    {counselor.application?.professionalSummary ? (
                      <p className="text-xs text-slate-700 dark:text-neutral-300 leading-relaxed bg-slate-50 dark:bg-neutral-950 p-2.5 rounded-lg border border-slate-200/60 dark:border-neutral-800 max-h-28 overflow-y-auto whitespace-pre-wrap">
                        {counselor.application.professionalSummary}
                      </p>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-neutral-950 border border-slate-200/60 dark:border-neutral-800 text-xs text-slate-400 italic">
                        No professional summary provided by counselor.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 5. Uploaded Verification Documents */}
            <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
              <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-neutral-800">
                <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  Uploaded Verification Documents (
                  {Object.values(counselor.application?.documents || {}).filter(Boolean).length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {counselor.application?.documents &&
                Object.values(counselor.application.documents).some(Boolean) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {counselor.application.documents.resume && (
                      <a
                        href={counselor.application.documents.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 hover:border-blue-300 hover:shadow-sm transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0">
                          <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-900 dark:text-neutral-100 truncate">
                            Resume / CV
                          </p>
                          <p className="text-[10px] text-slate-400">View document</p>
                        </div>
                      </a>
                    )}
                    {counselor.application.documents.degreeCertificate && (
                      <a
                        href={counselor.application.documents.degreeCertificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 hover:border-emerald-300 hover:shadow-sm transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0">
                          <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-900 dark:text-neutral-100 truncate">
                            Degree Certificate
                          </p>
                          <p className="text-[10px] text-slate-400">View document</p>
                        </div>
                      </a>
                    )}
                    {counselor.application.documents.licenseCertificate && (
                      <a
                        href={counselor.application.documents.licenseCertificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 hover:border-purple-300 hover:shadow-sm transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 shrink-0">
                          <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-900 dark:text-neutral-100 truncate">
                            License Certificate
                          </p>
                          <p className="text-[10px] text-slate-400">View document</p>
                        </div>
                      </a>
                    )}
                    {counselor.application.documents.governmentId && (
                      <a
                        href={counselor.application.documents.governmentId}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 hover:border-amber-300 hover:shadow-sm transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 shrink-0">
                          <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-900 dark:text-neutral-100 truncate">
                            Government ID
                          </p>
                          <p className="text-[10px] text-slate-400">View document</p>
                        </div>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-neutral-900 border border-slate-200/60 dark:border-neutral-800 text-center text-xs text-slate-500 dark:text-neutral-400">
                    No verification documents uploaded yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Modal Footer */}
        <DialogFooter className="px-6 py-3 border-t border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-shrink-0 flex items-center justify-between sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 text-slate-600 dark:text-neutral-300"
              onClick={() => {
                if (counselor) {
                  navigator.clipboard.writeText(JSON.stringify(counselor, null, 2));
                  toast.success('Counselor profile JSON copied to clipboard');
                }
              }}
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copy JSON
            </Button>
            {counselor && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-400"
                onClick={() => setIsShareModalOpen(true)}
              >
                <Share2 className="h-3.5 w-3.5 mr-1.5" />
                Share Profile
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {counselor && (
              <Button
                variant={counselor.isBlocked ? 'default' : 'destructive'}
                size="sm"
                className="text-xs h-8"
                onClick={handleToggleBlock}
                disabled={blocking}
              >
                {blocking ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : counselor.isBlocked ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                    Unblock Counselor
                  </>
                ) : (
                  <>
                    <UserX className="w-3.5 h-3.5 mr-1.5" />
                    Block Counselor
                  </>
                )}
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              className="text-xs h-8 px-5 font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Share Profile Modal */}
      {counselor && (
        <ShareProfileModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          counselor={counselor}
        />
      )}
    </Dialog>
  );
};

export default CounselorDetailModal;
