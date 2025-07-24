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

// import { AnimatePresence, motion } from "framer-motion";
// import React, { useEffect, useRef, useState } from "react";
// import {
//   FaArrowRight,
//   FaBrain,
//   FaBriefcase,
//   FaChevronLeft,
//   FaChevronRight,
//   FaGraduationCap,
//   FaHeartbeat,
//   FaRocket,
//   FaStar,
//   FaUsers,
// } from "react-icons/fa";

// const services = [
//   {
//     title: "Mental Health Counseling",
//     icon: <FaBrain />,
//     color: "text-emerald-600",
//     bgColor: "bg-gradient-to-br from-emerald-50 via-white to-emerald-100",
//     borderColor: "border-emerald-200",
//     glowColor: "shadow-emerald-100",
//     hoverGlow: "hover:shadow-emerald-200",
//     description: [
//       "Anxiety & Stress Management",
//       "Depression Counseling",
//       "Trauma & PTSD Support",
//       "Grief & Loss Guidance",
//       "Addiction Recovery",
//     ],
//     path: "/services/mental-health-counseling",
//     badge: "Most Popular",
//     rating: 4.9,
//   },
//   {
//     title: "Career & Professional Coaching",
//     icon: <FaBriefcase />,
//     color: "text-blue-600",
//     bgColor: "bg-gradient-to-br from-blue-50 via-white to-blue-100",
//     borderColor: "border-blue-200",
//     glowColor: "shadow-blue-100",
//     hoverGlow: "hover:shadow-blue-200",
//     description: [
//       "Career Path Guidance",
//       "Workplace Stress Relief",
//       "Leadership Development",
//       "Entrepreneurship Support",
//     ],
//     path: "/services/career-professional-coaching",
//     rating: 4.8,
//   },
//   {
//     title: "Health & Wellness Coaching",
//     icon: <FaHeartbeat />,
//     color: "text-rose-600",
//     bgColor: "bg-gradient-to-br from-rose-50 via-white to-rose-100",
//     borderColor: "border-rose-200",
//     glowColor: "shadow-rose-100",
//     hoverGlow: "hover:shadow-rose-200",
//     description: [
//       "Nutrition & Diet Plans",
//       "Fitness Lifestyle Coaching",
//       "Chronic Illness Care",
//       "Holistic Wellness Programs",
//     ],
//     path: "/services/health-wellness-coaching",
//     rating: 4.7,
//   },
//   {
//     title: "Life & Personal Development",
//     icon: <FaRocket />,
//     color: "text-violet-600",
//     bgColor: "bg-gradient-to-br from-violet-50 via-white to-violet-100",
//     borderColor: "border-violet-200",
//     glowColor: "shadow-violet-100",
//     hoverGlow: "hover:shadow-violet-200",
//     description: [
//       "Confidence Building",
//       "Goal Setting & Productivity",
//       "Time Management Skills",
//       "Personal Transformation",
//     ],
//     path: "/services/life-personal-development",
//     rating: 4.9,
//   },
//   {
//     title: "Relationship & Family Therapy",
//     icon: <FaUsers />,
//     color: "text-amber-600",
//     bgColor: "bg-gradient-to-br from-amber-50 via-white to-amber-100",
//     borderColor: "border-amber-200",
//     glowColor: "shadow-amber-100",
//     hoverGlow: "hover:shadow-amber-200",
//     description: [
//       "Couples Counseling",
//       "Divorce & Separation Support",
//       "Family Dynamics Therapy",
//       "Parenting Strategies",
//     ],
//     path: "/services/relationship-family-therapy",
//     rating: 4.8,
//   },
//   {
//     title: "Academic & Student Support",
//     icon: <FaGraduationCap />,
//     color: "text-teal-600",
//     bgColor: "bg-gradient-to-br from-teal-50 via-white to-teal-100",
//     borderColor: "border-teal-200",
//     glowColor: "shadow-teal-100",
//     hoverGlow: "hover:shadow-teal-200",
//     description: [
//       "Study Skills Enhancement",
//       "Exam Anxiety Management",
//       "College & Career Prep",
//       "Academic Performance Coaching",
//     ],
//     path: "/services/academic-student-support",
//     rating: 4.7,
//   },
// ];

