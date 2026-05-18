require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const healthRoutes = require('./routes/healthRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

// ─── Connect to Database ───────────────────────────────────────────────────────
connectDB();

// ─── App Setup ─────────────────────────────────────────────────────────────────
const app = express();

// ─── Global Middleware ─────────────────────────────────────────────────────────
app.use(helmet());                        // Security headers
app.use(cors());                          // Enable CORS
app.use(morgan('dev'));                   // HTTP request logger
app.use(express.json());                  // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes);

// TODO: Register additional routes here
// app.use('/api/users', userRoutes);
// app.use('/api/auth',  authRoutes);

// ─── 404 & Error Handlers ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
