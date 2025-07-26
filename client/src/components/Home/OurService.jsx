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
} from "react-icons/fa";
import { Link } from "react-router-dom";

const services = [
  {
    title: "Mental Health Counseling",
    icon: <FaBrain />,
    color: "text-teal-500",
    bgColor: "bg-gradient-to-br from-teal-50 to-teal-100",
    borderColor: "border-teal-200",
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
    color: "text-indigo-500",
    bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100",
    borderColor: "border-indigo-200",
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
    color: "text-red-500",
    bgColor: "bg-gradient-to-br from-red-50 to-red-100",
    borderColor: "border-red-200",
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
    color: "text-purple-500",
    bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
    borderColor: "border-purple-200",
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
    color: "text-orange-500",
    bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
    borderColor: "border-orange-200",
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
    color: "text-green-500",
    bgColor: "bg-gradient-to-br from-green-50 to-green-100",
    borderColor: "border-green-200",
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
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.3 },
    },
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  if (!services.length) {
    return <div className="text-center py-20">No services available</div>;
  }

  return (
    <motion.section
      className="py-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div className="text-center mb-12" variants={containerVariants}>
          <motion.h2
            className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-600"
            variants={headerVariants}
          >
            Our Services
          </motion.h2>
          <motion.p
            className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed"
            variants={headerVariants}
          >
            Explore a wide range of expert counseling and coaching services,
            crafted to empower your personal and professional growth.
          </motion.p>
        </motion.div>

        {/* Services Carousel */}
        <div className="relative overflow-hidden">
          <div className="relative h-[350px] sm:h-[370px] lg:h-[390px]">
            <AnimatePresence initial={false}>
              <motion.div
                key={currentIndex}
                className="absolute inset-0 flex gap-4 px-2 h-full"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {visibleServices.map((service, index) => (
                  <Link
                    key={`${currentIndex}-${index}`}
                    to={service.path}
                    className="flex-1 min-w-0 flex flex-col"
                  >
                    <motion.div
                      className={`p-6 rounded-2xl ${service.bgColor} border ${service.borderColor} shadow-md flex flex-col h-full min-h-[300px] cursor-pointer`}
                      variants={cardVariants}
                      whileHover="hover"
                    >
                      <motion.div
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm mb-4 mx-auto"
                        variants={headerVariants}
                      >
                        <span className={`text-2xl ${service.color}`}>
                          {service.icon}
                        </span>
                      </motion.div>
                      <motion.h3
                        className="text-xl font-semibold text-gray-900 text-center mb-3"
                        variants={headerVariants}
                      >
                        {service.title}
                      </motion.h3>
                      <motion.ul
                        className="flex-1 text-gray-600 space-y-2 text-base"
                        variants={containerVariants}
                      >
                        {service.description.map((item, idx) => (
                          <motion.li
                            key={idx}
                            className="flex items-start"
                            variants={listItemVariants}
                          >
                            <span className={`mr-2 ${service.color} text-lg`}>
                              •
                            </span>
                            {item}
                          </motion.li>
                        ))}
                      </motion.ul>
                    </motion.div>
                  </Link>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons - Shown when there are multiple services */}
          {services.length > slidesToShow && (
            <>
              <motion.button
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all z-10"
                onClick={handlePrev}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Previous slide"
              >
                <FaChevronLeft className="text-indigo-500 text-lg" />
              </motion.button>
              <motion.button
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all z-10"
                onClick={handleNext}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Next slide"
              >
                <FaChevronRight className="text-indigo-500 text-lg" />
              </motion.button>
            </>
          )}

          {/* Mobile navigation dots */}
          {slidesToShow === 1 && services.length > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {services.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentIndex === index ? "bg-indigo-500" : "bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <motion.div className="text-center mt-12" variants={containerVariants}>
          <motion.a
            href="/client-register"
            className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Start Your Journey Today
          </motion.a>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default OurServices;
