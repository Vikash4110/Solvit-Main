// components/admin/PaymentManagement.jsx

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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DollarSign,
  Search,
  Eye,
  CreditCard,
  Smartphone,
  Wallet,
  Building2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  Receipt,
  User,
  UserCheck,
  ShieldCheck,
  FileText,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Info,
  BadgePercent,
  Hash,
  Activity,
  Layers,
  Shield,
} from 'lucide-react';
import dayjs from 'dayjs';

// Helper component for clean, copyable metadata fields
function CopyableField({ label, value, mono = true, truncate = false, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (value === undefined || value === null || value === '') return;
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    toast.success(`${label || 'Value'} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAvailable = value !== undefined && value !== null && value !== '';
  const displayValue = isAvailable ? String(value) : 'N/A';

  return (
    <div className={`min-w-0 ${className}`}>
      {label && (
        <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
          {label}
        </p>
      )}
      <div className="flex items-center justify-between gap-1.5 bg-slate-50 hover:bg-slate-100/90 dark:bg-neutral-900/90 dark:hover:bg-neutral-900 px-2.5 py-1.5 rounded-lg border border-slate-200/80 dark:border-neutral-800 transition-colors group">
        <span
          className={`text-xs select-all text-slate-800 dark:text-neutral-200 ${
            mono ? 'font-mono' : ''
          } ${truncate ? 'truncate' : 'break-all'} min-w-0 flex-1`}
          title={isAvailable ? String(value) : undefined}
        >
          {displayValue}
        </span>
        {isAvailable && (
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-neutral-800 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-primary-500"
            title={`Copy ${label || ''}`}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// Currency formatter
const formatINR = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

// Avatar initials helper
const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function PaymentManagement() {
  const { getAllPayments, getPaymentDetails } = useAdminAuth();

  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingPaymentId, setLoadingPaymentId] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPayments: 0,
    limit: 20,
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    dateFilter: 'all',
    methodFilter: 'all_methods',
    statusFilter: 'all_statuses',
    refundFilter: 'all_refunds',
    bookingStatusFilter: 'all_booking_statuses',
  });

  // Modal state
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch payments
  const fetchPayments = async (page = 1) => {
    setLoading(true);
    try {
      const result = await getAllPayments(
        page,
        pagination.limit,
        filters.search,
        filters.dateFilter,
        filters.methodFilter,
        filters.statusFilter,
        filters.refundFilter,
        filters.bookingStatusFilter
      );

      if (result.success) {
        setPayments(result.data.payments);
        setStats(result.data.stats);
        setPagination(result.data.pagination);
      } else {
        toast.error(result.error || 'Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, [filters]);

  // Get payment details
  const handleViewDetails = async (paymentId) => {
    try {
      setLoadingPaymentId(paymentId);
      const result = await getPaymentDetails(paymentId);

      if (result.success) {
        setSelectedPayment(result.data);
        setShowDetailsModal(true);
      } else {
        toast.error(result.error || 'Failed to fetch payment details');
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      toast.error('Failed to fetch payment details');
    } finally {
      setLoadingPaymentId(null);
    }
  };

  // Payment method icon
  const getPaymentMethodIcon = (method) => {
    const icons = {
      card: <CreditCard className="h-4 w-4" />,
      upi: <Smartphone className="h-4 w-4" />,
      wallet: <Wallet className="h-4 w-4" />,
      netbanking: <Building2 className="h-4 w-4" />,
      emi: <CreditCard className="h-4 w-4" />,
      cardless_emi: <CreditCard className="h-4 w-4" />,
      paylater: <CreditCard className="h-4 w-4" />,
    };
    return icons[method] || <CreditCard className="h-4 w-4" />;
  };

  // Status badge
  const getStatusBadge = (status) => {
    const config = {
      captured: {
        color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
        icon: CheckCircle2,
      },
      authorized: {
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
        icon: CheckCircle2,
      },
      created: {
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
        icon: Clock,
      },
      failed: {
        color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
        icon: XCircle,
      },
      captured_unlinked: {
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
        icon: AlertCircle,
      },
    };

    const statusConfig = config[status] || config.created;
    const Icon = statusConfig.icon;

    return (
      <Badge className={statusConfig.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status?.toUpperCase()}
      </Badge>
    );
  };

  // Booking status badge
  const getBookingStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-blue-100 text-blue-800',
      payment_captured: 'bg-purple-100 text-purple-800',
      pending_resources: 'bg-orange-100 text-orange-800',
    };

    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
        {status?.toUpperCase().replace(/_/g, ' ')}
      </Badge>
    );
  };

  // Refund status badge
  const getRefundBadge = (refundStatus) => {
    if (!refundStatus) {
      return <Badge variant="outline">No Refund</Badge>;
    }

    const colors = {
      partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
      full: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    };

    return (
      <Badge className={colors[refundStatus] || 'bg-gray-100 text-gray-800'}>
        {refundStatus?.toUpperCase()} REFUND
      </Badge>
    );
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      dateFilter: 'all',
      methodFilter: 'all_methods',
      statusFilter: 'all_statuses',
      refundFilter: 'all_refunds',
      bookingStatusFilter: 'all_booking_statuses',
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="text-muted-foreground">Monitor all transactions, refunds, and revenue</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchPayments(pagination.currentPage)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {/* <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button> */}
        </div>
      </div>

      {/* Stats Cards
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPayments || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{stats.totalRevenue?.toLocaleString('en-IN') || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₹{stats.platformRevenue?.toLocaleString('en-IN') || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{stats.totalRefunded?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stats.refundCount || 0} refunds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ₹{stats.todayRevenue?.toLocaleString('en-IN') || 0}
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Filters */}
      {/* <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              {/* <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  className="pl-9"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
              </div> */} 

              {/* Date Filter */}
              {/* <Select
                value={filters.dateFilter}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, dateFilter: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                  <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                </SelectContent>
              </Select> */}

              {/* Payment Method Filter */}
              {/* <Select
                value={filters.methodFilter}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, methodFilter: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_methods">All Methods</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="netbanking">Netbanking</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                  <SelectItem value="emi">EMI</SelectItem>
                  <SelectItem value="cardless_emi">Cardless EMI</SelectItem>
                  <SelectItem value="paylater">Pay Later</SelectItem>
                </SelectContent>
              </Select> */}

              {/* Status Filter */}
              {/* <Select
                value={filters.statusFilter}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, statusFilter: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_statuses">All Status</SelectItem>
                  <SelectItem value="captured">Captured</SelectItem>
                  <SelectItem value="authorized">Authorized</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="captured_unlinked">Captured Unlinked</SelectItem>
                </SelectContent>
              </Select> */}

              {/* Refund Filter */}
              {/* <Select
                value={filters.refundFilter}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, refundFilter: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Refund Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_refunds">All Refunds</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="no_refund">No Refund</SelectItem>
                  <SelectItem value="partial">Partial Refund</SelectItem>
                  <SelectItem value="full">Full Refund</SelectItem>
                </SelectContent>
              </Select> */}

              {/* Booking Status Filter */}
              {/* <Select
                value={filters.bookingStatusFilter}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, bookingStatusFilter: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Booking Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_booking_statuses">All Bookings</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="payment_captured">Payment Captured</SelectItem>
                  <SelectItem value="pending_resources">Pending Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Payment Method Breakdown */}
      {/* {stats.methodBreakdown && stats.methodBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Payment Method Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {stats.methodBreakdown.map((method, idx) => (
                <div key={idx} className="flex flex-col items-center p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getPaymentMethodIcon(method._id)}
                    <span className="text-xs font-medium capitalize">{method._id}</span>
                  </div>
                  <p className="text-lg font-bold">
                    ₹{method.totalAmount?.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-muted-foreground">{method.count} transactions</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )} 

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payments ({pagination.totalPayments})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID (Database)</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Counselor</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount Recieved</TableHead>
                 
                  <TableHead>Status</TableHead>
                 
                  <TableHead>Refund</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Loading payments...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-12 w-12 opacity-50" />
                        <p>No payments found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell className="font-mono text-xs">
                        {payment._id?.slice(-12)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                         
                          <div>
                            <p className="font-medium text-sm">
                              {payment.clientId?.fullName || 'N/A'}
                            </p>
                            
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">
                            {payment.slotId?.counselorId?.fullName || 'N/A'}
                          </p>
                         
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs">
                          {getPaymentMethodIcon(payment.method)}
                          <span className="capitalize">{payment.method}</span>
                        </div>
                        {payment.bank && (
                          <p className="text-xs text-muted-foreground mt-1">{payment.bank}</p>
                        )}
                        {payment.wallet && (
                          <p className="text-xs text-muted-foreground mt-1 capitalize">
                            {payment.wallet}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold">₹{payment.amount?.toLocaleString('en-IN')}</p>
                      </TableCell>
                     
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      
                      <TableCell>
                        {getRefundBadge(payment.refund_status)}
                        
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {dayjs(payment.createdAt).format('MMM DD, YYYY')}
                        <p className="text-xs">{dayjs(payment.createdAt).format('hh:mm A')}</p>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loadingPaymentId === payment._id}
                          onClick={() => handleViewDetails(payment._id)}
                          className="h-8 px-2.5 text-xs font-medium hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-950/50"
                        >
                          {loadingPaymentId === payment._id ? (
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin text-primary-600" />
                          ) : (
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                          )}
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages} • Total:{' '}
                {pagination.totalPayments} payments
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === 1 || loading}
                  onClick={() => fetchPayments(pagination.currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === pagination.totalPages || loading}
                  onClick={() => fetchPayments(pagination.currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent
            size="xl"
            className="w-[96vw] sm:w-[92vw] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl max-h-[94vh] sm:max-h-[90vh] p-0 flex flex-col overflow-hidden bg-slate-50/90 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 shadow-2xl rounded-2xl"
          >
            {/* Modal Header */}
            <DialogHeader className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                    <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-2">
                      Complete Payment Details
                    </DialogTitle>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                      Processed on{' '}
                      {selectedPayment.createdAt
                        ? dayjs(selectedPayment.createdAt).format('MMM DD, YYYY • hh:mm A')
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(selectedPayment.status)}
                  {selectedPayment.refund_status && getRefundBadge(selectedPayment.refund_status)}
                </div>
              </div>
            </DialogHeader>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-5 space-y-4 sm:space-y-5">
              <div className="space-y-4 sm:space-y-5 pb-4">
                {/* 1. Quick Financial Summary / Hero Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
                  {/* Total Paid */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 shadow-sm col-span-2 sm:col-span-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                        Total Paid
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                        {selectedPayment.currency || 'INR'}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-2 tracking-tight">
                      {formatINR(selectedPayment.amount)}
                    </p>
                    <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/70 mt-0.5">
                      Client Gross Amount
                    </p>
                  </div>

                  {/* Counselor Fee */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm">
                    <span className="text-xs font-semibold text-slate-600 dark:text-neutral-400">
                      Counselor Base
                    </span>
                    <p className="text-xl font-bold text-slate-900 dark:text-neutral-100 mt-2">
                      {formatINR(selectedPayment.slotId?.basePrice || 0)}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-500 mt-0.5">
                      Counselor Rate
                    </p>
                  </div>

                  {/* Platform Fee */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      Solvit Platform Fee
                    </span>
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-2">
                      {formatINR(
                        selectedPayment.calculated?.platformFeeOfSolvit ??
                          (selectedPayment.amount && selectedPayment.slotId?.basePrice
                            ? selectedPayment.amount - selectedPayment.slotId.basePrice
                            : 0)
                      )}
                    </p>
                    <p className="text-[11px] text-blue-500/80 dark:text-blue-400/70 mt-0.5">
                      Platform Margin
                    </p>
                  </div>

                  {/* Razorpay Fee */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 shadow-sm">
                    <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                      Razorpay Fee
                    </span>
                    <p className="text-xl font-bold text-orange-700 dark:text-orange-400 mt-2">
                      -{formatINR(selectedPayment.fee || 0)}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-500 mt-0.5">
                      incl. ₹{Number(selectedPayment.tax || 0).toFixed(2)} GST
                    </p>
                  </div>

                  {/* Net Solvit Settlement */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 shadow-sm col-span-2 sm:col-span-2 lg:col-span-1">
                    <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                      Net Settlement
                    </span>
                    <p className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mt-2">
                      {formatINR(
                        selectedPayment.calculated?.netAmountReceivedAfterRazorpayFee ??
                          selectedPayment.netAmount ??
                          (selectedPayment.amount || 0) - (selectedPayment.fee || 0)
                      )}
                    </p>
                    <p className="text-[11px] text-indigo-600/80 dark:text-indigo-400/70 mt-0.5">
                      After Razorpay Fee
                    </p>
                  </div>
                </div>

                {/* If Refund Exists - Summary Alert */}
                {selectedPayment.amount_refunded > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-2.5">
                      <RotateCcw className="h-4 w-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Refund Processed:
                        </span>
                        <span className="ml-2 text-sm font-semibold">
                          -{formatINR(selectedPayment.amount_refunded)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs font-medium">
                      Remaining Net Balance:{' '}
                      <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                        {formatINR(
                          selectedPayment.calculated
                            ?.remainingAmountToBeRecivedAfterRefundAndRazorPayFee ??
                            (selectedPayment.netAmount || 0) - (selectedPayment.amount_refunded || 0)
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. Core Identifiers & Metadata Grid */}
                <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
                  <CardHeader className="py-3.5 px-5 border-b border-slate-100 dark:border-neutral-800">
                    <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      Transaction & Gateway Identifiers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      <CopyableField
                        label="Database Payment ID"
                        value={selectedPayment._id}
                      />
                      <CopyableField
                        label="Razorpay Payment ID"
                        value={selectedPayment.razorpay_payment_id}
                      />
                      <CopyableField
                        label="Razorpay Order ID"
                        value={selectedPayment.razorpay_order_id}
                      />
                      <CopyableField
                        label="Booking ID Reference"
                        value={
                          selectedPayment.slotId?.bookingId ||
                          selectedPayment.bookingId?._id ||
                          selectedPayment.bookingId ||
                          'N/A'
                        }
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
                          Booking Status
                        </p>
                        <div className="pt-0.5">
                          {getBookingStatusBadge(selectedPayment.bookingStatus)}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
                          Captured Status
                        </p>
                        <Badge
                          variant={selectedPayment.captured ? 'success' : 'destructive'}
                          className="font-medium text-xs mt-0.5"
                        >
                          {selectedPayment.captured ? 'Yes (Captured)' : 'No (Uncaptured)'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
                          Payment Method
                        </p>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-neutral-200 capitalize mt-1">
                          {getPaymentMethodIcon(selectedPayment.method)}
                          <span>{selectedPayment.method || 'Unknown'}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
                          Transaction Region
                        </p>
                        <p className="text-xs font-medium text-slate-700 dark:text-neutral-300 mt-1">
                          {selectedPayment.international
                            ? '🌐 International Transaction'
                            : '🇮🇳 Domestic (India)'}
                        </p>
                      </div>
                      {selectedPayment.idempotencyKey && (
                        <CopyableField
                          label="Idempotency Key"
                          value={selectedPayment.idempotencyKey}
                          truncate
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Customer & Counselor Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Client Info */}
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
                          {selectedPayment.clientId?.profilePicture && (
                            <AvatarImage
                              src={selectedPayment.clientId.profilePicture}
                              alt={selectedPayment.clientId?.fullName || 'Client'}
                            />
                          )}
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-sm">
                            {getInitials(selectedPayment.clientId?.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-slate-900 dark:text-neutral-100 truncate">
                            {selectedPayment.clientId?.fullName || 'Unknown Client'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200">
                              @{selectedPayment.clientId?.username || 'client'}
                            </Badge>
                            {selectedPayment.clientId?.email && (
                              <span className="text-xs text-slate-500 dark:text-neutral-400 truncate">
                                {selectedPayment.clientId.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <CopyableField
                          label="Client Database ID"
                          value={selectedPayment.clientId?._id}
                          truncate
                        />
                        {selectedPayment.clientId?.phone ? (
                          <CopyableField
                            label="Phone / Mobile"
                            value={selectedPayment.clientId.phone}
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
                          Client Profile & Status
                        </span>
                        <div className="p-2.5 rounded-lg bg-slate-50/70 dark:bg-neutral-950/40 border border-slate-200/60 dark:border-neutral-800 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-neutral-400">Account Status:</span>
                            <Badge
                              variant={selectedPayment.clientId?.isBlocked ? 'destructive' : 'success'}
                              className="text-[10px] px-2 py-0"
                            >
                              {selectedPayment.clientId?.isBlocked ? 'Blocked' : 'Active Client'}
                            </Badge>
                          </div>
                          {selectedPayment.clientId?.gender && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 dark:text-neutral-400">Gender:</span>
                              <span className="font-medium text-slate-800 dark:text-neutral-200 capitalize">
                                {selectedPayment.clientId.gender}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Counselor Info & Direct Bank Payout */}
                  <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
                    <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-neutral-800">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                          <UserCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          Counselor & Bank Payout Details
                        </CardTitle>
                        {selectedPayment.slotId?.basePrice && (
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-bold border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                            Share: {formatINR(selectedPayment.slotId.basePrice)}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar size="lg" className="h-11 w-11 border border-slate-200 dark:border-neutral-700">
                          {selectedPayment.slotId?.counselorId?.profilePicture && (
                            <AvatarImage
                              src={selectedPayment.slotId.counselorId.profilePicture}
                              alt={selectedPayment.slotId?.counselorId?.fullName || 'Counselor'}
                            />
                          )}
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-sm">
                            {getInitials(selectedPayment.slotId?.counselorId?.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-slate-900 dark:text-neutral-100 truncate">
                            {selectedPayment.slotId?.counselorId?.fullName || 'Unassigned / N/A'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200">
                              Counselor
                            </Badge>
                            {selectedPayment.slotId?.counselorId?.email && (
                              <span className="text-xs text-slate-500 dark:text-neutral-400 truncate">
                                {selectedPayment.slotId.counselorId.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <CopyableField
                          label="Counselor ID"
                          value={selectedPayment.slotId?.counselorId?._id}
                          truncate
                        />
                        {selectedPayment.slotId?.counselorId?.phone ? (
                          <CopyableField
                            label="Phone / Mobile"
                            value={selectedPayment.slotId.counselorId.phone}
                          />
                        ) : (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">Phone</p>
                            <span className="text-xs text-slate-400">Not provided</span>
                          </div>
                        )}
                      </div>

                      {/* Counselor Bank Account & Payout Section */}
                      <div className="mt-2 pt-3 border-t border-slate-100 dark:border-neutral-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                            Direct Payout Bank Account
                          </span>
                          {(selectedPayment.slotId?.counselorId?.application?.bankDetails?.accountNo ||
                            selectedPayment.slotId?.counselorId?.bankDetails?.accountNo) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-[10px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                              onClick={() => {
                                const counselor = selectedPayment.slotId?.counselorId;
                                const bank =
                                  counselor?.application?.bankDetails || counselor?.bankDetails || {};
                                const bankText = `Beneficiary Name: ${counselor?.fullName || 'N/A'}\nAccount Number: ${bank.accountNo || 'N/A'}\nIFSC Code: ${bank.ifscCode || 'N/A'}\nBranch Name: ${bank.branchName || 'N/A'}\nPayout Share: ₹${selectedPayment.slotId?.basePrice || 0}`;
                                navigator.clipboard.writeText(bankText);
                                toast.success('Counselor bank & payout details copied to clipboard');
                              }}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy All Details
                            </Button>
                          )}
                        </div>

                        {/* Bank Details Content */}
                        {selectedPayment.slotId?.counselorId?.application?.bankDetails?.accountNo ||
                        selectedPayment.slotId?.counselorId?.bankDetails?.accountNo ? (
                          (() => {
                            const bank =
                              selectedPayment.slotId?.counselorId?.application?.bankDetails ||
                              selectedPayment.slotId?.counselorId?.bankDetails ||
                              {};
                            const isRefunded =
                              selectedPayment.amount_refunded > 0 ||
                              selectedPayment.refund_status === 'full' ||
                              selectedPayment.refund_status === 'partial';
                            const isCancelled = selectedPayment.bookingStatus === 'CANCELLED';

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
                                  {isRefunded ? (
                                    <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 font-medium bg-amber-100/60 dark:bg-amber-950/40 px-2 py-1 rounded">
                                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                                      <span>Payment was refunded/disputed. Verify before transferring.</span>
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
                                        Clean Transaction: Ready for Direct Payout
                                      </span>
                                      <span className="font-bold">
                                        {formatINR(selectedPayment.slotId?.basePrice || 0)}
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

                {/* 4. Consultation Slot Details */}
                {selectedPayment.slotId && (
                  <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
                    <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-neutral-800">
                      <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                        Session / Slot Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                            Start Time
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-neutral-200 font-medium">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {selectedPayment.slotId.startTime
                              ? dayjs(selectedPayment.slotId.startTime).format(
                                  'MMM DD, YYYY hh:mm A'
                                )
                              : 'N/A'}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                            End Time
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-neutral-200 font-medium">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {selectedPayment.slotId.endTime
                              ? dayjs(selectedPayment.slotId.endTime).format(
                                  'MMM DD, YYYY hh:mm A'
                                )
                              : 'N/A'}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                            Base Counselor Price
                          </p>
                          <p className="text-sm font-bold text-slate-900 dark:text-neutral-100">
                            ₹{selectedPayment.slotId.basePrice?.toLocaleString('en-IN') || 0}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
                            Slot Status
                          </p>
                          <Badge variant="outline" className="capitalize text-xs">
                            {selectedPayment.slotId.status || 'Active'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 5. Payment Method & Acquirer Data */}
                <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
                  <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-neutral-800">
                    <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      Payment Method & Gateway Telemetry
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
                          Selected Method
                        </p>
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-neutral-800/60 px-3 py-2 rounded-lg border border-slate-200/60 dark:border-neutral-700/60">
                          {getPaymentMethodIcon(selectedPayment.method)}
                          <span className="font-semibold capitalize text-xs text-slate-800 dark:text-neutral-200">
                            {selectedPayment.method || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {selectedPayment.bank && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
                            Bank
                          </p>
                          <p className="text-xs font-medium text-slate-800 dark:text-neutral-200 bg-slate-50 dark:bg-neutral-900 px-3 py-2 rounded-lg border border-slate-200/60">
                            {selectedPayment.bank}
                          </p>
                        </div>
                      )}

                      {selectedPayment.wallet && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
                            Wallet Provider
                          </p>
                          <p className="text-xs font-medium capitalize text-slate-800 dark:text-neutral-200 bg-slate-50 dark:bg-neutral-900 px-3 py-2 rounded-lg border border-slate-200/60">
                            {selectedPayment.wallet}
                          </p>
                        </div>
                      )}

                      {selectedPayment.vpa && (
                        <CopyableField
                          label="UPI Virtual Private Address (VPA)"
                          value={selectedPayment.vpa}
                        />
                      )}

                      {selectedPayment.card_id && (
                        <CopyableField
                          label="Card Reference ID"
                          value={selectedPayment.card_id}
                        />
                      )}

                      {selectedPayment.upiDetails?.payer_account_type && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
                            UPI Account Type
                          </p>
                          <p className="text-xs font-medium capitalize text-slate-800 dark:text-neutral-200 bg-slate-50 dark:bg-neutral-900 px-3 py-2 rounded-lg border border-slate-200/60">
                            {selectedPayment.upiDetails.payer_account_type}
                          </p>
                        </div>
                      )}

                      {selectedPayment.upiDetails?.flow && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1">
                            UPI Flow
                          </p>
                          <p className="text-xs font-medium capitalize text-slate-800 dark:text-neutral-200 bg-slate-50 dark:bg-neutral-900 px-3 py-2 rounded-lg border border-slate-200/60">
                            {selectedPayment.upiDetails.flow}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Acquirer Data Sub-Section */}
                    {selectedPayment.acquirer_data && Object.keys(selectedPayment.acquirer_data).length > 0 && (
                      <>
                        <Separator className="bg-slate-100 dark:bg-neutral-800" />
                        <div>
                          <p className="text-xs font-bold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-2.5">
                            Bank & Gateway Acquirer Data
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {selectedPayment.acquirer_data.bank_transaction_id && (
                              <CopyableField
                                label="Bank Transaction ID"
                                value={selectedPayment.acquirer_data.bank_transaction_id}
                              />
                            )}
                            {selectedPayment.acquirer_data.rrn && (
                              <CopyableField
                                label="RRN (Reference No.)"
                                value={selectedPayment.acquirer_data.rrn}
                              />
                            )}
                            {selectedPayment.acquirer_data.auth_code && (
                              <CopyableField
                                label="Authorization Code"
                                value={selectedPayment.acquirer_data.auth_code}
                              />
                            )}
                            {selectedPayment.acquirer_data.arn && (
                              <CopyableField
                                label="ARN (Acquirer Reference No.)"
                                value={selectedPayment.acquirer_data.arn}
                              />
                            )}
                            {selectedPayment.acquirer_data.transaction_id && (
                              <CopyableField
                                label="Gateway Transaction ID"
                                value={selectedPayment.acquirer_data.transaction_id}
                              />
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* 6. Complete Itemized Financial Breakdown / Receipt */}
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
                              {formatINR(selectedPayment.slotId?.basePrice || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400">
                            <span>Solvit Platform Fee:</span>
                            <span className="font-medium">
                              +{formatINR(
                                selectedPayment.calculated?.platformFeeOfSolvit ??
                                  (selectedPayment.amount && selectedPayment.slotId?.basePrice
                                    ? selectedPayment.amount - selectedPayment.slotId.basePrice
                                    : 0)
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="pt-3 mt-3 border-t border-slate-200 dark:border-neutral-800 flex justify-between items-baseline">
                          <span className="text-xs font-bold text-slate-900 dark:text-neutral-100">Total Charged:</span>
                          <span className="text-base font-bold text-slate-900 dark:text-neutral-100">
                            {formatINR(selectedPayment.amount)}
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
                              -{formatINR((selectedPayment.fee || 0) - (selectedPayment.tax || 0))}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-600 dark:text-neutral-400">
                            <span>GST on Fee (18%):</span>
                            <span className="font-mono text-red-600 dark:text-red-400">
                              -{formatINR(selectedPayment.tax || 0)}
                            </span>
                          </div>
                        </div>
                        <div className="pt-3 mt-3 border-t border-orange-200/60 dark:border-orange-900/40 flex justify-between items-baseline">
                          <span className="text-xs font-bold text-orange-900 dark:text-orange-200">Total Gateway Fee:</span>
                          <span className="text-base font-bold text-red-600 dark:text-red-400">
                            -{formatINR(selectedPayment.fee || 0)}
                          </span>
                        </div>
                      </div>

                      {/* 3. Net Settlement & Distribution Stage */}
                      <div className="p-4 rounded-xl border border-emerald-300/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-emerald-200/60 dark:border-emerald-900/50">
                            <span className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-[11px]">
                              3. Net Settlement
                            </span>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-emerald-400 text-emerald-700 dark:text-emerald-300 bg-white/60 dark:bg-neutral-900/60">
                              Settled
                            </Badge>
                          </div>
                          <div className="flex justify-between text-xs text-slate-600 dark:text-neutral-400">
                            <span>Counselor Share:</span>
                            <span className="font-semibold text-slate-900 dark:text-neutral-200">
                              {formatINR(selectedPayment.slotId?.basePrice || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                            <span>Solvit Net Margin:</span>
                            <span className="font-bold">
                              +{formatINR(
                                (selectedPayment.calculated?.platformFeeOfSolvit ??
                                  (selectedPayment.amount && selectedPayment.slotId?.basePrice
                                    ? selectedPayment.amount - selectedPayment.slotId.basePrice
                                    : 0)) - (selectedPayment.fee || 0)
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="pt-3 mt-3 border-t border-emerald-200/60 dark:border-emerald-900/50 flex justify-between items-baseline">
                          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Total Net Received:</span>
                          <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                            {formatINR(
                              selectedPayment.calculated?.netAmountReceivedAfterRazorpayFee ??
                                selectedPayment.netAmount ??
                                (selectedPayment.amount || 0) - (selectedPayment.fee || 0)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Refund Calculation (if applicable) */}
                    {selectedPayment.amount_refunded > 0 && (
                      <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <RotateCcw className="h-4 w-4 text-amber-600 shrink-0" />
                          <span className="text-slate-700 dark:text-neutral-300">
                            <strong>Refund Deducted from Transaction:</strong>{' '}
                            <span className="text-red-600 font-bold">-{formatINR(selectedPayment.amount_refunded)}</span>
                          </span>
                        </div>
                        <div className="text-slate-700 dark:text-neutral-300">
                          <strong>Remaining Retained Revenue:</strong>{' '}
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm ml-1">
                            {formatINR(
                              selectedPayment.calculated
                                ?.remainingAmountToBeRecivedAfterRefundAndRazorPayFee ??
                                (selectedPayment.netAmount || 0) - (selectedPayment.amount_refunded || 0)
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 7. Error Details (if payment failed) */}
                {selectedPayment.status === 'failed' && selectedPayment.error_code && (
                  <Card className="border-red-300 dark:border-red-900 bg-red-50/70 dark:bg-red-950/30 shadow-sm">
                    <CardHeader className="py-3 px-5 border-b border-red-200 dark:border-red-900/60">
                      <CardTitle className="text-xs font-bold text-red-900 dark:text-red-100 flex items-center gap-2 uppercase tracking-wider">
                        <XCircle className="h-4 w-4 text-red-600" />
                        Payment Failure Diagnostics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        {selectedPayment.error_code && (
                          <CopyableField
                            label="Error Code"
                            value={selectedPayment.error_code}
                          />
                        )}
                        {selectedPayment.error_source && (
                          <div>
                            <p className="font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                              Error Source
                            </p>
                            <p className="bg-white dark:bg-neutral-900 p-2 rounded-lg border text-red-700 dark:text-red-300">
                              {selectedPayment.error_source}
                            </p>
                          </div>
                        )}
                        {selectedPayment.error_step && (
                          <div>
                            <p className="font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                              Error Step
                            </p>
                            <p className="bg-white dark:bg-neutral-900 p-2 rounded-lg border text-red-700 dark:text-red-300">
                              {selectedPayment.error_step}
                            </p>
                          </div>
                        )}
                        {selectedPayment.error_reason && (
                          <div>
                            <p className="font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                              Error Reason
                            </p>
                            <p className="bg-white dark:bg-neutral-900 p-2 rounded-lg border text-red-700 dark:text-red-300">
                              {selectedPayment.error_reason}
                            </p>
                          </div>
                        )}
                        {selectedPayment.error_description && (
                          <div className="col-span-1 sm:col-span-2">
                            <p className="font-semibold text-slate-600 dark:text-neutral-400 mb-1">
                              Error Description
                            </p>
                            <p className="bg-white dark:bg-neutral-900 p-3 rounded-lg border text-red-800 dark:text-red-200 font-medium">
                              {selectedPayment.error_description}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 8. Refund History (if refunds exist) */}
                {selectedPayment.refunds && selectedPayment.refunds.length > 0 && (
                  <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
                    <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-neutral-800">
                      <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                        <RotateCcw className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        Refund History ({selectedPayment.refunds.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        {selectedPayment.refunds.map((refund, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-50 dark:bg-neutral-950 p-4 rounded-xl border border-slate-200 dark:border-neutral-800 space-y-3"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                              <CopyableField
                                label="Refund ID"
                                value={refund.razorpay_refund_id}
                              />
                              <div>
                                <p className="text-slate-500 dark:text-neutral-400 font-semibold mb-1">
                                  Refund Amount
                                </p>
                                <p className="font-bold text-sm text-red-600 dark:text-red-400 mt-1.5">
                                  -{formatINR(refund.amount)}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500 dark:text-neutral-400 font-semibold mb-1">
                                  Reason
                                </p>
                                <p className="capitalize font-medium text-slate-800 dark:text-neutral-200 mt-1.5">
                                  {refund.reason?.replace(/_/g, ' ') || 'Customer Request'}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500 dark:text-neutral-400 font-semibold mb-1">
                                  Status
                                </p>
                                <div className="mt-1">
                                  <Badge
                                    variant={
                                      refund.status === 'processed' ? 'success' : 'destructive'
                                    }
                                    className="text-[11px]"
                                  >
                                    {refund.status?.toUpperCase() || 'PROCESSED'}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {(refund.refundSpeedRequested || refund.refundSpeedProcessed) && (
                              <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-200/60 dark:border-neutral-800">
                                {refund.refundSpeedRequested && (
                                  <div>
                                    <span className="text-slate-500 dark:text-neutral-400">
                                      Speed Requested:
                                    </span>{' '}
                                    <span className="capitalize font-medium text-slate-700 dark:text-neutral-300">
                                      {refund.refundSpeedRequested}
                                    </span>
                                  </div>
                                )}
                                {refund.refundSpeedProcessed && (
                                  <div>
                                    <span className="text-slate-500 dark:text-neutral-400">
                                      Speed Processed:
                                    </span>{' '}
                                    <span className="capitalize font-medium text-slate-700 dark:text-neutral-300">
                                      {refund.refundSpeedProcessed}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {refund.createdAt && (
                              <p className="text-[11px] text-slate-400 dark:text-neutral-500">
                                Processed on{' '}
                                {dayjs(refund.createdAt).format('MMM DD, YYYY hh:mm A')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 9. Security Audit & Cryptographic Signature */}
                <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
                  <CardHeader className="py-3 px-5 border-b border-slate-100 dark:border-neutral-800">
                    <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-slate-600 dark:text-neutral-400" />
                      Verification Audit & Timestamps
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-slate-500 dark:text-neutral-400 font-semibold mb-1">
                          Solvit Record Created
                        </p>
                        <p className="font-medium text-slate-800 dark:text-neutral-200">
                          {selectedPayment.createdAt
                            ? dayjs(selectedPayment.createdAt).format('MMM DD, YYYY • hh:mm:ss A')
                            : 'N/A'}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500 dark:text-neutral-400 font-semibold mb-1">
                          Solvit Record Updated
                        </p>
                        <p className="font-medium text-slate-800 dark:text-neutral-200">
                          {selectedPayment.updatedAt
                            ? dayjs(selectedPayment.updatedAt).format('MMM DD, YYYY • hh:mm:ss A')
                            : 'N/A'}
                        </p>
                      </div>

                      {selectedPayment.razorpay_created_at && (
                        <div>
                          <p className="text-slate-500 dark:text-neutral-400 font-semibold mb-1">
                            Razorpay Epoch Created
                          </p>
                          <p className="font-medium text-slate-800 dark:text-neutral-200">
                            {dayjs(selectedPayment.razorpay_created_at * 1000).format(
                              'MMM DD, YYYY • hh:mm:ss A'
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    {selectedPayment.razorpay_signature && (
                      <div className="pt-2 border-t border-slate-100 dark:border-neutral-800">
                        <CopyableField
                          label="Razorpay Cryptographic Signature"
                          value={selectedPayment.razorpay_signature}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Modal Footer */}
            <DialogFooter className="px-6 py-3 border-t border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-shrink-0 flex items-center justify-between sm:justify-between">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 text-slate-600 dark:text-neutral-300"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedPayment, null, 2));
                  toast.success('Complete transaction JSON copied to clipboard');
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
