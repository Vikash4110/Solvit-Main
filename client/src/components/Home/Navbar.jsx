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
import logo from "../../assets/core/Red Simple.jpeg";
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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target)) {
        setIsServicesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
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

  const navLinks = [
    { to: "/", text: "Home", icon: <FaHome /> },
    { to: "#", text: "Services", icon: <FaUserFriends />, isDropdown: true },
    { to: "/about", text: "About", icon: <FaInfoCircle /> },
    { to: "/browse-counselors", text: "Counselors", icon: <FaUserFriends /> },
    { to: "/contact", text: "Contact", icon: <FaComments /> },
  ];

  const servicesLinks = [
    { to: "/services/mental-health", text: "Mental Health Counseling" },
    { to: "/services/career", text: "Career Counselling" },
    { to: "/services/relationship", text: "Relationship Counselling" },
    { to: "/services/life-coaching", text: "Life Coaching" },
    { to: "/services/academic", text: "Academic Counselling" },
    { to: "/services/health-wellness", text: "Health and Wellness Counselling" },
  ];

  // Desktop User Dropdown
  const DesktopUserDropdown = ({ user, initial, profileLink, dashboardLink, logout }) => (
    <div className="relative hidden lg:block" ref={userDropdownRef}>
      <button
        onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-indigo-50"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-semibold">
          {user?.fullName?.charAt(0) || initial}
        </div>
        <span className="font-medium text-gray-700">{user?.fullName}</span>
        {isUserDropdownOpen ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
      </button>
      <AnimatePresence>
        {isUserDropdownOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border overflow-hidden z-50"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-medium">{user?.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <Link to={profileLink} className="px-4 py-3 flex items-center hover:bg-indigo-50"><FaUser className="mr-3" /> Profile</Link>
            <Link to={dashboardLink} className="px-4 py-3 flex items-center hover:bg-indigo-50"><FaHome className="mr-3" /> Dashboard</Link>
            
            <button onClick={logout} className="w-full px-4 py-3 flex items-center hover:bg-red-50 hover:text-red-600 border-t">
              <FaSignOutAlt className="mr-3" /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Mobile User Menu
  const MobileUserDropdown = ({ user, profileLink, dashboardLink, extraLink, logout }) => (
    <>
      <button
        onClick={() => setMobileUserDropdownOpen(!mobileUserDropdownOpen)}
        className="px-4 py-3 rounded-md font-medium flex items-center justify-between w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
      >
        {user?.fullName}
        {mobileUserDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      <AnimatePresence>
        {mobileUserDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
            className="flex flex-col bg-indigo-50 rounded-md mt-1"
          >
            <Link to={profileLink} className="px-6 py-2 hover:bg-indigo-100"><FaUser className="inline mr-2" /> Profile</Link>
            <Link to={dashboardLink} className="px-6 py-2 hover:bg-indigo-100"><FaHome className="inline mr-2" /> Dashboard</Link>
            {extraLink && (
              <Link to={extraLink.to} className="px-6 py-2 hover:bg-indigo-100">
                {extraLink.icon}<span className="ml-2">{extraLink.text}</span>
              </Link>
            )}
            <button onClick={logout} className="px-6 py-2 text-left hover:bg-red-100 text-red-600">
              <FaSignOutAlt className="inline mr-2" /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <motion.nav
      className={`fixed top-0 left-0 w-full z-50 transition-all ${scrolled ? "bg-white shadow-lg py-2" : "bg-white/90 backdrop-blur-sm py-3"}`}
      initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1">
            <img src={logo} className="h-16 w-16" alt="Solvit Logo" />
            <span className="text-2xl font-bold text-indigo-600">Solvit</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex">
            {navLinks.map((link) =>
              link.isDropdown ? (
                <div key={link.text} className="relative" ref={servicesDropdownRef}>
                  <button
                    onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                    className={`px-4 py-2.5 flex items-center ${isServicesDropdownOpen ? "bg-indigo-50 text-indigo-600" : "hover:bg-indigo-50 hover:text-indigo-600"}`}
                  >
                    {link.icon} <span className="ml-2">{link.text}</span>
                    {isServicesDropdownOpen ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
                  </button>
                  <AnimatePresence>
                    {isServicesDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute mt-2 w-64 bg-white rounded-lg shadow border"
                      >
                        {servicesLinks.map((s) => (
                          <Link key={s.text} to={s.to} onClick={() => setIsServicesDropdownOpen(false)} className="block px-4 py-3 hover:bg-indigo-50">
                            {s.text}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link key={link.to} to={link.to} className="px-4 py-2.5 hover:bg-indigo-50 hover:text-indigo-600 flex items-center">
                  {link.icon} <span className="ml-2">{link.text}</span>
                </Link>
              )
            )}
          </div>

          {/* Right Side (Desktop) */}
          <div className="flex items-center space-x-4">
            {counselor && !counselorLoading && (
              <DesktopUserDropdown
                user={counselor} initial="C"
                profileLink="/counselor/profile"
                dashboardLink="/counselor/dashboard"
                logout={logoutCounselor}
              />
            )}
            {client && !clientLoading && (
              <DesktopUserDropdown
                user={client} initial="U"
                profileLink="/client/profile"
                dashboardLink="/client/dashboard"
                // extraLink={{ to: "/browse-counselors", text: "Browse Counselors", icon: <FaUserFriends /> }}
                logout={logoutClient}
              />
            )}
            {!counselor && !client && (
              <>
                <Link to="/counselor/login" className="hidden lg:flex"><FaUserTie className="mr-2" /> Counselor Login</Link>
                <Link to="/login" className="hidden lg:flex bg-indigo-600 text-white px-4 py-2 rounded-md"><FaUser className="mr-2" /> Client Login</Link>
              </>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden">{isOpen ? <FaTimes /> : <FaBars />}</button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-white shadow-md mt-2 rounded-md">
              <div className="flex flex-col">
                {navLinks.map((link) =>
                  link.isDropdown ? (
                    <div key={link.text}>
                      <button onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)} className="px-4 py-3 w-full flex justify-between">
                        {link.text} {isServicesDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                      {isServicesDropdownOpen && servicesLinks.map((s) => (
                        <Link key={s.text} to={s.to} className="pl-8 py-2 block hover:bg-indigo-50">{s.text}</Link>
                      ))}
                    </div>
                  ) : (
                    <Link key={link.to} to={link.to} className="px-4 py-3 hover:bg-indigo-50">{link.text}</Link>
                  )
                )}
                {counselor && !counselorLoading && (
                  <MobileUserDropdown
                    user={counselor}
                    profileLink="/counselor/profile"
                    dashboardLink="/counselor/dashboard"
                    extraLink={{ to: "/counselor/application", text: "Application", icon: <FaUserTie /> }}
                    logout={logoutCounselor}
                  />
                )}
                {client && !clientLoading && (
                  <MobileUserDropdown
                    user={client}
                    profileLink="/client/profile"
                    dashboardLink="/client/bookings"
                    extraLink={{ to: "/browse-counselors", text: "Browse Counselors", icon: <FaUserFriends /> }}
                    logout={logoutClient}
                  />
                )}
                {!counselor && !client && (
                  <>
                    <Link to="/counselor/login" className="px-4 py-3">Counselor Login</Link>
                    <Link to="/login" className="px-4 py-3">Client Login</Link>
                  </>
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
