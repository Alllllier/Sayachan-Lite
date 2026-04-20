const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
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
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  archived: {
    type: Boolean,
    default: false
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
