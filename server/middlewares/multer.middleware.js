// middleware/multer.middleware.js

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure temp directory exists
const tempDir = './public/temp';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// ====================================
// EXISTING CONFIGURATIONS (Keep as is)
// ====================================
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

const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// ====================================
// FIXED: EVIDENCE FILE FILTER
// ====================================
const evidenceFileFilter = (req, file, cb) => {
  console.log(`🔍 Checking file: ${file.originalname} | MIME: ${file.mimetype}`);

  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/pdf',
    'video/mp4',
    'audio/mpeg', // ✅ MP3 files
    'audio/mp3',  // ✅ Alternative MP3 MIME
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/octet-stream', // ✅ ADD: For files with generic MIME type
  ];

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.mp4', '.mp3', '.docx'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  // Check both MIME type AND file extension
  if (allowedExtensions.includes(fileExtension)) {
    console.log(`✅ File accepted: ${file.originalname}`);
    cb(null, true);
  } else if (allowedMimeTypes.includes(file.mimetype)) {
    console.log(`✅ File accepted by MIME: ${file.originalname}`);
    cb(null, true);
  } else {
    console.log(`❌ File rejected: ${file.originalname}`);
    cb(
      new Error(
        `Invalid file type for ${file.originalname}. Only JPG, PNG, PDF, MP4, MP3, and DOCX files are allowed.`
      ),
      false
    );
  }
};

// ====================================
// MULTER INSTANCES
// ====================================
export const upload = multer({
  storage: storage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
});

export const uploadMixed = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// ✅ FIXED: EVIDENCE UPLOAD
export const uploadEvidence = multer({
  storage: multer.memoryStorage(),
  fileFilter: evidenceFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5, // Max 5 files
  },
});
