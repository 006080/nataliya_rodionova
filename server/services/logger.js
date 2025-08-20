import { LogModels, UnifiedLog } from '../Models/LogModels.js';

class Logger {
  constructor() {
    this.isEnabled = process.env.ENABLE_LOGGING !== 'false';
    this.logLevel = process.env.LOG_LEVEL || 'INFO';
    this.useSeparateCollections = process.env.USE_SEPARATE_LOG_COLLECTIONS !== 'false'; // Default: true
  }

  /**
   * Generic log method that routes to appropriate collection
   * @param {string} action - Action type
   * @param {string} route - Route or function name
   * @param {string} message - Log message
   * @param {string} level - Log level
   * @param {string} category - Log category
   * @param {object} options - Additional options
   */
  async log(action, route, message, level = 'INFO', category = 'TECHNICAL', options = {}) {
    if (!this.isEnabled || !this.shouldLog(level)) {
      return;
    }

    try {
      const baseLogEntry = {
        action: action.substring(0, 50),
        route: route.substring(0, 100),
        message: message.substring(0, 500),
        level,
        timestamp: new Date(),
        ...options
      };

      // Clean up undefined values
      Object.keys(baseLogEntry).forEach(key => {
        if (baseLogEntry[key] === undefined || baseLogEntry[key] === null) {
          delete baseLogEntry[key];
        }
      });

      if (this.useSeparateCollections) {
        // Route to specific collection based on category
        await this.logToSpecificCollection(category, baseLogEntry);
      } else {
        // Use unified collection (backward compatibility)
        await UnifiedLog.create({ ...baseLogEntry, category });
      }
    } catch (error) {
      console.error('Logging failed:', error.message);
    }
  }

  /**
   * Route log entry to specific collection based on category
   */
  async logToSpecificCollection(category, logEntry) {
    const Model = LogModels[category];
    if (!Model) {
      console.warn(`Unknown log category: ${category}, using TECHNICAL`);
      await LogModels.TECHNICAL.create(logEntry);
      return;
    }

    // Add category-specific fields based on the category
    const enhancedEntry = this.enhanceLogEntry(category, logEntry);
    await Model.create(enhancedEntry);
  }

  /**
   * Add category-specific fields to log entries
   */
  enhanceLogEntry(category, logEntry) {
    const enhanced = { ...logEntry };

    switch (category) {
      case 'BUSINESS':
        // Extract business-specific data from message or options
        if (logEntry.orderId) enhanced.orderId = logEntry.orderId;
        if (logEntry.amount) enhanced.amount = logEntry.amount;
        if (logEntry.currency) enhanced.currency = logEntry.currency;
        break;

      case 'SECURITY':
        // Set risk level based on action and level
        enhanced.riskLevel = this.calculateRiskLevel(logEntry.action, logEntry.level);
        if (logEntry.targetResource) enhanced.targetResource = logEntry.targetResource;
        if (logEntry.attemptCount) enhanced.attemptCount = logEntry.attemptCount;
        break;

      case 'TECHNICAL':
        // Add technical details
        if (logEntry.statusCode) enhanced.statusCode = logEntry.statusCode;
        if (logEntry.responseTime) enhanced.responseTime = logEntry.responseTime;
        if (logEntry.errorCode) enhanced.errorCode = logEntry.errorCode;
        if (logEntry.stackTrace) enhanced.stackTrace = logEntry.stackTrace;
        break;

      case 'SYSTEM':
        // Add system metrics
        enhanced.processId = process.pid;
        if (logEntry.jobType) enhanced.jobType = logEntry.jobType;
        // Add memory/CPU usage if available
        try {
          const memUsage = process.memoryUsage();
          enhanced.memoryUsage = Math.round(memUsage.heapUsed / 1024 / 1024); // MB
        } catch (e) { /* ignore */ }
        break;

      case 'REQUEST':
        // Add request-specific data
        if (logEntry.method) enhanced.method = logEntry.method;
        if (logEntry.statusCode) enhanced.statusCode = logEntry.statusCode;
        if (logEntry.duration) enhanced.duration = logEntry.duration;
        if (logEntry.requestSize) enhanced.requestSize = logEntry.requestSize;
        if (logEntry.responseSize) enhanced.responseSize = logEntry.responseSize;
        break;
    }

    return enhanced;
  }