// const OurServices = () => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isPaused, setIsPaused] = useState(false);
//   const [slidesToShow, setSlidesToShow] = useState(3);
//   const [hoveredCard, setHoveredCard] = useState(null);
//   const autoSlideInterval = 4500;
//   const timeoutRef = useRef(null);

//   // Handle responsiveness
//   useEffect(() => {
//     const updateSlidesToShow = () => {
//       if (window.innerWidth < 640) {
//         setSlidesToShow(1);
//       } else if (window.innerWidth < 1024) {
//         setSlidesToShow(2);
//       } else {
//         setSlidesToShow(Math.min(3, services.length));
//       }
//     };

//     updateSlidesToShow();
//     window.addEventListener("resize", updateSlidesToShow);
//     return () => window.removeEventListener("resize", updateSlidesToShow);
//   }, []);

//   // Auto-slide functionality
//   const resetTimeout = () => {
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }
//   };

//   useEffect(() => {
//     resetTimeout();
//     if (!isPaused && services.length > slidesToShow) {
//       timeoutRef.current = setTimeout(() => {
//         setCurrentIndex((prevIndex) =>
//           prevIndex >= services.length - slidesToShow ? 0 : prevIndex + 1
//         );
//       }, autoSlideInterval);
//     }
//     return () => resetTimeout();
//   }, [currentIndex, isPaused, slidesToShow]);

//   const handlePrev = () => {
//     setCurrentIndex((prevIndex) =>
//       prevIndex <= 0 ? services.length - slidesToShow : prevIndex - 1
//     );
//   };

//   const handleNext = () => {
//     setCurrentIndex((prevIndex) =>
//       prevIndex >= services.length - slidesToShow ? 0 : prevIndex + 1
//     );
//   };

//   // Calculate visible services
//   const visibleServices = [];
//   if (services.length > 0) {
//     for (let i = 0; i < slidesToShow && i < services.length; i++) {
//       const index = (currentIndex + i) % services.length;
//       visibleServices.push({ ...services[index], originalIndex: index });
//     }
//   }

//   // Animation variants
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.15,
//         delayChildren: 0.1,
//       },
//     },
//   };

//   const headerVariants = {
//     hidden: { opacity: 0, y: 30 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.8,
//         ease: [0.25, 0.46, 0.45, 0.94],
//       },
//     },
//   };

//   const cardVariants = {
//     hidden: { opacity: 0, y: 40, scale: 0.95 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       scale: 1,
//       transition: {
//         duration: 0.7,
//         ease: [0.25, 0.46, 0.45, 0.94],
//       },
//     },
//     hover: {
//       y: -8,
//       scale: 1.02,
//       transition: {
//         duration: 0.3,
//         ease: "easeOut",
//       },
//     },
//   };

//   const listItemVariants = {
//     hidden: { opacity: 0, x: -15 },
//     visible: (i) => ({
//       opacity: 1,
//       x: 0,
//       transition: {
//         duration: 0.5,
//         delay: i * 0.1,
//         ease: "easeOut",
//       },
//     }),
//   };

//   const buttonVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.8,
//         ease: "easeOut",
//         delay: 0.3,
//       },
//     },
//     hover: {
//       scale: 1.05,
//       boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)",
//       transition: { duration: 0.3 },
//     },
//     tap: { scale: 0.98 },
//   };

//   if (!services.length) {
//     return <div className="text-center py-20">No services available</div>;
//   }

