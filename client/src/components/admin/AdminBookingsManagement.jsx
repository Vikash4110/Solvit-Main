// components/admin/BookingsManagement.jsx - Complete Updated Component

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
} from 'lucide-react';
import dayjs from 'dayjs';

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
        setBookings(result.bookings);
        setStats(result.stats);
        setPagination(result.pagination);
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
    }
  };

  // Payment method icon
  const getPaymentMethodIcon = (method) => {
    const icons = {
      card: <CreditCard className="h-4 w-4" />,
      upi: <Smartphone className="h-4 w-4" />,
      wallet: <Wallet className="h-4 w-4" />,
      netbanking: <Building2 className="h-4 w-4" />,
    };
    return icons[method] || <CreditCard className="h-4 w-4" />;
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
        icon: CheckCircle2,
      },
      completed: {
        color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
        icon: CheckCircle2,
      },
      cancelled: {
        color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
        icon: XCircle,
      },
      disputed: {
        color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
        icon: AlertCircle,
      },
      dispute_window_open: {
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
        icon: Clock,
      },
    };

    const config = statusConfig[status] || statusConfig.confirmed;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace(/_/g, ' ').toUpperCase()}
      </Badge>
    );
  };

  // Payout status badge
  const getPayoutBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
      released: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
      refunded: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    };

    return (
      <Badge className={colors[status] || colors.pending}>{status?.toUpperCase() || 'N/A'}</Badge>
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bookings Management</h1>
          <p className="text-muted-foreground">Monitor and manage all session bookings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchBookings(pagination.currentPage)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Disputed</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.disputed || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.totalRevenue?.toLocaleString('en-IN') || 0}
            </div>
            {stats.totalRefunded > 0 && (
              <p className="text-xs text-red-600">
                -₹{stats.totalRefunded?.toLocaleString('en-IN')} refunded
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email..."
                  className="pl-9"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
              </div>

              {/* Status Filter */}
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
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
                </SelectContent>
              </Select>

              {/* Payment Method Filter */}
              <Select
                value={filters.paymentMethod}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, paymentMethod: value }))}
              >
                <SelectTrigger>
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

              {/* Dispute Filter */}
              <Select
                value={filters.disputeFilter}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, disputeFilter: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Dispute" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                  <SelectItem value="not_disputed">Not Disputed</SelectItem>
                </SelectContent>
              </Select>

              {/* Payout Filter */}
              <Select
                value={filters.payoutFilter}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, payoutFilter: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Payout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payouts</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="released">Released</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filters Button */}
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings ({pagination.totalBookings})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Counselor</TableHead>
                  <TableHead>Session Time</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payout</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Loading bookings...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Calendar className="h-12 w-12 opacity-50" />
                        <p>No bookings found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-mono text-xs">{booking._id.slice(-8)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {booking.clientId?.profilePicture ? (
                            <img
                              src={booking.clientId.profilePicture}
                              alt={booking.clientId.fullName}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {booking.clientId?.fullName || 'N/A'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              @{booking.clientId?.username}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {booking.slotId?.counselorId?.profilePicture ? (
                            <img
                              src={booking.slotId.counselorId.profilePicture}
                              alt={booking.slotId.counselorId.fullName}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">
                              {booking.slotId?.counselorId?.fullName || 'N/A'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {booking.slotId?.counselorId?.specialization?.[0]}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">
                            {booking.slotId?.startTime
                              ? dayjs(booking.slotId.startTime).format('MMM DD, YYYY')
                              : 'N/A'}
                          </p>
                          <p className="text-muted-foreground">
                            {booking.slotId?.startTime && booking.slotId?.endTime
                              ? `${dayjs(booking.slotId.startTime).format(
                                  'hh:mm A'
                                )} - ${dayjs(booking.slotId.endTime).format('hh:mm A')}`
                              : 'N/A'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {booking.paymentId?.method ? (
                          <div className="flex items-center gap-1 text-xs">
                            {getPaymentMethodIcon(booking.paymentId.method)}
                            <span className="capitalize">{booking.paymentId.method}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>{getPayoutBadge(booking.payout?.status)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">
                            ₹{booking.paymentId?.amount?.toLocaleString('en-IN') || 0}
                          </p>
                          {booking.platformFee > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Fee: ₹{booking.platformFee?.toLocaleString('en-IN')}
                            </p>
                          )}
                          {booking.dispute?.isDisputed && (
                            <Badge variant="destructive" className="mt-1 text-xs">
                              <FileWarning className="h-3 w-3 mr-1" />
                              Disputed
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {dayjs(booking.createdAt).format('MMM DD, YYYY')}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(booking._id)}
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
                {pagination.totalBookings} bookings
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === 1 || loading}
                  onClick={() => fetchBookings(pagination.currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
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

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-5xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-xl">Comprehensive Booking Details</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[700px] pr-4">
              <div className="space-y-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Booking Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Booking ID</p>
                      <p className="font-mono text-sm">{selectedBooking._id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Created At</p>
                      <p className="text-sm">
                        {dayjs(selectedBooking.createdAt).format('MMM DD, YYYY hh:mm A')}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Client & Counselor Info */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Client Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-3">
                        {selectedBooking.clientId?.profilePicture && (
                          <img
                            src={selectedBooking.clientId.profilePicture}
                            alt={selectedBooking.clientId.fullName}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{selectedBooking.clientId?.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            @{selectedBooking.clientId?.username}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-1">
                        <p className="text-sm">
                          <strong>Client ID: </strong>
                          {selectedBooking.clientId?._id}
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
                        {selectedBooking.slotId?.counselorId?.profilePicture && (
                          <img
                            src={selectedBooking.slotId.counselorId.profilePicture}
                            alt={selectedBooking.slotId.counselorId.fullName}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">
                            {selectedBooking.slotId?.counselorId?.fullName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedBooking.slotId?.counselorId?.experienceLevel}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-1">
                        <p className="text-sm">
                          <strong>Counselor ID: </strong>
                          {selectedBooking.slotId?.counselorId?._id}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Session Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Session Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Start Time</p>
                      <p className="text-sm font-semibold">
                        {selectedBooking.slotId?.startTime
                          ? dayjs(selectedBooking.slotId.startTime).format('MMM DD, YYYY hh:mm A')
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">End Time</p>
                      <p className="text-sm font-semibold">
                        {selectedBooking.slotId?.endTime
                          ? dayjs(selectedBooking.slotId.endTime).format('MMM DD, YYYY hh:mm A')
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Duration</p>
                      <p className="text-sm font-semibold">
                        {selectedBooking.slotId?.startTime && selectedBooking.slotId?.endTime
                          ? `${dayjs(selectedBooking.slotId.endTime).diff(
                              dayjs(selectedBooking.slotId.startTime),
                              'minute'
                            )} mins`
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Slot Status</p>
                      <Badge>{selectedBooking.slotId?.status?.toUpperCase() || 'N/A'}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment & Financial Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Payment & Financial Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Payment Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Payment ID:</span>
                            <span className="font-mono text-xs">
                              {selectedBooking.paymentId?.razorpay_payment_id}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Method:</span>
                            <div className="flex items-center gap-1">
                              {getPaymentMethodIcon(selectedBooking.paymentId?.method)}
                              <span className="capitalize">
                                {selectedBooking.paymentId?.method}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge>{selectedBooking.paymentId?.status?.toUpperCase()}</Badge>
                          </div>
                          {selectedBooking.paymentId?.bank && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Bank:</span>
                              <span>{selectedBooking.paymentId.bank}</span>
                            </div>
                          )}
                          {selectedBooking.paymentId?.wallet && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Wallet:</span>
                              <span className="capitalize">{selectedBooking.paymentId.wallet}</span>
                            </div>
                          )}
                          {selectedBooking.paymentId?.vpa && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">UPI ID:</span>
                              <span className="font-mono text-xs">
                                {selectedBooking.paymentId.vpa}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Financial Breakdown</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Amount Paid:</span>
                            <span className="font-bold">
                              ₹{selectedBooking.paymentId?.amount?.toLocaleString('en-IN') || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Counselor Base Price:</span>
                            <span>
                              ₹{selectedBooking.slotId?.basePrice?.toLocaleString('en-IN') || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-blue-600">
                            <span>Platform Fee:</span>
                            <span className="font-semibold">
                              ₹
                              {selectedBooking.calculated?.platformFee?.toLocaleString('en-IN') ||
                                0}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Razorpay Fee:</span>
                            <span className="text-red-600">
                              -₹
                              {selectedBooking.paymentId?.fee?.toLocaleString('en-IN') || 0}
                            </span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>Net Amount Received:</span>
                            <span className="text-green-600">
                              ₹
                              {selectedBooking.calculated?.netAmountAfterRazorpayFee?.toLocaleString(
                                'en-IN'
                              ) || 0}
                            </span>
                          </div>
                          {selectedBooking.paymentId?.amount_refunded > 0 && (
                            <>
                              <Separator />
                              <div className="flex justify-between text-red-600">
                                <span>Amount Refunded:</span>
                                <span className="font-semibold">
                                  -₹
                                  {selectedBooking.paymentId.amount_refunded?.toLocaleString(
                                    'en-IN'
                                  )}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payout Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Payout Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Counselor Payout</p>
                      <p className="text-lg font-bold text-green-600">
                        ₹
                        {selectedBooking.payout?.amountToPayToCounselor?.toLocaleString('en-IN') ||
                          0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Client Refund</p>
                      <p className="text-lg font-bold text-blue-600">
                        ₹
                        {selectedBooking.payout?.amountToRefundToClient?.toLocaleString('en-IN') ||
                          0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Payout Status</p>
                      <div className="mt-1">{getPayoutBadge(selectedBooking.payout?.status)}</div>
                    </div>
                    <div>
                     
                      <p className="text-sm">
                        {selectedBooking.payout?.releasedAt ? (
                          <p className="text-sm font-medium text-muted-foreground">Released At :  dayjs(selectedBooking.payout.releasedAt).format('MMM DD, YYYY')</p>
                        ) : selectedBooking.payout?.refundedAt ? (
                          <p className="text-sm font-medium text-muted-foreground">Refunded At :  dayjs(selectedBooking.payout.refundedAt).format('MMM DD, YYYY')</p>
                         
                        ) : (
                           <p className="text-sm font-medium text-muted-foreground">N/A</p>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Refunds */}
                {selectedBooking.refunds && selectedBooking.refunds.length > 0 && (
                  <Card className="border-blue-300 bg-blue-50 dark:bg-blue-950/20">
                    <CardHeader>
                      <CardTitle className="text-sm text-blue-900 dark:text-blue-100">
                        Refund History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedBooking.refunds.map((refund, idx) => (
                          <div
                            key={idx}
                            className="bg-white dark:bg-gray-900 p-3 rounded-lg border"
                          >
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Refund ID</p>
                                <p className="font-mono text-xs">{refund.razorpay_refund_id}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Amount</p>
                                <p className="font-semibold">
                                  ₹{refund.amount?.toLocaleString('en-IN')}
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
                            {refund.errorDetails && (
                              <p className="text-xs text-muted-foreground mt-2">
                                <strong>Details:</strong> {refund.errorDetails}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Dispute Info */}

                <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
                  <CardHeader>
                    <CardTitle className="text-sm text-red-900 dark:text-red-100 flex items-center gap-2">
                      <FileWarning className="h-4 w-4" />
                      Dispute Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1">
                      <div>
                        {selectedBooking.dispute?.isDisputed ? (
                          <>
                            <Badge variant="destructive">Disputed</Badge>
                            <div>Status</div>
                            <Badge>{selectedBooking.dispute?.status}</Badge>
                          </>
                        ) : (
                          <Badge variant="success">Not Disputed</Badge>
                        )}
                      </div>
                    </div>
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