  /**
   * Calculate risk level for security events
   */
  calculateRiskLevel(action, level) {
    if (level === 'ERROR') return 'CRITICAL';
    if (level === 'WARN') {
      if (action.includes('LOGIN_FAILED') || action.includes('UNAUTHORIZED')) return 'HIGH';
      return 'MEDIUM';
    }
    return 'LOW';
  }

  // === BUSINESS CATEGORY METHODS ===
  async business(action, route, message, level = 'INFO', options = {}) {
    return this.log(action, route, message, level, 'BUSINESS', options);
  }

  async businessInfo(action, route, message, options = {}) {
    return this.business(action, route, message, 'INFO', options);
  }

  async businessWarn(action, route, message, options = {}) {
    return this.business(action, route, message, 'WARN', options);
  }

  async businessError(action, route, message, options = {}) {
    return this.business(action, route, message, 'ERROR', options);
  }

  // === SECURITY CATEGORY METHODS ===
  async security(action, route, message, level = 'WARN', options = {}) {
    return this.log(action, route, message, level, 'SECURITY', options);
  }

  async securityInfo(action, route, message, options = {}) {
    return this.security(action, route, message, 'INFO', options);
  }

  async securityWarn(action, route, message, options = {}) {
    return this.security(action, route, message, 'WARN', options);
  }

  async securityError(action, route, message, options = {}) {
    return this.security(action, route, message, 'ERROR', options);
  }

  // === TECHNICAL CATEGORY METHODS ===
  async technical(action, route, message, level = 'ERROR', options = {}) {
    return this.log(action, route, message, level, 'TECHNICAL', options);
  }

  async technicalInfo(action, route, message, options = {}) {
    return this.technical(action, route, message, 'INFO', options);
  }

  async technicalWarn(action, route, message, options = {}) {
    return this.technical(action, route, message, 'WARN', options);
  }

  async technicalError(action, route, message, options = {}) {
    return this.technical(action, route, message, 'ERROR', options);
  }

  // === SYSTEM CATEGORY METHODS ===
  async system(action, route, message, level = 'INFO', options = {}) {
    return this.log(action, route, message, level, 'SYSTEM', options);
  }

  async systemInfo(action, route, message, options = {}) {
    return this.system(action, route, message, 'INFO', options);
  }

  async systemWarn(action, route, message, options = {}) {
    return this.system(action, route, message, 'WARN', options);
  }

  async systemError(action, route, message, options = {}) {
    return this.system(action, route, message, 'ERROR', options);
  }

  // === REQUEST CATEGORY METHODS ===
  async request(action, route, message, level = 'INFO', options = {}) {
    return this.log(action, route, message, level, 'REQUEST', options);
  }

  // === LEGACY METHODS (backward compatibility) ===
  async info(action, route, message, options = {}) {
    return this.log(action, route, message, 'INFO', 'TECHNICAL', options);
  }

  async warn(action, route, message, options = {}) {
    return this.log(action, route, message, 'WARN', 'TECHNICAL', options);
  }

  async error(action, route, message, options = {}) {
    return this.log(action, route, message, 'ERROR', 'TECHNICAL', options);
  }

  async debug(action, route, message, options = {}) {
    return this.log(action, route, message, 'DEBUG', 'TECHNICAL', options);
  }

  /**
   * Log user actions (automatically categorized as BUSINESS)
   */
  async logUserAction(action, route, userId, message, options = {}) {
    return this.businessInfo(action, route, message, { 
      userId: userId?.toString(), 
      ...options 
    });
  }

