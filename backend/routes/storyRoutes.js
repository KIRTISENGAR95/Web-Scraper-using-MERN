const express = require('express');
const router = express.Router();
const { getStories, getStoryById, toggleBookmark, getBookmarkedStories } = require('../controllers/storyController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/stories
router.get('/', getStories);

// GET /api/stories/bookmarks (Must be before /:id)
router.get('/bookmarks', protect, getBookmarkedStories);

// GET /api/stories/:id
router.get('/:id', getStoryById);

// POST /api/stories/:id/bookmark
router.post('/:id/bookmark', protect, toggleBookmark);

module.exports = router;
