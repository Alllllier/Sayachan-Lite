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
  nextAction: {
    type: String,
    default: ''
  },
  lastCompletedAction: {
    type: String,
    default: ''
  },
  focusHistory: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
