// components/admin/AdminCouponsManagement.jsx - Enterprise Promotions & Coupon Management

import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import {
  TicketPercent,
  Plus,
  Search,
  RefreshCw,
  Copy,
  Check,
  Eye,
  Trash2,
  Calendar,
  Users,
  BadgePercent,
  TrendingUp,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  CreditCard,
  Receipt,
  ExternalLink,
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
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import CreateCouponModal from './CreateCouponModal';

export default function AdminCouponsManagement() {
  const {
    getAllCouponsAdmin,
    toggleCouponStatusAdmin,
    getCouponRedemptionsAdmin,
    deleteCouponAdmin,
  } = useAdminAuth();

  // State management
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Summary Metrics State
  const [summary, setSummary] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    totalRedemptions: 0,
    totalDiscountGiven: 0,
    totalRevenueDriven: 0,
  });

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [couponTypeFilter, setCouponTypeFilter] = useState('all');

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCoupons: 0,
    totalPages: 1,
  });

  // Redemptions Audit Modal State
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showRedemptionsModal, setShowRedemptionsModal] = useState(false);
  const [redemptionsLoading, setRedemptionsLoading] = useState(false);
  const [redemptionsData, setRedemptionsData] = useState({
    redemptions: [],
    stats: { totalRedemptions: 0, totalDiscountGiven: 0, totalRevenueDriven: 0 },
    pagination: { page: 1, limit: 10, totalRedemptions: 0, totalPages: 1 },
  });
  const [redemptionsPage, setRedemptionsPage] = useState(1);

  // Delete/Archive Confirmation Modal State
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Create Coupon Modal State (Handled in Phase 10)
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch Coupons Data
  const fetchCoupons = useCallback(
    async (targetPage = page) => {
      setLoading(true);
      try {
        const result = await getAllCouponsAdmin({
          page: targetPage,
          limit,
          search: searchTerm,
          status: statusFilter,
          couponType: couponTypeFilter,
        });

        if (result.success && result.data) {
          setCoupons(result.data.coupons || []);
          setPagination(result.data.pagination || { page: 1, limit, totalCoupons: 0, totalPages: 1 });
          if (result.data.summary) {
            setSummary(result.data.summary);
          }
        } else {
          toast.error(result.error || 'Failed to fetch coupons');
        }
      } catch (err) {
        console.error('Error in fetchCoupons:', err);
        toast.error('An unexpected error occurred while loading coupons.');
      } finally {
        setLoading(false);
      }
    },
    [getAllCouponsAdmin, page, limit, searchTerm, statusFilter, couponTypeFilter]
  );

  useEffect(() => {
    fetchCoupons(1);
  }, [searchTerm, statusFilter, couponTypeFilter]);

  // Handle Copy Coupon Code
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Handle Instant Status Toggle (Emergency Kill-Switch)
  const handleToggleStatus = async (coupon) => {
    const originalState = coupon.isActive;
    const newStatus = !originalState;

    // Optimistic UI update
    setCoupons((prev) =>
      prev.map((c) => (c._id === coupon._id ? { ...c, isActive: newStatus } : c))
    );
    setTogglingId(coupon._id);

    try {
      const result = await toggleCouponStatusAdmin(coupon._id);
      if (result.success) {
        toast.success(result.message || `Coupon ${newStatus ? 'activated' : 'deactivated'}.`);
        // Refresh summary counters
        fetchCoupons(page);
      } else {
        // Revert on failure
        setCoupons((prev) =>
          prev.map((c) => (c._id === coupon._id ? { ...c, isActive: originalState } : c))
        );
        toast.error(result.error || 'Failed to update coupon status');
      }
    } catch (err) {
      console.error('Toggle status error:', err);
      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: originalState } : c))
      );
      toast.error('Error toggling coupon status');
    } finally {
      setTogglingId(null);
    }
  };

  // Open Redemptions Audit Modal
  const handleOpenRedemptions = async (coupon, auditPage = 1) => {
    setSelectedCoupon(coupon);
    setShowRedemptionsModal(true);
    setRedemptionsLoading(true);
    setRedemptionsPage(auditPage);

    try {
      const result = await getCouponRedemptionsAdmin(coupon._id, { page: auditPage, limit: 10 });
      if (result.success && result.data) {
        setRedemptionsData({
          redemptions: result.data.redemptions || [],
          stats: result.data.stats || { totalRedemptions: 0, totalDiscountGiven: 0, totalRevenueDriven: 0 },
          pagination: result.data.pagination || { page: 1, limit: 10, totalRedemptions: 0, totalPages: 1 },
        });
      } else {
        toast.error(result.error || 'Failed to load redemption details');
      }
    } catch (err) {
      console.error('Error loading redemptions:', err);
      toast.error('Error loading redemptions');
    } finally {
      setRedemptionsLoading(false);
    }
  };

  // Confirm Delete / Archive
  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;
    setDeleting(true);

    try {
      const result = await deleteCouponAdmin(couponToDelete._id);
      if (result.success) {
        toast.success(result.message || 'Coupon updated successfully.');
        setCouponToDelete(null);
        fetchCoupons(page);
      } else {
        toast.error(result.error || 'Failed to delete coupon');
      }
    } catch (err) {
      console.error('Error deleting coupon:', err);
      toast.error('Error executing delete action');
    } finally {
      setDeleting(false);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCouponTypeFilter('all');
    setPage(1);
  };

  // Helper: compute coupon status badge
  const getCouponStatusBadge = (coupon) => {
    const isExpired = new Date(coupon.validUntil) < new Date();
    const isExhausted =
      coupon.maxTotalUses !== null && coupon.currentTotalUses >= coupon.maxTotalUses;

    if (!coupon.isActive) {
      return (
        <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">
          <XCircle className="w-3 h-3 mr-1 text-slate-500" />
          Inactive
        </Badge>
      );
    }

    if (isExpired) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <Clock className="w-3 h-3 mr-1 text-red-500" />
          Expired
        </Badge>
      );
    }

    if (isExhausted) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <AlertCircle className="w-3 h-3 mr-1 text-amber-500" />
          Exhausted
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
        Active
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Promotions & Coupons
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage promotional campaigns, discount rules, validity dates, and client redemptions
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCoupons(page)}
            disabled={loading}
            className="h-9"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Coupon
          </Button>
        </div>
      </div>

      {/* 2. Platform Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Campaigns */}
        <Card className="border border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Campaigns
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TicketPercent className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {summary.activeCoupons}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Out of {summary.totalCoupons} total coupons
            </p>
          </CardContent>
        </Card>

        {/* Total Redemptions */}
        <Card className="border border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Redemptions
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {summary.totalRedemptions}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Successful checkout uses
            </p>
          </CardContent>
        </Card>

        {/* Total Discount Given */}
        <Card className="border border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Discounts Disbursed
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <BadgePercent className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              ₹{summary.totalDiscountGiven.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Savings provided to clients
            </p>
          </CardContent>
        </Card>

        {/* Gross Revenue Driven */}
        <Card className="border border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Revenue Driven
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              ₹{summary.totalRevenueDriven.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Gross promo booking volume
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <Card className="border border-slate-200/80 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by coupon code or campaign description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 bg-white"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-44">
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
                <SelectTrigger className="h-9 bg-white">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="w-full sm:w-48">
              <Select value={couponTypeFilter} onValueChange={(val) => setCouponTypeFilter(val)}>
                <SelectTrigger className="h-9 bg-white">
                  <SelectValue placeholder="All Campaign Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaign Types</SelectItem>
                  <SelectItem value="standard">Standard Promo</SelectItem>
                  <SelectItem value="first_booking">First Booking Only</SelectItem>
                  <SelectItem value="counselor_exclusive">Counselor Exclusive</SelectItem>
                  <SelectItem value="referral">Referral Promo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filters */}
            {(searchTerm || statusFilter !== 'all' || couponTypeFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 text-slate-600 hover:text-slate-900"
              >
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 4. Coupons Data Table */}
      <Card className="border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/75 border-b border-slate-200">
              <TableRow>
                <TableHead className="font-semibold text-xs text-slate-600 uppercase">Coupon Code</TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 uppercase">Type</TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 uppercase">Discount Rate</TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 uppercase">Redemptions / Cap</TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 uppercase">Validity Window</TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 uppercase">Status & Kill-Switch</TableHead>
                <TableHead className="font-semibold text-xs text-slate-600 uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-44 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      <p className="text-sm font-medium">Loading coupon campaigns...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-44 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <TicketPercent className="w-8 h-8 text-slate-300" />
                      <p className="text-base font-semibold text-slate-700">No coupons found</p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your search criteria or create a new coupon campaign.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setShowCreateModal(true)}
                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Create Coupon
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => {
                  const isPercentage = coupon.discountType === 'percentage';
                  const usagePercentage =
                    coupon.maxTotalUses && coupon.maxTotalUses > 0
                      ? Math.min(100, Math.round((coupon.currentTotalUses / coupon.maxTotalUses) * 100))
                      : null;

                  return (
                    <TableRow key={coupon._id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Code & Description */}
                      <TableCell className="align-top py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(coupon.code)}
                            className="text-slate-400 hover:text-slate-700 transition-colors"
                            title="Copy Code"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs line-clamp-2">
                          {coupon.description}
                        </p>
                      </TableCell>

                      {/* Type Badges */}
                      <TableCell className="align-top py-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          {coupon.firstBookingOnly ? (
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[11px] font-medium">
                              First Booking
                            </Badge>
                          ) : coupon.applicableCounselors && coupon.applicableCounselors.length > 0 ? (
                            <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[11px] font-medium">
                              Counselor Exclusive
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-600 text-[11px] font-medium">
                              Standard
                            </Badge>
                          )}
                          {coupon.isAutoApplied && (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                              Auto-Apply
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Discount Rate */}
                      <TableCell className="align-top py-3.5">
                        <div className="font-semibold text-slate-900 text-sm">
                          {isPercentage ? `${coupon.discountValue}% OFF` : `Flat ₹${coupon.discountValue} OFF`}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 space-y-0.5">
                          {isPercentage && coupon.maxDiscountAmount && (
                            <p>Max ₹{coupon.maxDiscountAmount} cap</p>
                          )}
                          {coupon.minOrderAmount > 0 && (
                            <p>Min order ₹{coupon.minOrderAmount}</p>
                          )}
                        </div>
                      </TableCell>

                      {/* Redemptions / Cap */}
                      <TableCell className="align-top py-3.5">
                        <div className="font-medium text-slate-900 text-sm">
                          {coupon.currentTotalUses}{' '}
                          <span className="text-slate-400 font-normal">
                            / {coupon.maxTotalUses ? coupon.maxTotalUses : '∞'}
                          </span>
                        </div>
                        {usagePercentage !== null && (
                          <div className="w-24 mt-1.5">
                            <Progress value={usagePercentage} className="h-1.5" />
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              {usagePercentage}% consumed
                            </span>
                          </div>
                        )}
                      </TableCell>

                      {/* Validity Window */}
                      <TableCell className="align-top py-3.5">
                        <div className="text-xs text-slate-700 font-medium">
                          {dayjs(coupon.validUntil).format('DD MMM YYYY')}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Starts: {dayjs(coupon.validFrom).format('DD MMM YYYY')}
                        </div>
                      </TableCell>

                      {/* Status & Instant Kill-Switch Toggle */}
                      <TableCell className="align-top py-3.5">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={coupon.isActive}
                            disabled={togglingId === coupon._id}
                            onCheckedChange={() => handleToggleStatus(coupon)}
                            className="data-[state=checked]:bg-emerald-600"
                            title={coupon.isActive ? 'Click to deactivate immediately' : 'Click to activate'}
                          />
                          {getCouponStatusBadge(coupon)}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="align-top py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenRedemptions(coupon)}
                            className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            title="View Redemptions Audit"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCouponToDelete(coupon)}
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete or Archive Coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        {!loading && coupons.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.totalCoupons)} of{' '}
              {pagination.totalCoupons} coupons
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = Math.max(1, page - 1);
                  setPage(newPage);
                  fetchCoupons(newPage);
                }}
                disabled={page <= 1}
                className="h-8 px-2.5"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-xs font-medium text-slate-700 px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = Math.min(pagination.totalPages, page + 1);
                  setPage(newPage);
                  fetchCoupons(newPage);
                }}
                disabled={page >= pagination.totalPages}
                className="h-8 px-2.5"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 5. Redemptions Audit Dialog Modal */}
      <Dialog open={showRedemptionsModal} onOpenChange={setShowRedemptionsModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  Redemptions Audit: {selectedCoupon?.code}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-1">
                  Historical ledger of all clients who successfully applied this promotion
                </DialogDescription>
              </div>
            </div>

            {/* Quick Metrics Header inside Dialog */}
            <div className="grid grid-cols-3 gap-3 pt-3 mt-2 border-t border-slate-100">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Redemptions</span>
                <p className="text-base font-bold text-slate-800">{redemptionsData.stats.totalRedemptions}</p>
              </div>
              <div className="bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
                <span className="text-[10px] font-semibold text-amber-600 uppercase">Total Discount</span>
                <p className="text-base font-bold text-amber-700">₹{redemptionsData.stats.totalDiscountGiven}</p>
              </div>
              <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                <span className="text-[10px] font-semibold text-emerald-600 uppercase">Revenue Collected</span>
                <p className="text-base font-bold text-emerald-700">₹{redemptionsData.stats.totalRevenueDriven}</p>
              </div>
            </div>
          </DialogHeader>

          {/* Redemptions Table Content */}
          <div className="flex-1 overflow-y-auto p-6 pt-2">
            {redemptionsLoading ? (
              <div className="py-12 text-center text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                <p className="text-xs font-medium">Fetching redemption history...</p>
              </div>
            ) : redemptionsData.redemptions.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">No redemptions yet</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  This coupon has not been used by any clients yet.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/75 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="text-xs font-semibold uppercase">Client</TableHead>
                    <TableHead className="text-xs font-semibold uppercase">Session Details</TableHead>
                    <TableHead className="text-xs font-semibold uppercase">Financials</TableHead>
                    <TableHead className="text-xs font-semibold uppercase">Payment ID</TableHead>
                    <TableHead className="text-xs font-semibold uppercase">Redeemed At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redemptionsData.redemptions.map((item) => (
                    <TableRow key={item._id} className="text-xs hover:bg-slate-50/50">
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={item.clientId?.profilePic} />
                            <AvatarFallback className="text-[10px] bg-blue-100 text-blue-800 font-bold">
                              {item.clientId?.fullName ? item.clientId.fullName[0].toUpperCase() : 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-slate-800">{item.clientId?.fullName || 'Client'}</p>
                            <p className="text-[11px] text-slate-400">{item.clientId?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <p className="font-medium text-slate-700">
                          {item.bookingId?.bookingDate || 'Booked Session'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {item.bookingId?.bookingTime} ({item.bookingId?.duration || 50} mins)
                        </p>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="font-semibold text-slate-800">
                          Final: ₹{item.finalAmount}
                        </div>
                        <div className="text-[11px] text-emerald-600 font-medium">
                          Saved: -₹{item.discountAmount}
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 font-mono text-[11px] text-slate-600">
                        {item.paymentId?.razorpay_payment_id || 'Online Payment'}
                      </TableCell>
                      <TableCell className="py-2.5 text-slate-500 text-[11px]">
                        {dayjs(item.redeemedAt).format('DD MMM YYYY, hh:mm A')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 6. Safe Delete / Archive Confirmation Dialog */}
      <AlertDialog open={Boolean(couponToDelete)} onOpenChange={() => setCouponToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">
              Confirm Action for Coupon "{couponToDelete?.code}"
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-600 space-y-2 mt-2">
              <p>
                Are you sure you want to remove or archive this promotion?
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                <strong>Enterprise Safety Guard:</strong> If this coupon has existing client redemptions, it will be automatically <em>deactivated and archived</em> rather than permanently deleted, ensuring all historical financial invoices and audit ledgers remain intact.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 7. Create Coupon Modal Form */}
      <CreateCouponModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => fetchCoupons(1)}
      />
    </div>
  );
}
