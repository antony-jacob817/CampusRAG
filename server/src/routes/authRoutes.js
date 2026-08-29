const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email address is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    body('role').optional().isIn(['student', 'admin']).withMessage('Role must be student or admin.'),
    body('department').optional().isString().trim(),
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email address is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  authController.login
);

router.post(
  '/verify-email',
  [
    body('token').optional().isString().trim(),
  ],
  authController.verifyEmail
);

router.get('/verify-email', authController.verifyEmail);

router.post(
  '/resend-verification',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email address is required.'),
  ],
  authController.resendVerification
);

router.put(
  '/profile',
  authMiddleware,
  [
    body('name').optional().isString().trim(),
    body('department').optional().isString().trim(),
  ],
  authController.updateProfile
);

router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
