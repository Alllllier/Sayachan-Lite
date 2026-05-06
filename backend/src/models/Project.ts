import mongoose = require('mongoose');

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
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

projectSchema.index({ userId: 1, archived: 1, isPinned: -1, pinnedAt: -1, updatedAt: -1 });

type ProjectAttrs = mongoose.InferSchemaType<typeof projectSchema>;
type ProjectDocument = mongoose.HydratedDocument<ProjectAttrs>;

const Project = mongoose.model<ProjectAttrs, mongoose.Model<ProjectAttrs>>('Project', projectSchema);

export = Project;
