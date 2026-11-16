import { useState, useMemo, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import bookingService from '../services/booking';
import useSmartRefresh from './useSmartRefresh';
import { DEFAULT_LANGUAGES } from '../constants/constants';

/**
 * Helper to extract accurate starting session price for a counselor.
 * Evaluates individual slot prices, hourly rates, and fallback base rates.
 * @param {Object} c - Counselor profile object.
 * @returns {number} Normalized starting session price in INR.
 */
export const getCounselorPrice = (c) => {
  if (Array.isArray(c?.availableSlots) && c.availableSlots.length > 0) {
    const validPrices = c.availableSlots
      .map((s) => Number(s?.totalPriceAfterPlatformFee))
      .filter((p) => typeof p === 'number' && !isNaN(p) && p > 0);
    if (validPrices.length > 0) {
      return Math.min(...validPrices);
    }
  }
  if (typeof c?.hourlyRate === 'number' && c.hourlyRate > 0) return c.hourlyRate;
  if (typeof c?.application?.hourlyRate === 'number' && c.application.hourlyRate > 0) {
    return c.application.hourlyRate;
  }
  return 690;
};

/**
 * Enterprise Layer 3 State Hook for Counselor Discovery and Filtering.
 * Encapsulates catalog loading, multi-dimensional filtering, dynamic language aggregation,
 * sorting rules, and smart tab-aware cache refreshing.
 *
 * @param {Object} [options] - Configuration options.
 * @param {number} [options.itemsPerPage=9] - Number of counselors per paginated view.
 * @param {number} [options.staleTimeMs=45000] - Duration in ms before cached catalog is considered stale.
 * @returns {Object} Counselor discovery state and control methods.
 */
export const useCounselorDiscovery = ({ itemsPerPage = 9, staleTimeMs = 45000 } = {}) => {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Search, category, demographic, and financial filters
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('all');
  const [gender, setGender] = useState('all');
  const [language, setLanguage] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('rating');
  const [sortOpen, setSortOpen] = useState(false);

  // Static Specializations taxonomy
  const SPECIALIZATIONS = useMemo(
    () => [
      'Mental Health',
      'Career Counselling',
      'Relationship & Family Therapy',
      'Life & Personal Development',
      'Academic Counselling',
      'Health and Wellness Counselling',
    ],
    []
  );

  // Dynamic language collection derived from active roster
  const LANGUAGES = useMemo(() => {
    const languageSet = new Set(DEFAULT_LANGUAGES);
    counselors.forEach((c) => {
      const langs = c.application?.languages || [];
      langs.forEach((l) => {
        if (typeof l === 'string' && l.trim()) {
          languageSet.add(l.trim());
        }
      });
    });
    return Array.from(languageSet);
  }, [counselors]);

  // Catalog retrieval via Layer 2 Service
  const fetchCounselors = useCallback(async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true);
      }
      const data = await bookingService.getAvailableCounselors();
      setCounselors(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Counselor discovery fetch error:', err);
      setError(err);
      if (!isAutoRefresh) {
        toast.error('Failed to load counselors. Please try again later.');
      }
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
      }
    }
  }, []);

  // Smart polling / foreground tab reactivation refresh
  useSmartRefresh(fetchCounselors, { staleTimeMs });

  // Filter tally count for UI badges
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search && search.trim()) count++;
    if (spec && spec !== 'all') count++;
    if (gender && gender !== 'all') count++;
    if (language && language !== 'all') count++;
    if (priceRange && (priceRange[0] > 0 || priceRange[1] < 10000)) count++;
    return count;
  }, [search, spec, gender, language, priceRange]);

  // Clear all filters back to default values
  const clearFilters = useCallback(() => {
    setSearch('');
    setSpec('all');
    setGender('all');
    setLanguage('all');
    setPriceRange([0, 10000]);
    setSortBy('rating');
  }, []);

  // Reset pagination to page 1 whenever any filter or sorting order changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, spec, gender, language, priceRange, sortBy]);

  // Filter and sort counselors list
  const visible = useMemo(() => {
    return counselors
      .filter((c) => {
        const bySearch =
          !search?.trim() ||
          c.fullName?.toLowerCase().includes(search.toLowerCase().trim()) ||
          c.specialization?.some((s) => s.toLowerCase().includes(search.toLowerCase().trim()));

        const bySpec = spec === 'all' || c.specialization?.includes(spec);
        const byGender = gender === 'all' || c.gender === gender;
        const byLanguage = language === 'all' || c.application?.languages?.includes(language);

        const price = getCounselorPrice(c);
        const byPrice = price >= priceRange[0] && price <= priceRange[1];

        return bySearch && bySpec && byGender && byLanguage && byPrice;
      })
      .sort((a, b) => {
        const priceA = getCounselorPrice(a);
        const priceB = getCounselorPrice(b);

        if (sortBy === 'price_asc' || sortBy === 'price') return priceA - priceB;
        if (sortBy === 'price_desc') return priceB - priceA;
        if (sortBy === 'experience') return (b.experienceYears || 0) - (a.experienceYears || 0);
        if (sortBy === 'rating') {
          const ratingA = Number(a.rating) || 0;
          const ratingB = Number(b.rating) || 0;
          if (ratingB !== ratingA) return ratingB - ratingA;
          return priceA - priceB;
        }
        return priceA - priceB;
      });
  }, [counselors, search, spec, gender, language, priceRange, sortBy]);

  // Pagination calculation
  const paginationData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = visible.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(visible.length / itemsPerPage);

    return { currentItems, totalPages };
  }, [visible, currentPage, itemsPerPage]);

  const { currentItems, totalPages } = paginationData;

  // Page navigation handler with optional scroll callback
  const handlePageChange = useCallback(
    (pageAction, onPageChanged) => {
      setCurrentPage((prev) => {
        const targetPage = typeof pageAction === 'function' ? pageAction(prev) : pageAction;
        if (targetPage !== prev && targetPage >= 1 && targetPage <= totalPages) {
          if (typeof onPageChanged === 'function') {
            requestAnimationFrame(() => {
              onPageChanged(targetPage);
            });
          }
          return targetPage;
        }
        return prev;
      });
    },
    [totalPages]
  );

  // Top rated featured counselors list
  const featuredCounselors = useMemo(() => {
    return [...counselors]
      .filter((c) => c.rating && c.rating > 4.5)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);
  }, [counselors]);

  return {
    counselors,
    loading,
    error,
    fetchCounselors,
    currentPage,
    setCurrentPage,
    itemsPerPage,
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
    sortBy,
    setSortBy,
    sortOpen,
    setSortOpen,
    activeFilterCount,
    clearFilters,
    SPECIALIZATIONS,
    LANGUAGES,
    visible,
    visibleCounselors: visible,
    currentItems,
    totalPages,
    handlePageChange,
    featuredCounselors,
  };
};

export default useCounselorDiscovery;
