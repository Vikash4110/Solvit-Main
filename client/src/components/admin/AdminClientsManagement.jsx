// components/admin/AdminClientsManagement.jsx

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
import ClientDetailModal from './ClientDetailModal';

dayjs.extend(utc);
dayjs.extend(timezone);
const TIMEZONE = 'Asia/Kolkata';

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

  useEffect(() => {
    fetchClients();
  }, [selectedStatus, currentPage]);

  const fetchClients = async () => {
    setLoading(true);
    const result = await getAllClients(currentPage, 20, searchTerm, selectedStatus);

    if (result.success) {
      setClients(result.data.clients);
      setStats(result.data.stats);
      setPagination(result.data.pagination);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchClients();
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
    const result = await toggleClientBlock(clientId, !currentlyBlocked);

    if (result.success) {
      toast.success(`Client ${currentlyBlocked ? 'unblocked' : 'blocked'} successfully`);
      fetchClients();
    } else {
      toast.error(result.error);
    }
    setBlockingClientId(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).tz(TIMEZONE).format('MMM DD, YYYY hh:mm A');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Client Management</h1>
            <p className="text-slate-600 mt-1">Manage and monitor all registered clients</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                <UserCheck className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-red-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Blocked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-red-600">{stats.blocked}</p>
                <UserX className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">New This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-purple-600">{stats.newThisMonth}</p>
                <Activity className="w-8 h-8 text-purple-500" />
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
                    placeholder="Search by name, email, phone, ID, or username..."
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
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Clients</CardTitle>
            <CardDescription>
              Showing {clients.length} of {pagination.totalClients} clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">No clients found</p>
                <p className="text-slate-500 text-sm mt-1">
                  {selectedStatus ? `No ${selectedStatus} clients` : 'Try adjusting your filters'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Client
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Contact
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Joined
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {clients.map((client) => (
                        <tr key={client._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              {client.profilePicture ? (
                                <img
                                  src={client.profilePicture}
                                  alt={client.fullName}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Users className="w-5 h-5 text-blue-600" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-slate-900">{client.fullName}</p>
                                <p className="text-sm text-slate-500">@{client.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-slate-700">
                                <Mail className="w-4 h-4 text-slate-400" />
                                {client.email}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-700">
                                <Phone className="w-4 h-4 text-slate-400" />
                                {client.phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {client.address?.city ? (
                              <div className="flex items-center gap-2 text-sm text-slate-700">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                {client.address.city}
                                {client.address.area && `, ${client.address.area}`}
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">Not provided</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="w-4 h-4" />
                              {formatDate(client.createdAt)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <Badge
                              variant="outline"
                              className={`${
                                client.isBlocked
                                  ? 'bg-red-100 text-red-800 border-red-200'
                                  : 'bg-green-100 text-green-800 border-green-200'
                              }`}
                            >
                              {client.isBlocked ? (
                                <>
                                  <UserX className="w-3 h-3 mr-1" />
                                  Blocked
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Active
                                </>
                              )}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(client)}
                                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant={client.isBlocked ? 'default' : 'destructive'}
                                onClick={() => handleToggleBlock(client._id, client.isBlocked)}
                                disabled={blockingClientId === client._id}
                              >
                                {blockingClientId === client._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : client.isBlocked ? (
                                  <>
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    Unblock
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-4 h-4 mr-1" />
                                    Block
                                  </>
                                )}
                              </Button>
                            </div>
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
