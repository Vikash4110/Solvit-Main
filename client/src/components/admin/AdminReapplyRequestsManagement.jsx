import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import {
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Mail,
  Phone,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Send,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

dayjs.extend(utc);
dayjs.extend(timezone);
const TIMEZONE = 'Asia/Kolkata';

const AdminReapplyRequestsManagement = () => {
  const { getAllReapplyRequests, reviewReapplyRequest } = useAdminAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    decision: 'approved',
    request: null,
    reviewNote: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemsPerPage = 10;

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const result = await getAllReapplyRequests({ status: selectedStatus, limit: 100 });
    if (result.success) {
      setRequests(result.data || []);
    } else {
      toast.error(result.error || 'Failed to fetch re-apply appeal requests');
    }
    setLoading(false);
  }, [getAllReapplyRequests, selectedStatus]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleOpenReview = (request, decision) => {
    setReviewModal({
      isOpen: true,
      decision,
      request,
      reviewNote:
        decision === 'approved'
          ? 'Your appeal has been reviewed and approved. You may now update and resubmit your application.'
          : '',
    });
  };

  const handleConfirmReview = async (e) => {
    e.preventDefault();
    if (!reviewModal.request) return;

    if (reviewModal.decision === 'rejected' && !reviewModal.reviewNote.trim()) {
      toast.error('Please provide a reason for rejecting the appeal.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await reviewReapplyRequest(reviewModal.request._id, {
        decision: reviewModal.decision,
        reviewNote: reviewModal.reviewNote.trim(),
      });

      if (res.success) {
        toast.success(`Appeal ${reviewModal.decision} successfully`);
        setReviewModal({ isOpen: false, decision: 'approved', request: null, reviewNote: '' });
        fetchRequests();
      } else {
        toast.error(res.error || 'Failed to review appeal');
      }
    } catch {
      toast.error('An error occurred while reviewing the appeal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      const counselor = req.counselorId;
      const name = counselor?.fullName?.toLowerCase() || '';
      const email = counselor?.email?.toLowerCase() || '';
      const reason = req.appealReason?.toLowerCase() || '';
      return name.includes(q) || email.includes(q) || reason.includes(q);
    });
  }, [requests, searchTerm]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage) || 1;
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(start, start + itemsPerPage);
  }, [filteredRequests, currentPage]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).tz(TIMEZONE).format('MMM DD, YYYY hh:mm A');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <Badge
            variant="warning"
            className="bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 text-[11px] font-semibold"
          >
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge
            variant="success"
            className="bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-[11px] font-semibold"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge
            variant="destructive"
            className="bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 text-[11px] font-semibold"
          >
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-3 sm:p-5 lg:p-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-neutral-100">
              Re-apply Appeals Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400">
              Review and decide on reconsideration requests submitted by disqualified counselor
              applicants
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchRequests}
          disabled={loading}
          className="h-9 px-3.5 text-xs font-medium border-slate-200 dark:border-neutral-800"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">
              Total Appeals
            </CardTitle>
            <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-indigo-950 dark:text-indigo-100">
              {stats.total.toLocaleString()}
            </div>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400/80 mt-0.5">
              All submitted appeals
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.pending.toLocaleString()}
            </div>
            <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">
              Awaiting admin decision
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Approved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.approved.toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
              Re-application granted
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-rose-700 dark:text-rose-400">
              Rejected
            </CardTitle>
            <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {stats.rejected.toLocaleString()}
            </div>
            <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
              Disqualification maintained
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200/80 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by counselor name, email, or appeal justification..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 h-9 text-xs sm:text-sm bg-slate-50/70 dark:bg-neutral-800/70"
              />
            </div>

            <Select
              value={selectedStatus || 'all'}
              onValueChange={(val) => {
                setSelectedStatus(val === 'all' ? '' : val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-xs w-full sm:w-[170px]">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Appeals</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appeals Table */}
      <Card className="border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Loading appeal requests...
              </p>
            </div>
          ) : paginatedRequests.length === 0 ? (
            <div className="py-16 text-center">
              <RotateCcw className="w-10 h-10 text-slate-300 dark:text-neutral-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-neutral-300">
                No appeal requests found
              </p>
              <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">
                There are no re-application appeals matching the selected criteria.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-800/40 text-[11px] font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Counselor</th>
                  <th className="py-3 px-3">Attempt</th>
                  <th className="py-3 px-3">Disqualification Reason</th>
                  <th className="py-3 px-3">Appeal Explanation</th>
                  <th className="py-3 px-3">Submitted At</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/60">
                {paginatedRequests.map((req) => {
                  const counselor = req.counselorId || {};
                  return (
                    <tr
                      key={req._id}
                      className="hover:bg-slate-50/60 dark:hover:bg-neutral-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 rounded-full border">
                            <AvatarImage src={counselor.profilePicture} alt={counselor.fullName} />
                            <AvatarFallback className="text-[11px] font-bold">
                              {counselor.fullName?.[0] || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                              {counselor.fullName || 'Unknown Counselor'}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {counselor.email || 'N/A'}
                            </p>
                            {counselor.phone && (
                              <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {counselor.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <Badge variant="outline" className="text-[11px] font-medium">
                          Attempt {req.attemptNumber} of 3
                        </Badge>
                      </td>

                      <td className="py-3.5 px-3 max-w-[200px]">
                        <p
                          className="text-slate-600 dark:text-neutral-400 truncate"
                          title={req.hardRejectionReason}
                        >
                          {req.hardRejectionReason || 'No formal reason recorded'}
                        </p>
                      </td>

                      <td className="py-3.5 px-3 max-w-[240px]">
                        <p
                          className="text-slate-900 dark:text-neutral-200 line-clamp-2"
                          title={req.appealReason}
                        >
                          {req.appealReason}
                        </p>
                        {req.supportingDocumentUrl && (
                          <a
                            href={req.supportingDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Attached Proof
                          </a>
                        )}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-500 dark:text-neutral-400">
                        {formatDate(req.createdAt)}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {getStatusBadge(req.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => handleOpenReview(req, 'approved')}
                              className="h-7 px-2.5 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleOpenReview(req, 'rejected')}
                              className="h-7 px-2.5 text-[11px] font-medium"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 text-right">
                            {req.reviewedAt
                              ? `Reviewed ${dayjs(req.reviewedAt).format('MMM DD')}`
                              : 'Reviewed'}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredRequests.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-neutral-800 text-xs">
            <span className="text-slate-500">
              Page {currentPage} of {totalPages} ({filteredRequests.length} appeals)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-7 px-2 text-xs"
              >
                <ChevronLeft className="w-3 h-3 mr-1" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-7 px-2 text-xs"
              >
                Next <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Review Appeal Dialog */}
      <Dialog
        open={reviewModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setReviewModal({ isOpen: false, decision: 'approved', request: null, reviewNote: '' });
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
              {reviewModal.decision === 'approved'
                ? 'Approve Appeal Request'
                : 'Reject Appeal Request'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {reviewModal.decision === 'approved'
                ? 'Approving this appeal allows the counselor to update and resubmit their application under the Changes Requested workflow.'
                : 'Rejecting this appeal will maintain the disqualification status.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmReview} className="space-y-3 py-2">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700 text-xs space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white">
                Applicant: {reviewModal.request?.counselorId?.fullName}
              </p>
              <p className="text-slate-500 text-[11px]">
                Original Disqualification: {reviewModal.request?.hardRejectionReason || 'None'}
              </p>
              <p className="text-slate-700 dark:text-neutral-300 text-[11px] italic mt-1">
                &ldquo;{reviewModal.request?.appealReason}&rdquo;
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="reviewNote" className="text-xs font-medium">
                {reviewModal.decision === 'approved'
                  ? 'Guidance Note for Counselor (Optional)'
                  : 'Rejection Reason / Note *'}
              </Label>
              <Textarea
                id="reviewNote"
                rows={3}
                required={reviewModal.decision === 'rejected'}
                maxLength={2000}
                placeholder={
                  reviewModal.decision === 'approved'
                    ? 'Enter specific items or documents the counselor should correct when resubmitting...'
                    : 'Provide the reason why the appeal cannot be accepted...'
                }
                value={reviewModal.reviewNote}
                onChange={(e) =>
                  setReviewModal((prev) => ({ ...prev, reviewNote: e.target.value }))
                }
                className="text-xs leading-relaxed resize-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setReviewModal({
                    isOpen: false,
                    decision: 'approved',
                    request: null,
                    reviewNote: '',
                  })
                }
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className={
                  reviewModal.decision === 'approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {reviewModal.decision === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReapplyRequestsManagement;
