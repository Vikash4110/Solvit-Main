// File: src/pages/ServicePage.jsx
import { motion } from "framer-motion";
import React from "react";
import { FaGlobe, FaRegClock, FaStar } from "react-icons/fa";
import { FiAward } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";

const serviceData = {
  "mental-health-counseling": {
    title: "Mental Health Counseling",
    description:
      "Professional support for managing mental health challenges including anxiety, depression, stress, and trauma. Our licensed therapists provide evidence-based treatments tailored to your needs.",
    benefits: [
      "Personalized treatment plans",
      "Confidential and safe environment",
      "Evidence-based therapies",
      "Coping strategies development",
      "Improved emotional wellbeing",
    ],
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
  },
  "life-personal-development": {
    title: "Life & Personal Development",
    description:
      "Guidance for personal growth, self-improvement, and achieving your full potential. Our coaches help you set meaningful goals and develop strategies to reach them.",
    benefits: [
      "Goal setting and achievement",
      "Increased self-awareness",
      "Improved decision-making",
      "Enhanced life satisfaction",
      "Personal accountability",
    ],
    image:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
  },
  "relationship-family-therapy": {
    title: "Relationship & Family Therapy",
    description:
      "Strengthen your relationships and improve family dynamics with professional guidance. We help couples and families communicate better and resolve conflicts constructively.",
    benefits: [
      "Improved communication skills",
      "Conflict resolution strategies",
      "Healthier relationship patterns",
      "Family bonding techniques",
      "Pre-marital counseling",
    ],
    image:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
  },
  "career-professional-coaching": {
    title: "Career & Professional Coaching",
    description:
      "Advance your career with expert coaching on professional development, career transitions, and workplace challenges. Get the tools to thrive in your professional life.",
    benefits: [
      "Career path guidance",
      "Interview preparation",
      "Resume and LinkedIn optimization",
      "Leadership development",
      "Work-life balance strategies",
    ],
    image:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
  },
  "health-wellness-coaching": {
    title: "Health & Wellness Coaching",
    description:
      "Holistic support for physical and emotional wellbeing. Our coaches help you develop sustainable healthy habits and manage stress effectively.",
    benefits: [
      "Nutrition guidance",
      "Stress management techniques",
      "Sleep improvement strategies",
      "Exercise motivation",
      "Mindfulness practices",
    ],
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
  },
  "academic-student-support": {
    title: "Academic & Student Support",
    description:
      "Specialized counseling for students facing academic pressures, career decisions, and personal challenges. We help students navigate their educational journey successfully.",
    benefits: [
      "Study skills development",
      "Test anxiety management",
      "Career counseling",
      "Time management strategies",
      "College transition support",
    ],
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
  },
};

// Map URL serviceId to serviceData keys
const serviceIdMap = {
  "mental-health": "mental-health-counseling",
  career: "career-professional-coaching",
  relationship: "relationship-family-therapy",
  "life-coaching": "life-personal-development",
  financial: "financial-counselling", // Note: Update serviceData if needed
  academic: "academic-student-support",
  "health-wellness": "health-wellness-coaching",
};

// Dummy counselor data for all services
const dummyCounselors = [
  {
    id: 1,
    fullName: "Dr. Sarah Johnson",
    specialization: ["Clinical Psychology", "Cognitive Behavioral Therapy"],
    yearsOfExperience: 12,
    languages: ["English", "Spanish"],
    bio: "Specialized in anxiety disorders and trauma with a compassionate, evidence-based approach.",
    profilePictureUrl: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 2,
    fullName: "Michael Chen",
    specialization: ["Marriage Counseling", "Family Therapy"],
    yearsOfExperience: 8,
    languages: ["English", "Mandarin"],
    bio: "Helping couples and families build stronger, healthier relationships through effective communication.",
    profilePictureUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 3,
    fullName: "Dr. Priya Patel",
    specialization: ["Career Coaching", "Leadership Development"],
    yearsOfExperience: 15,
    languages: ["English", "Hindi", "Gujarati"],
    bio: "Executive coach with Fortune 500 experience helping professionals achieve their career goals.",
    profilePictureUrl: "https://randomuser.me/api/portraits/women/67.jpg",
  },
];

const ServicePage = () => {
  const { serviceId } = useParams();
  const mappedServiceId = serviceIdMap[serviceId] || serviceId;
  const service = serviceData[mappedServiceId];

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Service not found
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    hover: { scale: 1.03, transition: { duration: 0.3 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-teal-50 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Service Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:flex-shrink-0 md:w-1/3">
                <img
                  className="h-full w-full object-cover"
                  src={service.image}
                  alt={service.title}
                />
              </div>
              <div className="p-8 md:w-2/3">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {service.title}
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  {service.description}
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Key Benefits:
                </h3>
                <ul className="space-y-2 mb-6">
                  {service.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-teal-500 mr-2 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <Link to="/register"> Book a Session</Link>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recommended Counselors */}
        <motion.div
          className="mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-3xl font-bold text-gray-900 mb-6 text-center"
            variants={itemVariants}
          >
            Recommended {service.title} Specialists
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto"
            variants={itemVariants}
          >
            Our verified counselors specializing in{" "}
            {service.title.toLowerCase()} are ready to support you.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dummyCounselors.map((counselor) => (
              <motion.div
                key={counselor.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <img
                        src={counselor.profilePictureUrl}
                        alt={counselor.fullName}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                      />
                      <div className="absolute -bottom-2 right-2 bg-teal-500 text-white rounded-full p-1 shadow-md">
                        <FiAward className="text-sm" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 text-center mb-1">
                      {counselor.fullName}
                    </h3>
                    <p className="text-sm text-teal-600 font-medium text-center mb-3">
                      {service.title} Specialist
                    </p>

                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={
                            i < 4.5 ? "text-yellow-400" : "text-gray-300"
                          }
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">4.5</span>
                    </div>

                    <div className="w-full space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <FaRegClock className="text-teal-500 mr-2" />
                        <span>
                          <span className="font-medium">Experience:</span>{" "}
                          {counselor.yearsOfExperience} years
                        </span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <FaGlobe className="text-teal-500 mr-2 mt-0.5" />
                        <span>
                          <span className="font-medium">Languages:</span>{" "}
                          {counselor.languages.join(", ")}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 text-center mb-6 line-clamp-3">
                      {counselor.bio}
                    </p>

                    <motion.button
                      className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-medium py-2.5 px-6 rounded-lg hover:from-teal-600 hover:to-indigo-700 transition-all shadow-sm"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link to="/register">Book Now</Link>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="bg-gradient-to-r from-teal-500 to-indigo-600 rounded-xl shadow-xl p-8 text-center text-white mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold mb-3">
            Ready to Start Your {service.title} Journey?
          </h3>
          <p className="text-teal-100 mb-6 max-w-2xl mx-auto">
            Our specialists are here to help you achieve your goals with
            personalized support.
          </p>
          <motion.button
            className="bg-white text-teal-600 hover:bg-gray-50 font-medium py-3 px-8 rounded-lg shadow-md"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to="/register"> Get Started Today</Link>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ServicePage;
