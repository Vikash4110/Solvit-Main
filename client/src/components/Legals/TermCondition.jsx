import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { FiChevronDown, FiChevronUp, FiMail } from "react-icons/fi";

const terms = [
  {
    title: "1. Introduction",
    content:
      "Welcome to Solvit, an online platform connecting users with professional counselors and coaches. By accessing or using our website, you agree to comply with these Terms & Conditions. These terms govern your use of our services and outline the rights and responsibilities of all parties involved.",
  },
  {
    title: "2. Services Offered",
    content:
      "Solvit provides a platform to book counseling and coaching sessions with independent professionals. Solvit does not provide counseling directly; our counselors operate as independent practitioners. Users must be 18 years or older to book sessions independently, or provide parental consent if under 18.",
  },
  {
    title: "3. User Responsibilities",
    content:
      "Users are required to provide accurate and complete information during registration. Misuse of the platform, including fraudulent activities or harassment, is strictly prohibited. Cancellations and refunds are subject to Solvit's refund policy, detailed separately on our website.",
  },
  {
    title: "4. Counselor Responsibilities",
    content:
      "Counselors must submit accurate credentials and maintain a high standard of professionalism in all interactions. Solvit reserves the right to remove any counselor from the platform for violations of our policies, including but not limited to unprofessional conduct or misrepresentation.",
  },
  {
    title: "5. Payments & Refunds",
    content:
      "Payments for sessions are processed securely through trusted third-party payment gateways. Refunds are issued in accordance with our refund policy, such as for cancellations made within 24 hours of booking, unless otherwise specified by the counselor's terms.",
  },
  {
    title: "6. Limitation of Liability",
    content:
      "Solvit is not responsible for the accuracy or outcomes of counseling advice provided by independent counselors. We do not offer medical or emergency services; users requiring immediate assistance should contact local emergency services or healthcare providers.",
  },
  {
    title: "7. Privacy & Data Protection",
    content:
      "Solvit adheres to strict data protection guidelines as outlined in our Privacy Policy. User data will not be sold or shared with third parties without explicit consent, except as required by law or to facilitate services on the platform.",
  },
  {
    title: "8. Termination of Accounts",
    content:
      "Solvit reserves the right to suspend or terminate user accounts for violations of these Terms & Conditions, including misuse of the platform or failure to comply with payment obligations.",
  },
  {
    title: "9. Changes to Terms",
    content:
      "Solvit may update these Terms & Conditions at any time. Users will be notified of significant changes, and continued use of the platform constitutes acceptance of the updated terms.",
  },
  {
    title: "10. Contact Information",
    content:
      "For questions, concerns, or clarifications regarding these Terms & Conditions, please reach out to us at solvitcounselling@gmail.com. We're here to assist you.",
  },
];

const TermCondition = () => {
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
            Legal Information
          </span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold text-gray-900">
            Terms & Conditions
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
              Please read these terms carefully before using our services. By
              accessing or using Solvit, you agree to be bound by these terms.
            </p>
          </div>
        </motion.div>

        {/* Accordion */}
        <div className="space-y-3">
          {terms.map((term, index) => (
            <motion.div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
              variants={itemVariants}
            >
              <button
                className={`w-full flex justify-between items-center p-6 text-left transition-colors ${
                  activeIndex === index ? "bg-gray-50" : "hover:bg-gray-50"
                }`}
                onClick={() => toggleAccordion(index)}
                aria-expanded={activeIndex === index}
                aria-controls={`term-content-${index}`}
              >
                <h2 className="text-lg font-medium text-gray-900">
                  {term.title}
                </h2>
                <motion.div
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-gray-500"
                >
                  {activeIndex === index ? (
                    <FiChevronUp size={20} />
                  ) : (
                    <FiChevronDown size={20} />
                  )}
                </motion.div>
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    id={`term-content-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="px-6 pb-6"
                  >
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-600 leading-relaxed">
                        {term.content}
                      </p>
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
              Need clarification on our terms?
            </h3>
            <p className="text-gray-600 mb-6">
              Our team is happy to answer any questions you may have about our
              Terms & Conditions.
            </p>
            <motion.a
              href="mailto:solvitcounselling@gmail.com"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiMail size={18} />
              Contact Our Legal Team
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default TermCondition;
