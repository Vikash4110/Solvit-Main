import { motion } from 'framer-motion';
import React from 'react';
import { FaGlobeAsia, FaHeart, FaLock, FaUsers } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import supportImg from '../../assets/core/IMG_2648.png';

const OurMission = () => {
  const missionPoints = [
    {
      icon: <FaHeart className="text-white text-xl" />,
      title: 'Empathy First',
      content: 'We listen without judgment and meet you where you are',
    },
    {
      icon: <FaLock className="text-white text-xl" />,
      title: 'Privacy Matters',
      content: 'Secure, confidential sessions with end-to-end encryption',
    },
    {
      icon: <FaUsers className="text-white text-xl" />,
      title: 'Holistic Help',
      content: 'Support for mental health, career, and personal growth',
    },
    {
      icon: <FaGlobeAsia className="text-white text-xl" />,
      title: 'Made for India',
      content: 'Tailored to local needs, languages, and culture',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-indigo-800 to-indigo-700 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <motion.div
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Our <span className="text-indigo-300">Mission</span> & Values
            </h2>

            <div className="relative">
              <div className="absolute -left-8 -top-8 w-32 h-32 bg-indigo-400 rounded-full opacity-20 blur-xl"></div>
              <div className="relative bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <p className="text-lg mb-6">
                  At Solvit, we’re committed to connecting you with trusted counselors and coaches
                  to support your mental health, career, and personal growth journey. We believe
                  that everyone deserves access to compassionate guidance, no matter where they are
                  in life.
                </p>
                <p className="text-lg mb-6">
                  Our platform makes professional support accessible, affordable, and free of
                  stigma, thoughtfully designed with India’s unique cultural context and local
                  challenges in mind. From navigating relationships to finding career clarity, we’re
                  here to empower you every step of the way.
                </p>
                <p className="text-lg">
                  Since our inception, we’ve worked tirelessly to build a network of certified
                  professionals who are passionate about helping individuals overcome obstacles and
                  unlock their full potential. Solvit is more than a service—it’s a movement to
                  redefine how India approaches well-being and self-improvement.
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-8 bg-indigo-400 text-blue-900 font-semibold py-3 px-8 rounded-lg hover:bg-indigo-300 transition-all shadow-lg"
            >
              <Link to="/client-register">Get Started Today</Link>
            </motion.button>
          </motion.div>

          <motion.div
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {missionPoints.map((point, index) => (
                <motion.div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-white/20 p-3 rounded-full">{point.icon}</div>
                    <h3 className="text-xl font-bold text-indigo-300">{point.title}</h3>
                  </div>
                  <p className="text-white/90">{point.content}</p>
                </motion.div>
              ))}
            </div>

            <div className="relative overflow-hidden rounded-xl">
              <img
                src={supportImg}
                alt="Support and counseling"
                className="w-full h-[400px] lg:h-[500px] object-cover" // Increased height
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OurMission;
