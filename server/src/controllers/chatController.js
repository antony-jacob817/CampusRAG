const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const ChatThread = require('../models/ChatThread');
const ChatMessage = require('../models/ChatMessage');
const { executeRagPipeline, inMemoryThreads, inMemoryMessages } = require('../services/ragService');
const { isInMemoryFallback } = require('../config/db');

// List user's chat threads
const getThreads = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    if (isInMemoryFallback()) {
      const threads = Array.from(inMemoryThreads.values())
        .filter((t) => t.userId.toString() === userId)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      return res.status(200).json({ success: true, threads });
    }

    const threads = await ChatThread.find({ userId }).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, threads });
  } catch (error) {
    next(error);
  }
};

// Create a new thread
const createThread = async (req, res, next) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const { title = 'New Academic Query', department = 'all' } = req.body;

    if (isInMemoryFallback()) {
      const threadId = uuidv4();
      const newThread = {
        _id: threadId,
        id: threadId,
        userId,
        title,
        department,
        lastMessage: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryThreads.set(threadId, newThread);
      inMemoryMessages.set(threadId, []);
      return res.status(201).json({ success: true, thread: newThread });
    }

    const thread = await ChatThread.create({
      userId,
      title,
      department,
    });

    res.status(201).json({ success: true, thread });
  } catch (error) {
    next(error);
  }
};

// Get messages for a thread
const getThreadMessages = async (req, res, next) => {
  try {
    const { threadId } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    if (isInMemoryFallback()) {
      const thread = inMemoryThreads.get(threadId);
      if (!thread) {
        return res.status(404).json({ success: false, error: 'Chat thread not found.' });
      }
      const messages = inMemoryMessages.get(threadId) || [];
      return res.status(200).json({ success: true, thread, messages });
    }

    const thread = await ChatThread.findOne({ _id: threadId, userId });
    if (!thread) {
      return res.status(404).json({ success: false, error: 'Chat thread not found.' });
    }

    const messages = await ChatMessage.find({ threadId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, thread, messages });
  } catch (error) {
    next(error);
  }
};

// Send message & stream RAG response (SSE / JSON)
const sendMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
      });
    }

    const { threadId } = req.params;
    const { text, department, stream = true } = req.body;
    const user = req.user;
    const userId = (user._id || user.id).toString();

    // 1. Persist User Message
    const userMessageId = uuidv4();
    let userMsg = null;

    if (!isInMemoryFallback()) {
      userMsg = await ChatMessage.create({
        threadId,
        sender: 'user',
        text,
        department: department || 'general',
      });
    } else {
      userMsg = {
        _id: userMessageId,
        id: userMessageId,
        threadId,
        sender: 'user',
        text,
        department: department || 'general',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const msgs = inMemoryMessages.get(threadId) || [];
      msgs.push(userMsg);
      inMemoryMessages.set(threadId, msgs);
    }

    // Auto-update thread title from initial user query if default
    const cleanTitle = (text || '')
      .replace(/\[Attached Document:.*?\]\s*/g, '')
      .replace(/[\r\n]+/g, ' ')
      .trim();
    const formattedTitle = cleanTitle.length > 38 ? cleanTitle.substring(0, 35) + '...' : cleanTitle;

    if (formattedTitle) {
      if (!isInMemoryFallback()) {
        const threadDoc = await ChatThread.findById(threadId);
        if (threadDoc && (threadDoc.title === 'New Academic Query' || !threadDoc.title)) {
          threadDoc.title = formattedTitle;
          await threadDoc.save();
        }
      } else {
        const threadDoc = inMemoryThreads.get(threadId);
        if (threadDoc && (threadDoc.title === 'New Academic Query' || !threadDoc.title)) {
          threadDoc.title = formattedTitle;
        }
      }
    }

    // If client requested SSE streaming
    if (stream && req.headers.accept?.includes('text/event-stream')) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      // Send initial ack
      res.write(`data: ${JSON.stringify({ type: 'start', userMessage: userMsg })}\n\n`);

      const ragResult = await executeRagPipeline({
        threadId,
        userQuery: text,
        preferredDepartment: department || 'all',
        user,
        onToken: (token) => {
          res.write(`data: ${JSON.stringify({ type: 'token', token })}\n\n`);
        },
      });

      // Send completion metadata (confidenceScore, citations, wasGrounded)
      res.write(
        `data: ${JSON.stringify({
          type: 'complete',
          message: ragResult.message,
          confidenceScore: ragResult.confidenceScore,
          wasGrounded: ragResult.wasGrounded,
          citations: ragResult.citations,
          responseTimeMs: ragResult.responseTimeMs,
        })}\n\n`
      );

      res.write('data: [DONE]\n\n');
      return res.end();
    }

    // Standard non-streaming JSON response
    const ragResult = await executeRagPipeline({
      threadId,
      userQuery: text,
      preferredDepartment: department || 'all',
      user,
    });

    res.status(200).json({
      success: true,
      userMessage: userMsg,
      aiMessage: ragResult.message,
      confidenceScore: ragResult.confidenceScore,
      wasGrounded: ragResult.wasGrounded,
      citations: ragResult.citations,
      responseTimeMs: ragResult.responseTimeMs,
    });
  } catch (error) {
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
      return res.end();
    }
    next(error);
  }
};

