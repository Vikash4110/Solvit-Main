import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCounselorAuth } from '../../contexts/CounselorAuthContext';
import { motion } from 'framer-motion';
import {
  Clock,
  XCircle,
  CheckCircle,
  AlertCircle,
  Mail,
  ArrowLeft,
  Loader2,
  FileEdit,
  Lock,
  FileText,
  Send,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

const cardVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const iconVariants = {
  initial: { scale: 0, rotate: -90 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 220,
      damping: 18,
    },
  },
};

const CounselorApplicationStatus = () => {
  const { counselor, counselorLogout, counselorLoading, submitAppeal, refreshProfile } =
    useCounselorAuth();
  const navigate = useNavigate();

  const [isAppealOpen, setIsAppealOpen] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [supportingDocumentUrl, setSupportingDocumentUrl] = useState('');
  const [submittingAppeal, setSubmittingAppeal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const applicationStatus =
    counselor?.applicationStatus || counselor?.application?.applicationStatus || 'not_submitted';
  const attempts =
    counselor?.applicationAttempts || counselor?.application?.applicationAttempts || 1;
  const adminFeedback = counselor?.adminFeedback || counselor?.application?.adminFeedback || '';
  const rejectionReason =
    counselor?.rejectionReason || counselor?.application?.rejectionReason || '';
  const reapplyAppealStatus =
    counselor?.reapplyAppealStatus || counselor?.application?.reapplyAppealStatus || 'none';

  const isLimitReached = attempts >= 3 && applicationStatus !== 'approved';

  useEffect(() => {
    if (counselorLoading) return;

    if (!counselor) {
      navigate('/counselor/login', { replace: true });
    } else if (applicationStatus === 'approved') {
      navigate('/counselor/dashboard', { replace: true });
    } else if (applicationStatus === 'not_submitted') {
      navigate('/counselor/application', { replace: true });
    }
  }, [counselor, applicationStatus, counselorLoading, navigate]);

  if (
    counselorLoading ||
    !counselor ||
    applicationStatus === 'approved' ||
    applicationStatus === 'not_submitted'
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-primary-50 dark:from-neutral-900 dark:to-neutral-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary-700 dark:text-primary-400" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Checking verification status...
          </p>
        </motion.div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await counselorLogout();
      navigate('/counselor/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProfile();
      toast.success('Status refreshed');
    } catch {
      toast.error('Failed to refresh status');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAppealSubmit = async (e) => {
    e.preventDefault();
    if (!appealReason.trim()) {
      toast.error('Please enter an explanation for your reconsideration appeal.');
      return;
    }

    setSubmittingAppeal(true);
    try {
      const res = await submitAppeal({
        appealReason: appealReason.trim(),
        supportingDocumentUrl: supportingDocumentUrl.trim(),
      });

      if (res.success) {
        toast.success('Appeal submitted successfully. Our team will review your file.');
        setIsAppealOpen(false);
        setAppealReason('');
        setSupportingDocumentUrl('');
        await refreshProfile();
      } else {
        toast.error(res.error || 'Failed to submit appeal');
      }
    } catch {
      toast.error('An error occurred while submitting your appeal');
    } finally {
      setSubmittingAppeal(false);
    }
  };

  const renderStatusCard = () => {
    // State 1: Maximum attempts reached
    if (isLimitReached) {
      return {
        title: 'Application Limit Reached',
        badge: '3 of 3 Attempts Exhausted',
        badgeVariant: 'destructive',
        borderColor: 'border-rose-500 dark:border-rose-600',
        iconBg: 'bg-rose-100 dark:bg-rose-950/40',
        iconColor: 'text-rose-600 dark:text-rose-400',
        icon: Lock,
        message:
          'You have reached the limit for applying as a counselor in solvit so you can not aply anymore here and if still something needs to be corrected or any mistake has benn there please do contact our support team fro furtehr application or related details',
        detail: 'Direct administrative intervention is required to unlock this account.',
      };
    }

    // State 2: Soft Rejection ("changes_requested")
    if (applicationStatus === 'changes_requested') {
      return {
        title: 'Action Required: Updates Needed',
        badge: `Attempt ${attempts} of 3 • Changes Requested`,
        badgeVariant: 'warning',
        borderColor: 'border-amber-500 dark:border-amber-600',
        iconBg: 'bg-amber-100 dark:bg-amber-950/40',
        iconColor: 'text-amber-600 dark:text-amber-400',
        icon: FileEdit,
        message:
          'Our clinical verification team reviewed your file and requested corrections before approval can proceed.',
        detail:
          'Your previous application data has been saved. Please review the guidance below, make the requested fixes, and resubmit.',
      };
    }

    // State 3: Appeal is pending review
    if (applicationStatus === 'rejected' && reapplyAppealStatus === 'pending') {
      return {
        title: 'Appeal Under Administrative Review',
        badge: `Attempt ${attempts} of 3 • Appeal Pending`,
        badgeVariant: 'secondary',
        borderColor: 'border-blue-500 dark:border-blue-600',
        iconBg: 'bg-blue-100 dark:bg-blue-950/40',
        iconColor: 'text-blue-600 dark:text-blue-400',
        icon: Clock,
        message:
          'Your formal appeal and supporting documentation have been received and are currently under evaluation by the Solvit credentials committee.',
        detail: 'Appeals are typically resolved within 24 to 48 business hours.',
      };
    }

    // State 4: Hard Rejection
    if (applicationStatus === 'rejected') {
      return {
        title: 'Application Not Approved',
        badge: `Attempt ${attempts} of 3 • Disqualified`,
        badgeVariant: 'destructive',
        borderColor: 'border-rose-500 dark:border-rose-600',
        iconBg: 'bg-rose-100 dark:bg-rose-950/40',
        iconColor: 'text-rose-600 dark:text-rose-400',
        icon: XCircle,
        message:
          'We regret to inform you that your application did not meet our credential verification requirements at this time.',
        detail:
          attempts < 3
            ? 'If you have additional certifications or believe this was in error, you may file an appeal for review.'
            : 'All available submission attempts have been exhausted.',
      };
    }

    // Default: Pending review
    return {
      title: 'Application Under Review',
      badge: `Attempt ${attempts} of 3 • Pending Review`,
      badgeVariant: 'warning',
      borderColor: 'border-amber-500 dark:border-amber-600',
      iconBg: 'bg-amber-100 dark:bg-amber-950/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
      icon: Clock,
      message:
        'Your application has been received and is currently under review by our clinical credentials team.',
      detail: 'Standard review time is 24 to 48 hours. You will receive an email upon decision.',
    };
  };

  const statusContent = renderStatusCard();
  const StatusIcon = statusContent.icon;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 mt-[80px] py-10 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-2xl w-full space-y-6">
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.1 }}
        >
          <Card
            className={`border-l-4 ${statusContent.borderColor} shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white dark:bg-neutral-900`}
          >
            <CardContent className="p-6 sm:p-8 md:p-10">
              <div className="flex justify-end mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                  Refresh Status
                </Button>
              </div>

              {/* Icon */}
              <motion.div
                variants={iconVariants}
                initial="initial"
                animate="animate"
                className="flex justify-center mb-5"
              >
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 sm:w-22 sm:h-22 rounded-2xl ${statusContent.iconBg} shadow-sm`}
                >
                  <StatusIcon className={`h-10 w-10 ${statusContent.iconColor}`} />
                </div>
              </motion.div>

              {/* Status Badge */}
              <div className="flex justify-center mb-3">
                <Badge
                  variant={statusContent.badgeVariant}
                  className="text-xs px-3 py-1 font-semibold"
                >
                  {statusContent.badgeText || statusContent.badge}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-center text-neutral-900 dark:text-white mb-3">
                {statusContent.title}
              </h1>

              {/* Message */}
              <p className="text-sm sm:text-base text-center text-neutral-700 dark:text-neutral-300 mb-2 leading-relaxed">
                {statusContent.message}
              </p>

              {/* Detail */}
              <p className="text-xs sm:text-sm text-center text-neutral-500 dark:text-neutral-400 mb-6">
                {statusContent.detail}
              </p>

              {/* Specific Guidance / Reason Box */}
              {applicationStatus === 'changes_requested' && adminFeedback && (
                <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-800/60 dark:bg-amber-950/30 text-left">
                  <div className="flex items-center gap-2 mb-1.5 text-amber-900 dark:text-amber-200 font-semibold text-xs uppercase tracking-wider">
                    <FileEdit className="h-4 w-4 shrink-0 text-amber-600" />
                    <span>Reviewer Instructions for Update:</span>
                  </div>
                  <p className="text-sm text-amber-900 dark:text-amber-100 whitespace-pre-wrap leading-relaxed">
                    {adminFeedback}
                  </p>
                </div>
              )}

              {applicationStatus === 'rejected' && rejectionReason && !isLimitReached && (
                <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50/70 dark:border-rose-800/60 dark:bg-rose-950/30 text-left">
                  <div className="flex items-center gap-2 mb-1.5 text-rose-900 dark:text-rose-200 font-semibold text-xs uppercase tracking-wider">
                    <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>Disqualification Reason:</span>
                  </div>
                  <p className="text-sm text-rose-900 dark:text-rose-100 whitespace-pre-wrap leading-relaxed">
                    {rejectionReason}
                  </p>
                </div>
              )}

              <Separator className="my-6" />

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Soft rejection -> Direct Update & Resubmit */}
                {applicationStatus === 'changes_requested' && !isLimitReached && (
                  <Button
                    onClick={() => navigate('/counselor/application')}
                    className="w-full h-11 sm:h-12 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md transition-all duration-200"
                  >
                    <FileEdit className="mr-2 h-4 w-4" />
                    Update & Resubmit Application
                  </Button>
                )}

                {/* Hard rejection with available attempts and no pending appeal -> Appeal Modal */}
                {applicationStatus === 'rejected' &&
                  !isLimitReached &&
                  reapplyAppealStatus !== 'pending' && (
                    <Button
                      onClick={() => setIsAppealOpen(true)}
                      className="w-full h-11 sm:h-12 bg-primary-700 hover:bg-primary-800 text-white font-semibold shadow-md transition-all duration-200"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Request Re-application / Appeal
                    </Button>
                  )}

                {/* Contact support button for hard rejection or limit reached */}
                {(applicationStatus === 'rejected' || isLimitReached) && (
                  <Button
                    onClick={() =>
                      (window.location.href =
                        'mailto:support@solvitcounselling.com?subject=Counselor%20Application%20Support%20Request')
                    }
                    variant="outline"
                    className="w-full h-11 sm:h-12 border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Support Team
                  </Button>
                )}

                {/* Back / Logout */}
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full h-10 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Timeline Information */}
        {applicationStatus === 'pending' && (
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            <Card className="border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <CardContent className="p-5 sm:p-6">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">
                  What Happens Next?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white">
                        Application Staged
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Credentials and uploaded certificates submitted to review queue.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white">
                        Clinical Verification (In Progress)
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Admin verifies licenses, degrees, and banking information.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white">
                        Notification & Onboarding
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Email update dispatched immediately upon committee review.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Support Alert */}
        <Alert className="border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70">
          <AlertCircle className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <AlertTitle className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Need Guidance?
          </AlertTitle>
          <AlertDescription className="text-xs text-neutral-600 dark:text-neutral-400">
            If you need help regarding verification requirements, email{' '}
            <a
              href="mailto:support@solvitcounselling.com"
              className="font-medium underline hover:text-primary-600 dark:hover:text-primary-300"
            >
              support@solvitcounselling.com
            </a>
            .
          </AlertDescription>
        </Alert>
      </div>

      {/* Appeal Submission Dialog */}
      <Dialog open={isAppealOpen} onOpenChange={setIsAppealOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-neutral-900">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-neutral-900 dark:text-white">
              Request Re-application / Appeal
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
              Explain why your application should be reconsidered. Provide details on clinical
              qualifications or any resolved credential issues.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAppealSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="appealReason" className="text-xs font-semibold">
                Explanation for Reconsideration *
              </Label>
              <Textarea
                id="appealReason"
                rows={4}
                required
                maxLength={2000}
                placeholder="Detail updated qualifications, clarified licensing authorities, or corrected credentials..."
                value={appealReason}
                onChange={(e) => setAppealReason(e.target.value)}
                className="text-xs leading-relaxed resize-none"
              />
              <p className="text-[11px] text-neutral-400 text-right">
                {appealReason.length} / 2000 characters
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="supportingDocumentUrl" className="text-xs font-semibold">
                Supporting Verification Link (Optional)
              </Label>
              <Input
                id="supportingDocumentUrl"
                type="url"
                placeholder="https://drive.google.com/... or portfolio link"
                value={supportingDocumentUrl}
                onChange={(e) => setSupportingDocumentUrl(e.target.value)}
                className="text-xs h-9"
              />
              <p className="text-[11px] text-neutral-400">
                Provide a publicly accessible link to updated licenses, transcripts, or proof.
              </p>
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAppealOpen(false)}
                disabled={submittingAppeal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submittingAppeal}
                className="bg-primary-700 hover:bg-primary-800 text-white"
              >
                {submittingAppeal ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Submitting Appeal...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    Submit Appeal
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default CounselorApplicationStatus;
