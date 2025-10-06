'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Briefcase,
  Heart,
  Rocket,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Info,
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import Autoplay from 'embla-carousel-autoplay';

const services = [
  {
    title: 'Mental Health Counseling',
    icon: Brain,
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop',
    description: [
      'Anxiety & Stress Management',
      'Depression Counseling',
      'Trauma & PTSD Support',
      'Grief & Loss Guidance',
      'Addiction Recovery',
    ],
    path: '/services/mental-health',
    browsePath: '/browse-counselors?specialty=mental-health',
  },
  {
    title: 'Career Counselling',
    icon: Briefcase,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop',
    description: [
      'Career Path Guidance',
      'Workplace Stress Relief',
      'Leadership Development',
      'Entrepreneurship Support',
    ],
    path: '/services/career',
    browsePath: '/browse-counselors?specialty=career',
  },
  {
    title: 'Relationship Counselling',
    icon: Heart,
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop',
    description: [
      'Couples Counseling',
      'Divorce & Separation Support',
      'Family Dynamics Therapy',
      'Parenting Strategies',
    ],
    path: '/services/relationship',
    browsePath: '/browse-counselors?specialty=relationships',
  },
  {
    title: 'Life Coaching',
    icon: Rocket,
    image: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800&auto=format&fit=crop',
    description: [
      'Confidence Building',
      'Goal Setting & Productivity',
      'Time Management Skills',
      'Personal Growth',
    ],
    path: '/services/life-coaching',
    browsePath: '/browse-counselors?specialty=life-coaching',
  },
  {
    title: 'Academic Counselling',
    icon: GraduationCap,
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop',
    description: [
      'Study Skills Enhancement',
      'Exam Anxiety Management',
      'College & Career Prep',
      'Learning Strategies',
    ],
    path: '/services/academic',
    browsePath: '/browse-counselors?specialty=academic',
  },
  {
    title: 'Health and Wellness',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop',
    description: [
      'Nutrition & Diet Plans',
      'Fitness Lifestyle Coaching',
      'Chronic Illness Care',
      'Holistic Wellness',
    ],
    path: '/services/health-wellness',
    browsePath: '/browse-counselors?specialty=wellness',
  },
];

