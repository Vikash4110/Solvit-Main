import api from '../../lib/axios';
import { API_ENDPOINTS } from '../../config/api';

/**
 * Enterprise Layer 2 Domain Service for Blog & Editorial Publishing.
 * Encapsulates all transport logic, endpoint routing, and payload serialization
 * for public reading, social interactions, and counselor management.
 */
export const blogService = {
  /**
   * Fetch public blog posts with pagination, category filter, search, and sorting.
   *
   * @param {Object|string|URLSearchParams} params - Query parameters.
   * @returns {Promise<Object>} Paginated blog documents and metadata.
   */
  async getAll(params = {}) {
    const query =
      params instanceof URLSearchParams
        ? params.toString()
        : typeof params === 'string'
          ? params
          : new URLSearchParams(params).toString();
    const url = query ? `${API_ENDPOINTS.BLOGS_GET_ALL}?${query}` : API_ENDPOINTS.BLOGS_GET_ALL;
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Fetch available blog categories.
   *
   * @returns {Promise<Array<string>>} Category listing.
   */
  async getCategories() {
    const response = await api.get(API_ENDPOINTS.BLOGS_GET_CATEGORIES);
    return response.data;
  },

  /**
   * Fetch a single blog post and its related articles by slug.
   *
   * @param {string} slug - Blog URL slug.
   * @returns {Promise<Object>} Blog entity and related posts.
   */
  async getBySlug(slug) {
    if (!slug) throw new Error('Blog slug is required');
    const response = await api.get(`${API_ENDPOINTS.BLOGS_GET_BY_SLUG}/${slug}`);
    return response.data;
  },

  /**
   * Toggle like state on a blog post.
   *
   * @param {string} blogId - MongoDB identifier for the blog.
   * @returns {Promise<Object>} Updated like state and likes count.
   */
  async toggleLike(blogId) {
    if (!blogId) throw new Error('Blog ID is required');
    const response = await api.post(`${API_ENDPOINTS.BLOGS_LIKE}/${blogId}/like`);
    return response.data;
  },

  /**
   * Submit a comment on a blog post.
   *
   * @param {string} blogId - MongoDB identifier for the blog.
   * @param {string} content - Comment text body.
   * @returns {Promise<Object>} Created comment object.
   */
  async addComment(blogId, content) {
    if (!blogId) throw new Error('Blog ID is required');
    const response = await api.post(`${API_ENDPOINTS.BLOGS_COMMENT}/${blogId}/comments`, {
      content: content.trim(),
    });
    return response.data;
  },

  /**
   * Fetch blogs authored by the currently authenticated counselor.
   *
   * @param {Object|string|URLSearchParams} params - Filter and pagination params.
   * @returns {Promise<Object>} Counselor's blog list.
   */
  async getMyBlogs(params = {}) {
    const query =
      params instanceof URLSearchParams
        ? params.toString()
        : typeof params === 'string'
          ? params
          : new URLSearchParams(params).toString();
    const url = query
      ? `${API_ENDPOINTS.BLOGS_COUNSELOR_MY_BLOGS}?${query}`
      : API_ENDPOINTS.BLOGS_COUNSELOR_MY_BLOGS;
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Create a new blog post. Supports multipart/form-data for image uploads.
   *
   * @param {FormData|Object} payload - Form data or serialized object.
   * @returns {Promise<Object>} Created blog document.
   */
  async createBlog(payload) {
    const isFormData = payload instanceof FormData;
    const response = await api.post(API_ENDPOINTS.BLOGS_CREATE, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  /**
   * Update an existing blog post. Supports multipart/form-data for image uploads.
   *
   * @param {string} blogId - MongoDB identifier for the blog.
   * @param {FormData|Object} payload - Form data or serialized object.
   * @returns {Promise<Object>} Updated blog document.
   */
  async updateBlog(blogId, payload) {
    if (!blogId) throw new Error('Blog ID is required');
    const isFormData = payload instanceof FormData;
    const response = await api.put(`${API_ENDPOINTS.BLOGS_UPDATE}/${blogId}`, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  /**
   * Permanently delete a blog post.
   *
   * @param {string} blogId - MongoDB identifier for the blog.
   * @returns {Promise<Object>} Deletion confirmation.
   */
  async deleteBlog(blogId) {
    if (!blogId) throw new Error('Blog ID is required');
    const response = await api.delete(`${API_ENDPOINTS.BLOGS_DELETE}/${blogId}`);
    return response.data;
  },
};

export default blogService;
