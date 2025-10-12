import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Faq from '../../components/Home/Faq.jsx';
import Footer from '../../components/Home/Footer.jsx';
import HeroSection from '../../components/Home/HeroSection.jsx';
import HowItWorks from '../../components/Home/HowItWorks.jsx';
import OurServices from '../../components/Home/OurService.jsx';
import WhySolvit from '../../components/Home/WhySolvit.jsx';

const Separator = () => (
  <>
    {/* <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-400/50 dark:via-primary-600/50 to-transparent" /> */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 dark:from-primary-500 dark:via-primary-400 dark:to-primary-500 rounded-full" />
    <div className="absolute top-0 left-1/4 w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400 animate-pulse" />
    <div
      className="absolute top-0 right-1/4 w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400 animate-pulse"
      style={{ animationDelay: '0.5s' }}
    />
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-20 left-12 w-72 h-72 bg-primary-400/10 dark:bg-primary-600/5 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-24 right-10 w-96 h-96 bg-secondary-400/10 dark:bg-secondary-600/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '500ms' }}
      />
    </div>{' '}
  </>
);

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-neutral-50 via-primary-100 to-primary-200/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/30 mt-5">
        <div className="relative z-10">
        <div className="relative mb-24">
          <HeroSection />
        </div>

        <div className="relative mb-24">
          <OurServices />
          <Separator />
        </div>

        <div className="relative mb-24">
          <HowItWorks />
          <Separator />
        </div>

        <div className="relative mb-24">
          <WhySolvit />
          <Separator />
        </div>

        <div className="relative mb-24">
          <Faq />
        </div>

        <Footer />
      </div>
    </div>
  );
};
export default Home;
