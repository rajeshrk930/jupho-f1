# Vercel Deployment - Quick Setup Guide

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Environment Variables

Copy these variables and have them ready for Vercel:

#### Required Variables (Must Have) ⚠️
```bash
# Backend API URL (from Railway)
NEXT_PUBLIC_API_URL=https://your-backend-name.up.railway.app/api

# Clerk Authentication (from clerk.com dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
# Note: Use pk_test_xxxxx for testing, pk_live_xxxxx for production

# Razorpay Payment Gateway (from razorpay.com dashboard)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
# Note: Use rzp_test_xxxxx for testing, rzp_live_xxxxx for production
```

#### Optional Variables (Recommended) ✅
```bash
# Admin Panel Access
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com

# Sentry Error Tracking (optional - can add later)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
NEXT_PUBLIC_SENTRY_RELEASE=1.0.0
SENTRY_AUTH_TOKEN=xxxxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

---

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com/new

2. **Import your GitHub repository**:
   - Click "Add New" → "Project"
   - Select your repository: `rajeshrk930/jupho-f1`
   - Click "Import"

3. **Configure Project Settings**:
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: (leave default: .next)
   Install Command: npm install
   ```

4. **Add Environment Variables**:
   - Click "Environment Variables"
   - For each variable above, click "Add"
   - Paste variable name and value
   - Select: ✅ Production, ✅ Preview, ✅ Development
   - Click "Add"

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd frontend
vercel --prod

# Follow prompts to set up project
# Add environment variables when prompted
```

---

### Step 3: Post-Deployment Configuration

#### A. Configure Clerk for Your Vercel Domain

1. Go to Clerk Dashboard: https://dashboard.clerk.com
2. Select your application
3. Go to **Configure** → **Domains**
4. Click "Add domain"
5. Add your Vercel domain: `your-app.vercel.app`
6. Save

#### B. Update Backend CORS Settings

In your Railway backend, update CORS to allow Vercel domain:

File: `backend/src/index.ts`
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app',
    'https://your-app-*.vercel.app', // For preview deployments
  ],
  credentials: true
}));
```

Then redeploy your Railway backend.

---

### Step 4: Test Your Deployment

Visit your Vercel URL and test:

- [ ] Homepage loads ✅
- [ ] Click "Sign In" → Redirects to Clerk
- [ ] Sign in with test account
- [ ] Redirects to `/dashboard`
- [ ] Try creating a campaign (template-based)
- [ ] Check if FREE user is blocked from AI Agent
- [ ] Open upgrade modal → Check pricing displays correctly
- [ ] **DO NOT test real payment yet** (use test mode first)

---

## 🐛 Troubleshooting Common Issues

### Issue: "API is not available"
**Cause**: `NEXT_PUBLIC_API_URL` not set or wrong

**Fix**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Check `NEXT_PUBLIC_API_URL` is set correctly
3. Must end with `/api` (e.g., `https://backend.railway.app/api`)
4. Click "Redeploy" after fixing

---

### Issue: Clerk authentication not working
**Cause**: Domain not added to Clerk or wrong publishable key

**Fix**:
1. Check Clerk Dashboard → Configure → Domains
2. Add your Vercel domain
3. Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in Vercel
4. Make sure using correct key (pk_test vs pk_live)

---

### Issue: CORS errors in browser console
**Cause**: Backend doesn't allow Vercel domain

**Fix**:
1. Add Vercel domain to backend CORS (see Step 3B above)
2. Redeploy backend on Railway
3. Test again

---

### Issue: Build fails with module errors
**Cause**: Dependencies not installed or wrong Node version

**Fix**:
1. Go to Vercel Settings → General
2. Check Node.js Version: Should be **18.x** or **20.x**
3. Clear build cache: Settings → General → Clear Cache
4. Redeploy

---

### Issue: Payment modal doesn't open
**Cause**: Razorpay script not loaded

**Fix**: Already handled in your code! Razorpay script is in [layout.tsx](frontend/src/app/layout.tsx):
```tsx
<script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
```

---

## 📊 Check Deployment Status

### View Build Logs
```
Vercel Dashboard → Your Project → Deployments → Click deployment → View Build Logs
```

### View Runtime Logs
```
Vercel Dashboard → Your Project → Deployments → Click deployment → View Function Logs
```

### Test API Connection
Open browser console on your deployed site:
```javascript
fetch(process.env.NEXT_PUBLIC_API_URL + '/health')
  .then(r => r.json())
  .then(data => console.log('Backend health:', data))
  .catch(err => console.error('Backend error:', err))
```

---

## ✅ Deployment Checklist

Before going live:

- [ ] All environment variables added to Vercel
- [ ] Vercel domain added to Clerk
- [ ] Backend CORS updated with Vercel domain
- [ ] Test sign-in/sign-up flow
- [ ] Test campaign creation (FREE user)
- [ ] Test AI Agent blocking (FREE/BASIC users)
- [ ] Test upgrade modal displays correctly
- [ ] Payment flow tested in TEST MODE
- [ ] Mobile responsive (test on phone)
- [ ] No console errors in browser

---

## 🎉 Success!

Your app is now live at: `https://your-app.vercel.app`

### Next Steps:
1. Test all features thoroughly
2. Switch to live Razorpay keys when ready for real payments
3. Set up custom domain (optional)
4. Monitor errors with Sentry (optional)
5. Announce to users! 🚀

---

## 📞 Need Help?

Common error messages and solutions: See [VERCEL_DEPLOYMENT_DEBUG.md](VERCEL_DEPLOYMENT_DEBUG.md)

Your build is already passing locally:
```bash
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (22/22)
```

**You're ready to deploy!** 🎊
