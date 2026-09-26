// pages/admin/AdminDashboard.jsx - Executive Admin Dashboard & Application Management

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import {
  LayoutDashboard,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Loader2,
  Calendar,
  Mail,
  Phone,
  Copy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
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

dayjs.extend(utc);
dayjs.extend(timezone);
const TIMEZONE = 'Asia/Kolkata';

// Helper for user initials
const getInitials = (name) => {
  if (!name) return 'C';
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const AdminDashboard = () => {
  const { getAllCounselorApplications, updateApplicationStatus } = useAdminAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Filter & Search states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchApplications();
  }, [selectedStatus]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const result = await getAllCounselorApplications(selectedStatus);
      if (result.success) {
        setApplications(result.data || []);
      } else {
        toast.error(result.error || 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (counselorId, status, rejectionReason = '') => {
    setUpdatingId(counselorId);
    try {
      const result = await updateApplicationStatus(counselorId, status, rejectionReason);
      if (result.success) {
        toast.success(`Application ${status} successfully`);
        fetchApplications();
      } else {
        toast.error(result.error || `Failed to update status to ${status}`);
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update application status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCopyText = (text, type, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(`${type}-${id}`);
    toast.success(`${type} copied to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const fullName = app.fullName || '';
      const email = app.email || '';
      const specializations = app.specialization || [];

      const matchesSearch =
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        specializations.some((spec) => spec.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        !selectedStatus || app.application?.applicationStatus === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, selectedStatus]);

  // Paginated applications
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredApplications.slice(start, start + itemsPerPage);
  }, [filteredApplications, currentPage]);

  // KPI Statistics
  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((app) => app.application?.applicationStatus === 'pending').length,
      approved: applications.filter((app) => app.application?.applicationStatus === 'approved')
        .length,
      rejected: applications.filter((app) => app.application?.applicationStatus === 'rejected')
        .length,
    };
  }, [applications]);

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
          label: 'Pending Review',
          className:
            'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
        };
      case 'approved':
        return {
          icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
          label: 'Approved',
          className:
            'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
          label: 'Rejected',
          className:
            'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
        };
      default:
        return {
          icon: <Clock className="w-3.5 h-3.5 text-slate-500" />,
          label: status ? status.replace(/_/g, ' ') : 'Not Submitted',
          className:
            'bg-slate-50 text-slate-700 border-slate-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).tz(TIMEZONE).format('MMM DD, YYYY');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return dayjs(dateString).tz(TIMEZONE).format('hh:mm A');
  };

  return (
    <div className="space-y-6 p-3 sm:p-5 lg:p-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-neutral-100">
              Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400">
              Real-time platform overview and counselor onboarding management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchApplications}
            disabled={loading}
            className="h-9 px-3.5 text-xs font-medium border-slate-200 dark:border-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Applications */}
        <Card className="bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">
              Total Applications
            </CardTitle>
            <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-indigo-950 dark:text-indigo-100 tracking-tight">
              {stats.total.toLocaleString()}
            </div>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400/80 mt-0.5">
              All submitted applications
            </p>
          </CardContent>
        </Card>

        {/* Pending Review */}
        <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
              {stats.pending.toLocaleString()}
            </div>
            <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium mt-0.5">
              Awaiting verification
            </p>
          </CardContent>
        </Card>

        {/* Approved */}
        <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Approved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {stats.approved.toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
              Active counselors
            </p>
          </CardContent>
        </Card>

        {/* Rejected */}
        <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-rose-700 dark:text-rose-400">
              Rejected
            </CardTitle>
            <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-400 tracking-tight">
              {stats.rejected.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
              Disqualified submissions
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
                placeholder="Search by counselor name, email, or specialization..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-8 h-9 text-xs sm:text-sm bg-slate-50/70 dark:bg-neutral-800/70 border-slate-200 dark:border-neutral-700 focus:bg-white dark:focus:bg-neutral-900 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Select Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select
                value={selectedStatus || 'all'}
                onValueChange={(val) => {
                  setSelectedStatus(val === 'all' ? '' : val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger
                  leftIcon={<Filter className="w-3.5 h-3.5 text-slate-400" />}
                  className="h-9 text-xs w-full sm:w-[160px] bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-700"
                >
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
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
              All Applications ({stats.total})
            </button>
            <button
              onClick={() => {
                setSelectedStatus('pending');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedStatus === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-slate-200'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => {
                setSelectedStatus('approved');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedStatus === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-slate-200'
              }`}
            >
              Approved ({stats.approved})
            </button>
            <button
              onClick={() => {
                setSelectedStatus('rejected');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedStatus === 'rejected'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-slate-200'
              }`}
            >
              Rejected ({stats.rejected})
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table Card */}
      <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
        <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-neutral-100">
                Counselor Onboarding Applications
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Showing {paginatedApplications.length} of {filteredApplications.length} applications
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-neutral-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <p className="text-sm font-medium">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-16 px-4">
              <FileText className="w-12 h-12 text-slate-300 dark:text-neutral-700 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-800 dark:text-neutral-200">
                No applications found
              </p>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                {searchTerm || selectedStatus
                  ? 'No applications match your search query or filter status.'
                  : 'No counselor onboarding applications have been submitted yet.'}
              </p>
              {(searchTerm || selectedStatus) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedStatus('');
                  }}
                  className="mt-4 text-xs font-medium"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-neutral-800/50 border-b border-slate-200/80 dark:border-neutral-800 text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                    <th className="py-3.5 pl-4 sm:pl-5 pr-2">Applicant</th>
                    <th className="py-3.5 px-2.5">Contact</th>
                    <th className="py-3.5 px-2.5">Specializations</th>
                    <th className="py-3.5 px-2.5 whitespace-nowrap">Submitted At</th>
                    <th className="py-3.5 px-2.5 text-center whitespace-nowrap">Status</th>
                    <th className="py-3.5 pr-4 sm:pr-5 pl-2 text-center whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 text-xs sm:text-sm">
                  {paginatedApplications.map((application) => {
                    const appStatus = application.application?.applicationStatus || 'not_submitted';
                    const submittedAt = application.application?.applicationSubmittedAt || application.createdAt;
                    const specializations = application.specialization || [];
                    const statusBadge = getStatusBadge(appStatus);

                    return (
                      <tr
                        key={application._id}
                        className="hover:bg-slate-50/70 dark:hover:bg-neutral-800/40 transition-colors group"
                      >
                        {/* Applicant Column */}
                        <td className="py-3.5 pl-4 sm:pl-5 pr-2">
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <Avatar className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border border-slate-200 dark:border-neutral-700 shadow-xs shrink-0">
                              <AvatarImage
                                src={application.profilePicture}
                                alt={application.fullName}
                                className="object-cover"
                              />
                              <AvatarFallback className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-xs">
                                {getInitials(application.fullName)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 max-w-[170px] sm:max-w-[210px]">
                              <p className="font-semibold text-slate-900 dark:text-neutral-100 truncate group-hover:text-indigo-600 transition-colors">
                                {application.fullName || 'Unnamed Applicant'}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate">
                                  @{application.username || 'counselor'}
                                </span>
                                {application.gender && (
                                  <>
                                    <span className="text-slate-300 dark:text-neutral-700 shrink-0">•</span>
                                    <span className="text-[11px] text-slate-500 dark:text-neutral-400 shrink-0">
                                      {application.gender}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Column */}
                        <td className="py-3.5 px-2.5">
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-neutral-300">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[150px] sm:max-w-[190px]" title={application.email}>
                                {application.email || 'N/A'}
                              </span>
                              {application.email && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(application.email, 'Email', application._id)}
                                  title="Copy email"
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 p-0.5 rounded transition-colors shrink-0"
                                >
                                  {copiedId === `Email-${application._id}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  )}
                                </button>
                              )}
                            </div>

                            {application.phone && (
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-neutral-400">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[140px]">{application.phone}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(application.phone, 'Phone', application._id)}
                                  title="Copy phone"
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 p-0.5 rounded transition-colors shrink-0"
                                >
                                  {copiedId === `Phone-${application._id}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Specializations Column */}
                        <td className="py-3.5 px-2.5">
                          {specializations.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[220px] lg:max-w-[260px]">
                              {specializations.slice(0, 2).map((spec, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300 border border-slate-200/80 dark:border-neutral-700/80 leading-snug"
                                >
                                  {spec}
                                </span>
                              ))}
                              {specializations.length > 2 && (
                                <span
                                  className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/70 whitespace-nowrap"
                                  title={specializations.slice(2).join(', ')}
                                >
                                  +{specializations.length - 2} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">General Counseling</span>
                          )}
                        </td>

                        {/* Submission Date */}
                        <td className="py-3.5 px-2.5 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-neutral-200 whitespace-nowrap">
                              <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span>{formatDate(submittedAt)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-neutral-400 whitespace-nowrap">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0 ml-0.5" />
                              <span>{formatTime(submittedAt)}</span>
                            </div>
                          </div>
                        </td>

                        {/* Status Column */}
                        <td className="py-3.5 px-2.5 text-center whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border shadow-xs whitespace-nowrap ${statusBadge.className}`}
                          >
                            {statusBadge.icon}
                            <span>{statusBadge.label}</span>
                          </Badge>
                        </td>

                        {/* Actions Column */}
                        <td className="py-3 px-2.5 sm:pr-4 text-center whitespace-nowrap">
                          <div className="inline-flex flex-col items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin/application/${application._id}`)}
                              className="h-7 px-3 text-xs font-medium text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:border-indigo-200 shadow-none"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1 text-indigo-600 dark:text-indigo-400" />
                              View
                            </Button>

                            {appStatus === 'pending' && (
                              <div className="flex items-center gap-1.5">
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(application._id, 'approved')}
                                  disabled={updatingId === application._id}
                                  className="h-7 px-2 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-none"
                                >
                                  {updatingId === application._id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Approve
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    const reason = prompt('Please enter rejection reason:');
                                    if (reason && reason.trim()) {
                                      handleStatusUpdate(application._id, 'rejected', reason.trim());
                                    }
                                  }}
                                  disabled={updatingId === application._id}
                                  className="h-7 px-2 text-[11px] font-semibold shadow-none"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!loading && filteredApplications.length > 0 && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50">
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Showing page <span className="font-semibold text-slate-800 dark:text-neutral-200">{currentPage}</span> of{' '}
                <span className="font-semibold text-slate-800 dark:text-neutral-200">{totalPages}</span> ({filteredApplications.length} total applications)
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
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
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
                            ? 'bg-indigo-600 text-white'
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
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
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
    </div>
  );
};

export default AdminDashboard;
