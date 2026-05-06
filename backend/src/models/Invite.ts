import mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  codeHash: {
    type: String,
    required: true,
    unique: true
  },
  codePreview: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  revokedAt: {
    type: Date,
    default: null
  },
  usedAt: {
    type: Date,
    default: null
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

type InviteAttrs = mongoose.InferSchemaType<typeof inviteSchema>;
type InviteDocument = mongoose.HydratedDocument<InviteAttrs>;

const Invite = mongoose.model<InviteAttrs, mongoose.Model<InviteAttrs>>('Invite', inviteSchema);

export = Invite;
