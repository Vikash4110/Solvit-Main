import { motion } from "framer-motion";
import React from "react";
import {
  FaArrowRight,
  FaCalendarCheck,
  FaCheckCircle,
  FaComments,
  FaSearch,
  FaShieldAlt,
  FaUserPlus,
} from "react-icons/fa";

const steps = [
  {
    icon: <FaUserPlus />,
    title: "Create Account",
    subtitle: "Quick & Easy Setup",
    description:
      "Join thousands of users with our streamlined registration process. Choose your role and get verified instantly.",
    features: ["Free registration", "Email verification", "Profile setup"],
    color: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-50 to-teal-50",
    iconBg: "bg-gradient-to-r from-emerald-500 to-teal-500",
  },
  {
    icon: <FaSearch />,
    title: "Find Your Expert",
    subtitle: "Browse & Filter",
    description:
      "Discover certified professionals tailored to your needs with advanced filtering and detailed profiles.",
    features: ["Verified experts", "Detailed profiles", "Rating system"],
    color: "from-indigo-500 to-blue-600",
    bgGradient: "from-indigo-50 to-blue-50",
    iconBg: "bg-gradient-to-r from-indigo-500 to-blue-500",
  },
  {
    icon: <FaCalendarCheck />,
    title: "Schedule Session",
    subtitle: "Flexible Booking",
    description:
      "Book appointments at your convenience with real-time availability and instant confirmations.",
    features: ["Instant booking", "Flexible timing", "First-session discount"],
    color: "from-purple-500 to-violet-600",
    bgGradient: "from-purple-50 to-violet-50",
    iconBg: "bg-gradient-to-r from-purple-500 to-violet-500",
  },
  {
    icon: <FaComments />,
    title: "Start Your Journey",
    subtitle: "Secure & Private",
    description:
      "Connect through encrypted video calls or chat sessions for personalized guidance and support.",
    features: [
      "End-to-end encryption",
      "Multiple formats",
      "Progress tracking",
    ],
    color: "from-rose-500 to-pink-600",
    bgGradient: "from-rose-50 to-pink-50",
    iconBg: "bg-gradient-to-r from-rose-500 to-pink-500",
  },
];

const HowItWorks = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: { duration: 0.3 },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-indigo-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

      <motion.div
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        {/* Section Header */}
        <motion.div className="text-center mb-20" variants={containerVariants}>
          {/* Badge */}
          <motion.div
            className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
            variants={headerVariants}
          >
            <FaShieldAlt className="w-4 h-4" />
            <span>Simple 4-Step Process</span>
          </motion.div>

          <motion.h2
            className="text-5xl md:text-6xl font-black text-slate-800 mb-6 leading-tight"
            variants={headerVariants}
          >
            How{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Solvit
            </span>{" "}
            Works
          </motion.h2>
          <motion.p
            className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium"
            variants={headerVariants}
          >
            Transform your mental health journey with our streamlined process.
            From registration to your first session - we make professional
            support accessible.
          </motion.p>
        </motion.div>

        {/* Steps Container */}
        <motion.div className="relative" variants={containerVariants}>
          {/* Desktop Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent transform -translate-y-1/2 z-0"></div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative group"
                variants={stepVariants}
                whileHover="hover"
              >
                <div
                  className={`relative p-8 rounded-3xl bg-gradient-to-br ${step.bgGradient} backdrop-blur-sm border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 h-full`}
                >
                  {/* Step Number */}
                  <div className="absolute -top-4 left-8 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-indigo-100">
                    <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Icon Container */}
                  <motion.div
                    className={`w-16 h-16 rounded-2xl ${step.iconBg} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    variants={floatingVariants}
                    animate="animate"
                    transition={{ delay: index * 0.2 }}
                  >
                    <span className="text-2xl text-white">{step.icon}</span>
                  </motion.div>

                  {/* Content */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm font-medium text-indigo-600 mb-3">
                        {step.subtitle}
                      </p>
                    </div>

                    <p className="text-slate-600 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Features List */}
                    <ul className="space-y-2">
                      {step.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center space-x-2"
                        >
                          <FaCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-slate-600">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Arrow Connector (Desktop) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-indigo-100">
                        <FaArrowRight className="w-3 h-3 text-indigo-500" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Stats & CTA */}
        <motion.div
          className="mt-20 text-center space-y-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          {/* Trust Message */}
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Join 10,000+ users who trust Solvit for their mental health journey.
            Start with a free consultation today.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HowItWorks;
