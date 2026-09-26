import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import {
  Home,
  Info,
  MessageCircle,
  Users,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  UserCircle,
  Briefcase,
  BookOpen,
  Lock,
  Brain,
  Heart,
  Rocket,
  GraduationCap,
  Sparkles,
  LayoutDashboard,
  Calendar,
  Clock,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { showToast } from '@/components/ui/sonner';
import logo from '../../assets/logo.png';
import { useCounselorAuth } from '../../contexts/CounselorAuthContext';
import { useClientAuth } from '../../contexts/ClientAuthContext';

// Animation variants
const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const servicesRef = useRef(null);
  const userDropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const { counselor, counselorLogout, counselorLoading } = useCounselorAuth();
  const { client, clientLogout, clientLoading } = useClientAuth();

  const isAuthenticated = !!(counselor || client);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setMobileServicesOpen(false); // ADD THIS LINE
  }, [location]);


  // useEffect(()=>{},[client])
  

  // Logout handlers
  const handleLogoutCounselor = async () => {
    await counselorLogout();
    showToast.success('Logged out successfully');
    navigate('/');
  };

  const handleLogoutClient = async () => {
    await clientLogout();
    showToast.success('Logged out successfully');
    navigate('/');
  };

  // Protected contact handler
  const handleContactClick = () => {
    if (!isAuthenticated) {
      showToast.error('Please login to access the contact form', {
        description: 'Sign in to connect with our support team',
        duration: 3000,
      });
      navigate('/login');
      return;
    }
    navigate('/contact');
  };

  // Services data
  const servicesLinks = [
    { to: '/services/mental-health', text: 'Mental Health Counseling', icon: Brain },
    { to: '/services/career', text: 'Career Counselling', icon: Briefcase },
    { to: '/services/relationship', text: 'Relationship & Family Therapy', icon: Heart },
    { to: '/services/life-coaching', text: 'Life & Personal Development', icon: Rocket },
    { to: '/services/academic', text: 'Academic Counselling', icon: GraduationCap },
    { to: '/services/health-wellness', text: 'Health and Wellness', icon: Sparkles },
  ];

  // Services Dropdown Menu (Desktop)
  const ServicesDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div
        className="relative"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button
          className="
          flex items-center gap-2 px-4 py-2
          text-neutral-700 dark:text-neutral-300
          hover:bg-primary-50 dark:hover:bg-primary-900/30
          hover:text-primary-700 dark:hover:text-primary-300
          rounded-xl font-medium
          transition-all duration-200
        "
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Users className="h-4 w-4" />
          Services
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-3 w-3" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="
              absolute left-0 top-full mt-2 w-80 z-50
              bg-white/95 dark:bg-neutral-900/95 
              backdrop-blur-xl 
              border border-neutral-200 dark:border-neutral-800
              rounded-2xl shadow-2xl overflow-hidden
            "
            >
              <div className="py-3">
                {servicesLinks.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <motion.button
                      key={service.to}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onClick={() => {
                        navigate(service.to);
                        setIsOpen(false);
                      }}
                      className="
                      w-full flex items-center gap-3 px-6 py-3 
                      hover:bg-primary-50 dark:hover:bg-primary-900/30 
                      transition-colors duration-200 text-left
                    "
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                        <Icon className="h-4 w-4 text-primary-700 dark:text-primary-400" />
                      </div>
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">
                        {service.text}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <motion.nav
        className={`
          fixed top-0 left-0 w-full z-50 
          transition-all duration-500
          ${
            scrolled
              ? 'bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-xl py-3'
              : 'bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm py-4'
          }
        `}
        {...fadeInDown}
      >
        <div className="container-custom">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center group" aria-label="Solvit Home">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={logo}
                  className="h-8 w-8 sm:h-9 sm:w-9 lg:h-11 lg:w-11 scale-[2.2] sm:scale-[2.6] lg:scale-[3.2] ml-2 sm:ml-3 lg:ml-0 object-contain"
                  alt="Solvit"
                />
              </motion.div>
            </Link>
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2" aria-label="Main navigation">
              <ServicesDropdown />

              <Button
                variant="ghost"
                onClick={() => navigate('/about')}
                className="
      flex items-center gap-2 px-4 py-2
      text-neutral-700 dark:text-neutral-300
      hover:bg-primary-50 dark:hover:bg-primary-900/30
      hover:text-primary-700 dark:hover:text-primary-300
      rounded-xl font-medium cursor-pointer
      transition-all duration-200
    "
              >
                <Info className="h-4 w-4" />
                About
              </Button>

              
              {!counselor && (
                <Button
                  variant="ghost"
                  onClick={() => navigate('/browse-counselors')}
                  className="
        flex items-center gap-2 px-4 py-2
        text-neutral-700 dark:text-neutral-300
        hover:bg-primary-50 dark:hover:bg-primary-900/30
        hover:text-primary-700 dark:hover:text-primary-300
        rounded-xl font-medium cursor-pointer
        transition-all duration-200
      "
                >
                  <Users className="h-4 w-4" />
                  Counselors
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={() => navigate('/blogs')}
                className="
      flex items-center gap-2 px-4 py-2
      text-neutral-700 dark:text-neutral-300
      hover:bg-primary-50 dark:hover:bg-primary-900/30
      hover:text-primary-700 dark:hover:text-primary-300
      rounded-xl font-medium cursor-pointer
      transition-all duration-200 
    "
              >
                <BookOpen className="h-4 w-4" />
                Blogs
              </Button>

              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  onClick={() => navigate('/contact')}
                  className="
        flex items-center gap-2 px-4 py-2
        text-neutral-700 dark:text-neutral-300
        hover:bg-primary-50 dark:hover:bg-primary-900/30
        hover:text-primary-700 dark:hover:text-primary-300
        rounded-xl font-medium cursor-pointer
        transition-all duration-200
      "
                >
                  <MessageCircle className="h-4 w-4" />
                  Contact
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={handleContactClick}
                      className="
            flex items-center gap-2 px-4 py-2
            text-neutral-500 dark:text-neutral-500
            hover:bg-red-50 dark:hover:bg-red-900/20
            hover:text-red-600 dark:hover:text-red-400
            rounded-xl font-medium cursor-pointer
            transition-all duration-200 opacity-60
          "
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contact
                      <Lock className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Login required to contact us</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </nav>
            {/* Right Side Actions (Desktop) */}
            <div className="hidden lg:flex items-center gap-3">
              {counselor && !counselorLoading && (
                <button
                  onClick={() => {
                    navigate('/counselor/dashboard');
                  }}
                  className="
                      flex items-center gap-3 px-4 py-2 h-auto
                      bg-white/80 dark:bg-neutral-800/80
                      backdrop-blur-sm border border-primary-200 dark:border-primary-800
                      rounded-full shadow-md
                      hover:bg-white dark:hover:bg-neutral-800
                      hover:shadow-xl hover:scale-105
                      transition-all durationclient
        "
                  aria-label={`${counselor?.fullName} account menu`}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                >
                  <Avatar className="h-10 w-10 ring-2 ring-primary-200 dark:ring-primary-800">
                    <AvatarImage src={counselor?.profilePicture} alt={counselor?.fullName} />
                    <AvatarFallback className="bg-gradient-to-r from-primary-700 to-primary-600 text-white font-semibold">
                      {counselor?.fullName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
                      {counselor?.fullName}
                    </span>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">
                      Open Dashboard
                    </span>
                  </div>
                </button>
              )}

              {client && !clientLoading && (
                <button
                  onClick={() => {
                    navigate('/client/dashboard');
                  }}
                  className="
                      flex items-center gap-3 px-4 py-2 h-auto
                      bg-white/80 dark:bg-neutral-800/80
                      backdrop-blur-sm border border-primary-200 dark:border-primary-800
                      rounded-full shadow-md
                      hover:bg-white dark:hover:bg-neutral-800
                      hover:shadow-xl hover:scale-105
                      transition-all duration-300
        "
                  aria-label={`${client?.fullName} account menu`}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                >
                  <Avatar className="h-10 w-10 ring-2 ring-primary-200 dark:ring-primary-800">
                    <AvatarImage src={client?.profilePicture} alt={client?.fullName} />
                    <AvatarFallback className="bg-gradient-to-r from-primary-700 to-primary-600 text-white font-semibold">
                      {client?.fullName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
                      {client?.fullName}
                    </span>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">
                      Open Dashboard
                    </span>
                  </div>
                </button>
              )}

              {!counselor && !client && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/counselor/login')}
                    className="
                      flex items-center gap-2
                      border-primary-200 dark:border-primary-800
                      text-primary-700 dark:text-primary-300
                      hover:bg-primary-50 dark:hover:bg-primary-900/30
                      rounded-xl font-medium cursor-pointer
                      transition-all duration-300
                    "
                  >
                    <Briefcase className="h-4 w-4" />
                    Counselor Login
                  </Button>

                  <Button
                    onClick={() => navigate('/login')}
                    className="
                    flex items-center gap-2
                    bg-gradient-to-r from-primary-700 to-primary-600
                    hover:from-primary-800 hover:to-primary-700
                    text-white rounded-xl font-medium shadow-lg
                    hover:shadow-xl hover:scale-105 cursor-pointer
                    transition-all duration-300
                  "
                  >
                    <UserCircle className="h-4 w-4" />
                    User Login
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="
                    p-2 rounded-xl
                    bg-white/80 dark:bg-neutral-800/80
                    backdrop-blur-sm border border-primary-200 dark:border-primary-800
                    shadow-md hover:shadow-lg
                    transition-all duration-300
                  "
                  aria-label="Toggle menu"
                >
                  {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="
                  w-[310px] sm:w-[380px]
                  bg-white/95 dark:bg-neutral-900/95
                  backdrop-blur-2xl
                  border-l border-neutral-200/80 dark:border-neutral-800/80
                  flex flex-col
                  p-0
                  shadow-2xl
                "
              >
                {/* Fixed Header */}
                <div className="px-5 pt-5 pb-3.5 border-b border-neutral-200/70 dark:border-neutral-800/70 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={logo} alt="Solvit Logo" className="h-7 w-auto object-contain" />
                    <SheetTitle className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                      Solvit Navigation
                    </SheetTitle>
                  </div>
                </div>

                {/* Scrollable Navigation Body */}
                <ScrollArea className="flex-1 px-3">
                  <div className="py-3.5 flex flex-col gap-4">
                    {/* User Identity Card for Logged-in Users */}
                    {(counselor || client) && (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-blue-500/10 dark:from-primary-950/40 dark:to-neutral-900 border border-primary-200/60 dark:border-primary-800/40 flex items-center gap-3 shadow-xs">
                        <Avatar className="h-11 w-11 ring-2 ring-primary-300/80 dark:ring-primary-700/80 shrink-0">
                          <AvatarImage
                            src={(counselor || client)?.profilePicture}
                            alt={(counselor || client)?.fullName}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-primary-600 to-primary-700 text-white font-semibold text-sm">
                            {(counselor || client)?.fullName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 truncate">
                            {(counselor || client)?.fullName}
                          </p>
                          <span className="inline-block mt-0.5 text-[10.5px] font-semibold px-2 py-0.2 rounded-full bg-primary-600/15 text-primary-700 dark:text-primary-300 border border-primary-500/20">
                            {counselor ? 'Counselor Account' : 'Client Account'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Role-Specific Portal Navigation */}
                    {counselor && (
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-3 pb-1">
                          Counselor Workspace
                        </p>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            navigate('/counselor/dashboard');
                            setIsOpen(false);
                          }}
                          className="w-full justify-start gap-3 px-3.5 py-2.5 h-auto rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/40 text-neutral-800 dark:text-neutral-200 font-medium text-sm transition"
                        >
                          <LayoutDashboard className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />
                          <span>Dashboard & Profile</span>
                        </Button>

                        <Button
                          variant="ghost"
                          onClick={() => {
                            navigate('/counselor/dashboard/my-sessions');
                            setIsOpen(false);
                          }}
                          className="w-full justify-start gap-3 px-3.5 py-2.5 h-auto rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/40 text-neutral-800 dark:text-neutral-200 font-medium text-sm transition"
                        >
                          <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />
                          <span>My Sessions</span>
                        </Button>

                        <Button
                          variant="ghost"
                          onClick={() => {
                            navigate('/counselor/dashboard/slots-manager');
                            setIsOpen(false);
                          }}
                          className="w-full justify-start gap-3 px-3.5 py-2.5 h-auto rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/40 text-neutral-800 dark:text-neutral-200 font-medium text-sm transition"
                        >
                          <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />
                          <span>Availability & Slots</span>
                        </Button>

                        <Button
                          variant="ghost"
                          onClick={() => {
                            navigate('/counselor/dashboard/blogs-manager');
                            setIsOpen(false);
                          }}
                          className="w-full justify-start gap-3 px-3.5 py-2.5 h-auto rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/40 text-neutral-800 dark:text-neutral-200 font-medium text-sm transition"
                        >
                          <BookOpen className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />
                          <span>Blogs Manager</span>
                        </Button>
                      </div>
                    )}

                    {client && (
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-3 pb-1">
                          Client Portal
                        </p>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            navigate('/client/dashboard');
                            setIsOpen(false);
                          }}
                          className="w-full justify-start gap-3 px-3.5 py-2.5 h-auto rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/40 text-neutral-800 dark:text-neutral-200 font-medium text-sm transition"
                        >
                          <LayoutDashboard className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />
                          <span>Dashboard & Profile</span>
                        </Button>

                        <Button
                          variant="ghost"
                          onClick={() => {
                            navigate('/client/dashboard/bookings');
                            setIsOpen(false);
                          }}
                          className="w-full justify-start gap-3 px-3.5 py-2.5 h-auto rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/40 text-neutral-800 dark:text-neutral-200 font-medium text-sm transition"
                        >
                          <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />
                          <span>My Bookings</span>
                        </Button>

                        <Button
                          variant="ghost"
                          onClick={() => {
                            navigate('/browse-counselors');
                            setIsOpen(false);
                          }}
                          className="w-full justify-start gap-3 px-3.5 py-2.5 h-auto rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/40 text-neutral-800 dark:text-neutral-200 font-medium text-sm transition"
                        >
                          <Users className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />
                          <span>Find Counselors</span>
                        </Button>
                      </div>
                    )}

                    {/* Separator only when user identity/workspace is shown */}
                    {(counselor || client) && (
                      <Separator className="bg-neutral-200/70 dark:bg-neutral-800/70" />
                    )}

                    {/* Main Explore Navigation */}
                    <div className="space-y-1" aria-label="Mobile exploration links">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-3 pb-1">
                        Explore
                      </p>

                      <Button
                        variant="ghost"
                        onClick={() => {
                          navigate('/');
                          setIsOpen(false);
                        }}
                        className="w-full justify-start gap-3 px-3.5 py-2.5 h-auto rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/40 text-neutral-800 dark:text-neutral-200 font-medium text-sm transition cursor-pointer"
                      >
                        <Home className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />
                        <span>Home</span>
                      </Button>

                      {/* Browse Counselors for Guests */}
                      {!counselor && !client && (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            navigate('/browse-counselors');
                            setIsOpen(false);
                          }}
                          className="w-full justify-start gap-3 px-3.5 py-2.5 h-auto rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/40 text-neutral-800 dark:text-neutral-200 font-medium text-sm transition cursor-pointer"
                        >
                          <Users className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />
                          <span>Browse Counselors</span>
                        </Button>
                      )}

                      {/* Services Collapsible Accordion */}
                      <div>
                        <button
                          onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                          className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/40 text-neutral-800 dark:text-neutral-200 font-medium text-sm transition"
                          aria-expanded={mobileServicesOpen}
                        >
                          <div className="flex items-center gap-3">
                            <Sparkles className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />
                            <span>Specialized Services</span>
                          </div>
                          <motion.div
                            animate={{ rotate: mobileServicesOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-4 w-4 text-neutral-500" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {mobileServicesOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="mt-1 ml-4 pl-2.5 border-l-2 border-primary-200 dark:border-primary-800 space-y-1 overflow-hidden"
                            >
                              {servicesLinks.map((service, index) => {
                                const Icon = service.icon;
                                return (
                                  <motion.button
                                    key={service.to}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.15, delay: index * 0.03 }}
                                    onClick={() => {
                                      navigate(service.to);
                                      setIsOpen(false);
                                      setMobileServicesOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-primary-100/50 dark:hover:bg-primary-900/30 text-left transition"
                                  >
                                    <Icon className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400 shrink-0" />
                                    <span className="font-normal text-xs text-neutral-700 dark:text-neutral-300">
                                      {service.text}
                                    </span>
                                  </motion.button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* About Link */}
                      <Button
                        variant="ghost"
                        onClick={() => {
                          navigate('/about');
                          setIsOpen(false);
                        }}
                        className="w-full justify-start gap-3 px-3.5 py-2.5 h-auto rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/40 text-neutral-800 dark:text-neutral-200 font-medium text-sm transition cursor-pointer"
                      >
                        <Info className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />
                        <span>About Solvit</span>
                      </Button>

                      {/* Blogs Link */}
                      <Button
                        variant="ghost"
                        onClick={() => {
                          navigate('/blogs');
                          setIsOpen(false);
                        }}
                        className="w-full justify-start gap-3 px-3.5 py-2.5 h-auto rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/40 text-neutral-800 dark:text-neutral-200 font-medium text-sm transition cursor-pointer"
                      >
                        <BookOpen className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />
                        <span>Articles & Blogs</span>
                      </Button>

                      {/* Contact Link */}
                      {isAuthenticated ? (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            navigate('/contact');
                            setIsOpen(false);
                          }}
                          className="w-full justify-start gap-3 px-3.5 py-2.5 h-auto rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/40 text-neutral-800 dark:text-neutral-200 font-medium text-sm transition cursor-pointer"
                        >
                          <MessageCircle className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" />
                          <span>Support & Contact</span>
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          onClick={handleContactClick}
                          className="w-full justify-start gap-3 px-3.5 py-2.5 h-auto rounded-xl opacity-75 hover:opacity-100 transition cursor-pointer"
                        >
                          <MessageCircle className="h-4 w-4 text-neutral-500 shrink-0" />
                          <span className="text-neutral-700 dark:text-neutral-300">Support & Contact</span>
                          <Lock className="h-3.5 w-3.5 ml-auto text-amber-500" />
                        </Button>
                      )}
                    </div>

                    {/* Authenticated Logout */}
                    {(counselor || client) && (
                      <>
                        <Separator className="bg-neutral-200/70 dark:bg-neutral-800/70" />
                        <div className="pt-1 pb-2">
                          <Button
                            variant="ghost"
                            onClick={counselor ? handleLogoutCounselor : handleLogoutClient}
                            className="w-full justify-start gap-3 px-3.5 py-2.5 h-auto rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold text-sm transition cursor-pointer"
                          >
                            <LogOut className="h-4 w-4 shrink-0" />
                            <span>Sign Out</span>
                          </Button>
                        </div>
                      </>
                    )}

                    {/* Guest Call to Action */}
                    {!counselor && !client && (
                      <>
                        <Separator className="bg-neutral-200/70 dark:bg-neutral-800/70" />
                        <div className="space-y-2.5 pt-1 pb-3">
                          <Button
                            onClick={() => {
                              navigate('/login');
                              setIsOpen(false);
                            }}
                            className="w-full justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white font-semibold text-sm shadow-md transition cursor-pointer"
                          >
                            <UserCircle className="h-4 w-4" />
                            <span>Sign In</span>
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => {
                              navigate('/counselor/login');
                              setIsOpen(false);
                            }}
                            className="w-full justify-center gap-2 py-2.5 rounded-xl border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 font-medium text-xs transition cursor-pointer"
                          >
                            <Briefcase className="h-4 w-4" />
                            <span>Counselor Portal</span>
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.nav>
    </TooltipProvider>
  );
};

export default Navbar;
