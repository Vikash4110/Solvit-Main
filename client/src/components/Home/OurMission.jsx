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
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="lg:w-1/2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInLeft}
          >
            <Badge className="mb-6 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 border-0 px-4 py-1.5 text-sm">
              <Sparkles className="w-4 h-4 mr-1.5" />
              Our Purpose
            </Badge>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-neutral-900 dark:text-white">
              Our{' '}
              <span className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
                Mission
              </span>{' '}
              & Values
            </h2>

            <div className="relative">
              {/* Decorative Blob */}
              <div className="absolute -left-8 -top-8 w-32 h-32 bg-primary-400/20 dark:bg-primary-300/10 rounded-full blur-2xl" />
              
              {/* Main Text Card - WHITE/NEUTRAL BACKGROUND */}
              <Card className="relative bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-2xl">
                <CardContent className="p-6 space-y-5">
                  <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    At Solvit, we're committed to connecting you with trusted counselors and coaches
                    to support your mental health, career, and personal growth journey. We believe
                    that everyone deserves access to compassionate guidance, no matter where they are
                    in life.
                  </p>
                  <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Our platform makes professional support accessible, affordable, and free of
                    stigma, thoughtfully designed with India's unique cultural context and local
                    challenges in mind. From navigating relationships to finding career clarity, we're
                    here to empower you every step of the way.
                  </p>
                  <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Since our inception, we've worked tirelessly to build a network of certified
                    professionals who are passionate about helping individuals overcome obstacles and
                    unlock their full potential. Solvit is more than a service—it's a movement to
                    redefine how India approaches well-being and self-improvement.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Link to="/client-register">
              <Button
                size="lg"
                className="group mt-8 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-base font-semibold rounded-xl px-8 py-6 shadow-2xl hover:shadow-primary-500/30 transition-all duration-300 hover:scale-105"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Right Content */}
          <motion.div
            className="lg:w-1/2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInRight}
          >
            {/* Mission Points Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
              variants={containerVariants}
            >
              {missionPoints.map((point, index) => {
                const IconComponent = point.icon;
                return (
                  <motion.div key={index} variants={fadeInUp}>
                    <Card className="group h-full bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 transition-all duration-300 hover:scale-105">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${point.gradient} flex items-center justify-center shadow-lg`}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{point.title}</h3>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
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
              className="relative overflow-hidden rounded-2xl shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <img
                  src={supportImg}
                  alt="Support and counseling"
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-primary-900/20 to-transparent" />
                
                {/* Optional Overlay Badge */}
                <div className="absolute bottom-6 left-6 right-6">
                  <Card className="bg-white/10 backdrop-blur-md border-white/20">
                    <CardContent className="p-4">
                      <p className="text-white font-semibold text-sm">
                        🤝 Trusted by 10,000+ individuals across India
                      </p>
                    </CardContent>
                  </Card>
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
