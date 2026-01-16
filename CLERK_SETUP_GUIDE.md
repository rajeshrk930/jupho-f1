# Clerk Authentication Setup Guide

## ✅ Implementation Complete

Clerk authentication has been successfully integrated into Jupho. This guide will help you complete the setup.

---

## 📋 What Was Changed

### Backend Changes
1. **Prisma Schema** ([schema.prisma](backend/prisma/schema.prisma))
   - ✅ Removed `password` field from User model
   - ✅ Added `clerkId String @unique` field
   - ✅ Created migration file: `20260116114531_add_clerk_auth`

2. **New Files Created**
   - ✅ `backend/src/middleware/clerkAuth.ts` - Clerk authentication middleware
   - ✅ `backend/src/routes/clerk.routes.ts` - Webhook endpoint for user sync

3. **Updated Files**
   - ✅ `backend/src/index.ts` - Added Clerk routes
   - ✅ `backend/src/routes/agent.routes.ts` - Replaced `authenticate` with `...clerkAuth`
   - ✅ `backend/src/routes/facebook.routes.ts` - Replaced `authenticate` with `...clerkAuth`
   - ✅ `backend/src/routes/payment.routes.ts` - Replaced `authenticate` with `...clerkAuth`
   - ✅ `backend/.env.example` - Added Clerk environment variables

### Frontend Changes
1. **New Files Created**
   - ✅ `frontend/src/app/sign-in/[[...sign-in]]/page.tsx` - Clerk SignIn component
   - ✅ `frontend/src/app/sign-up/[[...sign-up]]/page.tsx` - Clerk SignUp component

2. **Updated Files**
   - ✅ `frontend/src/app/layout.tsx` - Wrapped app with `ClerkProvider`
   - ✅ `frontend/src/middleware.ts` - Replaced custom auth with Clerk's `authMiddleware`
   - ✅ `frontend/src/lib/api.ts` - Updated to use Clerk session tokens
   - ✅ `frontend/.env.example` - Added Clerk environment variables

### Packages Installed
- ✅ Backend: `@clerk/clerk-sdk-node`, `svix`
- ✅ Frontend: `@clerk/nextjs`

---

## 🚀 Setup Steps

### 1. Create Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application
4. Choose authentication methods:
   - ✅ **Email** (with magic link or password)
   - ✅ **Google OAuth** (recommended)
   - Optional: Facebook, GitHub, etc.

### 2. Get Clerk API Keys

In your Clerk dashboard:

1. Go to **API Keys** section
2. Copy your keys:
   - `CLERK_SECRET_KEY` (starts with `sk_test_` or `sk_live_`)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_test_` or `pk_live_`)

### 3. Configure Backend Environment

Update `backend/.env`:

```bash
# Clerk Authentication
CLERK_SECRET_KEY=sk_test_your-actual-clerk-secret-key
CLERK_WEBHOOK_SECRET=whsec_your-webhook-secret
```

### 4. Configure Frontend Environment

Update `frontend/.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-actual-clerk-publishable-key
```

### 5. Set Up Clerk Webhook

The webhook syncs Clerk users to your PostgreSQL database.

1. In Clerk dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. Enter your backend URL:
   ```
   https://your-backend-url.railway.app/api/webhooks/clerk
   ```
   Or for local development:
   ```
   https://your-ngrok-url.ngrok.io/api/webhooks/clerk
   ```

4. Subscribe to these events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted` (optional)

5. Copy the **Signing Secret** (starts with `whsec_`)
6. Add it to your `backend/.env`:
   ```bash
   CLERK_WEBHOOK_SECRET=whsec_your-actual-webhook-secret
   ```

### 6. Run Database Migration

Start your PostgreSQL database, then:

```bash
cd backend
npx prisma migrate deploy
```

Or for development:
```bash
npx prisma migrate dev
```

