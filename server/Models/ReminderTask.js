import mongoose from 'mongoose';

const ReminderTaskSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    index: true
  },
  taskType: {
    type: String,
    enum: ['initialReminder', 'followupReminder'],
    required: true
  },
  scheduledFor: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  orderUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  executedAt: Date,
  error: String
});

// Compound index for faster querying
ReminderTaskSchema.index({ status: 1, scheduledFor: 1 });

const ReminderTask = mongoose.model('ReminderTask', ReminderTaskSchema);

export default ReminderTask;