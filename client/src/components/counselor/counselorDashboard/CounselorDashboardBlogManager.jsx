import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Plus,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Search,
  Filter,
  Save,
  X,
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  RotateCcw,
  Loader2,
  Tag,
  Image as ImageIcon,
  Flame,
  AlertTriangle,
  TrendingUp,
  UploadCloud,
  Upload,
  Link as LinkIcon,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '../../../config/api';
import api from '@/lib/axios';

// shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

// Category Definitions with Icons & Theme Badges
const CATEGORY_META = {
  'mental-health': {
    label: 'Mental Health',
    icon: Brain,
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
    iconBg: 'bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-300',
  },
  career: {
    label: 'Career Development',
    icon: Briefcase,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300',
  },
  relationship: {
    label: 'Relationships',
    icon: Heart,
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300',
  },
  'life-coaching': {
    label: 'Life Coaching',
    icon: Compass,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    iconBg: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300',
  },
  academic: {
    label: 'Academic Support',
    icon: GraduationCap,
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    iconBg: 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-300',
  },
  'health-wellness': {
    label: 'Health & Wellness',
    icon: Activity,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300',
  },
};

const getCategoryMeta = (catKey) => {
  return CATEGORY_META[catKey] || {
    label: catKey ? catKey.replace('-', ' ').toUpperCase() : 'General',
    icon: BookOpen,
    badgeColor: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-neutral-800 dark:text-slate-300 dark:border-neutral-700',
    iconBg: 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-slate-400',
  };
};

