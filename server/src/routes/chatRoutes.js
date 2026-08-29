const express = require('express');
const { body, param } = require('express-validator');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// All chat routes require authentication
router.use(authMiddleware);

router.get('/threads', chatController.getThreads);
router.post('/threads', chatController.createThread);
router.get('/threads/:threadId', chatController.getThreadMessages);

router.post(
  '/threads/:threadId/message',
  [
    param('threadId').notEmpty().withMessage('Thread ID is required.'),
    body('text').trim().notEmpty().withMessage('Query text cannot be empty.'),
    body('department').optional().isString(),
  ],
  chatController.sendMessage
);

router.post(
  '/messages/:messageId/feedback',
  [
    param('messageId').notEmpty().withMessage('Message ID is required.'),
    body('feedback').isIn(['like', 'dislike', null]).withMessage('Feedback must be like, dislike, or null.'),
  ],
  chatController.submitFeedback
);

router.put(
  '/messages/:messageId/edit-stream',
  [
    param('messageId').notEmpty().withMessage('Message ID is required.'),
    body('text').trim().notEmpty().withMessage('Query text cannot be empty.'),
    body('department').optional().isString(),
  ],
  chatController.editMessageStream
);

router.delete('/threads/:threadId', chatController.deleteThread);

module.exports = router;
