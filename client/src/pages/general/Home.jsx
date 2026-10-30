import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';
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

        <div className="relative mb-12">
          <Faq />
        </div>

        {/* Campus Ambassador Advertising Banner (Above Footer) */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="relative overflow-hidden rounded-2xl bg-white/95 dark:bg-neutral-900/90 backdrop-blur-md border border-primary-200/80 dark:border-primary-800/80 p-6 sm:p-8 shadow-xl shadow-primary-500/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-semibold border border-primary-200 dark:border-primary-800">
                <GraduationCap className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                <span>Solvit Campus Ambassador Program</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Are You a College Student? Become a Solvit Campus Ambassador.
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm max-w-2xl leading-relaxed">
                Promote mental wellness across your university community and earn an ongoing 5% monthly revenue share on every session for 60 days.
              </p>
            </div>
            <Link
              to="/campus-ambassador"
              className="inline-flex items-center justify-center shrink-0 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95"
            >
              Apply as Campus Ambassador
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};
export default Home;
