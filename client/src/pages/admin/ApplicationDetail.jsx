// components/admin/ApplicationDetail.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Download,
  Eye,
  CheckCircle,
  XCircle,
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
} from 'lucide-react';

const ApplicationDetail = () => {
  const { counselorId } = useParams();
  const navigate = useNavigate();
  const { getCounselorApplication, updateApplicationStatus } = useAdminAuth();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    fetchApplicationDetail();
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

  const handleStatusUpdate = async (status) => {
    let rejectionReason = '';

    if (status === 'rejected') {
      rejectionReason = prompt('Please enter rejection reason:');
      if (!rejectionReason) return;
    }

    setUpdating(true);
    const result = await updateApplicationStatus(counselorId, status, rejectionReason);
    if (result.success) {
      toast.success(`Application ${status} successfully`);
      fetchApplicationDetail(); // Refresh data
    } else {
      toast.error(result.error || 'Failed to update status');
    }
    setUpdating(false);
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
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
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
            <div className="flex items-center justify-between">
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

              <div className="flex items-center space-x-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.application?.applicationStatus)}`}
                >
                  {application.application?.applicationStatus?.toUpperCase() || 'NOT SUBMITTED'}
                </span>

                {application.application?.applicationStatus === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate('approved')}
                      disabled={updating}
                      className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {updating ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('rejected')}
                      disabled={updating}
                      className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {updating ? 'Rejecting...' : 'Reject'}
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
                <p className="text-sm text-gray-600 mb-2">{application.specialization}</p>
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
                            <dd className="text-sm text-gray-900">{application.specialization}</dd>
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
    </div>
  );
};

export default ApplicationDetail;
