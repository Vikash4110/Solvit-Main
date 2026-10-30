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
  Phone,
  Mail,
  FileText,
  History,
  ArrowUpRight,
  User,
  Quote,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// Helper for extracting UPI ID regardless of schema nesting
const getAmbassadorUpi = (amb) => {
  return amb?.payoutDetails?.upiId || amb?.upiId || 'Not provided';
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

  // Ambassador Details & History Modal State (Eye Icon Window)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedAmbassador, setSelectedAmbassador] = useState(null);
  const [detailsTab, setDetailsTab] = useState('profile');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyLedger, setHistoryLedger] = useState([]);
  const [historyPayouts, setHistoryPayouts] = useState([]);

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

  // Open Detailed Profile & History Window (Triggered by Eye Icon)
  const handleOpenDetails = async (ambassador, initialTab = 'profile') => {
    setSelectedAmbassador(ambassador);
    setDetailsTab(initialTab);
    setDetailsModalOpen(true);
    setHistoryLoading(true);

    try {
      const res = await getAmbassadorLedgerAdmin(ambassador._id, { page: 1, limit: 50 });
      if (res.success) {
        setHistoryLedger(res.data.ledgerEntries || []);
        setHistoryPayouts(res.data.payouts || []);
      }
    } catch {
      console.error('Error fetching history details');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Approve Ambassador
  const handleApprove = async (ambassador) => {
    try {
      const res = await approveAmbassadorAdmin(ambassador._id);
      if (res.success) {
        toast.success(`Approved ${ambassador.fullName}. Code assigned: ${res.data?.referralCode}`);
        setDetailsModalOpen(false);
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
        setDetailsModalOpen(false);
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
        setDetailsModalOpen(false);
        fetchAmbassadors();
      } else {
        toast.error(res.error || 'Failed to toggle status.');
      }
    } catch {
      toast.error('Error toggling ambassador status.');
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
        setDetailsModalOpen(false);
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

      {/* 4. Streamlined Clean Table */}
      <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="table-fixed w-full min-w-[980px]">
            <TableHeader className="bg-slate-50/80 dark:bg-neutral-800/80">
              <TableRow>
                <TableHead className="font-semibold text-slate-700 dark:text-neutral-300 text-xs uppercase tracking-wider py-3.5 pl-6 text-left [&>div]:justify-start w-[250px]">
                  Ambassador
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-neutral-300 text-xs uppercase tracking-wider py-3.5 text-center [&>div]:justify-center w-[170px]">
                  Referral Code
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-neutral-300 text-xs uppercase tracking-wider py-3.5 text-center [&>div]:justify-center w-[100px]">
                  Students
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-neutral-300 text-xs uppercase tracking-wider py-3.5 text-right [&>div]:justify-end w-[140px]">
                  Unpaid Balance
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-neutral-300 text-xs uppercase tracking-wider py-3.5 text-center [&>div]:justify-center w-[120px]">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-neutral-300 text-xs uppercase tracking-wider py-3.5 text-center [&>div]:justify-center w-[70px]">
                  View
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-neutral-300 text-xs uppercase tracking-wider py-3.5 text-right pr-6 [&>div]:justify-end w-[180px]">
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
                    <TableCell className="align-middle py-3.5 pl-6 w-[250px]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {getInitials(amb.fullName)}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-neutral-100 text-sm truncate">
                            {amb.fullName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-neutral-400 truncate max-w-[180px]" title={amb.collegeName}>
                            {amb.collegeName}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Referral Tracking */}
                    <TableCell className="align-middle py-3.5 text-center w-[170px]">
                      <div className="flex justify-center">
                        {amb.referralCode ? (
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
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Assigned on approval
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Students Attributed */}
                    <TableCell className="align-middle py-3.5 text-center w-[100px]">
                      <div className="flex justify-center">
                        <Badge variant="outline" className="font-semibold text-slate-800 dark:text-neutral-200 text-xs px-2.5 py-0.5 bg-slate-50 dark:bg-neutral-800">
                          <Users className="w-3 h-3 mr-1 text-blue-600 dark:text-blue-400" />
                          {amb.metrics?.totalStudentsAttributed || 0}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Financials & Unpaid Balance */}
                    <TableCell className="align-middle py-3.5 text-right w-[140px]">
                      <div className="space-y-0.5 text-right">
                        <div className="text-sm font-bold text-amber-700 dark:text-amber-400 font-mono">
                          ₹{(amb.metrics?.unpaidCommissionBalance || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-neutral-500">
                          Accrued: ₹{(amb.metrics?.totalCommissionAccrued || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="align-middle py-3.5 text-center w-[120px]">
                      <div className="flex justify-center">
                        {renderStatusBadge(amb.status)}
                      </div>
                    </TableCell>

                    {/* Dedicated Eye Icon Column */}
                    <TableCell className="align-middle py-3.5 text-center w-[70px]">
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                          onClick={() => handleOpenDetails(amb, 'profile')}
                          title="View Full Profile & Performance History"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="align-middle py-3.5 text-right pr-6 w-[180px]">
                      <div className="flex items-center justify-end gap-1.5">
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
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-slate-800 hover:bg-slate-900 text-white font-medium"
                            onClick={() => handleToggleStatus(amb)}
                          >
                            Reactivate
                          </Button>
                        )}

                        {amb.status === 'rejected' && (
                          <div className="text-[11px] text-slate-400 italic max-w-[120px] truncate" title={amb.rejectionReason}>
                            {amb.rejectionReason || 'Rejected'}
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

      {/* 5. Comprehensive Details & History Modal (Triggered by Eye Icon) */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
          {selectedAmbassador && (
            <>
              {/* Modal Top Header */}
              <DialogHeader className="pb-4 pr-12 border-b border-slate-100 dark:border-neutral-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm">
                      {getInitials(selectedAmbassador.fullName)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {selectedAmbassador.fullName}
                        </DialogTitle>
                        {renderStatusBadge(selectedAmbassador.status)}
                      </div>
                      <DialogDescription className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-700 dark:text-neutral-300">{selectedAmbassador.collegeName}</span>
                        <span>•</span>
                        <span>{selectedAmbassador.degreeAndYear}</span>
                      </DialogDescription>
                    </div>
                  </div>

                  {/* Header Quick Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {selectedAmbassador.status === 'pending_review' && (
                      <>
                        <Button
                          size="sm"
                          className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                          onClick={() => handleApprove(selectedAmbassador)}
                        >
                          Approve Application
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                          onClick={() => {
                            setDetailsModalOpen(false);
                            handleOpenReject(selectedAmbassador);
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {selectedAmbassador.status === 'active' && (
                      (selectedAmbassador.metrics?.unpaidCommissionBalance || 0) > 0 ? (
                        <Button
                          size="sm"
                          className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 font-medium shadow-xs"
                          onClick={() => {
                            setDetailsModalOpen(false);
                            handleOpenPayout(selectedAmbassador);
                          }}
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          <span>Settle Payout (₹{(selectedAmbassador.metrics?.unpaidCommissionBalance || 0).toLocaleString('en-IN')})</span>
                        </Button>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-neutral-800 text-xs font-medium text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Balance Settled (₹0)</span>
                        </div>
                      )
                    )}

                    {selectedAmbassador.status === 'suspended' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-medium"
                        onClick={() => handleToggleStatus(selectedAmbassador)}
                      >
                        Reactivate Ambassador
                      </Button>
                    )}
                  </div>
                </div>
              </DialogHeader>

              {/* Navigation Tabs */}
              <Tabs value={detailsTab} onValueChange={setDetailsTab} className="flex-1 flex flex-col min-h-0 pt-2">
                <TabsList className="grid grid-cols-3 w-full sm:w-[420px] bg-slate-100 dark:bg-neutral-800">
                  <TabsTrigger value="profile" className="text-xs">
                    Applicant Profile
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-xs">
                    Earnings Ledger ({historyLedger.length})
                  </TabsTrigger>
                  <TabsTrigger value="payouts" className="text-xs">
                    Payout History ({historyPayouts.length})
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Full Applicant Profile Information */}
                <TabsContent value="profile" className="flex-1 overflow-y-auto space-y-4 pt-3 pr-1">
                  {/* Grid of Profile Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/80 border border-slate-200/80 dark:border-neutral-700 space-y-1">
                      <div className="text-slate-400 font-medium">Email Address</div>
                      <div className="font-semibold text-slate-800 dark:text-neutral-200 flex items-center justify-between">
                        <span className="truncate">{selectedAmbassador.email}</span>
                        <button
                          onClick={() => copyToClipboard(selectedAmbassador.email, 'dtl_email')}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/80 border border-slate-200/80 dark:border-neutral-700 space-y-1">
                      <div className="text-slate-400 font-medium">Phone Number</div>
                      <div className="font-semibold text-slate-800 dark:text-neutral-200 flex items-center justify-between">
                        <span>{selectedAmbassador.phone}</span>
                        <button
                          onClick={() => copyToClipboard(selectedAmbassador.phone, 'dtl_phone')}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/80 border border-slate-200/80 dark:border-neutral-700 space-y-1">
                      <div className="text-slate-400 font-medium">College / University</div>
                      <div className="font-semibold text-slate-800 dark:text-neutral-200">
                        {selectedAmbassador.collegeName}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/80 border border-slate-200/80 dark:border-neutral-700 space-y-1">
                      <div className="text-slate-400 font-medium">Degree & Academic Year</div>
                      <div className="font-semibold text-slate-800 dark:text-neutral-200">
                        {selectedAmbassador.degreeAndYear}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800/80 border border-slate-200/80 dark:border-neutral-700 space-y-1.5 sm:col-span-2">
                      <div className="text-xs text-slate-500 dark:text-neutral-400 font-medium flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          Registered UPI Payment ID
                        </span>
                        {getAmbassadorUpi(selectedAmbassador) !== 'Not provided' && (
                          <button
                            onClick={() => copyToClipboard(getAmbassadorUpi(selectedAmbassador), 'dtl_upi')}
                            className="text-slate-500 hover:text-blue-600 inline-flex items-center gap-1 text-[11px] font-sans font-medium transition-colors"
                          >
                            <span>{copiedCode === 'dtl_upi' ? 'Copied' : 'Copy UPI'}</span>
                            {copiedCode === 'dtl_upi' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {getAmbassadorUpi(selectedAmbassador) !== 'Not provided' ? (
                          <span className="bg-white dark:bg-neutral-900 px-2.5 py-1 rounded border border-slate-200 dark:border-neutral-700 select-all inline-block">
                            {getAmbassadorUpi(selectedAmbassador)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic font-normal">Not provided</span>
                        )}
                      </div>
                    </div>

                    {selectedAmbassador.referralCode && (
                      <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900 space-y-1 sm:col-span-2">
                        <div className="text-blue-600 dark:text-blue-400 font-medium">Referral Code & Smart Link</div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="font-mono font-bold text-sm text-blue-950 dark:text-blue-200">
                            {selectedAmbassador.referralCode}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                `${window.location.origin}/?amb=${selectedAmbassador.referralCode}`,
                                'dtl_link'
                              )
                            }
                            className="text-xs text-blue-700 dark:text-blue-300 font-medium hover:underline inline-flex items-center gap-1"
                          >
                            <span>Copy Smart Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Statement of Purpose / Reason to Join */}
                  <div className="p-4 rounded-xl border border-slate-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-neutral-300">
                      <Quote className="w-4 h-4 text-blue-600" />
                      <span>Why do you want to become a Solvit Campus Ambassador?</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed italic bg-slate-50 dark:bg-neutral-800/60 p-3 rounded-lg border border-slate-100 dark:border-neutral-700">
                      "{selectedAmbassador.reasonToJoin || 'No statement provided by applicant.'}"
                    </div>
                  </div>

                  {/* Rejection Note if rejected */}
                  {selectedAmbassador.status === 'rejected' && (
                    <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-800 space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>Administrative Rejection Reason:</span>
                      </div>
                      <p>{selectedAmbassador.rejectionReason || 'Application rejected by administration.'}</p>
                    </div>
                  )}
                </TabsContent>

                {/* Tab 2: Sessions & Earnings Ledger (History to Calculate Payout) */}
                <TabsContent value="history" className="flex-1 overflow-y-auto space-y-4 pt-3 pr-1">
                  {/* Calculation Overview Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700 text-center">
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">Attributed Students</div>
                      <div className="text-base font-bold text-slate-800 dark:text-neutral-100">
                        {selectedAmbassador.metrics?.totalStudentsAttributed || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">Total Gross Revenue</div>
                      <div className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                        ₹{(selectedAmbassador.metrics?.totalGrossRevenueDriven || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">Lifetime 5% Accrued</div>
                      <div className="text-base font-bold text-indigo-700 dark:text-indigo-400">
                        ₹{(selectedAmbassador.metrics?.totalCommissionAccrued || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">Net Unpaid Balance</div>
                      <div className="text-base font-bold text-amber-700 dark:text-amber-400">
                        ₹{(selectedAmbassador.metrics?.unpaidCommissionBalance || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Sessions Ledger Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-neutral-300">
                      <span className="flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                        <span>All Completed Sessions by Attributed Students</span>
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        5% calculated on net realized session price
                      </span>
                    </div>

                    {historyLoading ? (
                      <div className="py-12 text-center text-slate-500">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                        <span>Loading session ledger...</span>
                      </div>
                    ) : historyLedger.length === 0 ? (
                      <div className="py-10 text-center text-slate-500 border border-dashed rounded-xl text-xs">
                        No sessions have been completed yet by students referred by this ambassador.
                      </div>
                    ) : (
                      <div className="border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                        <Table>
                          <TableHeader className="bg-slate-50 dark:bg-neutral-800">
                            <TableRow>
                              <TableHead className="text-xs uppercase font-semibold">Client</TableHead>
                              <TableHead className="text-xs uppercase font-semibold">Session Date</TableHead>
                              <TableHead className="text-xs uppercase font-semibold text-right">
                                Net Session Fee
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
                            {historyLedger.map((entry) => (
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
                </TabsContent>

                {/* Tab 3: Past Payout Settlements */}
                <TabsContent value="payouts" className="flex-1 overflow-y-auto space-y-4 pt-3 pr-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-neutral-300">
                    <span className="flex items-center gap-1.5">
                      <History className="w-4 h-4 text-blue-600" />
                      <span>Disbursed Monthly Payout Receipts</span>
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Lifetime Settled: ₹{(selectedAmbassador.metrics?.totalCommissionPaid || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {historyLoading ? (
                    <div className="py-12 text-center text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                      <span>Loading payout receipts...</span>
                    </div>
                  ) : historyPayouts.length === 0 ? (
                    <div className="py-10 text-center text-slate-500 border border-dashed rounded-xl text-xs">
                      No payouts have been settled yet for this ambassador.
                    </div>
                  ) : (
                    <div className="border border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-50 dark:bg-neutral-800">
                          <TableRow>
                            <TableHead className="text-xs uppercase font-semibold">Period</TableHead>
                            <TableHead className="text-xs uppercase font-semibold text-right">Amount</TableHead>
                            <TableHead className="text-xs uppercase font-semibold">Method</TableHead>
                            <TableHead className="text-xs uppercase font-semibold">Bank / UPI UTR</TableHead>
                            <TableHead className="text-xs uppercase font-semibold">Date Settled</TableHead>
                            <TableHead className="text-xs uppercase font-semibold text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {historyPayouts.map((p) => (
                            <TableRow key={p._id} className="text-xs">
                              <TableCell className="font-semibold text-slate-800 dark:text-neutral-200">
                                {p.payoutPeriod}
                              </TableCell>
                              <TableCell className="text-right font-mono font-bold text-slate-900 dark:text-white">
                                ₹{p.amount?.toLocaleString('en-IN')}
                              </TableCell>
                              <TableCell className="text-slate-600 dark:text-neutral-400">
                                {p.paymentMethod}
                              </TableCell>
                              <TableCell className="font-mono text-slate-800 dark:text-neutral-200">
                                {p.transactionReference}
                              </TableCell>
                              <TableCell className="text-slate-600 dark:text-neutral-400">
                                {dayjs(p.processedAt).format('DD MMM YYYY, hh:mm A')}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                                  {p.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Modal Bottom Footer */}
              <DialogFooter className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between sm:justify-between">
                <div className="text-xs text-slate-500">
                  Application ID:{' '}
                  <span className="font-mono text-[11px] text-slate-700 dark:text-neutral-300">
                    {selectedAmbassador._id}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailsModalOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
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
                    {getAmbassadorUpi(selectedAmbassadorForPayout)}
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
