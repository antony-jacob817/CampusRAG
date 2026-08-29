const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const User = require('../models/User');
const { isInMemoryFallback } = require('../config/db');

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
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

const register = async ({ name, email, password, role = 'student', department = 'general' }) => {
  const normalizedEmail = email.toLowerCase().trim();

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
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      department,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inMemoryUsers.set(userId, newUser);
    const token = generateToken(newUser);
    return {
      user: {
        id: userId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
      },
      token,
    };
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role,
    department,
  });

  const token = generateToken(user);
  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
    token,
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

    matchedUser.lastLogin = new Date();
    const token = generateToken(matchedUser);

    return {
      user: {
        id: matchedUser._id ? matchedUser._id.toString() : matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role,
        department: matchedUser.department,
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
    },
    token,
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
      };
    }
    return {
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
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
  };
};

module.exports = {
  register,
  login,
  getProfile,
  generateToken,
};
