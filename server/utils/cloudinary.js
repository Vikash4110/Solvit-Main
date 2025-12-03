// utils/cloudinary.js

import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { logger } from './logger.js';

dotenv.config({ path: './.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary with optimization
 * @param {string} localFilePath - Path to local file
 * @param {string} folder - Cloudinary folder (optional)
 * @returns {Promise} Upload response
 */
const uploadOncloudinary = async (localFilePath, folder = 'client-profiles') => {
  try {
    if (!localFilePath) {
      logger.warn('No file path provided for Cloudinary upload');
      return null;
    }

    if (!fs.existsSync(localFilePath)) {
      logger.error(`File not found: ${localFilePath}`);
      return null;
    }

    const fileExt = localFilePath.toLowerCase();
    const options = {
      folder: folder,
      resource_type: 'auto',
    };

    if (['.jpg', '.jpeg', '.png', '.webp'].includes(fileExt)) {
      options.transformation = [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { quality: 'auto:good', fetch_format: 'auto' },
      ];
    }

    const response = await cloudinary.uploader.upload(localFilePath, options);
    fs.unlinkSync(localFilePath);
    logger.info(`File uploaded successfully to Cloudinary: ${response.public_id}`);
    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    logger.error(`Cloudinary upload error: ${error.message}`);
    throw error;
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise} Delete response
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      logger.warn('No public ID provided for Cloudinary deletion');
      return null;
    }

    const response = await cloudinary.uploader.destroy(publicId);
    logger.info(`File deleted from Cloudinary: ${publicId}`);
    return response;
  } catch (error) {
    logger.error(`Cloudinary deletion error: ${error.message}`);
    throw error;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} cloudinaryUrl - Full Cloudinary URL
 * @returns {string} Public ID
 */
const extractPublicId = (cloudinaryUrl) => {
  try {
    const parts = cloudinaryUrl.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    const pathParts = parts.slice(uploadIndex + 1);
    if (pathParts[0].startsWith('v')) {
      pathParts.shift();
    }

    const publicIdWithExt = pathParts.join('/');
    const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
    return publicId;
  } catch (error) {
    logger.error(`Error extracting public ID: ${error.message}`);
    return null;
  }
};

/**
 * ✅ FIXED: Upload evidence file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} fileName - Original file name
 * @param {String} bookingId - Booking ID
 * @returns {Promise} Upload result with URL and metadata
 */
const uploadEvidenceToCloudinary = (fileBuffer, fileName, bookingId) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const folder = `solvit/evidence/bookings/${bookingId}`;
    const publicId = `${timestamp}-${fileName.replace(/\s+/g, '-').replace(/\.[^/.]+$/, '')}`; // ✅ Remove extension from publicId

    // Determine resource type based on file extension
    const fileExtension = fileName.split('.').pop().toLowerCase();
    let resourceType = 'auto';
    
    // ✅ FIX: DOCX and other documents need 'raw' resource type
    if (['docx', 'doc', 'xlsx', 'pptx'].includes(fileExtension)) {
      resourceType = 'raw';
    }

    console.log(`📤 Uploading ${fileName} as ${resourceType} type...`);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType, // ✅ Dynamic resource type
        // ✅ REMOVED: allowed_formats (causes issues with DOCX)
        timeout: 120000, // 2 minutes
      },
      (error, result) => {
        if (error) {
          console.error(`❌ Cloudinary upload error for ${fileName}:`, error);
          reject(new Error(`Failed to upload ${fileName}: ${error.message}`));
        } else {
          console.log(`✅ Successfully uploaded ${fileName} to Cloudinary`);
          resolve({
            fileUrl: result.secure_url,
            fileName: fileName, // ✅ Use original filename
            fileType: result.format || fileExtension, // ✅ Fallback to extension
            fileSize: result.bytes,
            publicId: result.public_id,
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete evidence file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise}
 */
const deleteEvidenceFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'auto',
    });
    return result;
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw error;
  }
};

export {
  uploadOncloudinary,
  deleteFromCloudinary,
  extractPublicId,
  uploadEvidenceToCloudinary,
  deleteEvidenceFromCloudinary,
};
