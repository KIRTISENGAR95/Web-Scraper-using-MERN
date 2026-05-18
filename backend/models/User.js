const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── User Schema ──────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },

    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Prevents password from being returned in queries by default
    },

    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─── Pre-Save Hook for Password Hashing ────────────────────────────────────────
userSchema.pre('save', async function () {
  // Only hash the password if it is new or has been modified
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance Method: Compare Passwords ────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─── Export ────────────────────────────────────────────────────────────────────
const User = mongoose.model('User', userSchema);
module.exports = User;
