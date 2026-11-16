import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { blogService } from '../services/blog';

/**
 * Enterprise Layer 3 State Hook for Public Blog Feed.
 * Encapsulates query synchronization, pagination, category filtering,
 * debounced search, and sorting logic.
 *
 * @returns {Object} Blog feed reactive state and filter dispatchers.
 */
export const useBlogFeed = () => {
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

  const currentPage = searchParams.get('page') || '1';

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage,
        limit: '12',
        sort: sortBy,
      });

      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      const data = await blogService.getAll(params);

      if (data?.success) {
        setBlogs(data.data.docs || []);
        setPagination({
          currentPage: data.data.page,
          totalPages: data.data.totalPages,
          totalDocs: data.data.totalDocs,
          hasNextPage: data.data.hasNextPage,
          hasPrevPage: data.data.hasPrevPage,
        });
      } else {
        toast.error(data?.message || 'Failed to load blogs');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory, sortBy]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await blogService.getCategories();
      if (data?.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs, selectedCategory, sortBy, currentPage]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearch = (e) => {
    if (e?.preventDefault) e.preventDefault();
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
  }, [searchTerm, searchParams, setSearchParams]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('latest');
    setSearchParams({});
  };

  return {
    blogs,
    categories,
    loading,
    pagination,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    showFilters,
    setShowFilters,
    searchParams,
    setSearchParams,
    handleSearch,
    handleCategoryFilter,
    handleSortChange,
    handlePageChange,
    clearFilters,
    refreshBlogs: fetchBlogs,
  };
};

export default useBlogFeed;
