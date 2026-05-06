import mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  passwordSalt: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'tester'],
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  disabledAt: {
    type: Date,
    default: null
  },
  lastLoginAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

type UserAttrs = mongoose.InferSchemaType<typeof userSchema>;

const User = mongoose.model<UserAttrs, mongoose.Model<UserAttrs>>('User', userSchema);

export = User;
