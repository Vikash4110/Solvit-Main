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
    methodBreakdown: [],
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
  const [methodFilter, setMethodFilter] = useState('all_methods'); // ✅ Changed from

  useEffect(() => {
    fetchPayments();
  }, [currentPage, dateFilter, methodFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    const result = await getAllPayments(currentPage, 20, searchTerm, dateFilter, methodFilter);

    if (result.success) {
      setPayments(result.data.payments);
      setStats(result.data.stats);
      setPagination(result.data.pagination);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2, // ✅ Changed from 0 to 2
      maximumFractionDigits: 2, // ✅ Show exact decimals
    }).format(amount || 0);
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
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'card':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upi':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'wallet':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'netbanking':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Payment Management</h1>
            <p className="text-slate-600 mt-1">Track and manage all client payments</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview">Overview & Payments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Total Payments */}
              <Card className="border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-bold text-slate-900">{stats.totalPayments}</p>
                    <CreditCard className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              {/* Total Revenue */}
              <Card className="border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(stats.totalRevenue)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        ₹{stats.totalRevenue?.toFixed(2)}
                      </p>
                    </div>
                    
                  </div>
                </CardContent>
              </Card>

              {/* Platform Revenue */}
              <Card className="border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Platform Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(stats.platformRevenue)}
                    </p>
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Net Revenue */}
              <Card className="border-t-4 border-t-indigo-500 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Net Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-indigo-600">
                      {formatCurrency(stats.netRevenue)}
                    </p>
                    <CheckCircle className="w-8 h-8 text-indigo-500" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">After Removing Razorpay fees</p>
                </CardContent>
              </Card>

              {/* Today's Revenue */}
              <Card className="border-t-4 border-t-orange-500 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Today's Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(stats.todayRevenue)}
                    </p>
                    <Calendar className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Razorpay Fees - UPDATED */}
              <Card className="border-t-4 border-t-red-500 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Razorpay Fees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(stats.razorpayFees)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        ₹{stats.razorpayFees?.toFixed(2)} (incl. GST)
                      </p>
                    </div>
                    <ArrowUpRight className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Method Breakdown */}
            {stats.methodBreakdown && stats.methodBreakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Payment Method Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.methodBreakdown.map((method) => (
                      <div
                        key={method._id}
                        className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {getMethodIcon(method._id)}
                          <p className="text-sm font-semibold text-slate-700 capitalize">
                            {method._id || 'Unknown'}
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">
                          {formatCurrency(method.totalAmount)}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">{method.count} transactions</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        type="text"
                        placeholder="Search by client name, payment ID, or order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Date Filter - FIXED */}
                  <Select value={dateFilter} onValueChange={(value) => setDateFilter(value)}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Date filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Payment Method Filter - FIXED */}
                  <Select value={methodFilter} onValueChange={(value) => setMethodFilter(value)}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <CreditCard className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_methods">All Methods</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="netbanking">Net Banking</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payments Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Payments</CardTitle>
                <CardDescription>
                  Showing {payments.length} of {pagination.totalPayments} payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">No payments found</p>
                    <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                              Payment ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                              Client
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                              Counselor
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                              Method
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                              Fees
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                              Date
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {payments.map((payment) => (
                            <tr key={payment._id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-4">
                                <div className="space-y-1">
                                  <code className="text-xs bg-slate-100 px-2 py-1 rounded block font-mono">
                                    {payment.razorpay_payment_id?.slice(-12)}
                                  </code>
                                  <code className="text-xs text-slate-500 font-mono">
                                    {payment.razorpay_order_id?.slice(-12)}
                                  </code>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  {payment.clientId?.profilePicture ? (
                                    <img
                                      src={payment.clientId.profilePicture}
                                      alt={payment.clientId.fullName}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                      <Users className="w-5 h-5 text-blue-600" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium text-slate-900">
                                      {payment.clientId?.fullName}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {payment.email || payment.clientId?.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  {payment.slotId?.counselorId?.profilePicture ? (
                                    <img
                                      src={payment.slotId.counselorId.profilePicture}
                                      alt={payment.slotId.counselorId.fullName}
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                      <Users className="w-4 h-4 text-purple-600" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-slate-900">
                                      {payment.slotId?.counselorId?.fullName}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="space-y-1">
                                  <p className="text-lg font-bold text-green-700">
                                    {formatCurrency(payment.amount)}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Counselor: {formatCurrency(payment.slotId?.basePrice || 0)}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <Badge
                                  variant="outline"
                                  className={`${getMethodColor(payment.method)} capitalize`}
                                >
                                  {getMethodIcon(payment.method)}
                                  <span className="ml-1">{payment.method}</span>
                                </Badge>
                                {payment.bank && (
                                  <p className="text-xs text-slate-500 mt-1">{payment.bank}</p>
                                )}
                                {payment.wallet && (
                                  <p className="text-xs text-slate-500 mt-1 capitalize">
                                    {payment.wallet}
                                  </p>
                                )}
                                {payment.vpa && (
                                  <p className="text-xs text-slate-500 mt-1 truncate max-w-[150px]">
                                    {payment.vpa}
                                  </p>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <Badge variant="secondary" className="font-mono text-xs">
                                  {formatCurrency((payment.fee || 0) + (payment.tax || 0))}
                                </Badge>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <Calendar className="w-4 h-4" />
                                  <span className="text-xs">{formatDate(payment.createdAt)}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetails(payment)}
                                  className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <p className="text-sm text-slate-600">
                          Page {pagination.currentPage} of {pagination.totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))
                            }
                            disabled={currentPage === pagination.totalPages}
                          >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <PaymentAnalytics />
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Detail Modal */}
      {showDetailModal && selectedPayment && (
        <PaymentDetailModal
          paymentId={selectedPayment._id}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default AdminPaymentsManagement;
