const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  // New semantic fields
  creationMode: {
    type: String,
    enum: ['ai', 'manual'],
    default: 'manual'
  },
  originModule: {
    type: String,
    default: ''
  },
  originId: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  originLabel: {
    type: String,
    default: ''
  },
  linkedProjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  linkedProjectName: {
    type: String,
    default: ''
  },
  // Legacy fields for compatibility
  source: {
    type: String,
    required: false // No longer required, for migration
  },
  sourceDetail: {
    type: String,
    default: ''
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  projectName: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
