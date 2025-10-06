import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaHeart,
  FaComment,
  FaBlog,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaSave,
  FaTimes,
  FaArrowLeft,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { API_BASE_URL, API_ENDPOINTS } from '../../../config/api';

const BlogManagement = () => {
  const [currentView, setCurrentView] = useState('list');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBlog, setSelectedBlog] = useState(null);

  const [blogData, setBlogData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'mental-health',
    tags: [],
    featuredImage: '',
    status: 'draft',
    featured: false,
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCounselorBlogs();
  }, []);

  // ✅ Fetch counselor's blogs using correct API endpoint
  const fetchCounselorBlogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('counselorAccessToken');

      const params = new URLSearchParams({
        page: '1',
        limit: '50',
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.BLOGS_COUNSELOR_MY_BLOGS}?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      const data = await response.json();
      if (data.success) {
        setBlogs(data.data.docs || data.data);
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

  // ✅ Create new blog using correct API endpoint
  const handleCreateBlog = async (e) => {
    e.preventDefault();

    try {
      setFormLoading(true);
      const token = localStorage.getItem('counselorAccessToken');

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BLOGS_CREATE}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(blogData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Blog created successfully!');
        fetchCounselorBlogs();
        resetForm();
        setCurrentView('list');
      } else {
        toast.error(data.message || 'Failed to create blog');
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error('Failed to create blog');
    } finally {
      setFormLoading(false);
    }
  };

  // ✅ Update blog using correct API endpoint
  const handleUpdateBlog = async (e) => {
    e.preventDefault();

    try {
      setFormLoading(true);
      const token = localStorage.getItem('counselorAccessToken');

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.BLOGS_UPDATE}/${selectedBlog._id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(blogData),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Blog updated successfully!');
        fetchCounselorBlogs();
        setCurrentView('list');
      } else {
        toast.error(data.message || 'Failed to update blog');
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error('Failed to update blog');
    } finally {
      setFormLoading(false);
    }
  };

  // ✅ Delete blog using correct API endpoint
  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      const token = localStorage.getItem('counselorAccessToken');

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BLOGS_DELETE}/${blogId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Blog deleted successfully!');
        fetchCounselorBlogs();
        if (selectedBlog && selectedBlog._id === blogId) {
          setCurrentView('list');
        }
      } else {
        toast.error(data.message || 'Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    }
  };

  // Edit blog
  const handleEditBlog = (blog) => {
    setSelectedBlog(blog);
    setBlogData({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      category: blog.category,
      tags: blog.tags || [],
      featuredImage: blog.featuredImage || '',
      status: blog.status,
      featured: blog.featured,
    });
    setCurrentView('edit');
  };

  // View blog
  const handleViewBlog = (blog) => {
    setSelectedBlog(blog);
    setCurrentView('view');
  };

  // Reset form
  const resetForm = () => {
    setBlogData({
      title: '',
      content: '',
      excerpt: '',
      category: 'mental-health',
      tags: [],
      featuredImage: '',
      status: 'draft',
      featured: false,
    });
    setSelectedBlog(null);
  };

  // ✅ Debounced search and filter effects
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (blogs.length > 0) {
        fetchCounselorBlogs();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    if (blogs.length > 0) {
      fetchCounselorBlogs();
    }
  }, [statusFilter]);

  // Filter blogs (client-side backup)
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Blog stats
  const stats = {
    total: blogs.length,
    published: blogs.filter((b) => b.status === 'published').length,
    draft: blogs.filter((b) => b.status === 'draft').length,
    views: blogs.reduce((sum, b) => sum + (b.views || 0), 0),
    likes: blogs.reduce((sum, b) => sum + (b.likes?.length || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {currentView !== 'list' && (
              <button
                onClick={() => {
                  resetForm();
                  setCurrentView('list');
                }}
                className="p-2 rounded-xl bg-white/90 backdrop-blur-sm border border-white/50 shadow-lg hover:shadow-xl transition-all"
              >
                <FaArrowLeft className="text-indigo-600" />
              </button>
            )}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                📝{' '}
                {currentView === 'list'
                  ? 'Blog Management'
                  : currentView === 'create'
                    ? 'Create New Blog'
                    : currentView === 'edit'
                      ? 'Edit Blog'
                      : 'View Blog'}
              </h1>
              <p className="text-xl text-gray-600">
                {currentView === 'list'
                  ? 'Manage your blog posts and build your reputation'
                  : currentView === 'create'
                    ? 'Share your expertise with your audience'
                    : currentView === 'edit'
                      ? 'Update your blog content'
                      : 'Review your blog post'}
              </p>
            </div>
          </div>

          {currentView === 'list' && (
            <button
              onClick={() => {
                resetForm();
                setCurrentView('create');
              }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all font-semibold shadow-lg"
            >
              <FaPlus className="mr-2" />
              Create New Post
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* BLOG LIST VIEW */}
          {currentView === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Posts</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <FaBlog className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Published</p>
                      <p className="text-3xl font-bold text-green-600">{stats.published}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-xl">
                      <FaEye className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Drafts</p>
                      <p className="text-3xl font-bold text-yellow-600">{stats.draft}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-xl">
                      <FaEdit className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Views</p>
                      <p className="text-3xl font-bold text-purple-600">{stats.views}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <FaEye className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Likes</p>
                      <p className="text-3xl font-bold text-red-600">{stats.likes}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-xl">
                      <FaHeart className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search blogs..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Blog Posts Grid */}
              {loading ? (
                <div className="flex justify-center py-20">
                  <FaSpinner className="animate-spin h-12 w-12 text-indigo-600" />
                </div>
              ) : filteredBlogs.length === 0 ? (
                <div className="text-center py-20">
                  <FaBlog className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">No blogs found</h3>
                  <p className="text-gray-600 mb-6">
                    Start creating your first blog post to share your expertise
                  </p>
                  <button
                    onClick={() => setCurrentView('create')}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all font-semibold"
                  >
                    <FaPlus className="mr-2" />
                    Create Your First Blog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBlogs.map((blog, index) => (
                    <motion.div
                      key={blog._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300"
                    >
                      {blog.featuredImage && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={blog.featuredImage}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="p-6">
                        {/* Status Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              blog.status === 'published'
                                ? 'bg-green-100 text-green-700'
                                : blog.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {blog.status.toUpperCase()}
                          </span>
                          {blog.featured && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                              FEATURED
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                          {blog.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <FaEye className="mr-1" />
                              {blog.views || 0}
                            </div>
                            <div className="flex items-center">
                              <FaHeart className="mr-1" />
                              {blog.likes?.length || 0}
                            </div>
                            <div className="flex items-center">
                              <FaComment className="mr-1" />
                              {blog.comments?.length || 0}
                            </div>
                          </div>
                          <div className="text-xs">
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewBlog(blog)}
                            className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                          >
                            <FaEye className="inline mr-1" /> View
                          </button>
                          <button
                            onClick={() => handleEditBlog(blog)}
                            className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                          >
                            <FaEdit className="inline mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(blog._id)}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* BLOG CREATE/EDIT FORM */}
          {(currentView === 'create' || currentView === 'edit') && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
                <form
                  onSubmit={currentView === 'create' ? handleCreateBlog : handleUpdateBlog}
                  className="space-y-6"
                >
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blog Title *
                    </label>
                    <input
                      type="text"
                      value={blogData.title}
                      onChange={(e) => setBlogData({ ...blogData, title: e.target.value })}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                      placeholder="Enter an engaging blog title..."
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={blogData.category}
                      onChange={(e) => setBlogData({ ...blogData, category: e.target.value })}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="mental-health">🧠 Mental Health</option>
                      <option value="career">💼 Career Development</option>
                      <option value="relationship">❤️ Relationships</option>
                      <option value="life-coaching">🚀 Life Coaching</option>
                      <option value="academic">🎓 Academic Support</option>
                      <option value="health-wellness">💚 Health & Wellness</option>
                    </select>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brief Summary (Excerpt) *
                    </label>
                    <textarea
                      value={blogData.excerpt}
                      onChange={(e) => setBlogData({ ...blogData, excerpt: e.target.value })}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows="3"
                      placeholder="Write a compelling summary that will appear in blog previews..."
                      maxLength="300"
                      required
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {blogData.excerpt.length}/300 characters
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blog Content *
                    </label>
                    <textarea
                      value={blogData.content}
                      onChange={(e) => setBlogData({ ...blogData, content: e.target.value })}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows="15"
                      placeholder="Write your blog content here. You can use HTML tags for formatting..."
                      required
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      defaultValue={blogData.tags.join(', ')}
                      placeholder="anxiety, mental health, wellness, tips..."
                      onChange={(e) =>
                        setBlogData({
                          ...blogData,
                          tags: e.target.value
                            .split(',')
                            .map((tag) => tag.trim())
                            .filter((tag) => tag),
                        })
                      }
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Featured Image
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Featured Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={blogData.featuredImage}
                      onChange={(e) => setBlogData({...blogData, featuredImage: e.target.value})}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="https://example.com/your-image.jpg"
                    />
                  </div> */}

                  {/* Options */}
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Publish Status
                      </label>
                      <select
                        value={blogData.status}
                        onChange={(e) => setBlogData({ ...blogData, status: e.target.value })}
                        className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="draft">📝 Save as Draft</option>
                        <option value="published">🚀 Publish Now</option>
                      </select>
                    </div>

                    <div className="flex items-center mt-6">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={blogData.featured}
                        onChange={(e) => setBlogData({ ...blogData, featured: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700">
                        ⭐ Feature this blog
                      </label>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-6">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="flex-1 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {formLoading ? (
                        <>
                          <FaSpinner className="animate-spin inline mr-2" /> Processing...
                        </>
                      ) : (
                        <>
                          <FaSave className="inline mr-2" />
                          {currentView === 'create'
                            ? blogData.status === 'published'
                              ? 'Publish Blog'
                              : 'Save Draft'
                            : 'Update Blog'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setCurrentView('list');
                      }}
                      className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                    >
                      <FaTimes className="inline mr-2" />
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* BLOG VIEW */}
          {currentView === 'view' && selectedBlog && (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                {selectedBlog.featuredImage && (
                  <div className="h-64 md:h-96 overflow-hidden">
                    <img
                      src={selectedBlog.featuredImage}
                      alt={selectedBlog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          selectedBlog.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : selectedBlog.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {selectedBlog.status.toUpperCase()}
                      </span>
                      {selectedBlog.featured && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">
                          FEATURED
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditBlog(selectedBlog)}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                      >
                        <FaEdit className="inline mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(selectedBlog._id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                      >
                        <FaTrash className="inline mr-1" /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    {selectedBlog.title}
                  </h1>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-200">
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FaEye className="mr-1" />
                        {selectedBlog.views || 0} views
                      </div>
                      <div className="flex items-center">
                        <FaHeart className="mr-1" />
                        {selectedBlog.likes?.length || 0} likes
                      </div>
                      <div className="flex items-center">
                        <FaComment className="mr-1" />
                        {selectedBlog.comments?.length || 0} comments
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Created: {new Date(selectedBlog.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="prose prose-lg max-w-none mb-8">
                    <div dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
                  </div>

                  {/* Tags */}
                  {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-3">Tags:</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedBlog.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BlogManagement;
