import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import {
  Brain,
  Briefcase,
  Heart,
  Compass,
  GraduationCap,
  Activity,
  Star,
  Sparkles,
  FileText,
  Globe,
  CheckCircle2,
  Layers,
  BookOpen,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_ENDPOINTS } from '../../../config/api';
import api from '@/lib/axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const CounselorDashboardBlogManager = () => {
  const [searchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState(
    searchParams.get('action') === 'create' ? 'create' : 'list'
  );
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
    if (searchParams.get('action') === 'create') {
      setCurrentView('create');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchCounselorBlogs();
  }, []);

  // ✅ Fetch counselor's blogs using correct API endpoint
  const fetchCounselorBlogs = async () => {
    try {
      setLoading(true);

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

      const response = await api.get(
        `${API_ENDPOINTS.BLOGS_COUNSELOR_MY_BLOGS}?${params}`
      );

      const data = response.data;
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

      const response = await api.post(API_ENDPOINTS.BLOGS_CREATE, blogData);

      const data = response.data;
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

      const response = await api.put(
        `${API_ENDPOINTS.BLOGS_UPDATE}/${selectedBlog._id}`,
        blogData
      );

      const data = response.data;
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
      const response = await api.delete(`${API_ENDPOINTS.BLOGS_DELETE}/${blogId}`);

      const data = response.data;
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
                className="p-2.5 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm hover:shadow-md transition-all text-indigo-600 hover:bg-gray-50"
              >
                <FaArrowLeft className="text-indigo-600" />
              </button>
            )}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  {currentView === 'list'
                    ? 'Blog Management'
                    : currentView === 'create'
                      ? 'Create New Blog'
                      : currentView === 'edit'
                        ? 'Edit Blog'
                        : 'View Blog'}
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  {currentView === 'list'
                    ? 'Manage your published insights and build your professional presence'
                    : currentView === 'create'
                      ? 'Share your clinical expertise with your audience'
                      : currentView === 'edit'
                        ? 'Update and refine your blog content'
                        : 'Review your blog post'}
                </p>
              </div>
            </div>
          </div>

          {currentView === 'list' && (
            <button
              onClick={() => {
                resetForm();
                setCurrentView('create');
              }}
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg text-sm"
            >
              <FaPlus className="mr-2 text-xs" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
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
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search blogs by title or content..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                      <FaSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    </div>
                  </div>
                  <div className="w-full md:w-[200px]">
                    <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
                      <SelectTrigger className="w-full h-[42px] px-3.5 rounded-xl border border-gray-200 bg-white text-sm shadow-xs focus:ring-2 focus:ring-indigo-500">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent align="end" className="rounded-xl border border-gray-100 shadow-xl bg-white p-1">
                        <SelectItem value="all" className="rounded-lg cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gray-400" />
                            <span className="font-medium text-gray-700">All Status</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="published" className="rounded-lg cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="font-medium text-gray-700">Published</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="draft" className="rounded-lg cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="font-medium text-gray-700">Draft</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="archived" className="rounded-lg cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            <span className="font-medium text-gray-700">Archived</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-full text-xs font-semibold shadow-xs">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Blog Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={blogData.title}
                      onChange={(e) => setBlogData({ ...blogData, title: e.target.value })}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg bg-white"
                      placeholder="Enter an engaging blog title..."
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={blogData.category}
                      onValueChange={(val) => setBlogData({ ...blogData, category: val })}
                    >
                      <SelectTrigger className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm sm:text-base focus:ring-2 focus:ring-indigo-500">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-gray-100 shadow-xl bg-white p-1">
                        <SelectItem value="mental-health" className="rounded-lg cursor-pointer py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="p-1 rounded-md bg-teal-50 text-teal-600">
                              <Brain className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-gray-800">Mental Health</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="career" className="rounded-lg cursor-pointer py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="p-1 rounded-md bg-blue-50 text-blue-600">
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-gray-800">Career Development</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="relationship" className="rounded-lg cursor-pointer py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="p-1 rounded-md bg-rose-50 text-rose-600">
                              <Heart className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-gray-800">Relationships</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="life-coaching" className="rounded-lg cursor-pointer py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="p-1 rounded-md bg-purple-50 text-purple-600">
                              <Compass className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-gray-800">Life Coaching</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="academic" className="rounded-lg cursor-pointer py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="p-1 rounded-md bg-sky-50 text-sky-600">
                              <GraduationCap className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-gray-800">Academic Support</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="health-wellness" className="rounded-lg cursor-pointer py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
                              <Activity className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-gray-800">Health & Wellness</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Brief Summary (Excerpt) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={blogData.excerpt}
                      onChange={(e) => setBlogData({ ...blogData, excerpt: e.target.value })}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm sm:text-base"
                      rows="3"
                      placeholder="Write a compelling summary that will appear in blog previews..."
                      maxLength="300"
                      required
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {blogData.excerpt.length}/300 characters
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Blog Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={blogData.content}
                      onChange={(e) => setBlogData({ ...blogData, content: e.target.value })}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-mono text-sm leading-relaxed"
                      rows="15"
                      placeholder="Write your blog content here. You can use HTML tags for formatting..."
                      required
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm sm:text-base"
                    />
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-2xl border border-slate-200/80">
                    {/* Publish Status */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                        Publish Status
                      </label>
                      <Select
                        value={blogData.status}
                        onValueChange={(val) => setBlogData({ ...blogData, status: val })}
                      >
                        <SelectTrigger className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-gray-100 shadow-xl bg-white p-1">
                          <SelectItem value="draft" className="rounded-lg cursor-pointer py-2">
                            <div className="flex items-center gap-2.5">
                              <div className="p-1 rounded-md bg-amber-50 text-amber-600">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-semibold text-gray-800 block text-xs sm:text-sm">Save as Draft</span>
                                <span className="text-[11px] text-gray-400 block">Private while editing</span>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="published" className="rounded-lg cursor-pointer py-2">
                            <div className="flex items-center gap-2.5">
                              <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
                                <Globe className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-semibold text-gray-800 block text-xs sm:text-sm">Publish Now</span>
                                <span className="text-[11px] text-gray-400 block">Live for all readers</span>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Feature Toggle Card */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                        Promotional Visibility
                      </label>
                      <label
                        htmlFor="featured-switch"
                        className={`flex items-center justify-between p-2.5 px-3.5 rounded-xl border cursor-pointer transition-all duration-200 h-11 ${
                          blogData.featured
                            ? 'bg-amber-50/90 border-amber-300 text-amber-900 shadow-xs'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-1 rounded-lg transition-colors ${
                              blogData.featured ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            <Star
                              className={`w-4 h-4 transition-all ${
                                blogData.featured ? 'fill-amber-400 text-amber-500' : ''
                              }`}
                            />
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-semibold block leading-tight select-none">Feature this blog</span>
                            <span className="text-[10px] text-gray-500 block leading-tight select-none">Highlight in hero showcase</span>
                          </div>
                        </div>
                        <Switch
                          id="featured-switch"
                          checked={Boolean(blogData.featured)}
                          onCheckedChange={(checked) =>
                            setBlogData((prev) => ({ ...prev, featured: Boolean(checked) }))
                          }
                        />
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

export default CounselorDashboardBlogManager;