const CounselorDashboardBlogManager = () => {
  const [searchParams] = useSearchParams();
  const [currentView, setCurrentView] = useState(
    searchParams.get('action') === 'create' ? 'create' : 'list'
  );
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [deleteModalBlog, setDeleteModalBlog] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // File Upload & Cover Image state
  const fileInputRef = useRef(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'url'

  const [blogData, setBlogData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'mental-health',
    tags: [],
    tagInput: '',
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
        setBlogs(data.data.docs || data.data || []);
      } else {
        toast.error('Failed to load blogs', {
          description: data.message || 'Could not retrieve your blog posts.',
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
  };

  const handleImageFileSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid File Type', {
        description: 'Please select a valid image file (PNG, JPG, JPEG, WEBP).',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File Too Large', {
        description: 'Cover image must be 5MB or smaller.',
      });
      return;
    }

    setCoverImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setCoverImagePreview(previewUrl);
    setBlogData((prev) => ({ ...prev, featuredImage: '' }));
  };

  const handleRemoveCoverImage = () => {
    if (coverImagePreview && coverImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(coverImagePreview);
    }
    setCoverImageFile(null);
    setCoverImagePreview('');
    setBlogData((prev) => ({ ...prev, featuredImage: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleCreateBlog = async (e) => {
    e.preventDefault();

    if (!blogData.title.trim()) {
      toast.error('Validation Error', { description: 'Please enter a blog title.' });
      return;
    }
    if (!blogData.excerpt.trim()) {
      toast.error('Validation Error', { description: 'Please enter a brief summary / excerpt.' });
      return;
    }
    if (!blogData.content.trim()) {
      toast.error('Validation Error', { description: 'Please write the blog content.' });
      return;
    }

    try {
      setFormLoading(true);

      const formData = new FormData();
      formData.append('title', blogData.title.trim());
      formData.append('content', blogData.content.trim());
      formData.append('excerpt', blogData.excerpt.trim());
      formData.append('category', blogData.category);
      formData.append('status', blogData.status);
      formData.append('featured', String(Boolean(blogData.featured)));
      formData.append('tags', JSON.stringify(blogData.tags || []));

      if (coverImageFile) {
        formData.append('coverImage', coverImageFile);
      } else if (blogData.featuredImage?.trim()) {
        formData.append('featuredImage', blogData.featuredImage.trim());
      }

      const response = await api.post(API_ENDPOINTS.BLOGS_CREATE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = response.data;

      if (data.success) {
        toast.success('Blog Created Successfully!', {
          description: blogData.status === 'published' ? 'Your blog is now live for readers.' : 'Saved as a draft.',
        });
        await fetchCounselorBlogs();
        resetForm();
        setCurrentView('list');
      } else {
        toast.error('Creation Failed', { description: data.message || 'Could not create blog.' });
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error('Creation Failed', {
        description: error.response?.data?.message || error.message || 'Failed to create blog',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateBlog = async (e) => {
    e.preventDefault();

    if (!blogData.title.trim()) {
      toast.error('Validation Error', { description: 'Please enter a blog title.' });
      return;
    }

    try {
      setFormLoading(true);

      const formData = new FormData();
      formData.append('title', blogData.title.trim());
      formData.append('content', blogData.content.trim());
      formData.append('excerpt', blogData.excerpt.trim());
      formData.append('category', blogData.category);
      formData.append('status', blogData.status);
      formData.append('featured', String(Boolean(blogData.featured)));
      formData.append('tags', JSON.stringify(blogData.tags || []));

      if (coverImageFile) {
        formData.append('coverImage', coverImageFile);
      } else {
        formData.append('featuredImage', blogData.featuredImage || '');
      }

      const response = await api.put(
        `${API_ENDPOINTS.BLOGS_UPDATE}/${selectedBlog._id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      const data = response.data;
      if (data.success) {
        toast.success('Blog Updated Successfully!', {
          description: 'Your changes have been saved.',
        });
        await fetchCounselorBlogs();
        setCurrentView('list');
      } else {
        toast.error('Update Failed', { description: data.message || 'Could not update blog.' });
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error('Update Failed', {
        description: error.response?.data?.message || error.message || 'Failed to update blog',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDeleteBlog = async () => {
    if (!deleteModalBlog) return;

    try {
      setIsDeleting(true);
      const response = await api.delete(`${API_ENDPOINTS.BLOGS_DELETE}/${deleteModalBlog._id}`);
      const data = response.data;

      if (data.success) {
        toast.success('Blog Deleted', { description: `"${deleteModalBlog.title}" has been deleted.` });
        await fetchCounselorBlogs();
        if (selectedBlog && selectedBlog._id === deleteModalBlog._id) {
          setCurrentView('list');
        }
      } else {
        toast.error('Delete Failed', { description: data.message || 'Could not delete blog.' });
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Delete Failed', {
        description: error.response?.data?.message || error.message || 'Failed to delete blog',
      });
    } finally {
      setIsDeleting(false);
      setDeleteModalBlog(null);
    }
  };

  const handleEditBlog = (blog) => {
    setSelectedBlog(blog);
    setBlogData({
      title: blog.title || '',
      content: blog.content || '',
      excerpt: blog.excerpt || '',
      category: blog.category || 'mental-health',
      tags: blog.tags || [],
      tagInput: '',
      featuredImage: blog.featuredImage || '',
      status: blog.status || 'draft',
      featured: Boolean(blog.featured),
    });
    setCoverImageFile(null);
    setCoverImagePreview(blog.featuredImage || '');
    setImageTab('upload');
    setCurrentView('edit');
  };

  const handleViewBlog = (blog) => {
    setSelectedBlog(blog);
    setCurrentView('view');
  };

  const resetForm = () => {
    setBlogData({
      title: '',
      content: '',
      excerpt: '',
      category: 'mental-health',
      tags: [],
      tagInput: '',
      featuredImage: '',
      status: 'draft',
      featured: false,
    });
    if (coverImagePreview && coverImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(coverImagePreview);
    }
    setCoverImageFile(null);
    setCoverImagePreview('');
    setImageTab('upload');
    setSelectedBlog(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = blogData.tagInput?.trim().replace(/^#/, '');
      if (val && !blogData.tags.includes(val)) {
        setBlogData((prev) => ({
          ...prev,
          tags: [...prev.tags, val],
          tagInput: '',
        }));
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setBlogData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (blogs.length > 0) {
        fetchCounselorBlogs();
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    if (blogs.length > 0) {
      fetchCounselorBlogs();
    }
  }, [statusFilter]);

  // Client filtering
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      !searchTerm ||
      blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || blog.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate live stats
  const stats = {
    total: blogs.length,
    published: blogs.filter((b) => b.status === 'published').length,
    draft: blogs.filter((b) => b.status === 'draft').length,
    views: blogs.reduce((sum, b) => sum + (b.views || 0), 0),
    likes: blogs.reduce((sum, b) => sum + (b.likes?.length || 0), 0),
  };

  const getReadingTime = (content) => {
    if (!content) return '1 min read';
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {currentView !== 'list' ? (
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                resetForm();
                setCurrentView('list');
              }}
              className="h-10 w-10 rounded-xl bg-white dark:bg-neutral-900 shadow-sm shrink-0"
              title="Back to Blogs"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : (
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/60 flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight flex items-center gap-2">
              <span>
                {currentView === 'list'
                  ? 'Blog Management'
                  : currentView === 'create'
                  ? 'Create New Blog Post'
                  : currentView === 'edit'
                  ? 'Edit Blog Post'
                  : 'Article Preview'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              {currentView === 'list'
                ? 'Manage your published insights and build your professional presence'
                : currentView === 'create'
                ? 'Share your clinical expertise, therapeutic insights, and wellness tips'
                : currentView === 'edit'
                ? 'Refine and update your published content or draft'
                : 'Review formatted article layout as seen by your readers'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {currentView === 'list' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchCounselorBlogs()}
                disabled={loading}
                className="h-9 gap-1.5 bg-white dark:bg-neutral-900 shadow-xs text-xs font-medium"
              >
                <RotateCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  resetForm();
                  setCurrentView('create');
                }}
                className="h-9 gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-sm transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create New Post</span>
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetForm();
                setCurrentView('list');
              }}
              className="h-9 gap-1.5 text-xs bg-white dark:bg-neutral-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Articles</span>
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ====================================================
            VIEW: BLOGS LIST
        ==================================================== */}
        {currentView === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Analytics Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {/* Total Posts */}
              <Card className="bg-white dark:bg-neutral-900 border-slate-200/90 dark:border-neutral-800 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 shrink-0">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Posts</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {stats.total}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Published */}
              <Card className="bg-white dark:bg-neutral-900 border-emerald-200/80 dark:border-emerald-900/40 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Published</p>
                    <p className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-200">
                      {stats.published}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Drafts */}
              <Card className="bg-white dark:bg-neutral-900 border-amber-200/80 dark:border-amber-900/40 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 shrink-0">
                    <Edit className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Drafts</p>
                    <p className="text-xl sm:text-2xl font-bold text-amber-900 dark:text-amber-200">
                      {stats.draft}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Total Views */}
              <Card className="bg-white dark:bg-neutral-900 border-purple-200/80 dark:border-purple-900/40 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 shrink-0">
                    <Eye className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-400">Total Views</p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-200">
                      {stats.views}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Total Likes */}
              <Card className="bg-white dark:bg-neutral-900 border-rose-200/80 dark:border-rose-900/40 shadow-sm col-span-2 sm:col-span-1">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 shrink-0">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-rose-700 dark:text-rose-400">Total Likes</p>
                    <p className="text-xl sm:text-2xl font-bold text-rose-900 dark:text-rose-200">
                      {stats.likes}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search & Filter Bar */}
            <Card className="bg-white dark:bg-neutral-900 border-slate-200/90 dark:border-neutral-800 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search articles by title, summary, or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-9 h-10 text-xs sm:text-sm bg-slate-50/60 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 rounded-xl"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Category Filter */}
                  <div className="w-full md:w-48">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="h-10 text-xs sm:text-sm rounded-xl bg-slate-50/60 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 dark:border-neutral-800">
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.entries(CATEGORY_META).map(([key, meta]) => (
                          <SelectItem key={key} value={key}>
                            {meta.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div className="w-full md:w-44">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-10 text-xs sm:text-sm rounded-xl bg-slate-50/60 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 dark:border-neutral-800">
                        <SelectItem value="all">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            <span>All Status</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="published">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Published</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="draft">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>Draft</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="archived">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            <span>Archived</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Articles Grid / Loading / Empty States */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800">
                <Loader2 className="h-8 w-8 text-primary-600 animate-spin mb-3" />
                <p className="text-sm text-neutral-500">Loading your articles...</p>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <Card className="bg-white dark:bg-neutral-900 border-slate-200/90 dark:border-neutral-800 py-16 text-center shadow-sm">
                <CardContent className="flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center border border-primary-100 dark:border-primary-900">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      No Articles Found
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                        ? 'No blogs match your current search or filters. Try adjusting your query.'
                        : 'Start writing your first clinical insight or wellness article to connect with clients.'}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      resetForm();
                      setCurrentView('create');
                    }}
                    className="gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-sm h-10 px-5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Your First Blog</span>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBlogs.map((blog) => {
                  const catMeta = getCategoryMeta(blog.category);
                  const CatIcon = catMeta.icon;

                  return (
                    <div
                      key={blog._id}
                      className={`relative rounded-2xl bg-white dark:bg-neutral-900 border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden group ${
                        blog.status === 'published'
                          ? 'border-emerald-200/90 dark:border-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-700'
                          : blog.status === 'draft'
                          ? 'border-amber-200/90 dark:border-amber-900/50 hover:border-amber-300 dark:hover:border-amber-700'
                          : 'border-slate-200 dark:border-neutral-800'
                      }`}
                    >
                      {/* Cover Image or Fallback Gradient */}
                      <div className="h-44 sm:h-48 w-full relative overflow-hidden bg-slate-100 dark:bg-neutral-800">
                        {blog.featuredImage ? (
                          <img
                            src={blog.featuredImage}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-50/60 via-slate-100 to-indigo-50/50 dark:from-neutral-800 dark:to-neutral-850 text-slate-400">
                            <CatIcon className="h-10 w-10 text-primary-400 dark:text-primary-600 mb-1.5" />
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              {catMeta.label}
                            </span>
                          </div>
                        )}

                        {/* Top Overlay Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] gap-1 font-semibold backdrop-blur-md shadow-xs ${
                              blog.status === 'published'
                                ? 'bg-emerald-500/90 text-white'
                                : blog.status === 'draft'
                                ? 'bg-amber-500/90 text-white'
                                : 'bg-slate-500/90 text-white'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            {blog.status?.toUpperCase()}
                          </Badge>

                          {blog.featured && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 shadow-md backdrop-blur-md">
                              <Star className="h-3 w-3 fill-amber-950" />
                              FEATURED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          {/* Category Tag & Read Time */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 dark:text-primary-400">
                              <CatIcon className="h-3 w-3" />
                              {catMeta.label}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getReadingTime(blog.content)}
                            </span>
                          </div>

                          {/* Title */}
                          <h3
                            onClick={() => handleViewBlog(blog)}
                            className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          >
                            {blog.title}
                          </h3>

                          {/* Excerpt */}
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {blog.excerpt || 'No summary provided.'}
                          </p>
                        </div>

                        {/* Metrics & Date */}
                        <div className="pt-2 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-3.5">
                            <span className="flex items-center gap-1 text-[11px]" title="Views">
                              <Eye className="h-3.5 w-3.5 text-slate-400" />
                              {blog.views || 0}
                            </span>
                            <span className="flex items-center gap-1 text-[11px]" title="Likes">
                              <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/20" />
                              {blog.likes?.length || 0}
                            </span>
                            <span className="flex items-center gap-1 text-[11px]" title="Comments">
                              <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                              {blog.comments?.length || 0}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(blog.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer: Action Buttons */}
                      <div className="p-3 bg-slate-50/70 dark:bg-neutral-850 border-t border-slate-100 dark:border-neutral-800/80 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewBlog(blog)}
                          className="flex-1 h-8 text-xs gap-1.5 bg-white dark:bg-neutral-900 shadow-2xs font-medium"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditBlog(blog)}
                          className="flex-1 h-8 text-xs gap-1.5 bg-white dark:bg-neutral-900 shadow-2xs text-primary-700 dark:text-primary-300 font-medium"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteModalBlog(blog)}
                          className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 shrink-0"
                          title="Delete Article"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ====================================================
            VIEW: CREATE / EDIT BLOG FORM
        ==================================================== */}
        {(currentView === 'create' || currentView === 'edit') && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            <form onSubmit={currentView === 'create' ? handleCreateBlog : handleUpdateBlog}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area (2 Cols) */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-white dark:bg-neutral-900 border-slate-200/90 dark:border-neutral-800 shadow-sm">
                    <CardHeader className="pb-4 border-b border-slate-100 dark:border-neutral-800">
                      <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <FileText className="h-4 w-4 text-primary-600" />
                        Article Details
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Provide a compelling headline and detailed therapeutic content for your audience.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 sm:p-6 space-y-5">
                      {/* Title */}
                      <div className="space-y-1.5">
                        <Label htmlFor="blog-title" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Article Title <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                          id="blog-title"
                          type="text"
                          value={blogData.title}
                          onChange={(e) => setBlogData({ ...blogData, title: e.target.value })}
                          placeholder="e.g., 5 Practical Techniques to Overcome Workplace Anxiety"
                          className="h-11 text-sm bg-slate-50/50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 rounded-xl"
                          required
                        />
                      </div>

                      {/* Excerpt */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="blog-excerpt" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Summary / Excerpt <span className="text-rose-500">*</span>
                          </Label>
                          <span className={`text-[11px] ${blogData.excerpt?.length > 280 ? 'text-amber-600' : 'text-slate-400'}`}>
                            {blogData.excerpt?.length || 0}/300
                          </span>
                        </div>
                        <Textarea
                          id="blog-excerpt"
                          rows={3}
                          maxLength={300}
                          value={blogData.excerpt}
                          onChange={(e) => setBlogData({ ...blogData, excerpt: e.target.value })}
                          placeholder="Write a clear 2-3 sentence overview that attracts clients and readers..."
                          className="text-xs sm:text-sm bg-slate-50/50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 rounded-xl resize-none leading-relaxed"
                          required
                        />
                      </div>

                      {/* Content Body */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="blog-content" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Full Article Content <span className="text-rose-500">*</span>
                          </Label>
                          <span className="text-[11px] text-slate-400">
                            {getReadingTime(blogData.content)} (~{blogData.content?.split(/\s+/).filter(Boolean).length || 0} words)
                          </span>
                        </div>
                        <Textarea
                          id="blog-content"
                          rows={14}
                          value={blogData.content}
                          onChange={(e) => setBlogData({ ...blogData, content: e.target.value })}
                          placeholder="Write your clinical advice, strategies, case studies, or wellness tips here. Use paragraphs and bullet points for readability..."
                          className="text-xs sm:text-sm bg-slate-50/50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 rounded-xl leading-relaxed font-sans"
                          required
                        />
                      </div>

                      {/* Tags */}
                      <div className="space-y-2">
                        <Label htmlFor="blog-tags" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 text-primary-600" />
                          Topics & Tags
                        </Label>
                        <Input
                          id="blog-tags"
                          type="text"
                          value={blogData.tagInput || ''}
                          onChange={(e) => setBlogData({ ...blogData, tagInput: e.target.value })}
                          onKeyDown={handleAddTag}
                          placeholder="Type a tag and press Enter (e.g. StressManagement, CBT, SelfCare)..."
                          className="h-10 text-xs sm:text-sm bg-slate-50/50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 rounded-xl"
                        />
                        {blogData.tags && blogData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {blogData.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs gap-1.5 py-1 px-2.5 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                              >
                                #{tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="text-primary-400 hover:text-primary-700 dark:hover:text-primary-200"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar Controls (1 Col) */}
                <div className="space-y-6">
                  {/* Category Selection Card */}
                  <Card className="bg-white dark:bg-neutral-900 border-slate-200/90 dark:border-neutral-800 shadow-sm">
                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-neutral-800">
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Category & Focus
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          Select Practice Field <span className="text-rose-500">*</span>
                        </Label>
                        <Select
                          value={blogData.category}
                          onValueChange={(val) => setBlogData({ ...blogData, category: val })}
                        >
                          <SelectTrigger className="h-10 text-xs sm:text-sm rounded-xl bg-slate-50/60 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700">
                            <SelectValue placeholder="Choose a category" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 dark:border-neutral-800">
                            {Object.entries(CATEGORY_META).map(([key, meta]) => {
                              const Icon = meta.icon;
                              return (
                                <SelectItem key={key} value={key} className="cursor-pointer py-2">
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-3.5 w-3.5 text-primary-600 shrink-0" />
                                    <span>{meta.label}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Featured Cover Image */}
                  <Card className="bg-white dark:bg-neutral-900 border-slate-200/90 dark:border-neutral-800 shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-neutral-800">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-primary-600" />
                          Cover Image
                        </CardTitle>
                        {/* Tab Toggle: Upload vs URL */}
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-neutral-800 p-0.5 rounded-lg text-[11px] font-medium">
                          <button
                            type="button"
                            onClick={() => setImageTab('upload')}
                            className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 ${
                              imageTab === 'upload'
                                ? 'bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-xs font-semibold'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                            }`}
                          >
                            <Upload className="h-3 w-3" />
                            Upload
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageTab('url')}
                            className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 ${
                              imageTab === 'url'
                                ? 'bg-white dark:bg-neutral-700 text-primary-600 dark:text-primary-400 shadow-xs font-semibold'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                            }`}
                          >
                            <LinkIcon className="h-3 w-3" />
                            URL
                          </button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-3">
                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageFileSelect(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />

                      {/* Image Preview Available */}
                      {coverImagePreview ? (
                        <div className="space-y-2">
                          <div className="relative h-36 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-neutral-700 bg-slate-950 group">
                            <img
                              src={coverImagePreview}
                              alt="Cover Preview"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-7 text-xs bg-white/90 hover:bg-white text-slate-800 shadow-sm gap-1.5"
                              >
                                <Upload className="h-3 w-3" />
                                Change
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={handleRemoveCoverImage}
                                className="h-7 text-xs shadow-sm gap-1.5"
                              >
                                <Trash2 className="h-3 w-3" />
                                Remove
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                            <span className="truncate max-w-[180px]">
                              {coverImageFile ? coverImageFile.name : 'Cover image selected'}
                            </span>
                            {coverImageFile && (
                              <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400">
                                {(coverImageFile.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Upload Mode Dropzone */}
                          {imageTab === 'upload' && (
                            <div
                              onClick={() => fileInputRef.current?.click()}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              className={`p-5 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                                isDragging
                                  ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30 ring-2 ring-primary-500/20'
                                  : 'border-slate-200 hover:border-primary-400 dark:border-neutral-700 dark:hover:border-primary-600 bg-slate-50/50 hover:bg-slate-50 dark:bg-neutral-800/30 dark:hover:bg-neutral-800/60'
                              }`}
                            >
                              <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-2 shadow-xs">
                                <UploadCloud className="h-5 w-5" />
                              </div>
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-0.5">
                                Click to upload from device
                              </p>
                              <p className="text-[11px] text-slate-400">or drag & drop your image here</p>
                              <div className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-neutral-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-neutral-700">
                                PNG, JPG, WEBP (Max 5MB)
                              </div>
                            </div>
                          )}

                          {/* URL Mode Input */}
                          {imageTab === 'url' && (
                            <div className="space-y-2">
                              <div className="space-y-1.5">
                                <Label htmlFor="image-url" className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                  Direct Image URL
                                </Label>
                                <Input
                                  id="image-url"
                                  type="url"
                                  value={blogData.featuredImage}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setBlogData({ ...blogData, featuredImage: val });
                                    setCoverImagePreview(val);
                                    setCoverImageFile(null);
                                  }}
                                  placeholder="https://images.unsplash.com/photo-..."
                                  className="h-10 text-xs bg-slate-50/50 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700 rounded-xl"
                                />
                              </div>
                              <p className="text-[11px] text-slate-400">
                                Paste a direct HTTPS link to any high-res image
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Publishing Status & Promotion */}
                  <Card className="bg-white dark:bg-neutral-900 border-slate-200/90 dark:border-neutral-800 shadow-sm">
                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-neutral-800">
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Publishing Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      {/* Status */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          Visibility
                        </Label>
                        <Select
                          value={blogData.status}
                          onValueChange={(val) => setBlogData({ ...blogData, status: val })}
                        >
                          <SelectTrigger className="h-10 text-xs sm:text-sm rounded-xl bg-slate-50/60 dark:bg-neutral-800/60 border-slate-200 dark:border-neutral-700">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 dark:border-neutral-800">
                            <SelectItem value="draft" className="cursor-pointer py-2">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                <div>
                                  <span className="font-semibold block text-xs">Save as Draft</span>
                                  <span className="text-[10px] text-slate-400">Only visible to you</span>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="published" className="cursor-pointer py-2">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <div>
                                  <span className="font-semibold block text-xs">Publish Publicly</span>
                                  <span className="text-[10px] text-slate-400">Live for all readers</span>
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Featured Switch */}
                      <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <Label htmlFor="feat-switch" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center gap-1.5">
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
                            Feature this Article
                          </Label>
                          <p className="text-[10px] text-slate-400">
                            Showcase in the hero section
                          </p>
                        </div>
                        <Switch
                          id="feat-switch"
                          checked={Boolean(blogData.featured)}
                          onCheckedChange={(checked) =>
                            setBlogData((prev) => ({ ...prev, featured: Boolean(checked) }))
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit Actions */}
                  <div className="space-y-2">
                    <Button
                      type="submit"
                      disabled={formLoading}
                      className="w-full h-11 gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all"
                    >
                      {formLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Saving Article...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>
                            {currentView === 'create'
                              ? blogData.status === 'published'
                                ? 'Publish Article'
                                : 'Save as Draft'
                              : 'Save Changes'}
                          </span>
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetForm();
                        setCurrentView('list');
                      }}
                      className="w-full h-10 text-xs bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        )}

        {/* ====================================================
            VIEW: ARTICLE DETAIL / PREVIEW
        ==================================================== */}
        {currentView === 'view' && selectedBlog && (
          <motion.div
            key="view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <Card className="bg-white dark:bg-neutral-900 border-slate-200/90 dark:border-neutral-800 shadow-md overflow-hidden">
              {/* Cover Image Banner */}
              {selectedBlog.featuredImage && (
                <div className="h-64 sm:h-80 md:h-96 w-full overflow-hidden relative">
                  <img
                    src={selectedBlog.featuredImage}
                    alt={selectedBlog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <CardContent className="p-6 sm:p-8 space-y-6">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-xs gap-1 font-semibold ${
                        selectedBlog.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {selectedBlog.status?.toUpperCase()}
                    </Badge>

                    {selectedBlog.featured && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        FEATURED
                      </span>
                    )}

                    <Badge variant="secondary" className="text-xs">
                      {getCategoryMeta(selectedBlog.category).label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditBlog(selectedBlog)}
                      className="h-8 gap-1.5 text-xs text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800 bg-primary-50/60 dark:bg-primary-950/40"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit Article</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteModalBlog(selectedBlog)}
                      className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Article Headline */}
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {selectedBlog.title}
                  </h1>
                  {selectedBlog.excerpt && (
                    <p className="text-base text-slate-600 dark:text-slate-300 mt-3 font-medium leading-relaxed italic border-l-4 border-primary-500 pl-3">
                      "{selectedBlog.excerpt}"
                    </p>
                  )}
                </div>

                {/* Read metrics */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 py-3 border-y border-slate-100 dark:border-neutral-800">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(selectedBlog.createdAt).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {getReadingTime(selectedBlog.content)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                      {selectedBlog.views || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-rose-500" />
                      {selectedBlog.likes?.length || 0} likes
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                      {selectedBlog.comments?.length || 0} comments
                    </span>
                  </div>
                </div>

                {/* Article Content */}
                <div className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed space-y-4 whitespace-pre-wrap font-sans">
                  {selectedBlog.content}
                </div>

                {/* Tag Pills */}
                {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                  <div className="pt-6 border-t border-slate-100 dark:border-neutral-800 space-y-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Related Topics
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedBlog.tags.map((tag, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================
          MODAL: DELETE BLOG CONFIRMATION
      ==================================================== */}
      <Dialog open={Boolean(deleteModalBlog)} onOpenChange={(open) => !open && setDeleteModalBlog(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800">
          <DialogHeader>
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2 border border-rose-200 dark:border-rose-900">
              <Trash2 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Delete Article
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">"{deleteModalBlog?.title}"</strong>? This action cannot be undone and will remove the article from the public blog.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModalBlog(null)}
              disabled={isDeleting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmDeleteBlog}
              disabled={isDeleting}
              className="text-xs gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Confirm Delete</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CounselorDashboardBlogManager;
