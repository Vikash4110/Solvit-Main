import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import {
  FaBrain,
  FaBriefcase,
  FaChevronLeft,
  FaChevronRight,
  FaGraduationCap,
  FaHeartbeat,
  FaRocket,
  FaUsers,
  FaArrowRight,
  FaStar,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const services = [
  {
    title: "Mental Health Counseling",
    icon: <FaBrain />,
    color: "from-teal-500 to-teal-600",
    iconColor: "text-teal-600",
    bgGradient: "from-teal-50/80 to-teal-100/80",
    description: [
      "Anxiety & Stress Management",
      "Depression Counseling",
      "Trauma & PTSD Support",
      "Grief & Loss Guidance",
      "Addiction Recovery",
    ],
    path: "/services/mental-health-counseling",
  },
  {
    title: "Career & Professional Coaching",
    icon: <FaBriefcase />,
    color: "from-indigo-500 to-indigo-600",
    iconColor: "text-indigo-600",
    bgGradient: "from-indigo-50/80 to-indigo-100/80",
    description: [
      "Career Path Guidance",
      "Workplace Stress Relief",
      "Leadership Development",
      "Entrepreneurship Support",
    ],
    path: "/services/career-professional-coaching",
  },
  {
    title: "Health & Wellness Coaching",
    icon: <FaHeartbeat />,
    color: "from-red-500 to-red-600",
    iconColor: "text-red-600",
    bgGradient: "from-red-50/80 to-red-100/80",
    description: [
      "Nutrition & Diet Plans",
      "Fitness Lifestyle Coaching",
      "Chronic Illness Care",
    ],
    path: "/services/health-wellness-coaching",
  },
  {
    title: "Life & Personal Development",
    icon: <FaRocket />,
    color: "from-purple-500 to-purple-600",
    iconColor: "text-purple-600",
    bgGradient: "from-purple-50/80 to-purple-100/80",
    description: [
      "Confidence Building",
      "Goal Setting & Productivity",
      "Time Management Skills",
    ],
    path: "/services/life-personal-development",
  },
  {
    title: "Relationship & Family Therapy",
    icon: <FaUsers />,
    color: "from-orange-500 to-orange-600",
    iconColor: "text-orange-600",
    bgGradient: "from-orange-50/80 to-orange-100/80",
    description: [
      "Couples Counseling",
      "Divorce & Separation Support",
      "Family Dynamics Therapy",
      "Parenting Strategies",
    ],
    path: "/services/relationship-family-therapy",
  },
  {
    title: "Academic & Student Support",
    icon: <FaGraduationCap />,
    color: "from-green-500 to-green-600",
    iconColor: "text-green-600",
    bgGradient: "from-green-50/80 to-green-100/80",
    description: [
      "Study Skills Enhancement",
      "Exam Anxiety Management",
      "College & Career Prep",
    ],
    path: "/services/academic-student-support",
  },
];

const OurServices = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slidesToShow, setSlidesToShow] = useState(3);
  const autoSlideInterval = 5000;
  const timeoutRef = useRef(null);

  // Handle responsiveness
  useEffect(() => {
    const updateSlidesToShow = () => {
      if (window.innerWidth < 640) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(Math.min(3, services.length));
      }
    };

    updateSlidesToShow();
    window.addEventListener("resize", updateSlidesToShow);
    return () => window.removeEventListener("resize", updateSlidesToShow);
  }, []);

  // Auto-slide functionality
  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    if (!isPaused && services.length > slidesToShow) {
      timeoutRef.current = setTimeout(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex >= services.length - slidesToShow ? 0 : prevIndex + 1
        );
      }, autoSlideInterval);
    }
    return () => resetTimeout();
  }, [currentIndex, isPaused, slidesToShow]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex <= 0 ? services.length - slidesToShow : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= services.length - slidesToShow ? 0 : prevIndex + 1
    );
  };

  // Calculate visible services
  const visibleServices = [];
  if (services.length > 0) {
    for (let i = 0; i < slidesToShow && i < services.length; i++) {
      const index = (currentIndex + i) % services.length;
      visibleServices.push(services[index]);
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
    hover: {
      scale: 1.05,
      y: -10,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.3 },
    },
  };

  if (!services.length) {
    return <div className="text-center py-20">No services available</div>;
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 py-20">
      {/* Background Elements - Same as Hero */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-12 w-72 h-72 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-24 right-10 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-blue-100/40 to-indigo-100/40 rounded-full blur-3xl opacity-50" />
      </div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Header Section - Hero Style */}
        <motion.div className="text-center mb-16" variants={containerVariants}>
          <motion.div
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-full px-5 py-2 shadow mb-6 hover:scale-105 transition duration-300"
            variants={headerVariants}
          >
            <FaStar className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 font-semibold text-sm">Expert Care Services</span>
          </motion.div>
          
          <motion.h2
            className="text-5xl sm:text-6xl font-bold leading-tight tracking-tight mb-6"
            variants={headerVariants}
          >
            <span className="text-gray-900">Comprehensive</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Mental Health
            </span>
            <br />
            <span className="text-gray-900">Services</span>
          </motion.h2>
          
          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            variants={headerVariants}
          >
            Discover our range of expert counseling and coaching services, designed to support your personal and professional growth in a safe, nurturing environment.
          </motion.p>
        </motion.div>

        {/* Services Carousel */}
        <div className="relative">
          <div className="relative h-[420px] sm:h-[440px] lg:h-[460px]">
            <AnimatePresence initial={false}>
              <motion.div
                key={currentIndex}
                className="absolute inset-0 flex gap-8 px-4 h-full"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {visibleServices.map((service, index) => (
                  <Link
                    key={`${currentIndex}-${index}`}
                    to={service.path}
                    className="flex-1 min-w-0 flex flex-col group"
                  >
                    <motion.div
                      className={`relative p-8 rounded-3xl bg-gradient-to-br ${service.bgGradient} backdrop-blur-sm border border-white/50 shadow-xl flex flex-col h-full min-h-[360px] cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-500`}
                      variants={cardVariants}
                      whileHover="hover"
                    >
                      {/* Subtle gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl" />
                      
                      {/* Floating icon */}
                      <motion.div
                        className="relative z-10 flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300"
                        variants={headerVariants}
                      >
                        <span className={`text-4xl ${service.iconColor}`}>
                          {service.icon}
                        </span>
                      </motion.div>
                      
                      <motion.h3
                        className="relative z-10 text-2xl font-bold text-gray-900 text-center mb-6 leading-tight"
                        variants={headerVariants}
                      >
                        {service.title}
                      </motion.h3>
                      
                      <motion.ul
                        className="relative z-10 flex-1 text-gray-700 space-y-3 text-base"
                        variants={containerVariants}
                      >
                        {service.description.map((item, idx) => (
                          <motion.li
                            key={idx}
                            className="flex items-start"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                          >
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${service.color} mt-2 mr-3 flex-shrink-0`} />
                            <span className="font-medium">{item}</span>
                          </motion.li>
                        ))}
                      </motion.ul>

                      {/* Hover arrow */}
                      <motion.div
                        className="relative z-10 mt-6 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                      >
                        <div className="flex items-center text-gray-600 font-semibold">
                          <span className="mr-2">Learn More</span>
                          <FaArrowRight className="w-4 h-4" />
                        </div>
                      </motion.div>
                    </motion.div>
                  </Link>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons - Hero Style */}
          {services.length > slidesToShow && (
            <>
              <motion.button
                className="absolute top-1/2 -left-6 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-xl hover:bg-white transition-all z-10 hover:scale-110 duration-300 border border-gray-100"
                onClick={handlePrev}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Previous slide"
              >
                <FaChevronLeft className="text-indigo-600 text-xl" />
              </motion.button>
              
              <motion.button
                className="absolute top-1/2 -right-6 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-xl hover:bg-white transition-all z-10 hover:scale-110 duration-300 border border-gray-100"
                onClick={handleNext}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Next slide"
              >
                <FaChevronRight className="text-indigo-600 text-xl" />
              </motion.button>
            </>
          )}

          {/* Mobile navigation dots */}
          {slidesToShow === 1 && services.length > 1 && (
            <div className="flex justify-center mt-8 space-x-3">
              {services.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentIndex === index 
                      ? "bg-indigo-600 scale-125 shadow-lg" 
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Call to Action - Hero Style */}
        <motion.div 
          className="text-center mt-16" 
          variants={containerVariants}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {/* <Link
            to="/client-register"
            className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg"
          >
            Start Your Journey Today
            <FaArrowRight className="w-5 h-5 ml-2" />
          </Link> */}
          
          <p className="mt-4 text-gray-500 text-xl">
            Join thousands who have transformed their lives with Solvit
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default OurServices;