  /**
   * Log request/response (automatically categorized as REQUEST)
   */
  async logRequest(req, res, duration, message = 'Request processed') {
    const action = `${req.method}_${req.route?.path || req.path}`;
    return this.request(
      action.replace(/[^A-Z0-9_]/gi, '_').substring(0, 50),
      `${req.method} ${req.originalUrl}`,
      message,
      'INFO',
      {
        userId: req.user?._id?.toString(),
        ip: req.ip,
        userAgent: req.get('User-Agent')?.substring(0, 200),
        method: req.method,
        statusCode: res.statusCode,
        duration
      }
    );
  }

  /**
   * Log errors with stack trace (automatically categorized as TECHNICAL)
   */
  async logError(error, route, options = {}) {
    const message = error.message;
    const stackTrace = error.stack ? error.stack.substring(0, 1000) : null;
    
    return this.technicalError('ERROR', route, message, {
      stackTrace,
      ...options
    });
  }

  /**
   * Check if we should log based on level
   */
  shouldLog(level) {
    const levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    return levels[level] >= levels[this.logLevel];
  }

  /**
   * Get recent logs from specific collection
   */
  async getRecentLogs(category = null, limit = 100, level = null, action = null) {
    try {
      const query = {};
      if (level) query.level = level;
      if (action) query.action = new RegExp(action, 'i');

      if (this.useSeparateCollections && category) {
        const Model = LogModels[category];
        if (!Model) throw new Error(`Unknown category: ${category}`);
        
        return await Model.find(query)
          .sort({ timestamp: -1 })
          .limit(limit)
          .lean();
      } else {
        // Query unified collection or all collections
        const queryWithCategory = category ? { ...query, category } : query;
        return await UnifiedLog.find(queryWithCategory)
          .sort({ timestamp: -1 })
          .limit(limit)
          .lean();
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      return [];
    }
  }

  /**
   * Get logs from all collections (for admin dashboard)
   */
  async getAllRecentLogs(limit = 100, level = null) {
    try {
      if (!this.useSeparateCollections) {
        return this.getRecentLogs(null, limit, level);
      }

      // Query all collections and merge results
      const promises = Object.entries(LogModels).map(async ([category, Model]) => {
        const query = level ? { level } : {};
        const logs = await Model.find(query)
          .sort({ timestamp: -1 })
          .limit(Math.ceil(limit / 5)) // Distribute limit across collections
          .lean();
        
        // Add category field for unified display
        return logs.map(log => ({ ...log, category }));
      });

      const allLogs = await Promise.all(promises);
      const mergedLogs = allLogs.flat();
      
      // Sort by timestamp and limit
      return mergedLogs
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch logs from all collections:', error);
      return [];
    }
  }

  /**
   * Get logs by specific category
   */
  async getLogsByCategory(category, limit = 100, level = null) {
    return this.getRecentLogs(category, limit, level);
  }

  /**
   * Clean up old logs from all collections
   */
  async cleanup(daysToKeep = 30) {
    try {
      const cutoffDate = new Date(Date.now() - (daysToKeep * 24 * 60 * 60 * 1000));
      let totalDeleted = 0;

      if (this.useSeparateCollections) {
        // Clean each collection separately
        for (const [category, Model] of Object.entries(LogModels)) {
          const result = await Model.deleteMany({ timestamp: { $lt: cutoffDate } });
          totalDeleted += result.deletedCount;
          console.log(`Cleaned up ${result.deletedCount} old ${category} logs`);
        }
      } else {
        // Clean unified collection
        const result = await UnifiedLog.deleteMany({ timestamp: { $lt: cutoffDate } });
        totalDeleted = result.deletedCount;
      }

      console.log(`Total cleaned up: ${totalDeleted} old log entries`);
      return totalDeleted;
    } catch (error) {
      console.error('Log cleanup failed:', error);
      return 0;
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats() {
    try {
      if (!this.useSeparateCollections) {
        const stats = await UnifiedLog.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        return { unified: true, stats };
      }

      const stats = {};
      for (const [category, Model] of Object.entries(LogModels)) {
        stats[category] = await Model.countDocuments();
      }
      return { unified: false, stats };
    } catch (error) {
      console.error('Failed to get collection stats:', error);
      return null;
    }
  }
}

// Export singleton instance
const logger = new Logger();
export default logger;