import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What is Solvit and what services does it offer?',
    answer:
      'Solvit is an online platform connecting you with verified counselors and coaches for support in mental health, career, relationships, wellness, academics, and financial well-being. It’s affordable, flexible, and judgment-free, offering a range of experts tailored to your needs.',
  },
  {
    question: 'How do I book a session and what are the costs?',
    answer:
      'Register as a client, browse categories, choose a counselor, and book a session based on their availability—all online. Pricing varies by counselor experience, visible on their profiles, with first-session discounts and bundled plans available.',
  },
  {
    question: 'Are counselors verified and is my information secure?',
    answer:
      'Yes, all counselors undergo a strict verification process checking qualifications, certifications, and experience per Indian regulations. Your data and sessions are protected with secure systems, prioritizing privacy and confidentiality.',
  },
  {
    question: 'What flexibility and language options do I have?',
    answer:
      'You can reschedule or cancel sessions via your dashboard (check our cancellation policy), and enjoy a free intro call before booking. We offer support in multiple Indian languages—filter by language when selecting a counselor.',
  },
  {
    question: 'What if I’m not satisfied with the service?',
    answer:
      'We’re committed to your satisfaction. If you’re unhappy after your initial sessions, we provide a money-back guarantee per our refund policy—just reach out to us.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const Faq = () => {
  const navigate = useNavigate()
  return (
    <motion.section
      className="relative py-20 bg-transparent"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
      aria-label="Frequently Asked Questions"
    >

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.header
          className="text-center mb-12"
          variants={itemVariants}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 bg-clip-text text-transparent mb-4 dark:from-primary-400 dark:via-primary-300 dark:to-secondary-400">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Get quick answers to your key questions about Solvit and how we support you.
          </p>
        </motion.header>

        <Accordion
          type="single"
          collapsible
          className="space-y-4"
          defaultValue={null}
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-white dark:bg-neutral-900 rounded-xl shadow-md"
            >
              <AccordionTrigger className="p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-t-xl">
                <span className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 leading-relaxed text-neutral-700 dark:text-neutral-300">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <button
            className="bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:from-primary-700 hover:to-primary-800 transition-transform transform hover:scale-105"
            aria-label="Contact us for more help"
            onClick={()=>navigate('/contact')}
          >
            Need More Help? Contact Us
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Faq;
