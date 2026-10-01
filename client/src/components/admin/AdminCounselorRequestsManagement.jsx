import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  FileQuestion,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  CheckSquare,
  Square,
  Eye,
  Award,
  Briefcase,
  User,
  Mail,
  Phone,
  ArrowRight,
  MessageSquare,
  Sparkles,
  RotateCcw,
  Calendar,
  Layers,
  AlertTriangle,
  Loader2,
  Send,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Check,
  X,
  Info,
  AlertCircle,
  GraduationCap,
  FileCheck,
  FileUp,
  ExternalLink,
  FileText,
  Building,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

const TIMEZONE = 'Asia/Kolkata';

const AdminCounselorRequestsManagement = () => {
  const {
    getAllCounselorRequests,
    toggleCounselorRequestCheck,
    reviewCounselorRequest,
  } = useAdminAuth();

  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    unchecked: 0,
    checked: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRequests: 0,
    limit: 20,
  });

  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedChecked, setSelectedChecked] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Selected Request for Modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [adminResponseText, setAdminResponseText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch on filters change
  useEffect(() => {
    fetchRequests(1);
  }, [selectedStatus, selectedChecked, selectedType, debouncedSearch]);

  const fetchRequests = async (page = 1) => {
    setLoading(true);
    const statusParam = selectedStatus === 'all' ? '' : selectedStatus;
    const checkedParam = selectedChecked === 'all' ? '' : selectedChecked;
    const typeParam = selectedType === 'all' ? '' : selectedType;

    const result = await getAllCounselorRequests(
      page,
      20,
      debouncedSearch,
      statusParam,
      checkedParam,
      typeParam
    );

    if (result.success) {
      setRequests(result.data.requests || []);
      setStats(
        result.data.stats || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          unchecked: 0,
          checked: 0,
        }
      );
      setPagination(
        result.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalRequests: 0,
          limit: 20,
        }
      );
    } else {
      toast.error(result.error || 'Failed to load counselor requests');
    }
    setLoading(false);
  };

  const handleToggleCheck = async (e, request) => {
    if (e) e.stopPropagation();
    setTogglingId(request._id);
    const nextState = !request.isChecked;

    const result = await toggleCounselorRequestCheck(request._id, nextState);
    if (result.success) {
      toast.success(
        nextState
          ? 'Request marked as Checked'
          : 'Request marked as Unchecked'
      );
      setRequests((prev) =>
        prev.map((r) => (r._id === request._id ? { ...r, isChecked: nextState } : r))
      );
      if (selectedRequest && selectedRequest._id === request._id) {
        setSelectedRequest((prev) => ({ ...prev, isChecked: nextState }));
      }
      // Update local stats counter
      setStats((prev) => ({
        ...prev,
        checked: nextState ? prev.checked + 1 : Math.max(0, prev.checked - 1),
        unchecked: nextState ? Math.max(0, prev.unchecked - 1) : prev.unchecked + 1,
      }));
    } else {
      toast.error(result.error || 'Failed to update check status');
    }
    setTogglingId(null);
  };

  const handleOpenReview = (request) => {
    setSelectedRequest(request);
    setAdminResponseText(request.adminResponse || '');
    setIsDetailModalOpen(true);
  };

  const handleReviewAction = async (status) => {
    if (!selectedRequest) return;
    setIsSubmittingReview(true);

    const result = await reviewCounselorRequest(
      selectedRequest._id,
      status,
      adminResponseText
    );

    if (result.success) {
      toast.success(
        status === 'approved'
          ? 'Request Approved! Counselor profile has been updated.'
          : 'Request Rejected.'
      );
      setIsDetailModalOpen(false);
      fetchRequests(pagination.currentPage);
    } else {
      toast.error(result.error || `Failed to ${status} request`);
    }
    setIsSubmittingReview(false);
  };

  const getComputedLevel = (years) => {
    const num = Number(years) || 0;
    if (num < 2) return 'Beginner';
    if (num < 5) return 'Intermediate';
    if (num < 10) return 'Experienced';
    return 'Specialist';
  };

  const getRequestTypeMeta = (type) => {
    switch (type) {
      case 'education':
        return {
          label: 'Education Details',
          icon: GraduationCap,
          badgeColor: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300',
        };
      case 'documents':
        return {
          label: 'Documents & Certificates',
          icon: FileCheck,
          badgeColor: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300',
        };
      case 'specialization_and_experience':
      default:
        return {
          label: 'Specialization & Experience',
          icon: Briefcase,
          badgeColor: 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300',
        };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 gap-1.5 py-1 px-2.5">
            <Clock className="h-3.5 w-3.5" />
            Pending Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 gap-1.5 py-1 px-2.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 gap-1.5 py-1 px-2.5">
            <XCircle className="h-3.5 w-3.5" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (utcDate) => {
    if (!utcDate) return 'N/A';
    return dayjs.utc(utcDate).tz(TIMEZONE).format('DD MMM YYYY, hh:mm A');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-neutral-950 p-3 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <FileQuestion className="w-5 h-5" />
            </div>
            Counselor Requests
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review and triage counselor requests for Specialization, Education details, and Document verification
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchRequests(pagination.currentPage)}
          disabled={loading}
          className="gap-2 self-start sm:self-auto bg-white dark:bg-neutral-900 shadow-sm"
        >
          <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total */}
        <Card className="bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Requests</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="bg-white dark:bg-neutral-900 border-amber-200/80 dark:border-amber-900/40 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Pending</p>
              <p className="text-xl font-bold text-amber-900 dark:text-amber-200">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>

        {/* Approved */}
        <Card className="bg-white dark:bg-neutral-900 border-emerald-200/80 dark:border-emerald-900/40 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Approved</p>
              <p className="text-xl font-bold text-emerald-900 dark:text-emerald-200">{stats.approved}</p>
            </div>
          </CardContent>
        </Card>

        {/* Rejected */}
        <Card className="bg-white dark:bg-neutral-900 border-rose-200/80 dark:border-rose-900/40 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-rose-700 dark:text-rose-400">Rejected</p>
              <p className="text-xl font-bold text-rose-900 dark:text-rose-200">{stats.rejected}</p>
            </div>
          </CardContent>
        </Card>

        {/* Unchecked (Requires Attention) */}
        <Card className="bg-white dark:bg-neutral-900 border-purple-200/80 dark:border-purple-900/40 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <Square className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-purple-700 dark:text-purple-400">Unchecked</p>
              <p className="text-xl font-bold text-purple-900 dark:text-purple-200">{stats.unchecked}</p>
            </div>
          </CardContent>
        </Card>

        {/* Checked */}
        <Card className="bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Checked</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{stats.checked}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search counselor, university, degree, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 text-sm h-10"
              />
            </div>

            {/* Request Type Filter */}
            <div className="sm:col-span-3">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-10 bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 text-sm">
                  <SelectValue placeholder="Request Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Request Types</SelectItem>
                  <SelectItem value="specialization_and_experience">Specialization & Exp</SelectItem>
                  <SelectItem value="education">Education Details</SelectItem>
                  <SelectItem value="documents">Documents & Verification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-10 bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending Only</SelectItem>
                  <SelectItem value="approved">Approved Only</SelectItem>
                  <SelectItem value="rejected">Rejected Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Checked / Unchecked Filter */}
            <div className="sm:col-span-2">
              <Select value={selectedChecked} onValueChange={setSelectedChecked}>
                <SelectTrigger className="h-10 bg-slate-50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 text-sm">
                  <SelectValue placeholder="Triage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="false">Unchecked (Left)</SelectItem>
                  <SelectItem value="true">Checked (Done)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Windows / Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading counselor requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <Card className="bg-white dark:bg-neutral-900 border-dashed border-2 border-slate-200 dark:border-neutral-800">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-400">
              <FileQuestion className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                No Counselor Requests Found
              </p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                {selectedStatus !== 'all' || selectedChecked !== 'all' || debouncedSearch
                  ? 'No change requests matched your applied filter criteria.'
                  : 'There are currently no profile specialization or experience change requests.'}
              </p>
            </div>
            {(selectedStatus !== 'all' || selectedChecked !== 'all' || debouncedSearch) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStatus('all');
                  setSelectedChecked('all');
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {requests.map((request) => {
            const counselor = request.counselor || {};
            const isUnchecked = !request.isChecked;
            const typeMeta = getRequestTypeMeta(request.requestType);
            const TypeIcon = typeMeta.icon;

            return (
              <div
                key={request._id}
                className={`relative rounded-2xl bg-white dark:bg-neutral-900 border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  request.status === 'approved'
                    ? 'border-emerald-200/90 dark:border-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-700'
                    : request.status === 'rejected'
                    ? 'border-rose-200/90 dark:border-rose-900/50 hover:border-rose-300 dark:hover:border-rose-700'
                    : 'border-amber-200/90 dark:border-amber-900/50 hover:border-amber-300 dark:hover:border-amber-700'
                }`}
              >
                <div className="p-5 space-y-4 flex-1">
                  {/* Card Header: Counselor + Triage Check Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-11 w-11 border border-slate-200 dark:border-neutral-700 shrink-0">
                        <AvatarImage src={counselor.profilePicture} alt={counselor.fullName} />
                        <AvatarFallback className="bg-primary-100 text-primary-700 font-bold">
                          {counselor.fullName?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {counselor.fullName || 'Unknown Counselor'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {counselor.email || counselor.username}
                        </p>
                      </div>
                    </div>

                    {/* Check / Uncheck Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleCheck(e, request)}
                      disabled={togglingId === request._id}
                      title={request.isChecked ? 'Mark as Unchecked' : 'Mark as Checked'}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
                        request.isChecked
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-neutral-800 dark:text-slate-300'
                          : 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-950/60 dark:text-purple-300 font-bold'
                      }`}
                    >
                      {togglingId === request._id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : request.isChecked ? (
                        <>
                          <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Checked</span>
                        </>
                      ) : (
                        <>
                          <Square className="h-3.5 w-3.5 text-purple-600" />
                          <span>Unchecked</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Request Type Badge & Status */}
                  <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-1.5">
                    <Badge variant="outline" className={`text-[11px] gap-1 font-medium ${typeMeta.badgeColor}`}>
                      <TypeIcon className="h-3 w-3" />
                      {typeMeta.label}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Submitted {dayjs(request.createdAt).fromNow()}</span>
                  </div>

                  {/* Dynamic Request Type Summary */}
                  {request.requestType === 'education' ? (
                    <div className="space-y-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                        <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                          Requested Graduation:
                        </span>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {request.requestedEducation?.graduation?.degree || 'Degree not specified'}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                          {request.requestedEducation?.graduation?.university} ({request.requestedEducation?.graduation?.year || 'N/A'})
                        </p>
                      </div>

                      {request.requestedEducation?.postGraduation?.university && (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-100 dark:border-neutral-800">
                          <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                            Post Graduation:
                          </span>
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {request.requestedEducation?.postGraduation?.degree} - {request.requestedEducation?.postGraduation?.university} ({request.requestedEducation?.postGraduation?.year || 'N/A'})
                          </p>
                        </div>
                      )}
                    </div>
                  ) : request.requestType === 'documents' ? (
                    <div className="space-y-2.5 text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                        Included Documents:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { key: 'resume', label: 'Resume', hasFile: !!request.requestedDocuments?.resume },
                          { key: 'degreeCertificate', label: 'Degree Cert', hasFile: !!request.requestedDocuments?.degreeCertificate },
                          { key: 'licenseCertificate', label: 'License Cert', hasFile: !!request.requestedDocuments?.licenseCertificate },
                          { key: 'governmentId', label: 'Govt ID', hasFile: !!request.requestedDocuments?.governmentId },
                        ].map((d) => (
                          <div
                            key={d.key}
                            className={`p-2 rounded-lg border text-[11px] flex items-center justify-between gap-1 ${
                              d.hasFile
                                ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50 text-indigo-800 dark:text-indigo-300 font-medium'
                                : 'bg-slate-50 dark:bg-neutral-800/30 border-slate-100 dark:border-neutral-800 text-slate-400'
                            }`}
                          >
                            <span className="truncate">{d.label}</span>
                            {d.hasFile ? (
                              <Check className="h-3 w-3 text-indigo-600 shrink-0" />
                            ) : (
                              <span className="text-[9px] text-slate-400">-</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs">
                      {/* Specialization */}
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                          Requested Specializations:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {request.requestedSpecialization?.map((spec) => (
                            <Badge
                              key={spec}
                              variant="secondary"
                              className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 text-[11px] font-medium"
                            >
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Experience Change */}
                      <div className="bg-slate-50 dark:bg-neutral-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-slate-500 block">Current Exp</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {request.currentExperienceYears ?? counselor.experienceYears ?? 0} yrs
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <div className="text-right">
                          <span className="text-[11px] text-blue-600 dark:text-blue-400 block font-semibold">
                            Requested Exp
                          </span>
                          <span className="font-bold text-blue-700 dark:text-blue-300 text-sm">
                            {request.requestedExperienceYears} yrs
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message Preview */}
                  {request.message && (
                    <div className="bg-slate-50/70 dark:bg-neutral-800/30 p-2.5 rounded-xl border border-slate-100 dark:border-neutral-800 text-xs">
                      <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                        Counselor's Reason:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 line-clamp-2 text-xs italic">
                        "{request.message}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer: View and Review Button */}
                <div className="p-4 pt-2 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => handleOpenReview(request)}
                    className="w-full gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 shadow-sm"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View & Review Request</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail & Review Action Dialog */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[92vh] p-0 overflow-hidden flex flex-col rounded-2xl shadow-2xl border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          {/* Header Banner with proper close button spacing */}
          <div className="p-5 sm:p-6 pr-14 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-800/50 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                    Counselor Request Review
                  </DialogTitle>
                  {selectedRequest && (
                    <Badge variant="outline" className={`text-xs gap-1 font-semibold ${getRequestTypeMeta(selectedRequest.requestType).badgeColor}`}>
                      {getRequestTypeMeta(selectedRequest.requestType).label}
                    </Badge>
                  )}
                  {selectedRequest && getStatusBadge(selectedRequest.status)}
                </div>
                <DialogDescription className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <span>Submitted on {selectedRequest && formatDate(selectedRequest.createdAt)}</span>
                </DialogDescription>
              </div>

              {selectedRequest && (
                <button
                  type="button"
                  onClick={(e) => handleToggleCheck(e, selectedRequest)}
                  className={`self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    selectedRequest.isChecked
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
                  }`}
                >
                  {selectedRequest.isChecked ? (
                    <>
                      <CheckSquare className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Checked</span>
                    </>
                  ) : (
                    <>
                      <Square className="h-3.5 w-3.5 text-purple-600" />
                      <span>Unchecked</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Content Body */}
          {selectedRequest && (
            <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1 bg-slate-50/40 dark:bg-neutral-950/40">
              {/* Counselor Snapshot Card */}
              <div className="rounded-xl p-4 bg-white dark:bg-neutral-800/80 border border-slate-200/80 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <Avatar className="h-12 w-12 border-2 border-white dark:border-neutral-700 shadow-sm">
                    <AvatarImage
                      src={selectedRequest.counselor?.profilePicture}
                      alt={selectedRequest.counselor?.fullName}
                    />
                    <AvatarFallback className="bg-primary-100 text-primary-700 font-bold text-base">
                      {selectedRequest.counselor?.fullName?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                        {selectedRequest.counselor?.fullName}
                      </h4>
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                        @{selectedRequest.counselor?.username || 'counselor'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                      <a
                        href={`mailto:${selectedRequest.counselor?.email}`}
                        className="hover:text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Mail className="h-3 w-3" />
                        {selectedRequest.counselor?.email}
                      </a>
                      {selectedRequest.counselor?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {selectedRequest.counselor?.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 text-[11px]">
                    <ShieldCheck className="h-3 w-3 mr-1 text-blue-600" />
                    Verified Counselor
                  </Badge>
                </div>
              </div>

              {/* Side-by-Side Comparison: Current vs Requested based on requestType */}
              {selectedRequest.requestType === 'education' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Education */}
                  <div className="rounded-xl p-4 bg-white dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-neutral-700">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-slate-500" />
                        Current Education On Record
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 block">Graduation:</span>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {selectedRequest.currentEducation?.graduation?.degree ||
                            selectedRequest.counselor?.application?.education?.graduation?.degree ||
                            'Not specified'}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 text-xs">
                          {selectedRequest.currentEducation?.graduation?.university ||
                            selectedRequest.counselor?.application?.education?.graduation?.university ||
                            'University not specified'}{' '}
                          (
                          {selectedRequest.currentEducation?.graduation?.year ||
                            selectedRequest.counselor?.application?.education?.graduation?.year ||
                            'N/A'}
                          )
                        </p>
                      </div>

                      <Separator className="bg-slate-100 dark:bg-neutral-700" />

                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 block">Post Graduation:</span>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {selectedRequest.currentEducation?.postGraduation?.degree ||
                            selectedRequest.counselor?.application?.education?.postGraduation?.degree ||
                            'None on record'}
                        </p>
                        {(selectedRequest.currentEducation?.postGraduation?.university ||
                          selectedRequest.counselor?.application?.education?.postGraduation?.university) && (
                          <p className="text-slate-600 dark:text-slate-400 text-xs">
                            {selectedRequest.currentEducation?.postGraduation?.university ||
                              selectedRequest.counselor?.application?.education?.postGraduation?.university}{' '}
                            (
                            {selectedRequest.currentEducation?.postGraduation?.year ||
                              selectedRequest.counselor?.application?.education?.postGraduation?.year ||
                              'N/A'}
                            )
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Proposed Education */}
                  <div className="rounded-xl p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                        Proposed Education Updates
                      </span>
                      <Badge className="bg-emerald-600 text-white text-[10px]">
                        New Credentials
                      </Badge>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-[11px] font-semibold text-emerald-700/80 dark:text-emerald-300/80 block">
                          Graduation Degree:
                        </span>
                        <p className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">
                          {selectedRequest.requestedEducation?.graduation?.degree}
                        </p>
                        <p className="text-emerald-800 dark:text-emerald-200 text-xs font-medium">
                          {selectedRequest.requestedEducation?.graduation?.university} (
                          {selectedRequest.requestedEducation?.graduation?.year})
                        </p>
                      </div>

                      <Separator className="bg-emerald-200/60 dark:bg-emerald-800/40" />

                      <div>
                        <span className="text-[11px] font-semibold text-emerald-700/80 dark:text-emerald-300/80 block">
                          Post Graduation:
                        </span>
                        {selectedRequest.requestedEducation?.postGraduation?.university ||
                        selectedRequest.requestedEducation?.postGraduation?.degree ? (
                          <>
                            <p className="font-bold text-emerald-900 dark:text-emerald-100">
                              {selectedRequest.requestedEducation?.postGraduation?.degree || 'Degree specified'}
                            </p>
                            <p className="text-emerald-800 dark:text-emerald-200 text-xs font-medium">
                              {selectedRequest.requestedEducation?.postGraduation?.university}{' '}
                              {selectedRequest.requestedEducation?.postGraduation?.year &&
                                `(${selectedRequest.requestedEducation?.postGraduation?.year})`}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Not specified</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedRequest.requestType === 'documents' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Documents */}
                  <div className="rounded-xl p-4 bg-white dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-neutral-700">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-slate-500" />
                        Current Documents On Record
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {[
                        {
                          label: 'Resume / CV',
                          url:
                            selectedRequest.currentDocuments?.resume ||
                            selectedRequest.counselor?.application?.documents?.resume,
                        },
                        {
                          label: 'Degree Certificate',
                          url:
                            selectedRequest.currentDocuments?.degreeCertificate ||
                            selectedRequest.counselor?.application?.documents?.degreeCertificate,
                        },
                        {
                          label: 'License Certificate',
                          url:
                            selectedRequest.currentDocuments?.licenseCertificate ||
                            selectedRequest.counselor?.application?.documents?.licenseCertificate,
                        },
                        {
                          label: 'Government ID',
                          url:
                            selectedRequest.currentDocuments?.governmentId ||
                            selectedRequest.counselor?.application?.documents?.governmentId,
                        },
                      ].map((doc) => (
                        <div
                          key={doc.label}
                          className="p-2.5 rounded-lg bg-slate-50 dark:bg-neutral-750 border border-slate-100 dark:border-neutral-700 flex items-center justify-between gap-2"
                        >
                          <span className="font-medium text-slate-700 dark:text-slate-300">{doc.label}</span>
                          {doc.url ? (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-semibold"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Current
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">None</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Proposed Uploaded Documents */}
                  <div className="rounded-xl p-4 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-indigo-900/40">
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                        Proposed Document Updates
                      </span>
                      <Badge className="bg-indigo-600 text-white text-[10px]">
                        Verify Files
                      </Badge>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {[
                        {
                          label: 'Resume / CV',
                          url: selectedRequest.requestedDocuments?.resume,
                          prevUrl: selectedRequest.currentDocuments?.resume,
                        },
                        {
                          label: 'Degree Certificate',
                          url: selectedRequest.requestedDocuments?.degreeCertificate,
                          prevUrl: selectedRequest.currentDocuments?.degreeCertificate,
                        },
                        {
                          label: 'License Certificate',
                          url: selectedRequest.requestedDocuments?.licenseCertificate,
                          prevUrl: selectedRequest.currentDocuments?.licenseCertificate,
                        },
                        {
                          label: 'Government ID',
                          url: selectedRequest.requestedDocuments?.governmentId,
                          prevUrl: selectedRequest.currentDocuments?.governmentId,
                        },
                      ].map((doc) => {
                        const isUpdated = doc.url && doc.url !== doc.prevUrl;
                        return (
                          <div
                            key={doc.label}
                            className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${
                              isUpdated
                                ? 'bg-indigo-100/70 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-700'
                                : 'bg-white/60 dark:bg-neutral-800/40 border-indigo-100 dark:border-indigo-900/30'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {doc.label}
                              </span>
                              {isUpdated && (
                                <Badge className="bg-emerald-600 text-white text-[9px] px-1 py-0 font-bold">
                                  UPDATED
                                </Badge>
                              )}
                            </div>

                            {doc.url ? (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shrink-0"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Inspect PDF
                              </a>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">No file</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Specialization and Experience Comparison */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Credentials */}
                  <div className="rounded-xl p-4 bg-white dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-neutral-700">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                        Current In Profile
                      </span>
                      <Badge variant="outline" className="text-[10px] text-slate-500">
                        {selectedRequest.currentExperienceLevel || 'Beginner'}
                      </Badge>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Specializations:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedRequest.currentSpecialization?.length > 0 ? (
                          selectedRequest.currentSpecialization.map((spec) => (
                            <Badge key={spec} variant="secondary" className="text-xs py-1 px-2.5 bg-slate-100 dark:bg-neutral-700 text-slate-700 dark:text-slate-300">
                              {spec}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">None specified</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">Total Experience:</span>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {selectedRequest.currentExperienceYears ?? 0} Years
                      </p>
                    </div>
                  </div>

                  {/* Requested Updates */}
                  <div className="rounded-xl p-4 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-blue-100 dark:border-blue-900/40">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                        Proposed Updates
                      </span>
                      <Badge className="bg-blue-600 text-white text-[10px]">
                        Tier: {getComputedLevel(selectedRequest.requestedExperienceYears)}
                      </Badge>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-blue-700/80 dark:text-blue-300/80 block mb-1.5">
                        Proposed Specializations:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedRequest.requestedSpecialization?.map((spec) => {
                          const isNew = !selectedRequest.currentSpecialization?.includes(spec);
                          return (
                            <Badge
                              key={spec}
                              className={`text-xs py-1 px-2.5 font-medium transition-all ${
                                isNew
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm ring-1 ring-emerald-400/30'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {spec}
                              {isNew && (
                                <span className="ml-1 text-[9px] bg-white/20 text-white px-1 py-0.2 rounded font-bold">
                                  + NEW
                                </span>
                              )}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-blue-700/80 dark:text-blue-300/80 block mb-1">
                        Proposed Experience:
                      </span>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                          {selectedRequest.requestedExperienceYears} Years
                        </p>
                        {selectedRequest.requestedExperienceYears !== selectedRequest.currentExperienceYears && (
                          <Badge variant="outline" className="text-[10px] text-blue-700 border-blue-300 bg-blue-100/50">
                            {selectedRequest.requestedExperienceYears > (selectedRequest.currentExperienceYears || 0)
                              ? `+${selectedRequest.requestedExperienceYears - (selectedRequest.currentExperienceYears || 0)} yrs increase`
                              : `${selectedRequest.requestedExperienceYears - (selectedRequest.currentExperienceYears || 0)} yrs change`}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Counselor Message Card */}
              <div className="rounded-xl p-4 bg-white dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 space-y-2 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span>Counselor's Request Rationale:</span>
                </div>
                <div className="pl-3 border-l-2 border-blue-400 dark:border-blue-600">
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed italic">
                    "{selectedRequest.message || 'No additional note provided.'}"
                  </p>
                </div>
              </div>

              {/* Review History / Decision Record (If already finalized) */}
              {selectedRequest.status !== 'pending' && (
                <div
                  className={`rounded-xl p-4 border space-y-2 ${
                    selectedRequest.status === 'approved'
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold flex-wrap gap-1">
                    <span className={selectedRequest.status === 'approved' ? 'text-emerald-800 dark:text-emerald-300 font-bold' : 'text-rose-800 dark:text-rose-300 font-bold'}>
                      Decision: {selectedRequest.status.toUpperCase()}
                    </span>
                    <span className="text-slate-500 font-normal">
                      Reviewed by {selectedRequest.reviewedBy?.fullName || 'Admin'} on {formatDate(selectedRequest.reviewedAt)}
                    </span>
                  </div>
                  {selectedRequest.adminResponse ? (
                    <div className="pt-1">
                      <span className="text-[11px] text-slate-500 block">Admin Feedback Remarks:</span>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                        "{selectedRequest.adminResponse}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No feedback remarks entered by admin.</p>
                  )}
                </div>
              )}

              {/* Admin Feedback Input (Visible when pending) */}
              {selectedRequest.status === 'pending' && (
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Admin Feedback / Response Note (Optional)</span>
                    <span className="text-[11px] text-slate-400">Included in notification to counselor</span>
                  </label>
                  <Textarea
                    value={adminResponseText}
                    onChange={(e) => setAdminResponseText(e.target.value)}
                    placeholder="Enter remarks or justification for approval/rejection..."
                    rows={3}
                    maxLength={1000}
                    className="text-xs sm:text-sm bg-white dark:bg-neutral-800 border-slate-300 dark:border-neutral-700 resize-none leading-relaxed"
                  />
                </div>
              )}
            </div>
          )}

          {/* Sticky Footer */}
          <DialogFooter className="p-4 sm:p-5 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/90 dark:bg-neutral-900/90 backdrop-blur shrink-0 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDetailModalOpen(false)}
              className="w-full sm:w-auto text-xs h-9 px-4"
            >
              Close
            </Button>

            {selectedRequest?.status === 'pending' ? (
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isSubmittingReview}
                  onClick={() => handleReviewAction('rejected')}
                  className="flex-1 sm:flex-initial gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs h-9 px-4"
                >
                  {isSubmittingReview ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  <span>Reject Request</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={isSubmittingReview}
                  onClick={() => handleReviewAction('approved')}
                  className="flex-1 sm:flex-initial gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-9 px-4 shadow-sm"
                >
                  {isSubmittingReview ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  <span>Approve & Update Profile</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs text-slate-500 py-1 px-2.5">
                  Decision finalized
                </Badge>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCounselorRequestsManagement;
