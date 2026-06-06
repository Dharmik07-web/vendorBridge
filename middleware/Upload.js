const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Generic disk storage factory
const createDiskStorage = (destination) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, destination),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    },
  });

// File filter - allow images and documents
const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`),
      false
    );
  }
};

// Attachment upload (PDF, images, Word)
const uploadAttachment = multer({
  storage: createDiskStorage('./uploads/attachments'),
  fileFilter: fileFilter([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Photo upload (images only)
const uploadPhoto = multer({
  storage: createDiskStorage('./uploads/photos'),
  fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp']),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

module.exports = { uploadAttachment, uploadPhoto };