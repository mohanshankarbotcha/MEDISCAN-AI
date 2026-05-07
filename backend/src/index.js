/**
 * index.js — Midiscanai Backend Entry Point
 * Pure Node.js + Express. No Python. No Flask. No FastAPI. No Django.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'node:fs';
import uploadRoutes from './routes/upload.routes.js';
import analyzeRoutes from './routes/analyze.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists at startup
fs.mkdirSync('./uploads', { recursive: true });

// Security headers — replaces Python middleware equivalents
app.use(helmet());

// CORS — allow only the frontend URL
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Request logging
app.use(morgan('combined'));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth',    authRoutes);
app.use('/api/upload',  uploadRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/results', analyzeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Midiscanai API',
    runtime: 'Node.js',
    version: process.version,
    uptime: process.uptime()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Midiscanai API running on port ${PORT}`);
  console.log(`✅ Runtime: Node.js ${process.version}`);
  console.log(`✅ No Python required`);
});
