const { validationResult } = require('express-validator');
const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { name, email, password, role, department } = req.body;
    const result = await authService.register({ name, email, password, role, department });

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please verify your email before logging in.',
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || 'Registration failed.',
    });
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      ...result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message || 'Authentication failed.',
      unverified: error.unverified || false,
      email: error.email || null,
    });
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const token = req.body.token || req.query.token;
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required.',
      });
    }

    const result = await authService.verifyEmail({ token });
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || 'Email verification failed.',
    });
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required.',
      });
    }

    const result = await authService.resendVerification({ email });
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to resend verification email.',
    });
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, department } = req.body;

    const result = await authService.updateProfile({ userId, name, department });
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update profile.',
    });
  }
};

const getMe = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await authService.getProfile(userId);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  updateProfile,
  getMe,
};
