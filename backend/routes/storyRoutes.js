const express = require('express');
const router = express.Router();
const { getStories, getStoryById } = require('../controllers/storyController');

// GET /api/stories
router.get('/', getStories);

// GET /api/stories/:id
router.get('/:id', getStoryById);

module.exports = router;