//   return (
//     <motion.section
//       className="py-20 bg-gradient-to-br from-slate-50 via-white to-gray-50 relative overflow-hidden"
//       initial="hidden"
//       whileInView="visible"
//       viewport={{ once: true, amount: 0.2 }}
//       variants={containerVariants}
//       onMouseEnter={() => setIsPaused(true)}
//       onMouseLeave={() => setIsPaused(false)}
//     >
//       {/* Background Elements */}
//       <div className="absolute inset-0 opacity-30">
//         <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
//         <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
//         <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//         {/* Section Header */}
//         <motion.div className="text-center mb-16" variants={containerVariants}>
//           <motion.div
//             className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-indigo-700 font-medium text-sm mb-4"
//             variants={headerVariants}
//           >
//             ✨ Professional Services
//           </motion.div>
//           <motion.h2
//             className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
//             variants={headerVariants}
//           >
//             Transform Your Life with
//             <br />
//             <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
//               Expert Guidance
//             </span>
//           </motion.h2>
//           <motion.p
//             className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light"
//             variants={headerVariants}
//           >
//             Discover personalized counseling and coaching solutions designed to
//             unlock your potential and create lasting positive change in every
//             aspect of your life.
//           </motion.p>
//         </motion.div>

//         {/* Services Carousel */}
//         <div className="relative">
//           <div className="relative h-[450px] sm:h-[470px] lg:h-[490px]">
//             <AnimatePresence mode="wait">
//               <motion.div
//                 key={currentIndex}
//                 className="absolute inset-0 flex gap-6 px-2 h-full"
//                 initial={{ x: 60, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 exit={{ x: -60, opacity: 0 }}
//                 transition={{ duration: 0.5, ease: "easeInOut" }}
//               >
//                 {visibleServices.map((service, index) => (
//                   <div
//                     key={`${currentIndex}-${index}`}
//                     className="flex-1 min-w-0 flex flex-col"
//                     onMouseEnter={() => setHoveredCard(service.originalIndex)}
//                     onMouseLeave={() => setHoveredCard(null)}
//                   >
//                     <motion.div
//                       className={`relative p-8 rounded-3xl ${service.bgColor} border-2 ${service.borderColor} shadow-xl ${service.glowColor} ${service.hoverGlow} flex flex-col h-full min-h-[380px] cursor-pointer backdrop-blur-sm group overflow-hidden`}
//                       variants={cardVariants}
//                       whileHover="hover"
//                     >
//                       {/* Badge */}
//                       {service.badge && (
//                         <motion.div
//                           className="absolute top-4 right-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
//                           initial={{ scale: 0, rotate: -10 }}
//                           animate={{ scale: 1, rotate: 0 }}
//                           transition={{ delay: 0.5, type: "spring" }}
//                         >
//                           {service.badge}
//                         </motion.div>
//                       )}

//                       {/* Background Pattern */}
//                       <div className="absolute inset-0 opacity-5">
//                         <div className="absolute top-0 right-0 w-32 h-32 transform rotate-45 translate-x-16 -translate-y-16">
//                           <div
//                             className={`w-full h-full ${service.color.replace(
//                               "text",
//                               "bg"
//                             )}`}
//                           ></div>
//                         </div>
//                       </div>

//                       {/* Icon */}
//                       <motion.div
//                         className={`flex items-center justify-center w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg mb-6 mx-auto group-hover:shadow-xl transition-all duration-300`}
//                         whileHover={{ rotate: 5, scale: 1.1 }}
//                         transition={{ type: "spring", stiffness: 300 }}
//                       >
//                         <span className={`text-3xl ${service.color}`}>
//                           {service.icon}
//                         </span>
//                       </motion.div>

//                       {/* Title */}
//                       <motion.h3
//                         className="text-2xl font-bold text-gray-900 text-center mb-2"
//                         variants={headerVariants}
//                       >
//                         {service.title}
//                       </motion.h3>

//                       {/* Rating */}
//                       <motion.div
//                         className="flex items-center justify-center mb-4"
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         transition={{ delay: 0.3 }}
//                       >
//                         <div className="flex text-yellow-400 mr-2">
//                           {[...Array(5)].map((_, i) => (
//                             <FaStar
//                               key={i}
//                               className={
//                                 i < Math.floor(service.rating)
//                                   ? "text-yellow-400"
//                                   : "text-gray-300"
//                               }
//                             />
//                           ))}
//                         </div>
//                         <span className="text-sm font-semibold text-gray-700">
//                           {service.rating}
//                         </span>
//                       </motion.div>

