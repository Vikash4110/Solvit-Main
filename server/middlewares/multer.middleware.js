// middleware/multer.js (or wherever your multer config is)
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure temp directory exists
const tempDir = './public/temp';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// ====================================
// EXISTING CONFIGURATIONS
// ====================================

// Configure storage for general files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// Configure storage for profile pictures (images only)
const profilePictureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  },
});

// File filter for PDFs (application documents)
const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

// File filter for images (profile pictures)
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// ====================================
// NEW: EVIDENCE FILE FILTER (For Dispute System)
// ====================================
const evidenceFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'video/mp4',
    'audio/mpeg',
    'audio/mp3',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  ];

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.mp4', '.mp3', '.docx'];

  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only JPG, PNG, PDF, MP4, MP3, and DOCX files are allowed.'),
      false
    );
  }
};

// ====================================
// MULTER INSTANCES
// ====================================

// General file upload (existing)
export const upload = multer({
  storage: storage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Profile picture upload (existing)
export const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for profile pictures
  },
});

// Mixed upload (existing)
export const uploadMixed = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// ====================================
// NEW: EVIDENCE UPLOAD FOR DISPUTES
// Uses MEMORY STORAGE (no local save)
// Files go directly to Cloudinary
// ====================================
export const uploadEvidence = multer({
  storage: multer.memoryStorage(), // ✅ Memory storage - no disk writes
  fileFilter: evidenceFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5, // Max 5 files
  },
});

