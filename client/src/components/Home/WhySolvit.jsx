import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  CalendarClock,
  BadgeCheck,
  TrendingUp,
  Users,
  Wallet,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const individualReasons = [
  {
    icon: Shield,
    title: 'Confidential & Secure',
    subtitle: 'Your Privacy Matters',
    description: 'Access professional counseling across mental health, career guidance, relationships, academic support, and wellness. All sessions are confidential and compliant with privacy standards.',
  },
  {
    icon: CalendarClock,
    title: 'Flexible Booking',
    subtitle: 'Sessions on Your Terms',
    description: 'Choose from specialized counselors based on availability and preferred session type. Schedule online or in-person appointments with instant confirmations.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Professionals',
    subtitle: 'Certified Experts Only',
    description: 'Every counselor is verified, licensed, and experienced in their specialty area. Browse reviews, ratings, and credentials to find your perfect match.',
  },
];

const practitionerReasons = [
  {
    icon: TrendingUp,
    title: 'Grow Your Practice',
    subtitle: 'Expand Your Reach',
    description: 'Connect with more clients seeking your specific expertise—whether in mental health, career coaching, relationship counseling, or academic guidance.',
  },
  {
    icon: Users,
    title: 'Multiple Specialties',
    subtitle: 'Broaden Your Impact',
    description: 'Offer services across various counseling areas including wellness, life coaching, and specialized therapeutic fields to reach diverse client needs.',
  },
  {
    icon: Wallet,
    title: 'Secure Payments',
    subtitle: 'Financial Peace of Mind',
    description: 'Control your schedule and rates across all your specialties. Process payments securely with automated invoicing and recurring session management.',
  },
];

const stats = [
  { number: '100+', label: 'Verified Professionals' },
  { number: '10,000+', label: 'Sessions Delivered' },
  { number: '98%', label: 'Satisfaction Rate' },
];

const WhySolvit = () => {
  const navigate = useNavigate();

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

  const ValueCard = ({ reason }) => (
    <motion.div variants={cardVariants} className="h-full">
      <Card className="group relative h-full flex flex-col bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 hover:scale-[1.02] transition-all duration-500 overflow-hidden">
        {/* Decorative Corner */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-transparent rounded-bl-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative pb-4">
          {/* Icon Container */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <reason.icon className="w-7 h-7 text-white" aria-hidden="true" />
          </div>

          <CardTitle className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">
            {reason.title}
          </CardTitle>
          <CardDescription className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-1">
            {reason.subtitle}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {reason.description}
          </p>
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
        <motion.div className="text-center mb-16 space-y-6" variants={containerVariants}>
          <motion.div variants={fadeInUp} className="flex justify-center">
            <Badge
              variant="outline"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-white/10 backdrop-blur-md text-primary-700 dark:text-primary-300 border border-primary-600/50 dark:border-primary-800/50 rounded-full shadow-lg hover:bg-white/20 dark:hover:bg-white/5 transition-all duration-300 hover:scale-105"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>Why Choose Solvit</span>
            </Badge>
          </motion.div>

          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight"
            variants={fadeInUp}
          >
            <span className="text-neutral-900 dark:text-white">Experience the</span>
            <br />
            <span className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 dark:from-primary-400 dark:via-primary-300 dark:to-secondary-400 bg-clip-text text-transparent">
              Difference
            </span>
          </motion.h2>

          <motion.p
            className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed"
            variants={fadeInUp}
          >
            Connecting individuals with certified professionals across all counseling specialties—from mental health and relationships to career guidance and academic support.
          </motion.p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="text-center p-6 rounded-xl bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md border border-primary-200/50 dark:border-primary-800/50 shadow-lg"
            >
              <p className="text-4xl font-bold bg-gradient-to-r from-primary-700 to-primary-600 dark:from-primary-400 dark:to-primary-500 bg-clip-text text-transparent mb-2">
                {stat.number}
              </p>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={containerVariants} className="mb-16">
          <motion.div variants={fadeInUp} className="mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-center text-neutral-900 dark:text-white mb-2">
              For Individuals Seeking Guidance
            </h3>
            <p className="text-center text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Access expert support across all counseling areas—mental health, career, relationships, academics, and wellness
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
          >
            {individualReasons.map((reason, index) => (
              <ValueCard key={index} reason={reason} />
            ))}
          </motion.div>
        </motion.div>

        <motion.div variants={containerVariants} className="mb-16">
          <motion.div variants={fadeInUp} className="mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-center text-neutral-900 dark:text-white mb-2">
              For Counseling Professionals
            </h3>
            <p className="text-center text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Expand your practice and connect with clients across your specialty areas
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
          >
            {practitionerReasons.map((reason, index) => (
              <ValueCard key={index} reason={reason} />
            ))}
          </motion.div>
        </motion.div>

       
      </motion.div>
    </section>
  );
};

export default WhySolvit;
