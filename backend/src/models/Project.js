const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'on_hold'],
    default: 'pending'
  },
  archived: {
    type: Boolean,
    default: false
  },
  currentFocusTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  pinnedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
