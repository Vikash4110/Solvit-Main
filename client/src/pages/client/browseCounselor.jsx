'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Star,
  User,
  Languages,
  CheckCircle,
  Award,
  Shield,
  Clock,
  Filter,
  Loader2,
  ChevronRight,
  TrendingUp,
  Sparkles,
  SlidersHorizontal,
  UserCircle,
  Video,
  MapPin,
  Lock,
  ChevronDown,
  CalendarIcon,
  X,
} from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { TIMEZONE } from '../../constants/constants';
import { toast } from 'sonner';
import HeroImage from '../../assets/browseCounselors/heroImage.png';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { useCounselorAuth } from '../../contexts/CounselorAuthContext';
import Footer from '../../components/Home/Footer';

// Shadcn UI imports
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
};

// ============================================
// MEMOIZED FILTER SECTION COMPONENT WITH PRICE
// ============================================
const FilterSection = React.memo(
  ({
    search,
    setSearch,
    spec,
    setSpec,
    gender,
    setGender,
    language,
    setLanguage,
    priceRange,
    setPriceRange,
    clearFilters,
    SPECIALIZATIONS,
    LANGUAGES,
  }) => {
    const [specOpen, setSpecOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);

    return (
      <div className="space-y-6 pr-2 pb-4">
        {/* Search Input */}
        <div className="space-y-2">
          <Label
            htmlFor="filter-search-input"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-600 dark:text-primary-400 w-4 h-4 pointer-events-none z-10" />
            <Input
              id="filter-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or specialty..."
              className="pl-10"
              autoComplete="off"
            />
          </div>
        </div>

        <Separator />

        {/* Specialization Dropdown */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Specialization
          </Label>
          <DropdownMenu open={specOpen} onOpenChange={setSpecOpen} modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="truncate">{spec === 'all' ? 'All Specializations' : spec}</span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align="start" avoidCollisions>
              <DropdownMenuRadioGroup
                value={spec}
                onValueChange={(value) => {
                  setSpec(value);
                  setSpecOpen(false);
                }}
              >
                <DropdownMenuRadioItem value="all">All Specializations</DropdownMenuRadioItem>
                <DropdownMenuSeparator />
                {SPECIALIZATIONS.map((s) => (
                  <DropdownMenuRadioItem key={s} value={s}>
                    {s}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Gender RadioGroup */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Gender
          </Label>
          <RadioGroup value={gender} onValueChange={setGender}>
            {['all', 'Male', 'Female', 'Other'].map((g) => (
              <div key={g} className="flex items-center space-x-2">
                <RadioGroupItem value={g} id={`filter-gender-${g}`} />
                <Label
                  htmlFor={`filter-gender-${g}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {g === 'all' ? 'All Genders' : g}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        {/* Language Dropdown */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Language
          </Label>
          <DropdownMenu open={langOpen} onOpenChange={setLangOpen} modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="truncate">{language === 'all' ? 'All Languages' : language}</span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align="start" avoidCollisions>
              <DropdownMenuRadioGroup
                value={language}
                onValueChange={(value) => {
                  setLanguage(value);
                  setLangOpen(false);
                }}
              >
                <DropdownMenuRadioItem value="all">All Languages</DropdownMenuRadioItem>
                <DropdownMenuSeparator />
                {LANGUAGES.map((lang) => (
                  <DropdownMenuRadioItem key={lang} value={lang}>
                    {lang}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator />

        {/* Price Range Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Price Range
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm text-primary-600 dark:text-primary-400 font-semibold cursor-help">
                  ₹{priceRange[0]} - ₹{priceRange[1]}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter counselors by session price</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={10000}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>₹0</span>
            <span>₹10,000</span>
          </div>
        </div>

        <Button onClick={clearFilters} variant="outline" className="w-full mt-6">
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      </div>
    );
  }
);

FilterSection.displayName = 'FilterSection';

// ============================================
// MAIN COMPONENT
// ============================================
const BrowseCounselor = () => {
  const navigate = useNavigate();
  const { client, clientLoading } = useClientAuth();
  const { counselor, counselorLoading } = useCounselorAuth();

  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Filters - WITH PRICE
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('all');
  const [gender, setGender] = useState('all');
  const [language, setLanguage] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('rating');
  const [sortOpen, setSortOpen] = useState(false);

  const isAuthenticated = !!(client || counselor);
  const isLoading = clientLoading || counselorLoading;

  const SPECIALIZATIONS = useMemo(
    () => [
      'Mental Health',
      'Career Counselling',
      'Relationship Counselling',
      'Life Coaching',
      'Academic Counselling',
      'Health and Wellness Counselling',
    ],
    []
  );

  const LANGUAGES = useMemo(() => ['English', 'Hindi'], []);

  const fetchCounselors = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchCounselors();
    const intervalId = setInterval(fetchCounselors, 60000);
    return () => clearInterval(intervalId);
  }, [fetchCounselors]);

  const bookCounselor = useCallback(
    (counselorId) => {
      navigate(`/book-counselor/${counselorId}`);
    },
    [navigate]
  );

  const clearFilters = useCallback(() => {
    setSearch('');
    setSpec('all');
    setGender('all');
    setLanguage('all');
    setPriceRange([0, 10000]);
    setSortBy('rating');
  }, []);

  // WITH PRICE FILTERING
  const visible = useMemo(() => {
    return counselors
      .filter((c) => {
        const bySearch =
          c.fullName.toLowerCase().includes(search.toLowerCase()) ||
          c.specialization.toLowerCase().includes(search.toLowerCase());

        const bySpec = spec === 'all' || c.specialization === spec;
        const byGender = gender === 'all' || c.gender === gender;
        const byLanguage = language === 'all' || c.application?.languages?.includes(language);
        const byPrice =
          !c.availableSlots[0].totalPriceAfterPlatformFee ||
          (c.availableSlots[0].totalPriceAfterPlatformFee >= priceRange[0] &&
            c.availableSlots[0].totalPriceAfterPlatformFee <= priceRange[1]);

        return bySearch && bySpec && byGender && byLanguage && byPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0); // not implemented yet
        if (sortBy === 'experience') return (b.experienceYears || 0) - (a.experienceYears || 0);
        if (sortBy === 'price')
          return (
            (a.availableSlots[0].totalPriceAfterPlatformFee || 0) -
            (b.availableSlots[0].totalPriceAfterPlatformFee || 0)
          );
        return 0;
      });
  }, [counselors, search, spec, gender, language, priceRange, sortBy]);

  const paginationData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = visible.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(visible.length / itemsPerPage);

    return { currentItems, totalPages };
  }, [visible, currentPage, itemsPerPage]);

  const { currentItems, totalPages } = paginationData;

  //not implemented yet so not visible
  const featuredCounselors = useMemo(() => {
    return [...counselors]
      .filter((c) => c.rating && c.rating > 4.5)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);
  }, [counselors]);

  if (loading || isLoading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 dark:from-primary-900 dark:via-primary-800 dark:to-primary-700">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto p-4"
        >
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
            <CardContent className="py-12 flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-white" />
              <h3 className="text-xl font-semibold text-white drop-shadow-lg">
                Loading Counselors
              </h3>
              <p className="text-white/80 drop-shadow-md">
                Getting you connected with caring professionals...
              </p>
              <Progress value={66} className="w-64" />
            </CardContent>
          </Card>
        </motion.div>
      </section>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-neutral-50 via-primary-100 to-primary-200/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/30s">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative min-h-0 lg:min-h-[60vh] flex items-center overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 dark:from-primary-900 dark:via-primary-800 dark:to-primary-700"
          aria-labelledby="hero-heading"
        >
          <div
            className="absolute inset-0 z-0 lg:hidden"
            style={{
              backgroundImage: `url(${HeroImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 70%',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div
            className="absolute inset-0 z-[1] lg:hidden bg-gradient-to-b from-primary-700/90 via-primary-600/85 to-primary-500/90"
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 bottom-0 w-2/3 max-w-4xl h-full z-0 hidden lg:flex items-center justify-end">
            <img
              src={HeroImage}
              alt=""
              className="h-full w-full object-contain object-right"
              loading="eager"
            />
          </div>
          <div
            className="absolute inset-0 z-[1] hidden lg:block bg-gradient-to-r from-primary-700 via-primary-600/80 via-primary-500/40 to-transparent dark:from-primary-900 dark:via-primary-800/80 dark:via-primary-700/40 dark:to-transparent"
            aria-hidden="true"
          />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 md:px-10 lg:px-12 py-20 lg:py-28">
            <div className="max-w-2xl lg:max-w-3xl mx-auto lg:mx-0">
              <motion.div
                className="space-y-5 lg:space-y-7 text-center lg:text-left"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <motion.div variants={fadeInUp} className="flex justify-center lg:justify-start">
                  <Badge
                    variant="outline"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-white/10 backdrop-blur-md text-white border-white/20 rounded-full shadow-lg hover:bg-white/20 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Over 500 Certified Counselors</span>
                  </Badge>
                </motion.div>

                <motion.h1
                  id="hero-heading"
                  className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-lg"
                  variants={fadeInUp}
                >
                  Find Your Perfect Counselor
                </motion.h1>

                <motion.p
                  className="text-sm sm:text-base lg:text-lg text-white/95 leading-relaxed max-w-2xl mx-auto lg:mx-0 drop-shadow-md"
                  variants={fadeInUp}
                  role="doc-subtitle"
                >
                  Browse verified professionals who specialize in anxiety, relationships, career,
                  and more. Your journey to wellness starts here.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start"
                  variants={fadeInUp}
                >
                  <Button
                    size="lg"
                    onClick={() =>
                      document
                        .getElementById('counselors-section')
                        ?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="group relative overflow-hidden bg-white text-primary-900 hover:bg-primary-50 text-sm font-semibold rounded-xl px-7 py-5 shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105"
                  >
                    <Search
                      className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"
                      aria-hidden="true"
                    />
                    Start Exploring
                  </Button>
                  {!isAuthenticated && (
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => navigate('/login')}
                      className="group bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/30 hover:border-white/50 text-sm font-semibold rounded-xl px-7 py-5 shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <UserCircle
                        className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform"
                        aria-hidden="true"
                      />
                      Get Started
                    </Button>
                  )}
                </motion.div>

                <motion.p
                  className="text-xs sm:text-sm text-white/90 flex items-center justify-center lg:justify-start gap-2 drop-shadow-md"
                  variants={fadeInUp}
                >
                  <CheckCircle
                    className="w-3.5 h-3.5 text-white flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>Get matched with certified counselors within minutes.</span>
                </motion.p>

                <motion.div
                  className="flex flex-wrap gap-2.5 pt-1 justify-center lg:justify-start"
                  variants={fadeInUp}
                >
                  <Badge
                    variant="outline"
                    className="gap-1.5 px-3 py-1.5 text-xs bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 transition-all"
                  >
                    <Shield className="w-3 h-3" aria-hidden="true" />
                    <span className="font-medium">Verified Professionals</span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className="gap-1.5 px-3 py-1.5 text-xs bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 transition-all"
                  >
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    <span className="font-medium">24/7 Available</span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className="gap-1.5 px-3 py-1.5 text-xs bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 transition-all"
                  >
                    <Lock className="w-3 h-3" aria-hidden="true" />
                    <span className="font-medium">Secure & Confidential</span>
                  </Badge>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Main Content */}
        <main className="pt-16 relative min-h-0 lg:min-h-screen flex items-center justify-center overflow-hidden bg-transparent py-20 lg:py-28">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-20 left-12 w-72 h-72 bg-primary-400/10 dark:bg-primary-600/5 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-24 right-10 w-96 h-96 bg-secondary-400/10 dark:bg-secondary-600/5 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '500ms' }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary-200/20 dark:bg-primary-800/10 rounded-full blur-3xl opacity-50" />
          </div>

          <div
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
            id="counselors-section"
          >
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Desktop Sidebar */}
              <aside className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-4 space-y-6">
                  <Card className="group relative bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        Filters
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                      <ScrollArea className="h-[calc(100vh-280px)] pr-3">
                        <FilterSection
                          search={search}
                          setSearch={setSearch}
                          spec={spec}
                          setSpec={setSpec}
                          gender={gender}
                          setGender={setGender}
                          language={language}
                          setLanguage={setLanguage}
                          priceRange={priceRange}
                          setPriceRange={setPriceRange}
                          clearFilters={clearFilters}
                          SPECIALIZATIONS={SPECIALIZATIONS}
                          LANGUAGES={LANGUAGES}
                        />
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Top Rated Sidebar ( not iplemnted yet so not visible */}
                  {featuredCounselors.length > 0 && (
                    <Card className="group relative bg-gradient-to-br from-white via-white to-amber-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-amber-950/30 border border-neutral-200 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-2xl hover:shadow-amber-500/10 dark:hover:shadow-amber-500/5 hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <CardHeader className="pb-4 relative">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          Top Rated This Month
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {featuredCounselors.map((c) => (
                          <Tooltip key={c._id}>
                            <TooltipTrigger asChild>
                              <div
                                className="flex items-center gap-3 p-3 bg-white dark:bg-neutral-800/50 rounded-xl cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-300 border border-neutral-200 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-600"
                                onClick={() => bookCounselor(c._id)}
                              >
                                <Avatar className="w-12 h-12 border-2 border-white dark:border-neutral-800 shadow-lg">
                                  <AvatarImage src={c.profilePicture} />
                                  <AvatarFallback className="bg-amber-100 dark:bg-amber-900/30">
                                    <User className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate">{c.fullName}</p>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                      {c.rating.toFixed(1)}
                                    </span>
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-neutral-400" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Click to view profile</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1 space-y-8">
                {/* Filter Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-primary-600 rounded-full animate-pulse" />
                    <p className="text-lg font-semibold">
                      <span className="text-neutral-900 dark:text-white">{visible.length} </span>
                      <span className="text-neutral-700 dark:text-neutral-300">
                        counselor{visible.length !== 1 ? 's' : ''} available
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <Sheet>
                      <SheetTrigger asChild className="lg:hidden">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Filter className="w-4 h-4" />
                          Filters
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-80">
                        <SheetHeader>
                          <SheetTitle>Filters</SheetTitle>
                          <SheetDescription>Refine your search</SheetDescription>
                        </SheetHeader>
                        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
                          <FilterSection
                            search={search}
                            setSearch={setSearch}
                            spec={spec}
                            setSpec={setSpec}
                            gender={gender}
                            setGender={setGender}
                            language={language}
                            setLanguage={setLanguage}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            clearFilters={clearFilters}
                            SPECIALIZATIONS={SPECIALIZATIONS}
                            LANGUAGES={LANGUAGES}
                          />
                        </ScrollArea>
                      </SheetContent>
                    </Sheet>

                    <DropdownMenu open={sortOpen} onOpenChange={setSortOpen} modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-44 justify-between">
                          <span>
                            {sortBy === 'rating' && 'Highest Rated'}
                            {sortBy === 'experience' && 'Most Experience'}
                            {sortBy === 'price' && 'Lowest Price'}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" avoidCollisions>
                        <DropdownMenuRadioGroup
                          value={sortBy}
                          onValueChange={(value) => {
                            setSortBy(value);
                            setSortOpen(false);
                          }}
                        >
                          <DropdownMenuRadioItem value="rating">
                            Highest Rated
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="experience">
                            Most Experience
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="price">Lowest Price</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Counselor Cards Grid - COMPACT & STYLED */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                  className="grid grid-cols-1 gap-5"
                >
                  <AnimatePresence mode="wait">
                    {currentItems.length === 0 ? (
                      <motion.div
                        key="no-results"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="col-span-full"
                      >
                        <Card className="p-12 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                              <Search className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold mb-2">No counselors found</h3>
                              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                Try adjusting your filters to see more results
                              </p>
                              <Button onClick={clearFilters} variant="outline">
                                Clear Filters
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ) : (
                      currentItems.map((counselor, index) => (
                        <motion.div
                          key={counselor._id}
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="group relative bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 transition-all duration-500 overflow-hidden">
                            {/* Decorative Corner Element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 to-transparent rounded-bl-[4rem] pointer-events-none" />

                            <div className="relative p-4 sm:p-5">
                              <div className="flex flex-col sm:flex-row gap-4">
                                {/* Left: Profile Image */}
                                <div className="relative flex-shrink-0">
                                  <div className="w-full sm:w-28 h-32 sm:h-32 rounded-xl overflow-hidden bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-950/20 border-2 border-white dark:border-neutral-800 shadow-lg">
                                    {counselor.profilePicture ? (
                                      <img
                                        src={counselor.profilePicture}
                                        alt={counselor.fullName}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-14 h-14 text-primary-600 dark:text-primary-400" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Verified Badge on Image */}
                                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-primary-600 dark:bg-primary-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg">
                                    <Shield className="w-3 h-3" />
                                    <span>Verified</span>
                                  </div>
                                </div>

                                {/* Middle: Main Content */}
                                <div className="flex-1 min-w-0 space-y-2.5 pt-2 sm:pt-0">
                                  {/* Name with Gender Badge and Rating */}
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white leading-tight">
                                          {counselor.fullName}
                                        </h3>

                                        {/* Gender Badge */}
                                        {counselor.gender && (
                                          <Badge
                                            variant="secondary"
                                            className="text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-0 h-5"
                                          >
                                            {counselor.gender}
                                          </Badge>
                                        )}
                                      </div>

                                      {/* Experience & Price Row */}
                                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                                        {counselor.experienceYears && (
                                          <div className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
                                            <Award className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                            <span className="font-medium">
                                              {counselor.experienceYears}+ yrs exp
                                            </span>
                                          </div>
                                        )}

                                        <Separator orientation="vertical" className="h-3" />

                                        {/* Price */}
                                        {counselor.availableSlots?.[0]
                                          ?.totalPriceAfterPlatformFee && (
                                          <div className="flex items-center gap-1">
                                            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                              ₹
                                              {
                                                counselor.availableSlots[0]
                                                  .totalPriceAfterPlatformFee
                                              }
                                            </span>
                                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                              /session
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Rating Badge */}
                                    {counselor.rating && (
                                      <div className="flex items-center gap-1 px-2.5 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                                        <Star className="w-3.5 h-3.5 fill-primary-500 text-primary-500" />
                                        <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                          {counselor.rating.toFixed(1)}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Expertise Badge - Separate Row */}
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                      Expertise:
                                    </span>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-0"
                                    >
                                      {counselor.specialization}
                                    </Badge>
                                  </div>

                                  {/* Session Details Badges */}
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800 flex items-center gap-1"
                                    >
                                      <Clock className="w-3 h-3" />
                                      45 min
                                    </Badge>

                                    <Badge
                                      variant="secondary"
                                      className="text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800 flex items-center gap-1"
                                    >
                                      <Video className="w-3 h-3" />
                                      Video
                                    </Badge>
                                  </div>

                                  {/* Languages & Next Slot Row */}
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                                    {/* Languages */}
                                    {counselor.application?.languages &&
                                      counselor.application.languages.length > 0 && (
                                        <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                                          <Languages className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                          <span className="font-medium">
                                            {counselor.application.languages.join(', ')}
                                          </span>
                                        </div>
                                      )}

                                    {/* Next Slot */}
                                    {counselor.availableSlots &&
                                      counselor.availableSlots.length > 0 &&
                                      (() => {
                                        const nextSlot = counselor.availableSlots.filter(
                                          (slot) => slot.status === 'available'
                                        )[0];

                                        if (nextSlot) {
                                          const slotDate = dayjs(nextSlot.startTime).tz(TIMEZONE);
                                          const today = dayjs().tz(TIMEZONE);
                                          const tomorrow = today.add(1, 'day');

                                          let dateLabel = slotDate.format('MMM D');
                                          if (slotDate.isSame(today, 'day')) {
                                            dateLabel = 'Today';
                                          } else if (slotDate.isSame(tomorrow, 'day')) {
                                            dateLabel = 'Tomorrow';
                                          }

                                          return (
                                            <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-medium">
                                              <CheckCircle className="w-3.5 h-3.5" />
                                              <span>
                                                Next slot: {dateLabel}, {slotDate.format('h:mm A')}
                                              </span>
                                            </div>
                                          );
                                        }
                                        return null;
                                      })()}
                                  </div>
                                </div>

                                {/* Right: Action Buttons */}
                                <div className="flex sm:flex-col gap-2 justify-end sm:justify-start sm:min-w-[130px] sm:pt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 sm:flex-none h-9 hover:bg-primary-50 dark:hover:bg-primary-900/20 border-neutral-300 dark:border-neutral-700"
                                    onClick={() => bookCounselor(counselor._id)}
                                  >
                                    <User className="w-3.5 h-3.5 mr-1.5" />
                                    <span className="text-xs font-semibold">Profile</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="flex-1 sm:flex-none h-9 bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white shadow-md"
                                    onClick={() => bookCounselor(counselor._id)}
                                  >
                                    <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                                    <span className="text-xs font-semibold">Book Now</span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center pt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            className={
                              currentPage === 1
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>

                        {[...Array(totalPages)].map((_, i) => {
                          const pageNumber = i + 1;
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(pageNumber)}
                                  isActive={currentPage === pageNumber}
                                  className="cursor-pointer"
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (
                            pageNumber === currentPage - 2 ||
                            pageNumber === currentPage + 2
                          ) {
                            return (
                              <PaginationItem key={pageNumber}>
                                <span className="px-4 py-2">...</span>
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            className={
                              currentPage === totalPages
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default BrowseCounselor;
