// components/admin/AdminClientsManagement.jsx - Modern, Responsive Admin Client Management

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import {
  Users,
  Search,
  Filter,
  Eye,
  UserX,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Languages,
  Heart,
  X,
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import ClientDetailModal from './ClientDetailModal';

dayjs.extend(utc);
dayjs.extend(timezone);
const TIMEZONE = 'Asia/Kolkata';

// Helper for initials
const getInitials = (name) => {
  if (!name) return 'C';
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const AdminClientsManagement = () => {
  const { getAllClients, toggleClientBlock } = useAdminAuth();

  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    newThisMonth: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalClients: 0,
    limit: 20,
  });

  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [blockingClientId, setBlockingClientId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchClients();
  }, [selectedStatus, currentPage]);

  const fetchClients = async () => {
    setLoading(true);
    const result = await getAllClients(currentPage, 20, searchTerm, selectedStatus);

    if (result.success) {
      setClients(result.data.clients || []);
      setStats(
        result.data.stats || {
          total: 0,
          active: 0,
          blocked: 0,
          newThisMonth: 0,
        }
      );
      setPagination(
        result.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalClients: 0,
          limit: 20,
        }
      );
    } else {
      toast.error(result.error || 'Failed to fetch clients');
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchClients();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    // Refresh with empty search
    setLoading(true);
    getAllClients(1, 20, '', selectedStatus).then((result) => {
      if (result.success) {
        setClients(result.data.clients || []);
        setStats(result.data.stats || { total: 0, active: 0, blocked: 0, newThisMonth: 0 });
        setPagination(
          result.data.pagination || { currentPage: 1, totalPages: 1, totalClients: 0, limit: 20 }
        );
      }
      setLoading(false);
    });
  };

  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setShowDetailModal(true);
  };

  const handleToggleBlock = async (clientId, currentlyBlocked) => {
    if (
      !window.confirm(
        `Are you sure you want to ${currentlyBlocked ? 'unblock' : 'block'} this client?`
      )
    ) {
      return;
    }

    setBlockingClientId(clientId);
    try {
      const result = await toggleClientBlock(clientId, !currentlyBlocked);

      if (result.success) {
        toast.success(`Client ${currentlyBlocked ? 'unblocked' : 'blocked'} successfully`);
        fetchClients();
      } else {
        toast.error(result.error || 'Failed to update client block status');
      }
    } catch (err) {
      console.error('Error toggling block status:', err);
      toast.error('Failed to update client status');
    } finally {
      setBlockingClientId(null);
    }
  };

  const handleCopyText = (text, type, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(`${type}-${id}`);
    toast.success(`${type} copied to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).tz(TIMEZONE).format('MMM DD, YYYY');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return dayjs(dateString).tz(TIMEZONE).format('hh:mm A');
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-neutral-100">
              Clients Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400">
              Monitor, inspect, and manage registered client profiles and platform activity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchClients}
            disabled={loading}
            className="h-9 px-3.5 text-xs font-medium border-slate-200 dark:border-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 4 High-Impact Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Clients */}
        <Card className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-blue-900 dark:text-blue-300">
              Total Clients
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-blue-950 dark:text-blue-100 tracking-tight">
              {stats.total?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-blue-700/80 dark:text-blue-400/80 mt-0.5">
              All registered clients
            </p>
          </CardContent>
        </Card>

        {/* Active Clients */}
        <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Active Clients
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-slate-900 dark:text-neutral-100 tracking-tight">
              {stats.active?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              {stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}% active rate` : 'In good standing'}
            </p>
          </CardContent>
        </Card>

        {/* Blocked Clients */}
        <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-rose-700 dark:text-rose-400">
              Blocked Clients
            </CardTitle>
            <UserX className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-400 tracking-tight">
              {stats.blocked?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
              Access suspended
            </p>
          </CardContent>
        </Card>

        {/* New This Month */}
        <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-purple-700 dark:text-purple-400">
              New This Month
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-slate-900 dark:text-neutral-100 tracking-tight">
              +{stats.newThisMonth?.toLocaleString('en-IN') || 0}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
              Registered this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by name, username, email, phone, or Client ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                value={selectedStatus || 'all'}
                onValueChange={(value) => {
                  setSelectedStatus(value === 'all' ? '' : value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger
                  leftIcon={<Filter className="w-3.5 h-3.5 text-slate-400" />}
                  className="h-9 text-xs w-full sm:w-[160px] bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-700"
                >
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="blocked">Blocked Only</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleSearch}
                size="sm"
                className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs shrink-0"
              >
                <Search className="w-3.5 h-3.5 mr-1.5" />
                Search
              </Button>
            </div>
          </div>

          {/* Quick filter pills */}
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800 overflow-x-auto text-xs">
            <span className="text-slate-400 font-medium mr-1 text-[11px]">Quick Filters:</span>
            <button
              onClick={() => {
                setSelectedStatus('');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedStatus === ''
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-slate-200'
              }`}
            >
              All Clients ({stats.total})
            </button>
            <button
              onClick={() => {
                setSelectedStatus('active');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedStatus === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-slate-200'
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => {
                setSelectedStatus('blocked');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedStatus === 'blocked'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-slate-200'
              }`}
            >
              Blocked ({stats.blocked})
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Clients Data Table */}
      <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
        <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-neutral-100">
                All Clients Directory
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                Showing {clients.length} of {pagination.totalClients} client accounts
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-neutral-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm font-medium">Fetching clients data...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Users className="w-12 h-12 text-slate-300 dark:text-neutral-700 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-800 dark:text-neutral-200">
                No clients found
              </p>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
                {searchTerm || selectedStatus
                  ? 'No clients match your filter criteria. Try searching with different terms or reset filters.'
                  : 'No client accounts have been registered yet.'}
              </p>
              {(searchTerm || selectedStatus) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedStatus('');
                    setCurrentPage(1);
                  }}
                  className="mt-4 text-xs font-medium"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-neutral-800/50 border-b border-slate-200/80 dark:border-neutral-800 text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Client Profile</th>
                    <th className="py-3.5 px-4">Contact Details</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Registration</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 sm:px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 text-xs sm:text-sm">
                  {clients.map((client) => {
                    const isClientBlocked = client.isBlocked;
                    return (
                      <tr
                        key={client._id}
                        className="hover:bg-slate-50/70 dark:hover:bg-neutral-800/40 transition-colors group"
                      >
                        {/* Client Identity */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 rounded-xl border border-slate-200 dark:border-neutral-700 shadow-xs shrink-0">
                              <AvatarImage
                                src={client.profilePicture}
                                alt={client.fullName}
                                className="object-cover"
                              />
                              <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-xs">
                                {getInitials(client.fullName)}
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-neutral-100 truncate group-hover:text-blue-600 transition-colors">
                                {client.fullName || 'Unnamed'}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                  @{client.username}
                                </span>
                                {client.gender && client.gender !== 'Prefer not to say' && (
                                  <>
                                    <span className="text-slate-300 dark:text-neutral-700">•</span>
                                    <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                                      {client.gender}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Details */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-neutral-300">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[170px] sm:max-w-[210px]">
                                {client.email || 'N/A'}
                              </span>
                              {client.email && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(client.email, 'Email', client._id)}
                                  title="Copy email"
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 p-0.5 rounded transition-colors"
                                >
                                  {copiedId === `Email-${client._id}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  )}
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-neutral-400">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{client.phone || 'N/A'}</span>
                              {client.phone && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(client.phone, 'Phone', client._id)}
                                  title="Copy phone"
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 p-0.5 rounded transition-colors"
                                >
                                  {copiedId === `Phone-${client._id}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4">
                          {client.address?.city ? (
                            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-neutral-300">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[140px]">
                                {client.address.city}
                                {client.address.area ? `, ${client.address.area}` : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Not provided</span>
                          )}
                        </td>

                        {/* Joined Date */}
                        <td className="py-3.5 px-4">
                          <div className="text-xs text-slate-700 dark:text-neutral-300">
                            <div className="flex items-center gap-1.5 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatDate(client.createdAt)}</span>
                            </div>
                            <span className="text-[11px] text-slate-400 pl-5">
                              {formatTime(client.createdAt)}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <Badge
                            variant="outline"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border shadow-xs ${
                              isClientBlocked
                                ? 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                            }`}
                          >
                            {isClientBlocked ? (
                              <>
                                <UserX className="w-3 h-3 shrink-0" />
                                <span>Blocked</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3 h-3 shrink-0" />
                                <span>Active</span>
                              </>
                            )}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 sm:px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(client)}
                              className="h-8 px-2.5 text-xs font-medium text-slate-700 dark:text-neutral-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-200 shadow-none"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1 text-blue-600 dark:text-blue-400" />
                              View
                            </Button>

                            <Button
                              size="sm"
                              variant={isClientBlocked ? 'default' : 'destructive'}
                              onClick={() => handleToggleBlock(client._id, isClientBlocked)}
                              disabled={blockingClientId === client._id}
                              className={`h-8 px-2.5 text-xs font-semibold shadow-none ${
                                isClientBlocked
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-rose-600 hover:bg-rose-700 text-white'
                              }`}
                            >
                              {blockingClientId === client._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : isClientBlocked ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5 mr-1" />
                                  Unblock
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3.5 h-3.5 mr-1" />
                                  Block
                                </>
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!loading && clients.length > 0 && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50">
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Showing page <span className="font-semibold text-slate-800 dark:text-neutral-200">{pagination.currentPage}</span> of{' '}
                <span className="font-semibold text-slate-800 dark:text-neutral-200">{pagination.totalPages}</span> ({pagination.totalClients} total clients)
              </p>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-3 text-xs font-medium border-slate-200 dark:border-neutral-800"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        size="sm"
                        variant={currentPage === pageNum ? 'default' : 'ghost'}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 p-0 text-xs font-semibold ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="h-8 px-3 text-xs font-medium border-slate-200 dark:border-neutral-800"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Detail Modal */}
      {showDetailModal && selectedClient && (
        <ClientDetailModal
          clientId={selectedClient._id}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onClientUpdated={fetchClients}
        />
      )}
    </div>
  );
};

export default AdminClientsManagement;
