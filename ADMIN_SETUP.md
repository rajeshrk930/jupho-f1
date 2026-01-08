# Quick Start Guide - Admin Dashboard

## ⚡ 5-Minute Setup

### Step 1: Add Your Email as Admin

**Backend** - Edit `/Users/gugulothrajesh/jupho-f1/backend/.env`:
```env
ADMIN_EMAILS=your-actual-email@example.com
```

**Frontend** - Edit `/Users/gugulothrajesh/jupho-f1/frontend/.env.local`:
```env
NEXT_PUBLIC_ADMIN_EMAILS=your-actual-email@example.com
```

> 💡 Use the SAME email you use to login to Jupho!

### Step 2: Restart Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 3: Login & Access Admin

1. Open http://localhost:3000
2. Login with your admin email
3. Look for **"Admin"** link in left sidebar (shield icon)
4. Click it to open admin dashboard at http://localhost:3000/admin

## What You'll See

### Dashboard Stats (4 Cards):
- **Users**: Total count, FREE vs PRO breakdown
- **Analyses**: Total analyses + average per user
- **Chats**: Total conversations
- **Revenue**: Estimated (₹299 × PRO users)

### Users Table:
- Search by name or email
- Filter by plan (FREE/PRO)
- See usage and activity
- Edit plan or delete user

## Quick Actions

### Change User to PRO:
1. Find user in table
2. Click "Edit"
3. Select "PRO" from dropdown
4. Click "Save Changes"
5. User now has unlimited access ✅

### Search Users:
Just type in search box - searches both name and email instantly

### Delete User:
1. Click "Delete" button
2. Confirm deletion
3. All user data deleted (analyses, chats, templates)

## Troubleshooting

❌ **"Admin access required" error**
- Check email in ADMIN_EMAILS exactly matches login email
- Restart backend after changing .env
- Make sure no spaces around email

❌ **Admin link not showing in sidebar**
- Check NEXT_PUBLIC_ADMIN_EMAILS in frontend .env.local
- Rebuild frontend: `npm run dev` (stop and restart)
- Clear browser cache

❌ **403 Forbidden on admin routes**
- Backend didn't load ADMIN_EMAILS
- Check backend console for env loading errors
- Verify you're logged in (JWT valid)

## Testing Without Real Users

Want to test with fake data? Create test users:

```bash
cd backend
npx ts-node scripts/createTestUser.ts
```

Then view them in admin dashboard!

## Production Deployment

### Railway (Backend):
1. Go to Railway dashboard
2. Open your backend service
3. Click "Variables"
4. Add: `ADMIN_EMAILS=your-email@example.com`
5. Redeploy

### Vercel (Frontend):
1. Go to Vercel dashboard
2. Open your project
3. Settings → Environment Variables
4. Add: `NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com`
5. Redeploy

## Security Notes

✅ **Backend validates EVERY request** - email must be in ADMIN_EMAILS
✅ **Frontend hides link** - but backend still enforces access
✅ **JWT required** - must be logged in user
✅ **403 for non-admins** - even if they guess the URL

## File Reference

Created files you can review:
- `backend/src/middleware/admin.ts` - Admin auth check
- `backend/src/routes/admin.routes.ts` - All admin API endpoints
- `frontend/src/app/admin/page.tsx` - Admin dashboard UI
- `ADMIN_DASHBOARD.md` - Complete documentation

## Need Help?

Common questions answered in `ADMIN_DASHBOARD.md`

Admin dashboard is LIVE and ready to use! 🚀
