import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Calendar as CalendarIcon,
  Star,
  User,
  Languages,
  CheckCircle,
  Award,
  Shield,
  Clock,
  Filter,
  X,
  Loader2,
  ChevronRight,
  DollarSign,
  TrendingUp,
  Sparkles,
  SlidersHorizontal,
  UserCircle,
  Heart,
  MessageCircle,
  Video,
  Briefcase,
  MapPin,
} from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { TIMEZONE } from '../../constants/constants';
import { toast } from 'sonner';
import HeroImage from '../../assets/browseCounselors/heroImage.png'; // Your uploaded image path

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const BrowseCounselor = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(dayjs().tz(TIMEZONE));
  const todayISO = dayjs().tz(TIMEZONE).format('YYYY-MM-DD');

  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  // Filters with controlled states
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('all');
  const [gender, setGender] = useState('all');
  const [dateFilter, setDateFilter] = useState(undefined);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [language, setLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [sessionType, setSessionType] = useState('all');

  // Control states to prevent auto-close
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [specSelectOpen, setSpecSelectOpen] = useState(false);
  const [genderSelectOpen, setGenderSelectOpen] = useState(false);
  const [languageSelectOpen, setLanguageSelectOpen] = useState(false);
  const [sortSelectOpen, setSortSelectOpen] = useState(false);

  const SPECIALIZATIONS = [
    'Mental Health',
    'Career Counselling',
    'Relationship Counselling',
    'Life Coaching',
    'Financial Counselling',
    'Academic Counselling',
    'Health and Wellness Counselling',
  ];

  const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Mandarin'];

  useEffect(() => {
    let intervalId;

    const clockInterval = setInterval(() => {
      setCurrentTime(dayjs().tz(TIMEZONE));
    }, 1000);

    const alignAndStart = () => {
      fetchCounselors();
      const temp = dayjs().tz(TIMEZONE).second();
      const delay = (60 - temp) * 1000;

      setTimeout(() => {
        fetchCounselors();
        intervalId = setInterval(fetchCounselors, 60000);
      }, delay);
    };

    alignAndStart();

    return () => {
      clearInterval(clockInterval);
      clearInterval(intervalId);
    };
  }, []);

  const fetchCounselors = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BOOKING_AVAILABLE_COUNSELORS}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('clientAccessToken')}` },
        credentials: 'include',
      });
      const j = await r.json();
      setCounselors(j.counselors || []);
    } catch (e) {
      toast.error('Failed to load counselors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const bookCounselor = (counselorId) => {
    navigate(`/book-counselor/${counselorId}`);
  };

  const clearFilters = () => {
    setSearch('');
    setSpec('all');
    setGender('all');
    setDateFilter(undefined);
    setPriceRange([0, 10000]);
    setLanguage('all');
    setSortBy('rating');
    setSessionType('all');
  };

  const visible = counselors
    .filter((c) => {
      const bySearch =
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.specialization.toLowerCase().includes(search.toLowerCase());

      const bySpec = spec === 'all' || c.specialization === spec;
      const byGender = gender === 'all' || c.gender === gender;
      const byPrice = !c.basePrice || (c.basePrice >= priceRange[0] && c.basePrice <= priceRange[1]);
      const byLanguage = language === 'all' || c.application?.languages?.includes(language);

      if (!bySearch || !bySpec || !byGender || !byPrice || !byLanguage) return false;

      if (dateFilter) {
        return c.availableSlots?.some((s) => {
          const slotDate = dayjs(s.startTime).tz(TIMEZONE);
          const filterDate = dayjs(dateFilter).tz(TIMEZONE);
          return (
            s.status === 'available' &&
            !s.isBooked &&
            slotDate.format('YYYY-MM-DD') === filterDate.format('YYYY-MM-DD')
          );
        });
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'experience') return (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0);
      if (sortBy === 'price') return (a.basePrice || 0) - (b.basePrice || 0);
      return 0;
    });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = visible.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(visible.length / itemsPerPage);

  // Featured counselors
  const featuredCounselors = [...counselors]
    .filter((c) => c.rating && c.rating > 4.5)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3);

  const FilterSection = () => (
    <div className="space-y-6 pr-2">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Search
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-600 dark:text-primary-400 w-4 h-4 pointer-events-none" />
          <Input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Name or specialty..."
            className="pl-10 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      </div>

      <Separator className="bg-neutral-200 dark:bg-neutral-800" />

      {/* Specialization */}
      <div className="space-y-2">
        <Label htmlFor="specialization" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Specialization
        </Label>
        <Select value={spec} onValueChange={setSpec} open={specSelectOpen} onOpenChange={setSpecSelectOpen}>
          <SelectTrigger 
            id="specialization" 
            className="bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-primary-500"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
            <SelectItem value="all">All Specializations</SelectItem>
            {SPECIALIZATIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gender - Radio Group */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Gender</Label>
        <RadioGroup value={gender} onValueChange={setGender}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="gender-all" className="border-primary-600 text-primary-600 focus:ring-primary-500" />
            <Label htmlFor="gender-all" className="text-sm font-normal cursor-pointer text-neutral-700 dark:text-neutral-300">
              All Genders
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Male" id="gender-male" className="border-primary-600 text-primary-600 focus:ring-primary-500" />
            <Label htmlFor="gender-male" className="text-sm font-normal cursor-pointer text-neutral-700 dark:text-neutral-300">
              Male
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Female" id="gender-female" className="border-primary-600 text-primary-600 focus:ring-primary-500" />
            <Label htmlFor="gender-female" className="text-sm font-normal cursor-pointer text-neutral-700 dark:text-neutral-300">
              Female
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Non-binary" id="gender-nonbinary" className="border-primary-600 text-primary-600 focus:ring-primary-500" />
            <Label htmlFor="gender-nonbinary" className="text-sm font-normal cursor-pointer text-neutral-700 dark:text-neutral-300">
              Non-binary
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Separator className="bg-neutral-200 dark:bg-neutral-800" />

      {/* Language */}
      <div className="space-y-2">
        <Label htmlFor="language" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Language
        </Label>
        <Select value={language} onValueChange={setLanguage} open={languageSelectOpen} onOpenChange={setLanguageSelectOpen}>
          <SelectTrigger 
            id="language" 
            className="bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-primary-500"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
            <SelectItem value="all">All Languages</SelectItem>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-neutral-200 dark:bg-neutral-800" />

      {/* Price Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Price Range</Label>
          <span className="text-sm text-primary-600 dark:text-primary-400 font-semibold">
            ₹{priceRange[0]} - ₹{priceRange[1]}
          </span>
        </div>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={10000}
          step={100}
          className="w-full"
        />
      </div>

      <Separator className="bg-neutral-200 dark:bg-neutral-800" />

      {/* Date Picker */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Available Date</Label>
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-500"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-primary-600" />
              {dateFilter ? dayjs(dateFilter).format('MMM D, YYYY') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800" align="start">
            <Calendar
              mode="single"
              selected={dateFilter}
              onSelect={(date) => {
                setDateFilter(date);
                setDatePickerOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Separator className="bg-neutral-200 dark:bg-neutral-800" />

      {/* Session Type - Radio Group */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Session Type</Label>
        <RadioGroup value={sessionType} onValueChange={setSessionType}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="session-all" className="border-primary-600 text-primary-600 focus:ring-primary-500" />
            <Label htmlFor="session-all" className="text-sm font-normal cursor-pointer text-neutral-700 dark:text-neutral-300">
              All Types
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="online" id="session-online" className="border-primary-600 text-primary-600 focus:ring-primary-500" />
            <Label htmlFor="session-online" className="text-sm font-normal cursor-pointer flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
              <Video className="w-4 h-4 text-primary-600" />
              Online
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="offline" id="session-offline" className="border-primary-600 text-primary-600 focus:ring-primary-500" />
            <Label htmlFor="session-offline" className="text-sm font-normal cursor-pointer flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
              <MapPin className="w-4 h-4 text-primary-600" />
              In-Person
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Button 
        onClick={clearFilters} 
        variant="outline" 
        className="w-full border-neutral-300 dark:border-neutral-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-500"
      >
        <X className="w-4 h-4 mr-2" />
        Clear All Filters
      </Button>
    </div>
  );

  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 dark:from-primary-900 dark:via-primary-800 dark:to-primary-700">
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="max-w-4xl mx-auto p-4">
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
            <CardContent className="py-12 flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-white" />
              <h3 className="text-xl font-semibold text-white">
                Loading Counselors
              </h3>
              <p className="text-white/80">
                Getting you connected with caring professionals...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Hero Section with Background Image - Matching HeroSection theme */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative min-h-0 lg:min-h-[60vh] flex items-center overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 dark:from-primary-900 dark:via-primary-800 dark:to-primary-700"
        style={{
          backgroundImage: `url(${HeroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay - Matching HeroSection */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-700/95 via-primary-600/85 to-primary-500/90 dark:from-primary-900/95 dark:via-primary-800/85 dark:to-primary-700/90" />
        
        {/* Decorative Elements - Matching OurServices */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-12 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-24 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '500ms' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 md:px-10 lg:px-12 py-16 lg:py-20">
          <motion.div className="max-w-3xl mx-auto lg:mx-0" variants={staggerContainer} initial="initial" animate="animate">
            
            {/* Badge */}
            <motion.div variants={fadeInUp} className="flex justify-center lg:justify-start mb-6">
              <Badge variant="outline" className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-white/10 backdrop-blur-md text-white border-white/20 rounded-full shadow-lg hover:bg-white/20 transition-all">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Over 500 Certified Counselors</span>
              </Badge>
            </motion.div>

            {/* Heading */}
            <motion.h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-lg text-center lg:text-left mb-6" variants={fadeInUp}>
              Find Your Perfect Counselor
            </motion.h1>

            {/* Description */}
            <motion.p className="text-base sm:text-lg text-white/95 leading-relaxed max-w-2xl mx-auto lg:mx-0 drop-shadow-md text-center lg:text-left mb-8" variants={fadeInUp}>
              Browse verified professionals who specialize in anxiety, relationships, career, and more. Your journey to wellness starts here.
            </motion.p>

            {/* Buttons */}
            <motion.div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6" variants={fadeInUp}>
              <Button 
                size="lg" 
                onClick={() => document.getElementById('counselors-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="group gap-2 py-6 px-8 rounded-xl bg-white text-primary-900 hover:bg-primary-50 shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105"
              >
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Start Exploring
              </Button>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/login')}
                className="group gap-2 py-6 px-8 rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/30 hover:border-white/50 shadow-xl transition-all duration-300 hover:scale-105"
              >
                <UserCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Get Started
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div className="flex flex-wrap gap-2.5 justify-center lg:justify-start" variants={fadeInUp}>
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-xs bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 transition-all">
                <Shield className="w-3 h-3" />
                <span className="font-medium">Verified Professionals</span>
              </Badge>
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-xs bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 transition-all">
                <Clock className="w-3 h-3" />
                <span className="font-medium">24/7 Available</span>
              </Badge>
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-xs bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 transition-all">
                <Heart className="w-3 h-3" />
                <span className="font-medium">Confidential & Secure</span>
              </Badge>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content - Matching background */}
      <main className="relative pt-16 pb-20">
        {/* Background decorative elements - Matching OurServices */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-12 w-72 h-72 bg-primary-400/10 dark:bg-primary-600/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-24 right-10 w-96 h-96 bg-secondary-400/10 dark:bg-secondary-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '500ms' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="counselors-section">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-4 space-y-6">
                <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-primary-800 dark:text-primary-200">
                      <SlidersHorizontal className="w-5 h-5 text-primary-600" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4">
                    <ScrollArea className="h-[calc(100vh-200px)]">
                      <FilterSection />
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Top Rated Sidebar */}
                {featuredCounselors.length > 0 && (
                  <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-base text-primary-800 dark:text-primary-200">
                        <TrendingUp className="w-5 h-5 text-amber-600" />
                        Top Rated This Month
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {featuredCounselors.map((c) => (
                        <div
                          key={c._id}
                          className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 border border-transparent hover:border-primary-200 dark:hover:border-primary-800"
                          onClick={() => bookCounselor(c._id)}
                        >
                          <Avatar className="w-12 h-12 border-2 border-primary-200 dark:border-primary-800">
                            <AvatarImage src={c.profilePicture} />
                            <AvatarFallback className="bg-primary-100 dark:bg-primary-900/30">
                              <User className="w-6 h-6 text-primary-600" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                              {c.fullName}
                            </p>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                                {c.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-neutral-400" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 space-y-8">
              {/* Featured Counselors Carousel - Matching OurServices style */}
              {featuredCounselors.length > 0 && (
                <motion.section variants={fadeInUp} initial="initial" animate="animate">
                  <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500">
                    <CardHeader className="pb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center shadow-lg">
                          <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold">
                            <span className="text-neutral-900 dark:text-white">Featured </span>
                            <span className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 dark:from-primary-400 dark:via-primary-300 dark:to-secondary-400 bg-clip-text text-transparent">
                              Counselors
                            </span>
                          </CardTitle>
                          <CardDescription className="text-neutral-600 dark:text-neutral-400">
                            Highly rated professionals this month
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {featuredCounselors.map((c, index) => (
                          <motion.div
                            key={c._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card
                              className="group cursor-pointer hover:shadow-xl transition-all duration-300 bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-600 hover:scale-105"
                              onClick={() => bookCounselor(c._id)}
                            >
                              <CardContent className="p-6 text-center space-y-4">
                                <div className="relative inline-block">
                                  <Avatar className="w-24 h-24 border-4 border-white dark:border-neutral-800 shadow-lg">
                                    <AvatarImage src={c.profilePicture} />
                                    <AvatarFallback className="bg-primary-100 dark:bg-primary-900/30">
                                      <User className="w-12 h-12 text-primary-600" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <Badge className="absolute -top-2 -right-2 gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-lg">
                                    <Award className="w-3 h-3" />
                                    Top
                                  </Badge>
                                </div>
                                <div>
                                  <p className="font-bold text-neutral-900 dark:text-neutral-100">
                                    {c.fullName}
                                  </p>
                                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                    {c.specialization}
                                  </p>
                                </div>
                                <div className="flex items-center justify-center gap-1">
                                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                    {c.rating.toFixed(1)}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.section>
              )}

              {/* Sort & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary-600 rounded-full animate-pulse" />
                  <p className="text-lg font-semibold">
                    <span className="text-neutral-900 dark:text-white">{visible.length} </span>
                    <span className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 dark:from-primary-400 dark:via-primary-300 dark:to-secondary-400 bg-clip-text text-transparent">
                      counselor{visible.length !== 1 ? 's' : ''} available
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  {/* Mobile Filters */}
                  <Sheet>
                    <SheetTrigger asChild className="lg:hidden">
                      <Button variant="outline" size="sm" className="gap-2 border-primary-300 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20">
                        <Filter className="w-4 h-4 text-primary-600" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                      <SheetHeader>
                        <SheetTitle className="text-primary-800 dark:text-primary-200">Filters</SheetTitle>
                        <SheetDescription className="text-neutral-600 dark:text-neutral-400">
                          Refine your search
                        </SheetDescription>
                      </SheetHeader>
                      <ScrollArea className="h-[calc(100vh-120px)] mt-6">
                        <FilterSection />
                      </ScrollArea>
                    </SheetContent>
                  </Sheet>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy} open={sortSelectOpen} onOpenChange={setSortSelectOpen}>
                    <SelectTrigger className="w-full sm:w-44 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:border-primary-500 dark:focus:border-primary-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-neutral-900">
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="experience">Most Experience</SelectItem>
                      <SelectItem value="price">Lowest Price</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Tabs for Session Type */}
                  <Tabs value={sessionType} onValueChange={setSessionType} className="hidden sm:block">
                    <TabsList className="bg-primary-100 dark:bg-primary-900/30">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="online">Online</TabsTrigger>
                      <TabsTrigger value="offline">In-Person</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {/* Counselors Grid or Empty State */}
              {currentItems.length === 0 ? (
                <motion.section variants={fadeInUp} initial="initial" animate="animate">
                  <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg">
                    <CardContent className="py-20 text-center">
                      <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-6">
                        <Users className="w-12 h-12 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                        No counselors found
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                        Try adjusting your filters to see more results
                      </p>
                      <Button 
                        onClick={clearFilters} 
                        className="gap-2 py-6 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white shadow-lg hover:scale-105 transition-all"
                      >
                        <X className="w-4 h-4" />
                        Clear All Filters
                      </Button>
                    </CardContent>
                  </Card>
                </motion.section>
              ) : (
                <>
                  <motion.section
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  >
                    <AnimatePresence>
                      {currentItems.map((c, index) => (
                        <motion.div
                          key={c._id}
                          variants={fadeInUp}
                          initial="initial"
                          animate="animate"
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.05 }}
                          className="h-full"
                        >
                          <Card
                            className="group h-full cursor-pointer bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 hover:scale-[1.02]"
                            onClick={() => bookCounselor(c._id)}
                          >
                            <CardHeader className="space-y-4 pb-4">
                              <div className="relative mx-auto">
                                <Avatar className="w-24 h-24 border-4 border-white dark:border-neutral-800 shadow-lg">
                                  <AvatarImage src={c.profilePicture} alt={c.fullName} />
                                  <AvatarFallback className="bg-primary-100 dark:bg-primary-900/30">
                                    <User className="w-12 h-12 text-primary-600 dark:text-primary-400" />
                                  </AvatarFallback>
                                </Avatar>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shadow-lg">
                                        <CheckCircle className="w-5 h-5 text-white" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Verified Professional</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                                        <Award className="w-5 h-5 text-white" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Experienced Counselor</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>

                              <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                                  {c.fullName}
                                </h3>
                                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                  {c.specialization}
                                </p>
                              </div>

                              <div className="flex items-center justify-center gap-4 text-sm">
                                {c.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                      {c.rating.toFixed(1)}
                                    </span>
                                    <span className="text-neutral-600 dark:text-neutral-400">
                                      ({c.reviewCount || 0})
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1 text-green-600">
                                  <Shield className="w-4 h-4" />
                                  <span className="text-xs">Verified</span>
                                </div>
                                <div className="flex items-center gap-1 text-primary-600">
                                  <CalendarIcon className="w-4 h-4" />
                                  <span className="text-xs">{c.availableSlots?.length || 0}</span>
                                </div>
                              </div>
                            </CardHeader>

                            <Separator className="bg-neutral-200 dark:bg-neutral-800" />

                            <CardContent className="space-y-4 pt-6">
                              <div className="flex flex-wrap justify-center gap-2">
                                <Badge variant="secondary" className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                                  {c.gender}
                                </Badge>
                                {c.application?.languages?.slice(0, 2).map((lang) => (
                                  <Badge
                                    key={lang}
                                    variant="secondary"
                                    className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                  >
                                    <Languages className="w-3 h-3 mr-1" />
                                    {lang}
                                  </Badge>
                                ))}
                                {c.application?.languages?.length > 2 && (
                                  <Badge variant="secondary" className="bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                    +{c.application.languages.length - 2}
                                  </Badge>
                                )}
                              </div>

                              {c.basePrice && (
                                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                                    ₹{c.basePrice}/session
                                  </span>
                                </div>
                              )}

                              {c.application?.professionalSummary && (
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 text-center">
                                  {c.application.professionalSummary}
                                </p>
                              )}

                              {c.availableSlots?.length > 0 && (
                                <div className="flex items-center justify-center gap-2 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg text-xs text-primary-700 dark:text-primary-400">
                                  <Clock className="w-3 h-3" />
                                  Next: {dayjs(c.availableSlots[0].startTime).tz(TIMEZONE).format('MMM D, h:mm A')}
                                </div>
                              )}

                              {c.availableSlots?.some(
                                (s) =>
                                  dayjs(s.startTime).tz(TIMEZONE).format('YYYY-MM-DD') === todayISO &&
                                  s.status === 'available' &&
                                  !s.isBooked
                              ) && (
                                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 rounded-full">
                                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                                  <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                                    Available Today
                                  </span>
                                </div>
                              )}
                            </CardContent>

                            <CardFooter className="pt-0">
                              <Button
                                className="w-full gap-2 py-6 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white shadow-lg hover:scale-105 transition-all"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  bookCounselor(c._id);
                                }}
                              >
                                <CalendarIcon className="w-4 h-4" />
                                Schedule Session
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.section>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <motion.div
                      variants={fadeInUp}
                      initial="initial"
                      animate="animate"
                      className="flex items-center justify-center gap-2"
                    >
                      <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="border-primary-300 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={
                              currentPage === page
                                ? 'bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white'
                                : 'border-primary-300 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                            }
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="border-primary-300 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                      >
                        Next
                      </Button>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Custom Scrollbar Styles - Primary Gradient */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }

        ::-webkit-scrollbar-track {
          background: rgb(245 245 245);
          border-radius: 6px;
        }

        .dark ::-webkit-scrollbar-track {
          background: rgb(23 23 23);
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6366f1, #4f46e5);
          border-radius: 6px;
          border: 2px solid rgb(245 245 245);
        }

        .dark ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #818cf8, #6366f1);
          border: 2px solid rgb(23 23 23);
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #4f46e5, #4338ca);
        }

        .dark ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #a5b4fc, #818cf8);
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: #6366f1 rgb(245 245 245);
        }

        .dark * {
          scrollbar-color: #818cf8 rgb(23 23 23);
        }
      `}</style>
    </div>
  );
};

export default BrowseCounselor;
