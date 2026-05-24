import mongoose from 'mongoose';

const sourceReceiptSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['project', 'note', 'task'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const memoryCandidateSchema = new mongoose.Schema({
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
  reason: {
    type: String,
    default: undefined,
    trim: true
  },
  source: {
    type: String,
    enum: ['assistant_suggested_user_approved'],
    required: true
  },
  confidence: {
    type: Number,
    default: undefined
  }
}, { _id: false });

const focusSnapshotSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['note', 'project'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const chatMessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatConversation',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  providerState: {
    type: mongoose.Schema.Types.Mixed,
    default: undefined
  },
  sourceReceipts: {
    type: [sourceReceiptSchema],
    default: undefined
  },
  memoryCandidate: {
    type: memoryCandidateSchema,
    default: undefined
  },
  focusSnapshot: {
    type: focusSnapshotSchema,
    default: undefined
  }
}, {
  timestamps: true
});

chatMessageSchema.index({ userId: 1, conversationId: 1, createdAt: 1 });
chatMessageSchema.index({ userId: 1, createdAt: -1 });

type ChatMessageAttrs = mongoose.InferSchemaType<typeof chatMessageSchema>;

const ChatMessage = mongoose.model<ChatMessageAttrs, mongoose.Model<ChatMessageAttrs>>('ChatMessage', chatMessageSchema);

export default ChatMessage;
