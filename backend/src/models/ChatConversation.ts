import mongoose from 'mongoose';

const chatConversationSchema = new mongoose.Schema({
  title: {
    type: String,
    default: ''
  },
  archived: {
    type: Boolean,
    default: false
  },
  providerState: {
    type: mongoose.Schema.Types.Mixed,
    default: undefined
  },
  lastMessageAt: {
    type: Date,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

chatConversationSchema.index({ userId: 1, archived: 1, updatedAt: -1 });

type ChatConversationAttrs = mongoose.InferSchemaType<typeof chatConversationSchema>;

const ChatConversation = mongoose.model<ChatConversationAttrs, mongoose.Model<ChatConversationAttrs>>('ChatConversation', chatConversationSchema);

export default ChatConversation;
