# Subscription Fix - Testing Guide

## Issues Fixed
1. ✅ **Plan name inconsistency** - Standardized from FREE/PRO to STARTER/GROWTH across entire codebase
2. ✅ **Missing planExpiresAt** - Admin-assigned GROWTH plans now set `planExpiresAt = null` (lifetime access)
3. ✅ **Broken subscription validation** - Updated `isSubscriptionActive()` to properly validate STARTER/GROWTH plans

## Files Changed

### Backend
- `backend/src/routes/clerk.routes.ts` - New users get STARTER plan
- `backend/src/routes/admin.routes.ts` - Admin endpoints use STARTER/GROWTH, set planExpiresAt
- `backend/src/routes/payment.routes.ts` - Payment processing uses GROWTH
- `backend/src/routes/agent.routes.ts` - Usage limits check GROWTH plan
- `backend/src/routes/chat.routes.ts` - Chat limits check GROWTH plan
- `backend/scripts/createTestUser.ts` - Test user creation uses STARTER
- `backend/scripts/generateTestToken.ts` - Test token uses STARTER
- `backend/scripts/migratePlanNames.ts` - **NEW** Migration script
- `backend/create-user.js` - User creation uses STARTER

### Frontend
- `frontend/src/app/admin/page.tsx` - Admin panel dropdown shows STARTER/GROWTH
- `frontend/src/types/index.ts` - User type uses STARTER/GROWTH/AGENCY
- `frontend/src/lib/api.ts` - API client types use STARTER/GROWTH

## Migration Steps

### 1. Run Database Migration
```bash
cd backend
npx ts-node scripts/migratePlanNames.ts
```

This will:
- Convert all 'FREE' → 'STARTER'
- Convert all 'PRO' → 'GROWTH' 
- Set `planExpiresAt = null` for all existing PRO users (lifetime access)

### 2. Restart Backend
```bash
cd backend
npm run dev
```

### 3. Restart Frontend
```bash
cd frontend
npm run dev
```

## Testing Checklist

### Test 1: New User Registration (No Subscription Required)
1. ✅ Create new account via signup
2. ✅ Check database - user should have `plan: 'STARTER'`
3. ✅ User should be able to access dashboard without payment
4. ✅ User should see STARTER plan limits:
   - 5 campaigns/month
   - 1 AI campaign/month

### Test 2: Admin Panel Access
1. ✅ Log in as admin user
2. ✅ Navigate to `/admin`
3. ✅ Should see:
   - Platform statistics
   - User list with pagination
   - Plan filters showing "STARTER" and "GROWTH"
4. ✅ Click on a user → Edit button
5. ✅ Edit modal should show dropdown with:
   - STARTER (5 campaigns/month, 1 AI/month)
   - GROWTH (25 campaigns/month, unlimited AI)

### Test 3: Admin Assigns GROWTH Plan
1. ✅ As admin, open user edit modal
2. ✅ Select "GROWTH" plan
3. ✅ Click "Save Changes"
4. ✅ Verify in database:
   ```sql
   SELECT id, email, plan, planExpiresAt FROM "User" WHERE id = 'user-id';
   ```
   Should show: `plan: 'GROWTH', planExpiresAt: null`

### Test 4: User with GROWTH Plan Can Create Campaigns
1. ✅ Log in as user who was assigned GROWTH plan
2. ✅ Navigate to AI Agent or Templates
3. ✅ Create a campaign
4. ✅ Should NOT see "SUBSCRIPTION_EXPIRED" error
5. ✅ Campaign should be created successfully
6. ✅ Should see GROWTH plan limits:
   - 25 campaigns/month
   - Unlimited AI campaigns

### Test 5: User with STARTER Plan Sees Limits
1. ✅ Log in as user with STARTER plan
2. ✅ Navigate to AI Agent
3. ✅ Check usage counter:
   - Shows: "X / 5 campaigns used"
   - Shows: "X / 1 AI campaigns used"
4. ✅ Try to create 6th campaign → Should see limit error
5. ✅ Try to create 2nd AI campaign → Should see limit error

### Test 6: Payment Flow Upgrades to GROWTH
1. ✅ Log in as STARTER user
2. ✅ Navigate to pricing/payment page
3. ✅ Complete payment (use test mode)
4. ✅ After successful payment, verify:
   - User plan changed to GROWTH
   - `planExpiresAt` set to 30 days (monthly) or 365 days (annual)
   - Usage counters reset to 0

### Test 7: Admin Stats Show Correct Counts
1. ✅ As admin, view dashboard
2. ✅ Stats should show:
   - Total users
   - STARTER users count
   - GROWTH users count
   - Revenue calculated from GROWTH subscriptions
3. ✅ Numbers should match database queries:
   ```sql
   SELECT plan, COUNT(*) FROM "User" GROUP BY plan;
   ```

