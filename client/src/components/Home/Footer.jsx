import { motion } from 'framer-motion';
import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import logo from '../../assets/logo.png';

const socialLinks = [
  { Icon: Twitter, url: 'https://x.com/solvitforyou?s=21' },
  { Icon: Facebook, url: 'https://www.facebook.com/share/12HYipkeXG9/?mibextid=wwXIfr' },
  { Icon: Instagram, url: 'https://www.instagram.com/solvitcounselling?igsh=MWhuaWNsdHl3Nm4wZA==' },
  { Icon: Linkedin, url: 'https://www.linkedin.com/company/solvitcounselling/' },
];

const supportLinks = [
  { name: 'Contact Us', url: '/contact' },
  { name: 'Terms of Service', url: '/term-condition' },
  { name: 'Privacy Policy', url: '/privacy-policy' },
];

const quickLinks = [
  { name: 'About Us', url: '/about' },
  { name: 'Counselors', url: '/counselors' },
  { name: 'Blog', url: '/blog' },
];

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    hover: { x: 5, transition: { duration: 0.3 } },
  };

  const socialVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    hover: { scale: 1.15, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  return (
    <motion.footer
      className="relative bg-gradient-to-b from-primary-700 via-primary-800 to-primary-900 text-white py-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      {/* Top separator */}
      <Separator className="absolute top-0 left-0 right-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-12 relative z-10 mb-6">
        {/* Branding Section */}
        <motion.div className="space-y-6" variants={sectionVariants}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Badge variant="default" className="w-6 h-6" />
              <Badge variant="secondary" className="w-4 h-4" />
            </div>
            <img
              src={logo}
              alt="Solvit Logo"
              className="h-28 w-28 rounded-full object-cover bg-white"
            />
          </div>
          <p className="text-base leading-relaxed text-white">
            Your trusted partner in personal growth—connecting you with expert counselors across
            India.
          </p>
          <ul className="flex items-center space-x-5">
            {socialLinks.map(({ Icon, url }, idx) => (
              <motion.li key={idx} variants={socialVariants} whileHover="hover" whileTap="tap">
                <a
                  href={url}
                  className="flex items-center justify-center w-12 h-12 bg-white/80 rounded-full hover:bg-white shadow-md transition-colors duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${Icon.name}`}
                >
                  <Icon className="w-6 h-6 text-primary-900" />
                </a>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Support Links */}
        <motion.nav aria-label="Support links" variants={sectionVariants}>
          <Badge
            variant="outline"
            className="px-2 py-1 text-primary-800 uppercase text-sm font-semibold tracking-widest"
          >
            Support
          </Badge>
          <ul className="mt-6 space-y-5">
            {supportLinks.map(({ name, url }, idx) => (
              <motion.li key={idx} variants={listItemVariants} whileHover="hover">
                <Link
                  to={url}
                  className="text-base text-white hover:text-primary-300 hover:underline transition-colors duration-200"
                  title={`Learn about ${name}`}
                >
                  {name}
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.nav>

        {/* Quick Links */}
        <motion.nav aria-label="Quick navigation links" variants={sectionVariants}>
          <Badge
            variant="outline"
            className="px-2 py-1 text-primary-800 uppercase text-sm font-semibold tracking-widest"
          >
            Quick Links
          </Badge>
          <ul className="mt-6 space-y-5">
            {quickLinks.map(({ name, url }, idx) => (
              <motion.li key={idx} variants={listItemVariants} whileHover="hover">
                <Link
                  to={url}
                  className="text-base text-white hover:text-primary-300 hover:underline transition-colors duration-200"
                  title={`Navigate to ${name}`}
                >
                  {name}
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.nav>

        {/* Contact & Emergency */}
        <motion.address
          className="not-italic"
          variants={sectionVariants}
          aria-label="Contact and emergency information"
        >
          <Badge
            variant="outline"
            className="px-2 py-1 text-primary-800 uppercase text-sm font-semibold tracking-widest mb-4 inline-block"
          >
            Get in Touch
          </Badge>
          <ul className="space-y-5 text-white">
            <li>
              <a
                href="mailto:solvitcounselling@gmail.com"
                className="hover:text-primary-300 hover:underline transition-colors duration-200"
              >
                solvitcounselling@gmail.com
              </a>
            </li>
            <li>
              <a
                href="tel:+918055386973"
                className="hover:text-primary-300 hover:underline transition-colors duration-200"
              >
                +91 8055386973
              </a>
            </li>
            <li>Solvit Pvt. Ltd. Atal Nagar, Naya Raipur– 493661, India</li>
          </ul>
          <p className="mt-6 font-semibold text-white">
            ⚠️ In crisis? Call your local helpline immediately.
          </p>
        </motion.address>
      </div>

      <Separator className="border-white opacity-30" />

      <motion.p className="text-sm text-center text-white select-none mt-6">
        © {new Date().getFullYear()} Solvit. All rights reserved | Developed by{' '}
        <a href="https://www.saasweft.com/">SaaSWeft</a>
      </motion.p>
    </motion.footer>
  );
};

export default Footer;
