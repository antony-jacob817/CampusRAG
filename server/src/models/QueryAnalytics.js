const mongoose = require('mongoose');

const queryAnalyticsSchema = new mongoose.Schema(
  {
    queryText: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
      index: true,
    },
    wasGrounded: {
      type: Boolean,
      required: true,
      index: true,
    },
    confidenceScore: {
      type: Number,
      required: true,
    },
    retrievedChunksCount: {
      type: Number,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    userRole: {
      type: String,
      default: 'student',
    },
    responseTimeMs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const QueryAnalytics = mongoose.models.QueryAnalytics || mongoose.model('QueryAnalytics', queryAnalyticsSchema);

module.exports = QueryAnalytics;