const OurServices = () => {
  const navigate = useNavigate();
  const [api, setApi] = React.useState(null);
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <section
      className="pt-16 relative min-h-0 lg:min-h-screen flex items-center justify-center overflow-hidden bg-transparent py-20 lg:py-28"
      aria-labelledby="services-heading"
    >
    
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-12 w-72 h-72 bg-primary-400/10 dark:bg-primary-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-24 right-10 w-96 h-96 bg-secondary-400/10 dark:bg-secondary-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '500ms' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary-200/20 dark:bg-primary-800/10 rounded-full blur-3xl opacity-50" />
      </div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        {/* Header Section */}
        <motion.div className="text-center mb-16 space-y-6" variants={containerVariants}>
          <motion.div variants={fadeInUp} className="flex justify-center">
            <Badge
              variant="outline"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-white/10 backdrop-blur-md text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-800/50 rounded-full shadow-lg hover:bg-white/20 dark:hover:bg-white/5 transition-all duration-300 hover:scale-105"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>Our Services to Support You</span>
            </Badge>
          </motion.div>

          <motion.h2
            id="services-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight"
            variants={fadeInUp}
          >
            <span className="text-neutral-900 dark:text-white">Find Help That</span>
            <br />
            <span className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 dark:from-primary-400 dark:via-primary-300 dark:to-secondary-400 bg-clip-text text-transparent">
              Fits Your Needs
            </span>
          </motion.h2>

          <motion.p
            className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed"
            variants={fadeInUp}
          >
            Our certified counselors specialize in different areas to help you overcome personal,
            emotional, and professional challenges with compassionate, expert guidance.
          </motion.p>
        </motion.div>

        {/* Carousel */}
        <motion.div variants={fadeInUp} className="relative px-2 sm:px-6 md:px-12 lg:px-16 xl:px-20">
          <div className="relative pb-16 sm:pb-0">
            <Carousel
              plugins={[plugin.current]}
              setApi={setApi}
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full p-4"
            >
              <CarouselContent className="-ml-4">
                {services.map((service, index) => {
                  const IconComponent = service.icon;
                  return (
                    <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3 py-2">
                      <Card className="group relative h-full flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                        {/* Image */}
                        <div className="relative overflow-hidden">
                          <AspectRatio ratio={16 / 9}>
                            <img
                              src={service.image}
                              alt={service.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                          </AspectRatio>

                          {/* Icon Badge with Tilt */}
                          <div className="absolute top-4 right-4 flex items-center justify-center w-12 h-12 rounded-xl bg-white dark:bg-neutral-900 shadow-lg transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 group-hover:shadow-xl">
                            <IconComponent className="w-6 h-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                          </div>
                        </div>

                        <CardHeader className="relative z-10 pb-3">
                          <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white leading-tight line-clamp-2">
                            {service.title}
                          </h3>
                        </CardHeader>

                        <CardContent className="relative z-10 pb-4 flex-1">
                          <ul className="space-y-2.5" role="list">
                            {service.description.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
                                <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                <span className="font-medium leading-tight">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>

                        <CardFooter className="relative z-10 pt-3 pb-6 mt-auto flex flex-col sm:flex-row gap-2">
                          <Button
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                            onClick={() => navigate(service.path)}
                            aria-label={`Find counselors for ${service.title}`}
                          >
                            <Info className="w-4 h-4" aria-hidden="true" />
                            <span>Explore More</span>
                          </Button>
                        </CardFooter>
                      </Card>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>

              {/* Desktop Navigation - Inside Carousel */}
              <CarouselPrevious
                className="hidden sm:flex opacity-100 -left-4 md:-left-8 lg:-left-12 !w-12 !h-12 md:!w-14 md:!h-14 rounded-full bg-white dark:bg-neutral-900 backdrop-blur-sm border-2 border-primary-300 dark:border-primary-700 shadow-xl hover:shadow-primary-500/40 hover:scale-110 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all duration-300 text-primary-700 dark:text-primary-400"
              />
              <CarouselNext
                className="hidden sm:flex opacity-100 -right-4 md:-right-8 lg:-right-12 !w-12 !h-12 md:!w-14 md:!h-14 rounded-full bg-white dark:bg-neutral-900 backdrop-blur-sm border-2 border-primary-300 dark:border-primary-700 shadow-xl hover:shadow-primary-500/40 hover:scale-110 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all duration-300 text-primary-700 dark:text-primary-400"
              />
            </Carousel>

            {/* Mobile Navigation - Below Carousel */}
            <div className="flex justify-center gap-4 mt-6 sm:hidden">
              <button
                onClick={() => api?.scrollPrev()}
                className="w-12 h-12 rounded-full bg-white dark:bg-neutral-900 backdrop-blur-sm border-2 border-primary-300 dark:border-primary-700 shadow-xl hover:shadow-primary-500/40 hover:scale-110 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all duration-300 text-primary-700 dark:text-primary-400 flex items-center justify-center"
                aria-label="Previous services"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => api?.scrollNext()}
                className="w-12 h-12 rounded-full bg-white dark:bg-neutral-900 backdrop-blur-sm border-2 border-primary-300 dark:border-primary-700 shadow-xl hover:shadow-primary-500/40 hover:scale-110 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all duration-300 text-primary-700 dark:text-primary-400 flex items-center justify-center"
                aria-label="Next services"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Call to Action - Fixed Text Color */}
        <motion.div
          className="text-center lg:mt-16 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-lg sm:text-xl text-neutral-700 dark:text-neutral-300 font-medium max-w-2xl mx-auto">
            Join thousands who have transformed their lives with Solvit
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default OurServices;
