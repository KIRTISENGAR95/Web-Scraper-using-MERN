require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const healthRoutes = require('./routes/healthRoutes');
const scraperRoutes = require('./routes/scraperRoutes');
const authRoutes = require('./routes/authRoutes');
const storyRoutes = require('./routes/storyRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const { scrapeTopStories } = require('./utils/scraper');

// ─── Validate Critical Env Vars at Startup ─────────────────────────────────────
const REQUIRED_ENV_VARS = ['MONGO_URI'];
const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
  console.error('❌ [Server] Missing required environment variables:');
  missingVars.forEach((v) => console.error(`   ➜  ${v}`));
  console.error('   Create a .env file. See .env.example for reference.');
  process.exit(1);
}

// ─── Connect to Database ───────────────────────────────────────────────────────
connectDB();

// ─── App Setup ─────────────────────────────────────────────────────────────────
const app = express();

// ─── Global Middleware ─────────────────────────────────────────────────────────
app.use(helmet());                               // Security headers
app.use(cors({ origin: process.env.CLIENT_URL || '*' })); // CORS with env control
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')); // Logging
app.use(express.json({ limit: '10kb' }));        // Parse JSON — limit body size
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/health',   healthRoutes);
app.use('/api/scrape',   scraperRoutes);
app.use('/api/auth',     authRoutes);
app.use('/api/stories',  storyRoutes);

// TODO: Register additional routes here
// app.use('/api/users',   userRoutes);

// ─── 404 & Global Error Handlers ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, async () => {
  console.log('');
  console.log('🚀 ─────────────────────────────────────────');
  console.log(`   Server     : http://localhost:${PORT}`);
  console.log(`   Environment: ${NODE_ENV}`);
  console.log(`   Health     : http://localhost:${PORT}/api/health`);
  console.log('────────────────────────────────────────────');
  console.log('');

  // ─── Initial Scrape on Startup ────────────────────────────────────────────────
  try {
    console.log('⚙️  [Server] Triggering initial scrape on startup...');
    await scrapeTopStories();
  } catch (error) {
    console.error('❌ [Server] Initial scrape failed:');
    console.error(`   ➜  ${error.message}`);
  }
});

// ─── Unhandled Rejections & Exceptions ────────────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ [Server] Unhandled Promise Rejection:');
  console.error(`   ➜  ${reason}`);
  // Gracefully close server before exiting
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (error) => {
  console.error('❌ [Server] Uncaught Exception:');
  console.error(`   ➜  ${error.message}`);
  process.exit(1);
});

