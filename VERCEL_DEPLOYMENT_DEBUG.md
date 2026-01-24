# Vercel Deployment Debug Guide

## 🔍 Common Vercel Deployment Issues & Fixes

### Issue 1: Environment Variables Missing ❌
**Error:** `Error: NEXT_PUBLIC_API_URL is not defined` or API calls fail

**Fix:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these required variables:

```bash
# Required Environment Variables
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your-clerk-key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your-key

# Optional but Recommended
NEXT_PUBLIC_ADMIN_EMAILS=admin@yourdomain.com
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/...
NEXT_PUBLIC_SENTRY_RELEASE=1.0.0
SENTRY_AUTH_TOKEN=your-token (only for build)
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

3. Make sure to select **Production, Preview, Development** for each variable
4. **Redeploy** after adding variables

---

### Issue 2: Build Failing - Module Not Found ❌
**Error:** `Module not found: Can't resolve '@/components/...'`

**Fix:**
Check [tsconfig.json](frontend/tsconfig.json) has correct paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

### Issue 3: Clerk Authentication Not Working ❌
**Error:** Users can't sign in or infinite redirect loop

**Fix:**
1. Go to Clerk Dashboard → Configure → Paths
2. Set these URLs:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`

3. Add your Vercel domain to Clerk's allowed domains:
   - Go to Clerk → Configure → Domains
   - Add: `your-app.vercel.app`

4. Update middleware.ts if needed:
```typescript
export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)'
  ],
};
```

---

### Issue 4: API Calls Failing with CORS ❌
**Error:** `Access to fetch blocked by CORS policy`

**Fix:**
Backend must allow your Vercel domain. In [backend/src/index.ts](backend/src/index.ts):
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app',
    'https://your-app-*.vercel.app', // Preview deployments
  ],
  credentials: true
}));
```

---

### Issue 5: Razorpay Payment Modal Not Opening ❌
**Error:** `Razorpay is not defined`

**Fix:**
Make sure Razorpay script is loaded. Add to [frontend/src/app/layout.tsx](frontend/src/app/layout.tsx):
```tsx
<Script
  src="https://checkout.razorpay.com/v1/checkout.js"
  strategy="lazyOnload"
/>
```

---

### Issue 6: Images Not Loading ❌
**Error:** Images show broken or 404

**Fix:**
1. Check [next.config.js](frontend/next.config.js) has correct image config:
```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-backend.railway.app',
        pathname: '/uploads/**',
      },
    ],
  },
};
```

2. Update backend URL in `.env` to use HTTPS (not HTTP)

---

### Issue 7: Build Succeeds but Runtime Error ❌
**Error:** Page shows error in production but works locally

**Fix:**
1. Check browser console for errors
2. Common causes:
   - Missing environment variables (check Vercel dashboard)
   - API URL points to `localhost` instead of production backend
   - Clerk keys are test keys instead of live keys

3. Test production build locally:
```bash
cd frontend
npm run build
npm run start
```

---

### Issue 8: Sentry Issues During Build ⚠️
**Warning:** Build slow or fails during source map upload

**Fix:**
Option 1: Make Sentry optional in [next.config.js](frontend/next.config.js):
```javascript
module.exports = process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
```

Option 2: Disable Sentry temporarily:
Remove `SENTRY_AUTH_TOKEN` from Vercel environment variables

---

## 🚀 Deployment Checklist

### Before Deploying to Vercel

- [ ] **Test build locally**: `cd frontend && npm run build`
- [ ] **Check all API URLs**: Replace `localhost:5000` with Railway URL
- [ ] **Environment variables**: Have all keys ready (Clerk, Razorpay, API URL)
- [ ] **Clerk setup**: Switch from test to live keys if going to production
- [ ] **Razorpay setup**: Switch from test to live keys if going to production
- [ ] **Backend deployed**: Railway backend is live and accessible
- [ ] **CORS configured**: Backend allows Vercel domain

### Deploying to Vercel

1. **Push to GitHub**:
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

2. **Import to Vercel**:
   - Go to vercel.com
   - Click "Add New" → "Project"
   - Import your GitHub repo
   - Select `frontend` as root directory

3. **Configure Build Settings**:
   - Framework Preset: **Next.js**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Add Environment Variables** (see Issue 1 above)

5. **Deploy** 🚀

### After Deployment

- [ ] Visit your Vercel URL
- [ ] Test sign-in with Clerk
- [ ] Test creating a campaign
- [ ] Test upgrade modal and payment flow (test mode)
- [ ] Check browser console for errors
- [ ] Test on mobile device

---

## 🐛 Debug Tools

### 1. Check Vercel Build Logs
```
Vercel Dashboard → Your Project → Deployments → Click deployment → View Build Logs
```

### 2. Check Runtime Logs
```
Vercel Dashboard → Your Project → Deployments → Click deployment → View Function Logs
```

### 3. Test API Connectivity
Open browser console on Vercel deployment:
```javascript
fetch('https://your-backend.railway.app/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### 4. Check Environment Variables Are Set
In browser console on Vercel:
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
console.log('Clerk:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
console.log('Razorpay:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)
```

---

## 📞 Quick Fixes for Common Errors

| Error Message | Quick Fix |
|---------------|-----------|
| `API is not available` | Add `NEXT_PUBLIC_API_URL` env var in Vercel |
| `Clerk: Missing publishableKey` | Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in Vercel |
| `Cannot read property 'Razorpay'` | Add Razorpay script to layout.tsx |
| `CORS error` | Add Vercel URL to backend CORS origins |
| `404 on /api/*` | API routes should be in backend, not frontend |
| `Module not found` | Check tsconfig.json paths are correct |
| `Build timeout` | Reduce dependencies or upgrade Vercel plan |

---

## 🔗 Helpful Links

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Clerk + Vercel: https://clerk.com/docs/deployments/deploy-clerk-vercel
- Razorpay Integration: https://razorpay.com/docs/payments/payment-gateway/web-integration/

---

## 🆘 Still Having Issues?

1. **Check specific error message** in Vercel build logs
2. **Search error on Vercel forums**: https://github.com/vercel/vercel/discussions
3. **Test locally first**: `npm run build && npm start`
4. **Compare environment variables**: Local vs Vercel
5. **Check backend is accessible**: Visit your Railway URL in browser

---

## ✅ Current Project Status

Your frontend is **ready to deploy** with:
- ✅ Next.js 14 build successful locally
- ✅ No TypeScript errors
- ✅ 3-tier pricing fully implemented
- ✅ Clerk authentication configured
- ✅ Razorpay payment integration

**Next step:** Add environment variables to Vercel and deploy!