// Feedback (thumbs up / thumbs down)
const submitFeedback = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { feedback, comment } = req.body;

    if (!['like', 'dislike', null].includes(feedback)) {
      return res.status(400).json({ success: false, error: 'Feedback must be "like", "dislike", or null.' });
    }

    if (isInMemoryFallback()) {
      for (const msgs of inMemoryMessages.values()) {
        const found = msgs.find((m) => m._id === messageId || m.id === messageId);
        if (found) {
          found.feedback = feedback;
          found.feedbackComment = comment || null;
          return res.status(200).json({ success: true, message: 'Feedback recorded.' });
        }
      }
      return res.status(200).json({ success: true, message: 'Feedback recorded.' });
    }

    const updated = await ChatMessage.findByIdAndUpdate(
      messageId,
      { feedback, feedbackComment: comment || null },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Feedback recorded.', data: updated });
  } catch (error) {
    next(error);
  }
};

// Delete thread
const deleteThread = async (req, res, next) => {
  try {
    const { threadId } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    if (isInMemoryFallback()) {
      inMemoryThreads.delete(threadId);
      inMemoryMessages.delete(threadId);
      return res.status(200).json({ success: true, message: 'Thread deleted.' });
    }

    await ChatMessage.deleteMany({ threadId });
    await ChatThread.findOneAndDelete({ _id: threadId, userId });

    res.status(200).json({ success: true, message: 'Thread and messages deleted.' });
  } catch (error) {
    next(error);
  }
};

// Edit existing user message, prune subsequent replies, and regenerate answer with streaming
const editMessageStream = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
      });
    }

    const { messageId } = req.params;
    const { text, department } = req.body;
    const user = req.user;

    let targetMsg = null;
    let threadId = null;

    if (!isInMemoryFallback()) {
      targetMsg = await ChatMessage.findById(messageId);
      if (!targetMsg) {
        return res.status(404).json({ success: false, error: 'Target message not found.' });
      }
      threadId = targetMsg.threadId;

      // 1. Delete all subsequent messages created after targetMsg
      await ChatMessage.deleteMany({
        threadId,
        createdAt: { $gt: targetMsg.createdAt },
      });

      // 2. Update target user message text
      targetMsg.text = text;
      targetMsg.department = department || targetMsg.department || 'general';
      targetMsg.updatedAt = new Date();
      await targetMsg.save();

      // If title needs update
      const cleanTitle = (text || '')
        .replace(/\[Attached Document:.*?\]\s*/g, '')
        .replace(/[\r\n]+/g, ' ')
        .trim();
      const formattedTitle = cleanTitle.length > 38 ? cleanTitle.substring(0, 35) + '...' : cleanTitle;
      if (formattedTitle) {
        const threadDoc = await ChatThread.findById(threadId);
        if (threadDoc && (threadDoc.title === 'New Academic Query' || !threadDoc.title)) {
          threadDoc.title = formattedTitle;
          await threadDoc.save();
        }
      }
    } else {
      for (const [tId, msgs] of inMemoryMessages.entries()) {
        const idx = msgs.findIndex((m) => m._id === messageId || m.id === messageId);
        if (idx !== -1) {
          threadId = tId;
          targetMsg = msgs[idx];
          targetMsg.text = text;
          targetMsg.department = department || targetMsg.department || 'general';
          targetMsg.updatedAt = new Date();

          // Prune all messages after this index
          const pruned = msgs.slice(0, idx + 1);
          inMemoryMessages.set(tId, pruned);
          break;
        }
      }
      if (!targetMsg) {
        return res.status(404).json({ success: false, error: 'Target message not found.' });
      }
    }

    // Set up SSE Stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send initial start event with updated user message
    res.write(`data: ${JSON.stringify({ type: 'start', userMessage: targetMsg })}\n\n`);

    const ragResult = await executeRagPipeline({
      threadId,
      userQuery: text,
      preferredDepartment: department || 'all',
      user,
      onToken: (token) => {
        res.write(`data: ${JSON.stringify({ type: 'token', token })}\n\n`);
      },
    });

    res.write(
      `data: ${JSON.stringify({
        type: 'complete',
        message: ragResult.message,
        confidenceScore: ragResult.confidenceScore,
        wasGrounded: ragResult.wasGrounded,
        citations: ragResult.citations,
        responseTimeMs: ragResult.responseTimeMs,
      })}\n\n`
    );

    res.write('data: [DONE]\n\n');
    return res.end();
  } catch (error) {
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
      return res.end();
    }
    next(error);
  }
};

module.exports = {
  getThreads,
  createThread,
  getThreadMessages,
  sendMessage,
  editMessageStream,
  submitFeedback,
  deleteThread,
};
