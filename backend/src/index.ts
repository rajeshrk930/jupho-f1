import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authRoutes } from './routes/auth.routes';
import { paymentRoutes } from './routes/payment.routes';
import { chatRoutes } from './routes/chat.routes';
import adminRoutes from './routes/admin.routes';
import facebookRoutes from './routes/facebook.routes';
import agentRoutes from './routes/agent.routes';
import templateRoutes from './routes/template.routes';
import clerkRoutes from './routes/clerk.routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger.middleware';
import path from 'path';
import * as Sentry from '@sentry/node';
import { initializeSentry } from './config/sentry.config';

dotenv.config();

// Validate critical environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'CLERK_SECRET_KEY',
  'OPENAI_API_KEY',
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Warn about optional but recommended variables
if (!process.env.FACEBOOK_PAGE_ID || !process.env.FACEBOOK_FORM_ID) {
  console.warn('⚠️  FACEBOOK_PAGE_ID and/or FACEBOOK_FORM_ID not set. Lead form creation will fail.');
}

// Initialize Sentry FIRST (before any other code)
initializeSentry();

const app = express();

// Sentry will automatically instrument Express

// Trust proxy so secure cookies (SameSite=None + Secure) work behind Railway/Vercel proxies
app.set('trust proxy', 1);
// Disable etag to avoid 304/Not Modified on auth/me causing empty bodies on the client
app.disable('etag');
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://graph.facebook.com", "https://api.openai.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting - General API protection
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting - Strict for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Rate limiting - Stricter for AI/agent endpoints (prevent OpenAI API abuse)
const agentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: 'Too many AI requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all API routes
app.use('/api', generalLimiter);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
        process.env.FRONTEND_URL || 'https://jupho.io',
        'https://app.jupho.io',
        'https://jupho.io',
        'https://www.jupho.io',
        'https://jupho-f1.vercel.app',
        'https://jupho-f1-v2.vercel.app'
      ]
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003'
      ],
  credentials: true
}));

// 🚨 CRITICAL: Clerk webhook MUST come BEFORE express.json()
// Webhooks need raw body for signature verification
app.use('/api/webhooks/clerk', express.raw({ type: 'application/json' }), clerkRoutes);

// Body parsers (after webhook routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logger - tracks all API calls with timing and user context
app.use('/api', requestLogger);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes with specific rate limiters
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/facebook', facebookRoutes);
app.use('/api/agent', agentLimiter, agentRoutes); // Stricter limit for AI endpoints
app.use('/api/templates', templateRoutes);

// Health check with deployment tracking
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.1.0-oauth-fix',
    features: ['facebook-oauth-get-callback', 'lead-forms'],
    sentry: !!process.env.SENTRY_DSN
  });
});

// Test error route (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/test-error', (req, res) => {
    throw new Error('Test Sentry Error - This should appear in Sentry dashboard');
  });
}

// Sentry error handler MUST be before other error handlers
Sentry.setupExpressErrorHandler(app);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
