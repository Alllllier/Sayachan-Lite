import mongoose from 'mongoose';

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
    type: mongoose.Schema.Types.ObjectId,
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
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

taskSchema.index({ userId: 1, archived: 1, createdAt: -1 });
taskSchema.index({ userId: 1, originModule: 1, originId: 1, archived: 1 });

type TaskAttrs = mongoose.InferSchemaType<typeof taskSchema>;

const Task = mongoose.model<TaskAttrs, mongoose.Model<TaskAttrs>>('Task', taskSchema);

export default Task;
