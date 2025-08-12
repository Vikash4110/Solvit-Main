import { Blog } from '../models/blog-model.js';
import { wrapper } from '../utils/wrapper.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Get all published blogs with filtering, pagination, and search
export const getBlogs = wrapper(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    search,
    sort = 'latest',
    featured
  } = req.query;

  // Build query
  const query = { status: 'published' };
  
  if (category) {
    query.category = category;
  }
  
  if (featured === 'true') {
    query.featured = true;
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Build sort options
  let sortOptions = {};
  switch (sort) {
    case 'latest':
      sortOptions = { publishedAt: -1 };
      break;
    case 'oldest':
      sortOptions = { publishedAt: 1 };
      break;
    case 'popular':
      sortOptions = { views: -1, publishedAt: -1 };
      break;
    case 'alphabetical':
      sortOptions = { title: 1 };
      break;
    default:
      sortOptions = { publishedAt: -1 };
  }

  // Calculate pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Get total count for pagination
  const totalDocs = await Blog.countDocuments(query);
  const totalPages = Math.ceil(totalDocs / limitNum);

  // Get blogs with pagination
  const blogs = await Blog.find(query)
    .populate('author', 'fullName profilePicture specialization')
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

  // Format response to match your frontend expectations
  const paginationData = {
    docs: blogs,
    totalDocs,
    limit: limitNum,
    page: pageNum,
    totalPages,
    hasNextPage: pageNum < totalPages,
    hasPrevPage: pageNum > 1
  };

  res.status(200).json(
    new ApiResponse(200, paginationData, 'Blogs fetched successfully')
  );
});

// Get single blog by slug
export const getBlogBySlug = wrapper(async (req, res) => {
  const { slug } = req.params;

  const blog = await Blog.findOne({ slug, status: 'published' })
    .populate('author', 'fullName profilePicture specialization bio')
    .populate('comments.user', 'fullName profilePicture');

  if (!blog) {
    throw new ApiError(404, 'Blog not found');
  }

  // Increment views
  await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

  // Get related blogs
  const relatedBlogs = await Blog.find({
    _id: { $ne: blog._id },
    category: blog.category,
    status: 'published'
  })
    .populate('author', 'fullName profilePicture')
    .limit(3)
    .sort({ publishedAt: -1 });

  res.status(200).json(
    new ApiResponse(200, { blog, relatedBlogs }, 'Blog fetched successfully')
  );
});

// Get blog categories with counts
export const getBlogCategories = wrapper(async (req, res) => {
  const categories = await Blog.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const categoryMap = {
    'mental-health': 'Mental Health',
    'career': 'Career Development',
    'relationship': 'Relationships',
    'life-coaching': 'Life Coaching',
    'academic': 'Academic Support',
    'health-wellness': 'Health & Wellness'
  };

  const formattedCategories = categories.map(cat => ({
    value: cat._id,
    label: categoryMap[cat._id] || cat._id,
    count: cat.count
  }));

  res.status(200).json(
    new ApiResponse(200, formattedCategories, 'Categories fetched successfully')
  );
});

// ✅ UPDATED: Like/Unlike blog - Works with verifyJWTAny middleware
export const toggleBlogLike = wrapper(async (req, res) => {

  const { blogId } = req.params ;
  const userId = req.verifiedClientId._id ;

  // ✅ Use userType set by verifyJWTAny middleware
  const userType = req.userType === 'client' ? 'Client' : 'Counselor';
 
 

  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(404, 'Blog not found');
  }
  

  const existingLike = blog.likes.find(
    like => like.user.toString() === userId.toString() && like.userType === userType
  );
  

  if (existingLike) {
    // Remove like
    blog.likes = blog.likes.filter(
      like => !(like.user.toString() === userId.toString() && like.userType === userType)
    );
  } else {
    // Add like
    blog.likes.push({ user: userId, userType });
  }

  await blog.save();

  res.status(200).json(
    new ApiResponse(200, { 
      liked: !existingLike, 
      likesCount: blog.likes.length 
    }, existingLike ? 'Blog unliked' : 'Blog liked')
  );
});

