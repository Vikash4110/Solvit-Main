// File: src/pages/ContactUs.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaSpinner,
  FaCheckCircle,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaQuestionCircle,
  FaUserMd,
  FaCalendarAlt,
  FaUser,
  FaLock,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../config/api';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    // ✅ REMOVED: phone field
    subject: 'general',
    message: '',
    userType: 'client',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [prefilledFromProfile, setPrefilledFromProfile] = useState(false);
  // ✅ UPDATED: Track which fields are locked (removed phone)
  const [lockedFields, setLockedFields] = useState({
    firstName: false,
    lastName: false,
    email: false,
    // ✅ REMOVED: phone: false,
    userType: false,
  });

  // ✅ UPDATED: AUTO-PREFILL WITH LOCKED FIELDS (removed phone handling)
  useEffect(() => {
    const prefillFormFromLocalStorage = () => {
      try {
        // Check authentication status
        const clientToken = localStorage.getItem('clientAccessToken');
        const counselorToken = localStorage.getItem('counselorAccessToken');

        if (clientToken || counselorToken) {
          setIsAuthenticated(true);
          const userType = clientToken ? 'client' : 'counselor';

          // Get user data from localStorage
          let userData = null;
          try {
            if (userType === 'client') {
              userData = JSON.parse(localStorage.getItem('client') || '{}');
            } else {
              userData = JSON.parse(localStorage.getItem('counselor') || '{}');
            }
          } catch (parseError) {
            console.warn('Error parsing user data from localStorage:', parseError);
            return;
          }

          // ✅ UPDATED: Prefill form with available user data (removed phone)
          if (userData && Object.keys(userData).length > 0) {
            const firstName = userData.firstName || userData.fullName?.split(' ')[0] || '';
            const lastName =
              userData.lastName || userData.fullName?.split(' ').slice(1).join(' ') || '';
            const email = userData.email || '';

            setFormData((prev) => ({
              ...prev,
              firstName,
              lastName,
              email,
              // ✅ REMOVED: phone,
              userType,
            }));

            // ✅ UPDATED: Lock fields that have data (removed phone)
            setLockedFields({
              firstName: !!firstName,
              lastName: !!lastName,
              email: !!email,
              // ✅ REMOVED: phone: !!phone,
              userType: true, // Always lock user type if authenticated
            });

            setPrefilledFromProfile(true);
          } else {
            // Set user type even if no user data available
            setFormData((prev) => ({ ...prev, userType }));
            setLockedFields((prev) => ({ ...prev, userType: true }));
          }
        }
      } catch (error) {
        console.error('Error prefilling form from localStorage:', error);
      }
    };

    prefillFormFromLocalStorage();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ Prevent changes to locked fields
    if (lockedFields[name]) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/contact/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          prefilledFromProfile,
          authenticatedUser: isAuthenticated,
        }),
      });

      const data = await response.json();

      if (data.success || response.ok) {
        setSubmitted(true);
        toast.success("Message sent successfully! We'll get back to you soon.", {
          duration: 4000,
          icon: '📧',
        });

        // Reset only non-locked fields after successful submission
        setTimeout(() => {
          setFormData((prev) => ({
            ...prev,
            subject: 'general',
            message: '',
            // Keep locked fields intact
          }));
          setSubmitted(false);
        }, 3000);
      } else {
        toast.error(data.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: FaPhone,
      title: 'Phone Support',
      details: '+1 (555) 123-4567',
      subtext: 'Mon-Fri 9AM-6PM EST',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: FaEnvelope,
      title: 'Email Support',
      details: 'support@solvit.com',
      subtext: 'We respond within 24 hours',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Office Location',
      details: '123 Wellness Street',
      subtext: 'New York, NY 10001',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: FaClock,
      title: 'Business Hours',
      details: 'Monday - Friday',
      subtext: '9:00 AM - 6:00 PM EST',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const faqItems = [
    {
      icon: FaQuestionCircle,
      question: 'How do I book a counseling session?',
      answer:
        "Simply browse our counselors, select your preferred time slot, and complete the booking process. Payment is secure and you'll receive instant confirmation.",
    },
    {
      icon: FaUserMd,
      question: 'Are your counselors licensed?',
      answer:
        'Yes, all our counselors are licensed professionals with verified credentials. We maintain strict quality standards for all practitioners on our platform.',
    },
    {
      icon: FaCalendarAlt,
      question: 'Can I reschedule my appointment?',
      answer:
        'Yes, you can reschedule up to 24 hours before your appointment through your client dashboard or by contacting our support team.',
    },
  ];

  const socialLinks = [
    { icon: FaFacebook, url: '#', color: 'text-blue-600 hover:text-blue-700' },
    { icon: FaTwitter, url: '#', color: 'text-sky-500 hover:text-sky-600' },
    { icon: FaLinkedin, url: '#', color: 'text-blue-700 hover:text-blue-800' },
    { icon: FaInstagram, url: '#', color: 'text-pink-600 hover:text-pink-700' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-24 pb-16">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-12 w-72 h-72 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-24 right-10 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            className="text-5xl font-bold leading-tight tracking-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gray-900">Get in Touch</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              We're Here to Help
            </span>
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Have questions about our platform? Need support with booking? We're committed to
            providing you with the best mental health support experience.
          </motion.p>
        </div>

        {/* Contact Information Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 text-center hover:shadow-2xl transition-all duration-300"
            >
              <div
                className={`inline-flex items-center justify-center w-16 h-16 ${info.bgColor} rounded-2xl mb-4`}
              >
                <info.icon className={`h-8 w-8 ${info.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
              <p className="text-gray-700 font-medium mb-1">{info.details}</p>
              <p className="text-sm text-gray-500">{info.subtext}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Send us a Message</h2>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <FaCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600 mb-2">Thank you for contacting us.</p>
                  <p className="text-sm text-gray-500">
                    We'll get back to you within 24 hours at {formData.email}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={`w-full p-4 rounded-xl transition-all ${
                            lockedFields.firstName
                              ? 'bg-indigo-50 border-2 border-indigo-200 text-indigo-900 cursor-not-allowed'
                              : 'border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                          }`}
                          placeholder="John"
                          required
                          readOnly={lockedFields.firstName}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={`w-full p-4 rounded-xl transition-all ${
                            lockedFields.lastName
                              ? 'bg-indigo-50 border-2 border-indigo-200 text-indigo-900 cursor-not-allowed'
                              : 'border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                          }`}
                          placeholder="Doe"
                          required
                          readOnly={lockedFields.lastName}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ✅ UPDATED: Email takes full width since phone is removed */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full p-4 rounded-xl transition-all ${
                          lockedFields.email
                            ? 'bg-indigo-50 border-2 border-indigo-200 text-indigo-900 cursor-not-allowed'
                            : 'border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                        }`}
                        placeholder="john@example.com"
                        required
                        readOnly={lockedFields.email}
                      />
                    </div>
                  </div>

                  {/* User Type and Subject */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        I am a...
                      </label>
                      <div className="relative">
                        <select
                          name="userType"
                          value={formData.userType}
                          onChange={handleChange}
                          className={`w-full p-4 rounded-xl transition-all ${
                            lockedFields.userType
                              ? 'bg-indigo-50 border-2 border-indigo-200 text-indigo-900 cursor-not-allowed'
                              : 'border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                          }`}
                          disabled={lockedFields.userType}
                        >
                          <option value="client">Client</option>
                          <option value="counselor">Counselor</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="booking">Booking Support</option>
                        <option value="technical">Technical Issue</option>
                        <option value="counselor-application">Counselor Application</option>
                        <option value="billing">Billing Question</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="6"
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
                      placeholder="Tell us how we can help you..."
                      maxLength="1000"
                      required
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {formData.message.length}/1000 characters
                    </div>
                  </div>

                  {/* Privacy Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Privacy Notice:</span> Your message will be sent
                      directly to our support team via email.
                      {prefilledFromProfile &&
                        ' Your secured profile information ensures faster response times.'}
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* FAQ and Social Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="space-y-8"
          >
            {/* Quick Help */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Quick Help</h2>
              <div className="space-y-6">
                {faqItems.map((faq, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                          <faq.icon className="h-5 w-5 text-indigo-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Follow Us</h2>
              <p className="text-gray-600 mb-6">
                Stay connected with us on social media for mental health tips, updates, and
                community support.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    className={`w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center ${social.color} hover:scale-110 transition-all duration-300`}
                  >
                    <social.icon className="h-6 w-6" />
                  </a>
                ))}
              </div>
            </div>

            {/* Emergency Notice */}
            <div className="bg-red-50 border border-red-200 rounded-3xl p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">!</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Crisis Support</h3>
                  <p className="text-red-700 text-sm mb-3">
                    If you're experiencing a mental health crisis, please contact emergency services
                    or call the National Suicide Prevention Lifeline.
                  </p>
                  <div className="flex flex-col space-y-2 text-sm">
                    <div className="text-red-800 font-medium">
                      🇺🇸 US: 988 (Suicide & Crisis Lifeline)
                    </div>
                    <div className="text-red-800 font-medium">📞 Emergency: 911</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
