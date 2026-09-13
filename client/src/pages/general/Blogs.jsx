import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FaSearch,
  FaFilter,
  FaClock,
  FaEye,
  FaHeart,
  FaComment,
  FaSpinner,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import {
  Clock,
  Eye,
  Heart,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import api from '../../lib/axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Blogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDocs: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, [selectedCategory, sortBy, searchParams.get('page')]);

  // ✅ UPDATED: Fetch blogs without authentication (public endpoint)
  const fetchBlogs = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: searchParams.get('page') || '1',
        limit: '12',
        sort: sortBy,
      });

      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      // ✅ Public endpoint - no authentication required
      const response = await api.get(`${API_ENDPOINTS.BLOGS_GET_ALL}?${params}`);

      const data = response.data;
      if (data.success) {
        setBlogs(data.data.docs);
        setPagination({
          currentPage: data.data.page,
          totalPages: data.data.totalPages,
          totalDocs: data.data.totalDocs,
          hasNextPage: data.data.hasNextPage,
          hasPrevPage: data.data.hasPrevPage,
        });
      } else {
        toast.error(data.message || 'Failed to load blogs');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: Fetch categories without authentication (public endpoint)
  const fetchCategories = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.BLOGS_GET_CATEGORIES);

      const data = response.data;
      if (data.success) {
        setCategories(data.data);
      } else {
        // ✅ Fail silently for categories if there's an issue
        console.log('Categories not available');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // ✅ Don't show error toast for categories - they're optional
    }
  };

  // ✅ OPTIMIZED: Debounced search to reduce API calls
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
    fetchBlogs();
  };

  const handleCategoryFilter = (category) => {
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    params.set('page', '1');
    setSearchParams(params);
    setSelectedCategory(category);
  };

  const handleSortChange = (sort) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sort);
    params.set('page', '1');
    setSearchParams(params);
    setSortBy(sort);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
    // ✅ Scroll to top on page change for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('latest');
    setSearchParams({});
  };

  // ✅ NEW: Debounced search effect to reduce API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== (searchParams.get('search') || '')) {
        const params = new URLSearchParams(searchParams);
        if (searchTerm.trim()) {
          params.set('search', searchTerm.trim());
        } else {
          params.delete('search');
        }
        params.set('page', '1');
        setSearchParams(params);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-24 sm:pt-28 pb-16">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-12 w-72 h-72 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-24 right-10 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gray-900">Mental Health</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Insights & Stories
            </span>
          </motion.h1>
          <motion.p
            className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover expert insights, personal stories, and practical tips for your mental wellness
            journey.
          </motion.p>
        </div>

        {/* Search and Filters */}
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-4 sm:p-6 mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 w-full max-w-none sm:max-w-lg">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search blogs..."
                  className="w-full pl-10 sm:pl-12 pr-20 sm:pr-24 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <FaSearch className="absolute left-3.5 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <button
                  type="submit"
                  className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-indigo-700 transition-colors text-xs sm:text-sm font-medium"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Sort and Filter Toggles */}
            <div className="flex flex-wrap gap-2.5 sm:gap-4 items-center justify-between sm:justify-start">
              <Select value={sortBy} onValueChange={(val) => handleSortChange(val)}>
                <SelectTrigger className="w-auto min-w-[130px] sm:w-[150px] h-10 px-3 sm:px-4 py-2 text-sm rounded-xl border border-gray-200 bg-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                </SelectContent>
              </Select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center h-10 px-3 sm:px-4 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors bg-white"
              >
                <FaFilter className="mr-2 text-xs" />
                Filters
              </button>
            </div>
          </div>

          {/* Category Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-200"
              >
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleCategoryFilter('')}
                    className={`px-4 py-2 rounded-full transition-colors ${
                      !selectedCategory
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => handleCategoryFilter(category.value)}
                      className={`px-4 py-2 rounded-full transition-colors ${
                        selectedCategory === category.value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.label} ({category.count})
                    </button>
                  ))}
                  {(selectedCategory || searchTerm) && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ✅ IMPROVED: Results count display */}
        {!loading && blogs.length > 0 && (
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-600">
              Showing {blogs.length} of {pagination.totalDocs} blogs
              {searchTerm && (
                <span>
                  {' '}
                  for "<strong>{searchTerm}</strong>"
                </span>
              )}
              {selectedCategory && (
                <span>
                  {' '}
                  in{' '}
                  <strong>
                    {categories.find((c) => c.value === selectedCategory)?.label ||
                      selectedCategory}
                  </strong>
                </span>
              )}
            </p>
          </motion.div>
        )}

        {/* Blogs Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <FaSpinner className="animate-spin h-12 w-12 text-indigo-600" />
          </div>
        ) : blogs.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-gray-500">
              <FaSearch className="mx-auto h-16 w-16 mb-4 opacity-50" />
              <h3 className="text-2xl font-semibold mb-2">No blogs found</h3>
              <p className="text-lg mb-6">Try adjusting your search or filters</p>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {blogs.map((blog, index) => (
              <BlogCard key={blog._id} blog={blog} index={index} />
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <motion.div
            className="flex justify-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="flex items-center px-4 py-2 rounded-xl bg-white/90 backdrop-blur-sm border border-white/50 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaChevronLeft className="mr-2" />
                Previous
              </button>

              <div className="flex space-x-2">
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= pagination.currentPage - 2 && page <= pagination.currentPage + 2)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-xl ${
                          page === pagination.currentPage
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white/90 backdrop-blur-sm border border-white/50 hover:bg-indigo-50'
                        } transition-colors`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === pagination.currentPage - 3 ||
                    page === pagination.currentPage + 3
                  ) {
                    return (
                      <span key={page} className="px-2">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="flex items-center px-4 py-2 rounded-xl bg-white/90 backdrop-blur-sm border border-white/50 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <FaChevronRight className="ml-2" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Category configuration tailored for a calming, professional mental health platform
const CATEGORY_THEMES = {
  'mental-health': {
    label: 'Mental Health',
    icon: '🧠',
    badge: 'bg-teal-50 text-teal-700 border-teal-200/80 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/80',
    headerGradient: 'from-teal-500/15 via-emerald-500/10 to-teal-700/15',
  },
  career: {
    label: 'Career & Work',
    icon: '💼',
    badge: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/80',
    headerGradient: 'from-blue-500/15 via-indigo-500/10 to-blue-700/15',
  },
  relationship: {
    label: 'Relationship',
    icon: '❤️',
    badge: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/80',
    headerGradient: 'from-rose-500/15 via-pink-500/10 to-rose-700/15',
  },
  'life-coaching': {
    label: 'Personal Growth',
    icon: '🌱',
    badge: 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/80',
    headerGradient: 'from-purple-500/15 via-violet-500/10 to-purple-700/15',
  },
  academic: {
    label: 'Academic & Students',
    icon: '🎓',
    badge: 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/80',
    headerGradient: 'from-sky-500/15 via-cyan-500/10 to-sky-700/15',
  },
  'health-wellness': {
    label: 'Health & Wellness',
    icon: '🌿',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/80',
    headerGradient: 'from-emerald-500/15 via-teal-500/10 to-emerald-700/15',
  },
};

const getCategoryTheme = (category) => {
  const normalized = category?.toLowerCase()?.trim() || '';
  return (
    CATEGORY_THEMES[normalized] || {
      label: category ? category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Mental Health',
      icon: '✨',
      badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      headerGradient: 'from-slate-500/10 via-primary-500/10 to-slate-700/10',
    }
  );
};

// Safe formatting for counselor specialization string/array
const getAuthorSpecialization = (author) => {
  if (!author) return 'Licensed Counselor';
  const spec = author.specialization;
  if (Array.isArray(spec)) {
    if (spec.length === 0) return 'Mental Health Counselor';
    return spec[0];
  }
  if (typeof spec === 'string' && spec.trim()) {
    return spec.split(',')[0].trim();
  }
  return 'Mental Health Counselor';
};

// Modern, Professional Mental Health Blog Card
const BlogCard = ({ blog, index }) => {
  const theme = getCategoryTheme(blog.category);
  const formattedDate = blog.publishedAt && dayjs(blog.publishedAt).isValid()
    ? dayjs(blog.publishedAt).format('DD MMM YYYY')
    : 'Recent';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col h-full overflow-hidden"
    >
      {/* Visual Header / Featured Image */}
      {blog.featuredImage ? (
        <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />
          
          {/* Badges on Image */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow-xs ${theme.badge}`}>
              <span>{theme.icon}</span>
              <span>{theme.label}</span>
            </span>
            {blog.featured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-400 text-amber-950 backdrop-blur-md shadow-xs">
                <Sparkles className="w-3 h-3" />
                Featured
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className={`relative h-28 w-full bg-gradient-to-br ${theme.headerGradient} border-b border-slate-100 dark:border-slate-800/80 p-4 flex flex-col justify-between overflow-hidden shrink-0`}>
          <div className="absolute -right-2 -bottom-3 text-6xl opacity-10 select-none pointer-events-none">
            {theme.icon}
          </div>
          <div className="flex items-center justify-between relative z-10">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm shadow-xs ${theme.badge}`}>
              <span>{theme.icon}</span>
              <span>{theme.label}</span>
            </span>
            {blog.featured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-400 text-amber-950 shadow-xs">
                <Sparkles className="w-3 h-3" />
                Featured
              </span>
            )}
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 leading-snug tracking-tight mb-2.5">
            <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed font-normal">
            {blog.excerpt}
          </p>
        </div>

        {/* Footer Info */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3.5">
          {/* Metadata Row */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-3.5">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {blog.readingTime || 3} min read
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {blog.views || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                {blog.likes?.length || 0}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">{formattedDate}</span>
          </div>

          {/* Author & Action Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full ring-2 ring-primary-500/20 bg-gradient-to-br from-[#1c3c63] to-[#2563eb] flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden shadow-xs">
                {blog.author?.profilePicture ? (
                  <img
                    src={blog.author.profilePicture}
                    alt={blog.author.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  blog.author?.fullName?.charAt(0)?.toUpperCase() || 'A'
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">
                  {blog.author?.fullName || 'Anonymous'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[120px] sm:max-w-[160px]">
                  {getAuthorSpecialization(blog.author)}
                </p>
              </div>
            </div>

            <Link
              to={`/blogs/${blog.slug}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1c3c63] to-[#2563eb] hover:from-[#152f4f] hover:to-[#1e40af] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all shrink-0 group/btn"
            >
              <span>Read</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Blogs;
