// File: src/components/Navbar.jsx
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FaBars,
  FaChevronDown,
  FaChevronUp,
  FaComments,
  FaHome,
  FaInfoCircle,
  FaSearch,
  FaSignOutAlt,
  FaTimes,
  FaUser,
  FaUserFriends,
  FaUserTie,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/react.svg"; // Updated logo path
import { useCounselorAuth } from "../../contexts/CounselorAuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { counselor, logout, loading } = useCounselorAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userDropdownRef = useRef(null);
  const servicesDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setIsUserDropdownOpen(false);
    setIsServicesDropdownOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  // Navigation links
  const navLinks = [
    { to: "/", text: "Home", icon: <FaHome className="text-lg" /> },
    {
      to: "#",
      text: "Services",
      icon: <FaUserFriends className="text-lg" />,
      isDropdown: true,
    },
    { to: "/about", text: "About", icon: <FaInfoCircle className="text-lg" /> },
    {
      to: "/our-counselors",
      text: "Counselors",
      icon: <FaUserFriends className="text-lg" />,
    },
    {
      to: "/contact",
      text: "Contact",
      icon: <FaComments className="text-lg" />,
    },
  ];

  const servicesLinks = [
    { to: "/services/mental-health", text: "Mental Health Counseling" },
    { to: "/services/career", text: "Career Counselling" },
    { to: "/services/relationship", text: "Relationship Counselling" },
    { to: "/services/life-coaching", text: "Life Coaching" },
    { to: "/services/financial", text: "Financial Counselling" },
    { to: "/services/academic", text: "Academic Counselling" },
    {
      to: "/services/health-wellness",
      text: "Health and Wellness Counselling",
    },
  ];

  // Dashboard and profile links for counselors
  const dashboardLink = "/counselor/dashboard";
  const profileLink = "/counselor/profile";
  const applicationLink = "/counselor/application";

  return (
    <motion.nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-lg py-2"
          : "bg-white/90 backdrop-blur-sm py-3"
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-1">
              <img src={logo} className="h-16 w-16" alt="Solvit Logo" />
              <motion.span className="text-2xl font-bold text-gray-800">
                <span className="text-indigo-600">Solvit</span>
              </motion.span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <div key={link.to} className="relative group">
                {link.isDropdown ? (
                  <div className="relative" ref={servicesDropdownRef}>
                    <button
                      onClick={() =>
                        setIsServicesDropdownOpen(!isServicesDropdownOpen)
                      }
                      className={`px-4 py-2.5 rounded-md font-medium flex items-center transition-all ${
                        isServicesDropdownOpen
                          ? "text-indigo-600 bg-indigo-50"
                          : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                      }`}
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.text}
                      {isServicesDropdownOpen ? (
                        <FaChevronUp className="ml-2 text-gray-500 text-xs" />
                      ) : (
                        <FaChevronDown className="ml-2 text-gray-500 text-xs" />
                      )}
                    </button>
                    <AnimatePresence>
                      {isServicesDropdownOpen && (
                        <motion.div
                          className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {servicesLinks.map((service) => (
                            <Link
                              key={service.text}
                              to={service.to}
                              className="block px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                              onClick={() => setIsServicesDropdownOpen(false)}
                            >
                              {service.text}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    to={link.to}
                    className={`px-4 py-2.5 rounded-md font-medium flex items-center transition-all ${
                      location.pathname === link.to
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                    }`}
                  >
                    <span className="mr-2">{link.icon}</span>
                    {link.text}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {counselor && !loading ? (
              <>
                <div className="relative hidden lg:block" ref={userDropdownRef}>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-semibold">
                      {counselor?.fullName?.charAt(0) || "C"}
                    </div>
                    <span className="font-medium text-gray-700">
                      {counselor?.fullName || "Counselor"}
                    </span>
                    {isUserDropdownOpen ? (
                      <FaChevronUp className="text-gray-500 text-xs" />
                    ) : (
                      <FaChevronDown className="text-gray-500 text-xs" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-700">
                            {counselor?.fullName || "Counselor"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {counselor?.email || "counselor@example.com"}
                          </p>
                        </div>
                        <Link
                          to={profileLink}
                          className="px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center"
                        >
                          <FaUser className="mr-3 text-gray-500" /> Profile
                        </Link>
                        <Link
                          to={dashboardLink}
                          className="px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center"
                        >
                          <FaHome className="mr-3 text-gray-500" /> Dashboard
                        </Link>
                        <Link
                          to={applicationLink}
                          className="px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center"
                        >
                          <FaUserTie className="mr-3 text-gray-500" />{" "}
                          Application
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center border-t border-gray-100"
                        >
                          <FaSignOutAlt className="mr-3 text-gray-500" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/counselor/login"
                  className="hidden lg:flex items-center px-4 py-2 rounded-md font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <FaUserTie className="mr-2" /> Counselor Login
                </Link>
                <Link
                  to="/login"
                  className="hidden lg:flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-md font-medium hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
                >
                  <FaUser className="mr-2" /> Client Login
                </Link>
              </>
            )}

            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
              aria-label="Search"
            >
              <FaSearch className="w-5 h-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-indigo-600 transition-colors"
              aria-label="Menu"
            >
              {isOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              className="mt-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search counselors, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-3 pl-10 pr-4 border border-gray-200 bg-gray-50 text-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:bg-white"
                  autoFocus
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-600 font-medium"
                >
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="lg:hidden bg-white shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <React.Fragment key={link.to}>
                    {link.isDropdown ? (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setIsServicesDropdownOpen(!isServicesDropdownOpen)
                          }
                          className={`px-4 py-3 rounded-md font-medium flex items-center w-full text-left ${
                            isServicesDropdownOpen
                              ? "bg-indigo-50 text-indigo-600"
                              : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                          }`}
                        >
                          <span className="mr-3">{link.icon}</span>
                          {link.text}
                          {isServicesDropdownOpen ? (
                            <FaChevronUp className="ml-auto text-gray-500 text-xs" />
                          ) : (
                            <FaChevronDown className="ml-auto text-gray-500 text-xs" />
                          )}
                        </button>
                        <AnimatePresence>
                          {isServicesDropdownOpen && (
                            <motion.div
                              className="pl-8 flex flex-col bg-indigo-50 rounded-md mt-1"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {servicesLinks.map((service) => (
                                <Link
                                  key={service.text}
                                  to={service.to}
                                  className="px-4 py-2 text-gray-700 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                                  onClick={() => {
                                    setIsServicesDropdownOpen(false);
                                    setIsOpen(false);
                                  }}
                                >
                                  {service.text}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        to={link.to}
                        className={`px-4 py-3 rounded-md font-medium flex items-center ${
                          location.pathname === link.to
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="mr-3">{link.icon}</span>
                        {link.text}
                      </Link>
                    )}
                  </React.Fragment>
                ))}
                {counselor && !loading ? (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    <Link
                      to={profileLink}
                      className="px-4 py-3 rounded-md font-medium flex items-center text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <FaUser className="mr-3 text-gray-500" /> Profile
                    </Link>
                    <Link
                      to={dashboardLink}
                      className="px-4 py-3 rounded-md font-medium flex items-center text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <FaHome className="mr-3 text-gray-500" /> Dashboard
                    </Link>
                    <Link
                      to={applicationLink}
                      className="px-4 py-3 rounded-md font-medium flex items-center text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <FaUserTie className="mr-3 text-gray-500" /> Application
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-3 rounded-md font-medium flex items-center text-gray-700 hover:bg-red-50 hover:text-red-600 text-left"
                    >
                      <FaSignOutAlt className="mr-3 text-gray-500" /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    <Link
                      to="/counselor/login"
                      className="px-4 py-3 rounded-md font-medium flex items-center justify-center bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      onClick={() => setIsOpen(false)}
                    >
                      <FaUserTie className="mr-2" /> Counselor Login
                    </Link>
                    <Link
                      to="/login"
                      className="px-4 py-3 rounded-md font-medium flex items-center justify-center bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-700 hover:to-indigo-600"
                      onClick={() => setIsOpen(false)}
                    >
                      <FaUser className="mr-2" /> Client Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
