import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

const faqs = [
  {
    question: "What is Solvit and what services does it offer?",
    answer:
      "Solvit is an online platform connecting you with verified counselors and coaches for support in mental health, career, relationships, wellness, academics, and financial well-being. It’s affordable, flexible, and judgment-free, offering a range of experts tailored to your needs.",
  },
  {
    question: "How do I book a session and what are the costs?",
    answer:
      "Register as a client, browse categories, choose a counselor, and book a session based on their availability—all online. Pricing varies by counselor experience, visible on their profiles, with first-session discounts and bundled plans available.",
  },
  {
    question: "Are counselors verified and is my information secure?",
    answer:
      "Yes, all counselors undergo a strict verification process checking qualifications, certifications, and experience per Indian regulations. Your data and sessions are protected with secure systems, prioritizing privacy and confidentiality.",
  },
  {
    question: "What flexibility and language options do I have?",
    answer:
      "You can reschedule or cancel sessions via your dashboard (check our cancellation policy), and enjoy a free intro call before booking. We offer support in multiple Indian languages—filter by language when selecting a counselor.",
  },
  {
    question: "What if I’m not satisfied with the service?",
    answer:
      "We’re committed to your satisfaction. If you’re unhappy after your initial sessions, we provide a money-back guarantee per our refund policy—just reach out to us.",
  },
];

const Faq = () => {
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
      className="py-20 "
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 bg-clip-text  bg-gradient-to-r from-indigo-500 to-indigo-600">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            Get quick answers to your key questions about Solvit and how we
            support you.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden"
              variants={itemVariants}
            >
              <button
                className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                onClick={() => toggleAccordion(index)}
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeIndex === index ? (
                    <FaMinus className="text-indigo-500" />
                  ) : (
                    <FaPlus className="text-indigo-500" />
                  )}
                </motion.div>
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="px-6 pb-6"
                  >
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Call-to-Action */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold py-3 px-8 rounded-full hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg"
          >
            Need More Help? Contact Us
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Faq;
