// components/admin/AdminBlogsManagement.jsx - Modern, Responsive Admin Blog & Featured Management

import { useState, useEffect, useTransition } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import {
  BookOpen,
  Search,
  Filter,
  Star,
  Sparkles,
  Heart,
  MessageSquare,
  Eye,
  Clock,
  Trash2,
  ExternalLink,
  RotateCcw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  Calendar,
  AlertCircle,
  X,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Category theme mapping matching Solvit design
const CATEGORY_THEMES = {
  'mental-health': {
    label: 'Mental Health',
    icon: '🧠',
    badge: 'bg-teal-50 text-teal-700 border-teal-200/80',
    gradient: 'from-teal-500/15 via-emerald-500/10 to-teal-700/15',
  },
  career: {
    label: 'Career & Work',
    icon: '💼',
    badge: 'bg-blue-50 text-blue-700 border-blue-200/80',
    gradient: 'from-blue-500/15 via-indigo-500/10 to-blue-700/15',
  },
  relationship: {
    label: 'Relationships',
    icon: '❤️',
    badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
    gradient: 'from-rose-500/15 via-pink-500/10 to-rose-700/15',
  },
  'life-coaching': {
    label: 'Personal Growth',
    icon: '🌱',
    badge: 'bg-purple-50 text-purple-700 border-purple-200/80',
    gradient: 'from-purple-500/15 via-violet-500/10 to-purple-700/15',
  },
  academic: {
    label: 'Academic Support',
    icon: '🎓',
    badge: 'bg-sky-50 text-sky-700 border-sky-200/80',
    gradient: 'from-sky-500/15 via-cyan-500/10 to-sky-700/15',
  },
  'health-wellness': {
    label: 'Health & Wellness',
    icon: '🌿',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    gradient: 'from-emerald-500/15 via-teal-500/10 to-emerald-700/15',
  },
};

const getCategoryTheme = (category) => {
  const norm = category?.toLowerCase()?.trim() || '';
  return (
    CATEGORY_THEMES[norm] || {
      label: category ? category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'General',
      icon: '✨',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      gradient: 'from-slate-500/10 via-blue-500/10 to-indigo-700/10',
    }
  );
};

const AdminBlogsManagement = () => {
  const { getAllBlogsAdmin, toggleBlogFeaturedAdmin, deleteBlogAdmin } = useAdminAuth();

  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    featuredBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalDocs: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);

  // Action loading states
  const [togglingBlogId, setTogglingBlogId] = useState(null);
  const [deleteDialogBlog, setDeleteDialogBlog] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBlogs();
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter, statusFilter, featuredFilter, sortBy, currentPage]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await getAllBlogsAdmin({
        page: currentPage,
        limit: 12,
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter,
        featured: featuredFilter,
        sort: sortBy,
      });

      if (res.success && res.data) {
        setBlogs(res.data.blogs || []);
        if (res.data.stats) setStats(res.data.stats);
        if (res.data.pagination) setPagination(res.data.pagination);
      } else {
        toast.error('Failed to load blogs', {
          description: res.error || 'Could not retrieve blogs from server.',
        });
      }
    } catch (err) {
      console.error('Error fetching admin blogs:', err);
      toast.error('Error fetching blogs');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Featured Handler
  const handleToggleFeatured = async (blog) => {
    const previousState = blog.featured;
    const targetBlogId = blog._id;

    // Optimistic update
    setBlogs((prev) =>
      prev.map((b) => (b._id === targetBlogId ? { ...b, featured: !previousState } : b))
    );
    setStats((prev) => ({
      ...prev,
      featuredBlogs: previousState
        ? Math.max(0, prev.featuredBlogs - 1)
        : prev.featuredBlogs + 1,
    }));
    setTogglingBlogId(targetBlogId);

    try {
      const res = await toggleBlogFeaturedAdmin(targetBlogId);
      if (res.success) {
        toast.success(
          !previousState ? '⭐ Article Featured Successfully!' : 'Article removed from Featured',
          {
            description: !previousState
              ? `"${blog.title}" is now showcased in the hero section.`
              : `"${blog.title}" is no longer featured.`,
          }
        );
      } else {
        // Rollback
        setBlogs((prev) =>
          prev.map((b) => (b._id === targetBlogId ? { ...b, featured: previousState } : b))
        );
        setStats((prev) => ({
          ...prev,
          featuredBlogs: previousState
            ? prev.featuredBlogs + 1
            : Math.max(0, prev.featuredBlogs - 1),
        }));
        toast.error('Failed to update featured status', {
          description: res.error || 'Server error occurred.',
        });
      }
    } catch (error) {
      console.error('Toggle featured error:', error);
      // Rollback
      setBlogs((prev) =>
        prev.map((b) => (b._id === targetBlogId ? { ...b, featured: previousState } : b))
      );
      toast.error('Failed to update featured status');
    } finally {
      setTogglingBlogId(null);
    }
  };

  // Delete Blog Handler
  const handleDeleteBlog = async () => {
    if (!deleteDialogBlog) return;

    try {
      setIsDeleting(true);
      const res = await deleteBlogAdmin(deleteDialogBlog._id);

      if (res.success) {
        toast.success('Blog deleted successfully');
        setBlogs((prev) => prev.filter((b) => b._id !== deleteDialogBlog._id));
        setStats((prev) => ({
          ...prev,
          totalBlogs: Math.max(0, prev.totalBlogs - 1),
          publishedBlogs:
            deleteDialogBlog.status === 'published'
              ? Math.max(0, prev.publishedBlogs - 1)
              : prev.publishedBlogs,
          featuredBlogs: deleteDialogBlog.featured
            ? Math.max(0, prev.featuredBlogs - 1)
            : prev.featuredBlogs,
        }));
        setDeleteDialogBlog(null);
      } else {
        toast.error('Failed to delete blog', {
          description: res.error || 'Something went wrong.',
        });
      }
    } catch (error) {
      console.error('Delete blog error:', error);
      toast.error('Failed to delete blog');
    } finally {
      setIsDeleting(false);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setFeaturedFilter('all');
    setSortBy('latest');
    setCurrentPage(1);
  };

  const isFiltering =
    searchTerm ||
    categoryFilter !== 'all' ||
    statusFilter !== 'all' ||
    featuredFilter !== 'all' ||
    sortBy !== 'latest';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Blog Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Manage clinical insights, review engagements, and feature top articles for the hero section
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBlogs}
            disabled={loading}
            className="h-9 gap-1.5 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Analytics / Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Blogs */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-all bg-white rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Articles
              </p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalBlogs || 0}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="font-semibold text-emerald-600">{stats.publishedBlogs || 0}</span> published
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Featured in Hero */}
        <Card className="border-amber-200/80 shadow-xs hover:shadow-md transition-all bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 rounded-2xl ring-1 ring-amber-200/60">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Featured in Hero
              </p>
              <p className="text-2xl font-bold text-amber-950">{stats.featuredBlogs || 0}</p>
              <p className="text-[11px] text-amber-600 font-medium">
                Active on public hero section
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
              <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        {/* Total Likes */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-all bg-white rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Reactions
              </p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalLikes || 0}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span className="font-semibold text-rose-600">{stats.totalComments || 0}</span> comments
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-6 h-6 fill-rose-500/20 text-rose-600" />
            </div>
          </CardContent>
        </Card>

        {/* Total Views */}
        <Card className="border-slate-200/80 shadow-xs hover:shadow-md transition-all bg-white rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Reader Views
              </p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalViews?.toLocaleString() || 0}</p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" /> Platform engagement
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5">
        {/* Row 1: Full-Width Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by article title, author name, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 h-11 text-xs sm:text-sm rounded-xl bg-slate-50/70 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Row 2: 2 Rows & 2 Columns of Select Filters (2x2 Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. Category Filter */}
          <div className="space-y-1">
            <Select
              value={categoryFilter}
              onValueChange={(val) => {
                setCategoryFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full h-10 text-xs sm:text-sm rounded-xl bg-slate-50/70 border-slate-200 hover:bg-slate-100/70 transition-colors">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_THEMES).map(([key, meta]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Featured Status Filter */}
          <div className="space-y-1">
            <Select
              value={featuredFilter}
              onValueChange={(val) => {
                setFeaturedFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full h-10 text-xs sm:text-sm rounded-xl bg-slate-50/70 border-slate-200 hover:bg-slate-100/70 transition-colors">
                <SelectValue placeholder="Featured Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                <SelectItem value="all">All Articles</SelectItem>
                <SelectItem value="true">⭐ Featured in Hero Only</SelectItem>
                <SelectItem value="false">Standard (Non-Featured)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 3. Publication Status Filter */}
          <div className="space-y-1">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full h-10 text-xs sm:text-sm rounded-xl bg-slate-50/70 border-slate-200 hover:bg-slate-100/70 transition-colors">
                <SelectValue placeholder="Publication Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published Publicly</SelectItem>
                <SelectItem value="draft">Draft (Private)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 4. Sort Options */}
          <div className="space-y-1">
            <Select
              value={sortBy}
              onValueChange={(val) => {
                setSortBy(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full h-10 text-xs sm:text-sm rounded-xl bg-slate-50/70 border-slate-200 hover:bg-slate-100/70 transition-colors">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                <SelectItem value="latest">🆕 Latest First</SelectItem>
                <SelectItem value="most_liked">🔥 Most Liked</SelectItem>
                <SelectItem value="most_commented">💬 Most Comments</SelectItem>
                <SelectItem value="most_viewed">👁️ Most Viewed</SelectItem>
                <SelectItem value="oldest">⏳ Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Summary & Quick Reset Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 pt-2.5 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <p>
              Showing <span className="font-semibold text-slate-900">{blogs.length}</span> of{' '}
              <span className="font-semibold text-slate-900">{pagination.totalDocs || 0}</span> total articles
            </p>
            {isFiltering && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 px-2 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
              >
                Reset All Filters
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-amber-200/60">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>Click the Star on any card to feature or unfeature an article</span>
          </div>
        </div>
      </div>

      {/* Blogs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-96 rounded-2xl bg-white border border-slate-200/80 p-5 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-44 bg-slate-100 rounded-xl w-full" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
              <div className="h-10 bg-slate-100 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No Articles Found</h3>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">
            {isFiltering
              ? 'No blog articles match your current search criteria or active filters.'
              : 'There are no blogs created on the platform yet.'}
          </p>
          {isFiltering && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs rounded-xl"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => {
            const theme = getCategoryTheme(blog.category);
            const isFeatured = Boolean(blog.featured);
            const isToggling = togglingBlogId === blog._id;
            const likesCount = Array.isArray(blog.likes) ? blog.likes.length : blog.likesCount || 0;
            const commentsCount = Array.isArray(blog.comments)
              ? blog.comments.length
              : blog.commentsCount || 0;
            const formattedDate = blog.createdAt
              ? dayjs(blog.createdAt).format('DD MMM YYYY')
              : 'Recent';

            return (
              <div
                key={blog._id}
                className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl ${
                  isFeatured
                    ? 'border-amber-300/80 ring-2 ring-amber-400/40 shadow-amber-500/5'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Card Top: Cover image or gradient header */}
                <div className="relative">
                  {blog.featuredImage ? (
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />
                    </div>
                  ) : (
                    <div
                      className={`relative h-32 w-full bg-gradient-to-br ${theme.gradient} border-b border-slate-100 p-4 flex flex-col justify-between overflow-hidden shrink-0`}
                    >
                      <div className="absolute -right-2 -bottom-2 text-6xl opacity-10 select-none pointer-events-none">
                        {theme.icon}
                      </div>
                    </div>
                  )}

                  {/* Badges on Header */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-md border shadow-xs ${theme.badge}`}
                    >
                      <span>{theme.icon}</span>
                      <span>{theme.label}</span>
                    </span>

                    <Badge
                      variant="secondary"
                      className={`text-[10px] font-semibold backdrop-blur-md shadow-xs ${
                        blog.status === 'published'
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-amber-500/90 text-white'
                      }`}
                    >
                      {blog.status?.toUpperCase()}
                    </Badge>
                  </div>

                  {/* ⭐ Interactive Star (Feature Toggle Button) */}
                  <div className="absolute top-3 right-3 z-10">
                    <TooltipProvider>
                      <Tooltip delayDuration={150}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            disabled={isToggling}
                            onClick={() => handleToggleFeatured(blog)}
                            aria-label={isFeatured ? 'Unfeature blog' : 'Feature blog'}
                            className={`p-2 rounded-xl transition-all duration-300 flex items-center gap-1.5 shadow-md ${
                              isFeatured
                                ? 'bg-amber-400 text-amber-950 hover:bg-amber-500 ring-2 ring-white/90 scale-105 animate-in zoom-in-75'
                                : 'bg-white/90 text-slate-400 hover:text-amber-500 hover:bg-white hover:scale-110 backdrop-blur-md ring-1 ring-slate-200/80'
                            }`}
                          >
                            {isToggling ? (
                              <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                            ) : (
                              <Star
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  isFeatured
                                    ? 'fill-amber-950 text-amber-950'
                                    : 'hover:fill-amber-400/40 hover:text-amber-500'
                                }`}
                              />
                            )}
                            {isFeatured && (
                              <span className="text-[10px] font-bold tracking-wider uppercase pr-0.5">
                                Featured
                              </span>
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="text-xs bg-slate-900 text-white">
                          <p>
                            {isFeatured
                              ? '⭐ Click to Remove from Hero section'
                              : '🌟 Click to Feature in Hero section'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    {/* Read time & Slug link */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {blog.readingTime || 4} min read
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                        /{blog.slug}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      <a
                        href={`/blogs/${blog.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-start gap-1"
                      >
                        <span>{blog.title}</span>
                      </a>
                    </h3>

                    {/* Excerpt */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                      {blog.excerpt || 'No summary excerpt provided.'}
                    </p>
                  </div>

                  {/* Author & Engagement Metrics Footer */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    {/* Author Details */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                          {blog.author?.profilePicture ? (
                            <img
                              src={blog.author.profilePicture}
                              alt={blog.author?.fullName || 'Counselor'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            blog.author?.fullName?.charAt(0)?.toUpperCase() || 'C'
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {blog.author?.fullName || 'Counselor'}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {Array.isArray(blog.author?.specialization)
                              ? blog.author?.specialization[0]
                              : blog.author?.specialization || 'Counselor'}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {formattedDate}
                      </span>
                    </div>

                    {/* Engagement Stats & Admin Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      {/* Interaction Counts */}
                      <div className="flex items-center gap-3 text-slate-500 font-medium">
                        <span
                          className="flex items-center gap-1 text-[11px] hover:text-rose-600 transition-colors"
                          title="Likes"
                        >
                          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                          {likesCount}
                        </span>
                        <span
                          className="flex items-center gap-1 text-[11px] hover:text-blue-600 transition-colors"
                          title="Comments"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                          {commentsCount}
                        </span>
                        <span
                          className="flex items-center gap-1 text-[11px] hover:text-indigo-600 transition-colors"
                          title="Views"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {blog.views || 0}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`/blogs/${blog.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Preview public blog post"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <button
                          type="button"
                          onClick={() => setDeleteDialogBlog(blog)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete blog (moderation)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Page <span className="font-semibold text-slate-900">{pagination.page}</span> of{' '}
            <span className="font-semibold text-slate-900">{pagination.totalPages}</span>
          </p>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevPage || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-9 gap-1 text-xs rounded-xl bg-white border-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-1">
              {[...Array(pagination.totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === pagination.totalPages ||
                  (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                        pageNum === pagination.page
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                  return (
                    <span key={pageNum} className="px-1 text-xs text-slate-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage || loading}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="h-9 gap-1 text-xs rounded-xl bg-white border-slate-200"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={Boolean(deleteDialogBlog)} onOpenChange={(open) => !open && setDeleteDialogBlog(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <DialogTitle className="text-base font-bold text-slate-900">
              Delete Blog Article
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-800">"{deleteDialogBlog?.title}"</span>? This will permanently remove the article, comments, and reaction data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setDeleteDialogBlog(null)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleDeleteBlog}
              className="rounded-xl text-xs gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Article</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlogsManagement;
