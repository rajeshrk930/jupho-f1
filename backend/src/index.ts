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
import sheetsRoutes from './routes/sheets.routes';
import webhookRoutes from './routes/webhook.routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger.middleware';
import path from 'path';
import * as Sentry from '@sentry/node';
import { initializeSentry } from './config/sentry.config';
import { SyncScheduler } from './services/syncScheduler.service';
import { AuthRequest } from './middleware/auth';

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

// Helper function to get user plan for rate limiting
const getUserPlan = (req: any): string => {
  // If authenticated, use user's plan from auth middleware
  if (req.user?.plan) {
    return req.user.plan;
  }
  return 'ANONYMOUS'; // Unauthenticated requests
};

// Rate limiting - Per-user API protection with subscription tiers
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: async (req) => {
    const plan = getUserPlan(req);
    // Subscription tier-based limits
    if (plan === 'ENTERPRISE') return 50000; // Essentially unlimited
    if (plan === 'PAID' || plan === 'GROWTH' || plan === 'PROFESSIONAL') return 5000;
    if (plan === 'FREE' || plan === 'STARTER') return 500;
    return 100; // Unauthenticated/anonymous users (IP-based fallback)
  },
  keyGenerator: (req) => {
    // Use user ID for authenticated requests, IP for anonymous
    return (req as AuthRequest).user?.id || req.ip || 'unknown';
  },
  message: 'You\'ve reached your API limit. Please upgrade your plan for higher limits.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting - Strict for auth endpoints (IP-based to prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per windowMs per IP (prevents brute force)
  message: 'Too many login attempts from this network, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  keyGenerator: (req) => req.ip || 'unknown', // Always use IP for auth (security)
});

// Rate limiting - AI/agent endpoints with subscription awareness
const agentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: async (req) => {
    const plan = getUserPlan(req);
    // AI endpoints are cost-sensitive, so lower limits
    if (plan === 'ENTERPRISE') return 100;
    if (plan === 'PAID' || plan === 'GROWTH' || plan === 'PROFESSIONAL') return 30;
    if (plan === 'FREE' || plan === 'STARTER') return 10;
    return 5; // Unauthenticated
  },
  keyGenerator: (req) => {
    return (req as AuthRequest).user?.id || req.ip || 'unknown';
  },
  message: 'You\'ve reached your AI request limit. Upgrade to PAID or ENTERPRISE for more capacity.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all API routes
app.use('/api', generalLimiter);

// Middleware - Environment-based CORS configuration
const allowedOrigins = [
  'https://app.jupho.io',
  'https://jupho.io',
  'https://www.jupho.io',
  'https://jupho-f1.vercel.app',
  'https://jupho-f1-v2.vercel.app',
];

// Add localhost origins only in development
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003'
  );
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight for 10 minutes
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
app.use('/api/sheets', sheetsRoutes); // Google Sheets integration
app.use('/api/webhooks', webhookRoutes); // User webhooks (GROWTH plan only)

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
  
  // Start Google Sheets auto-sync scheduler
  SyncScheduler.start();
});

export default app;
