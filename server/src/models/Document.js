const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      enum: ['admissions', 'academics', 'examinations', 'hostel', 'placements', 'general'],
      default: 'general',
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    totalChunks: {
      type: Number,
      default: 0,
    },
    totalPages: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'uploading', 'chunking', 'embedding', 'indexed', 'completed', 'failed'],
      default: 'pending',
    },
    errorMessage: {
      type: String,
      default: null,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    uploaderName: {
      type: String,
      default: 'System Admin',
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);

module.exports = Document;
