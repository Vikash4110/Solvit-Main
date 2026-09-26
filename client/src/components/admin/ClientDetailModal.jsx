// components/admin/ClientDetailModal.jsx - Spacious, Uncongested & Professional Client Dossier

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Heart,
  Languages,
  FileText,
  Loader2,
  UserX,
  UserCheck,
  Activity,
  Check,
  Copy,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Hash,
  AlertCircle,
  CheckCircle2,
  Share2,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

dayjs.extend(utc);
dayjs.extend(timezone);
const TIMEZONE = 'Asia/Kolkata';

// Helper component for clean, copyable metadata fields
function CopyableField({ label, value, mono = true, truncate = false, className = '' }) {
  const [copied, setCopied] = useState(false);

  if (!value && value !== 0) return null;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    toast.success(`${label || 'Value'} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <p className="text-[11px] font-semibold text-slate-500 dark:text-neutral-400 tracking-wider uppercase">
          {label}
        </p>
      )}
      <div
        onClick={handleCopy}
        title="Click to copy"
        className="group flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50/80 hover:bg-slate-100/90 dark:bg-neutral-800/60 dark:hover:bg-neutral-800 border border-slate-200/80 dark:border-neutral-700/60 transition-all cursor-pointer select-all"
      >
        <span
          className={`text-xs text-slate-800 dark:text-neutral-200 ${
            mono ? 'font-mono' : 'font-medium'
          } ${truncate ? 'truncate max-w-[200px]' : 'break-all'}`}
        >
          {String(value)}
        </span>
        <button
          type="button"
          className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 transition-colors p-0.5"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

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

const ClientDetailModal = ({ clientId, isOpen, onClose, onClientUpdated }) => {
  const { getClientDetails, toggleClientBlock } = useAdminAuth();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blocking, setBlocking] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && clientId) {
      fetchClientDetails();
    }
  }, [clientId, isOpen]);

  const fetchClientDetails = async () => {
    setLoading(true);
    const result = await getClientDetails(clientId);

    if (result.success) {
      setClient(result.data);
    } else {
      toast.error(result.error || 'Failed to fetch client details');
      onClose();
    }
    setLoading(false);
  };

  const handleToggleBlock = async () => {
    if (
      !window.confirm(
        `Are you sure you want to ${client.isBlocked ? 'unblock' : 'block'} this client?`
      )
    ) {
      return;
    }

    setBlocking(true);
    try {
      const result = await toggleClientBlock(clientId, !client.isBlocked);

      if (result.success) {
        toast.success(`Client ${client.isBlocked ? 'unblocked' : 'blocked'} successfully`);
        fetchClientDetails();
        if (onClientUpdated) onClientUpdated();
      } else {
        toast.error(result.error || 'Failed to update client block status');
      }
    } catch (err) {
      console.error('Error toggling block:', err);
      toast.error('Failed to update client status');
    } finally {
      setBlocking(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).tz(TIMEZONE).format('MMM DD, YYYY • hh:mm A');
  };

  const copyFullDossier = () => {
    if (!client) return;
    const info = [
      `--- CLIENT DOSSIER ---`,
      `Full Name: ${client.fullName || 'N/A'}`,
      `Username: @${client.username || 'N/A'}`,
      `Email: ${client.email || 'N/A'}`,
      `Phone: ${client.phone || 'N/A'}`,
      `Gender: ${client.gender || 'N/A'}`,
      `City: ${client.address?.city || 'N/A'}`,
      `Area: ${client.address?.area || 'N/A'}`,
      `Pincode: ${client.address?.pincode || 'N/A'}`,
      `Status: ${client.isBlocked ? 'Blocked' : 'Active'}`,
      `Registered: ${formatDate(client.createdAt)}`,
      `Total Bookings: ${client.stats?.totalBookings ?? 0}`,
      `Completed Sessions: ${client.stats?.completedBookings ?? 0}`,
      `Total Spent: ₹${client.stats?.totalSpent ?? 0}`,
    ].join('\n');

    navigator.clipboard.writeText(info);
    toast.success('Complete client details copied to clipboard');
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        size="xl"
        className="w-[96vw] sm:w-[90vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[92vh] sm:max-h-[88vh] p-0 flex flex-col overflow-hidden bg-slate-50/70 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 shadow-2xl rounded-2xl"
      >
        {/* Modal Header */}
        <DialogHeader className="px-5 py-4 sm:px-6 sm:py-4.5 border-b border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-2">
                  Client Profile Details
                </DialogTitle>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                  Member registered on {client?.createdAt ? formatDate(client.createdAt) : 'N/A'}
                </p>
              </div>
            </div>

            {client && (
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${
                    client.isBlocked
                      ? 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      client.isBlocked ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'
                    }`}
                  />
                  <span>{client.isBlocked ? 'Blocked Account' : 'Active Client'}</span>
                </Badge>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Modal Scrollable Body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 flex-1 text-slate-500 dark:text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2.5" />
            <span className="text-sm font-medium">Loading client profile details...</span>
          </div>
        ) : !client ? (
          <div className="flex flex-col items-center justify-center py-20 flex-1 text-slate-500">
            <AlertCircle className="w-10 h-10 text-slate-400 mb-2" />
            <p className="text-sm font-semibold">Client profile could not be loaded</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Hero Profile Banner */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-4 sm:p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar className="h-16 w-16 sm:h-18 sm:w-18 rounded-2xl border-2 border-blue-100 dark:border-blue-900/50 shadow-sm shrink-0">
                    <AvatarImage
                      src={client.profilePicture}
                      alt={client.fullName}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl">
                      {getInitials(client.fullName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-neutral-100 truncate">
                      {client.fullName || 'Unnamed Client'}
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                        @{client.username}
                      </span>
                      {client.gender && (
                        <span className="text-slate-600 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                          {client.gender}
                        </span>
                      )}
                      <span className="text-slate-300 dark:text-neutral-700">•</span>
                      <span className="font-mono text-[11px] text-slate-500 dark:text-neutral-400">
                        ID: {client._id}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyFullDossier}
                  className="text-xs h-8 px-3 font-medium border-slate-200 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800 shrink-0 w-full sm:w-auto"
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                  Copy Client Dossier
                </Button>
              </div>

              {/* Engagement Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-neutral-800">
                <div className="bg-slate-50/80 dark:bg-neutral-800/40 p-3 rounded-xl border border-slate-100 dark:border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                      Total Bookings
                    </p>
                    <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-neutral-100 mt-0.5">
                      {client.stats?.totalBookings ?? 0}
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="bg-slate-50/80 dark:bg-neutral-800/40 p-3 rounded-xl border border-slate-100 dark:border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                      Completed
                    </p>
                    <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {client.stats?.completedBookings ?? 0}
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="bg-slate-50/80 dark:bg-neutral-800/40 p-3 rounded-xl border border-slate-100 dark:border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                      Cancelled
                    </p>
                    <p className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      {client.stats?.cancelledBookings ?? 0}
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="bg-slate-50/80 dark:bg-neutral-800/40 p-3 rounded-xl border border-slate-100 dark:border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                      Total Spent
                    </p>
                    <p className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      ₹{client.stats?.totalSpent ?? 0}
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs for Clean Organized Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
              <TabsList className="bg-slate-200/70 dark:bg-neutral-800/80 p-1 rounded-xl w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
                <TabsTrigger
                  value="overview"
                  className="rounded-lg text-xs font-semibold px-4 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-neutral-100 data-[state=active]:shadow-xs"
                >
                  <User className="w-3.5 h-3.5 mr-1.5" />
                  Contact & Address
                </TabsTrigger>
                <TabsTrigger
                  value="preferences"
                  className="rounded-lg text-xs font-semibold px-4 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-neutral-100 data-[state=active]:shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Preferences & Bio
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Contact & Address */}
              <TabsContent value="overview" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact Information */}
                  <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-xs">
                    <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-neutral-800">
                      <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        Contact Channels
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3.5">
                      <CopyableField label="Email Address" value={client.email} mono={false} />
                      <CopyableField label="Phone / Mobile Number" value={client.phone} />

                      <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-neutral-400">Gender:</span>
                          <span className="font-semibold text-slate-800 dark:text-neutral-200">
                            {client.gender || 'Not specified'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-neutral-400">Account Created:</span>
                          <span className="font-medium text-slate-800 dark:text-neutral-200">
                            {formatDate(client.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-neutral-400">Last Active:</span>
                          <span className="font-medium text-slate-800 dark:text-neutral-200">
                            {formatDate(client.lastLogin)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Address & Residential Details */}
                  <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-start">
                    <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-neutral-800">
                      <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        Location & Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      {client.address?.city || client.address?.area || client.address?.pincode ? (
                        <div className="space-y-3.5">
                          <div className="grid grid-cols-2 gap-3">
                            <CopyableField
                              label="City"
                              value={client.address.city || 'N/A'}
                              mono={false}
                            />
                            <CopyableField
                              label="Pincode"
                              value={client.address.pincode || 'N/A'}
                            />
                          </div>
                          <CopyableField
                            label="Area / Neighborhood"
                            value={client.address.area || 'N/A'}
                            mono={false}
                          />

                          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>
                              {client.address.city}
                              {client.address.area ? `, ${client.address.area}` : ''}
                              {client.address.pincode ? ` - ${client.address.pincode}` : ''}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 rounded-xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200/60 dark:border-neutral-800 text-center space-y-1.5 my-auto">
                          <MapPin className="w-6 h-6 text-slate-400 mx-auto" />
                          <p className="text-xs font-bold text-slate-700 dark:text-neutral-300">
                            No Address Registered
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-neutral-400 max-w-xs mx-auto">
                            Client has not entered a residential address on their profile yet.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab 2: Preferences & Bio */}
              <TabsContent value="preferences" className="space-y-4 mt-0">
                {/* Languages & Mental Health Topics */}
                <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-xs">
                  <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-neutral-800">
                    <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                      Consultation Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {/* Communication Languages */}
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                        Preferred Languages
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {client.preferredLanguages && client.preferredLanguages.length > 0 ? (
                          client.preferredLanguages.map((lang, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="bg-purple-50 text-purple-700 border border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 text-xs px-3 py-1 font-medium flex items-center gap-1.5"
                            >
                              <Languages className="w-3.5 h-3.5 text-purple-500" />
                              {lang}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500">Not specified</span>
                        )}
                      </div>
                    </div>

                    {/* Preferred Topics */}
                    <div className="pt-3 border-t border-slate-100 dark:border-neutral-800">
                      <p className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                        Mental Health & Focus Areas
                      </p>
                      {client.prefferedTopics && client.prefferedTopics.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {client.prefferedTopics.map((topic, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="bg-indigo-50/50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800 text-xs px-3 py-1 font-medium flex items-center gap-1.5"
                            >
                              <Heart className="w-3 h-3 text-indigo-500" />
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No specific focus areas selected.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Bio */}
                <Card className="bg-white dark:bg-neutral-900 border-slate-200/80 dark:border-neutral-800 shadow-xs">
                  <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-neutral-800">
                    <CardTitle className="text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      Client Statement / Bio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {client.bio ? (
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed bg-amber-50/40 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-100 dark:border-amber-900/40 italic">
                        "{client.bio}"
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No bio or personal notes entered.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Modal Footer Actions */}
        <DialogFooter className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-shrink-0 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-9 px-4 font-medium border-slate-300 dark:border-neutral-700"
          >
            Close
          </Button>

          {client && (
            <Button
              type="button"
              size="sm"
              variant={client.isBlocked ? 'default' : 'destructive'}
              onClick={handleToggleBlock}
              disabled={blocking}
              className={`text-xs h-9 px-4 font-semibold shadow-xs ${
                client.isBlocked
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {blocking ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              ) : client.isBlocked ? (
                <UserCheck className="w-3.5 h-3.5 mr-1.5" />
              ) : (
                <UserX className="w-3.5 h-3.5 mr-1.5" />
              )}
              {client.isBlocked ? 'Unblock Client Account' : 'Block Client Account'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailModal;
