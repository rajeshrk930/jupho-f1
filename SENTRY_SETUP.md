# Sentry Integration Setup Guide

Complete error tracking and performance monitoring for Jupho Meta Ads AI Tool.

## ✅ What's Been Implemented

### Backend (Express + Node.js)
- ✅ Error tracking with user context from Clerk
- ✅ Performance monitoring for OpenAI API calls (token usage tracking)
- ✅ Facebook API call monitoring (campaign, ad set, ad creation)
- ✅ Razorpay payment flow monitoring
- ✅ Sensitive data scrubbing (tokens, keys, emails, phone numbers)
- ✅ Custom sampling: 100% for critical paths, 10% for others in production

### Frontend (Next.js)
- ✅ Client-side error tracking with session replay on errors
- ✅ Server-side error tracking  
- ✅ Edge runtime support
- ✅ API error tracking with breadcrumbs
- ✅ User context from Clerk
- ✅ Source map upload configuration for debugging

## 🚀 Setup Instructions

### 1. Create Sentry Account & Project

1. Go to [sentry.io](https://sentry.io) and sign up
2. Create a new project:
   - Platform: **Node.js** (for backend)
   - Platform: **Next.js** (for frontend) 
3. Copy your DSN (Data Source Name) from project settings

### 2. Backend Configuration

Add these variables to `backend/.env`:

```bash
# Sentry Error Tracking
SENTRY_DSN=https://YOUR_KEY@o1234567.ingest.sentry.io/YOUR_PROJECT_ID
SENTRY_ENVIRONMENT=production  # or 'development', 'staging'
SENTRY_RELEASE=1.0.0  # Optional: your app version
```

### 3. Frontend Configuration

Add these variables to `frontend/.env.local`:

```bash
# Sentry Error Tracking (Runtime)
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_KEY@o1234567.ingest.sentry.io/YOUR_PROJECT_ID
NEXT_PUBLIC_SENTRY_RELEASE=1.0.0  # Optional: matches backend

# Sentry Source Maps Upload (Build-time only - for CI/CD)
SENTRY_AUTH_TOKEN=sntrys_YOUR_AUTH_TOKEN  # Get from sentry.io/settings/auth-tokens/
SENTRY_ORG=your-org-slug  # From Sentry organization settings
SENTRY_PROJECT=your-project-slug  # Your frontend project name
```

**Getting SENTRY_AUTH_TOKEN:**
1. Go to [sentry.io/settings/auth-tokens/](https://sentry.io/settings/auth-tokens/)
2. Click "Create New Token"
3. Permissions: `project:read`, `project:releases`, `org:read`
4. Save the token securely (you'll only see it once!)

### 4. Test Your Setup

#### Backend Test
```bash
cd backend
npm run dev
```

Visit any API endpoint and check Sentry dashboard for events.

#### Frontend Test
```bash
cd frontend
npm run dev
```

Trigger an error and check Sentry for the captured exception.

### 5. Production Deployment

#### Backend (Railway/Render/etc.)
Add environment variables in your hosting platform dashboard:
- `SENTRY_DSN`
- `SENTRY_ENVIRONMENT=production`
- `SENTRY_RELEASE` (optional)

#### Frontend (Vercel)
Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SENTRY_DSN` (Runtime)
- `NEXT_PUBLIC_SENTRY_RELEASE` (optional)
- `SENTRY_AUTH_TOKEN` (Build-time only - for source maps)
- `SENTRY_ORG`
- `SENTRY_PROJECT`

**Important for Vercel:**
- Source maps will be automatically uploaded during build
- They're deleted after upload (not publicly accessible)
- Mark `SENTRY_AUTH_TOKEN` as **sensitive** in Vercel settings

## 📊 What's Being Monitored

### Critical Paths (100% Sampling)
- ✅ AI Agent workflows (campaign creation)
- ✅ Facebook API calls (OAuth, ad creation, metrics)
- ✅ Payment flows (Razorpay orders, verification)
- ✅ OpenAI API calls (chat, generators)

### Standard Paths (10% Sampling in Prod)
- Regular API requests
- Page loads
- Database queries

### Error Tracking
- **Fatal:** Unexpected server errors
- **Error:** Operational errors (5xx status codes)
- **Warning:** Auth failures (401, 403)
- **Info:** Breadcrumbs for debugging flow

## 🔒 Privacy & Security

### Auto-Scrubbed Data
- ✅ Access tokens (`accessToken`, `facebookAccessToken`, `clerkToken`)
- ✅ API keys and secrets
- ✅ Razorpay signatures and payment IDs
- ✅ Email addresses (replaced with `[email]`)
- ✅ Phone numbers (replaced with `[phone]`)
- ✅ Authorization headers
- ✅ Cookies

### User Context (Safe)
Only these are sent to Sentry:
- User ID (database ID)
- Clerk ID
- Email (only in development)

## 📈 Sentry Dashboard

### Key Metrics to Watch
1. **Issues** → Errors grouped by type
2. **Performance** → Slow transactions
   - OpenAI API latency
   - Facebook API response times
   - Payment processing time
3. **Releases** → Track errors by deployment
4. **Alerts** → Set up for critical issues

### Recommended Alerts
Set up in Sentry dashboard:
1. **Critical:** Payment verification failures
2. **High:** Campaign launch errors
3. **High:** Facebook OAuth failures  
4. **Medium:** OpenAI rate limit errors
5. **Medium:** Database connection issues

## 🔧 Troubleshooting

### "Sentry not configured" in logs
**Backend:** Check `SENTRY_DSN` is set in `.env`
**Frontend:** Check `NEXT_PUBLIC_SENTRY_DSN` is set

### No errors showing up in Sentry
1. Verify DSN is correct
2. Check network tab for sentry.io requests
3. Check Sentry project is active
4. Wait 1-2 minutes for ingestion

### Source maps not working
1. Verify `SENTRY_AUTH_TOKEN` has correct permissions
2. Check build logs for "Uploading source maps to Sentry"
3. Ensure token is set as environment variable during build

### Too many events / high costs
Adjust sampling rates in:
- `backend/src/config/sentry.config.ts` → `tracesSampleRate`
- `frontend/sentry.client.config.ts` → `tracesSampleRate`

Lower to 0.05 (5%) or 0.01 (1%) if needed.

## 📞 Support

- Sentry Docs: [docs.sentry.io](https://docs.sentry.io)
- Node.js Guide: [docs.sentry.io/platforms/node/](https://docs.sentry.io/platforms/node/)
- Next.js Guide: [docs.sentry.io/platforms/javascript/guides/nextjs/](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

## 🎯 Next Steps

1. **Set up Sentry account** → Create projects for frontend & backend
2. **Add environment variables** → Both locally and in production
3. **Deploy and test** → Trigger test errors to verify tracking
4. **Configure alerts** → Get notified of critical issues
5. **Review weekly** → Check Sentry dashboard for trends

---

**Your debugging time just got 10x faster! 🚀**
