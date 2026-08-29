const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const User = require('../models/User');
const { isInMemoryFallback } = require('../config/db');
const { validateEmail } = require('../utils/emailValidator');

// In-Memory store fallback
const inMemoryUsers = global.__inMemoryUsers || new Map();
global.__inMemoryUsers = inMemoryUsers;

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      isEmailVerified: user.isEmailVerified,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

const register = async ({ name, email, password, role = 'student', department = 'general' }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Strict Disposable / Temporary Email Validation
  const emailValidation = validateEmail(normalizedEmail);
  if (!emailValidation.isValid) {
    throw new Error(emailValidation.error);
  }

  // 2. Generate Secure 24-hour Email Verification Token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const clientUrl = env.CLIENT_URL || 'https://campus-rag-ai.vercel.app';
  const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;

  if (isInMemoryFallback()) {
    for (const u of inMemoryUsers.values()) {
      if (u.email === normalizedEmail) {
        throw new Error('An account with this email already exists.');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    const newUser = {
      _id: userId,
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      department,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      nameUpdatedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inMemoryUsers.set(userId, newUser);
    console.log(`[AuthService] Generated verification link for ${normalizedEmail}: ${verificationLink}`);

    return {
      user: {
        id: userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        isEmailVerified: false,
      },
      verificationToken,
      verificationLink,
      message: 'Registration successful. Please verify your email before logging in.',
    };
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role,
    department,
    isEmailVerified: false,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: verificationExpires,
    nameUpdatedAt: null,
  });

  console.log(`[AuthService] Generated verification link for ${normalizedEmail}: ${verificationLink}`);

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      isEmailVerified: false,
    },
    verificationToken,
    verificationLink,
    message: 'Registration successful. Please verify your email before logging in.',
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  if (isInMemoryFallback()) {
    let matchedUser = null;
    for (const u of inMemoryUsers.values()) {
      if (u.email === normalizedEmail) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, matchedUser.password);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    // Enforce email verification (demo accounts are verified by default)
    if (!matchedUser.isEmailVerified && matchedUser.email !== 'student@campus.edu' && matchedUser.email !== 'admin@campus.edu') {
      const err = new Error('Please verify your email address before logging in. Check your inbox for the verification link or click Resend Verification.');
      err.unverified = true;
      err.email = normalizedEmail;
      throw err;
    }

    matchedUser.lastLogin = new Date();
    const token = generateToken(matchedUser);

    return {
      user: {
        id: matchedUser._id ? matchedUser._id.toString() : matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role,
        department: matchedUser.department,
        nameUpdatedAt: matchedUser.nameUpdatedAt || null,
        isEmailVerified: matchedUser.isEmailVerified,
      },
      token,
    };
  }

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password.');
  }

  // Enforce email verification (demo accounts are verified by default)
  if (!user.isEmailVerified && user.email !== 'student@campus.edu' && user.email !== 'admin@campus.edu') {
    const err = new Error('Please verify your email address before logging in. Check your inbox for the verification link or click Resend Verification.');
    err.unverified = true;
    err.email = normalizedEmail;
    throw err;
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user);

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      nameUpdatedAt: user.nameUpdatedAt || null,
      isEmailVerified: user.isEmailVerified,
    },
    token,
  };
};

const verifyEmail = async ({ token }) => {
  if (!token || typeof token !== 'string') {
    throw new Error('Verification token is required.');
  }

  if (isInMemoryFallback()) {
    let matchedUser = null;
    for (const u of inMemoryUsers.values()) {
      if (u.emailVerificationToken === token) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      throw new Error('Invalid or expired verification link. Please request a new verification link.');
    }

    if (matchedUser.emailVerificationExpires && new Date(matchedUser.emailVerificationExpires) < new Date()) {
      throw new Error('This verification link has expired. Please request a new verification link.');
    }

    matchedUser.isEmailVerified = true;
    matchedUser.emailVerificationToken = null;
    matchedUser.emailVerificationExpires = null;
    matchedUser.updatedAt = new Date();

    const authToken = generateToken(matchedUser);

    return {
      success: true,
      message: 'Email verified successfully! You are now authenticated.',
      user: {
        id: matchedUser._id ? matchedUser._id.toString() : matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role,
        department: matchedUser.department,
        isEmailVerified: true,
      },
      token: authToken,
    };
  }

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new Error('Invalid or expired verification link. Please request a new verification link.');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();

  const authToken = generateToken(user);

  return {
    success: true,
    message: 'Email verified successfully! You are now authenticated.',
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      isEmailVerified: true,
    },
    token: authToken,
  };
};

