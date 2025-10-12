import { motion } from 'framer-motion';
import React from 'react';
import {
  FaGlobeAsia,
  FaHandsHelping,
  FaHeart,
  FaLock,
  FaUserCheck,
  FaUserShield,
  FaWallet,
} from 'react-icons/fa';
import { GiBrain } from 'react-icons/gi';
import { Link } from 'react-router-dom';
import aboutHero from '../../assets/core/IMG_2644.png'; // Replace with your image
import OurMission from '../../components/Home/OurMission.jsx';

const AboutUs = () => {
  const stats = [
    {
      value: '10K+',
      label: 'Lives Touched',
      icon: <FaHeart className="text-indigo-600 text-3xl" />,
    },
    {
      value: '500+',
      label: 'Verified Experts',
      icon: <FaUserCheck className="text-indigo-600 text-3xl" />,
    },
    {
      value: '100%',
      label: 'Confidential',
      icon: <FaLock className="text-indigo-600 text-3xl" />,
    },
    {
      value: '24/7',
      label: 'Support Available',
      icon: <FaHandsHelping className="text-indigo-600 text-3xl" />,
    },
  ];

  const values = [
    {
      title: 'Empathy First',
      description: 'We listen without judgment and meet you where you are in your journey.',
      icon: <FaHeart className="text-indigo-500 text-2xl" />,
    },
    {
      title: 'Privacy Matters',
      description:
        'Your sessions are completely secure and confidential with end-to-end encryption.',
      icon: <FaLock className="text-indigo-500 text-2xl" />,
    },
    {
      title: 'Holistic Help',
      description: 'Mental, emotional, academic, and career guidance — all under one roof.',
      icon: <GiBrain className="text-indigo-500 text-2xl" />,
    },
    {
      title: 'Made for India',
      description: 'Built with understanding of local needs, languages, and cultural context.',
      icon: <FaGlobeAsia className="text-indigo-500 text-2xl" />,
    },
  ];

  const whyChooseUs = [
    {
      title: 'Verified Experts',
      description:
        'Connect with certified counselors and coaches ensuring trusted, professional guidance.',
      icon: <FaUserShield className="text-indigo-500 text-2xl" />,
    },
    {
      title: 'Personalized Support',
      description: 'Tailored sessions to fit your unique needs with flexible consultation options.',
      icon: <FaHandsHelping className="text-indigo-500 text-2xl" />,
    },
    {
      title: 'Affordable Access',
      description: 'Budget-friendly pricing tiers making expert advice accessible to everyone.',
      icon: <FaWallet className="text-indigo-500 text-2xl" />,
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-700 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={aboutHero}
            alt="Mental health support"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Your Partner in Personal Growth
            </h1>
            <p className="text-xl text-indigo-100 mb-8">
              We believe everyone deserves access to the right support at the right time.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-indigo-600 font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Link to="/client-register"> Find Your Expert</Link>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.1 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  y: -5,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div className="flex justify-center mb-4">{stat.icon}</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <OurMission />

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why <span className="text-indigo-600">Choose Solvit</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering you with the right support to overcome life's challenges—accessible,
              expert, and tailored to you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyChooseUs.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all border-t-4 border-indigo-500"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-indigo-100 p-3 rounded-full">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-700 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Take the First Step?</h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Join thousands who've found support and guidance through Solvit.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-indigo-600 font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Link to="/browse-counselors">Connect with an Expert</Link>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
