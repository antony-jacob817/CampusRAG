const multer = require('multer');
const path = require('path');

// Store file in memory buffer for immediate pdf-parse and chunking
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const fileExt = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  if (fileExt === '.pdf' || mimeType === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are supported for document indexing (.pdf).'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB limit as required by spec
  },
  fileFilter,
});

module.exports = upload;
