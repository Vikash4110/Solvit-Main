// components/admin/AdminDisputeManagement.jsx - Modern, Responsive Dispute Management

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import {
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Phone,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  Briefcase,
  Paperclip,
  Shield,
  X,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import DisputeDetailModal from './DisputeDetailModal';

dayjs.extend(utc);
dayjs.extend(timezone);
const TIME_ZONE = 'Asia/Kolkata';

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

const AdminDisputeManagement = () => {
  const { getAllDisputes } = useAdminAuth();

  const [disputes, setDisputes] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    underReview: 0,
    resolvedValid: 0,
    resolvedInvalid: 0,
    closed: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDisputes: 0,
    limit: 20,
  });

  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchDisputes();
  }, [selectedStatus, currentPage]);

  const fetchDisputes = async () => {
    setLoading(true);
    const result = await getAllDisputes(selectedStatus, currentPage, 20, searchTerm);

    if (result.success) {
      setDisputes(result.data || []);
      setStats(
        result.stats || {
          total: 0,
          underReview: 0,
          resolvedValid: 0,
          resolvedInvalid: 0,
          closed: 0,
        }
      );
      setPagination(
        result.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalDisputes: 0,
          limit: 20,
        }
      );
    } else {
      toast.error(result.error || 'Failed to fetch disputes');
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchDisputes();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    setLoading(true);
    getAllDisputes(selectedStatus, 1, 20, '').then((result) => {
      if (result.success) {
        setDisputes(result.data || []);
        setStats(result.stats || { total: 0, underReview: 0, resolvedValid: 0, resolvedInvalid: 0, closed: 0 });
        setPagination(result.pagination || { currentPage: 1, totalPages: 1, totalDisputes: 0, limit: 20 });
      }
      setLoading(false);
    });
  };

  const handleViewDetails = (dispute) => {
    setSelectedDispute(dispute);
    setShowDetailModal(true);
  };

  const handleDisputeUpdated = () => {
    setShowDetailModal(false);
    fetchDisputes();
  };

  const handleCopyText = (text, type, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(`${type}-${id}`);
    toast.success(`${type} copied to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
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
      internet_disconnection: 'Internet issue',
      other: 'Other',
    };
    return labels[issueType] || issueType || 'Unspecified';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).tz(TIME_ZONE).format('MMM DD, YYYY');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return dayjs(dateString).tz(TIME_ZONE).format('hh:mm A');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-neutral-100">
              Dispute Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400">
              Review, arbitrate, and resolve client disputes and session grievances
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDisputes}
            disabled={loading}
            className="h-9 px-3.5 text-xs font-medium border-slate-200 dark:border-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 5 High-Impact Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Disputes */}
        <Card className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20 shadow-sm col-span-2 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-amber-900 dark:text-amber-300">
              Total Disputes
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-amber-950 dark:text-amber-100 tracking-tight">
              {stats.total?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
              All reported cases
            </p>
          </CardContent>
        </Card>

        {/* Under Review */}
        <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Under Review
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
              {stats.underReview?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium mt-0.5">
              Pending arbitration
            </p>
          </CardContent>
        </Card>

        {/* Valid (Refunded) */}
        <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Valid (Refunded)
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {stats.resolvedValid?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
              Approved client refunds
            </p>
          </CardContent>
        </Card>

        {/* Invalid */}
        <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-rose-700 dark:text-rose-400">
              Invalid
            </CardTitle>
            <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-400 tracking-tight">
              {stats.resolvedInvalid?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
              Released counselor payout
            </p>
          </CardContent>
        </Card>

        {/* Closed */}
        <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
              Closed
            </CardTitle>
            <FileText className="h-4 w-4 text-slate-500 dark:text-neutral-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-slate-900 dark:text-neutral-100 tracking-tight">
              {stats.closed?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
              Archived or dismissed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by Booking ID, client name, counselor name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9 pr-8 h-9 text-xs sm:text-sm bg-slate-50/70 dark:bg-neutral-800/70 border-slate-200 dark:border-neutral-700 focus:bg-white dark:focus:bg-neutral-900 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filters and Actions */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select
                value={selectedStatus || 'all'}
                onValueChange={(value) => {
                  setSelectedStatus(value === 'all' ? '' : value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger
                  leftIcon={<Filter className="w-3.5 h-3.5 text-slate-400" />}
                  className="h-9 text-xs w-full sm:w-[170px] bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-700"
                >
                  <SelectValue placeholder="All Dispute Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="resolved_valid">Resolved (Valid)</SelectItem>
                  <SelectItem value="resolved_invalid">Resolved (Invalid)</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleSearch}
                size="sm"
                className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs shrink-0"
              >
                <Search className="w-3.5 h-3.5 mr-1.5" />
                Search
              </Button>
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800 overflow-x-auto text-xs">
            <span className="text-slate-400 font-medium mr-1 text-[11px]">Quick Filters:</span>
            <button
              onClick={() => {
                setSelectedStatus('');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedStatus === ''
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-slate-200'
              }`}
            >
              All Disputes ({stats.total})
            </button>
            <button
              onClick={() => {
                setSelectedStatus('under_review');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedStatus === 'under_review'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-slate-200'
              }`}
            >
              Under Review ({stats.underReview})
            </button>
            <button
              onClick={() => {
                setSelectedStatus('resolved_valid');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedStatus === 'resolved_valid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-slate-200'
              }`}
            >
              Valid ({stats.resolvedValid})
            </button>
            <button
              onClick={() => {
                setSelectedStatus('resolved_invalid');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedStatus === 'resolved_invalid'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-slate-200'
              }`}
            >
              Invalid ({stats.resolvedInvalid})
            </button>
            <button
              onClick={() => {
                setSelectedStatus('closed');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedStatus === 'closed'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-slate-200'
              }`}
            >
              Closed ({stats.closed})
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Disputes Data Table */}
      <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
        <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-neutral-100">
                All Client Disputes
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Showing {disputes.length} of {pagination.totalDisputes} dispute records
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-neutral-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-2" />
              <p className="text-sm font-medium">Fetching disputes data...</p>
            </div>
          ) : disputes.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Shield className="w-12 h-12 text-slate-300 dark:text-neutral-700 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-800 dark:text-neutral-200">
                No disputes found
              </p>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                {searchTerm || selectedStatus
                  ? 'No dispute cases match your filter criteria. Try searching with different terms or reset filters.'
                  : 'No dispute claims have been submitted on the platform.'}
              </p>
              {(searchTerm || selectedStatus) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedStatus('');
                    setCurrentPage(1);
                  }}
                  className="mt-4 text-xs font-medium"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-neutral-800/50 border-b border-slate-200/80 dark:border-neutral-800 text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Booking ID</th>
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Counselor</th>
                    <th className="py-3.5 px-4">Issue Type</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4">Disputed At</th>
                    <th className="py-3.5 px-4 text-center">Evidence</th>
                    <th className="py-3.5 px-4 sm:px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 text-xs sm:text-sm">
                  {disputes.map((dispute) => {
                    const client = dispute.clientId;
                    const counselor = dispute.slotId?.counselorId;
                    const disputeObj = dispute.dispute || {};
                    const evidenceCount = disputeObj.evidence?.length || 0;

                    return (
                      <tr
                        key={dispute._id}
                        className="hover:bg-slate-50/70 dark:hover:bg-neutral-800/40 transition-colors group"
                      >
                        {/* Booking ID */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-1.5 font-mono text-xs">
                            <span className="font-semibold text-slate-800 dark:text-neutral-200 bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                              {dispute._id ? `${dispute._id.substring(0, 10)}...` : 'N/A'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(dispute._id, 'Booking ID', dispute._id)}
                              title="Copy Booking ID"
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 p-0.5 rounded"
                            >
                              {copiedId === `Booking ID-${dispute._id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Client Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 rounded-lg border border-slate-200 dark:border-neutral-700 shadow-xs shrink-0">
                              <AvatarImage src={client?.profilePicture} alt={client?.fullName} />
                              <AvatarFallback className="rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs">
                                {getInitials(client?.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-neutral-100 truncate">
                                {client?.fullName || 'Client N/A'}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                                {client?.email || 'No email'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Counselor Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 rounded-lg border border-slate-200 dark:border-neutral-700 shadow-xs shrink-0">
                              <AvatarImage src={counselor?.profilePicture} alt={counselor?.fullName} />
                              <AvatarFallback className="rounded-lg bg-purple-50 text-purple-700 font-semibold text-xs">
                                {getInitials(counselor?.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-neutral-100 truncate">
                                {counselor?.fullName || 'Counselor N/A'}
                              </p>
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                                {counselor?.experienceLevel || 'Counselor'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Issue Type */}
                        <td className="py-3.5 px-4">
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300 font-medium text-xs px-2.5 py-0.5 truncate max-w-[160px]"
                          >
                            {getIssueTypeLabel(disputeObj.issueType)}
                          </Badge>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <Badge
                            variant="outline"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border shadow-xs ${getStatusColor(
                              disputeObj.status || dispute.status
                            )}`}
                          >
                            {getStatusIcon(disputeObj.status || dispute.status)}
                            <span>{getStatusLabel(disputeObj.status || dispute.status)}</span>
                          </Badge>
                        </td>

                        {/* Disputed Date */}
                        <td className="py-3.5 px-4">
                          <div className="text-xs text-slate-700 dark:text-neutral-300">
                            <div className="flex items-center gap-1.5 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatDate(disputeObj.disputedAt || dispute.createdAt)}</span>
                            </div>
                            <span className="text-[11px] text-slate-400 pl-5">
                              {formatTime(disputeObj.disputedAt || dispute.createdAt)}
                            </span>
                          </div>
                        </td>

                        {/* Evidence Files */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap border shadow-2xs ${
                              evidenceCount > 0
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
                                : 'bg-slate-50 text-slate-600 border-slate-200/80 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700'
                            }`}
                          >
                            <Paperclip className={`w-3 h-3 shrink-0 ${evidenceCount > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                            <span>{evidenceCount} {evidenceCount === 1 ? 'file' : 'files'}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 sm:px-6 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(dispute)}
                            className="h-8 px-3 text-xs font-medium text-blue-700 dark:text-blue-400 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-200 shadow-none"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-blue-600 dark:text-blue-400" />
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!loading && disputes.length > 0 && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50">
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Showing page <span className="font-semibold text-slate-800 dark:text-neutral-200">{pagination.currentPage}</span> of{' '}
                <span className="font-semibold text-slate-800 dark:text-neutral-200">{pagination.totalPages}</span> ({pagination.totalDisputes} total disputes)
              </p>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-3 text-xs font-medium border-slate-200 dark:border-neutral-800"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        size="sm"
                        variant={currentPage === pageNum ? 'default' : 'ghost'}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 p-0 text-xs font-semibold ${
                          currentPage === pageNum
                            ? 'bg-amber-600 text-white'
                            : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="h-8 px-3 text-xs font-medium border-slate-200 dark:border-neutral-800"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dispute Detail Modal */}
      {showDetailModal && selectedDispute && (
        <DisputeDetailModal
          bookingId={selectedDispute._id}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onDisputeUpdated={handleDisputeUpdated}
        />
      )}
    </div>
  );
};

export default AdminDisputeManagement;
