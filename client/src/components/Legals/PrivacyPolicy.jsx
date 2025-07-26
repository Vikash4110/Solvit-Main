import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiGlobe,
  FiLock,
  FiMail,
  FiUser,
} from "react-icons/fi";

const privacySections = [
  {
    title: "1. Information We Collect",
    icon: <FiUser className="text-indigo-600" />,
    content: (
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong>Personal Information:</strong> Name, email, phone number, and
          payment details.
        </li>
        <li>
          <strong>Session Data:</strong> Booking history and counselor
          preferences.
        </li>
        <li>
          <strong>Technical Data:</strong> IP address, browser type, and device
          information.
        </li>
      </ul>
    ),
  },
  {
    title: "2. How We Use Your Data",
    icon: <FiGlobe className="text-indigo-600" />,
    content: (
      <ul className="list-disc pl-5 space-y-2">
        <li>To provide and improve our services.</li>
        <li>To process bookings and payments securely.</li>
        <li>To personalize user experience and recommend relevant services.</li>
      </ul>
    ),
  },
  {
    title: "3. Data Security",
    icon: <FiLock className="text-indigo-600" />,
    content: (
      <ul className="list-disc pl-5 space-y-2">
        <li>We use encryption and secure servers to protect user data.</li>
        <li>
          Payment information is processed through secure third-party gateways.
        </li>
      </ul>
    ),
  },
  {
    title: "4. Third-Party Sharing",
    icon: <FiUser className="text-indigo-600" />,
    content: (
      <p>
        We do not sell or share personal data except as required for legal
        compliance or service delivery (e.g., payment processing).
      </p>
    ),
  },
  {
    title: "5. User Rights",
    icon: <FiUser className="text-indigo-600" />,
    content: (
      <ul className="list-disc pl-5 space-y-2">
        <li>Users can update or delete their accounts at any time.</li>
        <li>Users can request a copy of their stored data.</li>
      </ul>
    ),
  },
  {
    title: "6. Cookies & Tracking",
    icon: <FiGlobe className="text-indigo-600" />,
    content: (
      <ul className="list-disc pl-5 space-y-2">
        <li>
          We use cookies to improve website performance and personalize user
          experience.
        </li>
        <li>Users can disable cookies through browser settings.</li>
      </ul>
    ),
  },
  {
    title: "7. Changes to Privacy Policy",
    icon: <FiLock className="text-indigo-600" />,
    content: <p>Updates to this policy will be posted on the website.</p>,
  },
  {
    title: "8. Contact for Privacy Concerns",
    icon: <FiMail className="text-indigo-600" />,
    content: (
      <p>
        For privacy-related queries, contact{" "}
        <a
          href="mailto:privacy@solvit.com"
          className="text-indigo-600 hover:underline"
        >
          privacy@solvit.com
        </a>
        .
      </p>
    ),
  },
];

const PrivacyPolicy = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.section
      className="py-16 md:py-24 bg-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <span className="text-sm font-semibold tracking-wider text-indigo-600 uppercase">
            Data Protection
          </span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold text-gray-900">
            Privacy Policy
          </h1>
          <div className="mt-6 max-w-3xl mx-auto">
            <p className="text-lg text-gray-600 leading-relaxed">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Your privacy is important to us. This policy explains what
              personal data we collect, how we use it, and your rights regarding
              your information.
            </p>
          </div>
        </motion.div>

        {/* Accordion */}
        <div className="space-y-3">
          {privacySections.map((section, index) => (
            <motion.div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
              variants={itemVariants}
            >
              <button
                className={`w-full flex items-start text-left transition-colors ${
                  activeIndex === index ? "bg-gray-50" : "hover:bg-gray-50"
                }`}
                onClick={() => toggleAccordion(index)}
                aria-expanded={activeIndex === index}
                aria-controls={`privacy-content-${index}`}
              >
                <div className="p-4 flex items-center">{section.icon}</div>
                <div className="flex-1 py-4 pr-4">
                  <h2 className="text-lg font-medium text-gray-900 text-left">
                    {section.title}
                  </h2>
                </div>
                <div className="p-4 flex items-center text-gray-500">
                  <motion.div
                    animate={{ rotate: activeIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {activeIndex === index ? (
                      <FiChevronUp size={20} />
                    ) : (
                      <FiChevronDown size={20} />
                    )}
                  </motion.div>
                </div>
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    id={`privacy-content-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="px-6 pb-6 ml-14"
                  >
                    <div className="prose prose-gray max-w-none">
                      {section.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Call-to-Action */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-gray-50 rounded-xl p-8 md:p-10 inline-block max-w-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Have questions about your privacy?
            </h3>
            <p className="text-gray-600 mb-6">
              Our data protection officer is available to address any concerns
              you may have about how we handle your personal information.
            </p>
            <motion.a
              href="mailto:privacy@solvit.com"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiMail size={18} />
              Contact Our Privacy Team
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default PrivacyPolicy;
