import mongoose from 'mongoose';

// Base schema that all log types will share
const BaseLogSchema = {
  action: {
    type: String,
    required: true,
    maxLength: 50,
    index: true
  },
  route: {
    type: String,
    required: true,
    maxLength: 100
  },
  message: {
    type: String,
    required: true,
    maxLength: 500
  },
  level: {
    type: String,
    enum: ['INFO', 'WARN', 'ERROR', 'DEBUG'],
    default: 'INFO',
    index: true
  },
  userId: {
    type: String,
    maxLength: 50,
    sparse: true,
    index: true
  },
  ip: {
    type: String,
    maxLength: 45
  },
  userAgent: {
    type: String,
    maxLength: 200
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 2592000 // 30 days TTL
  }
};

const schemaOptions = {
  _id: true,
  versionKey: false,
  minimize: true
};

// === BUSINESS LOGS COLLECTION ===
const BusinessLogSchema = new mongoose.Schema({
  ...BaseLogSchema,
  // Business-specific fields
  orderId: {
    type: String,
    maxLength: 50,
    sparse: true,
    index: true
  },
  amount: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    maxLength: 3,
    default: 'EUR'
  }
}, schemaOptions);

// Business-specific indexes
BusinessLogSchema.index({ action: 1, timestamp: -1 });
BusinessLogSchema.index({ userId: 1, timestamp: -1 }, { sparse: true });
BusinessLogSchema.index({ orderId: 1, timestamp: -1 }, { sparse: true });

// === SECURITY LOGS COLLECTION ===
const SecurityLogSchema = new mongoose.Schema({
  ...BaseLogSchema,
  // Security-specific fields
  attemptCount: {
    type: Number,
    min: 1,
    default: 1
  },
  targetResource: {
    type: String,
    maxLength: 100
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  }
}, schemaOptions);

// Security-specific indexes
SecurityLogSchema.index({ level: 1, timestamp: -1 });
SecurityLogSchema.index({ ip: 1, timestamp: -1 });
SecurityLogSchema.index({ riskLevel: 1, timestamp: -1 });
SecurityLogSchema.index({ userId: 1, timestamp: -1 }, { sparse: true });

// === TECHNICAL LOGS COLLECTION ===
const TechnicalLogSchema = new mongoose.Schema({
  ...BaseLogSchema,
  // Technical-specific fields
  errorCode: {
    type: String,
    maxLength: 20
  },
  stackTrace: {
    type: String,
    maxLength: 1000
  },
  statusCode: {
    type: Number,
    min: 100,
    max: 599
  },
  responseTime: {
    type: Number,
    min: 0
  }
}, schemaOptions);

// Technical-specific indexes
TechnicalLogSchema.index({ level: 1, timestamp: -1 });
TechnicalLogSchema.index({ statusCode: 1, timestamp: -1 });
TechnicalLogSchema.index({ errorCode: 1, timestamp: -1 }, { sparse: true });

// === SYSTEM LOGS COLLECTION ===
const SystemLogSchema = new mongoose.Schema({
  ...BaseLogSchema,
  // System-specific fields
  processId: {
    type: Number
  },
  memoryUsage: {
    type: Number,
    min: 0
  },
  cpuUsage: {
    type: Number,
    min: 0,
    max: 100
  },
  jobType: {
    type: String,
    maxLength: 50
  }
}, schemaOptions);

// System-specific indexes
SystemLogSchema.index({ action: 1, timestamp: -1 });
SystemLogSchema.index({ jobType: 1, timestamp: -1 }, { sparse: true });

// === REQUEST LOGS COLLECTION ===
const RequestLogSchema = new mongoose.Schema({
  ...BaseLogSchema,
  // Request-specific fields
  method: {
    type: String,
    maxLength: 10
  },
  statusCode: {
    type: Number,
    min: 100,
    max: 599,
    index: true
  },
  duration: {
    type: Number,
    min: 0
  },
  requestSize: {
    type: Number,
    min: 0
  },
  responseSize: {
    type: Number,
    min: 0
  }
}, schemaOptions);

// Request-specific indexes
RequestLogSchema.index({ method: 1, statusCode: 1, timestamp: -1 });
RequestLogSchema.index({ duration: 1, timestamp: -1 });
RequestLogSchema.index({ statusCode: 1, timestamp: -1 });

// Create models with specific collection names
export const BusinessLog = mongoose.model('BusinessLog', BusinessLogSchema, 'business_logs');
export const SecurityLog = mongoose.model('SecurityLog', SecurityLogSchema, 'security_logs');
export const TechnicalLog = mongoose.model('TechnicalLog', TechnicalLogSchema, 'technical_logs');
export const SystemLog = mongoose.model('SystemLog', SystemLogSchema, 'system_logs');
export const RequestLog = mongoose.model('RequestLog', RequestLogSchema, 'request_logs');

// Export all models
export const LogModels = {
  BUSINESS: BusinessLog,
  SECURITY: SecurityLog,
  TECHNICAL: TechnicalLog,
  SYSTEM: SystemLog,
  REQUEST: RequestLog
};

// Keep the original unified model for backward compatibility
const UnifiedLogSchema = new mongoose.Schema({
  ...BaseLogSchema,
  category: {
    type: String,
    enum: ['BUSINESS', 'SECURITY', 'TECHNICAL', 'SYSTEM', 'REQUEST'],
    required: true,
    index: true
  }
}, schemaOptions);

UnifiedLogSchema.index({ category: 1, level: 1, timestamp: -1 });
export const UnifiedLog = mongoose.model('UnifiedLog', UnifiedLogSchema, 'logs');

export default LogModels;










