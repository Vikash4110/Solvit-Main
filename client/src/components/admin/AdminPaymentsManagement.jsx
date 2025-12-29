// components/admin/AdminPaymentsManagement.jsx

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import {
  CreditCard,
  Search,
  Filter,
  Eye,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  Download,
  BarChart3,
  Smartphone,
  Wallet,
  Building2,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle,
  XCircle,
  Clock,
  FileWarning,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PaymentDetailModal from './PaymentDetailModal';
import PaymentAnalytics from './PaymentAnalytics';

dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = 'Asia/Kolkata';

const AdminPaymentsManagement = () => {
  const { getAllPayments } = useAdminAuth();

  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalRevenue: 0,
    platformRevenue: 0,
    netRevenue: 0,
    todayRevenue: 0,
    razorpayFees: 0,
    totalRefunded: 0,
    refundCount: 0,
    partialRefunds: 0,
    fullRefunds: 0,
    methodBreakdown: [],
    statusBreakdown: [],
    bookingStatusBreakdown: [],
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPayments: 0,
    limit: 20,
  });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all_methods');
  const [statusFilter, setStatusFilter] = useState('all_statuses');
  const [refundFilter, setRefundFilter] = useState('all_refunds');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all_booking_statuses');

  useEffect(() => {
    fetchPayments();
  }, [currentPage, dateFilter, methodFilter, statusFilter, refundFilter, bookingStatusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const result = await getAllPayments(
        currentPage,
        20,
        searchTerm,
        dateFilter,
        methodFilter,
        statusFilter,
        refundFilter,
        bookingStatusFilter
      );

      if (result.success) {
        setPayments(result.data.payments);
        setStats(result.data.stats);
        setPagination(result.data.pagination);
      } else {
        toast.error(result.error || 'Failed to fetch payments');
      }
    } catch (error) {
      console.error('Fetch payments error:', error);
      toast.error('Network error while fetching payments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPayments();
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).tz(TIMEZONE).format('MMM DD, YYYY hh:mm A');
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'upi':
        return <Smartphone className="w-4 h-4" />;
      case 'wallet':
        return <Wallet className="w-4 h-4" />;
      case 'netbanking':
        return <Building2 className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPaymentStatusBadge = (payment) => {
    const { status, bookingStatus, refund_status } = payment;

    // Priority 1: Refund Status
    if (refund_status === 'full') {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-300">
          <RefreshCw className="w-3 h-3 mr-1" />
          Fully Refunded
        </Badge>
      );
    }
    if (refund_status === 'partial') {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-300">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Partially Refunded
        </Badge>
      );
    }

    // Priority 2: Payment Status
    if (status === 'captured_unlinked') {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <FileWarning className="w-3 h-3 mr-1" />
          Unlinked
        </Badge>
      );
    }
    if (status === 'failed') {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-300">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    }

    // Priority 3: Booking Status
    if (bookingStatus === 'completed') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }
    if (bookingStatus === 'pending') {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-300">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    }
    if (bookingStatus === 'payment_captured') {
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-300">
          <DollarSign className="w-3 h-3 mr-1" />
          Captured
        </Badge>
      );
    }

    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-300">{status || 'Unknown'}</Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all client payments with refund insights
          </p>
        </div>
        <Button onClick={fetchPayments} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Revenue */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalPayments} transactions
                </p>
              </CardContent>
            </Card>

            {/* Platform Revenue */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.platformRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">Commission earned</p>
              </CardContent>
            </Card>

            {/* Net Revenue */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.netRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  After Razorpay fees ({formatCurrency(stats.razorpayFees)})
                </p>
              </CardContent>
            </Card>

            {/* Refunds */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.totalRefunded)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.refundCount} refunds ({stats.partialRefunds} partial, {stats.fullRefunds}{' '}
                  full)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Method Breakdown */}
          {stats.methodBreakdown?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Revenue distribution by payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  {stats.methodBreakdown.map((method) => (
                    <div key={method._id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getMethodIcon(method._id)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium capitalize">{method._id || 'Unknown'}</p>
                        <p className="text-lg font-bold">{formatCurrency(method.totalAmount)}</p>
                        <p className="text-xs text-muted-foreground">{method.count} txns</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
              <CardDescription>Find specific payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-6">
                {/* Search */}
                <div className="md:col-span-2">
                  <Input
                    placeholder="Search payment ID, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>

                {/* Date Filter */}
                <Select value={dateFilter} onValueChange={setDateFilter}>
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
                </Select>

                {/* Method Filter */}
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_methods">All Methods</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="wallet">Wallet</SelectItem>
                    <SelectItem value="netbanking">Netbanking</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_statuses">All Statuses</SelectItem>
                    <SelectItem value="captured">Captured</SelectItem>
                    <SelectItem value="captured_unlinked">Unlinked</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                {/* Refund Filter */}
                <Select value={refundFilter} onValueChange={setRefundFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Refunds" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_refunds">All Refunds</SelectItem>
                    <SelectItem value="no_refund">No Refund</SelectItem>
                    <SelectItem value="refunded">Any Refund</SelectItem>
                    <SelectItem value="partial">Partial Refund</SelectItem>
                    <SelectItem value="full">Full Refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 flex gap-2">
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setDateFilter('all');
                    setMethodFilter('all_methods');
                    setStatusFilter('all_statuses');
                    setRefundFilter('all_refunds');
                    setBookingStatusFilter('all_booking_statuses');
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
              <CardDescription>
                Showing {pagination.totalPayments} payments with refund status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No payments found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <Card key={payment._id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* Payment IDs */}
                          <div className="col-span-2">
                            <div className="space-y-1">
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {payment.razorpay_payment_id?.slice(-12)}
                              </code>
                              <code className="text-xs bg-muted px-2 py-1 rounded block">
                                {payment.razorpay_order_id?.slice(-12)}
                              </code>
                            </div>
                          </div>

                          {/* Client */}
                          <div className="col-span-2 flex items-center gap-2">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={payment.clientId?.profilePicture} />
                              <AvatarFallback>
                                {payment.clientId?.fullName?.charAt(0) || 'C'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {payment.clientId?.fullName || 'Unknown'}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {payment.email || payment.clientId?.email}
                              </p>
                            </div>
                          </div>

                          {/* Counselor */}
                          <div className="col-span-2 flex items-center gap-2">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={payment.slotId?.counselorId?.profilePicture} />
                              <AvatarFallback>
                                {payment.slotId?.counselorId?.fullName?.charAt(0) || 'C'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {payment.slotId?.counselorId?.fullName || 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="col-span-2">
                            <p className="text-lg font-bold">{formatCurrency(payment.amount)}</p>
                            <p className="text-xs text-muted-foreground">
                              Counselor: {formatCurrency(payment.slotId?.basePrice || 0)}
                            </p>
                            {payment.refunds?.length > 0 && (
                              <p className="text-xs text-red-600 font-medium mt-1">
                                Refunded: {formatCurrency(payment.amount_refunded || 0)}
                              </p>
                            )}
                          </div>

                          {/* Method & Fee */}
                          <div className="col-span-2">
                            <div className="flex items-center gap-1 mb-1">
                              {getMethodIcon(payment.method)}
                              <span className="text-sm capitalize">{payment.method}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Fee: {formatCurrency(payment.fee || 0)}
                            </p>
                          </div>

                          {/* Status & Date */}
                          <div className="col-span-1">
                            {getPaymentStatusBadge(payment)}
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDate(payment.createdAt)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="col-span-1 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(payment)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={currentPage === pagination.totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <PaymentAnalytics />
        </TabsContent>
      </Tabs>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <PaymentDetailModal
          paymentId={selectedPayment._id}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPayment(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminPaymentsManagement;
