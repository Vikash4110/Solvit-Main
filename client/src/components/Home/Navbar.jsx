import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FaBars,
  FaChevronDown,
  FaComments,
  FaHome,
  FaInfoCircle,
  FaSignOutAlt,
  FaTimes,
  FaUser,
  FaUserFriends,
  FaUserTie,
  FaBlog,
  FaLock,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useCounselorAuth } from "../../contexts/CounselorAuthContext";
import { useClientAuth } from "../../contexts/ClientAuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileUserDropdownOpen, setMobileUserDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const userDropdownRef = useRef(null);
  const servicesDropdownRef = useRef(null);

  const { counselor, counselorLogout, counselorLoading } = useCounselorAuth();
  const { client, clientLogout, clientLoading } = useClientAuth();

  // Check if user is authenticated (either client or counselor)
  const isAuthenticated = !!(counselor || client);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
      if (
        servicesDropdownRef.current &&
        !servicesDropdownRef.current.contains(event.target)
      ) {
        setIsServicesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navbar background change on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setIsUserDropdownOpen(false);
    setIsServicesDropdownOpen(false);
    setMobileUserDropdownOpen(false);
  }, [location]);

  // Logout handlers
  const logoutCounselor = async () => {
    await counselorLogout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const logoutClient = async () => {
    await clientLogout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  // ✅ UPDATED: Dynamic navLinks based on authentication status
  const getNavLinks = () => {
  const baseLinks = [
    { to: "#", text: "Services", icon: <FaUserFriends />, isDropdown: true },
    { to: "/about", text: "About", icon: <FaInfoCircle /> },
  ];

  // ✅ Counselors navigation logic
  // Show "Counselors" link to:
  // 1. Clients (authenticated clients need to find counselors)
  // 2. Non-authenticated users (potential clients browsing)
  // Hide from:
  // 1. Counselors (they don't need to browse other counselors)
  const shouldShowCounselors = !counselor; // Show to everyone except counselors
  
  if (shouldShowCounselors) {
    baseLinks.push({
      to: "/browse-counselors", 
      text: "Counselors", 
      icon: <FaUserFriends />
    });
  }

  // ✅ Show Blogs to everyone
  baseLinks.push({
    to: "/blogs",
    text: "Blogs",
    icon: <FaBlog />,
    protected: false,
  });

  // ✅ Only add Contact link if user is authenticated (both clients and counselors)
  if (isAuthenticated) {
    baseLinks.push({
      to: "/contact",
      text: "Contact",
      icon: <FaComments />,
      protected: false,
    });
  }

  return baseLinks;
};

  // ✅ Handler for protected contact access
  const handleContactClick = () => {
    if (!isAuthenticated) {
      toast.error("Please login to access the contact form", {
        icon: "🔒",
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FECACA'
        }
      });
      navigate("/login");
      return;
    }
    navigate("/contact");
  };

  const servicesLinks = [
    {
      to: "/services/mental-health",
      text: "Mental Health Counseling",
      icon: "🧠",
    },
    { to: "/services/career", text: "Career Counselling", icon: "💼" },
    {
      to: "/services/relationship",
      text: "Relationship Counselling",
      icon: "❤️",
    },
    { to: "/services/life-coaching", text: "Life Coaching", icon: "🚀" },
    { to: "/services/academic", text: "Academic Counselling", icon: "🎓" },
    {
      to: "/services/health-wellness",
      text: "Health and Wellness",
      icon: "💚",
    },
  ];

  // Desktop User Dropdown
  const DesktopUserDropdown = ({
    user,
    initial,
    profileLink,
    dashboardLink,
    logout,
  }) => (
    <div className="relative hidden lg:block" ref={userDropdownRef}>
      <motion.button
        onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
        className="flex items-center space-x-3 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg hover:bg-white/90 hover:shadow-xl transition-all duration-300 hover:scale-105"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.fullName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            user?.fullName?.charAt(0) || initial
          )}
        </div>
        <div className="hidden md:block">
          <div className="font-semibold text-gray-800 text-sm">
            {user?.fullName}
          </div>
          <div className="text-xs text-gray-500">Online</div>
        </div>
        <motion.div
          animate={{ rotate: isUserDropdownOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FaChevronDown className="text-xs text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isUserDropdownOpen && (
          <motion.div
            className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 overflow-hidden z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 py-4 border-b border-gray-100/50 bg-gradient-to-r from-indigo-50/50 to-blue-50/50">
              <p className="font-semibold text-gray-800">{user?.fullName}</p>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Active
              </div>
            </div>

            <div className="py-2">
              <Link
                to={profileLink}
                className="px-6 py-3 flex items-center hover:bg-indigo-50/50 transition-colors duration-200"
              >
                <FaUser className="mr-3 text-indigo-600" />
                <span className="font-medium">Profile</span>
              </Link>
              <Link
                to={dashboardLink}
                className="px-6 py-3 flex items-center hover:bg-indigo-50/50 transition-colors duration-200"
              >
                <FaHome className="mr-3 text-indigo-600" />
                <span className="font-medium">Dashboard</span>
              </Link>
            </div>

            <div className="border-t border-gray-100/50">
              <button
                onClick={logout}
                className="w-full px-6 py-3 flex items-center hover:bg-red-50/50 hover:text-red-600 transition-colors duration-200"
              >
                <FaSignOutAlt className="mr-3" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Mobile User Menu
  const MobileUserDropdown = ({ user, profileLink, dashboardLink, logout }) => (
    <div className="px-4">
      <motion.button
        onClick={() => setMobileUserDropdownOpen(!mobileUserDropdownOpen)}
        className="w-full px-4 py-3 rounded-xl font-medium flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 hover:from-indigo-100 hover:to-blue-100 transition-all duration-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {user?.fullName?.charAt(0)}
          </div>
          <span>{user?.fullName}</span>
        </div>
        <motion.div
          animate={{ rotate: mobileUserDropdownOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FaChevronDown />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {mobileUserDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 overflow-hidden"
          >
            <Link
              to={profileLink}
              className="px-6 py-3 flex items-center hover:bg-indigo-50/50 transition-colors duration-200"
            >
              <FaUser className="mr-3 text-indigo-600" /> Profile
            </Link>
            <Link
              to={dashboardLink}
              className="px-6 py-3 flex items-center hover:bg-indigo-50/50 transition-colors duration-200"
            >
              <FaHome className="mr-3 text-indigo-600" /> Dashboard
            </Link>
            <button
              onClick={logout}
              className="w-full px-6 py-3 flex items-center hover:bg-red-50/50 text-red-600 transition-colors duration-200"
            >
              <FaSignOutAlt className="mr-3" /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ✅ Get navigation links based on authentication status
  const navLinks = getNavLinks();

  return (
    <motion.nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-xl py-4"
          : "bg-white/90 backdrop-blur-sm py-4"
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={logo}
                className="h-12 w-12 scale-[4.5]"
                alt="Solvit Logo"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-2">
            {navLinks.map((link) =>
              link.isDropdown ? (
                <div
                  key={link.text}
                  className="relative"
                  ref={servicesDropdownRef}
                >
                  <motion.button
                    onClick={() =>
                      setIsServicesDropdownOpen(!isServicesDropdownOpen)
                    }
                    className={`px-4 py-2 rounded-xl flex items-center font-medium transition-all duration-300 ${
                      isServicesDropdownOpen
                        ? "bg-indigo-100/80 text-indigo-700"
                        : "hover:bg-indigo-50/80 hover:text-indigo-600"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {link.icon}
                    <span className="ml-2">{link.text}</span>
                    <motion.div
                      animate={{ rotate: isServicesDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-2"
                    >
                      <FaChevronDown className="text-xs" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {isServicesDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute mt-3 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 overflow-hidden"
                      >
                        <div className="py-3">
                          {servicesLinks.map((service, index) => (
                            <motion.div
                              key={service.text}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.2,
                                delay: index * 0.05,
                              }}
                            >
                              <Link
                                to={service.to}
                                onClick={() => setIsServicesDropdownOpen(false)}
                                className="flex items-center px-6 py-3 hover:bg-indigo-50/50 transition-colors duration-200"
                              >
                                <span className="mr-3 text-lg">
                                  {service.icon}
                                </span>
                                <span className="font-medium">
                                  {service.text}
                                </span>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  key={link.to}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={link.to}
                    className={`px-4 py-2 rounded-xl hover:bg-indigo-50/80 hover:text-indigo-600 flex items-center font-medium transition-all duration-300 ${
                      location.pathname === link.to
                        ? "bg-indigo-100/80 text-indigo-700"
                        : ""
                    }`}
                  >
                    {link.icon} <span className="ml-2">{link.text}</span>
                  </Link>
                </motion.div>
              )
            )}

            {/* ✅ Show login prompt for Contact if not authenticated */}
            {!isAuthenticated && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <div
                  onClick={handleContactClick}
                  className="px-4 py-2 rounded-xl hover:bg-red-50/80 hover:text-red-600 flex items-center font-medium transition-all duration-300 cursor-pointer opacity-75 hover:opacity-100"
                >
                  <FaComments />
                  <span className="ml-2">Contact</span>
                  <FaLock className="ml-2 w-3 h-3" />
                </div>
                
                {/* ✅ Tooltip for non-authenticated users */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  Login required to contact us
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Side (Desktop) */}
          <div className="flex items-center space-x-4">
            {counselor && !counselorLoading && (
              <DesktopUserDropdown
                user={counselor}
                initial="C"
                profileLink="/counselor/profile"
                dashboardLink="/counselor/dashboard"
                logout={logoutCounselor}
              />
            )}
            {client && !clientLoading && (
              <DesktopUserDropdown
                user={client}
                initial="U"
                profileLink="/client/profile"
                dashboardLink="/client/dashboard"
                logout={logoutClient}
              />
            )}
            {!counselor && !client && (
              <div className="hidden lg:flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/counselor/login"
                    className="flex items-center px-4 py-2 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-all duration-300 font-medium"
                  >
                    <FaUserTie className="mr-2" /> Counselor
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/login"
                    className="flex items-center px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg"
                  >
                    <FaUser className="mr-2" /> Get Started
                  </Link>
                </motion.div>
              </div>
            )}

            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg hover:bg-white/90 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isOpen ? (
                  <FaTimes className="text-gray-700" />
                ) : (
                  <FaBars className="text-gray-700" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden mt-4 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-white/50 overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link, index) =>
                  link.isDropdown ? (
                    <div key={link.text} className="px-4">
                      <motion.button
                        onClick={() =>
                          setIsServicesDropdownOpen(!isServicesDropdownOpen)
                        }
                        className="w-full px-4 py-3 flex justify-between items-center rounded-xl hover:bg-indigo-50/50 transition-colors duration-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <span className="font-medium">{link.text}</span>
                        <motion.div
                          animate={{ rotate: isServicesDropdownOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FaChevronDown />
                        </motion.div>
                      </motion.button>
                      <AnimatePresence>
                        {isServicesDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 pl-4 space-y-1"
                          >
                            {servicesLinks.map((service) => (
                              <Link
                                key={service.text}
                                to={service.to}
                                className="flex items-center px-4 py-2 rounded-lg hover:bg-indigo-50/50 transition-colors duration-200"
                              >
                                <span className="mr-2">{service.icon}</span>
                                <span className="text-sm">{service.text}</span>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="px-4"
                    >
                      <Link
                        to={link.to}
                        className="flex items-center px-4 py-3 rounded-xl hover:bg-indigo-50/50 transition-colors duration-200 font-medium"
                      >
                        {link.icon} <span className="ml-3">{link.text}</span>
                      </Link>
                    </motion.div>
                  )
                )}

                {/* ✅ Mobile Contact for non-authenticated users */}
                {!isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: navLinks.length * 0.05 }}
                    className="px-4"
                  >
                    <div
                      onClick={handleContactClick}
                      className="flex items-center px-4 py-3 rounded-xl hover:bg-red-50/50 transition-colors duration-200 font-medium cursor-pointer opacity-75"
                    >
                      <FaComments />
                      <span className="ml-3">Contact</span>
                      <div className="ml-auto px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                        🔒 Login Required
                      </div>
                    </div>
                  </motion.div>
                )}

                {counselor && !counselorLoading && (
                  <MobileUserDropdown
                    user={counselor}
                    profileLink="/counselor/profile"
                    dashboardLink="/counselor/dashboard"
                    logout={logoutCounselor}
                  />
                )}
                {client && !clientLoading && (
                  <MobileUserDropdown
                    user={client}
                    profileLink="/client/profile"
                    dashboardLink="/client/dashboard"
                    logout={logoutClient}
                  />
                )}
                {!counselor && !client && (
                  <div className="px-4 pt-2 space-y-2">
                    <Link
                      to="/counselor/login"
                      className="block px-4 py-3 rounded-xl bg-indigo-50/50 text-indigo-700 font-medium"
                    >
                      Counselor Login
                    </Link>
                    <Link
                      to="/login"
                      className="block px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium text-center"
                    >
                      Client Login
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
