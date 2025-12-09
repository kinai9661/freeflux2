import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Routes
import chatRoutes from './src/routes/chat.js';
import modelRoutes from './src/routes/models.js';
import providerRoutes from './src/routes/providers.js';

// Middleware
import { authMiddleware } from './src/middleware/auth.js';
import { metricsMiddleware, getMetrics } from './src/middleware/metrics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Global middleware
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(join(__dirname, 'public')));
app.use(metricsMiddleware);

// Health check (for Zeabur)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    metrics: getMetrics()
  });
});

// API routes
app.use('/v1/chat', authMiddleware, chatRoutes);
app.use('/v1/models', authMiddleware, modelRoutes);
app.use('/v1/providers', authMiddleware, providerRoutes);

// WebUI pages
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'chat.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Typli API Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🌐 Access: http://localhost:${PORT}`);
});