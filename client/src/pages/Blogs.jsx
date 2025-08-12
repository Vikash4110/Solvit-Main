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
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

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
    hasPrevPage: false
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
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BLOGS_GET_ALL}?${params}`, {
        headers: {
          'Content-Type': 'application/json'
        }
        // ✅ Removed credentials and authorization
      });

      const data = await response.json();
      if (data.success) {
        setBlogs(data.data.docs);
        setPagination({
          currentPage: data.data.page,
          totalPages: data.data.totalPages,
          totalDocs: data.data.totalDocs,
          hasNextPage: data.data.hasNextPage,
          hasPrevPage: data.data.hasPrevPage
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
      // ✅ Public endpoint - no authentication required
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BLOGS_GET_CATEGORIES}`, {
        headers: {
          'Content-Type': 'application/json'
        }
        // ✅ Removed authentication headers
      });

      const data = await response.json();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-24 pb-16">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-12 w-72 h-72 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-24 right-10 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            className="text-5xl font-bold leading-tight tracking-tight mb-6"
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
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover expert insights, personal stories, and practical tips for your mental wellness journey.
          </motion.p>
        </div>

        {/* Search and Filters */}
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search blogs..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Sort and Filter Toggles */}
            <div className="flex gap-4 items-center">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="latest">Latest</option>
                <option value="popular">Most Popular</option>
                <option value="alphabetical">A-Z</option>
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <FaFilter className="mr-2" />
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
              {searchTerm && <span> for "<strong>{searchTerm}</strong>"</span>}
              {selectedCategory && <span> in <strong>{categories.find(c => c.value === selectedCategory)?.label || selectedCategory}</strong></span>}
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
                    return <span key={page} className="px-2">...</span>;
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

// ✅ UPDATED: Blog Card Component
const BlogCard = ({ blog, index }) => {
  const categoryColors = {
    'mental-health': 'from-teal-500 to-teal-600',
    'career': 'from-indigo-500 to-indigo-600',
    'relationship': 'from-pink-500 to-pink-600',
    'life-coaching': 'from-purple-500 to-purple-600',
    'academic': 'from-green-500 to-green-600',
    'health-wellness': 'from-blue-500 to-blue-600'
  };

  const categoryIcons = {
    'mental-health': '🧠',
    'career': '💼',
    'relationship': '❤️',
    'life-coaching': '🚀',
    'academic': '🎓',
    'health-wellness': '💚'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -10 }}
      className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500"
    >
      {/* Featured Image */}
      {blog.featuredImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-full h-full object-cover"
            // ✅ Added error handling for broken images
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className="p-6">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${categoryColors[blog.category] || 'from-gray-500 to-gray-600'} text-white text-sm font-medium`}>
            <span className="mr-1">{categoryIcons[blog.category] || '📄'}</span>
            {blog.category.replace('-', ' ').toUpperCase()}
          </div>
          {blog.featured && (
            <div className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
              FEATURED
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-indigo-600 transition-colors">
          <Link to={`/blogs/${blog.slug}`}>
            {blog.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {blog.excerpt}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FaClock className="mr-1" />
              {blog.readingTime} min read
            </div>
            <div className="flex items-center">
              <FaEye className="mr-1" />
              {blog.views || 0}
            </div>
            <div className="flex items-center">
              <FaHeart className="mr-1" />
              {blog.likes?.length || 0}
            </div>
          </div>
          <div className="text-xs">
            {new Date(blog.publishedAt).toLocaleDateString()}
          </div>
        </div>

        {/* Author */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {blog.author?.profilePicture ? (
                <img
                  src={blog.author.profilePicture}
                  alt={blog.author.fullName}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                blog.author?.fullName?.charAt(0) || 'A'
              )}
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900 text-sm">{blog.author?.fullName || 'Anonymous'}</p>
              <p className="text-xs text-gray-500">{blog.author?.specialization || 'Counselor'}</p>
            </div>
          </div>
          
          <Link
            to={`/blogs/${blog.slug}`}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 text-sm font-medium"
          >
            Read More
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default Blogs;
