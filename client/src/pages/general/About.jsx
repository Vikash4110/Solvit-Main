import { motion } from 'framer-motion';
import React from 'react';
import {
  Heart,
  Lock,
  Brain,
  Globe,
  Shield,
  HandHelping,
  Wallet,
  CheckCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import aboutHero from '../../assets/core/IMG_2644.png';
import OurMission from '../../components/Home/OurMission.jsx';
import Footer from '@/components/Home/Footer';
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
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

const AboutUs = () => {
  const stats = [
    {
      value: '10K+',
      label: 'Lives Touched',
      icon: Heart,
      gradient: 'from-rose-500 to-pink-600',
    },
    {
      value: '500+',
      label: 'Verified Experts',
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      value: '100%',
      label: 'Confidential',
      icon: Lock,
      gradient: 'from-primary-500 to-primary-600',
    },
    {
      value: '24/7',
      label: 'Support Available',
      icon: HandHelping,
      gradient: 'from-amber-500 to-orange-600',
    },
  ];

  const values = [
    {
      title: 'Empathy First',
      subtitle: 'Care Without Judgment',
      description: 'We listen without judgment and meet you where you are in your journey.',
      icon: Heart,
      gradient: 'from-primary-500 to-primary-700',
      features: ['Active listening', 'Non-judgmental support', 'Personalized care'],
    },
    {
      title: 'Privacy Matters',
      subtitle: 'Your Data is Safe',
      description:
        'Your sessions are completely secure and confidential with end-to-end encryption.',
      icon: Lock,
      gradient: 'from-primary-500 to-primary-700',
      features: ['End-to-end encryption', 'HIPAA compliant', 'Anonymous sessions'],
    },
    {
      title: 'Holistic Help',
      subtitle: 'Complete Support',
      description: 'Mental, emotional, academic, and career guidance — all under one roof.',
      icon: Brain,
      gradient: 'from-primary-500 to-primary-700',
      features: ['Mental health', 'Career guidance', 'Academic support'],
    },
    {
      title: 'Made for India',
      subtitle: 'Culturally Aware',
      description: 'Built with understanding of local needs, languages, and cultural context.',
      icon: Globe,
      gradient: 'from-primary-500 to-primary-700',
      features: ['Multiple languages', 'Cultural sensitivity', 'Local expertise'],
    },
  ];

  const whyChooseUs = [
    {
      title: 'Verified Experts',
      subtitle: 'Trusted Professionals',
      description:
        'Connect with certified counselors and coaches ensuring trusted, professional guidance.',
      icon: Shield,
      gradient: 'from-primary-500 to-primary-700',
      features: ['Certified counselors', 'Background verified', 'Experienced professionals'],
    },
    {
      title: 'Personalized Support',
      subtitle: 'Tailored For You',
      description: 'Tailored sessions to fit your unique needs with flexible consultation options.',
      icon: HandHelping,
      gradient: 'from-primary-500 to-primary-700',
      features: ['Custom plans', 'Flexible scheduling', 'One-on-one sessions'],
    },
    {
      title: 'Affordable Access',
      subtitle: 'Budget Friendly',
      description: 'Budget-friendly pricing tiers making expert advice accessible to everyone.',
      icon: Wallet,
      gradient: 'from-primary-500 to-primary-700',
      features: ['Multiple pricing tiers', 'No hidden fees', 'Value for money'],
    },
  ];

  return (
    <div className="bg-gradient-to-br from-neutral-50 via-primary-50/30 to-primary-100/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/30">
      {/* Hero Section - EXACT MATCH WITH BROWSE COUNSELORS */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative min-h-0 lg:min-h-[60vh] flex items-center overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 dark:from-primary-900 dark:via-primary-800 dark:to-primary-700"
        aria-labelledby="hero-heading"
      >
        {/* Mobile Background Image */}
        <div
          className="absolute inset-0 z-0 lg:hidden"
          style={{
            backgroundImage: `url(${aboutHero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 70%',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div
          className="absolute inset-0 z-[1] lg:hidden bg-gradient-to-b from-primary-700/90 via-primary-600/85 to-primary-500/90"
          aria-hidden="true"
        />

        {/* Desktop Background Image */}
        <div className="absolute right-0 top-0 bottom-0 w-2/3 max-w-4xl h-full z-0 hidden lg:flex items-center justify-end">
          <img
            src={aboutHero}
            alt=""
            className="h-full w-full object-contain object-right"
            loading="eager"
          />
        </div>
        <div
          className="absolute inset-0 z-[1] hidden lg:block bg-gradient-to-r from-primary-700 via-primary-600/80 via-primary-500/40 to-transparent dark:from-primary-900 dark:via-primary-800/80 dark:via-primary-700/40 dark:to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 md:px-10 lg:px-12 py-20 lg:py-28">
          <div className="max-w-2xl lg:max-w-3xl mx-auto lg:mx-0">
            <motion.div
              className="space-y-5 lg:space-y-7 text-center lg:text-left"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={fadeInUp} className="flex justify-center lg:justify-start">
                <Badge
                  variant="outline"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-white/10 backdrop-blur-md text-white border-white/20 rounded-full shadow-lg hover:bg-white/20 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Trusted Mental Health Platform</span>
                </Badge>
              </motion.div>

              <motion.h1
                id="hero-heading"
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-lg"
                variants={fadeInUp}
              >
                Your Partner in
                <br />
                Personal Growth
              </motion.h1>

              <motion.p
                className="text-sm sm:text-base lg:text-lg text-white/95 leading-relaxed max-w-2xl mx-auto lg:mx-0 drop-shadow-md"
                variants={fadeInUp}
                role="doc-subtitle"
              >
                We believe everyone deserves access to the right support at the right time.
                Our platform connects you with certified professionals who truly understand.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex justify-center lg:justify-start">
                <Link to="/client-register">
                  <Button
                    size="lg"
                    className="group relative overflow-hidden bg-white hover:bg-white/90 text-primary-900 font-semibold rounded-xl px-8 py-6 shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105"
                  >
                    Find Your Expert
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      

      <OurMission />

      {/* Our Values Section */}
      <section className="py-20 bg-gradient-to-br from-white via-primary-50/30 to-primary-100/20 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 relative overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary-200/30 dark:bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-300/20 dark:bg-primary-600/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge className="mb-4 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 border-0 px-4 py-1.5">
              Our Core Values
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
              What We
              <span className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent"> Believe In</span>
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Our values guide every interaction and shape the support we provide.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="group relative h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 transition-all duration-500 overflow-hidden hover:scale-[1.02]">
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${value.gradient} opacity-10 dark:opacity-20 rounded-bl-[100px] transition-all duration-500 group-hover:w-32 group-hover:h-32`} />
                    
                    <div className="absolute top-4 right-4 z-10">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${value.gradient} shadow-lg`}>
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                    </div>

                    <CardHeader className="pb-4">
                      <motion.div
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${value.gradient} shadow-xl mb-6 group-hover:scale-110 transition-transform duration-500`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <IconComponent className="w-8 h-8 text-white" />
                      </motion.div>

                      <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {value.title}
                      </CardTitle>
                      
                      <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                        {value.subtitle}
                      </p>
                    </CardHeader>
                    
                    <CardContent>
                      <CardDescription className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                        {value.description}
                      </CardDescription>

                      <div className="space-y-2.5">
                        {value.features.map((feature, idx) => (
                          <motion.div
                            key={idx}
                            className="flex items-center gap-2.5"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">
                              {feature}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge className="mb-4 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 border-0 px-4 py-1.5">
              Why Choose Us
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
              Why Choose
              <span className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent"> Solvit</span>
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Empowering you with the right support to overcome life's challenges—accessible,
              expert, and tailored to you.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {whyChooseUs.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="group relative h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 transition-all duration-500 overflow-hidden hover:scale-[1.02]">
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.gradient} opacity-10 dark:opacity-20 rounded-bl-[100px] transition-all duration-500 group-hover:w-32 group-hover:h-32`} />
                    
                    <div className="absolute top-4 right-4 z-10">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                    </div>

                    <CardHeader className="pb-4">
                      <motion.div
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-xl mb-6 group-hover:scale-110 transition-transform duration-500`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <IconComponent className="w-8 h-8 text-white" />
                      </motion.div>

                      <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {feature.title}
                      </CardTitle>
                      
                      <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                        {feature.subtitle}
                      </p>
                    </CardHeader>
                    
                    <CardContent>
                      <CardDescription className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                        {feature.description}
                      </CardDescription>

                      <div className="space-y-2.5">
                        {feature.features.map((feat, idx) => (
                          <motion.div
                            key={idx}
                            className="flex items-center gap-2.5"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">
                              {feat}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
