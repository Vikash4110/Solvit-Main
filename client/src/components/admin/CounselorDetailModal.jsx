// components/admin/CounselorDetailModal.jsx

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
  Calendar,
  Clock,
  Loader2,
  UserX,
  UserCheck,
  Activity,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  CreditCard,
  Languages,
  Shield,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';

dayjs.extend(utc);
dayjs.extend(timezone);
const TIMEZONE = 'Asia/Kolkata';

const CounselorDetailModal = ({ counselorId, isOpen, onClose, onCounselorUpdated }) => {
  const { getCounselorDetails, toggleCounselorBlock } = useAdminAuth();

  const [counselor, setCounselor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    if (isOpen && counselorId) {
      fetchCounselorDetails();
    }
  }, [counselorId, isOpen]);

  const fetchCounselorDetails = async () => {
    setLoading(true);
    const result = await getCounselorDetails(counselorId);

    if (result.success) {
      setCounselor(result.data);
    } else {
      toast.error(result.error);
      onClose();
    }
    setLoading(false);
  };

  const handleToggleBlock = async () => {
    if (
      !window.confirm(
        `Are you sure you want to ${counselor.isBlocked ? 'unblock' : 'block'} this counselor?`
      )
    ) {
      return;
    }

    setBlocking(true);
    const result = await toggleCounselorBlock(counselorId, !counselor.isBlocked);

    if (result.success) {
      toast.success(`Counselor ${counselor.isBlocked ? 'unblocked' : 'blocked'} successfully`);
      fetchCounselorDetails();
      onCounselorUpdated();
    } else {
      toast.error(result.error);
    }
    setBlocking(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dayjs(dateString).tz(TIMEZONE).format('MMM DD, YYYY hh:mm A');
  };

  const getExperienceLevelColor = (level) => {
    switch (level) {
      case 'Beginner':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Intermediate':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Experienced':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Specialist':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getApplicationStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'not_submitted':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getApplicationStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'rejected':
        return <XCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-white flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-purple-600" />
            Counselor Complete Profile
            {counselor && (
              <div className="ml-auto flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={getApplicationStatusColor(counselor.application?.applicationStatus)}
                >
                  {getApplicationStatusIcon(counselor.application?.applicationStatus)}
                  <span className="ml-1 capitalize">
                    {counselor.application?.applicationStatus?.replace('_', ' ') || 'Not Submitted'}
                  </span>
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    counselor.isBlocked
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : 'bg-green-100 text-green-800 border-green-200'
                  }
                >
                  {counselor.isBlocked ? (
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
              </div>
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
              <Card className="border-2 border-purple-200 bg-purple-50/30">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-6">
                    {counselor.profilePicture ? (
                      <img
                        src={counselor.profilePicture}
                        alt={counselor.fullName}
                        className="w-28 h-28 rounded-full object-cover border-4 border-purple-200 shadow-lg"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-full bg-purple-100 flex items-center justify-center border-4 border-purple-200">
                        <User className="w-14 h-14 text-purple-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-slate-900">{counselor.fullName}</h2>
                      <p className="text-slate-600 text-lg">@{counselor.username}</p>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <Badge variant="secondary" className="text-sm">
                          {counselor.gender}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-sm ${getExperienceLevelColor(counselor.experienceLevel)}`}
                        >
                          <Award className="w-4 h-4 mr-1" />
                          {counselor.experienceLevel}
                        </Badge>
                        <Badge variant="outline" className="text-sm">
                          {counselor.experienceYears} years experience
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <code className="text-xs bg-white px-3 py-1 rounded border border-slate-200">
                          ID: {counselor._id}
                        </code>
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
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <Label className="text-xs text-slate-600 font-semibold">Email Address</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <p className="text-sm text-slate-900 font-medium">{counselor.email}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <Label className="text-xs text-slate-600 font-semibold">Phone Number</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-green-500" />
                        <p className="text-sm text-slate-900 font-medium">{counselor.phone}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specialization & Languages */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                    Professional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm text-slate-700 font-semibold">
                      Specializations ({counselor.specialization?.length || 0})
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {counselor.specialization?.map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />

                  <div>
                    <Label className="text-sm text-slate-700 font-semibold">Languages Spoken</Label>
                    <div className="flex gap-2 mt-2">
                      {counselor.application?.languages && counselor.application.languages.length > 0 ? (
                        counselor.application.languages.map((lang, index) => (
                          <Badge key={index} variant="outline" className="text-sm">
                            <Languages className="w-4 h-4 mr-1" />
                            {lang}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500 italic">No languages specified</span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Label className="text-xs text-blue-700 font-semibold">Experience Years</Label>
                      <p className="text-2xl font-bold text-blue-700 mt-1">
                        {counselor.experienceYears} years
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <Label className="text-xs text-purple-700 font-semibold">Experience Level</Label>
                      <p className="text-2xl font-bold text-purple-700 mt-1">
                        {counselor.experienceLevel}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-green-600" />
                    Educational Qualifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {counselor.application?.education ? (
                    <div className="grid grid-cols-2 gap-6">
                      {/* Graduation */}
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-3">
                          <GraduationCap className="w-5 h-5 text-green-600" />
                          <Label className="text-sm text-green-700 font-bold">
                            Graduation
                          </Label>
                        </div>
                        {counselor.application.education.graduation?.degree ? (
                          <>
                            <p className="font-semibold text-slate-900 text-base">
                              {counselor.application.education.graduation.degree}
                            </p>
                            <p className="text-sm text-slate-700 mt-1">
                              {counselor.application.education.graduation.university || 'University not provided'}
                            </p>
                            <Badge variant="secondary" className="mt-2">
                              {counselor.application.education.graduation.year || 'Year not provided'}
                            </Badge>
                          </>
                        ) : (
                          <p className="text-sm text-slate-500 italic">Not provided</p>
                        )}
                      </div>

                      {/* Post Graduation */}
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <GraduationCap className="w-5 h-5 text-blue-600" />
                          <Label className="text-sm text-blue-700 font-bold">
                            Post Graduation
                          </Label>
                        </div>
                        {counselor.application.education.postGraduation?.degree ? (
                          <>
                            <p className="font-semibold text-slate-900 text-base">
                              {counselor.application.education.postGraduation.degree}
                            </p>
                            <p className="text-sm text-slate-700 mt-1">
                              {counselor.application.education.postGraduation.university || 'University not provided'}
                            </p>
                            <Badge variant="secondary" className="mt-2">
                              {counselor.application.education.postGraduation.year || 'Year not provided'}
                            </Badge>
                          </>
                        ) : (
                          <p className="text-sm text-slate-500 italic">Not provided</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>No education information available</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Professional Summary */}
              {counselor.application?.professionalSummary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-600" />
                      Professional Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {counselor.application.professionalSummary}
                      </p>
                      <div className="mt-2 text-xs text-slate-500">
                        {counselor.application.professionalSummary.length} / 1000 characters
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* License Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    License & Certification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {counselor.application?.license?.licenseNo ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                        <Label className="text-xs text-indigo-700 font-semibold">
                          License Number
                        </Label>
                        <p className="text-lg font-bold text-indigo-900 mt-1 font-mono">
                          {counselor.application.license.licenseNo}
                        </p>
                      </div>
                      <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                        <Label className="text-xs text-indigo-700 font-semibold">
                          Issuing Authority
                        </Label>
                        <p className="text-lg font-bold text-indigo-900 mt-1">
                          {counselor.application.license.issuingAuthority || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>No license information provided</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Bank Details */}
              <Card className="border-2 border-pink-200">
                <CardHeader className="bg-pink-50/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-pink-600" />
                    Bank Account Details (For Payouts)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {counselor.application?.bankDetails?.accountNo ? (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                        <Label className="text-xs text-pink-700 font-semibold">
                          Account Number
                        </Label>
                        <p className="text-lg font-bold text-pink-900 mt-2 font-mono">
                          {counselor.application.bankDetails.accountNo}
                        </p>
                      </div>
                      <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                        <Label className="text-xs text-pink-700 font-semibold">IFSC Code</Label>
                        <p className="text-lg font-bold text-pink-900 mt-2 font-mono">
                          {counselor.application.bankDetails.ifscCode}
                        </p>
                      </div>
                      <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                        <Label className="text-xs text-pink-700 font-semibold">Branch Name</Label>
                        <p className="text-lg font-bold text-pink-900 mt-2">
                          {counselor.application.bankDetails.branchName}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>No bank details provided</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    Uploaded Documents ({Object.values(counselor.application?.documents || {}).filter(Boolean).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {counselor.application?.documents &&
                  Object.values(counselor.application.documents).some(Boolean) ? (
                    <div className="grid grid-cols-2 gap-3">
                      {counselor.application.documents.resume && (
                        <a
                          href={counselor.application.documents.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 hover:shadow-md transition-all group"
                        >
                          <Download className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">Resume / CV</p>
                            <p className="text-xs text-slate-500">Click to download</p>
                          </div>
                        </a>
                      )}
                      {counselor.application.documents.degreeCertificate && (
                        <a
                          href={counselor.application.documents.degreeCertificate}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md transition-all group"
                        >
                          <Download className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              Degree Certificate
                            </p>
                            <p className="text-xs text-slate-500">Click to download</p>
                          </div>
                        </a>
                      )}
                      {counselor.application.documents.licenseCertificate && (
                        <a
                          href={counselor.application.documents.licenseCertificate}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200 hover:shadow-md transition-all group"
                        >
                          <Download className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              License Certificate
                            </p>
                            <p className="text-xs text-slate-500">Click to download</p>
                          </div>
                        </a>
                      )}
                      {counselor.application.documents.governmentId && (
                        <a
                          href={counselor.application.documents.governmentId}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200 hover:shadow-md transition-all group"
                        >
                          <Download className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">Government ID</p>
                            <p className="text-xs text-slate-500">Click to download</p>
                          </div>
                        </a>
                      )}
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>No documents uploaded</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Application Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Application & Account Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <Label className="text-xs text-slate-600 font-semibold">
                        Account Created
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <p className="text-xs text-slate-900">{formatDate(counselor.createdAt)}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <Label className="text-xs text-slate-600 font-semibold">Last Login</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <p className="text-xs text-slate-900">{formatDate(counselor.lastLogin)}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <Label className="text-xs text-slate-600 font-semibold">
                        Application Status
                      </Label>
                      <Badge
                        variant="outline"
                        className={`mt-2 ${getApplicationStatusColor(counselor.application?.applicationStatus)}`}
                      >
                        {getApplicationStatusIcon(counselor.application?.applicationStatus)}
                        <span className="ml-1 capitalize">
                          {counselor.application?.applicationStatus?.replace('_', ' ') || 'Not Submitted'}
                        </span>
                      </Badge>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <Label className="text-xs text-slate-600 font-semibold">Submitted At</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <p className="text-xs text-slate-900">
                          {formatDate(counselor.application?.applicationSubmittedAt)}
                        </p>
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
          {counselor && (
            <Button
              variant={counselor.isBlocked ? 'default' : 'destructive'}
              onClick={handleToggleBlock}
              disabled={blocking}
              size="lg"
            >
              {blocking ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : counselor.isBlocked ? (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Unblock Counselor
                </>
              ) : (
                <>
                  <UserX className="w-4 h-4 mr-2" />
                  Block Counselor
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CounselorDetailModal;
