import { motion } from "framer-motion";
import React from "react";
import {
  FaCheckCircle,
  FaComments,
  FaShieldAlt,
  FaStar,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";
// import { Link } from "react-router-dom"; // Replace with your router link component

const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateY: 45 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: { duration: 1.2, delay: 0.3, ease: "easeOut" },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      y: -2,
      boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)",
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.98 },
  };

  const badgeVariants = {
    hover: { scale: 1.1, transition: { duration: 0.2 } },
  };

  return (
    <section className="relative py-20 min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Side - Content */}
          <div className="space-y-8">
            {/* Trust Badge */}
            <motion.div variants={textVariants}>
              <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <FaShieldAlt className="w-4 h-4" />
                <span>Verified & Licensed Professionals</span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="w-3 h-3 text-yellow-500" />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight"
              variants={textVariants}
            >
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Transform
              </span>
              <br />
              <span className="text-slate-800">Your Life with</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                Expert Support
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl text-slate-600 max-w-xl leading-relaxed font-medium"
              variants={textVariants}
            >
              Connect with certified counselors and life coaches in a safe,
              stigma-free environment. Your mental health journey starts here.
            </motion.p>

            {/* Trust Indicators */}
            <motion.div
              className="flex items-center space-x-8 py-4"
              variants={textVariants}
            >
              <div className="flex items-center space-x-2 text-slate-600">
                <FaUsers className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-slate-800">10K+</span>
                <span className="text-sm">Happy Clients</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                <FaCheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-slate-800">500+</span>
                <span className="text-sm">Licensed Experts</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4"
              variants={textVariants}
            >
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <a
                  href="/register"
                  className="group relative bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center space-x-3 transition-all duration-300 shadow-xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <FaComments className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Start Your Journey</span>
                </a>
              </motion.div>

              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <a
                  href="/counselor/register"
                  className="group border-2 border-slate-300 bg-white text-slate-700 px-8 py-4 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-700 transition-all duration-300 shadow-lg"
                >
                  <FaUserPlus className="w-5 h-5 transition-colors duration-300 group-hover:text-indigo-600" />
                  <span>Join as Expert</span>
                </a>
              </motion.div>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              className="pt-6 flex items-center space-x-6 text-sm text-slate-500"
              variants={textVariants}
            >
              <span>✓ 24/7 Available</span>
              <span>✓ Secure & Private</span>
              <span>✓ Affordable Rates</span>
            </motion.div>
          </div>

          {/* Right Side - Visual */}
          <div className="relative lg:pl-8">
            <motion.div className="relative" variants={imageVariants}>
              {/* Main Visual Container */}
              <div className="relative bg-gradient-to-br from-white to-indigo-50 rounded-3xl p-8 shadow-2xl border border-indigo-100 backdrop-blur-sm">
                {/* Hero Illustration Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <FaComments className="w-12 h-12 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-slate-800">
                        Professional Care
                      </h3>
                      <p className="text-slate-600">
                        Personalized support for your unique journey
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FaCheckCircle className="w-5 h-5" />
                </motion.div>

                <motion.div
                  className="absolute -bottom-4 -left-4 bg-indigo-500 text-white p-3 rounded-full shadow-lg"
                  animate={{ y: [0, 10, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5,
                  }}
                >
                  <FaShieldAlt className="w-5 h-5" />
                </motion.div>
              </div>

              {/* Decorative Background Elements */}
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-xl"></div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              className="absolute -left-8 top-20 bg-white p-4 rounded-xl shadow-lg border border-slate-200"
              variants={badgeVariants}
              whileHover="hover"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FaStar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">4.9/5</div>
                  <div className="text-xs text-slate-500">Client Rating</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute -right-8 bottom-20 bg-white p-4 rounded-xl shadow-lg border border-slate-200"
              variants={badgeVariants}
              whileHover="hover"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FaUsers className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">98%</div>
                  <div className="text-xs text-slate-500">Success Rate</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
