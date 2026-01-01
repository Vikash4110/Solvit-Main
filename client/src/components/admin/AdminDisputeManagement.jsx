// components/admin/AdminDisputeManagement.jsx

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import {
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  FileX,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Phone,
  Loader2,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import DisputeDetailModal from './DisputeDetailModal';

// ✅ Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// ✅ Define timezone constant
const TIME_ZONE = 'Asia/Kolkata';

const AdminDisputeManagement = () => {
  const { getAllDisputes } = useAdminAuth();

  const [disputes, setDisputes] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    underReview: 0,
    resolvedValid: 0,
    resolvedInvalid: 0,
    closed: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDisputes: 0,
    limit: 20,
  });

  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchDisputes();
  }, [selectedStatus, currentPage]);

  const fetchDisputes = async () => {
    setLoading(true);
    const result = await getAllDisputes(selectedStatus, currentPage, 20, searchTerm);

    if (result.success) {
      setDisputes(result.data);
      setStats(result.stats);
      setPagination(result.pagination);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchDisputes();
  };

  const handleViewDetails = (dispute) => {
    setSelectedDispute(dispute);
    setShowDetailModal(true);
  };

  const handleDisputeUpdated = () => {
    setShowDetailModal(false);
    fetchDisputes();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved_valid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'resolved_invalid':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'under_review':
        return <Clock className="w-4 h-4" />;
      case 'resolved_valid':
        return <CheckCircle className="w-4 h-4" />;
      case 'resolved_invalid':
        return <XCircle className="w-4 h-4" />;
      case 'closed':
        return <FileX className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // ✅ Updated formatDate function using dayjs with timezone
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).tz(TIME_ZONE).format('MMM DD, YYYY hh:mm A');
  };

  // ✅ Additional helper for relative time (optional)
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = dayjs(dateString).tz(TIME_ZONE);
    const now = dayjs().tz(TIME_ZONE);
    const diffInHours = now.diff(date, 'hour');

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.format('MMM DD, YYYY');
    }
  };

  const getIssueTypeLabel = (issueType) => {
    const labels = {
      counselor_did_not_join: 'Counselor did not join',
      counselor_joined_late: 'Counselor joined late',
      session_ended_early: 'Session ended early',
      session_quality_poor: 'Poor session quality',
      counselor_not_proper_guidance: 'Improper guidance',
      counselor_rude_unprofessional: 'Rude/Unprofessional',
      counselor_made_uncomfortable: 'Made uncomfortable',
      audio_problem: 'Audio problem',
      video_problem: 'Video problem',
      internet_disconnection: 'Internet disconnection',
      other: 'Other',
    };
    return labels[issueType] || issueType;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dispute Management</h1>
            <p className="text-slate-600 mt-1">Review and manage client disputes</p>
          </div>
          {/* ✅ Show current time in IST */}
          <div className="text-right">
            <p className="text-sm text-slate-500">Current Time (IST)</p>
            <p className="text-sm font-medium text-slate-700">
              {dayjs().tz(TIME_ZONE).format('MMM DD, YYYY hh:mm A')}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Disputes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                <AlertTriangle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-yellow-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Under Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-yellow-600">{stats.underReview}</p>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Valid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-green-600">{stats.resolvedValid}</p>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-red-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Invalid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-red-600">{stats.resolvedInvalid}</p>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-gray-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Closed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-gray-600">{stats.closed}</p>
                <FileX className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search by booking Id, client name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select
                value={selectedStatus || 'all'}
                onValueChange={(value) => setSelectedStatus(value === 'all' ? '' : value)}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="resolved_valid">Resolved (Valid)</SelectItem>
                  <SelectItem value="resolved_invalid">Resolved (Invalid)</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disputes Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Disputes</CardTitle>
            <CardDescription>
              Showing {disputes.length} of {pagination.totalDisputes} disputes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : disputes.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">No disputes found</p>
                <p className="text-slate-500 text-sm mt-1">
                  {selectedStatus ? `No ${selectedStatus} disputes` : 'Try adjusting your filters'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Booking ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Client
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Issue Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Disputed At
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Evidence
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {disputes.map((dispute) => (
                        <tr key={dispute._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4">
                            <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                              {dispute._id}
                            </code>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              {dispute.clientId?.profilePicture ? (
                                <img
                                  src={dispute.clientId.profilePicture}
                                  alt={dispute.clientId.fullName}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-slate-900">
                                  {dispute.clientId?.fullName || 'N/A'}
                                </p>
                                <p className="text-sm text-slate-500">
                                  {dispute.clientId?.email || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-slate-700">
                              {getIssueTypeLabel(dispute.dispute?.issueType)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <Badge
                              variant="outline"
                              className={`flex items-center gap-1 w-fit ${getStatusColor(
                                dispute.dispute?.status
                              )}`}
                            >
                              {getStatusIcon(dispute.dispute?.status)}
                              <span className="capitalize">
                                {dispute.dispute?.status.replace('_', ' ')}
                              </span>
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Calendar className="w-4 h-4" />
                                {formatDate(dispute.dispute?.disputedAt)}
                              </div>
                              {/* ✅ Show relative time */}
                              <span className="text-xs text-slate-500">
                                ({formatRelativeTime(dispute.dispute?.disputedAt)})
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant="secondary" className="font-mono">
                              {dispute.dispute?.evidence?.length || 0} files
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(dispute)}
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
      </div>

      {/* Dispute Detail Modal */}
      {showDetailModal && selectedDispute && (
        <DisputeDetailModal
          bookingId={selectedDispute._id}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onDisputeUpdated={handleDisputeUpdated}
        />
      )}
    </div>
  );
};

export default AdminDisputeManagement;
