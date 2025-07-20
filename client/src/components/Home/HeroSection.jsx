import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import React, { useEffect } from "react";
import { FaComments, FaUserPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import heroImage from "../../assets/react.svg";

const HeroSection = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1, delay: 0.3, ease: "easeOut" },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  return (
    <section className="py-24 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Side - Text and Buttons */}
          <div className="space-y-10" data-aos="fade-up">
            <motion.h1
              className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-600 bg-clip-text text-transparent leading-tight tracking-tight"
              variants={textVariants}
            >
              Empowering Your Journey with Expert Support
            </motion.h1>
            <motion.p
              className="text-xl text-gray-700 max-w-lg font-medium leading-relaxed"
              variants={textVariants}
            >
              Solvit connects you with verified counselors and coaches to
              navigate life’s challenges—accessible, affordable, and
              stigma-free.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6"
              variants={textVariants}
            >
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Link
                  to="/counselor-register"
                  className="bg-gradient-to-r from-indigo-600 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold flex items-center space-x-3 hover:from-indigo-700 hover:to-indigo-700 transition-all duration-300 shadow-lg"
                >
                  <FaUserPlus className="w-5 h-5" />
                  <span>Join as a Counselor</span>
                </Link>
              </motion.div>
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Link
                  to="/client-register"
                  className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-full font-semibold flex items-center space-x-3 hover:bg-indigo-50 hover:border-indigo-700 transition-all duration-300 shadow-lg"
                >
                  <FaComments className="w-5 h-5" />
                  <span>Talk to a Counselor</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Side - Image */}
          <div className="relative" data-aos="fade-left">
            <motion.div variants={imageVariants}>
              <img
                src={heroImage}
                alt="Counseling Support"
                className="w-full max-w-lg mx-auto rounded-2xl object-cover  transform transition-transform duration-500"
              />
            </motion.div>
            {/* Decorative Elements */}
            <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full opacity-20 blur-xl -z-10"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-20 blur-xl -z-10"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
