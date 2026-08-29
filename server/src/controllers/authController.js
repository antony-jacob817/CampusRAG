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
      message: 'Account created successfully.',
      ...result,
    });
  } catch (error) {
    next(error);
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
  getMe,
};
