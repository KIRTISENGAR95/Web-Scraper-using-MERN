const Story = require('../models/Story');
const { createError } = require('../utils/helpers');

// ─── @desc    Get all stories with sorting and pagination
// ─── @route   GET /api/stories
// ─── @access  Public
const getStories = async (req, res, next) => {
  try {
    // 1. Setup pagination defaults
    const { page = 1, limit = 20 } = req.query;
    
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10))); // Max 100 per page
    const skip = (pageNum - 1) * limitNum;

    // 2. Fetch stories (sorted by points descending) and total count simultaneously
    const [stories, total] = await Promise.all([
      Story.find()
        .sort({ points: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(), // Use lean() for faster execution when returning pure JSON
      Story.countDocuments(),
    ]);

    // 3. Send response
    res.status(200).json({
      success: true,
      count: stories.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      data: stories,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @desc    Get single story by ID
// ─── @route   GET /api/stories/:id
// ─── @access  Public
const getStoryById = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id).lean();

    if (!story) {
      return next(createError(`Story not found with ID ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: story,
    });
  } catch (error) {
    // Handle invalid ObjectId format gracefully instead of returning 500
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(createError(`Invalid Story ID format`, 400));
    }
    next(error);
  }
};

module.exports = {
  getStories,
  getStoryById,
};
