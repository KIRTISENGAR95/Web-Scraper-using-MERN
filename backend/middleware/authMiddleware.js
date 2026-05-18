const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createError } = require('../utils/helpers');

// ─── @desc    Protect routes using JWT Token
const protect = async (req, res, next) => {
  let token;

  // 1. Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Get token from header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Get user from the token and attach to request object
      // Exclude the password from the fetched user data
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return next(createError('Not authorized, user not found', 401));
      }

      next();
    } catch (error) {
      console.error(`❌ [AuthMiddleware] Token verification failed: ${error.message}`);
      return next(createError('Not authorized, token failed', 401));
    }
  }

  // 5. If no token is provided
  if (!token) {
    return next(createError('Not authorized, no token', 401));
  }
};

module.exports = { protect };
