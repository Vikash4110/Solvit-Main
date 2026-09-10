import { motion } from 'framer-motion';
import React from 'react';
import { Heart, Lock, Users, Globe, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import supportImg from '../../assets/core/IMG_2648.png';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const OurMission = () => {
  const missionPoints = [
    {
      icon: Heart,
      title: 'Empathy First',
      content: 'We listen without judgment and meet you where you are',
      gradient: 'from-primary-500 to-primary-700',
    },
    {
      icon: Lock,
      title: 'Privacy Matters',
      content: 'Secure, confidential sessions with end-to-end encryption',
      gradient: 'from-primary-500 to-primary-700',
    },
    {
      icon: Users,
      title: 'Holistic Help',
      content: 'Support for mental health, career, and personal growth',
      gradient: 'from-primary-500 to-primary-700',
    },
    {
      icon: Globe,
      title: 'Made for India',
      content: 'Tailored to local needs, languages, and culture',
      gradient: 'from-primary-500 to-primary-700',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary-50/30 via-primary-100/20 to-transparent dark:from-primary-950/20 dark:via-primary-900/10 dark:to-transparent relative overflow-hidden">
      {/* Background Pattern - Subtle */}
      <div className="absolute inset-0 bg-grid-neutral-200/30 dark:bg-grid-neutral-800/20 bg-[size:40px_40px]" />
      
      {/* Bluish Decorative Elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary-400/20 dark:bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-500/20 dark:bg-primary-600/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Left Content */}
          <motion.div
            className="lg:w-1/2 w-full"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInLeft}
          >
            <Badge className="mb-4 inline-flex items-center gap-1.5 bg-primary-100/80 text-primary-800 dark:bg-primary-950/50 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60 px-3.5 py-1.5 text-xs font-semibold rounded-full shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
              <span>Our Purpose</span>
            </Badge>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-neutral-900 dark:text-white">
              Our{' '}
              <span className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
                Mission
              </span>{' '}
              & Values
            </h2>

            <div className="relative">
              {/* Decorative Glow */}
              <div className="absolute -left-6 -top-6 w-32 h-32 bg-primary-400/20 dark:bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
              
              {/* Main Text Card */}
              <Card className="relative bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-800 shadow-xl rounded-2xl overflow-hidden">
                <CardContent className="p-6 sm:p-7 space-y-4">
                  <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    At Solvit, we're committed to connecting you with trusted counselors and coaches
                    to support your mental health, career, and personal growth journey. We believe
                    that everyone deserves access to compassionate guidance, no matter where they are
                    in life.
                  </p>
                  <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Our platform makes professional support accessible, affordable, and free of
                    stigma, thoughtfully designed with India's unique cultural context and local
                    challenges in mind. From navigating relationships to finding career clarity, we're
                    here to empower you every step of the way.
                  </p>
                  <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Since our inception, we've worked tirelessly to build a network of certified
                    professionals who are passionate about helping individuals overcome obstacles and
                    unlock their full potential. Solvit is more than a service—it's a movement to
                    redefine how India approaches well-being and self-improvement.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Link to="/browse-counselors" className="inline-block mt-6">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 hover:from-primary-700 hover:to-primary-900 text-white text-sm sm:text-base font-semibold rounded-xl px-7 py-5 sm:px-8 sm:py-6 shadow-xl hover:shadow-primary-500/25 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                <span>Get Started Today</span>
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Right Content */}
          <motion.div
            className="lg:w-1/2 w-full"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInRight}
          >
            {/* Mission Points Grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
              variants={containerVariants}
            >
              {missionPoints.map((point, index) => {
                const IconComponent = point.icon;
                return (
                  <motion.div key={index} variants={fadeInUp}>
                    <Card className="group h-full bg-white/95 dark:bg-neutral-900/95 border border-neutral-200/90 dark:border-neutral-800 hover:border-primary-400/80 dark:hover:border-primary-600 hover:shadow-lg hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 transition-all duration-300 rounded-2xl overflow-hidden">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center gap-3 mb-2.5">
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${point.gradient} flex items-center justify-center shadow-md`}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                            {point.title}
                          </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {point.content}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Support Image */}
            <motion.div
              className="relative overflow-hidden rounded-2xl shadow-xl border border-neutral-200/80 dark:border-neutral-800"
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <img
                  src={supportImg}
                  alt="Support and counseling community"
                  className="w-full h-56 sm:h-72 md:h-80 lg:h-[285px] xl:h-[310px] object-cover"
                  loading="lazy"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-neutral-950/25 to-transparent" />
                
                {/* Overlay Badge */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5">
                  <div className="bg-white/15 dark:bg-neutral-900/60 backdrop-blur-md border border-white/25 dark:border-white/15 rounded-xl px-4 py-2.5 shadow-lg">
                    <p className="text-white font-medium text-xs sm:text-sm flex items-center gap-2">
                      <span className="text-base">🤝</span>
                      <span>Trusted by 10,000+ individuals across India</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OurMission;
