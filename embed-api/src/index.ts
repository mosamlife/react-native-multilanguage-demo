import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import extractRoute from './routes/extract';
import oembedRoute from './routes/oembed';
import renderRoute from './routes/render';
import { embedService } from './services/embed-service';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:"],
      frameSrc: ["'self'", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:19006'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false,
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100,
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const health = await embedService.healthCheck();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      service: health,
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// API documentation endpoint
app.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  res.json({
    name: 'Embed API',
    version: '1.0.0',
    description: 'External content embed API service',
    endpoints: {
      health: `${baseUrl}/health`,
      extract: `${baseUrl}/api/extract?url=<encoded_url>`,
      oembed: `${baseUrl}/api/oembed?url=<encoded_url>&format=json&maxwidth=500`,
      render: `${baseUrl}/api/render?url=<encoded_url>&width=500&height=300`,
    },
    supportedPlatforms: embedService.getSupportedPlatforms(),
    documentation: {
      extract: 'Extract metadata from a URL',
      oembed: 'Generate oEmbed response for a URL',
      render: 'Generate HTML embed for a URL',
    },
    examples: {
      youtube: `${baseUrl}/api/extract?url=${encodeURIComponent('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}`,
      generic: `${baseUrl}/api/oembed?url=${encodeURIComponent('https://example.com')}&format=json`,
    },
  });
});

// API routes
app.use('/api/extract', extractRoute);
app.use('/api/oembed', oembedRoute);
app.use('/api/render', renderRoute);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: [
      '/health',
      '/api/extract',
      '/api/oembed',
      '/api/render',
    ],
  });
});

// Global error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Embed API server running on port ${PORT}`);
  console.log(`📖 API documentation: http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Extract endpoint: http://localhost:${PORT}/api/extract`);
  console.log(`📺 oEmbed endpoint: http://localhost:${PORT}/api/oembed`);
  console.log(`🎨 Render endpoint: http://localhost:${PORT}/api/render`);
});

export default app;
