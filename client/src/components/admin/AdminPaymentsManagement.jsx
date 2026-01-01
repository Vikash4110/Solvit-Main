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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'lucide-react';
import dayjs from 'dayjs';

export default function PaymentManagement() {
  const { getAllPayments, getPaymentDetails } = useAdminAuth();

  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
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
                          onClick={() => handleViewDetails(payment._id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
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
          <DialogContent className="max-w-5xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-xl">Complete Payment Details</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[700px] pr-4">
              <div className="space-y-6">
                {/* Basic Payment Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Payment ID in Database</p>
                      <p className="font-mono text-sm">{selectedPayment._id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Razorpay Payment ID</p>
                      <p className="font-mono text-sm">{selectedPayment.razorpay_payment_id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Razorpay Order ID</p>
                      <p className="font-mono text-sm">{selectedPayment.razorpay_order_id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                      <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                    </div>
                    
                      <div className="col-span-3">
                        <p className="text-sm font-medium text-muted-foreground">Signature</p>
                        <p className="font-mono text-xs break-all">
                          {selectedPayment.razorpay_signature}
                        </p>
                      </div>
                 
                   
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Booking Status Of Payment Model</p>
                      <div className="mt-1">
                        {getBookingStatusBadge(selectedPayment.bookingStatus)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Currency</p>
                      <p className="text-sm">{selectedPayment.currency}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Captured</p>
                      <Badge variant={selectedPayment.captured ? 'success' : 'destructive'}>
                        {selectedPayment.captured ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer & Counselor Details */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Client Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-3">
                        {selectedPayment.clientId?.profilePicture && (
                          <img
                            src={selectedPayment.clientId.profilePicture}
                            alt={selectedPayment.clientId.fullName}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{selectedPayment.clientId?.fullName}</p>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Id:</strong> {selectedPayment.clientId?._id}
                        </p>
                       
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Counselor Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-3">
                        {selectedPayment.slotId?.counselorId?.profilePicture && (
                          <img
                            src={selectedPayment.slotId.counselorId.profilePicture}
                            alt={selectedPayment.slotId.counselorId.fullName}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">
                            {selectedPayment.slotId?.counselorId?.fullName}
                          </p>
                          
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Id:</strong> {selectedPayment.slotId?.counselorId?._id}
                        </p>
                       
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Session Details */}
                {selectedPayment.slotId && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Slot Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Start Time</p>
                        <p className="text-sm">
                          {selectedPayment.slotId.startTime
                            ? dayjs(selectedPayment.slotId.startTime).format('MMM DD, YYYY hh:mm A')
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">End Time</p>
                        <p className="text-sm">
                          {selectedPayment.slotId.endTime
                            ? dayjs(selectedPayment.slotId.endTime).format('MMM DD, YYYY hh:mm A')
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Base Price</p>
                        <p className="text-sm font-semibold">
                          ₹{selectedPayment.slotId.basePrice?.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Price After Solvit Platform Fee</p>
                        <p className="text-sm font-semibold">
                          ₹{selectedPayment.slotId.totalPriceAfterPlatformFee?.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <p className="text-sm font-semibold">
                          {selectedPayment.slotId.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Booking ID</p>
                        <p className="text-sm font-semibold">
                          {selectedPayment.slotId?.bookingId}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Payment Method Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Payment Method Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(selectedPayment.method)}
                          <span className="font-semibold capitalize text-lg">
                            {selectedPayment.method}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          {selectedPayment.bank && (
                            <p>
                              <strong>Bank:</strong> {selectedPayment.bank}
                            </p>
                          )}
                          {selectedPayment.wallet && (
                            <p>
                              <strong>Wallet:</strong>{' '}
                              <span className="capitalize">{selectedPayment.wallet}</span>
                            </p>
                          )}
                          {selectedPayment.vpa && (
                            <p>
                              <strong>UPI ID:</strong>{' '}
                              <span className="font-mono text-xs">{selectedPayment.vpa}</span>
                            </p>
                          )}
                          {selectedPayment.card_id && (
                            <p>
                              <strong>Card ID:</strong> {selectedPayment.card_id}
                            </p>
                          )}
                          {selectedPayment.upiDetails && (
                            <>
                              {selectedPayment.upiDetails.payer_account_type && (
                                <p>
                                  <strong>Payer Account Type:</strong>{' '}
                                  {selectedPayment.upiDetails.payer_account_type}
                                </p>
                              )}
                              {selectedPayment.upiDetails.flow && (
                                <p>
                                  <strong>UPI Flow:</strong> {selectedPayment.upiDetails.flow}
                                </p>
                              )}
                            </>
                          )}
                          <p>
                            <strong>International:</strong>{' '}
                            {selectedPayment.international ? 'Yes' : 'No'}
                          </p>
                        </div>
                      </div>

                      {selectedPayment.acquirer_data && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Acquirer Data</h4>
                          <div className="space-y-2 text-sm">
                            {selectedPayment.acquirer_data.bank_transaction_id && (
                              <p>
                                <strong>Bank Txn ID:</strong>{' '}
                                <span className="font-mono text-xs">
                                  {selectedPayment.acquirer_data.bank_transaction_id}
                                </span>
                              </p>
                            )}
                            {selectedPayment.acquirer_data.rrn && (
                              <p>
                                <strong>RRN:</strong>{' '}
                                <span className="font-mono text-xs">
                                  {selectedPayment.acquirer_data.rrn}
                                </span>
                              </p>
                            )}
                            {selectedPayment.acquirer_data.auth_code && (
                              <p>
                                <strong>Auth Code:</strong>{' '}
                                {selectedPayment.acquirer_data.auth_code}
                              </p>
                            )}
                            {selectedPayment.acquirer_data.arn && (
                              <p>
                                <strong>ARN:</strong>{' '}
                                <span className="font-mono text-xs">
                                  {selectedPayment.acquirer_data.arn}
                                </span>
                              </p>
                            )}
                            {selectedPayment.acquirer_data.transaction_id && (
                              <p>
                                <strong>Transaction ID:</strong>{' '}
                                {selectedPayment.acquirer_data.transaction_id}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Financial Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Amount Paid:</span>
                        <span className="font-bold text-xl">
                          ₹{selectedPayment.amount?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <Separator />

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Counselor Base Price:</span>
                          <span>₹{selectedPayment.slotId?.basePrice?.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-blue-600">
                          <span>Platform Fee of Solvit:</span>
                          <span className="font-semibold">
                            ₹{selectedPayment.calculated?.platformFeeOfSolvit?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Razorpay Fee including GST:</span>
                          <span className="text-red-600">
                            -₹{selectedPayment.fee?.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">GST on Razorpay Fee:</span>
                          <span className="text-red-600">
                            -₹{selectedPayment.tax?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-between items-center font-semibold">
                        <span>Net Amount To Be Received After Razorpay Fee:</span>
                        <span className="text-green-600 text-xl">
                          ₹{selectedPayment.calculated?.netAmountReceivedAfterRazorpayFee?.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {selectedPayment.amount_refunded > 0 && (
                        <>
                          <Separator />
                          <div className="flex justify-between text-red-600">
                            <span>Amount Refunded:</span>
                            <span className="font-semibold">
                              -₹{selectedPayment.amount_refunded?.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex justify-between font-semibold items-center">
                            <span>Remaining Amount To Be Recieved After Refund And Razorpay Fee:</span>
                            <span className="text-green-600 text-lg">
                              ₹
                              {selectedPayment.calculated?.remainingAmountToBeRecivedAfterRefundAndRazorPayFee?.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Error Details (if payment failed) */}
                {selectedPayment.status === 'failed' && selectedPayment.error_code && (
                  <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
                    <CardHeader>
                      <CardTitle className="text-sm text-red-900 dark:text-red-100 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Payment Failure Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {selectedPayment.error_code && (
                          <div>
                            <p className="font-medium">Error Code</p>
                            <p className="font-mono">{selectedPayment.error_code}</p>
                          </div>
                        )}
                        {selectedPayment.error_source && (
                          <div>
                            <p className="font-medium">Error Source</p>
                            <p>{selectedPayment.error_source}</p>
                          </div>
                        )}
                        {selectedPayment.error_step && (
                          <div>
                            <p className="font-medium">Error Step</p>
                            <p>{selectedPayment.error_step}</p>
                          </div>
                        )}
                        {selectedPayment.error_reason && (
                          <div>
                            <p className="font-medium">Error Reason</p>
                            <p>{selectedPayment.error_reason}</p>
                          </div>
                        )}
                        {selectedPayment.error_description && (
                          <div className="col-span-2">
                            <p className="font-medium">Description</p>
                            <p className="bg-white dark:bg-gray-900 p-2 rounded border mt-1">
                              {selectedPayment.error_description}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Refund History */}
                {selectedPayment.refunds && selectedPayment.refunds.length > 0 && (
                  <Card className="border-blue-300 bg-blue-50 dark:bg-blue-950/20">
                    <CardHeader>
                      <CardTitle className="text-sm text-blue-900 dark:text-blue-100">
                        Refund History ({selectedPayment.refunds.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedPayment.refunds.map((refund, idx) => (
                          <div
                            key={idx}
                            className="bg-white dark:bg-gray-900 p-4 rounded-lg border"
                          >
                            <div className="grid grid-cols-4 gap-4 text-sm mb-2">
                              <div>
                                <p className="text-muted-foreground">Refund ID</p>
                                <p className="font-mono text-xs">{refund.razorpay_refund_id}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Amount</p>
                                <p className="font-semibold text-red-600">
                                  -₹{refund.amount?.toLocaleString('en-IN')}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Reason</p>
                                <p className="capitalize">{refund.reason?.replace(/_/g, ' ')}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Status</p>
                                <Badge
                                  variant={
                                    refund.status === 'processed' ? 'success' : 'destructive'
                                  }
                                >
                                  {refund.status?.toUpperCase()}
                                </Badge>
                              </div>
                            </div>

                            {(refund.refundSpeedRequested || refund.refundSpeedProcessed) && (
                              <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                                {refund.refundSpeedRequested && (
                                  <div>
                                    <p className="text-muted-foreground">Speed Requested</p>
                                    <p className="capitalize">{refund.refundSpeedRequested}</p>
                                  </div>
                                )}
                                {refund.refundSpeedProcessed && (
                                  <div>
                                    <p className="text-muted-foreground">Speed Processed</p>
                                    <p className="capitalize">{refund.refundSpeedProcessed}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {refund.errorDetails && (
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground">
                                  <strong>Details:</strong> {refund.errorDetails}
                                </p>
                              </div>
                            )}

                            {refund.createdAt && (
                              <p className="text-xs text-muted-foreground mt-2">
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

                

                {/* Timestamps */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Timestamps</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4 text-sm">
                    
                    {selectedPayment.razorpay_created_at && (
                      <div>
                        <p className="text-muted-foreground">Razorpay Created At:</p>
                        <p>
                          {dayjs(selectedPayment.razorpay_created_at * 1000).format(
                            'MMM DD, YYYY hh:mm A'
                          )}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
