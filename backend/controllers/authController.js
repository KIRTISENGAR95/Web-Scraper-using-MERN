const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { createError } = require('../utils/helpers');

// ─── @desc    Register a new user
// ─── @route   POST /api/auth/register
// ─── @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic validation
    if (!name || !email || !password) {
      return next(createError('Please provide name, email, and password', 400));
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(createError('User already exists', 400));
    }

    // 3. Create user (password is hashed in User model pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
    });

    // 4. Send response with token
    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        },
      });
    } else {
      next(createError('Invalid user data received', 400));
    }
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Authenticate user & get token
// ─── @route   POST /api/auth/login
// ─── @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || !password) {
      return next(createError('Please provide email and password', 400));
    }

    // 2. Find user and explicitly select password field (since select: false in schema)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(createError('Invalid email or password', 401));
    }

    // 3. Check password using instance method from User model
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(createError('Invalid email or password', 401));
    }

    // 4. Send response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
};
