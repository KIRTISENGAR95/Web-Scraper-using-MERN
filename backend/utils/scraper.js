const axios = require('axios');
const cheerio = require('cheerio');
const Story = require('../models/Story');

// ─── Constants ─────────────────────────────────────────────────────────────────
const HN_URL = 'https://news.ycombinator.com';
const TOP_N  = 10;

const AXIOS_CONFIG = {
  timeout: 10_000,                       // 10s request timeout
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Resolve a relative HN URL to an absolute URL.
 * Stories that link to "item?id=..." are internal HN discussions.
 */
const resolveUrl = (href) => {
  if (!href) return null;
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  // Internal HN link (e.g. "item?id=12345")
  return `${HN_URL}/${href}`;
};

/**
 * Parse HN "postedAt" from the <span class="age"> title attribute.
 * HN stores it as an ISO-like string: "2024-05-18T06:00:00"
 */
const parsePostedAt = ($, ageEl) => {
  const title = $(ageEl).attr('title'); // e.g. "2024-05-18T06:00:00"
  if (title) {
    const parsed = new Date(title);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date(); // fallback to now
};

// ─── Fetch & Parse ─────────────────────────────────────────────────────────────

/**
 * Fetches the HN front page and parses story rows into plain objects.
 * Returns an array of raw story objects (up to TOP_N).
 */
const fetchHNPage = async () => {
  console.log(`🌐 [Scraper] Fetching ${HN_URL} ...`);

  let html;
  try {
    const response = await axios.get(HN_URL, AXIOS_CONFIG);
    html = response.data;
    console.log(`✅ [Scraper] Page fetched successfully (${(html.length / 1024).toFixed(1)} KB)`);
  } catch (err) {
    const msg = err.code === 'ECONNABORTED'
      ? 'Request timed out after 10s'
      : err.message;
    throw new Error(`[Scraper] Failed to fetch HN page: ${msg}`);
  }

  const $ = cheerio.load(html);
  const stories = [];

  // HN renders stories in <tr class="athing"> rows
  // The subtext row immediately follows and holds points, author, age
  $('tr.athing').each((i, row) => {
    if (stories.length >= TOP_N) return false; // stop after TOP_N

    try {
      const $row     = $(row);
      const storyId  = $row.attr('id');

      // ── Title & URL ──────────────────────────────────────────────────────────
      const titleAnchor = $row.find('span.titleline > a').first();
      const title       = titleAnchor.text().trim();
      const rawUrl      = titleAnchor.attr('href');
      const url         = resolveUrl(rawUrl);

      if (!title) return; // skip malformed rows

      // ── Subtext row (points, author, age) ────────────────────────────────────
      const subRow   = $row.next('tr');           // <tr class="athing"> + <tr>
      const subtext  = subRow.find('td.subtext'); // older HN layout
      const subline  = subRow.find('span.subline'); // newer HN layout
      const $sub     = subtext.length ? subtext : subline;

      const pointsText = $sub.find('span.score').text();
      const points     = pointsText ? parseInt(pointsText, 10) : 0;

      const author     = $sub.find('a.hnuser').text().trim() || 'unknown';

      const ageEl      = $sub.find('span.age');
      const postedAt   = parsePostedAt($, ageEl);

      stories.push({ storyId, title, url, points, author, postedAt });
    } catch (parseErr) {
      console.warn(`⚠️  [Scraper] Skipped row ${i}: ${parseErr.message}`);
    }
  });

  console.log(`📋 [Scraper] Parsed ${stories.length} stories from page`);
  return stories;
};

// ─── Save to MongoDB ───────────────────────────────────────────────────────────

/**
 * Upserts stories into MongoDB using the URL as the unique key.
 * - NEW stories are inserted.
 * - EXISTING stories (same URL) have their points & author updated.
 * - Returns a summary { inserted, updated, skipped }.
 */
const saveStories = async (stories) => {
  let inserted = 0;
  let updated  = 0;
  let skipped  = 0;

  for (const story of stories) {
    const { storyId, title, url, points, author, postedAt } = story;

    // Use url as unique key; fall back to storyId for discussion-only posts
    const uniqueKey = url || `${HN_URL}/item?id=${storyId}`;

    try {
      const result = await Story.findOneAndUpdate(
        { url: uniqueKey },                         // ← match condition (duplicate check)
        {
          $set:         { points, author },         // ← always refresh points & author
          $setOnInsert: { title, url: uniqueKey, postedAt }, // ← only on first insert
        },
        {
          upsert: true,                  // insert if not found
          returnDocument: 'after',       // mongoose v7+ replaces `new: true`
          runValidators: true,
          rawResult: true,               // get upsertedId to detect insert vs update
        }
      );

      if (result.lastErrorObject?.updatedExisting) {
        updated++;
        console.log(`🔄 [Scraper] Updated : "${title.slice(0, 60)}"`);
      } else {
        inserted++;
        console.log(`➕ [Scraper] Inserted: "${title.slice(0, 60)}"`);
      }
    } catch (err) {
      skipped++;
      console.warn(`⚠️  [Scraper] Skipped  : "${title?.slice(0, 60)}" — ${err.message}`);
    }
  }

  return { inserted, updated, skipped };
};

// ─── Main Export ───────────────────────────────────────────────────────────────

/**
 * Full scrape pipeline:
 *   1. Fetch HN front page
 *   2. Parse top N stories
 *   3. Upsert into MongoDB
 *
 * @returns {{ stories: object[], inserted: number, updated: number, skipped: number }}
 */
const scrapeTopStories = async () => {
  console.log('');
  console.log('🕷️  ── HN Scraper Started ────────────────────');

  const stories = await fetchHNPage();

  if (stories.length === 0) {
    throw new Error('[Scraper] No stories parsed — HN may have changed its HTML structure.');
  }

  const summary = await saveStories(stories);

  console.log('');
  console.log('📊 [Scraper] Summary:');
  console.log(`   ➜  Inserted : ${summary.inserted}`);
  console.log(`   ➜  Updated  : ${summary.updated}`);
  console.log(`   ➜  Skipped  : ${summary.skipped}`);
  console.log('────────────────────────────────────────────');
  console.log('');

  return { stories, ...summary };
};

module.exports = { scrapeTopStories };
