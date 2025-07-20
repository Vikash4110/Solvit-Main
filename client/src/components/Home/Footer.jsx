import { motion } from "framer-motion";
import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../../assets/react.svg";

const socialLinks = [
  { Icon: FaTwitter, url: "https://x.com/solvitforyou?s=21" },
  {
    Icon: FaFacebook,
    url: "https://www.facebook.com/share/12HYipkeXG9/?mibextid=wwXIfr",
  },
  {
    Icon: FaInstagram,
    url: "https://www.instagram.com/solvitcounselling?igsh=MWhuaWNsdHl3Nm4wZA==",
  },
  {
    Icon: FaLinkedin,
    url: "https://www.linkedin.com/company/solvitcounselling/",
  },
];

// Define support links
const supportLinks = [
  { name: "Help Center", url: "/help-center" },
  { name: "Contact Us", url: "/contact" },
  { name: "Terms of Service", url: "/term-condition" },
  { name: "Privacy Policy", url: "/privacy-policy" },
];

// Define quick links
const quickLinks = [
  { name: "About Us", url: "/about" },
  { name: "Counselors", url: "/counselors" },
  { name: "Pricing", url: "/pricing" },
  { name: "Blog", url: "/blog" },
];

const Footer = () => {
  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  // Animation variants for sections
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Animation variants for list items
  const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    hover: { x: 5, transition: { duration: 0.3 } },
  };

  // Animation variants for social icons
  const socialVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    hover: { scale: 1.15, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  return (
    <motion.footer
      className="py-16 bg-gradient-to-b from-indigo-500 to-indigo-700 text-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 gap-x-12">
          {/* Brand Section */}
          <motion.div className="space-y-6" variants={sectionVariants}>
            <motion.div
              className="flex items-center space-x-3"
              variants={sectionVariants}
            >
              <div className="flex items-center space-x-2">
                <motion.div
                  className="bg-white w-6 h-6 rounded-full shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
                <motion.div
                  className="bg-indigo-300 w-4 h-4 rounded-full shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                />
              </div>
              <div className="flex items-center space-x-3">
                <motion.img
                  src={logo}
                  className="h-14 w-14 rounded-full object-cover"
                  alt="Solvit Logo"
                  variants={sectionVariants}
                />
                <motion.span
                  className="text-3xl font-extrabold tracking-tight text-white"
                  variants={sectionVariants}
                >
                  Solvit
                </motion.span>
              </div>
            </motion.div>
            <motion.p
              className="text-base leading-relaxed text-indigo-100"
              variants={sectionVariants}
            >
              Your trusted partner in personal growth—connecting you with expert
              counselors across India.
            </motion.p>
            {/* Social Media Links */}
            <motion.ul
              className="flex items-center space-x-5"
              variants={containerVariants}
            >
              {socialLinks.map(({ Icon, url }, index) => (
                <motion.li
                  key={index}
                  variants={socialVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <a
                    href={url}
                    className="flex items-center justify-center w-12 h-12 bg-teal-800 rounded-full hover:bg-indigo-600 transition-all duration-300 shadow-md"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit our ${Icon.name} page`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Support Section */}
          <motion.div variants={sectionVariants}>
            <motion.p
              className="text-sm font-semibold tracking-widest text-indigo-200 uppercase"
              variants={sectionVariants}
            >
              Support
            </motion.p>
            <motion.ul className="mt-6 space-y-5" variants={containerVariants}>
              {supportLinks.map(({ name, url }, index) => (
                <motion.li
                  key={index}
                  variants={listItemVariants}
                  whileHover="hover"
                >
                  <Link
                    to={url}
                    className="text-base text-indigo-100 hover:text-white hover:underline transition-all duration-200"
                  >
                    {name}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Quick Links Section */}
          <motion.div variants={sectionVariants}>
            <motion.p
              className="text-sm font-semibold tracking-widest text-indigo-200 uppercase"
              variants={sectionVariants}
            >
              Quick Links
            </motion.p>
            <motion.ul className="mt-6 space-y-5" variants={containerVariants}>
              {quickLinks.map(({ name, url }, index) => (
                <motion.li
                  key={index}
                  variants={listItemVariants}
                  whileHover="hover"
                >
                  <Link
                    to={url}
                    className="text-base text-indigo-100 hover:text-white hover:underline transition-all duration-200"
                  >
                    {name}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Contact Info Section */}
          <motion.div variants={sectionVariants}>
            <motion.p
              className="text-sm font-semibold tracking-widest text-indigo-200 uppercase"
              variants={sectionVariants}
            >
              Get in Touch
            </motion.p>
            <motion.ul className="mt-6 space-y-5" variants={containerVariants}>
              <motion.li variants={listItemVariants}>
                <a
                  href="mailto:solvitcounselling@gmail.com"
                  className="text-base text-teal-100 hover:text-white hover:underline transition-all duration-200"
                >
                  Email: solvitcounselling@gmail.com
                </a>
              </motion.li>
              <motion.li variants={listItemVariants}>
                <a
                  href="tel:+918055386973"
                  className="text-base text-indigo-100 hover:text-white hover:underline transition-all duration-200"
                >
                  Phone: +91 8055386973
                </a>
              </motion.li>
              <motion.li variants={listItemVariants}>
                <p className="text-base text-indigo-100">
                  Solvit Pvt. Ltd. Atal Nagar, Naya Raipur– 493661, India
                </p>
              </motion.li>
            </motion.ul>
          </motion.div>
        </div>

        {/* Divider and Copyright */}
        <motion.hr
          className="mt-16 mb-8 border-indigo-500 opacity-50"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <motion.p
          className="text-sm text-center text-indigo-200"
          variants={sectionVariants}
        >
          © {new Date().getFullYear()} Solvit. All Rights Reserved.
        </motion.p>
      </div>
    </motion.footer>
  );
};

export default Footer;
