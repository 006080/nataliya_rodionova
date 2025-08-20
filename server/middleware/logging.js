import logger from '../services/logger.js';

/**
 * Request logging middleware
 * Logs all incoming requests with timing information
 */
export const requestLogger = (req, res, next) => {
  // Skip logging for health checks, static assets, and routine user activities
  const skipPaths = ['/api/health', '/favicon.ico', '/robots.txt'];
  const skipMethods = ['OPTIONS']; // Skip CORS preflight requests
  const skipRoutes = [
    '/api/auth/refresh-token', // Too frequent, not critical
    '/api/cart',               // Routine user activity - not needed
    '/api/favorites',          // Routine user activity - not needed
    '/api/products',           // Routine browsing - not needed
    '/api/reviews',            // Normal content viewing - not needed
    '/api/cloudinary-images',  // Asset loading - not needed
    '/api/cloudinary-folders'  // Asset loading - not needed
  ];
  
  if (skipPaths.some(path => req.path.includes(path)) || 
      skipMethods.includes(req.method) ||
      skipRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }

  const startTime = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override res.end to capture response time
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    
    // Only log if enabled and not a successful GET request (to reduce noise)
    const shouldLog = process.env.ENABLE_REQUEST_LOGGING !== 'false' && 
                     (req.method !== 'GET' || res.statusCode >= 400 || duration > 1000);
    
    if (shouldLog) {
      const message = res.statusCode >= 400 ? 
        `Request failed with status ${res.statusCode}` : 
        'Request completed successfully';
      
      // Log async without blocking response
      setTimeout(() => {
        logger.logRequest(req, res, duration, message);
      }, 0);
    }
    
    // Call original end function
    originalEnd.apply(this, args);
  };
  
  next();
};

/**
 * Error logging middleware
 * Should be used after all other middleware and routes
 */
export const errorLogger = (err, req, res, next) => {
  // Log the error
  const route = `${req.method} ${req.originalUrl}`;
  const options = {
    userId: req.user?._id?.toString(),
    ip: req.ip,
    userAgent: req.get('User-Agent')?.substring(0, 200),
    statusCode: err.status || err.statusCode || 500
  };

  // Log async without blocking error response
  setTimeout(() => {
    logger.logError(err, route, options);
  }, 0);

  // Pass error to next error handler
  next(err);
};

/**
 * Specific middleware for authentication events
 */
export const authLogger = {
  loginAttempt: (req, success, message) => {
    const action = success ? 'USER_LOGIN_SUCCESS' : 'USER_LOGIN_FAILED';
    const level = success ? 'INFO' : 'WARN';
    
    setTimeout(() => {
      logger.log(action, 'POST /api/auth/login', message, level, {
        userId: success ? req.user?._id?.toString() : undefined,
        ip: req.ip,
        userAgent: req.get('User-Agent')?.substring(0, 200)
      });
    }, 0);
  },

  logout: (req) => {
    setTimeout(() => {
      logger.logUserAction('USER_LOGOUT', 'POST /api/auth/logout', req.user?._id, 'User logged out', {
        ip: req.ip
      });
    }, 0);
  },

  registration: (req, userId, email) => {
    setTimeout(() => {
      logger.logUserAction('USER_REGISTER', 'POST /api/auth/register', userId, `New user registered: ${email}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')?.substring(0, 200)
      });
    }, 0);
  },

  passwordReset: (req, email) => {
    setTimeout(() => {
      logger.info('PASSWORD_RESET_REQUEST', 'POST /api/auth/forgot-password', `Password reset requested for: ${email}`, {
        ip: req.ip
      });
    }, 0);
  }
};

/**
 * Business logic logger for important events
 */
export const businessLogger = {
  orderCreated: (orderId, userId, amount) => {
    setTimeout(() => {
      logger.logUserAction('ORDER_CREATED', 'POST /api/payments', userId, `Order created: ${orderId} - €${amount}`, {
        statusCode: 201
      });
    }, 0);
  },

  orderCompleted: (orderId, userId, amount) => {
    setTimeout(() => {
      logger.logUserAction('ORDER_COMPLETED', 'POST /api/payments/capture', userId, `Order completed: ${orderId} - €${amount}`, {
        statusCode: 200
      });
    }, 0);
  },

  orderCancelled: (orderId, userId, reason) => {
    setTimeout(() => {
      logger.logUserAction('ORDER_CANCELLED', 'POST /api/payments/cancel', userId, `Order cancelled: ${orderId} - ${reason}`, {
        statusCode: 200
      });
    }, 0);
  },

  feedbackSubmitted: (req, email) => {
    setTimeout(() => {
      logger.info('FEEDBACK_SUBMITTED', 'POST /api/feedback', `Feedback submitted from: ${email}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')?.substring(0, 200)
      });
    }, 0);
  },

  reviewSubmitted: (req, name, rating) => {
    setTimeout(() => {
      logger.info('REVIEW_SUBMITTED', 'POST /api/reviews', `Review submitted by: ${name} - Rating: ${rating}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')?.substring(0, 200)
      });
    }, 0);
  },

  accountDeleted: (userId, email) => {
    setTimeout(() => {
      logger.warn('ACCOUNT_DELETED', 'DELETE /api/users/me', `Account marked for deletion: ${email}`, {
        userId: userId?.toString()
      });
    }, 0);
  },

  accountRestored: (userId, email) => {
    setTimeout(() => {
      logger.info('ACCOUNT_RESTORED', 'POST /api/users/restore', `Account restored: ${email}`, {
        userId: userId?.toString()
      });
    }, 0);
  },

  orderFulfillmentUpdated: (orderId, userId, previousStatus, newStatus) => {
    setTimeout(() => {
      logger.logUserAction('ORDER_FULFILLMENT_UPDATE', 'PATCH /api/orders/fulfillment', userId, 
        `Order ${orderId} status: ${previousStatus} → ${newStatus}`, {
        statusCode: 200
      });
    }, 0);
  },

  orderClosed: (orderId, userId, reason) => {
    setTimeout(() => {
      logger.logUserAction('ORDER_CLOSED', 'POST /api/orders/close', userId, `Order ${orderId} closed: ${reason}`, {
        statusCode: 200
      });
    }, 0);
  }
};

export default {
  requestLogger,
  errorLogger,
  authLogger,
  businessLogger
};