//                       {/* Description */}
//                       <motion.ul
//                         className="flex-1 text-gray-700 space-y-3 text-base mb-6"
//                         variants={containerVariants}
//                       >
//                         {service.description.map((item, idx) => (
//                           <motion.li
//                             key={idx}
//                             className="flex items-start group/item"
//                             variants={listItemVariants}
//                             custom={idx}
//                           >
//                             <span
//                               className={`mr-3 mt-1 ${service.color} text-sm opacity-70 group-hover/item:opacity-100 transition-opacity`}
//                             >
//                               ▸
//                             </span>
//                             <span className="group-hover/item:text-gray-900 transition-colors">
//                               {item}
//                             </span>
//                           </motion.li>
//                         ))}
//                       </motion.ul>

//                       {/* Learn More Button */}
//                       <motion.button
//                         className={`w-full py-3 px-6 bg-white/90 backdrop-blur-sm ${service.color} font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center group/btn border border-white/50`}
//                         whileHover={{ scale: 1.02 }}
//                         whileTap={{ scale: 0.98 }}
//                       >
//                         Learn More
//                         <FaArrowRight className="ml-2 text-sm group-hover/btn:translate-x-1 transition-transform" />
//                       </motion.button>
//                     </motion.div>
//                   </div>
//                 ))}
//               </motion.div>
//             </AnimatePresence>
//           </div>

//           {/* Navigation Buttons */}
//           {services.length > slidesToShow && (
//             <>
//               <motion.button
//                 className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-xl hover:bg-white transition-all z-20 border border-gray-100"
//                 onClick={handlePrev}
//                 whileHover={{ scale: 1.1, x: -2 }}
//                 whileTap={{ scale: 0.95 }}
//                 aria-label="Previous slide"
//               >
//                 <FaChevronLeft className="text-indigo-600 text-lg" />
//               </motion.button>
//               <motion.button
//                 className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-xl hover:bg-white transition-all z-20 border border-gray-100"
//                 onClick={handleNext}
//                 whileHover={{ scale: 1.1, x: 2 }}
//                 whileTap={{ scale: 0.95 }}
//                 aria-label="Next slide"
//               >
//                 <FaChevronRight className="text-indigo-600 text-lg" />
//               </motion.button>
//             </>
//           )}

//           {/* Mobile navigation dots */}
//           {slidesToShow === 1 && services.length > 1 && (
//             <div className="flex justify-center mt-6 space-x-2">
//               {services.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setCurrentIndex(index)}
//                   className={`w-3 h-3 rounded-full transition-all duration-300 ${
//                     currentIndex === index
//                       ? "bg-indigo-500 scale-125"
//                       : "bg-gray-300 hover:bg-gray-400"
//                   }`}
//                   aria-label={`Go to slide ${index + 1}`}
//                 />
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Call to Action */}
//         <motion.div className="text-center mt-20" variants={containerVariants}>
//           <motion.button
//             className="group relative inline-flex items-center px-10 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-indigo-300/50 transition-all duration-300 overflow-hidden"
//             variants={buttonVariants}
//             whileHover="hover"
//             whileTap="tap"
//           >
//             {/* Animated background */}
//             <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-purple-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

//             {/* Button content */}
//             <span className="relative z-10 flex items-center">
//               Start Your Transformation Journey
//               <motion.div
//                 className="ml-3"
//                 animate={{ x: [0, 4, 0] }}
//                 transition={{
//                   repeat: Infinity,
//                   duration: 1.5,
//                   ease: "easeInOut",
//                 }}
//               >
//                 <FaArrowRight />
//               </motion.div>
//             </span>
//           </motion.button>

//           <motion.p
//             className="mt-4 text-gray-600 text-sm"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.8 }}
//           >
//             Join thousands who have transformed their lives with our expert
//             guidance
//           </motion.p>
//         </motion.div>
//       </div>
//     </motion.section>
//   );
// };

// export default OurServices;
