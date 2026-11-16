import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { blogService } from '../services/blog';
import { useClientAuth } from '../contexts/ClientAuthContext';
import { useCounselorAuth } from '../contexts/CounselorAuthContext';

/**
 * Enterprise Layer 3 State Hook for Single Blog Article View.
 * Encapsulates article fetching, related recommendations, like/unlike toggling,
 * comment submission, and sharing actions.
 *
 * @param {string} slug - Blog URL slug.
 * @returns {Object} Article state, social engagement flags, and dispatchers.
 */
export const useBlogPost = (slug) => {
  const navigate = useNavigate();
  const { client } = useClientAuth();
  const { counselor } = useCounselorAuth();

  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const isAuthenticated = Boolean(client || counselor);
  const userType = client ? 'client' : counselor ? 'counselor' : null;

  const fetchBlog = useCallback(async () => {
    if (!slug) return;

    try {
      setLoading(true);

      const response = await blogService.getBySlug(slug);

      if (response?.success && response.data?.blog) {
        const fetchedBlog = response.data.blog;
        setBlog(fetchedBlog);
        setRelatedBlogs(response.data.relatedBlogs || []);
        setLikesCount(fetchedBlog.likes?.length || 0);

        const currentUserId = (client?._id || counselor?._id)?.toString();
        if (currentUserId) {
          const userLiked = fetchedBlog.likes?.some((like) => {
            const likeUserId = (like?.user?._id || like?.user || like?._id)?.toString();
            return likeUserId === currentUserId;
          });
          setLiked(Boolean(userLiked));
        }
      } else {
        toast.error(response?.message || 'Failed to load blog');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to load blog');
    } finally {
      setLoading(false);
    }
  }, [slug, client, counselor]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like this blog', {
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

    if (isLiking || !blog?._id) return;

    try {
      setIsLiking(true);
      const response = await blogService.toggleLike(blog._id);

      if (response?.success) {
        setLiked(response.data.liked);
        setLikesCount(response.data.likesCount);
        toast.success(response.data.liked ? 'Blog liked!' : 'Blog unliked');
      } else {
        toast.error(response?.message || 'Failed to update like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to comment on this blog', {
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

    if (!commentText.trim() || !blog?._id) return;

    try {
      setSubmittingComment(true);

      const response = await blogService.addComment(blog._id, commentText);

      if (response?.success) {
        setBlog((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), response.data],
        }));
        setCommentText('');
        toast.success('Comment added successfully!');
      } else {
        toast.error(response?.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (!blog) return;

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
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      } catch (clipErr) {
        console.error('Share/copy failed:', clipErr);
        toast.error('Could not share link');
      }
    }
  };

  return {
    blog,
    setBlog,
    relatedBlogs,
    loading,
    liked,
    likesCount,
    isLiking,
    commentText,
    setCommentText,
    submittingComment,
    isAuthenticated,
    userType,
    handleLike,
    handleComment,
    handleShare,
    refreshBlog: fetchBlog,
  };
};

export default useBlogPost;
