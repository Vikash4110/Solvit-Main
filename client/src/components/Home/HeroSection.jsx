'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Shield,
  Search,
  Briefcase,
  Clock,
  Lock,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import HeroImg from '../../assets/homePage/counseling_hero.jpg';
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
  const [copied, setCopied] = useState(false);

  const isAuthenticated = Boolean(counselor || client);
  const isLoading = counselorLoading || clientLoading;

  const handleCopyCoupon = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText('NEWSTART');
    setCopied(true);
    toast.success('Coupon code NEWSTART copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleBookingRedirect = () => {
    navigate(client ? '/browse-counselors' : '/login');
  };

  // Solvit Brand Glassmorphic Promo Card with Unified Brand Gradient & Interactive Animations
  const PromoCardContent = () => (
    <div className="relative group p-[1.5px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(7,23,44,0.6)] hover:shadow-[0_25px_60px_rgba(15,127,205,0.35)] transition-all duration-300 w-full text-left">
      {/* Continuous circular rotating glow line in Solvit brand blue */}
      <motion.div
        className="absolute -inset-[100%] pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0deg, rgba(15, 127, 205, 0.95) 55deg, rgba(77, 184, 255, 0.95) 95deg, transparent 145deg, rgba(28, 60, 99, 0.9) 235deg, rgba(28, 155, 240, 0.95) 275deg, transparent 325deg)',
        }}
        aria-hidden="true"
      />

      {/* Inner Frosted Solvit Glass Container - Tuned for optimal contrast and translucency */}
      <div className="relative z-10 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#132c4e]/85 via-[#0c223c]/80 to-[#071628]/85 backdrop-blur-2xl p-4 sm:p-6 border border-white/15">
        {/* Top Header: Solvit Brand Badge + Special Discount Label */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white text-xs font-semibold tracking-wide border border-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.4)] hover:shadow-[0_0_14px_rgba(56,189,248,0.6)] hover:scale-105 transition-all duration-300">
            <Sparkles
              className="w-3.5 h-3.5 text-primary-200 fill-primary-200"
              aria-hidden="true"
            />
            <span>First Session Offer</span>
          </span>
          <span className="text-white/80 text-xs font-medium tracking-wide">Special Discount</span>
        </div>

        {/* Main Heading with Luminous Solvit Azure Text */}
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mb-2">
          Get{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-200 to-primary-300 font-extrabold drop-shadow-[0_0_14px_rgba(28,155,240,0.6)]">
            10% OFF
          </span>{' '}
          on your first session
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-white/85 leading-relaxed mb-3">
          Begin your journey with certified counsellors.
          <br className="hidden sm:inline" /> Apply coupon code at checkout.
        </p>

        {/* Bullet Benefits with Solvit Primary Checkmarks */}
        <ul className="space-y-1.5 mb-4 text-xs text-white/85">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-primary-400 shrink-0" aria-hidden="true" />
            <span>1-on-1 confidential video sessions</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-primary-400 shrink-0" aria-hidden="true" />
            <span>Valid across all therapy specialties</span>
          </li>
        </ul>

        {/* Divider */}
        <div className="border-t border-white/15 my-3.5" />

        {/* Action Row: Coupon Chip + Solvit Brand Styled Book Now Button */}
        <div className="flex items-center justify-between gap-2.5 sm:gap-3 pt-0.5">
          <button
            type="button"
            onClick={handleCopyCoupon}
            className="group/chip inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-950 font-mono font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border border-white/80 shrink-0"
            title="Click to copy coupon code NEWSTART"
            aria-label="Copy coupon code NEWSTART"
          >
            <span className="tracking-wider">NEWSTART</span>
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            ) : (
              <Copy
                className="w-4 h-4 text-slate-500 group-hover/chip:text-slate-900 transition-colors"
                aria-hidden="true"
              />
            )}
          </button>

          <button
            type="button"
            onClick={handleBookingRedirect}
            className="group/btn inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-primary-950/40 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-sky-300 shadow-[0_0_14px_rgba(56,189,248,0.45)] hover:border-white hover:shadow-[0_0_20px_rgba(56,189,248,0.7)] cursor-pointer shrink-0"
            aria-label="Book your first session now"
          >
            <span>Book Now</span>
            <ArrowRight
              className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform duration-300"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section
      className="relative min-h-[540px] sm:min-h-[580px] lg:min-h-[620px] flex flex-col justify-center overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 dark:from-primary-900 dark:via-primary-800 dark:to-primary-700"
      aria-labelledby="hero-heading"
    >
      {/* MOBILE BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 z-0 md:hidden"
        style={{
          backgroundImage: `url(${HeroImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* MOBILE OVERLAY */}
      <div
        className="absolute inset-0 z-[1] md:hidden bg-gradient-to-b from-primary-800/90 via-primary-700/80 to-primary-900/95 backdrop-blur-[1px]"
        aria-hidden="true"
      />

      {/* TABLET & DESKTOP Background Image - RIGHT SIDE */}
      <div
        className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 lg:w-[52%] h-full z-0 hidden md:block overflow-hidden pointer-events-none"
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 12%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,1) 50%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 12%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,1) 50%)',
        }}
      >
        <img
          src={HeroImg}
          alt="Compassionate one-on-one counseling session"
          className="h-full w-full object-cover object-[center_35%]"
          loading="eager"
        />
        {/* Subtle atmospheric ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-700/40 via-transparent to-primary-700/20 pointer-events-none" />
      </div>

      {/* TABLET & DESKTOP GRADIENT OVERLAY */}
      <div
        className="absolute inset-0 z-[1] hidden md:block bg-gradient-to-r from-primary-700 via-primary-700/60 md:via-primary-600/30 to-transparent dark:from-primary-900 dark:via-primary-900/60 dark:to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-10 sm:py-12 md:py-14 lg:py-16">
        <div className="max-w-2xl lg:max-w-3xl mx-auto lg:mx-0">
          <motion.div
            className="space-y-4 sm:space-y-6 lg:space-y-7 text-center lg:text-left"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3"
            >
              <Badge
                variant="outline"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white/10 backdrop-blur-md text-white border-white/20 rounded-full shadow-lg hover:bg-white/20 transition-all"
              >
                <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Certified & Licensed Counselors</span>
              </Badge>
            </motion.div>

            <motion.h1
              id="hero-heading"
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight text-white drop-shadow-lg"
              variants={fadeInUp}
            >
              Find the Right Counselor for Every Life Challenge
            </motion.h1>

            <motion.p
              className="text-sm sm:text-base lg:text-lg text-white/95 leading-relaxed max-w-2xl mx-auto lg:mx-0 drop-shadow-md"
              variants={fadeInUp}
              role="doc-subtitle"
            >
              Clients can book certified counselors across all specialties. Counselors can share
              expertise and help those in need.
            </motion.p>

            {!isAuthenticated && !isLoading && (
              <motion.div
                className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start"
                variants={fadeInUp}
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="group relative overflow-hidden bg-white text-primary-900 hover:bg-primary-50 text-sm font-semibold rounded-xl px-7 py-5 shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105"
                  aria-label="Find and book a certified counselor"
                >
                  <Search
                    className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"
                    aria-hidden="true"
                  />
                  Find a Counselor
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/counselor/login')}
                  className="group bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/30 hover:border-white/50 text-sm font-semibold rounded-xl px-7 py-5 shadow-xl transition-all duration-300 hover:scale-105"
                  aria-label="Join as a counselor and help clients"
                >
                  <Briefcase
                    className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform"
                    aria-hidden="true"
                  />
                  Join as Counselor
                </Button>
              </motion.div>
            )}

            <motion.p
              className="text-xs sm:text-sm text-white/90 flex items-center justify-center lg:justify-start gap-2 drop-shadow-md"
              variants={fadeInUp}
            >
              <CheckCircle className="w-3.5 h-3.5 text-white flex-shrink-0" aria-hidden="true" />
              <span>Get matched with certified counselors within minutes.</span>
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-2.5 pt-1 justify-center lg:justify-start"
              variants={fadeInUp}
            >
              <Badge
                variant="outline"
                className="gap-1.5 px-3 py-1.5 text-xs bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 transition-all"
              >
                <Lock className="w-3 h-3" aria-hidden="true" />
                <span className="font-medium">HIPAA Compliant</span>
              </Badge>
              <Badge
                variant="outline"
                className="gap-1.5 px-3 py-1.5 text-xs bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 transition-all"
              >
                <Shield className="w-3 h-3" aria-hidden="true" />
                <span className="font-medium">Secure & Confidential</span>
              </Badge>
              <Badge
                variant="outline"
                className="gap-1.5 px-3 py-1.5 text-xs bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 transition-all"
              >
                <Clock className="w-3 h-3" aria-hidden="true" />
                <span className="font-medium">24/7 Available</span>
              </Badge>
            </motion.div>

            {/* Mobile-only view of the promo card */}
            <motion.div variants={fadeInUp} className="block md:hidden pt-2 max-w-lg mx-auto">
              <PromoCardContent />
            </motion.div>
          </motion.div>
        </div>

        {/* Desktop & Tablet Floating Glass Promo Card (Anchored on the lower right over the table/rug area) */}
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.96 }}
          animate={{
            opacity: 1,
            y: [0, -6, 0],
            scale: 1,
          }}
          transition={{
            opacity: { duration: 0.6, delay: 0.2 },
            scale: { duration: 0.6, delay: 0.2 },
            y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="hidden md:block absolute right-4 sm:right-6 md:right-8 lg:right-12 bottom-6 sm:bottom-8 lg:bottom-10 z-20 w-auto max-w-sm lg:max-w-md"
        >
          <PromoCardContent />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
