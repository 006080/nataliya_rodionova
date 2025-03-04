import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create transaction log file stream
const transactionLogStream = fs.createWriteStream(
  path.join(logsDir, 'transactions.log'), 
  { flags: 'a' }
);

export const logTransaction = (req, res, next) => {
  // Only log payment-related routes
  if (req.path.includes('/api/payments') || req.path.includes('/api/orders')) {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const path = req.path;
    const body = JSON.stringify(req.body);
    const headers = JSON.stringify(req.headers);
    
    // Log the request
    transactionLogStream.write(
      `[${timestamp}] ${method} ${path}\nHeaders: ${headers}\nBody: ${body}\n\n`
    );
    
    // Capture and log the response
    const originalSend = res.send;
    res.send = function(data) {
      const responseTimestamp = new Date().toISOString();
      const responseBody = data.toString();
      
      transactionLogStream.write(
        `[${responseTimestamp}] RESPONSE ${method} ${path}\nStatus: ${res.statusCode}\nBody: ${responseBody}\n\n`
      );
      
      originalSend.call(this, data);
    };
  }
  
  next();
};