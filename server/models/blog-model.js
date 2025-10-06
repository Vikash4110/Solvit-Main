import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      required: true,
      maxLength: 300,
    },
    featuredImage: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: [
        'mental-health',
        'career',
        'relationship',
        'life-coaching',
        'academic',
        'health-wellness',
      ],
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Counselor',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    readingTime: {
      type: Number,
      default: 5,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: 'likes.userType',
        },
        userType: {
          type: String,
          enum: ['Client', 'Counselor'],
        },
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: 'comments.userType',
        },
        userType: {
          type: String,
          enum: ['Client', 'Counselor'],
        },
        content: {
          type: String,
          required: true,
          maxLength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    publishedAt: {
      type: Date,
      default: null,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ CRITICAL FIX: Generate slug BEFORE validation (not during save)
blogSchema.pre('validate', function (next) {
  // Generate slug from title if title exists and slug doesn't exist or title is modified
  if (this.title && (!this.slug || this.isModified('title'))) {
    // Clean the title and create slug
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);

    // ✅ Ensure uniqueness for new documents
    if (this.isNew) {
      // Add timestamp to ensure uniqueness
      const timestamp = Date.now().toString().slice(-4);
      this.slug = `${baseSlug}-${timestamp}`;
    } else {
      this.slug = baseSlug;
    }
  }

  // Set publishedAt when status changes to published
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// ✅ IMPROVED: Handle slug uniqueness conflicts
blogSchema.pre('save', async function (next) {
  // Handle slug uniqueness for existing documents being updated
  if (this.isModified('title') && !this.isNew) {
    let baseSlug = this.slug;
    let counter = 1;

    // Check if slug already exists (excluding current document)
    while (
      await this.constructor.findOne({
        slug: this.slug,
        _id: { $ne: this._id },
      })
    ) {
      this.slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  next();
});

// Calculate reading time based on content
blogSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

// ✅ ENHANCED: Better indexes for performance
blogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
blogSchema.index({ category: 1, status: 1, publishedAt: -1 });
blogSchema.index({ slug: 1 }, { unique: true }); // Ensure unique index
blogSchema.index({ author: 1, status: 1 }); // For counselor's own blogs
blogSchema.index({ featured: 1, status: 1 }); // For featured blogs

// ✅ ADDED: Instance method to generate unique slug
blogSchema.methods.generateUniqueSlug = async function () {
  let baseSlug = this.title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);

  let slug = baseSlug;
  let counter = 1;

  // Keep checking until we find a unique slug
  while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  this.slug = slug;
  return slug;
};

export const Blog = mongoose.model('Blog', blogSchema);
