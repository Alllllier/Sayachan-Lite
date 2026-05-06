import mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  tokenHash: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

type SessionAttrs = mongoose.InferSchemaType<typeof sessionSchema>;
type SessionDocument = mongoose.HydratedDocument<SessionAttrs>;

const Session = mongoose.model<SessionAttrs, mongoose.Model<SessionAttrs>>('Session', sessionSchema);

export = Session;
