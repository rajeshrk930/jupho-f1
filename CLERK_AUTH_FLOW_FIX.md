# Clerk Authentication Flow - Complete Setup Guide

## Problem Identified
After sign-in/sign-up, users are redirected back to landing page instead of dashboard. This happens because:

1. ✅ **FIXED** - Clerk components needed redirect URLs (now added)
2. ⚠️ **PENDING** - Backend webhook not configured to sync users to database
3. ⚠️ **PENDING** - Clerk Dashboard URLs need configuration

---

## ✅ What's Already Fixed (Code Changes)

### 1. Sign-In/Sign-Up Redirect URLs
**Files Updated:**
- `frontend/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `frontend/src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`

Both now have:
```tsx
forceRedirectUrl="/dashboard"
```

### 2. Header Visibility Fixed
**File:** `frontend/src/components/ConditionalHeader.tsx`

Now properly hides app navigation on `/sign-in` and `/sign-up` pages.

---

## ⚠️ Required Configuration (Clerk Dashboard)

### Step 1: Configure Redirect URLs in Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Go to **Paths** in the sidebar
4. Configure these URLs:

**For Production (www.jupho.io + app.jupho.io):**
```
Sign-in URL: https://app.jupho.io/sign-in
Sign-up URL: https://app.jupho.io/sign-up
After sign-in URL: https://app.jupho.io/dashboard
After sign-up URL: https://app.jupho.io/dashboard
```

**For Local Development (localhost):**
```
Sign-in URL: http://localhost:3000/sign-in
Sign-up URL: http://localhost:3000/sign-up
After sign-in URL: http://localhost:3000/dashboard
After sign-up URL: http://localhost:3000/dashboard
```

### Step 2: Set Up Clerk Webhook (Database Sync)

#### A. Get Webhook Secret from Clerk

1. In Clerk Dashboard, go to **Webhooks** in sidebar
2. Click **+ Add Endpoint**
3. For production, enter: `https://your-backend-domain.com/api/webhooks/clerk`
4. For development, use ngrok or similar:
   ```bash
   # Install ngrok if not installed
   brew install ngrok
   
   # Start backend on port 5001
   cd backend && npm run dev
   
   # In another terminal, expose backend
   ngrok http 5001
   
   # Copy the ngrok URL (e.g., https://abc123.ngrok.io)
   # Add to Clerk: https://abc123.ngrok.io/api/webhooks/clerk
   ```
5. Select these events:
   - `user.created` ✓
   - `user.updated` ✓
   - `user.deleted` ✓
6. Click **Create**
7. **Copy the Signing Secret** (starts with `whsec_...`)

#### B. Add Webhook Secret to Backend

**File:** `backend/.env`

Add this line:
```env
# Clerk Webhook (for syncing users to database)
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

#### C. Restart Backend
```bash
cd backend
npm run dev
```

---

## 🔍 Testing the Complete Flow

### Local Development Test

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Authentication:**
   - Open `http://localhost:3000`
   - Click "Get Started" or "Sign In"
   - Create account or sign in
   - **Expected:** After authentication, redirected to `http://localhost:3000/dashboard`
   - **Check Backend Logs:** Should see "User created: [email] (Clerk ID: [id])"

4. **Verify Database:**
   ```bash
   cd backend
   npx prisma studio
   ```
   - Check `User` table
   - Should see user with `clerkId`, `email`, `name`, `plan: FREE`

### Production Test (After Deployment)

1. Visit `https://www.jupho.io`
2. Click "Get Started"
3. Sign up with new account
4. **Expected:** Redirected to `https://app.jupho.io/dashboard`
5. Check backend logs for webhook confirmation

---

## 🔧 Environment Variables Checklist

### Frontend (.env.local)
```env
✓ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
✓ NEXT_PUBLIC_API_URL=http://localhost:5001/api
✓ NEXT_PUBLIC_ADMIN_EMAILS=your@email.com
```

### Backend (.env)
```env
✓ PORT=5001
✓ DATABASE_URL="postgresql://localhost:5432/jupho_dev"
⚠️ CLERK_WEBHOOK_SECRET=whsec_... (ADD THIS!)
✓ OPENAI_API_KEY=sk-...
✓ JWT_SECRET=your-secret
✓ ADMIN_EMAILS=your@email.com
```

---

## 🐛 Troubleshooting

### Issue: Still redirecting to landing page after login

**Check:**
1. Browser console for errors
2. Clerk Dashboard > Paths are configured correctly
3. Clear browser cache and cookies
4. Try incognito/private window

### Issue: User not appearing in database

**Check:**
1. Backend logs: `npm run dev` in backend folder
2. Is `CLERK_WEBHOOK_SECRET` set in `backend/.env`?
3. Clerk Dashboard > Webhooks > Check webhook status (should show successful deliveries)
4. For local dev: Is ngrok running and webhook URL updated?

### Issue: Webhook verification failed

**Check:**
1. Webhook secret matches exactly (including `whsec_` prefix)
2. Backend is accessible at the webhook URL
3. For local dev: ngrok URL hasn't changed (ngrok generates new URL on restart)

---

## 📋 Quick Fix Summary

### Immediate Actions Needed:

1. **Go to Clerk Dashboard** → Configure redirect URLs (Step 1 above)
2. **Set up webhook** → Get secret, add to `backend/.env` (Step 2 above)
3. **Restart backend** → `cd backend && npm run dev`
4. **Test flow** → Sign up new user, check redirect to dashboard

### Code Changes (Already Done):
- ✅ Added `forceRedirectUrl="/dashboard"` to auth pages
- ✅ Fixed `ConditionalHeader` to hide on `/sign-in` and `/sign-up`
- ✅ Auth pages use clean layout without app navigation

---

## 🚀 Deployment Notes

When deploying to production:

1. **Vercel (Frontend):**
   - Add all env vars from `frontend/.env.local`
   - Configure custom domains (www.jupho.io + app.jupho.io)

2. **Railway/Render (Backend):**
   - Add all env vars from `backend/.env`
   - **Important:** Add `CLERK_WEBHOOK_SECRET` with production webhook secret
   - Note backend URL for webhook configuration

3. **Clerk Dashboard:**
   - Update redirect URLs to production domains
   - Update webhook endpoint to production backend URL
   - Verify webhook is receiving events

---

## Current Authentication Flow (After Fix)

```
┌─────────────────────────────────────────────────────────┐
│ 1. User visits www.jupho.io (Landing Page)             │
│    - Header shows: Sign In | Get Started buttons       │
└────────────────┬────────────────────────────────────────┘
                 │ Click "Sign In" or "Get Started"
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Redirects to /sign-in or /sign-up                   │
│    - Clean Clerk auth component (no app navigation)    │
│    - Background gradient, centered card                │
└────────────────┬────────────────────────────────────────┘
                 │ User authenticates
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Clerk processes authentication                       │
│    - Creates session                                    │
│    - Triggers webhook → Backend creates user in DB     │
└────────────────┬────────────────────────────────────────┘
                 │ forceRedirectUrl="/dashboard"
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Redirects to /dashboard                             │
│    - App header now visible (Create Ad, Projects, etc)│
│    - User sees dashboard with auth-required content    │
└─────────────────────────────────────────────────────────┘
```

---

**Last Updated:** January 17, 2026  
**Status:** Code changes committed, configuration needed
