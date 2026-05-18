const { scrapeTopStories } = require('../utils/scraper');
const Story = require('../models/Story');

// ─── @desc    Trigger a fresh scrape from Hacker News
// ─── @route   POST /api/scraper/run
// ─── @access  Public
const runScraper = async (req, res, next) => {
  try {
    const result = await scrapeTopStories();

    res.status(200).json({
      success: true,
      message: `Scrape complete. ${result.inserted} new, ${result.updated} updated, ${result.skipped} skipped.`,
      data: {
        inserted: result.inserted,
        updated:  result.updated,
        skipped:  result.skipped,
        count:    result.stories.length,
      },
    });
  } catch (error) {
    console.error(`❌ [ScraperController] ${error.message}`);
    next(error); // forwards to global errorHandler middleware
  }
};

// ─── @desc    Get all saved stories from MongoDB
// ─── @route   GET /api/scraper/stories
// ─── @access  Public
const getStories = async (req, res, next) => {
  try {
    const { sort = 'points', order = 'desc', limit = 30, page = 1 } = req.query;

    const ALLOWED_SORT_FIELDS = ['points', 'postedAt', 'createdAt', 'author'];
    const sortField = ALLOWED_SORT_FIELDS.includes(sort) ? sort : 'points';
    const sortOrder = order === 'asc' ? 1 : -1;

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const [stories, total] = await Promise.all([
      Story.find()
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Story.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      total,
      page:    pageNum,
      pages:   Math.ceil(total / limitNum),
      count:   stories.length,
      data:    stories,
    });
  } catch (error) {
    console.error(`❌ [ScraperController] ${error.message}`);
    next(error);
  }
};

module.exports = { runScraper, getStories };
