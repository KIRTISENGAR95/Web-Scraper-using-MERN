const express = require('express');
const router = express.Router();
const { runScraper, getStories } = require('../controllers/scraperController');

// POST /api/scrape     → trigger a fresh scrape
router.post('/', runScraper);

// GET  /api/scraper/stories → return saved stories
router.get('/stories', getStories);

module.exports = router;
