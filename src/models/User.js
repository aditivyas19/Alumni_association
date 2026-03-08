const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // Hide password by default
    },
    role: {
      type: String,
      enum: ['alumni', 'admin', 'moderator'],
      default: 'alumni',
    },
    graduationYear: {
      type: Number,
      index: true,
    },
    degree: {
      type: String,
      trim: true,
    },
    major: {
      type: String,
      trim: true,
    },
    currentJob: {
      jobTitle: String,
      company: {
        type: String,
        index: true,
      },
      industry: String,
    },
    socialLinks: {
      linkedin: String,
      twitter: String,
      github: String,
    },
    profilePicture: {
      type: String,
      default: 'default-profile.png',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// email index is already created by unique: true above

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
