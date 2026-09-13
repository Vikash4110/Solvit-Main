import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import {
  Clock,
  Eye,
  Heart,
  Share2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  User,
  Calendar,
  Lock,
  MessageCircle,
} from 'lucide-react';
import {
  FaComment,
  FaSpinner,
  FaPaperPlane,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { API_ENDPOINTS } from '../../config/api';
import api from '../../lib/axios';

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

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    // Check authentication status
    const clientToken = localStorage.getItem('clientAccessToken');
    const counselorToken = localStorage.getItem('counselorAccessToken');

    if (clientToken || counselorToken) {
      setIsAuthenticated(true);
      setUserType(clientToken ? 'client' : 'counselor');
    } else {
      setIsAuthenticated(false);
      setUserType(null);
    }

    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  // Fetch blog using API endpoint
  const fetchBlog = async () => {
    try {
      setLoading(true);

      const response = await api.get(`${API_ENDPOINTS.BLOGS_GET_BY_SLUG}/${slug}`);
      const data = response.data;
      if (data.success && data.data?.blog) {
        setBlog(data.data.blog);
        setRelatedBlogs(data.data.relatedBlogs || []);
        setLikesCount(data.data.blog.likes?.length || 0);

        // Safe user identification and like status checking
        const clientToken = localStorage.getItem('clientAccessToken');
        const counselorToken = localStorage.getItem('counselorAccessToken');
        const activeUserType = clientToken ? 'client' : counselorToken ? 'counselor' : null;

        if (activeUserType) {
          try {
            const storedUser = localStorage.getItem(activeUserType);
            const userId = storedUser ? JSON.parse(storedUser)?._id : null;
            if (userId) {
              const userLiked = data.data.blog.likes?.some((like) => {
                const likeUserId = typeof like === 'object' ? like?._id : like;
                return likeUserId === userId;
              });
              setLiked(Boolean(userLiked));
            }
          } catch (storageErr) {
            console.error('Error reading stored user session:', storageErr);
          }
        }
      } else {
        toast.error(data.message || 'Failed to load blog');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: Simplified like handling with unified endpoint
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like this blog', {
        icon: '🔒',
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FECACA',
        },
      });
      navigate('/login');
      return;
    }

    try {
      const response = await api.post(`${API_ENDPOINTS.BLOGS_LIKE}/${blog._id}/like`);
      const data = response.data;
      if (data.success) {
        setLiked(data.data.liked);
        setLikesCount(data.data.likesCount);
        toast.success(data.data.liked ? 'Blog liked! ❤️' : 'Blog unliked');
      } else {
        toast.error(data.message || 'Failed to update like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  // ✅ UPDATED: Simplified comment handling with unified endpoint
  const handleComment = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to comment on this blog', {
        icon: '🔒',
        duration: 3000,
        style: {
          borderRadius: '12px',
          background: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FECACA',
        },
      });
      navigate('/login');
      return;
    }

    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);

      const response = await api.post(`${API_ENDPOINTS.BLOGS_COMMENT}/${blog._id}/comments`, {
        content: commentText.trim(),
      });

      const data = response.data;
      if (data.success) {
        // ✅ IMPROVED: Better comment state management
        setBlog((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), data.data],
        }));
        setCommentText('');
        toast.success('Comment added successfully! 💬');
      } else {
        toast.error(data.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // ✅ ENHANCED: Better share functionality
  const handleShare = async () => {
    const shareData = {
      title: blog.title,
      text: blog.excerpt,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      // Fallback for when sharing fails
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      } catch (clipboardError) {
        toast.error('Failed to share blog');
      }
    }
  };

  const handleAuthRequired = (action) => {
    toast.error(`Please login to ${action}`, {
      icon: '🔒',
      duration: 3000,
      style: {
        borderRadius: '12px',
        background: '#FEF2F2',
        color: '#DC2626',
        border: '1px solid #FECACA',
      },
    });
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog not found</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
          <Link
            to="/blogs"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-24 sm:pt-28 pb-16">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-12 w-72 h-72 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-24 right-10 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 sm:mb-8"
        >
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300 transition-all text-sm font-semibold shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blogs</span>
          </Link>
        </motion.div>

        {/* Authentication Notice for Non-Authenticated Users */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 rounded-2xl p-4 text-center"
          >
            <div className="flex items-center justify-center space-x-2 text-blue-700 dark:text-blue-300 text-sm sm:text-base">
              <Lock className="w-4 h-4" />
              <span className="font-medium">
                <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                  Login
                </Link>{' '}
                or{' '}
                <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                  Register
                </Link>{' '}
                to like and comment on this blog
              </span>
            </div>
          </motion.div>
        )}

        {/* Blog Article */}
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden"
        >
          <div className="p-6 sm:p-10 lg:p-12">
            {/* Category and Date Header */}
            {(() => {
              const theme = getCategoryTheme(blog.category);
              const formattedDate = blog.publishedAt && dayjs(blog.publishedAt).isValid()
                ? dayjs(blog.publishedAt).format('MMMM DD, YYYY')
                : 'Recent';

              return (
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-2.5">
                    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border shadow-xs ${theme.badge}`}>
                      <span>{theme.icon}</span>
                      <span>{theme.label}</span>
                    </span>
                    {blog.featured && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-400 text-amber-950 shadow-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              );
            })()}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight sm:leading-tight tracking-tight">
              {blog.title}
            </h1>

            {/* Author and Engagement Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 mb-8">
              {/* Author Info */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-full ring-2 ring-primary-500/20 bg-gradient-to-br from-[#1c3c63] to-[#2563eb] flex items-center justify-center text-white font-bold text-base shrink-0 overflow-hidden shadow-xs">
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
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug truncate">
                    {blog.author?.fullName || 'Anonymous'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-xs sm:max-w-md">
                    {getAuthorSpecialization(blog.author)}
                  </p>
                </div>
              </div>

              {/* Engagement & Stats */}
              <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium shrink-0 flex-wrap">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{blog.readingTime || 3} min read</span>
                </div>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>{blog.views || 0} views</span>
                </div>
                <button
                  onClick={
                    isAuthenticated ? handleLike : () => handleAuthRequired('like this blog')
                  }
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    liked ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300 hover:text-rose-600'
                  } ${!isAuthenticated ? 'opacity-75' : ''}`}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-rose-600 text-rose-600' : ''}`} />
                  <span>{likesCount}</span>
                  {!isAuthenticated && <Lock className="w-3 h-3 ml-0.5" />}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Featured Image */}
            {blog.featuredImage && (
              <div className="relative rounded-2xl overflow-hidden mb-8 shadow-md border border-slate-100 dark:border-slate-800 max-h-[460px] w-full bg-slate-100 dark:bg-slate-800">
                <img
                  src={blog.featuredImage}
                  alt={blog.title}
                  className="w-full h-full object-cover max-h-[460px]"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-12">
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mb-8">
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
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

            {/* Comments Section */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Comments ({blog.comments?.length || 0})
              </h3>

              {/* Add Comment Form */}
              {isAuthenticated ? (
                <form onSubmit={handleComment} className="mb-8 space-y-3">
                  <div className="w-full">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all text-sm sm:text-base"
                      rows="4"
                      maxLength="500"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                    <span className="text-xs sm:text-sm text-gray-500">
                      {commentText.length}/500 characters
                    </span>
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
                    >
                      {submittingComment ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          <span>Posting...</span>
                        </>
                      ) : (
                        <>
                          <span>Post Comment</span>
                          <FaPaperPlane className="text-xs" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-8 p-6 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 text-center">
                  <Lock className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-3" />
                  <p className="text-gray-600 dark:text-gray-300 font-medium mb-4">
                    You need to be logged in to post a comment
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link
                      to="/login"
                      className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all text-sm shadow-sm"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Login to Comment
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center px-6 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm shadow-sm"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {blog.comments?.map((comment, index) => (
                  <div key={comment._id || index} className="flex space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {comment.user?.profilePicture ? (
                        <img
                          src={comment.user.profilePicture}
                          alt={comment.user.fullName}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        comment.user?.fullName?.charAt(0) || 'U'
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {comment.user?.fullName || 'Anonymous'}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty state for no comments */}
                {(!blog.comments || blog.comments.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <FaComment className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No comments yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.article>

        {/* Related Articles Section */}
        {relatedBlogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16"
          >
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 px-3 py-1 rounded-full border border-primary-200 dark:border-primary-800">
                Keep Reading
              </span>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                Related Articles
              </h2>
            </div>

            <div className={`grid gap-6 ${relatedBlogs.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : relatedBlogs.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {relatedBlogs.map((relatedBlog, index) => {
                const relTheme = getCategoryTheme(relatedBlog.category);
                const relFormattedDate = relatedBlog.publishedAt && dayjs(relatedBlog.publishedAt).isValid()
                  ? dayjs(relatedBlog.publishedAt).format('DD MMM YYYY')
                  : 'Recent';

                return (
                  <motion.div
                    key={relatedBlog._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ y: -6 }}
                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col h-full overflow-hidden"
                  >
                    {/* Visual Header / Featured Image */}
                    {relatedBlog.featuredImage ? (
                      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                        <img
                          src={relatedBlog.featuredImage}
                          alt={relatedBlog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />
                        
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-md border shadow-xs ${relTheme.badge}`}>
                            <span>{relTheme.icon}</span>
                            <span>{relTheme.label}</span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className={`relative h-24 w-full bg-gradient-to-br ${relTheme.headerGradient} border-b border-slate-100 dark:border-slate-800/80 p-3.5 flex flex-col justify-between overflow-hidden shrink-0`}>
                        <div className="absolute -right-2 -bottom-3 text-5xl opacity-10 select-none pointer-events-none">
                          {relTheme.icon}
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-sm shadow-xs ${relTheme.badge}`}>
                            <span>{relTheme.icon}</span>
                            <span>{relTheme.label}</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Title */}
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 leading-snug tracking-tight mb-2">
                          <Link to={`/blogs/${relatedBlog.slug}`}>{relatedBlog.title}</Link>
                        </h3>

                        {/* Excerpt */}
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                          {relatedBlog.excerpt}
                        </p>
                      </div>

                      {/* Footer Info */}
                      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {relatedBlog.readingTime || 3} min
                          </span>
                          <span className="text-[11px] text-slate-400">{relFormattedDate}</span>
                        </div>

                        <Link
                          to={`/blogs/${relatedBlog.slug}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-[#1c3c63] to-[#2563eb] hover:from-[#152f4f] hover:to-[#1e40af] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all shrink-0 group/btn"
                        >
                          <span>Read</span>
                          <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlogPost;
