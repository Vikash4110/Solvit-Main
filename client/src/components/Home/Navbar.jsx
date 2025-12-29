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
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={logo}
                  className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 scale-[3]  lg:scale-[3.5]  ml-4 lg:ml-0"
                  alt="Solvit"
                />
                {/* <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" /> */}
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

              {client && (
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

              {/* <Button
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
              </Button> */}

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
                            w-[300px] sm:w-[400px]
                            bg-white/95 dark:bg-neutral-900/95
                            backdrop-blur-xl
                            border-neutral-200 dark:border-neutral-800
                            flex flex-col
                            p-0
                          "
              >
                {/* Fixed Header - Won't Scroll */}
                <div className="px-6 pt-6 pb-4 border-b border-neutral-200 dark:border-neutral-800 mx-[40%]">
                  <SheetTitle className="text-primary-800 dark:text-primary-200 text-lg font-semibold">
                    Menu
                  </SheetTitle>
                </div>

                {/* Scrollable Content Area */}
                <ScrollArea className="flex-1 px-2">
                  <div className="py-4 flex flex-col gap-4">
                    {/* Mobile User Info */}
                    {(counselor || client) && (
                      <>
                        <div className="mx-4 flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary-50/50 to-blue-50/50 dark:from-primary-900/20 dark:to-blue-900/20">
                          <Avatar className="h-12 w-12 ring-2 ring-primary-200 dark:ring-primary-800">
                            <AvatarImage
                              src={(counselor || client)?.profilePicture}
                              alt={(counselor || client)?.fullName}
                            />
                            <AvatarFallback className="bg-gradient-to-r from-primary-700 to-primary-600 text-white font-semibold">
                              {(counselor || client)?.fullName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 truncate">
                              {(counselor || client)?.fullName}
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                              {counselor ? 'Counselor' : 'Client'}
                            </p>
                          </div>
                        </div>
                        <Separator className="mx-4" />
                      </>
                    )}
                    {/* User Actions */}
                    {(counselor || client) && (
                      <>
                        <div className="space-y-2 px-4">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              navigate(counselor ? '/counselor/profile' : '/client/profile');
                              setIsOpen(false);
                            }}
                            className="w-full justify-start gap-3 px-4 py-4 h-auto rounded-xl cursor-pointer"
                          >
                            <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            <span className="font-medium">Profile</span>
                          </Button>

                          <Button
                            variant="ghost"
                            onClick={() => {
                              navigate(counselor ? '/counselor/dashboard' : '/client/dashboard');
                              setIsOpen(false);
                            }}
                            className="w-full justify-start gap-3 px-4 py-4 h-auto rounded-xl cursor-pointer"
                          >
                            <Home className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            <span className="font-medium">Dashboard</span>
                          </Button>

                          <Button
                            variant="ghost"
                            onClick={counselor ? handleLogoutCounselor : handleLogoutClient}
                            className="w-full justify-start gap-3 px-4 py-4 h-auto rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                          >
                            <LogOut className="h-5 w-5" />
                            <span className="font-medium">Logout</span>
                          </Button>
                        </div>
                        <Separator className="mx-4" />
                      </>
                    )}

                    {/* Mobile Navigation Links */}
                    <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
                      {/* Services Dropdown */}
                      <div className="px-4">
                        <button
                          onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                          className="
              w-full flex items-center justify-between gap-3 px-4 py-4
              rounded-xl
              hover:bg-primary-50 dark:hover:bg-primary-900/30
              transition-colors duration-200
            "
                          aria-expanded={mobileServicesOpen}
                        >
                          <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            <span className="font-medium text-neutral-800 dark:text-neutral-200">
                              Services
                            </span>
                          </div>
                          <motion.div
                            animate={{ rotate: mobileServicesOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {mobileServicesOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-2 space-y-1 overflow-hidden"
                            >
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
                                      setMobileServicesOpen(false);
                                    }}
                                    className="
                        w-full flex items-center gap-3 px-6 py-3 
                        rounded-xl
                        hover:bg-primary-50 dark:hover:bg-primary-900/30 
                        transition-colors duration-200 text-left
                      "
                                  >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                                      <Icon className="h-4 w-4 text-primary-700 dark:text-primary-400" />
                                    </div>
                                    <span className="font-medium text-sm text-neutral-800 dark:text-neutral-200">
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
                      <div className="px-4">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            navigate('/about');
                            setIsOpen(false);
                          }}
                          className="w-full justify-start gap-3 px-4 py-4 h-auto rounded-xl cursor-pointer"
                        >
                          <Info className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          <span className="font-medium">About</span>
                        </Button>
                      </div>

                      {/* Counselors Link */}
                      {client && (
                        <div className="px-4">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              navigate('/browse-counselors');
                              setIsOpen(false);
                            }}
                            className="w-full justify-start gap-3 px-4 py-4 h-auto rounded-xl cursor-pointer"
                          >
                            <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            <span className="font-medium">Counselors</span>
                          </Button>
                        </div>
                      )}

                      {/* Blogs Link */}
                      <div className="px-4">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            navigate('/blogs');
                            setIsOpen(false);
                          }}
                          className="w-full justify-start gap-3 px-4 py-4 h-auto rounded-xl cursor-pointer"
                        >
                          <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          <span className="font-medium">Blogs</span>
                        </Button>
                      </div>

                      {/* Contact Link */}
                      <div className="px-4">
                        {isAuthenticated ? (
                          <Button
                            variant="ghost"
                            onClick={() => {
                              navigate('/contact');
                              setIsOpen(false);
                            }}
                            className="w-full justify-start gap-3 px-4 py-4 h-auto rounded-xl cursor-pointer"
                          >
                            <MessageCircle className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            <span className="font-medium">Contact</span>
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            onClick={handleContactClick}
                            className="w-full justify-start gap-3 px-4 py-4 h-auto rounded-xl opacity-60 cursor-pointer"
                          >
                            <MessageCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            <span className="font-medium">Contact</span>
                            <Lock className="h-4 w-4 ml-auto text-red-600 dark:text-red-400" />
                          </Button>
                        )}
                      </div>
                    </nav>

                    {/* Login Buttons */}
                    {!counselor && !client && (
                      <>
                        <Separator className="mx-4" />
                        <div className="space-y-3 px-4 pb-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              navigate('/counselor/login');
                              setIsOpen(false);
                            }}
                            className="w-full justify-center gap-2 py-6 rounded-xl border-primary-200 dark:border-primary-800 cursor-pointer"
                          >
                            <Briefcase className="h-4 w-4" />
                            Counselor Login
                          </Button>

                          <Button
                            onClick={() => {
                              navigate('/login');
                              setIsOpen(false);
                            }}
                            className="w-full justify-center gap-2 py-6 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 cursor-pointer"
                          >
                            <UserCircle className="h-4 w-4" />
                            User Login
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
