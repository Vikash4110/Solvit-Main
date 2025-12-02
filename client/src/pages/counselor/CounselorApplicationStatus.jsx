import { useEffect } from 'react';
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
  Info,
} from 'lucide-react';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

// Animation variants
const pageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const iconVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: { 
    scale: 1, 
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  },
};

const ApplicationStatus = () => {
  const { counselor , counselorLogout } = useCounselorAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on application status
    if (!counselor) {
      navigate('/counselor/login');
    } else if (counselor.applicationStatus === 'approved') {
      navigate('/counselor/dashboard');
    } else if (!counselor.applicationStatus || counselor.applicationStatus === 'not_submitted') {
      navigate('/counselor/application');
    }
    // Stay on this page if status is 'pending' or 'rejected'
  }, [counselor, navigate]);

  if (
    !counselor ||
    counselor.applicationStatus === 'approved' ||
    counselor.applicationStatus === 'not_submitted'
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-primary-50 dark:from-neutral-900 dark:to-neutral-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary-700 dark:text-primary-400" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Redirecting...</p>
        </motion.div>
      </div>
    );
  }
  const handleLogout = async () => {
    try {
      await counselorLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getStatusContent = () => {
    switch (counselor.applicationStatus) {
      case 'pending':
        return {
          title: 'Application Under Review',
          message:
            'Your application has been submitted successfully and is currently under review. We will notify you via email once your application has been processed.',
          detail: 'This usually takes 24-48 hours.',
          icon: Clock,
          iconColor: 'text-warning-600 dark:text-warning-400',
          iconBg: 'bg-warning-100 dark:bg-warning-900/30',
          borderColor: 'border-warning-500 dark:border-warning-600',
          badgeVariant: 'warning',
          badgeText: 'Pending Review',
        };
      case 'rejected':
        return {
          title: 'Application Not Approved',
          message:
            "We're sorry, but your application has not been approved at this time. Please contact our support team for more information and guidance on next steps.",
          detail: 'You can resubmit your application after addressing the concerns.',
          icon: XCircle,
          iconColor: 'text-error-600 dark:text-error-400',
          iconBg: 'bg-error-100 dark:bg-error-900/30',
          borderColor: 'border-error-500 dark:border-error-600',
          badgeVariant: 'destructive',
          badgeText: 'Not Approved',
        };
      default:
        return {
          title: 'Application Status',
          message: 'Your application status is being processed.',
          detail: 'Please check back later.',
          icon: Info,
          iconColor: 'text-blue-600 dark:text-blue-400',
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          borderColor: 'border-blue-500 dark:border-blue-600',
          badgeVariant: 'secondary',
          badgeText: 'Processing',
        };
    }
  };

  const statusContent = getStatusContent();
  const StatusIcon = statusContent.icon;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-primary-50/30 to-neutral-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 mt-[80px] py-8 sm:py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-2xl w-full space-y-6">
        {/* Main Status Card */}
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <Card className={`border-l-4 ${statusContent.borderColor} shadow-xl hover:shadow-2xl transition-shadow duration-300`}>
            <CardContent className="p-6 sm:p-8 md:p-10">
              {/* Icon */}
              <motion.div
                variants={iconVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.3 }}
                className="flex justify-center mb-6"
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full ${statusContent.iconBg} shadow-lg`}>
                  <StatusIcon className={`h-10 w-10 sm:h-12 sm:w-12 ${statusContent.iconColor}`} aria-hidden="true" />
                </div>
              </motion.div>

              {/* Status Badge */}
              <div className="flex justify-center mb-4">
                <Badge 
                  variant={statusContent.badgeVariant}
                  className="text-xs sm:text-sm px-3 sm:px-4 py-1"
                >
                  {statusContent.badgeText}
                </Badge>
              </div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-neutral-900 dark:text-white mb-4"
              >
                {statusContent.title}
              </motion.h1>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm sm:text-base text-center text-neutral-600 dark:text-neutral-400 mb-2 leading-relaxed"
              >
                {statusContent.message}
              </motion.p>

              {/* Detail */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xs sm:text-sm text-center text-neutral-500 dark:text-neutral-500 mb-6"
              >
                {statusContent.detail}
              </motion.p>

              <Separator className="my-6" />

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-3"
              >
                <Button
                   onClick={handleLogout}
                  className="w-full h-11 sm:h-12 bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 dark:from-primary-600 dark:to-primary-500 dark:hover:from-primary-700 dark:hover:to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                  Logout
                </Button>

                {counselor.applicationStatus === 'rejected' && (
                  <Button
                    onClick={() => (window.location.href = 'mailto:support@solvit.com')}
                    variant="outline"
                    className="w-full h-11 sm:h-12 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white font-medium transition-all duration-300"
                  >
                    <Mail className="mr-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                    Contact Support
                  </Button>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Alert className="border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/20">
            <AlertCircle className="h-4 w-4 text-primary-700 dark:text-primary-400" />
            <AlertTitle className="text-sm sm:text-base font-semibold text-primary-900 dark:text-primary-100">
              Need Help?
            </AlertTitle>
            <AlertDescription className="text-xs sm:text-sm text-primary-800 dark:text-primary-200">
              If you have any questions about your application status, feel free to reach out to our support team at{' '}
              <a 
                href="mailto:support@solvit.com" 
                className="font-medium underline hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                support@solvit.com
              </a>
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Timeline for pending status */}
        {counselor.applicationStatus === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="border-neutral-200 dark:border-neutral-800">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-white mb-4">
                  What happens next?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white">
                        Application Submitted
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Your application is in our review queue
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-warning-500 dark:bg-warning-600 flex items-center justify-center animate-pulse">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white">
                        Under Review
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Our team is reviewing your credentials
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        Decision & Notification
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        You'll receive an email with our decision
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ApplicationStatus;