// ✅ UPDATED: Add comment to blog - Works with verifyJWTAny middleware
export const addBlogComment = wrapper(async (req, res) => {
  const { blogId } = req.params;
  const { content } = req.body;
  const userId = req.verifiedClientId._id;
  
  // ✅ Use userType set by verifyJWTAny middleware
  const userType = req.userType === 'client' ? 'Client' : 'Counselor';

  if (!content?.trim()) {
    throw new ApiError(400, 'Comment content is required');
  }

  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(404, 'Blog not found');
  }

  blog.comments.push({
    user: userId,
    userType,
    content: content.trim()
  });

  await blog.save();

  // Populate the newly added comment
  await blog.populate({
    path: 'comments.user',
    select: 'fullName profilePicture'
  });

  const newComment = blog.comments[blog.comments.length - 1];

  res.status(201).json(
    new ApiResponse(201, newComment, 'Comment added successfully')
  );
});


// Create blog (Counselors only)
export const createBlog = wrapper(async (req, res) => {
  const {
    title,
    content,
    excerpt,
    category,
    tags,
    featuredImage,
    status = 'draft',
    featured = false
  } = req.body;

  if (!title || !content || !excerpt || !category) {
    throw new ApiError(400, 'Title, content, excerpt, and category are required');
  }

  const blog = await Blog.create({
    title,
    content,
    excerpt,
    category,
    tags: tags || [],
    featuredImage,
    author: req.verifiedClientId._id,
    status,
    featured
  });

  await blog.populate('author', 'fullName profilePicture specialization');

  res.status(201).json(
    new ApiResponse(201, blog, 'Blog created successfully')
  );
});

// Update blog (Author only)
export const updateBlog = wrapper(async (req, res) => {
  const { blogId } = req.params;
  const updates = req.body;

  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(404, 'Blog not found');
  }

  if (blog.author.toString() !== req.verifiedClientId._id.toString()) {
    throw new ApiError(403, 'You can only update your own blogs');
  }

  Object.assign(blog, updates);
  await blog.save();

  await blog.populate('author', 'fullName profilePicture specialization');

  res.status(200).json(
    new ApiResponse(200, blog, 'Blog updated successfully')
  );
});

// Delete blog (Author only)
export const deleteBlog = wrapper(async (req, res) => {
  const { blogId } = req.params;

  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new ApiError(404, 'Blog not found');
  }

  if (blog.author.toString() !== req.verifiedClientId._id.toString()) {
    throw new ApiError(403, 'You can only delete your own blogs');
  }

  await Blog.findByIdAndDelete(blogId);

  res.status(200).json(
    new ApiResponse(200, null, 'Blog deleted successfully')
  );
});

// ✅ NEW: Get counselor's own blogs for dashboard
export const getCounselorBlogs = wrapper(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    search
  } = req.query;

  // Build query for counselor's blogs
  const query = { author: req.verifiedClientId._id };
  
  if (status && status !== 'all') {
    query.status = status;
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const totalDocs = await Blog.countDocuments(query);
  const totalPages = Math.ceil(totalDocs / limitNum);

  const blogs = await Blog.find(query)
    .populate('author', 'fullName profilePicture specialization')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const paginationData = {
    docs: blogs,
    totalDocs,
    limit: limitNum,
    page: pageNum,
    totalPages,
    hasNextPage: pageNum < totalPages,
    hasPrevPage: pageNum > 1
  };

  res.status(200).json(
    new ApiResponse(200, paginationData, 'Counselor blogs fetched successfully')
  );
});

// ✅ NEW: Get blog statistics for counselor dashboard
export const getBlogStats = wrapper(async (req, res) => {
  const counselorId = req.verifiedClientId._id;

  const stats = await Blog.aggregate([
    { $match: { author: counselorId } },
    {
      $group: {
        _id: null,
        totalBlogs: { $sum: 1 },
        publishedBlogs: {
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
        },
        draftBlogs: {
          $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
        },
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: { $size: '$likes' } },
        totalComments: { $sum: { $size: '$comments' } }
      }
    }
  ]);

  const blogStats = stats[0] || {
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0
  };

  res.status(200).json(
    new ApiResponse(200, blogStats, 'Blog statistics fetched successfully')
  );
});
