import { motion } from "framer-motion";
import React from "react";
import { FaCheckCircle, FaDollarSign, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";

const reasons = [
  {
    icon: <FaCheckCircle />,
    title: "Verified Experts",
    description:
      "Engage with certified counselors and coaches in mental health, career guidance, and more—delivering trusted, professional expertise.",
    color: "text-teal-500",
    bgColor: "bg-gradient-to-br from-teal-50 to-teal-100",
    borderColor: "border-teal-200",
  },
  {
    icon: <FaUsers />,
    title: "Personalized Support",
    description:
      "Receive bespoke sessions tailored to your needs, with flexible options including one-on-one consultations, bundles, or subscriptions.",
    color: "text-indigo-500",
    bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100",
    borderColor: "border-indigo-200",
  },
  {
    icon: <FaDollarSign />,
    title: "Affordable Access",
    description:
      "Unlock expert guidance with cost-effective pricing plans, ensuring high-quality support is within reach for all, anytime.",
    color: "text-emerald-500",
    bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    borderColor: "border-emerald-200",
  },
];

const WhySolvit = () => {
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

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 15px 30px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.section
      className="py-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div className="text-center mb-16" variants={containerVariants}>
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 bg-clip-text  bg-gradient-to-r from-indigo-500 to-indigo-600"
            variants={headerVariants}
          >
            Why Choose Solvit?
          </motion.h2>
          <motion.p
            className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
            variants={headerVariants}
          >
            Discover a platform designed to empower you with expert support,
            tailored solutions, and unmatched accessibility—crafted for your
            success.
          </motion.p>
        </motion.div>

        {/* Reasons Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
          variants={containerVariants}
        >
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              className={`p-8 rounded-2xl ${reason.bgColor} border ${reason.borderColor} shadow-lg transition-all duration-300`}
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.div
                className="flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-md mb-6 mx-auto"
                variants={headerVariants}
              >
                <span className={`text-3xl ${reason.color}`}>
                  {reason.icon}
                </span>
              </motion.div>
              <motion.h3
                className="text-2xl font-semibold text-gray-900 mb-4"
                variants={headerVariants}
              >
                {reason.title}
              </motion.h3>
              <motion.p
                className="text-gray-600 text-base leading-relaxed"
                variants={headerVariants}
              >
                {reason.description}
              </motion.p>
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
            <Link to="client-register">Start Your Journey Today</Link>
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default WhySolvit;
