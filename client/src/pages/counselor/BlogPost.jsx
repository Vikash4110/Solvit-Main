import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaClock,
  FaEye,
  FaHeart,
  FaComment,
  FaShare,
  FaArrowLeft,
  FaSpinner,
  FaPaperPlane,
  FaLock,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

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
    }

    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  // ✅ UPDATED: Fetch blog using correct API endpoint
  const fetchBlog = async () => {
    try {
      setLoading(true);

      // ✅ Public endpoint - no authentication required for viewing
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BLOGS_GET_BY_SLUG}/${slug}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setBlog(data.data.blog);
        setRelatedBlogs(data.data.relatedBlogs);
        setLikesCount(data.data.blog.likes?.length || 0);

        // ✅ IMPROVED: Better user identification and like status checking
        if (isAuthenticated) {
          const userId =
            userType === 'client'
              ? JSON.parse(localStorage.getItem('client') || '{}')._id
              : JSON.parse(localStorage.getItem('counselor') || '{}')._id;
          console.log(userId);
          const hasLiked = data.data.blog.likes?.some(
            (like) =>
              like.user === userId &&
              like.userType === (userType === 'client' ? 'Client' : 'Counselor')
          );
          setLiked(hasLiked);
        }
      } else {
        toast.error(data.message || 'Blog not found');
        navigate('/blogs');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to load blog');
      navigate('/blogs');
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
      const token =
        localStorage.getItem('clientAccessToken') || localStorage.getItem('counselorAccessToken');

      // ✅ SIMPLIFIED: Use unified endpoint for both user types
      const endpoint =
        userType === 'counselor'
          ? `${API_BASE_URL}${API_ENDPOINTS.BLOGS_LIKE}/${blog._id}/like`
          : `${API_BASE_URL}${API_ENDPOINTS.BLOGS_LIKE}/${blog._id}/like`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
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
      const token =
        localStorage.getItem('clientAccessToken') || localStorage.getItem('counselorAccessToken');

      // ✅ SIMPLIFIED: Use unified endpoint for both user types
      const endpoint =
        userType === 'counselor'
          ? `${API_BASE_URL}${API_ENDPOINTS.BLOGS_COMMENT}/${blog._id}/comments`
          : `${API_BASE_URL}${API_ENDPOINTS.BLOGS_COMMENT}/${blog._id}/comments`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: commentText.trim() }),
      });

      const data = await response.json();
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
            <FaArrowLeft className="mr-2" />
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-24 pb-16">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-12 w-72 h-72 bg-gradient-to-br from-blue-400/15 to-indigo-400/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-24 right-10 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            to="/blogs"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Blogs
          </Link>
        </motion.div>

        {/* Authentication Notice for Non-Authenticated Users */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center"
          >
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <FaLock className="w-4 h-4" />
              <span className="font-medium">
                <Link to="/login" className="text-blue-600 hover:text-blue-800 underline">
                  Login
                </Link>{' '}
                to like and comment on this blog
              </span>
            </div>
          </motion.div>
        )}

        {/* Blog Header */}
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden"
        >
          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="relative h-64 md:h-96 overflow-hidden">
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}

          <div className="p-8">
            {/* Category and Meta */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-medium">
                  {blog.category.replace('-', ' ').toUpperCase()}
                </span>
                {blog.featured && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">
                    FEATURED
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Author and Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold mr-4">
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
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {blog.author?.fullName || 'Anonymous'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {blog.author?.specialization || 'Counselor'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <FaClock className="mr-1" />
                  {blog.readingTime || 5} min read
                </div>
                <div className="flex items-center">
                  <FaEye className="mr-1" />
                  {blog.views || 0} views
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={
                      isAuthenticated ? handleLike : () => handleAuthRequired('like this blog')
                    }
                    className={`flex items-center transition-colors ${
                      liked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                    } ${!isAuthenticated ? 'opacity-75' : ''}`}
                  >
                    <FaHeart className="mr-1" />
                    {likesCount}
                    {!isAuthenticated && <FaLock className="ml-1 w-3 h-3" />}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    <FaShare className="mr-1" />
                    Share
                  </button>
                </div>
              </div>
            </div>

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
                <form onSubmit={handleComment} className="mb-8">
                  <div className="flex space-x-4">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="flex-1 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      rows="3"
                      maxLength="500"
                    />
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {submittingComment ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaPaperPlane />
                      )}
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {commentText.length}/500 characters
                  </div>
                </form>
              ) : (
                <div className="mb-8 p-6 bg-gray-50 rounded-xl text-center">
                  <FaLock className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-4">You need to be logged in to post a comment</p>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all"
                  >
                    <FaLock className="mr-2" />
                    Login to Comment
                  </Link>
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

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedBlogs.map((relatedBlog, index) => (
                <Link
                  key={relatedBlog._id}
                  to={`/blogs/${relatedBlog.slug}`}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {relatedBlog.featuredImage && (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={relatedBlog.featuredImage}
                        alt={relatedBlog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {relatedBlog.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{relatedBlog.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{relatedBlog.readingTime || 5} min read</span>
                      <span>{new Date(relatedBlog.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlogPost;
