import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { blogService } from '../services/blog';

/**
 * Enterprise Layer 3 State Hook for Counselor Blog Management.
 * Encapsulates practitioner blog listing, status filtering, debounced query search,
 * blog creation, blog updates, and blog deletions.
 *
 * @returns {Object} Counselor blog state and mutation handlers.
 */
export const useBlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchCounselorBlogs = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: '1',
        limit: '50',
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      const response = await blogService.getMyBlogs(params);

      if (response?.success) {
        setBlogs(response.data.docs || response.data || []);
      } else {
        toast.error('Failed to load blogs', {
          description: response?.message || 'Could not retrieve your blog posts.',
        });
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load blogs', {
        description: 'Unable to connect to the server. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchCounselorBlogs();
  }, [fetchCounselorBlogs]);

  /**
   * Create a new blog post.
   *
   * @param {FormData|Object} payload - Form data or serialized blog body.
   * @returns {Promise<Object>} Created blog data.
   */
  const createBlog = async (payload) => {
    try {
      setFormLoading(true);
      const response = await blogService.createBlog(payload);
      if (response?.success) {
        await fetchCounselorBlogs();
        return response;
      } else {
        throw new Error(response?.message || 'Failed to create blog');
      }
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * Update an existing blog post.
   *
   * @param {string} blogId - Blog identifier.
   * @param {FormData|Object} payload - Form data or serialized blog body.
   * @returns {Promise<Object>} Updated blog data.
   */
  const updateBlog = async (blogId, payload) => {
    try {
      setFormLoading(true);
      const response = await blogService.updateBlog(blogId, payload);
      if (response?.success) {
        await fetchCounselorBlogs();
        return response;
      } else {
        throw new Error(response?.message || 'Failed to update blog');
      }
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * Delete a blog post.
   *
   * @param {string} blogId - Blog identifier.
   * @returns {Promise<Object>} Deletion result.
   */
  const deleteBlog = async (blogId) => {
    try {
      setIsDeleting(true);
      const response = await blogService.deleteBlog(blogId);
      if (response?.success) {
        await fetchCounselorBlogs();
        return response;
      } else {
        throw new Error(response?.message || 'Failed to delete blog');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    blogs,
    setBlogs,
    loading,
    formLoading,
    isDeleting,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    fetchCounselorBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
  };
};

export default useBlogManager;
