const { validationResult } = require('express-validator');
const documentService = require('../services/documentService');
const { getVectorStats } = require('../services/vectorService');
const QueryAnalytics = require('../models/QueryAnalytics');
const Document = require('../models/Document');
const User = require('../models/User');
const { isInMemoryFallback } = require('../config/db');
const { inMemoryAnalytics } = require('../services/ragService');

// List indexed documents
const getDocuments = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    const documents = await documentService.listDocuments({ department, search });
    res.status(200).json({ success: true, documents });
  } catch (error) {
    next(error);
  }
};

// Upload & Index PDF
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file provided. Please upload a valid .pdf document.',
      });
    }

    const { title, department = 'general' } = req.body;
    const user = req.user;

    const result = await documentService.ingestPdfDocument({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      title: title || req.file.originalname.replace(/\.pdf$/i, ''),
      department,
      user,
    });

    res.status(201).json({
      success: true,
      message: `Document "${result.title}" indexed successfully with ${result.totalChunks} chunks.`,
      document: result,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Document
const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await documentService.deleteDocument(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Admin Analytics & Telemetry
const getAnalytics = async (req, res, next) => {
  try {
    let analyticsRecords = [];
    let totalDocsCount = 0;
    let totalUsersCount = 2;

    if (isInMemoryFallback()) {
      analyticsRecords = inMemoryAnalytics;
      const docs = await documentService.listDocuments({});
      totalDocsCount = docs.length;
      totalUsersCount = (global.__inMemoryUsers ? global.__inMemoryUsers.size : 2);
    } else {
      analyticsRecords = await QueryAnalytics.find().sort({ createdAt: -1 }).limit(200);
      totalDocsCount = await Document.countDocuments();
      totalUsersCount = await User.countDocuments();
    }

    const totalQueries = analyticsRecords.length;
    const groundedQueries = analyticsRecords.filter((a) => a.wasGrounded).length;
    const ungroundedQueries = totalQueries - groundedQueries;
    const groundingRate = totalQueries > 0 ? Number(((groundedQueries / totalQueries) * 100).toFixed(1)) : 100;

    const avgConfidence = totalQueries > 0
      ? Number((analyticsRecords.reduce((acc, curr) => acc + (curr.confidenceScore || 0), 0) / totalQueries).toFixed(2))
      : 0.92;

    const avgResponseTimeMs = totalQueries > 0
      ? Math.round(analyticsRecords.reduce((acc, curr) => acc + (curr.responseTimeMs || 0), 0) / totalQueries)
      : 240;

    // Department Distribution
    const departmentDistribution = {
      admissions: 0,
      academics: 0,
      examinations: 0,
      hostel: 0,
      placements: 0,
      general: 0,
    };

    analyticsRecords.forEach((a) => {
      const d = a.department || 'general';
      if (departmentDistribution[d] !== undefined) {
        departmentDistribution[d] += 1;
      } else {
        departmentDistribution.general += 1;
      }
    });

    // Unresolved Queries (questions with NO_GROUNDED_DATA)
    const unresolvedQueries = analyticsRecords
      .filter((a) => !a.wasGrounded)
      .slice(0, 10)
      .map((a) => ({
        queryText: a.queryText,
        department: a.department,
        timestamp: a.createdAt,
        confidenceScore: a.confidenceScore,
      }));

    // Recent queries feed
    const recentQueries = analyticsRecords.slice(0, 10);

    const vectorStats = getVectorStats();

    res.status(200).json({
      success: true,
      metrics: {
        totalQueries,
        groundedQueries,
        ungroundedQueries,
        groundingRate,
        avgConfidence,
        avgResponseTimeMs,
        totalDocuments: totalDocsCount,
        totalUsers: totalUsersCount,
      },
      departmentDistribution,
      unresolvedQueries,
      recentQueries,
      vectorStats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocuments,
  uploadDocument,
  deleteDocument,
  getAnalytics,
};
