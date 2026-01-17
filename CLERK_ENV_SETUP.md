# Clerk Environment Variables Setup

## ✅ Local Development (.env.local)

The following environment variables have been added to `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxx

# Clerk Paths - Tell Clerk to use /sign-in instead of /login
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Admin Access
NEXT_PUBLIC_ADMIN_EMAILS=gugulothrajesh607@gmail.com
```

## 🚀 Production Deployment (Vercel)

Add these environment variables to your Vercel project:

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your `jupho-f1` project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add All Variables

#### Authentication Keys
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
```
(Get your actual keys from Clerk Dashboard)

#### Clerk Paths (CRITICAL - These fix the /login 404 error)
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

#### API Configuration
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

#### Admin Access
```
NEXT_PUBLIC_ADMIN_EMAILS=gugulothrajesh607@gmail.com
```

### Step 3: Redeploy
After adding environment variables, trigger a new deployment:
- Go to **Deployments** tab
- Click **⋯** on latest deployment
- Select **Redeploy**

---

## 🔍 What These Variables Do

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Tells Clerk to redirect to `/sign-in` instead of default `/login` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Tells Clerk to use `/sign-up` instead of default `/signup` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Where to redirect after successful sign-in |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Where to redirect after successful sign-up |

---

## 🐛 Why This Was Needed

**The Problem:**
- Old code used JWT auth with `/login` and `/signup` pages
- Switched to Clerk which uses `/sign-in` and `/sign-up`
- Clerk's default `auth.protect()` still redirected to `/login`
- `/login` page was deleted → **404 error**

**The Solution:**
- Configure Clerk to use `/sign-in` path
- Add proper redirect URLs
- Now when unauthenticated users try to access protected pages, they're redirected to `/sign-in` ✅

---

## ✅ Testing

After deployment, test the flow:

1. **Test Protected Route:**
   - Visit `https://app.jupho.io/dashboard` (without login)
   - Should redirect to `https://app.jupho.io/sign-in` ✅ (not `/login`)

2. **Test Sign-In:**
   - Visit `https://www.jupho.io`
   - Click "Sign In"
   - Should go to `https://app.jupho.io/sign-in` ✅
   - After login → redirect to `/dashboard` ✅

3. **Test Already Logged In:**
   - Sign in first
   - Try visiting `https://app.jupho.io/sign-in`
   - Should immediately redirect to `/dashboard` ✅

---

## 🔄 Restart Local Server

After updating `.env.local`, restart your development server:

```bash
cd frontend
npm run dev
```

---

**Last Updated:** January 17, 2026  
**Status:** Environment variables configured, ready for Vercel deployment
