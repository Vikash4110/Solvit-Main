import { Router } from 'express';
import { verifyJWTClient } from '../middlewares/clientAuth-middleware.js';
import { verifyJWTCounselor } from '../middlewares/counselorAuth-middleware.js';
import { uploadBlogImage } from '../middlewares/multer.middleware.js';
import {
  getBlogs,
  getBlogBySlug,
  getBlogCategories,
  toggleBlogLike,
  addBlogComment,
  createBlog,
  updateBlog,
  deleteBlog,
  getCounselorBlogs,
  getBlogStats,
} from '../controllers/blog-controller.js';

const blogsRouter = Router();

// Enhanced middleware that accepts both client and counselor auth
const verifyJWTAny = (req, res, next) => {
  // Try client auth first
  verifyJWTClient(req, res, (err) => {
    if (!err) {
      req.userType = 'client';
      return next();
    }

    // If client auth fails, try counselor auth
    verifyJWTCounselor(req, res, (err) => {
      if (!err) {
        req.userType = 'counselor';
        return next();
      }

      // If both fail, return unauthorized
      return res.status(401).json({
        status: 401,
        message: 'Please login as client or counselor to perform this action',
      });
    });
  });
};

// 🌍 PUBLIC ROUTES - No authentication required
blogsRouter.get('/', getBlogs);
blogsRouter.get('/categories', getBlogCategories);
blogsRouter.get('/:slug', getBlogBySlug);

// 🔐 AUTHENTICATED ROUTES - Both clients and counselors can interact
blogsRouter.post('/:blogId/like', verifyJWTAny, toggleBlogLike);
blogsRouter.post('/:blogId/comments', verifyJWTAny, addBlogComment);

// 👩‍⚕️ COUNSELOR ONLY ROUTES - Content management
blogsRouter.post(
  '/',
  verifyJWTCounselor,
  uploadBlogImage.single('coverImage'),
  createBlog
);
blogsRouter.put(
  '/:blogId',
  verifyJWTCounselor,
  uploadBlogImage.single('coverImage'),
  updateBlog
);
blogsRouter.delete('/:blogId', verifyJWTCounselor, deleteBlog);

// 📊 COUNSELOR ANALYTICS ROUTES (Optional additions)
blogsRouter.get('/counselor/my-blogs', verifyJWTCounselor, getCounselorBlogs);
blogsRouter.get('/counselor/stats', verifyJWTCounselor, getBlogStats);

export { blogsRouter };
