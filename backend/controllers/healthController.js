// @desc    Health check endpoint
// @route   GET /api/health
// @access  Public
const healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: '✅ Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
};

module.exports = { healthCheck };
