const mongoose = require('mongoose');

const chatThreadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Academic Query',
      trim: true,
    },
    department: {
      type: String,
      enum: ['all', 'admissions', 'academics', 'examinations', 'hostel', 'placements', 'general'],
      default: 'all',
    },
    lastMessage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const ChatThread = mongoose.models.ChatThread || mongoose.model('ChatThread', chatThreadSchema);

module.exports = ChatThread;
