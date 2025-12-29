import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Video, ArrowLeft, Clock, Calendar, User, Sparkles, Shield } from 'lucide-react';

export function MeetingDetailsScreen({ sessionData, handleOnClickJoin, handleClickGoBack }) {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <div className="flex flex-1 flex-col justify-center w-full">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="space-y-6"
      >
        {/* Header Section */}
        <div className="text-center space-y-3">
          <Badge className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-700 hover:bg-primary-200 border-0 px-3 py-1.5 dark:bg-primary-900/30 dark:text-primary-400">
            <Sparkles className="h-3 w-3" />
            Ready to Join
          </Badge>
          <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
            Your Session Awaits
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            Everything is set up. Join when you're ready to begin the counseling session.
          </p>
        </div>

        

        {/* Action Buttons - Homepage Button Style */}
        <div className="space-y-3">
          <Button
            onClick={handleOnClickJoin}
            className="group relative overflow-hidden w-full h-12 bg-gradient-to-br from-primary-900 to-primary-800 hover:from-primary-800 hover:to-primary-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 hover:scale-[1.02] dark:from-primary-600 dark:to-primary-700 dark:hover:from-primary-700 dark:hover:to-primary-600"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Video className="h-5 w-5" />
              Join Session Now
            </span>
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </Button>

          <Button
            onClick={handleClickGoBack}
            variant="outline"
            className="w-full h-12 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-primary-900 font-semibold rounded-xl border-2 border-neutral-200 hover:border-primary-300 shadow-sm hover:shadow-md transition-all duration-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-700 dark:hover:border-neutral-600"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div>

        {/* Privacy Notice with Shield Icon */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Shield className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            By joining, you agree to share your audio and video during the session
          </p>
        </div>
      </motion.div>
    </div>
  );
}
