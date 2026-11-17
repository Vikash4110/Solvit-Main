// components/admin/ApplicationDetail.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileEdit,
  RotateCcw,
  Info,
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Briefcase,
  FileText,
  Award,
  Languages,
  Banknote,
  Building,
  Loader2,
} from 'lucide-react';
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
import { Button } from '@/components/ui/button';

const ApplicationDetail = () => {
  const { counselorId } = useParams();
  const navigate = useNavigate();
  const { getCounselorApplication, updateApplicationStatus } = useAdminAuth();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // Dialog Modals State
  const [changesModalOpen, setChangesModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [adminFeedbackInput, setAdminFeedbackInput] = useState('');
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  useEffect(() => {
    fetchApplicationDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counselorId]);

  const fetchApplicationDetail = async () => {
    setLoading(true);
    const result = await getCounselorApplication(counselorId);
    if (result.success) {
      setApplication(result.data);
    } else {
      toast.error(result.error || 'Failed to fetch application details');
      navigate('/admin/dashboard');
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    setUpdating(true);
    const result = await updateApplicationStatus(counselorId, 'approved');
    if (result.success) {
      toast.success('Application approved successfully');
      fetchApplicationDetail();
    } else {
      toast.error(result.error || 'Failed to approve application');
    }
    setUpdating(false);
  };

  const openChangesModal = () => {
    setAdminFeedbackInput(application?.application?.adminFeedback || '');
    setChangesModalOpen(true);
  };

  const openRejectModal = () => {
    setRejectionReasonInput(application?.application?.rejectionReason || '');
    setRejectModalOpen(true);
  };

  const submitChangesRequested = async () => {
    if (!adminFeedbackInput.trim()) {
      toast.error('Please enter the required modifications or feedback for the counselor.');
      return;
    }

    setModalSubmitting(true);
    const result = await updateApplicationStatus(counselorId, 'changes_requested', {
      adminFeedback: adminFeedbackInput.trim(),
    });
    setModalSubmitting(false);

    if (result.success) {
      toast.success('Changes requested successfully. Counselor notified via email.');
      setChangesModalOpen(false);
      setAdminFeedbackInput('');
      fetchApplicationDetail();
    } else {
      toast.error(result.error || 'Failed to request changes');
    }
  };

  const submitRejection = async () => {
    if (!rejectionReasonInput.trim()) {
      toast.error('Please specify a rejection reason for the applicant.');
      return;
    }

    setModalSubmitting(true);
    const result = await updateApplicationStatus(counselorId, 'rejected', {
      rejectionReason: rejectionReasonInput.trim(),
    });
    setModalSubmitting(false);

    if (result.success) {
      toast.success('Application rejected. Counselor notified via email.');
      setRejectModalOpen(false);
      setRejectionReasonInput('');
      fetchApplicationDetail();
    } else {
      toast.error(result.error || 'Failed to reject application');
    }
  };

  const handleDownloadDocument = (documentUrl, documentName) => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    } else {
      toast.error('Document not available');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Application Not Found</h2>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'changes_requested':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Dashboard
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
                  <p className="text-sm text-gray-600">
                    Reviewing application for {application.fullName}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                    application.application?.applicationStatus
                  )}`}
                >
                  {application.application?.applicationStatus?.replace(/_/g, ' ')?.toUpperCase() ||
                    'NOT SUBMITTED'}
                </span>

                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Attempt {application.application?.applicationAttempts || 1} of 3
                </span>

                {(application.application?.applicationStatus === 'pending' ||
                  application.application?.applicationStatus === 'changes_requested') && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleApprove}
                      disabled={updating}
                      className="flex items-center px-3.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {updating ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={openChangesModal}
                      disabled={updating}
                      className="flex items-center px-3.5 py-1.5 border border-amber-300 text-xs font-medium rounded-md text-amber-800 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      <FileEdit className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                      Request Changes
                    </button>
                    <button
                      onClick={openRejectModal}
                      disabled={updating}
                      className="flex items-center px-3.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1.5" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center">
                <img
                  src={application.profilePicture || '/default-avatar.png'}
                  alt={application.fullName}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-gray-200"
                />
                <h2 className="text-xl font-bold text-gray-900">{application.fullName}</h2>
                <p className="text-sm text-gray-600 mb-2">
                  {Array.isArray(application.specialization)
                    ? application.specialization.join(', ')
                    : application.specialization || 'General Counseling'}
                </p>
                <p className="text-xs text-gray-500">
                  {application.experienceLevel} • {application.experienceYears} years
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-3 text-gray-400" />
                  <span>{application.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-3 text-gray-400" />
                  <span>{application.phone}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-3 text-gray-400" />
                  <span>{application.gender}</span>
                </div>
                {application.application?.applicationSubmittedAt && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                    <span>
                      Applied {formatDate(application.application.applicationSubmittedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Feedback / Rejection / Appeals Banners */}
            {application.application?.applicationStatus === 'changes_requested' && (
              <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50/90 text-amber-900 shadow-xs">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-amber-900">
                      Changes Requested by Admin
                    </h4>
                    <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-wrap">
                      {application.application.adminFeedback || 'No feedback note provided.'}
                    </p>
                    <p className="text-[11px] text-amber-700/80 mt-1">
                      The counselor can update their pre-filled profile and resubmit directly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {application.application?.applicationStatus === 'rejected' && (
              <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50/90 text-rose-900 shadow-xs">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-rose-900">
                      Application Disqualified (Hard Rejection)
                    </h4>
                    <p className="text-xs text-rose-800 leading-relaxed whitespace-pre-wrap">
                      <span className="font-semibold">Reason:</span>{' '}
                      {application.application.rejectionReason ||
                        'Application does not meet eligibility requirements.'}
                    </p>
                    {application.application.reapplyAppealStatus === 'pending' && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-white/80 border border-rose-200 flex items-center justify-between">
                        <span className="text-xs text-slate-700">
                          The counselor has submitted a formal re-apply appeal.
                        </span>
                        <Link
                          to="/admin/reapply-requests"
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
                        >
                          Review Appeal in Queue
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border mb-6">
              <div className="border-b">
                <nav className="flex -mb-px">
                  {[
                    { id: 'personal', label: 'Personal Info', icon: User },
                    { id: 'education', label: 'Education', icon: BookOpen },
                    { id: 'experience', label: 'Experience', icon: Briefcase },
                    { id: 'documents', label: 'Documents', icon: FileText },
                    { id: 'bank', label: 'Bank Details', icon: Banknote },
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <IconComponent className="h-4 w-4 mr-2" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6">
                {/* Personal Information Tab */}
                {activeTab === 'personal' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Basic Information
                        </h3>
                        <dl className="space-y-3">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                            <dd className="text-sm text-gray-900">{application.fullName}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Username</dt>
                            <dd className="text-sm text-gray-900">{application.username}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="text-sm text-gray-900">{application.email}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Phone</dt>
                            <dd className="text-sm text-gray-900">{application.phone}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Gender</dt>
                            <dd className="text-sm text-gray-900">{application.gender}</dd>
                          </div>
                        </dl>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Professional Details
                        </h3>
                        <dl className="space-y-3">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Specialization</dt>
                            <dd className="text-sm text-gray-900">
                              {application.specialization.map((specialization) => {
                                {
                                  specialization;
                                }
                              })}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Experience Level</dt>
                            <dd className="text-sm text-gray-900">{application.experienceLevel}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">
                              Years of Experience
                            </dt>
                            <dd className="text-sm text-gray-900">
                              {application.experienceYears} years
                            </dd>
                          </div>
                          {application.application?.languages &&
                            application.application.languages.length > 0 && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500">Languages</dt>
                                <dd className="text-sm text-gray-900">
                                  {application.application.languages.join(', ')}
                                </dd>
                              </div>
                            )}
                        </dl>
                      </div>
                    </div>

                    {/* Professional Summary */}
                    {application.application?.professionalSummary && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">
                          Professional Summary
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {application.application.professionalSummary}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* License Information */}
                    {application.application?.license && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          <Award className="h-5 w-5 inline mr-2" />
                          License Information
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {application.application.license.licenseNo && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500">
                                  License Number
                                </dt>
                                <dd className="text-sm text-gray-900">
                                  {application.application.license.licenseNo}
                                </dd>
                              </div>
                            )}
                            {application.application.license.issuingAuthority && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500">
                                  Issuing Authority
                                </dt>
                                <dd className="text-sm text-gray-900">
                                  {application.application.license.issuingAuthority}
                                </dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Education Tab */}
                {activeTab === 'education' && (
                  <div className="space-y-6">
                    {/* Graduation */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Graduation</h3>
                      {application.application?.education?.graduation ? (
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">University</dt>
                            <dd className="text-sm text-gray-900">
                              {application.application.education.graduation.university ||
                                'Not provided'}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Degree</dt>
                            <dd className="text-sm text-gray-900">
                              {application.application.education.graduation.degree ||
                                'Not provided'}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Year</dt>
                            <dd className="text-sm text-gray-900">
                              {application.application.education.graduation.year || 'Not provided'}
                            </dd>
                          </div>
                        </dl>
                      ) : (
                        <p className="text-sm text-gray-500">No graduation information provided</p>
                      )}
                    </div>

                    {/* Post Graduation */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Post Graduation (Optional)
                      </h3>
                      {application.application?.education?.postGraduation ? (
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">University</dt>
                            <dd className="text-sm text-gray-900">
                              {application.application.education.postGraduation.university ||
                                'Not provided'}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Degree</dt>
                            <dd className="text-sm text-gray-900">
                              {application.application.education.postGraduation.degree ||
                                'Not provided'}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Year</dt>
                            <dd className="text-sm text-gray-900">
                              {application.application.education.postGraduation.year ||
                                'Not provided'}
                            </dd>
                          </div>
                        </dl>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No post-graduation information provided
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Experience Tab */}
                {activeTab === 'experience' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Professional Experience
                      </h3>
                      {application.application?.experience ? (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {application.application.experience}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No experience information provided</p>
                      )}
                    </div>

                    {/* Languages */}
                    {application.application?.languages &&
                      application.application.languages.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            <Languages className="h-5 w-5 inline mr-2" />
                            Languages
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {application.application.languages.map((language, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {language}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Resume */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Resume</h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleDownloadDocument(
                                  application.application?.documents?.resume,
                                  'resume'
                                )
                              }
                              className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() =>
                                handleDownloadDocument(
                                  application.application?.documents?.resume,
                                  'resume'
                                )
                              }
                              className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {application.application?.documents?.resume
                            ? 'Document available'
                            : 'No document uploaded'}
                        </p>
                      </div>

                      {/* Degree Certificate */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Degree Certificate</h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleDownloadDocument(
                                  application.application?.documents?.degreeCertificate,
                                  'degree-certificate'
                                )
                              }
                              className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() =>
                                handleDownloadDocument(
                                  application.application?.documents?.degreeCertificate,
                                  'degree-certificate'
                                )
                              }
                              className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {application.application?.documents?.degreeCertificate
                            ? 'Document available'
                            : 'No document uploaded'}
                        </p>
                      </div>

                      {/* Government ID */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Government ID</h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleDownloadDocument(
                                  application.application?.documents?.governmentId,
                                  'government-id'
                                )
                              }
                              className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() =>
                                handleDownloadDocument(
                                  application.application?.documents?.governmentId,
                                  'government-id'
                                )
                              }
                              className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {application.application?.documents?.governmentId
                            ? 'Document available'
                            : 'No document uploaded'}
                        </p>
                      </div>

                      {/* License Certificate */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900">License Certificate</h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleDownloadDocument(
                                  application.application?.documents?.licenseCertificate,
                                  'license-certificate'
                                )
                              }
                              className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() =>
                                handleDownloadDocument(
                                  application.application?.documents?.licenseCertificate,
                                  'license-certificate'
                                )
                              }
                              className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {application.application?.documents?.licenseCertificate
                            ? 'Document available'
                            : 'No document uploaded'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank Details Tab */}
                {activeTab === 'bank' && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        <Building className="h-5 w-5 inline mr-2" />
                        Bank Account Details
                      </h3>
                      {application.application?.bankDetails ? (
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Account Number</dt>
                            <dd className="text-sm text-gray-900 font-mono">
                              {application.application.bankDetails.accountNo || 'Not provided'}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">IFSC Code</dt>
                            <dd className="text-sm text-gray-900 font-mono">
                              {application.application.bankDetails.ifscCode || 'Not provided'}
                            </dd>
                          </div>
                          <div className="md:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Branch Name</dt>
                            <dd className="text-sm text-gray-900">
                              {application.application.bankDetails.branchName || 'Not provided'}
                            </dd>
                          </div>
                        </dl>
                      ) : (
                        <p className="text-sm text-gray-500">No bank details provided</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Changes Modal */}
      <Dialog open={changesModalOpen} onOpenChange={setChangesModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700">
              <FileEdit className="w-5 h-5 text-amber-600" />
              Request Modifications
            </DialogTitle>
            <DialogDescription>
              Specify the missing or incorrect details that {application?.fullName} needs to update.
              The counselor will be able to update their pre-filled application directly without
              admin re-authorization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-800 text-xs text-slate-600 dark:text-neutral-300 space-y-1">
              <p>
                <span className="font-semibold text-slate-900 dark:text-neutral-100">
                  Applicant:
                </span>{' '}
                {application?.fullName}
              </p>
              <p>
                <span className="font-semibold text-slate-900 dark:text-neutral-100">Email:</span>{' '}
                {application?.email}
              </p>
              <p>
                <span className="font-semibold text-slate-900 dark:text-neutral-100">
                  Current Attempt:
                </span>{' '}
                {application?.application?.applicationAttempts || 1} of 3
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="detailAdminFeedback" className="text-xs font-semibold">
                Feedback for Counselor <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="detailAdminFeedback"
                rows={4}
                value={adminFeedbackInput}
                onChange={(e) => setAdminFeedbackInput(e.target.value)}
                placeholder="e.g. Please upload an official degree certificate showing degree completion date and provide an updated government ID."
                className="text-xs leading-relaxed"
              />
              <p className="text-[11px] text-slate-500">
                This note will appear prominently on the counselor&apos;s status screen and will be
                dispatched to their email.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setChangesModalOpen(false)}
              disabled={modalSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={submitChangesRequested}
              disabled={modalSubmitting || !adminFeedbackInput.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {modalSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Send Changes Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Application Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-700">
              <XCircle className="w-5 h-5 text-rose-600" />
              Reject Application
            </DialogTitle>
            <DialogDescription>
              Disqualify {application?.fullName}&apos;s counselor application. The applicant will
              only be able to re-apply by filing a formal appeal with Solvit management.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-neutral-800 text-xs text-slate-600 dark:text-neutral-300 space-y-1">
              <p>
                <span className="font-semibold text-slate-900 dark:text-neutral-100">
                  Applicant:
                </span>{' '}
                {application?.fullName}
              </p>
              <p>
                <span className="font-semibold text-slate-900 dark:text-neutral-100">Email:</span>{' '}
                {application?.email}
              </p>
              <p>
                <span className="font-semibold text-slate-900 dark:text-neutral-100">
                  Current Attempt:
                </span>{' '}
                {application?.application?.applicationAttempts || 1} of 3
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="detailRejectionReason" className="text-xs font-semibold">
                Reason for Disqualification <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="detailRejectionReason"
                rows={4}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Ineligible credentials: Provided license has expired or does not meet clinical practice requirements."
                className="text-xs leading-relaxed"
              />
              <p className="text-[11px] text-slate-500">
                This official reason will be displayed to the counselor and sent in the notification
                email.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
              disabled={modalSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={submitRejection}
              disabled={modalSubmitting || !rejectionReasonInput.trim()}
            >
              {modalSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationDetail;
