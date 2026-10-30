// components/admin/AdminCampusAmbassadorsManagement.jsx - Enterprise Campus Ambassador Management & Ledger Portal

import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import {
  GraduationCap,
  Users,
  Search,
  RefreshCw,
  Copy,
  Check,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Building2,
  Calendar,
  ExternalLink,
  Ban,
  Wallet,
  Receipt,
  FileSpreadsheet,
  Filter,
  X,
  Sparkles,
  Phone,
  Mail,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Helper for initials avatar
const getInitials = (name) => {
  if (!name) return 'CA';
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export default function AdminCampusAmbassadorsManagement() {
  const {
    getAllAmbassadorsAdmin,
    approveAmbassadorAdmin,
    rejectAmbassadorAdmin,
    toggleAmbassadorStatusAdmin,
    getAmbassadorLedgerAdmin,
    settleAmbassadorPayoutAdmin,
  } = useAdminAuth();

  // State
  const [ambassadors, setAmbassadors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);

  // Summary Metrics
  const [summary, setSummary] = useState({
    totalAmbassadors: 0,
    activeAmbassadors: 0,
    pendingReviews: 0,
    totalGrossRevenueDriven: 0,
    totalCommissionAccrued: 0,
    totalUnpaidBalance: 0,
  });

  // Action Modals State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedAmbassadorForReject, setSelectedAmbassadorForReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [selectedAmbassadorForPayout, setSelectedAmbassadorForPayout] = useState(null);
  const [payoutPeriod, setPayoutPeriod] = useState(dayjs().format('YYYY-MM'));
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [transactionReference, setTransactionReference] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);

  // Ledger Drawer State
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [selectedAmbassadorForLedger, setSelectedAmbassadorForLedger] = useState(null);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerTotalPages, setLedgerTotalPages] = useState(1);

  // Fetch ambassadors list
  const fetchAmbassadors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllAmbassadorsAdmin({
        page: currentPage,
        limit,
        search: searchTerm,
        status: statusFilter,
      });

      if (res.success) {
        setAmbassadors(res.data.ambassadors || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      } else {
        toast.error(res.error || 'Failed to load ambassadors.');
      }
    } catch {
      toast.error('Unexpected error loading ambassadors.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, limit, searchTerm, statusFilter, getAllAmbassadorsAdmin]);

  useEffect(() => {
    fetchAmbassadors();
  }, [fetchAmbassadors]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchAmbassadors();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Approve Ambassador
  const handleApprove = async (ambassador) => {
    try {
      const res = await approveAmbassadorAdmin(ambassador._id);
      if (res.success) {
        toast.success(`Approved ${ambassador.fullName}. Code assigned: ${res.data?.referralCode}`);
        fetchAmbassadors();
      } else {
        toast.error(res.error || 'Failed to approve application.');
      }
    } catch {
      toast.error('Error approving application.');
    }
  };

  // Reject Application
  const handleOpenReject = (ambassador) => {
    setSelectedAmbassadorForReject(ambassador);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedAmbassadorForReject) return;
    try {
      setRejectSubmitting(true);
      const res = await rejectAmbassadorAdmin(
        selectedAmbassadorForReject._id,
        rejectionReason.trim() || 'Application does not meet current program requirements.'
      );
      if (res.success) {
        toast.success(`Rejected application for ${selectedAmbassadorForReject.fullName}.`);
        setRejectModalOpen(false);
        fetchAmbassadors();
      } else {
        toast.error(res.error || 'Failed to reject application.');
      }
    } catch {
      toast.error('Error rejecting application.');
    } finally {
      setRejectSubmitting(false);
    }
  };

  // Toggle Active / Suspended
  const handleToggleStatus = async (ambassador) => {
    try {
      const res = await toggleAmbassadorStatusAdmin(ambassador._id);
      if (res.success) {
        toast.success(res.message || 'Ambassador status updated.');
        fetchAmbassadors();
      } else {
        toast.error(res.error || 'Failed to toggle status.');
      }
    } catch {
      toast.error('Error toggling ambassador status.');
    }
  };

  // Open Ledger Modal
  const handleOpenLedger = async (ambassador, page = 1) => {
    setSelectedAmbassadorForLedger(ambassador);
    setLedgerModalOpen(true);
    setLedgerLoading(true);
    setLedgerPage(page);

    try {
      const res = await getAmbassadorLedgerAdmin(ambassador._id, { page, limit: 10 });
      if (res.success) {
        setLedgerEntries(res.data.ledgerEntries || []);
        setLedgerTotalPages(res.data.pagination?.totalPages || 1);
      } else {
        toast.error(res.error || 'Failed to load session ledger.');
      }
    } catch {
      toast.error('Error loading session audit ledger.');
    } finally {
      setLedgerLoading(false);
    }
  };

  // Open Payout Settlement Modal
  const handleOpenPayout = (ambassador) => {
    setSelectedAmbassadorForPayout(ambassador);
    setPayoutPeriod(dayjs().format('YYYY-MM'));
    setPaymentMethod('UPI');
    setTransactionReference('');
    setPayoutNotes('');
    setPayoutModalOpen(true);
  };

  const handleConfirmPayout = async () => {
    if (!selectedAmbassadorForPayout) return;
    if (!transactionReference.trim()) {
      toast.error('Bank / UPI transaction reference (UTR) is required for audit compliance.');
      return;
    }

    try {
      setPayoutSubmitting(true);
      const res = await settleAmbassadorPayoutAdmin(selectedAmbassadorForPayout._id, {
        payoutPeriod,
        paymentMethod,
        transactionReference: transactionReference.trim(),
        notes: payoutNotes.trim(),
      });

      if (res.success) {
        toast.success(`Settlement recorded: ₹${res.data?.payout?.amount} successfully paid.`);
        setPayoutModalOpen(false);
        fetchAmbassadors();
      } else {
        toast.error(res.error || 'Failed to process payout settlement.');
      }
    } catch {
      toast.error('Error processing payout.');
    } finally {
      setPayoutSubmitting(false);
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 font-medium text-xs px-2.5 py-0.5">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />
            Active
          </Badge>
        );
      case 'pending_review':
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 font-medium text-xs px-2.5 py-0.5">
            <Clock className="w-3 h-3 mr-1 text-amber-600 dark:text-amber-400" />
            Pending Review
          </Badge>
        );
      case 'suspended':
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 font-medium text-xs px-2.5 py-0.5">
            <Ban className="w-3 h-3 mr-1 text-rose-600 dark:text-rose-400" />
            Suspended
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 font-medium text-xs px-2.5 py-0.5">
            <XCircle className="w-3 h-3 mr-1 text-slate-500" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-neutral-100">
              Campus Ambassadors Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400">
              Review student applications, monitor 60-day session commissions, and disburse monthly UPI revenue share.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={refreshing || loading}
            className="h-9 px-3.5 text-xs font-medium border-slate-200 dark:border-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Ambassadors */}
        <Card className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-blue-900 dark:text-blue-300">
              Ambassadors
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-blue-950 dark:text-blue-100 tracking-tight">
              {summary.totalAmbassadors || 0}
            </div>
            <p className="text-[11px] text-blue-700/80 dark:text-blue-400/80 mt-0.5">
              <span className="font-semibold">{summary.activeAmbassadors || 0} active</span>
              {' · '}
              <span>{summary.pendingReviews || 0} pending review</span>
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Gross Revenue Driven */}
        <Card className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
              Gross Revenue Driven
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-emerald-950 dark:text-emerald-100 tracking-tight">
              ₹{(summary.totalGrossRevenueDriven || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
              Total session billings from referred students
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Total 5% Commission Accrued */}
        <Card className="bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">
              Total 5% Accrued
            </CardTitle>
            <Receipt className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-indigo-950 dark:text-indigo-100 tracking-tight">
              ₹{(summary.totalCommissionAccrued || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400/80 mt-0.5">
              Total lifetime commissions credited
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Unpaid Balance */}
        <Card className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-amber-900 dark:text-amber-300">
              Unpaid Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-amber-950 dark:text-amber-100 tracking-tight">
              ₹{(summary.totalUnpaidBalance || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
              Accrued pending payout across ambassadors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Search & Filter Toolbar */}
      <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by ambassador name, referral code, email, college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAmbassadors()}
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
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 text-xs w-full sm:w-[160px] bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-700">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={String(limit)}
                onValueChange={(val) => {
                  setLimit(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 text-xs w-[110px] bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-700">
                  <SelectValue placeholder="Page Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="25">25 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={fetchAmbassadors}
                size="sm"
                className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs shrink-0"
              >
                <Search className="w-3.5 h-3.5 mr-1.5" />
                Filter
              </Button>
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="hidden sm:flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800 overflow-x-auto text-xs">
            <span className="text-slate-400 font-medium mr-1 text-[11px]">Quick Filters:</span>
            <button
              onClick={() => {
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-slate-200'
              }`}
            >
              All Ambassadors ({summary.totalAmbassadors || 0})
            </button>
            <button
              onClick={() => {
                setStatusFilter('pending_review');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === 'pending_review'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-slate-200'
              }`}
            >
              Pending Review ({summary.pendingReviews || 0})
            </button>
            <button
              onClick={() => {
                setStatusFilter('active');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-slate-200'
              }`}
            >
              Active ({summary.activeAmbassadors || 0})
            </button>
            <button
              onClick={() => {
                setStatusFilter('suspended');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === 'suspended'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-slate-200'
              }`}
            >
              Suspended
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 4. Ambassadors Table */}
      <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-neutral-800/80">
              <TableRow>
                <TableHead className="font-semibold text-slate-700 dark:text-neutral-300 text-xs uppercase tracking-wider py-3.5">
                  Ambassador Profile
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-neutral-300 text-xs uppercase tracking-wider py-3.5">
                  Referral Tracking
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-neutral-300 text-xs uppercase tracking-wider py-3.5">
                  Contact & UPI
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-neutral-300 text-xs uppercase tracking-wider py-3.5 text-center">
                  Attributed Students
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-neutral-300 text-xs uppercase tracking-wider py-3.5 text-right">
                  Unpaid Balance
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-neutral-300 text-xs uppercase tracking-wider py-3.5 text-center">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-neutral-300 text-xs uppercase tracking-wider py-3.5 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                    <span className="text-sm font-medium">Loading campus ambassadors...</span>
                  </TableCell>
                </TableRow>
              ) : ambassadors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-44 text-center">
                    <div className="max-w-xs mx-auto space-y-2 py-6">
                      <GraduationCap className="w-10 h-10 text-slate-300 dark:text-neutral-600 mx-auto" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-neutral-300">
                        No ambassadors found
                      </p>
                      <p className="text-xs text-slate-400">
                        {statusFilter !== 'all' || searchTerm
                          ? 'Try adjusting your search query or status filter.'
                          : 'Campus ambassadors who submit applications at /campus-ambassador will appear here for review.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                ambassadors.map((amb) => (
                  <TableRow key={amb._id} className="hover:bg-slate-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                    {/* Ambassador Profile */}
                    <TableCell className="align-middle py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {getInitials(amb.fullName)}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-neutral-100 text-sm">
                            {amb.fullName}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400">
                            <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                            <span className="truncate max-w-[200px]" title={amb.collegeName}>
                              {amb.collegeName}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-neutral-500">
                            {amb.degreeAndYear}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Referral Tracking */}
                    <TableCell className="align-middle py-3.5">
                      {amb.referralCode ? (
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-neutral-800 font-mono text-xs font-semibold text-slate-800 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700">
                            <span>{amb.referralCode}</span>
                            <button
                              onClick={() => copyToClipboard(amb.referralCode, amb._id + '_code')}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 transition-colors"
                              title="Copy code"
                            >
                              {copiedCode === amb._id + '_code' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <div>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  `${window.location.origin}/?amb=${amb.referralCode}`,
                                  amb._id + '_link'
                                )
                              }
                              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
                            >
                              <span>Copy referral link</span>
                              {copiedCode === amb._id + '_link' ? (
                                <Check className="w-2.5 h-2.5 text-emerald-600" />
                              ) : (
                                <ExternalLink className="w-2.5 h-2.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Assigned on approval
                        </span>
                      )}
                    </TableCell>

                    {/* Contact & UPI */}
                    <TableCell className="align-middle py-3.5">
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1 text-slate-800 dark:text-neutral-200 font-medium">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[160px]">{amb.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 dark:text-neutral-400">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{amb.phone}</span>
                        </div>
                        <div className="inline-flex items-center gap-1 text-[11px] text-slate-700 dark:text-neutral-300 font-mono bg-slate-50 dark:bg-neutral-800 px-2 py-0.5 rounded border border-slate-200 dark:border-neutral-700">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          <span>{amb.upiId}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Students Attributed */}
                    <TableCell className="align-middle py-3.5 text-center">
                      <Badge variant="outline" className="font-semibold text-slate-800 dark:text-neutral-200 text-xs px-2.5 py-0.5 bg-slate-50 dark:bg-neutral-800">
                        <Users className="w-3 h-3 mr-1 text-blue-600 dark:text-blue-400" />
                        {amb.metrics?.totalStudentsAttributed || 0}
                      </Badge>
                    </TableCell>

                    {/* Financials & Unpaid Balance */}
                    <TableCell className="align-middle py-3.5 text-right">
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-amber-700 dark:text-amber-400 font-mono">
                          ₹{(amb.metrics?.unpaidCommissionBalance || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-neutral-500">
                          Accrued: ₹{(amb.metrics?.totalCommissionAccrued || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="align-middle py-3.5 text-center">
                      {renderStatusBadge(amb.status)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="align-middle py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {amb.status === 'pending_review' && (
                          <>
                            <Button
                              size="sm"
                              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                              onClick={() => handleApprove(amb)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40"
                              onClick={() => handleOpenReject(amb)}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {amb.status === 'active' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs gap-1 text-slate-700 dark:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 border-slate-200 dark:border-neutral-700"
                              onClick={() => handleOpenLedger(amb)}
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              <span>Ledger</span>
                            </Button>

                            <Button
                              size="sm"
                              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1 font-medium shadow-xs"
                              onClick={() => handleOpenPayout(amb)}
                              disabled={(amb.metrics?.unpaidCommissionBalance || 0) <= 0}
                              title={(amb.metrics?.unpaidCommissionBalance || 0) <= 0 ? 'No accrued balance to settle' : 'Settle monthly earnings'}
                            >
                              <Wallet className="w-3.5 h-3.5" />
                              <span>Payout</span>
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              onClick={() => handleToggleStatus(amb)}
                              title="Suspend ambassador"
                            >
                              Suspend
                            </Button>
                          </>
                        )}

                        {amb.status === 'suspended' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs gap-1"
                              onClick={() => handleOpenLedger(amb)}
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5" />
                              <span>Ledger</span>
                            </Button>

                            <Button
                              size="sm"
                              className="h-8 text-xs bg-slate-800 hover:bg-slate-900 text-white font-medium"
                              onClick={() => handleToggleStatus(amb)}
                            >
                              Reactivate
                            </Button>
                          </>
                        )}

                        {amb.status === 'rejected' && (
                          <div className="text-[11px] text-slate-400 italic max-w-[140px] truncate" title={amb.rejectionReason}>
                            {amb.rejectionReason || 'Rejected by admin'}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-between text-xs text-slate-600 dark:text-neutral-400">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || loading}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || loading}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 5. Session Audit Ledger Modal */}
      <Dialog open={ledgerModalOpen} onOpenChange={setLedgerModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <span>Session Commission Audit Ledger</span>
              </div>
              {selectedAmbassadorForLedger && (
                <Badge variant="outline" className="font-mono text-xs">
                  {selectedAmbassadorForLedger.referralCode}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Chronological log of every realized paid session completed by students attributed to{' '}
              <span className="font-semibold text-slate-800 dark:text-neutral-200">
                {selectedAmbassadorForLedger?.fullName}
              </span>.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 my-2">
            {ledgerLoading ? (
              <div className="py-12 text-center text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                <span>Loading ledger transactions...</span>
              </div>
            ) : ledgerEntries.length === 0 ? (
              <div className="py-12 text-center text-slate-500 border border-dashed rounded-xl">
                No session earnings recorded yet for this ambassador.
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-neutral-800">
                    <TableRow>
                      <TableHead className="text-xs uppercase font-semibold">Client</TableHead>
                      <TableHead className="text-xs uppercase font-semibold">Session Date</TableHead>
                      <TableHead className="text-xs uppercase font-semibold text-right">
                        Session Price
                      </TableHead>
                      <TableHead className="text-xs uppercase font-semibold text-right">
                        5% Commission
                      </TableHead>
                      <TableHead className="text-xs uppercase font-semibold text-center">
                        60-Day Window
                      </TableHead>
                      <TableHead className="text-xs uppercase font-semibold text-center">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerEntries.map((entry) => (
                      <TableRow key={entry._id} className="text-xs">
                        <TableCell className="font-medium text-slate-800 dark:text-neutral-200">
                          {entry.clientId?.fullName || 'Client'}
                          <div className="text-[10px] text-slate-400">
                            {entry.clientId?.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-neutral-400">
                          {dayjs(entry.sessionCompletedAt).format('DD MMM YYYY, hh:mm A')}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          ₹{entry.realizedSessionPrice}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          +₹{entry.commissionAmount}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-[11px] font-medium text-slate-700 dark:text-neutral-300">
                            Day {entry.attributionDayNumber || 1} of 60
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={`text-[10px] uppercase font-semibold ${
                              entry.status === 'accrued'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : entry.status === 'settled'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {entry.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-slate-100 dark:border-neutral-800 pt-3 flex items-center justify-between sm:justify-between">
            <div className="text-xs text-slate-500">
              Ambassador Unpaid Balance:{' '}
              <span className="font-bold text-slate-800 dark:text-neutral-200 font-mono">
                ₹{selectedAmbassadorForLedger?.metrics?.unpaidCommissionBalance || 0}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLedgerModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 6. Monthly Payout Settlement Modal */}
      <Dialog open={payoutModalOpen} onOpenChange={setPayoutModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              <span>Settle Ambassador Monthly Payout</span>
            </DialogTitle>
            <DialogDescription>
              Disburse accumulated commission and clear unpaid ledger balances for audit tracking.
            </DialogDescription>
          </DialogHeader>

          {selectedAmbassadorForPayout && (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ambassador:</span>
                  <span className="font-semibold text-slate-800 dark:text-neutral-200">
                    {selectedAmbassadorForPayout.fullName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Registered UPI ID:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white bg-white dark:bg-neutral-900 px-2 py-0.5 rounded border border-slate-200 dark:border-neutral-700 select-all">
                    {selectedAmbassadorForPayout.upiId}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200/80 dark:border-neutral-700 pt-1.5">
                  <span className="text-slate-700 dark:text-neutral-300 font-semibold">Unpaid Balance to Settle:</span>
                  <span className="font-mono font-bold text-base text-emerald-700 dark:text-emerald-400">
                    ₹{selectedAmbassadorForPayout.metrics?.unpaidCommissionBalance || 0}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="period" className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
                    Payout Month / Period <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="period"
                    value={payoutPeriod}
                    onChange={(e) => setPayoutPeriod(e.target.value)}
                    placeholder="e.g. 2026-10"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="mode" className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
                    Disbursement Channel
                  </Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="mode" className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPI">UPI Transfer</SelectItem>
                      <SelectItem value="IMPS">IMPS Instant Bank Transfer</SelectItem>
                      <SelectItem value="NEFT">NEFT National Electronic Funds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="utr" className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
                    Transaction Reference / UTR Number <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="utr"
                    value={transactionReference}
                    onChange={(e) => setTransactionReference(e.target.value)}
                    placeholder="e.g. UPI/123456789012 or IMPS Reference"
                    className="h-9 text-xs font-mono"
                  />
                  <p className="text-[11px] text-slate-400">
                    Enter the bank or UPI confirmation UTR after executing payment.
                  </p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="notes" className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
                    Internal Notes (Optional)
                  </Label>
                  <Input
                    id="notes"
                    value={payoutNotes}
                    onChange={(e) => setPayoutNotes(e.target.value)}
                    placeholder="e.g. Cleared full October commission"
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPayoutModalOpen(false)}
              disabled={payoutSubmitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleConfirmPayout}
              disabled={payoutSubmitting || !transactionReference.trim()}
            >
              {payoutSubmitting ? 'Recording Settlement...' : 'Confirm & Record Settlement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 7. Reject Application Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <span>Reject Ambassador Application</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject the application for{' '}
              <span className="font-semibold text-slate-800 dark:text-neutral-200">
                {selectedAmbassadorForReject?.fullName}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="reason" className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
              Rejection Reason
            </Label>
            <Textarea
              id="reason"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete university credentials or duplicate submission."
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
              disabled={rejectSubmitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={rejectSubmitting}
            >
              {rejectSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
