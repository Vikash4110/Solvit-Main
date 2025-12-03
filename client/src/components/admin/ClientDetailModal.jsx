// components/admin/ClientDetailModal.jsx

import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import {
  X,
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

dayjs.extend(utc);
dayjs.extend(timezone);
const TIMEZONE = 'Asia/Kolkata';

const ClientDetailModal = ({ clientId, isOpen, onClose, onClientUpdated }) => {
  const { getClientDetails, toggleClientBlock } = useAdminAuth();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blocking, setBlocking] = useState(false);

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
      toast.error(result.error);
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
    const result = await toggleClientBlock(clientId, !client.isBlocked);

    if (result.success) {
      toast.success(`Client ${client.isBlocked ? 'unblocked' : 'blocked'} successfully`);
      fetchClientDetails();
      onClientUpdated();
    } else {
      toast.error(result.error);
    }
    setBlocking(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).tz(TIMEZONE).format('MMM DD, YYYY hh:mm A');
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-white flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" />
            Client Profile Details
            {client && (
              <Badge
                variant="outline"
                className={`ml-auto ${
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
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12 flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-6 pb-6">
              {/* Profile Overview */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-6">
                    {client.profilePicture ? (
                      <img
                        src={client.profilePicture}
                        alt={client.fullName}
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-12 h-12 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-slate-900">{client.fullName}</h2>
                      <p className="text-slate-500">@{client.username}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{client.gender}</Badge>
                        <Badge variant="outline">Client ID: {client._id}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-slate-600">Email Address</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <p className="text-sm text-slate-900">{client.email}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Phone Number</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <p className="text-sm text-slate-900">{client.phone}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              {client.address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-slate-600">City</Label>
                        <p className="text-sm text-slate-900 mt-1">
                          {client.address.city || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">Area</Label>
                        <p className="text-sm text-slate-900 mt-1">
                          {client.address.area || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">Pincode</Label>
                        <p className="text-sm text-slate-900 mt-1">
                          {client.address.pincode || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5 text-purple-600" />
                    Preferences & Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-slate-600">Preferred Languages</Label>
                    <div className="flex gap-2 mt-2">
                      {client.preferredLanguages?.map((lang) => (
                        <Badge key={lang} variant="secondary">
                          <Languages className="w-3 h-3 mr-1" />
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {client.prefferedTopics && client.prefferedTopics.length > 0 && (
                    <div>
                      <Label className="text-xs text-slate-600">Preferred Topics</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {client.prefferedTopics.map((topic) => (
                          <Badge key={topic} variant="outline">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bio */}
              {client.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-600" />
                      Bio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{client.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Account Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Account Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-slate-600">Account Created</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <p className="text-sm text-slate-900">{formatDate(client.createdAt)}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Last Login</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <p className="text-sm text-slate-900">{formatDate(client.lastLogin)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        )}

        {/* Footer Actions */}
        <div className="border-t px-6 py-4 bg-white flex-shrink-0 flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {client && (
            <Button
              variant={client.isBlocked ? 'default' : 'destructive'}
              onClick={handleToggleBlock}
              disabled={blocking}
            >
              {blocking ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : client.isBlocked ? (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Unblock Client
                </>
              ) : (
                <>
                  <UserX className="w-4 h-4 mr-2" />
                  Block Client
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailModal;
