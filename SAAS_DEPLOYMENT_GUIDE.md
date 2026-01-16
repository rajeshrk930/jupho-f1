# SaaS Deployment Guide: www.jupho.io + app.jupho.io

This guide covers the complete setup for your production SaaS architecture with separate landing and app domains.

## Architecture Overview

- **www.jupho.io** → Landing page (public, no auth)
- **app.jupho.io** → Application (Clerk auth required)
- **Single Next.js deployment** serving both domains

## Deployment Steps

### 1. Vercel Domain Configuration

#### Add Custom Domains

1. Go to your Vercel project settings → Domains
2. Add **both** domains:
   - `www.jupho.io`
   - `app.jupho.io`
3. Vercel will provide DNS records for each domain

#### DNS Configuration at Your Domain Registrar

Add these records to your domain registrar (e.g., Namecheap, GoDaddy):

**For www.jupho.io:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For app.jupho.io:**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

**Verification:**
```bash
# Check DNS propagation (may take 5-60 minutes)
dig www.jupho.io
dig app.jupho.io
```

### 2. Environment Variables (Vercel)

Go to Vercel project → Settings → Environment Variables

Add these for **Production**, **Preview**, and **Development**:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_a25vd2luZy1kdWNrLTM3LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_XI43jZPhLP2krflXnbFWrIbPuq9KdJPewDxDR11iOP

# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api

# Admin Access (optional)
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com

# Razorpay (if using payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id
```

### 3. Clerk Dashboard Configuration

Go to https://dashboard.clerk.com → Your Application → Settings

#### Update Application URLs

**Homepage URL:** `https://www.jupho.io`

**Paths:**
- Sign-in URL: `https://app.jupho.io/sign-in`
- Sign-up URL: `https://app.jupho.io/sign-up`
- After sign-in: `https://app.jupho.io/dashboard`
- After sign-up: `https://app.jupho.io/dashboard`

#### Set Up Webhooks

1. Go to Webhooks section → Add Endpoint
2. Endpoint URL: `https://your-backend-domain.com/api/webhooks/clerk`
3. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy the webhook signing secret (starts with `whsec_...`)

### 4. Backend Environment Variables

Add to your backend deployment (Railway/Render/etc.):

```env
# Clerk Configuration
CLERK_PUBLISHABLE_KEY=pk_test_a25vd2luZy1kdWNrLTM3LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_XI43jZPhLP2krflXnbFWrIbPuq9KdJPewDxDR11iOP
CLERK_WEBHOOK_SECRET=whsec_your-webhook-signing-secret

# Frontend URL
FRONTEND_URL=https://app.jupho.io

# Database
DATABASE_URL=your-postgres-connection-string

# Other required vars...
```

### 5. Deploy and Test

#### Deploy to Vercel

```bash
git add .
git commit -m "feat: add landing page and domain-aware routing"
git push origin main
```

Vercel will automatically deploy. If not, trigger manually:
- Go to Vercel dashboard → Deployments → Redeploy
- Check "Clear Build Cache" if previous build had issues

#### Testing Checklist

**On www.jupho.io:**
- [ ] Landing page loads (hero, features, CTA)
- [ ] "Get Started" button redirects to `app.jupho.io/sign-up`
- [ ] "Sign In" button redirects to `app.jupho.io/sign-in`
- [ ] Privacy/Terms links work

**On app.jupho.io:**
- [ ] Sign-up page loads (Clerk UI)
- [ ] Sign-in page loads (Clerk UI)
- [ ] After sign-up → redirects to `/dashboard`
- [ ] Dashboard requires authentication
- [ ] Unauthenticated users redirected to `/sign-in`

**Backend webhook test:**
- [ ] Sign up a test user
- [ ] Check backend logs for "User created" message
- [ ] Verify user exists in database (Prisma Studio or SQL query)

### 6. Troubleshooting

#### 500 Error on app.jupho.io

**Cause:** Missing Clerk environment variables

**Fix:**
1. Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in Vercel
2. Verify `CLERK_SECRET_KEY` is set in Vercel
3. Redeploy with "Clear Build Cache"

#### Users Sign Up But Don't Appear in Database

**Cause:** Webhook not configured or failing

**Fix:**
1. Verify `CLERK_WEBHOOK_SECRET` is set in backend
2. Check webhook endpoint is accessible: `curl https://your-backend.com/api/webhooks/clerk`
3. Check Clerk dashboard → Webhooks → Recent Deliveries for errors
4. Review backend logs for webhook errors

#### DNS Not Resolving

**Cause:** DNS propagation delay or incorrect records

**Fix:**
1. Wait 5-60 minutes for DNS propagation
2. Verify CNAME records point to `cname.vercel-dns.com`
3. Use `dig` or `nslookup` to verify:
   ```bash
   dig www.jupho.io
   dig app.jupho.io
   ```

#### Middleware Redirect Loop

**Cause:** Middleware logic conflict

**Fix:**
1. Check hostname detection in `frontend/middleware.ts`
2. Ensure `/sign-in` and `/sign-up` are marked as auth routes
3. Clear browser cache and test in incognito

## Post-Deployment

### Monitor Webhook Deliveries

Go to Clerk dashboard → Webhooks → Your endpoint → Logs

Watch for failed deliveries and troubleshoot immediately.

### Test User Flow End-to-End

1. Visit www.jupho.io
2. Click "Get Started"
3. Complete sign-up on app.jupho.io
4. Verify landing in dashboard
5. Test AI ad creation flow

### Optional: Set Up SSL Redirect

Vercel automatically provides SSL, but ensure HTTP → HTTPS redirect is enabled:

Vercel project → Settings → Domains → SSL → "Always Use HTTPS"

## Success Criteria

✅ Landing page loads on www.jupho.io  
✅ App requires auth on app.jupho.io  
✅ Sign-up/sign-in work via Clerk  
✅ New users sync to database via webhook  
✅ Redirects flow correctly (landing → sign-up → dashboard)  
✅ SSL certificates active on both domains  

## Next Steps

- Set up monitoring (Sentry, LogRocket)
- Configure Google Analytics on landing page
- Test payment flow (if implemented)
- Set up staging environment with different subdomains
