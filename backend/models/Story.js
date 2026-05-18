const mongoose = require('mongoose');

// ─── Story Schema ──────────────────────────────────────────────────────────────
const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Story title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },

    url: {
      type: String,
      trim: true,
      default: null,
      unique: true,                  // ← DB-level duplicate prevention
      sparse: true,                  // ← allows multiple null values (Ask-HN posts)
      match: [
        /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w\-.~:/?#[\]@!$&'()*+,;=%]*)?$/,
        'Please provide a valid URL',
      ],
    },

    points: {
      type: Number,
      default: 0,
      min: [0, 'Points cannot be negative'],
    },

    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },

    postedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // ─── Mongoose Options ────────────────────────────────────────────────────
    timestamps: true,          // Adds createdAt & updatedAt automatically
    versionKey: false,         // Remove __v field
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
storySchema.index({ points: -1 });      // Fast sort by top stories
storySchema.index({ postedAt: -1 });    // Fast sort by newest
storySchema.index({ author: 1 });       // Fast filter by author

// ─── Virtual: domain ──────────────────────────────────────────────────────────
// Extracts the hostname from the URL (e.g. "github.com") — read-only, not stored
storySchema.virtual('domain').get(function () {
  if (!this.url) return null;
  try {
    return new URL(this.url).hostname.replace('www.', '');
  } catch {
    return null;
  }
});

// ─── Export ────────────────────────────────────────────────────────────────────
const Story = mongoose.model('Story', storySchema);
module.exports = Story;
