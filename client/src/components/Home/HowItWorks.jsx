import { motion } from "framer-motion";
import React from "react";
import {
  FaCalendarCheck,
  FaComments,
  FaSearch,
  FaUserPlus,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const steps = [
  {
    icon: <FaUserPlus />,
    title: "Sign Up",
    description:
      "Create your free account as a Client or Counselor in just a minute.",
    color: "text-teal-500",
    bgColor: "bg-teal-50",
  },
  {
    icon: <FaSearch />,
    title: "Explore Counselors",
    description:
      "Browse verified experts in mental health, career, relationships, and more.",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
  },
  {
    icon: <FaCalendarCheck />,
    title: "Book a Session",
    description:
      "Pick a counselor, choose a time, and enjoy first-session discounts.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
  },
  {
    icon: <FaComments />,
    title: "Connect & Grow",
    description:
      "Join secure video calls or chats to receive tailored guidance.",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
];

const HowItWorks = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  return (
    <motion.section
      className="py-20 bg-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div className="text-center mb-16" variants={containerVariants}>
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 bg-clip-text  bg-gradient-to-r from-indigo-500 to-purple-600"
            variants={headerVariants}
          >
            How It Works
          </motion.h2>
          <motion.p
            className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
            variants={headerVariants}
          >
            Start your journey with Solvit in four simple steps—designed to
            connect you with the support you need, effortlessly.
          </motion.p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`relative p-6 rounded-2xl ${step.bgColor} shadow-lg hover:shadow-xl transition-all duration-300 text-center`}
              variants={stepVariants}
              whileHover="hover"
            >
              {/* Step Number */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                <span className="text-lg font-bold text-gray-900">
                  {index + 1}
                </span>
              </div>

              {/* Icon */}
              <motion.div
                className="flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-md mb-6 mx-auto"
                variants={headerVariants}
              >
                <span className={`text-3xl ${step.color}`}>{step.icon}</span>
              </motion.div>

              {/* Content */}
              <motion.h3
                className="text-xl font-semibold text-gray-900 mb-3"
                variants={headerVariants}
              >
                {step.title}
              </motion.h3>
              <motion.p
                className="text-gray-600 text-base leading-relaxed"
                variants={headerVariants}
              >
                {step.description}
              </motion.p>

              {/* Connecting Line (Hidden on Mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 w-12 h-1 bg-gradient-to-r from-gray-200 to-transparent" />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Call-to-Action */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold py-4 px-10 rounded-full hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg"
          >
            <Link to="/client-register"> Get Started Now</Link>
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HowItWorks;