const resendVerification = async ({ email }) => {
  if (!email || typeof email !== 'string') {
    throw new Error('Email address is required.');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const newToken = crypto.randomBytes(32).toString('hex');
  const newExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const clientUrl = env.CLIENT_URL || 'https://campus-rag-ai.vercel.app';
  const verificationLink = `${clientUrl}/verify-email?token=${newToken}`;

  if (isInMemoryFallback()) {
    let matchedUser = null;
    for (const u of inMemoryUsers.values()) {
      if (u.email === normalizedEmail) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      throw new Error('No registered account found with this email address.');
    }

    if (matchedUser.isEmailVerified) {
      throw new Error('This account email is already verified. You can log in directly.');
    }

    matchedUser.emailVerificationToken = newToken;
    matchedUser.emailVerificationExpires = newExpires;

    console.log(`[AuthService] Resent verification link for ${normalizedEmail}: ${verificationLink}`);

    return {
      success: true,
      verificationToken: newToken,
      verificationLink,
      message: `A new verification link has been generated for ${normalizedEmail}.`,
    };
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new Error('No registered account found with this email address.');
  }

  if (user.isEmailVerified) {
    throw new Error('This account email is already verified. You can log in directly.');
  }

  user.emailVerificationToken = newToken;
  user.emailVerificationExpires = newExpires;
  await user.save();

  console.log(`[AuthService] Resent verification link for ${normalizedEmail}: ${verificationLink}`);

  return {
    success: true,
    verificationToken: newToken,
    verificationLink,
    message: `A new verification link has been generated for ${normalizedEmail}.`,
  };
};

const updateProfile = async ({ userId, name, department }) => {
  if (isInMemoryFallback()) {
    const user = inMemoryUsers.get(userId);
    if (!user) {
      throw new Error('User profile not found.');
    }

    // Enforce 30-Day Name Change Cooldown
    if (name && name.trim() && name.trim() !== user.name) {
      if (user.nameUpdatedAt) {
        const lastUpdated = new Date(user.nameUpdatedAt).getTime();
        const now = Date.now();
        const cooldownMs = 30 * 24 * 60 * 60 * 1000;
        const diff = now - lastUpdated;
        if (diff < cooldownMs) {
          const remainingDays = Math.ceil((cooldownMs - diff) / (24 * 60 * 60 * 1000));
          const nextDate = new Date(lastUpdated + cooldownMs).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          throw new Error(
            `Your display name can only be changed once every 30 days. You can change your name again in ${remainingDays} day(s) on ${nextDate}.`
          );
        }
      }
      user.name = name.trim();
      user.nameUpdatedAt = new Date();
    }

    if (department) {
      user.department = department;
    }
    user.updatedAt = new Date();

    const token = generateToken(user);

    return {
      user: {
        id: user._id ? user._id.toString() : user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        nameUpdatedAt: user.nameUpdatedAt,
        isEmailVerified: user.isEmailVerified,
      },
      token,
      message: 'Profile updated successfully.',
    };
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User profile not found.');
  }

  // Enforce 30-Day Name Change Cooldown
  if (name && name.trim() && name.trim() !== user.name) {
    if (user.nameUpdatedAt) {
      const lastUpdated = new Date(user.nameUpdatedAt).getTime();
      const now = Date.now();
      const cooldownMs = 30 * 24 * 60 * 60 * 1000;
      const diff = now - lastUpdated;
      if (diff < cooldownMs) {
        const remainingDays = Math.ceil((cooldownMs - diff) / (24 * 60 * 60 * 1000));
        const nextDate = new Date(lastUpdated + cooldownMs).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        throw new Error(
          `Your display name can only be changed once every 30 days. You can change your name again in ${remainingDays} day(s) on ${nextDate}.`
        );
      }
    }
    user.name = name.trim();
    user.nameUpdatedAt = new Date();
  }

  if (department) {
    user.department = department;
  }

  await user.save();

  const token = generateToken(user);

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      nameUpdatedAt: user.nameUpdatedAt,
      isEmailVerified: user.isEmailVerified,
    },
    token,
    message: 'Profile updated successfully.',
  };
};

const getProfile = async (userId) => {
  if (isInMemoryFallback()) {
    const user = inMemoryUsers.get(userId);
    if (!user) {
      return {
        id: userId,
        name: 'Demo Student',
        email: 'student@campus.edu',
        role: 'student',
        department: 'general',
        nameUpdatedAt: null,
        isEmailVerified: true,
      };
    }
    return {
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      nameUpdatedAt: user.nameUpdatedAt || null,
      isEmailVerified: user.isEmailVerified ?? true,
    };
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User profile not found.');
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    nameUpdatedAt: user.nameUpdatedAt || null,
    isEmailVerified: user.isEmailVerified ?? true,
  };
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  updateProfile,
  getProfile,
  generateToken,
};
