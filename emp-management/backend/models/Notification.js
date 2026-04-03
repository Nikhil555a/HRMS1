
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'interview_reminder',
      'interview_today',
      'interview_scheduled',  // ✅ naya type — turant notification
      'stage_update',
      'offer_update',
      'document_update',
      'general'
    ],
    default: 'general'
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  meta: {
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
    candidateName: String,
    interviewId: String,
    scheduledAt: Date,
  }
}, { timestamps: true });

// 30 din baad auto-delete
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', notificationSchema);
