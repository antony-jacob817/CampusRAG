const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const { isInMemoryFallback } = require('../config/db');

// In-memory user cache if in fallback mode
const inMemoryUsers = global.__inMemoryUsers || new Map();
global.__inMemoryUsers = inMemoryUsers;

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query?.token) {
      // Allow token via query param for SSE streams
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token missing. Please log in.',
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    let user;
    if (isInMemoryFallback()) {
      user = inMemoryUsers.get(decoded.id);
    } else {
      user = await User.findById(decoded.id);
    }

    if (!user) {
      // If user was created in another session but JWT is valid, build lightweight user object
      user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || 'User',
        email: decoded.email || 'user@campus.edu',
        role: decoded.role || 'student',
        department: decoded.department || 'general',
      };
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session token. Please log in again.',
      });
    }
    next(error);
  }
};

module.exports = authMiddleware;