## Database Queries for Verification

### Check all user plans
```sql
SELECT id, email, plan, planExpiresAt, createdAt 
FROM "User" 
ORDER BY createdAt DESC 
LIMIT 20;
```

### Count users by plan
```sql
SELECT plan, COUNT(*) as count 
FROM "User" 
GROUP BY plan;
```

### Find users with old plan names (should be 0 after migration)
```sql
SELECT COUNT(*) FROM "User" WHERE plan IN ('FREE', 'PRO');
```

### Check admin users
```sql
SELECT id, email, isAdmin FROM "User" WHERE isAdmin = true;
```

## Troubleshooting

### Issue: User still sees "SUBSCRIPTION_EXPIRED"
**Cause**: planExpiresAt is in the past or plan name is still 'PRO'

**Fix**:
```sql
-- Check user's plan and expiry
SELECT plan, planExpiresAt FROM "User" WHERE email = 'user@example.com';

-- If plan is still 'PRO', update to 'GROWTH'
UPDATE "User" 
SET plan = 'GROWTH', planExpiresAt = NULL 
WHERE email = 'user@example.com';
```

### Issue: Admin panel shows wrong plan names
**Cause**: Frontend cache or backend not restarted

**Fix**:
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Restart backend: `npm run dev` in backend folder
3. Restart frontend: `npm run dev` in frontend folder

### Issue: Stats show 0 users
**Cause**: Database migration not run

**Fix**:
```bash
cd backend
npx ts-node scripts/migratePlanNames.ts
```

### Issue: New users get 'FREE' plan instead of 'STARTER'
**Cause**: Backend not restarted after code changes

**Fix**:
```bash
cd backend
npm run dev
```

## Expected Behavior After Fix

### User Registration Flow
1. User signs up → Clerk webhook triggers
2. Backend creates user with `plan: 'STARTER'`
3. User can immediately access dashboard (no payment required)
4. User sees STARTER plan limits

### Admin Assigns GROWTH Flow
1. Admin selects user → Edit → Change plan to GROWTH → Save
2. Backend updates: `{ plan: 'GROWTH', planExpiresAt: null }`
3. User immediately has GROWTH access (no expiry)
4. User can create unlimited AI campaigns

### Payment Upgrade Flow
1. User purchases plan → Payment succeeds
2. Backend updates: `{ plan: 'GROWTH', planExpiresAt: Date (30 or 365 days) }`
3. User has GROWTH access until expiry date
4. After expiry, plan remains GROWTH but `isSubscriptionActive()` returns false

## Admin Panel Features

### Current Implementation ✅
- View platform statistics
- List all users with pagination
- Search users by name/email
- Filter users by plan (STARTER/GROWTH)
- Edit user plan
- Delete user account
- Manual plan assignment with lifetime access

### NOT Implemented ❌
- Manual subscription expiry date picker
- Bulk user operations
- Export user data
- Email notifications
- Payment refunds
- Subscription pause/resume

## Next Steps (Optional Improvements)

1. **Add expiry date picker in admin UI**
   - Allow admin to set custom `planExpiresAt` date
   - Options: 7 days, 30 days, 90 days, 365 days, lifetime

2. **Add subscription status indicator**
   - Show badge: "Active", "Expired", "Lifetime"
   - Color code based on status

3. **Add usage reset button**
   - Allow admin to manually reset user's monthly usage

4. **Add payment history in admin user details**
   - Show all payments for selected user
   - Include amount, date, status

5. **Add email notifications**
   - Notify user when admin changes their plan
   - Send expiry reminders

## API Endpoints Reference

### Admin Endpoints
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List users (paginated)
- `GET /api/admin/users/:id` - Get user details
- `PATCH /api/admin/users/:id` - Update user plan
- `DELETE /api/admin/users/:id` - Delete user

### User Endpoints  
- `GET /api/agent/usage` - Get usage limits
- `GET /api/chat/usage` - Get chat limits
- `POST /api/payments/create-order` - Create payment
- `POST /api/payments/verify` - Verify payment

## Security Notes

- ✅ Admin endpoints protected by `requireAdmin` middleware
- ✅ Only users with `isAdmin: true` can access `/api/admin/*`
- ✅ Plan changes logged in database (updatedAt timestamp)
- ✅ Payment webhooks verify Razorpay signature
- ⚠️ Consider adding audit log for admin actions

## Support Information

If users report subscription issues:
1. Check their plan: `SELECT plan, planExpiresAt FROM "User" WHERE email = 'user@example.com'`
2. Verify expiry: If `planExpiresAt` is null → lifetime access, else check if > now
3. Fix manually:
   ```sql
   UPDATE "User" 
   SET plan = 'GROWTH', planExpiresAt = NULL 
   WHERE email = 'user@example.com';
   ```
4. Ask user to log out and log back in (refresh JWT token)
