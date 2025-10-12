'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Search,
  CalendarCheck,
  Video,
  FileText,
  Clock,
  CheckCircle,
  Wallet,
  Sparkles,
  Shield,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const clientSteps = [
  {
    icon: UserPlus,
    title: 'Create Profile',
    subtitle: 'Quick & Easy Setup',
    description: 'Register in just 2 minutes using email or social login. Personalize your experience with basic information.',
    features: ['Free registration', 'Email verification', 'Secure profile'],
  },
  {
    icon: Search,
    title: 'Browse Counselors',
    subtitle: 'Find Your Match',
    description: 'Filter by specialty, ratings, and availability. View detailed profiles to find the perfect counselor for your needs.',
    features: ['Verified experts', 'Detailed profiles', 'Rating system'],
  },
  {
    icon: CalendarCheck,
    title: 'Book Session',
    subtitle: 'Flexible Scheduling',
    description: 'Choose online or in-person sessions. Pick a convenient date and time with instant confirmation.',
    features: ['Instant booking', 'Flexible timing', 'First-session discount'],
  },
  {
    icon: Video,
    title: 'Receive Support',
    subtitle: 'Connect & Grow',
    description: 'Start your confidential session via secure video call or in-person. Track progress and book follow-ups easily.',
    features: ['End-to-end encryption', 'Progress tracking', 'Recurring sessions'],
  },
];

const counselorSteps = [
  {
    icon: FileText,
    title: 'Create Profile',
    subtitle: 'Showcase Expertise',
    description: 'Register with your qualifications and list your counseling specialties to reach the right clients.',
    features: ['Professional verification', 'Specialty tags', 'Portfolio upload'],
  },
  {
    icon: Clock,
    title: 'Set Availability',
    subtitle: 'Control Your Schedule',
    description: 'Define working hours, session types, and fees. Set recurring availability for convenience.',
    features: ['Flexible hours', 'Online/in-person options', 'Custom pricing'],
  },
  {
    icon: CheckCircle,
    title: 'Accept Bookings',
    subtitle: 'Streamlined Process',
    description: 'Receive booking requests from clients and confirm with one click. Reschedule easily when needed.',
    features: ['Instant notifications', 'One-click approval', 'Rescheduling tools'],
  },
  {
    icon: Wallet,
    title: 'Manage Workflow',
    subtitle: 'Track & Earn',
    description: 'View upcoming sessions, track completed appointments, and manage payments from your dashboard.',
    features: ['Payment tracking', 'Session analytics', 'Automated invoices'],
  },
];

const HowItWorks = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const StepCard = ({ step, index }) => (
    <motion.div variants={cardVariants} className="h-full">
      <Card className="group relative h-full flex flex-col bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 hover:scale-[1.02] transition-all duration-500 overflow-hidden">
        {/* Decorative Corner */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-transparent rounded-bl-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Step Number */}
        <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 flex items-center justify-center shadow-lg">
          <span className="text-lg font-bold text-white">{index + 1}</span>
        </div>

        <CardHeader className="relative pb-4">
          {/* Icon Container */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <step.icon className="w-8 h-8 text-white" aria-hidden="true" />
          </div>

          <CardTitle className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">
            {step.title}
          </CardTitle>
          <CardDescription className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-1">
            {step.subtitle}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 space-y-4 pt-0">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {step.description}
          </p>

          {/* Features List */}
          <ul className="space-y-2.5 pt-2" role="list">
            {step.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm">
                <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-neutral-700 dark:text-neutral-300 font-medium leading-tight">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent py-20 lg:py-28">
     
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div className="text-center mb-16 space-y-6" variants={containerVariants}>
          <motion.div variants={fadeInUp} className="flex justify-center">
            <Badge
              variant="outline"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-white/10 backdrop-blur-md text-primary-700 dark:text-primary-300 border border-primary-600/50 dark:border-primary-800/50 rounded-full shadow-lg hover:bg-white/20 dark:hover:bg-white/5 transition-all duration-300 hover:scale-105"
            >
              <Shield className="w-4 h-4" aria-hidden="true" />
              <span>Simple & Secure Process</span>
            </Badge>
          </motion.div>

          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight"
            variants={fadeInUp}
          >
            <span className="text-neutral-900 dark:text-white">How It </span>
            
            <span className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 dark:from-primary-400 dark:via-primary-300 dark:to-secondary-400 bg-clip-text text-transparent">
              Works
            </span>
          </motion.h2>

          <motion.p
            className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed"
            variants={fadeInUp}
          >
            Whether you're seeking support or providing care, we've made the process seamless.
            Choose your path below to get started.
          </motion.p>
        </motion.div>

        {/* Tabs for Client/Counselor Flow */}
        <motion.div variants={fadeInUp}>
          <Tabs defaultValue="clients" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12 h-12 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md border border-primary-200/50 dark:border-primary-800/50 p-1 rounded-xl">
              <TabsTrigger
                value="clients"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-700 data-[state=active]:to-primary-600 data-[state=active]:text-white font-semibold transition-all duration-300"
              >
              For Individuals 
              </TabsTrigger>
              <TabsTrigger
                value="counselors"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-700 data-[state=active]:to-primary-600 data-[state=active]:text-white font-semibold transition-all duration-300"
              >
                For Counselors
              </TabsTrigger>
            </TabsList>

            {/* Client Steps */}
            <TabsContent value="clients" className="mt-0">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {clientSteps.map((step, index) => (
                  <StepCard key={index} step={step} index={index} />
                ))}
              </motion.div>
            </TabsContent>

            {/* Counselor Steps */}
            <TabsContent value="counselors" className="mt-0">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {counselorSteps.map((step, index) => (
                  <StepCard key={index} step={step} index={index} />
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div variants={fadeInUp} className="text-center mt-16 space-y-4">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-white/10 backdrop-blur-md text-primary-700 dark:text-primary-300 border border-primary-600/50 dark:border-primary-800/50 rounded-full shadow-lg hover:bg-white/20 dark:hover:bg-white/5 transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>Trusted by many Users</span>
          </Badge>
          <p className="text-lg sm:text-xl text-neutral-700 dark:text-neutral-300 font-medium max-w-2xl mx-auto">
            Start your journey with a free consultation today. Professional support is just a few clicks away.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HowItWorks;