This will:
- Add `clerkId` column to User table
- Remove `password` column
- Add unique constraint on `clerkId`

### 7. Update Clerk Settings (Optional but Recommended)

In Clerk dashboard:

1. **Email Settings**
   - Customize email templates (verification, password reset)
   - Add your domain for branded emails

2. **Social Connections**
   - Enable **Google OAuth**:
     - Go to **Social Connections** → **Google**
     - Use Clerk's development keys (instant setup)
     - Or add your own OAuth credentials for production

3. **User & Authentication**
   - Set password requirements
   - Enable/disable email verification
   - Configure session lifetime (default: 7 days)

4. **Sessions**
   - Token lifetime: 1 hour (default)
   - Refresh: Automatic
   - Multi-session: Enabled (users can login on multiple devices)

---

## 🧪 Testing

### Test Signup Flow

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Go to `http://localhost:3000/sign-up`
4. Try both methods:
   - **Email signup**: Enter email → Receive code → Enter code → Account created
   - **Google signup**: Click "Continue with Google" → Account created instantly

### Test Database Sync

After signing up, check your database:

```sql
SELECT id, "clerkId", email, name, plan FROM "User";
```

You should see:
- User created with `clerkId` from Clerk
- Email and name synced from Clerk
- Default plan set to 'FREE'

### Test Protected Routes

1. Try accessing `/agent` without login → Redirected to `/sign-in`
2. Login → Can access `/agent`
3. Logout → Redirected to `/sign-in`

---

## 🔐 Security Features

### What Clerk Provides

✅ **Email Verification**: Automatic magic link or OTP code
✅ **OAuth Integration**: Google, Facebook, GitHub, etc.
✅ **Session Management**: Secure JWT tokens with rotation
✅ **Rate Limiting**: Built-in protection against brute force
✅ **2FA** (Pro plan): TOTP authenticator app support
✅ **Password Strength**: Configurable requirements
✅ **CAPTCHA**: reCAPTCHA integration for signup/login
✅ **Audit Logs** (Pro plan): Track all auth events
✅ **SSO** (Enterprise): SAML, OIDC support

### Migration from Old Auth

Since you have **0 users**, no migration needed! 🎉

If you had existing users, you would need to:
1. Export user emails from old database
2. Create Clerk accounts programmatically via Clerk API
3. Send password reset emails to all users
4. Migrate user data (payments, Facebook accounts, etc.)

---

## 📱 User Experience

### New Login Flow

**Option A: Email (with code)**
1. User enters: `rajesh@gmail.com`
2. Clerk sends: 6-digit code to email
3. User enters: `492011`
4. ✅ Logged in (email verified automatically)

**Option B: Google OAuth**
1. User clicks: "Continue with Google"
2. Google popup: Select account
3. ✅ Logged in (name, photo imported)

**Option C: Email + Password** (if enabled)
1. User enters: `rajesh@gmail.com` + password
2. Clerk sends: Verification email
3. User clicks: Verify link
4. ✅ Logged in

### What Users See

- **Beautiful UI**: Professional Clerk-styled forms
- **No "hi@gmail.com"**: Email verification required
- **Social Login**: One-click Google login
- **Profile Management**: Built-in profile page
- **Password Reset**: Automatic "Forgot password?" flow

---

## 🎨 Customization

### Customize Clerk UI Theme

Update `frontend/src/app/layout.tsx`:

```tsx
<ClerkProvider
  appearance={{
    variables: {
      colorPrimary: '#FF6B6B', // Coral red (your brand color)
      colorBackground: '#FFFFFF',
      colorText: '#1F2937',
    },
    elements: {
      formButtonPrimary: 'bg-coral-500 hover:bg-coral-600',
      card: 'shadow-2xl',
    }
  }}
>
  {/* ... */}
</ClerkProvider>
```

### Add User Button in Header

Update `frontend/src/components/ConditionalHeader.tsx`:

