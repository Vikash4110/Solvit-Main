// components/admin/AdminCounselorsManagement.jsx - Complete Production-Grade Component

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import {
  UserCheck,
  Search,
  Filter,
  Eye,
  UserX,
  Mail,
  Phone,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Award,
  Briefcase,
  GraduationCap,
  Star,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Copy,
  Check,
  Building2,
  FileText,
  Shield,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import CounselorDetailModal from './CounselorDetailModal';

dayjs.extend(utc);
dayjs.extend(timezone);
const TIMEZONE = 'Asia/Kolkata';

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

const AdminCounselorsManagement = () => {
  const { getAllCounselors, toggleCounselorBlock } = useAdminAuth();

  const [counselors, setCounselors] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    approved: 0,
    pending: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCounselors: 0,
    limit: 20,
  });

  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [blockingCounselorId, setBlockingCounselorId] = useState(null);

  useEffect(() => {
    fetchCounselors();
  }, [selectedStatus, currentPage]);

  const fetchCounselors = async () => {
    setLoading(true);
    try {
      const statusParam = selectedStatus === 'all' ? '' : selectedStatus;
      const result = await getAllCounselors(currentPage, 20, searchTerm, statusParam);

      if (result.success) {
        setCounselors(result.data.counselors || []);
        setStats(result.data.stats || { total: 0, active: 0, blocked: 0, approved: 0, pending: 0 });
        setPagination(
          result.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalCounselors: 0,
            limit: 20,
          }
        );
      } else {
        toast.error(result.error || 'Failed to fetch counselors');
      }
    } catch (err) {
      console.error('Fetch counselors error:', err);
      toast.error('Failed to load counselors data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCounselors();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  const handleViewDetails = (counselor) => {
    setSelectedCounselor(counselor);
    setShowDetailModal(true);
  };

  const handleToggleBlock = async (counselorId, currentlyBlocked) => {
    if (
      !window.confirm(
        `Are you sure you want to ${currentlyBlocked ? 'unblock' : 'block'} this counselor?`
      )
    ) {
      return;
    }

    setBlockingCounselorId(counselorId);
    const result = await toggleCounselorBlock(counselorId, !currentlyBlocked);

    if (result.success) {
      toast.success(`Counselor ${currentlyBlocked ? 'unblocked' : 'blocked'} successfully`);
      fetchCounselors();
    } else {
      toast.error(result.error);
    }
    setBlockingCounselorId(null);
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

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-neutral-100">
              Counselor Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400">
              Monitor, verify, manage and audit all registered counseling professionals
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCounselors()}
            disabled={loading}
            className="h-9 px-3.5 text-xs font-medium border-slate-200 dark:border-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Counselors */}
        <Card className="bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-500/20 shadow-sm col-span-2 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">
              Total Counselors
            </CardTitle>
            <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-indigo-950 dark:text-indigo-100 tracking-tight">
              {stats.total?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400/80 mt-0.5">
              All registered counselors
            </p>
          </CardContent>
        </Card>

        {/* Active */}
        <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Active
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-slate-900 dark:text-neutral-100 tracking-tight">
              {stats.active?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              Unblocked & operable
            </p>
          </CardContent>
        </Card>

        {/* Blocked */}
        <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-rose-700 dark:text-rose-400">
              Blocked
            </CardTitle>
            <UserX className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-400 tracking-tight">
              {stats.blocked?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
              Access suspended
            </p>
          </CardContent>
        </Card>

        {/* Approved */}
        <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-purple-700 dark:text-purple-400">
              Approved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-slate-900 dark:text-neutral-100 tracking-tight">
              {stats.approved?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
              Verified credentials
            </p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
              {stats.pending?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
              Awaiting verification
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-neutral-500" />
              <Input
                type="text"
                placeholder="Search by name, email, phone, ID, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9 h-9 text-xs bg-slate-50/50 dark:bg-neutral-950 border-slate-200 dark:border-neutral-800"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={selectedStatus}
              onValueChange={(val) => {
                setSelectedStatus(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs bg-slate-50/50 dark:bg-neutral-950 border-slate-200 dark:border-neutral-800">
                <SelectValue placeholder="All Counselors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Counselors</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleSearch}
              className="h-9 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
            >
              <Search className="w-3.5 h-3.5 mr-1.5" />
              Search
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-9 px-3 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-neutral-100"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Counselors Table Card */}
      <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
        <CardHeader className="py-4 px-5 border-b border-slate-100 dark:border-neutral-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-neutral-100">
              All Counselors ({pagination.totalCounselors || 0})
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Showing {counselors.length} of {pagination.totalCounselors || 0} registered professionals
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 dark:bg-neutral-950/60 hover:bg-slate-50/70 border-b border-slate-200/70 dark:border-neutral-800 text-xs">
                  <TableHead className="font-bold text-slate-600 dark:text-neutral-400">COUNSELOR</TableHead>
                  <TableHead className="font-bold text-slate-600 dark:text-neutral-400">CONTACT</TableHead>
                  <TableHead className="font-bold text-slate-600 dark:text-neutral-400">EXPERIENCE</TableHead>
                  <TableHead className="font-bold text-slate-600 dark:text-neutral-400">APPLICATION</TableHead>
                  <TableHead className="font-bold text-slate-600 dark:text-neutral-400">STATUS</TableHead>
                  <TableHead className="text-center font-bold text-slate-600 dark:text-neutral-400">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-neutral-400">
                        <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
                        <span className="text-sm font-medium">Loading counselor directory...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : counselors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-neutral-500">
                        <Briefcase className="h-10 w-10 stroke-[1.5] text-slate-300 dark:text-neutral-700" />
                        <p className="text-sm font-semibold text-slate-600 dark:text-neutral-300">
                          No counselors found
                        </p>
                        <p className="text-xs">
                          {selectedStatus !== 'all'
                            ? `No ${selectedStatus} counselors found`
                            : 'Try adjusting your search criteria'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  counselors.map((counselor) => (
                    <TableRow
                      key={counselor._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 border-b border-slate-100 dark:border-neutral-800/80 transition-colors"
                    >
                      {/* Counselor */}
                      <TableCell>
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <Avatar className="h-9 w-9 border border-slate-200 dark:border-neutral-700">
                            {counselor.profilePicture && (
                              <AvatarImage src={counselor.profilePicture} alt={counselor.fullName} />
                            )}
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xs font-bold">
                              {getInitials(counselor.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-slate-900 dark:text-neutral-100 truncate">
                              {counselor.fullName}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                              @{counselor.username}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact */}
                      <TableCell>
                        <div className="space-y-1 min-w-[180px] text-xs">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-neutral-300">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{counselor.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-neutral-400 font-mono text-[11px]">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{counselor.phone}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Experience */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border shadow-xs ${getExperienceLevelColor(
                            counselor.experienceLevel
                          )}`}
                        >
                          <Award className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {counselor.experienceLevel || 'Beginner'} • {counselor.experienceYears || 0}{' '}
                            {counselor.experienceYears === 1 ? 'yr' : 'yrs'}
                          </span>
                        </Badge>
                      </TableCell>

                      {/* Application */}
                      <TableCell>
                        {getApplicationStatusBadge(counselor.application?.applicationStatus)}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
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
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(counselor)}
                            className="h-7 px-2.5 text-xs font-semibold bg-white hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-200 border-slate-200 dark:border-neutral-700 shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant={counselor.isBlocked ? 'default' : 'destructive'}
                            onClick={() => handleToggleBlock(counselor._id, counselor.isBlocked)}
                            disabled={blockingCounselorId === counselor._id}
                            className="h-7 px-2.5 text-xs font-semibold"
                          >
                            {blockingCounselorId === counselor._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : counselor.isBlocked ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5 mr-1" />
                                Unblock
                              </>
                            ) : (
                              <>
                                <UserX className="w-3.5 h-3.5 mr-1" />
                                Block
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/40 dark:bg-neutral-950/40">
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Page <span className="font-bold text-slate-700 dark:text-neutral-200">{pagination.currentPage}</span> of{' '}
                <span className="font-bold text-slate-700 dark:text-neutral-200">{pagination.totalPages}</span> • Total{' '}
                <span className="font-bold text-slate-700 dark:text-neutral-200">{pagination.totalCounselors}</span> counselors
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-medium"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-medium"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))
                  }
                  disabled={currentPage === pagination.totalPages || loading}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Counselor Detail Modal */}
      {showDetailModal && selectedCounselor && (
        <CounselorDetailModal
          counselorId={selectedCounselor._id}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onCounselorUpdated={fetchCounselors}
        />
      )}
    </div>
  );
};

export default AdminCounselorsManagement;
