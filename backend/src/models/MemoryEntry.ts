import mongoose from 'mongoose';

const memoryEntrySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['preference', 'continuity_hint'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  source: {
    type: String,
    enum: ['manual'],
    default: 'manual'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

memoryEntrySchema.index({ userId: 1, active: -1, updatedAt: -1 });

type MemoryEntryAttrs = mongoose.InferSchemaType<typeof memoryEntrySchema>;

const MemoryEntry = mongoose.model<MemoryEntryAttrs, mongoose.Model<MemoryEntryAttrs>>('MemoryEntry', memoryEntrySchema);

export default MemoryEntry;
