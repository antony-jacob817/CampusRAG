const express = require('express');
const { param } = require('express-validator');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/documents', adminController.getDocuments);
router.post('/documents/upload', upload.single('file'), adminController.uploadDocument);
router.delete('/documents/:id', [param('id').notEmpty().withMessage('Document ID is required.')], adminController.deleteDocument);
router.get('/analytics', adminController.getAnalytics);

module.exports = router;
