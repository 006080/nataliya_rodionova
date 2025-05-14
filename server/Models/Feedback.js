import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  name: String,
  surname: String,
  email: String,
  phone: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
  
  // Privacy & anonymization fields
  anonymized: { 
    type: Boolean, 
    default: false 
  },
  anonymizedAt: Date,
  pendingAnonymization: {
    type: Boolean,
    default: false
  },
  anonymizationDate: Date,
  
  // User reference (optional) - makes it easier to find all feedback from a user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }
});

// Index for efficient searches during anonymization process
FeedbackSchema.index({ email: 1 });
FeedbackSchema.index({ pendingAnonymization: 1, anonymizationDate: 1 });

export default mongoose.model('Feedback', FeedbackSchema);