```tsx
import { UserButton } from '@clerk/nextjs';

// Add to header:
<UserButton afterSignOutUrl="/" />
```

This shows:
- User profile photo
- Dropdown with: Profile, Settings, Logout

---

## 🚨 Troubleshooting

### Issue: "Invalid Clerk Publishable Key"
**Fix**: Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is in `frontend/.env.local` (not `.env`)

### Issue: "Webhook signature verification failed"
**Fix**: 
1. Check `CLERK_WEBHOOK_SECRET` in `backend/.env`
2. Regenerate secret in Clerk dashboard if needed
3. Ensure webhook URL is publicly accessible (use ngrok for local dev)

### Issue: "User not found in database"
**Fix**:
1. Check webhook is configured and firing
2. Check backend logs for webhook errors
3. Manually test webhook:
   ```bash
   curl -X POST http://localhost:5000/api/webhooks/clerk \
     -H "Content-Type: application/json" \
     -H "svix-id: test" \
     -H "svix-timestamp: $(date +%s)" \
     -H "svix-signature: v1,test" \
     -d '{...}'
   ```

### Issue: "401 Unauthorized on API calls"
**Fix**:
1. Check Clerk session is active: `console.log(await auth().getToken())`
2. Verify `CLERK_SECRET_KEY` in backend `.env`
3. Check CORS settings in `backend/src/index.ts`

---

## 📊 Monitoring

### Clerk Dashboard

Monitor in real-time:
- **Users**: Total signups, active sessions
- **Events**: Logins, signups, password resets
- **Webhooks**: Success/failure rates
- **Sessions**: Active sessions per user

### Backend Logs

Key events logged:
```
✅ User created: rajesh@gmail.com (Clerk ID: user_abc123)
✅ User updated: rajesh@gmail.com (Clerk ID: user_abc123)
❌ Webhook verification failed: Invalid signature
```

---

## 💰 Pricing

### Clerk Free Tier
- ✅ 10,000 Monthly Active Users (MAU)
- ✅ Email + password authentication
- ✅ Social OAuth (Google, Facebook, etc.)
- ✅ Session management
- ✅ Webhooks
- ✅ User management dashboard

### When to Upgrade (Pro: $25/month)
- You hit 10,000 MAU
- Need 2FA (TOTP authenticator)
- Need audit logs
- Need SSO (SAML, OIDC)
- Need custom session duration

---

## 🎯 Next Steps

1. ✅ Add Clerk keys to environment variables
2. ✅ Set up webhook in Clerk dashboard
3. ✅ Run database migration
4. ✅ Test signup with email and Google
5. ✅ Customize Clerk UI to match your brand
6. ✅ Add `<UserButton />` to header
7. ✅ Deploy backend webhook endpoint (publicly accessible)
8. ✅ Configure production Clerk app (separate from test)

---

## 📚 Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js + Clerk Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Express + Clerk Guide](https://clerk.com/docs/backend-requests/handling/nodejs)
- [Webhook Events Reference](https://clerk.com/docs/integrations/webhooks/overview)

---

## ✨ Benefits Summary

Before Clerk:
- ❌ Anyone could create account with `hi@gmail.com`
- ❌ No email verification
- ❌ Manual password reset implementation needed
- ❌ No OAuth (Google, Facebook)
- ❌ Security vulnerabilities (account enumeration)

After Clerk:
- ✅ Email verification required (code or magic link)
- ✅ Google OAuth (one-click signup)
- ✅ Enterprise-grade security
- ✅ Beautiful, professional UI
- ✅ No fake accounts (`hi@gmail.com` won't work!)
- ✅ Automatic session management
- ✅ Built-in user profile pages
- ✅ Future-ready (2FA, SSO available)

---

**Implementation Status**: ✅ Complete (Ready for environment variables and database migration)

**Estimated Setup Time**: 15-30 minutes

**Migration Difficulty**: Zero (0 existing users)
