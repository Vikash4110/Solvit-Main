import { motion } from "framer-motion";
import React from "react";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import {
  default as user1,
  default as user2,
  default as user3,
} from "../../assets/react.svg"; // Replace with your image

const Review = () => {
  const testimonials = [
    {
      name: "Anjali Sharma",
      role: "Software Engineer",
      location: "Mumbai",
      rating: 5,
      content:
        "Solvit helped me manage my work stress and regain my confidence. The counselor was empathetic and truly understood my challenges!",
      image: user1,
    },
    {
      name: "Rahul Verma",
      role: "College Student",
      location: "Delhi",
      rating: 5,
      content:
        "I was lost about my career path, but my coach on Solvit guided me step-by-step. My grades and focus have improved so much!",
      image: user2,
    },
    {
      name: "Priya Nair",
      role: "Homemaker",
      location: "Bengaluru",
      rating: 4,
      content:
        "The platform’s privacy gave me the courage to seek help for my anxiety. It’s been a life-changing experience—I’m happy to spend more time here!",
      image: user3,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    hover: { y: -10, transition: { duration: 0.3 } },
  };

  return (
    <motion.section
      className="py-24 "
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 bg-clip-text  bg-gradient-to-r from-indigo-500 to-indigo-600">
            Voices of <span className="text-black">Transformation</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Discover how Solvit has empowered individuals across India to find
            support and thrive.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              variants={itemVariants}
              whileHover="hover"
            >
              <div className="flex mb-4 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={
                      i < testimonial.rating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>

              <FaQuoteLeft className="text-indigo-200 text-4xl mb-6 opacity-75" />

              <p className="text-gray-700 italic text-base leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-200 shadow-sm">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {testimonial.role}, {testimonial.location}
                  </p>
                </div>
              </div>
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold py-4 px-10 rounded-full hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg"
          >
            Read More Success Stories
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Review;
