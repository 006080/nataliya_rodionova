import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import http from 'http';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';

// React SSR imports
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import App from './src/App.jsx'; // Твоя главная App страница

// Импорты твоих роутов и сервисов
import paypalRoutes from './routes/paypal.js';
import productRoutes from './routes/product.js';
// ... другие роуты и сервисы

dotenv.config({ path: './.env.local' });

const app = express();
const server = http.createServer(app);
const {
  MONGO_URI,
  PORT,
  FRONTEND_URL_LOCAL,
  FRONTEND_URL_PROD
} = process.env;

if (!MONGO_URI || !PORT || !FRONTEND_URL_LOCAL || !FRONTEND_URL_PROD) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// --- Middleware ---
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors({
  origin: [FRONTEND_URL_LOCAL, FRONTEND_URL_PROD],
  credentials: true
}));

// --- Rate limiting ---
const feedbackLimiter = rateLimit({ windowMs: 30*60*1000, max: 100 });
app.use("/api/feedback", feedbackLimiter);

const authLimiter = rateLimit({ windowMs: 1*60*1000, max: 30 });
app.use('/api/auth/', authLimiter);

// --- API routes ---
app.use(productRoutes);
app.use(paypalRoutes);
// ... остальные роуты

// --- Static files from Vite build ---
app.use(express.static(path.resolve('./dist')));

// --- SSR middleware (React + Router + Helmet) ---
app.get('*', (req, res, next) => {
  // пропускаем API-запросы
  if (req.path.startsWith('/api/')) return next();

  const helmetContext = {};
  const appHtml = ReactDOMServer.renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={req.url}>
        <App />
      </StaticRouter>
    </HelmetProvider>
  );

  const { helmet } = helmetContext;

  const indexFile = path.resolve('./dist/index.html');
  let html = fs.readFileSync(indexFile, 'utf8');

  html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
  html = html.replace('</head>', `
    ${helmet.title.toString()}
    ${helmet.meta.toString()}
  </head>`);

  res.send(html);
});

// --- 404 ---
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// --- MongoDB connection ---
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => { console.error(err); process.exit(1); });

// --- Start server ---
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
