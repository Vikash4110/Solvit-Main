// components/admin/BookingsManagement.jsx - Complete Production-Grade Component

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Search,
  Eye,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  CreditCard,
  Smartphone,
  Wallet,
  Building2,
  FileWarning,
  TrendingUp,
  Download,
  RefreshCw,
  Copy,
  Check,
  Receipt,
  User,
  UserCheck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Info,
  Hash,
  Activity,
  Layers,
  Shield,
  Video,
} from 'lucide-react';
import dayjs from 'dayjs';

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

// INR Currency Formatter Helper
const formatINR = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '₹0.00';
  return `₹${Number(val).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Name Initials Helper
const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function BookingsManagement() {
  const { getAllBookings, getBookingDetails } = useAdminAuth();

  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBookings: 0,
    limit: 20,
  });

  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    dateFilter: 'all',
    disputeFilter: 'all',
    payoutFilter: 'all',
    paymentMethod: 'all',
    search: '',
  });

  // Modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch bookings
  const fetchBookings = async (page = 1) => {
    setLoading(true);
    try {
      const result = await getAllBookings(
        page,
        pagination.limit,
        filters.status,
        filters.search,
        filters.dateFilter,
        filters.disputeFilter,
        filters.payoutFilter,
        filters.paymentMethod
      );

      if (result.success) {
        setBookings(result.bookings || []);
        setStats(result.stats || {});
        setPagination(
          result.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalBookings: 0,
            limit: 20,
          }
        );
      } else {
        toast.error(result.error || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(1);
  }, [filters]);

  // Get booking details
  const handleViewDetails = async (bookingId) => {
    setLoadingDetails(true);
    try {
      const result = await getBookingDetails(bookingId);

      if (result.success) {
        setSelectedBooking(result.data);
        setShowDetailsModal(true);
      } else {
        toast.error(result.error || 'Failed to fetch booking details');
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to fetch booking details');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Payment method icon
  const getPaymentMethodIcon = (method) => {
    const icons = {
      card: <CreditCard className="h-3.5 w-3.5" />,
      upi: <Smartphone className="h-3.5 w-3.5" />,
      wallet: <Wallet className="h-3.5 w-3.5" />,
      netbanking: <Building2 className="h-3.5 w-3.5" />,
    };
    return icons[method?.toLowerCase()] || <CreditCard className="h-3.5 w-3.5" />;
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    const raw = status?.toLowerCase() || 'confirmed';
    const statusConfig = {
      confirmed: {
        color:
          'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
        icon: CheckCircle2,
        label: 'CONFIRMED',
      },
      completed: {
        color:
          'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        icon: CheckCircle2,
        label: 'COMPLETED',
      },
      cancelled: {
        color:
          'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
        icon: XCircle,
        label: 'CANCELLED',
      },
      disputed: {
        color:
          'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
        icon: AlertCircle,
        label: 'DISPUTED',
      },
      dispute_window_open: {
        color:
          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
        icon: Clock,
        label: 'DISPUTE WINDOW OPEN',
      },
    };

    const config = statusConfig[raw] || statusConfig.confirmed;
    const Icon = config.icon;

    return (
      <Badge
        variant="outline"
        className={`font-semibold text-[11px] px-2 py-0.5 inline-flex items-center gap-1 ${config.color}`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Payout status badge
  const getPayoutBadge = (status) => {
    const raw = status?.toLowerCase() || 'pending';
    const colors = {
      pending:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      released:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      refunded:
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    };

    return (
      <Badge
        variant="outline"
        className={`font-semibold text-[10px] px-2 py-0.5 tracking-wider uppercase ${
          colors[raw] || colors.pending
        }`}
      >
        {status?.toUpperCase() || 'PENDING'}
      </Badge>
    );
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      dateFilter: 'all',
      disputeFilter: 'all',
      payoutFilter: 'all',
      paymentMethod: 'all',
      search: '',
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-neutral-100">
                Bookings Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400">
                Monitor, audit, and manage all client-counselor consultation sessions
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchBookings(pagination.currentPage)}
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
        {/* Total Bookings */}
        <Card className="bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-indigo-950 dark:text-indigo-100 tracking-tight">
              {stats.total?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400/80 mt-0.5">
              All lifetime bookings
            </p>
          </CardContent>
        </Card>

        {/* Confirmed */}
        <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-blue-700 dark:text-blue-400">
              Confirmed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-slate-900 dark:text-neutral-100 tracking-tight">
              {stats.confirmed?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
              Upcoming / in progress
            </p>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-slate-900 dark:text-neutral-100 tracking-tight">
              {stats.completed?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              Successfully conducted
            </p>
          </CardContent>
        </Card>

        {/* Disputed */}
        <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-rose-700 dark:text-rose-400">
              Disputed
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-400 tracking-tight">
              {stats.disputed?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
              Requires arbitration
            </p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 shadow-sm col-span-2 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
              Total Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 tracking-tight">
              {formatINR(stats.totalRevenue || 0)}
            </div>
            {stats.totalRefunded > 0 ? (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-0.5">
                -{formatINR(stats.totalRefunded)} refunded
              </p>
            ) : (
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                Gross booking volume
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Search */}
              <div className="relative sm:col-span-2 lg:col-span-2">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-neutral-500" />
                <Input
                  placeholder="Search client, counselor, email, payment ID..."
                  className="pl-9 h-9 text-xs bg-slate-50/50 dark:bg-neutral-950 border-slate-200 dark:border-neutral-800"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
              </div>

              {/* Status Filter */}
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="h-9 text-xs bg-slate-50/50 dark:bg-neutral-950 border-slate-200 dark:border-neutral-800">
                  <SelectValue placeholder="Booking Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                  <SelectItem value="dispute_window_open">Dispute Window Open</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Select
                value={filters.dateFilter}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, dateFilter: value }))}
              >
                <SelectTrigger className="h-9 text-xs bg-slate-50/50 dark:bg-neutral-950 border-slate-200 dark:border-neutral-800">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                </SelectContent>
              </Select>

              {/* Payment Method Filter */}
              <Select
                value={filters.paymentMethod}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger className="h-9 text-xs bg-slate-50/50 dark:bg-neutral-950 border-slate-200 dark:border-neutral-800">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="netbanking">Netbanking</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>

              {/* Payout Filter */}
              <Select
                value={filters.payoutFilter}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, payoutFilter: value }))}
              >
                <SelectTrigger className="h-9 text-xs bg-slate-50/50 dark:bg-neutral-950 border-slate-200 dark:border-neutral-800">
                  <SelectValue placeholder="Payout Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payouts</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="released">Released</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filters & Active Filter count */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-500 dark:text-neutral-400">
                Showing {bookings.length} of {pagination.totalBookings || 0} bookings
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-neutral-100"
                onClick={handleResetFilters}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table Card */}
      <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
        <CardHeader className="py-4 px-5 border-b border-slate-100 dark:border-neutral-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-neutral-100">
              All Bookings ({pagination.totalBookings || 0})
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              Comprehensive registry of client bookings, session status, and payouts
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 dark:bg-neutral-950/60 hover:bg-slate-50/70 border-b border-slate-200/70 dark:border-neutral-800 text-xs">
                  <TableHead className="w-[120px] font-bold text-slate-600 dark:text-neutral-400">BOOKING ID</TableHead>
                  <TableHead className="font-bold text-slate-600 dark:text-neutral-400">CLIENT</TableHead>
                  <TableHead className="font-bold text-slate-600 dark:text-neutral-400">COUNSELOR</TableHead>
                  <TableHead className="font-bold text-slate-600 dark:text-neutral-400">SESSION TIME</TableHead>
                  <TableHead className="font-bold text-slate-600 dark:text-neutral-400">PAYMENT</TableHead>
                  <TableHead className="font-bold text-slate-600 dark:text-neutral-400">STATUS</TableHead>
                  <TableHead className="font-bold text-slate-600 dark:text-neutral-400">PAYOUT</TableHead>
                  <TableHead className="font-bold text-slate-600 dark:text-neutral-400">AMOUNT</TableHead>
                  <TableHead className="font-bold text-slate-600 dark:text-neutral-400">CREATED</TableHead>
                  <TableHead className="text-right font-bold text-slate-600 dark:text-neutral-400">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-neutral-400">
                        <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
                        <span className="text-sm font-medium">Loading bookings data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-neutral-500">
                        <Calendar className="h-10 w-10 stroke-[1.5] text-slate-300 dark:text-neutral-700" />
                        <p className="text-sm font-semibold text-slate-600 dark:text-neutral-300">
                          No bookings found
                        </p>
                        <p className="text-xs">Try adjusting your filters or search terms</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow
                      key={booking._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 border-b border-slate-100 dark:border-neutral-800/80 transition-colors"
                    >
                      {/* Booking ID */}
                      <TableCell>
                        <div
                          onClick={() => {
                            navigator.clipboard.writeText(booking._id);
                            toast.success('Booking ID copied');
                          }}
                          className="group inline-flex items-center gap-1 font-mono text-xs text-slate-700 dark:text-neutral-300 bg-slate-100 dark:bg-neutral-800 px-2 py-1 rounded cursor-pointer hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
                          title="Click to copy full ID"
                        >
                          <span>#{booking._id.slice(-6)}</span>
                          <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
                        </div>
                      </TableCell>

                      {/* Client */}
                      <TableCell>
                        <div className="flex items-center gap-2.5 min-w-[150px]">
                          <Avatar className="h-8 w-8 border border-slate-200 dark:border-neutral-700">
                            {booking.clientId?.profilePicture && (
                              <AvatarImage
                                src={booking.clientId.profilePicture}
                                alt={booking.clientId.fullName}
                              />
                            )}
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[11px] font-bold">
                              {getInitials(booking.clientId?.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-slate-900 dark:text-neutral-100 truncate">
                              {booking.clientId?.fullName || 'N/A'}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                              @{booking.clientId?.username || 'user'}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Counselor */}
                      <TableCell>
                        <div className="flex items-center gap-2.5 min-w-[160px]">
                          <Avatar className="h-8 w-8 border border-slate-200 dark:border-neutral-700">
                            {booking.slotId?.counselorId?.profilePicture && (
                              <AvatarImage
                                src={booking.slotId.counselorId.profilePicture}
                                alt={booking.slotId.counselorId.fullName}
                              />
                            )}
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[11px] font-bold">
                              {getInitials(booking.slotId?.counselorId?.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-slate-900 dark:text-neutral-100 truncate">
                              {booking.slotId?.counselorId?.fullName || 'Unassigned'}
                            </p>
                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 truncate">
                              {booking.slotId?.counselorId?.specialization?.[0] || 'Counseling'}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Session Time */}
                      <TableCell>
                        <div className="text-xs min-w-[140px]">
                          <p className="font-medium text-slate-900 dark:text-neutral-200">
                            {booking.slotId?.startTime
                              ? dayjs(booking.slotId.startTime).format('MMM DD, YYYY')
                              : 'N/A'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                            {booking.slotId?.startTime && booking.slotId?.endTime
                              ? `${dayjs(booking.slotId.startTime).format('hh:mm A')} - ${dayjs(
                                  booking.slotId.endTime
                                ).format('hh:mm A')}`
                              : 'N/A'}
                          </p>
                        </div>
                      </TableCell>

                      {/* Payment Method */}
                      <TableCell>
                        {booking.paymentId?.method ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-neutral-800 text-xs font-medium text-slate-700 dark:text-neutral-300 capitalize">
                            {getPaymentMethodIcon(booking.paymentId.method)}
                            <span>{booking.paymentId.method}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>

                      {/* Payout */}
                      <TableCell>{getPayoutBadge(booking.payout?.status)}</TableCell>

                      {/* Amount */}
                      <TableCell>
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-neutral-100">
                            {formatINR(booking.paymentId?.amount || 0)}
                          </p>
                          {booking.platformFee > 0 && (
                            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                              Fee: {formatINR(booking.platformFee)}
                            </p>
                          )}
                          {booking.dispute?.isDisputed && (
                            <Badge
                              variant="destructive"
                              className="mt-0.5 text-[9px] px-1 py-0 font-bold"
                            >
                              Disputed
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Created */}
                      <TableCell className="text-xs text-slate-500 dark:text-neutral-400 whitespace-nowrap">
                        {dayjs(booking.createdAt).format('MMM DD, YYYY')}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2.5 text-xs font-semibold bg-white hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-200 border-slate-200 dark:border-neutral-700 shadow-sm"
                          onClick={() => handleViewDetails(booking._id)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1 text-slate-500" />
                          View
                        </Button>
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
                <span className="font-bold text-slate-700 dark:text-neutral-200">{pagination.totalBookings}</span> bookings
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-medium"
                  disabled={pagination.currentPage === 1 || loading}
                  onClick={() => fetchBookings(pagination.currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-medium"
                  disabled={pagination.currentPage === pagination.totalPages || loading}
                  onClick={() => fetchBookings(pagination.currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comprehensive Booking Details Modal */}
      {selectedBooking && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent
            size="xl"
            className="w-[96vw] sm:w-[92vw] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl max-h-[94vh] sm:max-h-[90vh] p-0 flex flex-col overflow-hidden bg-slate-50/90 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 shadow-2xl rounded-2xl"
          >
            {/* Modal Header */}
            <DialogHeader className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-2">
                      Comprehensive Booking Details
                    </DialogTitle>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                      Booked on{' '}
                      {selectedBooking.createdAt
                        ? dayjs(selectedBooking.createdAt).format('MMM DD, YYYY • hh:mm A')
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(selectedBooking.status)}
                  {getPayoutBadge(selectedBooking.payout?.status)}
                  {selectedBooking.dispute?.isDisputed && (
                    <Badge variant="destructive" className="text-xs px-2 py-0.5 font-bold">
                      <FileWarning className="h-3 w-3 mr-1" />
                      Disputed
                    </Badge>
                  )}
                </div>
              </div>
            </DialogHeader>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-5 space-y-4 sm:space-y-5">
              {/* 1. Quick Financial & Booking Metric Summary (Hero Cards) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
                {/* Total Paid */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 shadow-sm col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                      Total Paid
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                      INR
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-2 tracking-tight">
                    {formatINR(selectedBooking.paymentId?.amount || 0)}
                  </p>
                  <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/70 mt-0.5">
                    Client Gross Paid
                  </p>
                </div>

                {/* Counselor Base */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm">
                  <span className="text-xs font-semibold text-slate-600 dark:text-neutral-400">
                    Counselor Base
                  </span>
                  <p className="text-xl font-bold text-slate-900 dark:text-neutral-100 mt-2">
                    {formatINR(selectedBooking.slotId?.basePrice || 0)}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-500 mt-0.5">
                    Counselor Rate
                  </p>
                </div>

                {/* Solvit Platform Fee */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    Solvit Fee
                  </span>
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-2">
                    {formatINR(
                      selectedBooking.calculated?.platformFee ??
                        (selectedBooking.paymentId?.amount && selectedBooking.slotId?.basePrice
                          ? selectedBooking.paymentId.amount - selectedBooking.slotId.basePrice
                          : 0)
                    )}
                  </p>
                  <p className="text-[11px] text-blue-600/80 dark:text-blue-400/70 mt-0.5">
                    Platform Revenue
                  </p>
                </div>

                {/* Net Settlement */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm">
                  <span className="text-xs font-semibold text-slate-600 dark:text-neutral-400">
                    Net Received
                  </span>
                  <p className="text-xl font-bold text-slate-900 dark:text-neutral-100 mt-2">
                    {formatINR(
                      selectedBooking.calculated?.netAmountAfterRazorpayFee ??
                        selectedBooking.paymentId?.netAmount ??
                        (selectedBooking.paymentId?.amount || 0) - (selectedBooking.paymentId?.fee || 0)
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-500 mt-0.5">
                    Post Gateway Fee
                  </p>
                </div>

                {/* Payout Status */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 shadow-sm col-span-2 sm:col-span-2 lg:col-span-1">
                  <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                    Counselor Payout
                  </span>
                  <p className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mt-2">
                    {formatINR(
                      selectedBooking.payout?.amountToPayToCounselor ??
                        selectedBooking.slotId?.basePrice ??
                        0
                    )}
                  </p>
                  <p className="text-[11px] text-indigo-600/80 dark:text-indigo-400/70 mt-0.5 capitalize">
                    Status: {selectedBooking.payout?.status || 'Pending'}
                  </p>
                </div>
              </div>

              {/* 2. Core Identifiers Card */}
              <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
                <CardHeader className="py-3.5 px-5 border-b border-slate-100 dark:border-neutral-800">
                  <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    Booking & Transaction Identifiers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <CopyableField
                      label="Database Booking ID"
                      value={selectedBooking._id}
                    />
                    <CopyableField
                      label="Razorpay Payment ID"
                      value={selectedBooking.paymentId?.razorpay_payment_id || selectedBooking.paymentId?._id}
                    />
                    <CopyableField
                      label="Session Slot ID"
                      value={selectedBooking.slotId?._id}
                    />
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                        Booking Status
                      </p>
                      <div className="pt-0.5">
                        {getStatusBadge(selectedBooking.status)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                        Payout Status
                      </p>
                      <div className="pt-0.5">
                        {getPayoutBadge(selectedBooking.payout?.status)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                        Payment Method
                      </p>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-neutral-200 capitalize mt-1">
                        {getPaymentMethodIcon(selectedBooking.paymentId?.method)}
                        <span>{selectedBooking.paymentId?.method || 'Online'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Client & Counselor Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Info Card */}
                <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-start">
                  <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-neutral-800">
                    <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      Client Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3.5 flex-1 flex flex-col justify-start">
                    <div className="flex items-center gap-3">
                      <Avatar size="lg" className="h-11 w-11 border border-slate-200 dark:border-neutral-700">
                        {selectedBooking.clientId?.profilePicture && (
                          <AvatarImage
                            src={selectedBooking.clientId.profilePicture}
                            alt={selectedBooking.clientId?.fullName || 'Client'}
                          />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-sm">
                          {getInitials(selectedBooking.clientId?.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-slate-900 dark:text-neutral-100 truncate">
                          {selectedBooking.clientId?.fullName || 'N/A'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200">
                            @{selectedBooking.clientId?.username || 'client'}
                          </Badge>
                          {selectedBooking.clientId?.email && (
                            <span className="text-xs text-slate-500 dark:text-neutral-400 truncate">
                              {selectedBooking.clientId.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <CopyableField
                        label="Client Database ID"
                        value={selectedBooking.clientId?._id}
                        truncate
                      />
                      {selectedBooking.clientId?.phone ? (
                        <CopyableField
                          label="Phone / Mobile"
                          value={selectedBooking.clientId.phone}
                        />
                      ) : (
                        <div>
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400 mb-1">Phone</p>
                          <span className="text-xs text-slate-400">Not provided</span>
                        </div>
                      )}
                    </div>

                    {/* Client Additional Details */}
                    <div className="mt-2 pt-3 border-t border-slate-100 dark:border-neutral-800 space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        Client Profile & Verification
                      </span>
                      <div className="p-2.5 rounded-lg bg-slate-50/70 dark:bg-neutral-950/40 border border-slate-200/60 dark:border-neutral-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-neutral-400">Account Status:</span>
                          <Badge
                            variant={selectedBooking.clientId?.isBlocked ? 'destructive' : 'success'}
                            className="text-[10px] px-2 py-0"
                          >
                            {selectedBooking.clientId?.isBlocked ? 'Blocked' : 'Active Client'}
                          </Badge>
                        </div>
                        {selectedBooking.clientId?.gender && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-neutral-400">Gender:</span>
                            <span className="font-medium text-slate-800 dark:text-neutral-200 capitalize">
                              {selectedBooking.clientId.gender}
                            </span>
                          </div>
                        )}
                        {selectedBooking.clientId?.preferredLanguages?.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-neutral-400">Languages:</span>
                            <span className="font-medium text-slate-800 dark:text-neutral-200">
                              {selectedBooking.clientId.preferredLanguages.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Counselor Info & Direct Bank Payout Details Card */}
                <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
                  <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                        <UserCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        Counselor & Bank Payout Details
                      </CardTitle>
                      {selectedBooking.slotId?.basePrice && (
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-bold border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                          Share: {formatINR(selectedBooking.slotId.basePrice)}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar size="lg" className="h-11 w-11 border border-slate-200 dark:border-neutral-700">
                        {selectedBooking.slotId?.counselorId?.profilePicture && (
                          <AvatarImage
                            src={selectedBooking.slotId.counselorId.profilePicture}
                            alt={selectedBooking.slotId?.counselorId?.fullName || 'Counselor'}
                          />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-sm">
                          {getInitials(selectedBooking.slotId?.counselorId?.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-slate-900 dark:text-neutral-100 truncate">
                          {selectedBooking.slotId?.counselorId?.fullName || 'Unassigned / N/A'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200">
                            {selectedBooking.slotId?.counselorId?.experienceLevel || 'Counselor'}
                          </Badge>
                          {selectedBooking.slotId?.counselorId?.email && (
                            <span className="text-xs text-slate-500 dark:text-neutral-400 truncate">
                              {selectedBooking.slotId.counselorId.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <CopyableField
                        label="Counselor ID"
                        value={selectedBooking.slotId?.counselorId?._id}
                        truncate
                      />
                      {selectedBooking.slotId?.counselorId?.phone ? (
                        <CopyableField
                          label="Phone / Mobile"
                          value={selectedBooking.slotId.counselorId.phone}
                        />
                      ) : (
                        <div>
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400 mb-1">Phone</p>
                          <span className="text-xs text-slate-400">Not provided</span>
                        </div>
                      )}
                    </div>

                    {/* Counselor Bank Account & Payout Box */}
                    <div className="mt-2 pt-3 border-t border-slate-100 dark:border-neutral-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          Direct Payout Bank Account
                        </span>
                        {(selectedBooking.slotId?.counselorId?.application?.bankDetails?.accountNo ||
                          selectedBooking.slotId?.counselorId?.bankDetails?.accountNo ||
                          selectedBooking.payout?.counselorBankDetails?.accountNo) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-5 px-1.5 py-0 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60 border-indigo-200/60 dark:border-indigo-800/60 whitespace-nowrap shrink-0 flex items-center gap-1 shadow-none transition-all"
                            onClick={() => {
                              const counselor = selectedBooking.slotId?.counselorId;
                              const bank =
                                counselor?.application?.bankDetails ||
                                counselor?.bankDetails ||
                                selectedBooking.payout?.counselorBankDetails ||
                                {};
                              const bankText = `Beneficiary Name: ${counselor?.fullName || 'N/A'}\nAccount Number: ${bank.accountNo || 'N/A'}\nIFSC Code: ${bank.ifscCode || 'N/A'}\nBranch Name: ${bank.branchName || 'N/A'}\nPayout Share: ₹${selectedBooking.slotId?.basePrice || 0}`;
                              navigator.clipboard.writeText(bankText);
                              toast.success('Counselor bank & payout details copied to clipboard');
                            }}
                          >
                            <Copy className="h-2.5 w-2.5 shrink-0" />
                            <span>Copy All Details</span>
                          </Button>
                        )}
                      </div>

                      {/* Bank Details Content */}
                      {selectedBooking.slotId?.counselorId?.application?.bankDetails?.accountNo ||
                      selectedBooking.slotId?.counselorId?.bankDetails?.accountNo ||
                      selectedBooking.payout?.counselorBankDetails?.accountNo ? (
                        (() => {
                          const bank =
                            selectedBooking.slotId?.counselorId?.application?.bankDetails ||
                            selectedBooking.slotId?.counselorId?.bankDetails ||
                            selectedBooking.payout?.counselorBankDetails ||
                            {};
                          const isRefunded =
                            selectedBooking.paymentId?.amount_refunded > 0 ||
                            selectedBooking.paymentId?.refund_status === 'full' ||
                            selectedBooking.paymentId?.refund_status === 'partial' ||
                            selectedBooking.payout?.status === 'refunded';
                          const isDisputed = selectedBooking.dispute?.isDisputed;
                          const isCancelled = selectedBooking.status === 'cancelled';

                          return (
                            <div className="p-2.5 rounded-lg bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <CopyableField
                                  label="Bank Account No."
                                  value={bank.accountNo}
                                />
                                <CopyableField
                                  label="IFSC Code"
                                  value={bank.ifscCode}
                                />
                              </div>
                              {bank.branchName && (
                                <div className="flex items-center justify-between text-xs pt-1 border-t border-indigo-100/70 dark:border-indigo-900/30">
                                  <span className="text-slate-500 dark:text-neutral-400">Branch Name:</span>
                                  <span className="font-medium text-slate-800 dark:text-neutral-200">
                                    {bank.branchName}
                                  </span>
                                </div>
                              )}

                              {/* Payout Readiness Status Notice */}
                              <div className="pt-1.5 border-t border-indigo-100/70 dark:border-indigo-900/30">
                                {isDisputed ? (
                                  <div className="flex items-center gap-1.5 text-[11px] text-rose-700 dark:text-rose-300 font-medium bg-rose-100/60 dark:bg-rose-950/40 px-2 py-1 rounded">
                                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                                    <span>Hold: Booking is under active dispute.</span>
                                  </div>
                                ) : isRefunded ? (
                                  <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 font-medium bg-amber-100/60 dark:bg-amber-950/40 px-2 py-1 rounded">
                                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                                    <span>Payment was refunded/reimbursed to client.</span>
                                  </div>
                                ) : isCancelled ? (
                                  <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 font-medium bg-amber-100/60 dark:bg-amber-950/40 px-2 py-1 rounded">
                                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                                    <span>Booking was cancelled. Check session policy.</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-100/60 dark:bg-emerald-950/40 px-2 py-1 rounded">
                                    <span className="flex items-center gap-1.5">
                                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                      Ready for Direct Payout Transfer
                                    </span>
                                    <span className="font-bold">
                                      {formatINR(selectedBooking.slotId?.basePrice || 0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-neutral-800/50 border border-slate-200/60 dark:border-neutral-700/60 flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400">
                          <Info className="h-4 w-4 text-slate-400 shrink-0" />
                          <span>Bank account details not submitted yet in counselor profile.</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 4. Session & Consultation Slot Details */}
              <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
                <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-neutral-800">
                  <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    Session Schedule & Slot Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                        Scheduled Start
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-neutral-200 font-medium">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {selectedBooking.slotId?.startTime
                          ? dayjs(selectedBooking.slotId.startTime).format('MMM DD, YYYY • hh:mm A')
                          : 'N/A'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                        Scheduled End
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-neutral-200 font-medium">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {selectedBooking.slotId?.endTime
                          ? dayjs(selectedBooking.slotId.endTime).format('MMM DD, YYYY • hh:mm A')
                          : 'N/A'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                        Duration
                      </p>
                      <p className="text-xs font-bold text-slate-900 dark:text-neutral-100">
                        {selectedBooking.slotId?.startTime && selectedBooking.slotId?.endTime
                          ? `${dayjs(selectedBooking.slotId.endTime).diff(
                              dayjs(selectedBooking.slotId.startTime),
                              'minute'
                            )} mins`
                          : 'N/A'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                        Slot Status
                      </p>
                      <Badge variant="outline" className="capitalize text-xs">
                        {selectedBooking.slotId?.status || 'Active'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 5. Complete Itemized Financial Breakdown / Receipt */}
              <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
                <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                      <Receipt className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      Financial Breakdown & Settlement Summary
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] font-mono border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/30">
                      INR (₹)
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* 1. Client Payment Stage */}
                    <div className="p-4 rounded-xl border border-slate-200/80 dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-950/40 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/60 dark:border-neutral-800">
                          <span className="font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider text-[11px]">
                            1. Client Charge
                          </span>
                          <span className="text-[10px] text-slate-400">Gross</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600 dark:text-neutral-400">
                          <span>Counselor Rate:</span>
                          <span className="font-medium text-slate-900 dark:text-neutral-200">
                            {formatINR(selectedBooking.slotId?.basePrice || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400">
                          <span>Solvit Platform Fee:</span>
                          <span className="font-medium">
                            +{formatINR(
                              selectedBooking.calculated?.platformFee ??
                                (selectedBooking.paymentId?.amount && selectedBooking.slotId?.basePrice
                                  ? selectedBooking.paymentId.amount - selectedBooking.slotId.basePrice
                                  : 0)
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="pt-3 mt-3 border-t border-slate-200 dark:border-neutral-800 flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-900 dark:text-neutral-100">Total Charged:</span>
                        <span className="text-base font-bold text-slate-900 dark:text-neutral-100">
                          {formatINR(selectedBooking.paymentId?.amount || 0)}
                        </span>
                      </div>
                    </div>

                    {/* 2. Gateway Deductions Stage */}
                    <div className="p-4 rounded-xl border border-orange-200/70 dark:border-orange-900/40 bg-orange-50/30 dark:bg-orange-950/20 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-orange-200/60 dark:border-orange-900/40">
                          <span className="font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider text-[11px]">
                            2. Gateway Cost
                          </span>
                          <span className="text-[10px] text-orange-600/70 dark:text-orange-400/70">Razorpay</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600 dark:text-neutral-400">
                          <span>Base Gateway Fee:</span>
                          <span className="font-mono text-red-600 dark:text-red-400">
                            -{formatINR(
                              ((selectedBooking.paymentId?.fee || 0) - (selectedBooking.paymentId?.tax || 0)) > 0
                                ? (selectedBooking.paymentId?.fee || 0) - (selectedBooking.paymentId?.tax || 0)
                                : (selectedBooking.paymentId?.fee || 0)
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600 dark:text-neutral-400">
                          <span>GST on Fee (18%):</span>
                          <span className="font-mono text-red-600 dark:text-red-400">
                            -{formatINR(selectedBooking.paymentId?.tax || 0)}
                          </span>
                        </div>
                      </div>
                      <div className="pt-3 mt-3 border-t border-orange-200/60 dark:border-orange-900/40 flex justify-between items-baseline">
                        <span className="text-xs font-bold text-orange-900 dark:text-orange-200">Total Gateway Fee:</span>
                        <span className="text-sm font-bold font-mono text-red-600 dark:text-red-400">
                          -{formatINR(selectedBooking.paymentId?.fee || 0)}
                        </span>
                      </div>
                    </div>

                    {/* 3. Net Settlement & Distribution Stage */}
                    <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-emerald-200/60 dark:border-emerald-900/40">
                          <span className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-[11px]">
                            3. Net Distribution
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Net Payouts</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600 dark:text-neutral-400">
                          <span>Counselor Payout Share:</span>
                          <span className="font-bold text-slate-900 dark:text-neutral-200">
                            {formatINR(selectedBooking.slotId?.basePrice || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600 dark:text-neutral-400">
                          <span>Solvit Net Margin:</span>
                          <span className="font-medium text-blue-700 dark:text-blue-400">
                            {formatINR(
                              Math.max(
                                0,
                                (selectedBooking.calculated?.platformFee ||
                                  (selectedBooking.paymentId?.amount || 0) -
                                    (selectedBooking.slotId?.basePrice || 0)) -
                                  (selectedBooking.paymentId?.fee || 0)
                              )
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="pt-3 mt-3 border-t border-emerald-200/60 dark:border-emerald-900/40 flex justify-between items-baseline">
                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Net Received:</span>
                        <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                          {formatINR(
                            selectedBooking.calculated?.netAmountAfterRazorpayFee ??
                              selectedBooking.paymentId?.netAmount ??
                              (selectedBooking.paymentId?.amount || 0) - (selectedBooking.paymentId?.fee || 0)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* If Refund Exists */}
                  {selectedBooking.paymentId?.amount_refunded > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200 text-xs">
                      <div className="flex items-center gap-2.5">
                        <RotateCcw className="h-4 w-4 text-amber-600 shrink-0" />
                        <div>
                          <span className="font-bold uppercase tracking-wider">Refund Processed:</span>
                          <span className="ml-2 font-bold text-sm">
                            -{formatINR(selectedBooking.paymentId.amount_refunded)}
                          </span>
                        </div>
                      </div>
                      <div>
                        Remaining Net Balance:{' '}
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                          {formatINR(
                            (selectedBooking.paymentId?.netAmount || 0) -
                              (selectedBooking.paymentId?.amount_refunded || 0)
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 6. Dispute Information Card (If Disputed or Window Open) */}
              {(selectedBooking.dispute?.isDisputed || selectedBooking.status === 'disputed' || selectedBooking.status === 'dispute_window_open') && (
                <Card className="border-rose-300 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 shadow-sm">
                  <CardHeader className="py-3 px-5 border-b border-rose-200/70 dark:border-rose-900/40">
                    <CardTitle className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider flex items-center gap-2">
                      <FileWarning className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                      Dispute & Arbitration Record
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-slate-500 dark:text-neutral-400 font-semibold mb-1">Dispute State</p>
                        <Badge variant="destructive" className="text-xs">
                          {selectedBooking.dispute?.isDisputed ? 'ACTIVE DISPUTE' : 'DISPUTE WINDOW OPEN'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-neutral-400 font-semibold mb-1">Dispute Status</p>
                        <Badge variant="outline" className="text-xs font-mono uppercase">
                          {selectedBooking.dispute?.status || 'UNDER REVIEW'}
                        </Badge>
                      </div>
                      {selectedBooking.dispute?.reason && (
                        <div>
                          <p className="text-slate-500 dark:text-neutral-400 font-semibold mb-1">Reason</p>
                          <p className="font-medium text-slate-800 dark:text-neutral-200">
                            {selectedBooking.dispute.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 7. Refund History Records (If Any) */}
              {selectedBooking.refunds && selectedBooking.refunds.length > 0 && (
                <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
                  <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-neutral-800">
                    <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                      <RotateCcw className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      Refund Audits ({selectedBooking.refunds.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-3">
                    <div className="space-y-3">
                      {selectedBooking.refunds.map((refund, idx) => (
                        <div
                          key={refund._id || idx}
                          className="p-3.5 rounded-xl border border-slate-200/80 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-950/50 space-y-2.5"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                            <CopyableField
                              label="Refund ID"
                              value={refund.razorpay_refund_id || refund._id}
                            />
                            <div>
                              <p className="text-slate-500 dark:text-neutral-400 font-semibold mb-1">
                                Refund Amount
                              </p>
                              <p className="text-sm font-bold text-red-600 dark:text-red-400">
                                {formatINR(refund.amount || 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 dark:text-neutral-400 font-semibold mb-1">
                                Reason
                              </p>
                              <p className="font-medium text-slate-700 dark:text-neutral-300 capitalize">
                                {refund.reason?.replace(/_/g, ' ') || 'Customer Request'}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 dark:text-neutral-400 font-semibold mb-1">
                                Status
                              </p>
                              <Badge
                                variant={refund.status === 'processed' ? 'success' : 'destructive'}
                                className="text-[11px]"
                              >
                                {refund.status?.toUpperCase() || 'PROCESSED'}
                              </Badge>
                            </div>
                          </div>
                          {refund.createdAt && (
                            <p className="text-[11px] text-slate-400 dark:text-neutral-500 pt-1 border-t border-slate-200/60 dark:border-neutral-800">
                              Processed on {dayjs(refund.createdAt).format('MMM DD, YYYY • hh:mm A')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Modal Footer */}
            <DialogFooter className="px-6 py-3 border-t border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-shrink-0 flex items-center justify-between sm:justify-between">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 text-slate-600 dark:text-neutral-300"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedBooking, null, 2));
                  toast.success('Complete booking JSON copied to clipboard');
                }}
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy Full Data (JSON)
              </Button>
              <Button
                variant="default"
                size="sm"
                className="text-xs h-8 px-5 font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
