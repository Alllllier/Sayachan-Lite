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

const candidateAffectSchema = new mongoose.Schema({
  valence: {
    type: Number,
    required: true
  },
  arousal: {
    type: Number,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  }
}, { _id: false });

const candidateReflectionSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  valence: {
    type: Number,
    required: true
  },
  arousal: {
    type: Number,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  }
}, { _id: false });

const memorySourceRefSchema = new mongoose.Schema({
  sourceId: {
    type: String,
    required: true,
    trim: true
  },
  sourceType: {
    type: String,
    enum: [
      'turn',
      'advance',
      'host_tool_result',
      'host_context',
      'manual_review',
      'system_seed',
      'other'
    ],
    required: true
  },
  summary: {
    type: String,
    default: undefined,
    trim: true
  },
  sourceTrace: {
    type: [String],
    default: undefined
  }
}, { _id: false });

const candidateProposalSchema = new mongoose.Schema({
  proposalId: {
    type: String,
    required: true,
    trim: true
  },
  kind: {
    type: String,
    enum: ['memory', 'relationship_sediment', 'character_state', 'reflection_artifact'],
    required: true
  },
  memoryKind: {
    type: String,
    enum: ['user_fact', 'user_preference', 'interaction_preference', 'important_event'],
    default: undefined
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  confidence: {
    type: Number,
    required: true
  },
  userConfirmationRequired: {
    type: Boolean,
    default: true
  },
  observedAffect: {
    type: candidateAffectSchema,
    default: undefined
  },
  reflection: {
    type: candidateReflectionSchema,
    default: undefined
  },
  sourceRefs: {
    type: [memorySourceRefSchema],
    default: undefined
  },
  sourceTrace: {
    type: [String],
    default: undefined
  },
  status: {
    type: String,
    enum: ['pending', 'dismissed', 'accepted'],
    default: 'pending'
  },
  decidedAt: {
    type: Date,
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

const turnActivityItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true,
    trim: true
  },
  kind: {
    type: String,
    enum: ['assistant_progress', 'tool_status', 'capability_notice'],
    required: true
  },
  status: {
    type: String,
    enum: ['planned', 'started', 'completed', 'skipped', 'unavailable', 'failed'],
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  display: {
    type: String,
    enum: ['collapse_item', 'inline_during_turn'],
    required: true
  },
  canonicalMessage: {
    type: Boolean,
    required: true
  },
  capability: {
    type: String,
    default: undefined,
    trim: true
  },
  sourceTrace: {
    type: [String],
    default: undefined
  }
}, { _id: false });

const turnActivitySchema = new mongoose.Schema({
  defaultCollapsed: {
    type: Boolean,
    required: true
  },
  items: {
    type: [turnActivityItemSchema],
    required: true
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
  candidateProposals: {
    type: [candidateProposalSchema],
    default: undefined
  },
  focusSnapshot: {
    type: focusSnapshotSchema,
    default: undefined
  },
  turnActivity: {
    type: turnActivitySchema,
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
