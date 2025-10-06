'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Shield, Search, Briefcase, Calendar, Users, Clock, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HeroImg from '../../assets/homePage/image.png';
import HeroImg1 from '../../assets/homePage/image1.png';
import { useCounselorAuth } from '../../contexts/CounselorAuthContext';
import { useClientAuth } from '../../contexts/ClientAuthContext';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

const HeroSection = () => {
  const navigate = useNavigate();
  const { counselor, counselorLoading } = useCounselorAuth();
  const { client, clientLoading } = useClientAuth();

  const isAuthenticated = !!(counselor || client);
  const isLoading = counselorLoading || clientLoading;

  return (
    <section
      className="relative min-h-0 lg:min-h-screen flex flex-col lg:flex-row items-center overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 dark:from-primary-900 dark:via-primary-800 dark:to-primary-700"
      aria-labelledby="hero-heading"
    >
      {/* MOBILE BACKGROUND IMAGE - Matches content height */}
      <div 
        className="absolute inset-0 z-0 lg:hidden"
        style={{
          backgroundImage: `url(${HeroImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 70%',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* MOBILE OVERLAY */}
      <div className="absolute inset-0 z-[1] lg:hidden bg-gradient-to-b from-primary-700/90 via-primary-600/85 to-primary-500/90" aria-hidden="true" />

      {/* DESKTOP Background Image - RIGHT SIDE */}
      <div className="absolute right-0 top-0 bottom-0 w-2/3 max-w-4xl h-full z-0 hidden lg:flex items-center justify-end">
        <img src={HeroImg} alt="" className="h-full w-full object-contain object-right" loading="eager" />
      </div>

      {/* DESKTOP GRADIENT OVERLAY */}
      <div className="absolute inset-0 z-[1] hidden lg:block bg-gradient-to-r from-primary-700 via-primary-600/80 via-primary-500/40 to-transparent dark:from-primary-900 dark:via-primary-800/80 dark:via-primary-700/40 dark:to-transparent" aria-hidden="true" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 md:px-10 lg:px-12 py-20 lg:py-28">
        <div className="max-w-2xl lg:max-w-3xl mx-auto lg:mx-0">
          <motion.div className="space-y-5 lg:space-y-7 text-center lg:text-left" variants={staggerContainer} initial="initial" animate="animate">
            
            <motion.div variants={fadeInUp} className="flex justify-center lg:justify-start">
              <Badge variant="outline" className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-white/10 backdrop-blur-md text-white border-white/20 rounded-full shadow-lg hover:bg-white/20 transition-all">
                <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Certified & Licensed Counselors</span>
              </Badge>
            </motion.div>

            <motion.h1 id="hero-heading" className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-lg" variants={fadeInUp}>
              Find the Right Counselor for Every Life Challenge
            </motion.h1>

            <motion.p className="text-sm sm:text-base lg:text-lg text-white/95 leading-relaxed max-w-2xl mx-auto lg:mx-0 drop-shadow-md" variants={fadeInUp} role="doc-subtitle">
              Clients can book certified counselors across all specialties. Counselors can share expertise and help those in need.
            </motion.p>

            {!isAuthenticated && !isLoading && (
              <motion.div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start" variants={fadeInUp}>
                <Button size="lg" onClick={() => navigate('/login')} className="group relative overflow-hidden bg-white text-primary-900 hover:bg-primary-50 text-sm font-semibold rounded-xl px-7 py-5 shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105" aria-label="Find and book a certified counselor">
                  <Search className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  Find a Counselor
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/counselor/login')} className="group bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/30 hover:border-white/50 text-sm font-semibold rounded-xl px-7 py-5 shadow-xl transition-all duration-300 hover:scale-105" aria-label="Join as a counselor and help clients">
                  <Briefcase className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" aria-hidden="true" />
                  Join as Counselor
                </Button>
              </motion.div>
            )}

            <motion.p className="text-xs sm:text-sm text-white/90 flex items-center justify-center lg:justify-start gap-2 drop-shadow-md" variants={fadeInUp}>
              <CheckCircle className="w-3.5 h-3.5 text-white flex-shrink-0" aria-hidden="true" />
              <span>Get matched with certified counselors within minutes.</span>
            </motion.p>

            <motion.div className="flex flex-wrap gap-2.5 pt-1 justify-center lg:justify-start" variants={fadeInUp}>
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-xs bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 transition-all">
                <Lock className="w-3 h-3" aria-hidden="true" /><span className="font-medium">HIPAA Compliant</span>
              </Badge>
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-xs bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 transition-all">
                <Shield className="w-3 h-3" aria-hidden="true" /><span className="font-medium">Secure & Confidential</span>
              </Badge>
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-xs bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 transition-all">
                <Clock className="w-3 h-3" aria-hidden="true" /><span className="font-medium">24/7 Available</span>
              </Badge>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
