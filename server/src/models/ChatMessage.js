const mongoose = require('mongoose');

const citationSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    pageNumber: {
      type: Number,
      default: 1,
    },
    chunkIndex: {
      type: Number,
      default: 0,
    },
    snippet: {
      type: String,
      required: true,
    },
    similarityScore: {
      type: Number,
      default: 0,
    },
    department: {
      type: String,
      default: 'general',
    },
  },
  { _id: false }
);

const chatMessageSchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatThread',
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ['user', 'ai'],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    confidenceScore: {
      type: Number,
      default: 0,
    },
    wasGrounded: {
      type: Boolean,
      default: true,
    },
    department: {
      type: String,
      default: 'general',
    },
    citations: {
      type: [citationSchema],
      default: [],
    },
    feedback: {
      type: String,
      enum: ['like', 'dislike', null],
      default: null,
    },
    feedbackComment: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
