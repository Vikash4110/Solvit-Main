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
            Everything is set up. Join when you're ready to begin your counseling session.
          </p>
        </div>

        {/* Session Details Card - Using WhySolvit/OurServices Card Style */}
        {sessionData && (
          <Card className="group relative overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 transition-all duration-500">
            {/* Decorative Corner Element */}
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-primary-400/20 to-primary-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

            <CardHeader className="relative pb-4">
              <div className="flex items-center gap-3">
                {/* Icon Badge with HowItWorks Style */}
                <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 shadow-lg group-hover:shadow-xl group-hover:shadow-primary-500/40 transition-all duration-500">
                  <Video className="h-6 w-6 text-white" />
                  <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary-900 dark:text-white">
                    Session Information
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Your counseling session details
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-3">
              {sessionData.title && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/50 transition-all duration-300 group-hover:border-primary-200 dark:group-hover:border-primary-800/50 group-hover:bg-primary-50/50 dark:group-hover:bg-primary-900/10">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                    <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Session Title
                    </p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                      {sessionData.title}
                    </p>
                  </div>
                </div>
              )}

              {sessionData.time && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/50 transition-all duration-300 group-hover:border-primary-200 dark:group-hover:border-primary-800/50 group-hover:bg-primary-50/50 dark:group-hover:bg-primary-900/10">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                    <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Scheduled Time
                    </p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {sessionData.time}
                    </p>
                  </div>
                </div>
              )}

              {sessionData.host && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/50 transition-all duration-300 group-hover:border-primary-200 dark:group-hover:border-primary-800/50 group-hover:bg-primary-50/50 dark:group-hover:bg-primary-900/10">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                    <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Counselor
                    </p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                      {sessionData.host}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
