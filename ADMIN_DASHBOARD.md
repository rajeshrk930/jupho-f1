# Admin Dashboard

Complete admin panel for managing users, viewing statistics, and monitoring platform health.

## Features

### 📊 Dashboard Overview
- **User Statistics**: Total users, FREE vs PRO breakdown
- **Analytics**: Total analyses, conversations, average usage per user
- **Revenue Tracking**: Estimated revenue (₹299/PRO user), subscription count
- Real-time data updates

### 👥 User Management
- **Search & Filter**: Search by name/email, filter by plan type
- **Pagination**: Handle large user lists efficiently (20 per page)
- **User Actions**:
  - Edit user plan (FREE ↔ PRO)
  - Update usage limits manually
  - Delete user accounts (with cascade delete)
- **Detailed View**: See user analyses, conversations, subscription status

## Setup

### Backend Configuration

1. **Add Admin Emails** to `backend/.env`:
```env
ADMIN_EMAILS=your-email@example.com,admin@company.com
```

Multiple emails can be comma-separated. Only these emails will have admin access.

2. **Environment Variables**:
```env
# Required
ADMIN_EMAILS=admin@example.com

# Existing (already configured)
DATABASE_URL=...
JWT_SECRET=...
OPENAI_API_KEY=...
```

### Frontend Configuration

1. **Add Admin Emails** to `frontend/.env.local`:
```env
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com,admin@company.com
```

Must match backend `ADMIN_EMAILS` for admin link to appear in sidebar.

2. **Complete Environment**:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
```

## Access

### For Admin Users

1. **Login** with your admin email (configured in ADMIN_EMAILS)
2. **Navigate** to Admin via sidebar link (appears only for admins)
3. **Dashboard** shows at `/admin`

### Security

- ✅ Backend validates admin access on every API call
- ✅ Middleware checks email against ADMIN_EMAILS list
- ✅ Returns 403 Forbidden for non-admin users
- ✅ Frontend hides admin link for non-admin users
- ✅ All routes protected with JWT authentication

## API Endpoints

### Stats
```typescript
GET /api/admin/stats
Response: {
  users: { total, free, pro },
  analytics: { totalAnalyses, totalConversations, avgAnalysesPerUser },
  revenue: { estimated, proSubscriptions }
}
```

### Users List
```typescript
GET /api/admin/users?page=1&limit=20&search=john&plan=PRO
Response: {
  users: [...],
  pagination: { page, limit, total, totalPages }
}
```

### User Details
```typescript
GET /api/admin/users/:id
Response: { user with analyses, conversations, counts }
```

### Update User
```typescript
PATCH /api/admin/users/:id
Body: { plan?: 'FREE'|'PRO', usageLimit?: number }
```

### Delete User
```typescript
DELETE /api/admin/users/:id
```

## Architecture

### Backend
- **Middleware**: `backend/src/middleware/admin.ts` - Validates admin access
- **Routes**: `backend/src/routes/admin.routes.ts` - All admin endpoints
- **Security**: Stacked middleware (authenticate → requireAdmin → route)

### Frontend
- **Page**: `frontend/src/app/admin/page.tsx` - Admin dashboard
- **API Client**: `frontend/src/lib/api.ts` - adminApi methods
- **Navigation**: `frontend/src/components/Sidebar.tsx` - Conditional admin link

## Usage Examples

### View Platform Stats
1. Open `/admin`
2. See real-time stats cards

### Search Users
1. Type in search box (searches name/email)
2. Results update automatically
3. Use plan filter for FREE/PRO

### Edit User Plan
1. Click "Edit" on user row
2. Change plan to PRO/FREE
3. Update usage limit if needed
4. Save changes

### Delete User
1. Click "Delete" on user row
2. Confirm deletion
3. All user data deleted (cascade)

## Monitoring

The admin dashboard provides insights into:
- **Growth**: Track total users over time
- **Engagement**: Average analyses per user
- **Revenue**: PRO subscriptions × ₹299
- **Activity**: Total analyses and conversations
- **User Behavior**: Individual usage patterns

## Production Notes

### Security Checklist
- [ ] Set strong ADMIN_EMAILS in production
- [ ] Use environment variables (never hardcode)
- [ ] Enable HTTPS for all admin requests
- [ ] Monitor admin access logs
- [ ] Regularly audit admin user list

### Performance
- Pagination handles 1000+ users efficiently
- Queries optimized with Prisma select/include
- Stats calculated in parallel (Promise.all)
- Frontend caches until manual refresh

### Maintenance
- Add/remove admins by updating ADMIN_EMAILS
- No database changes required
- Restart backend after env changes
- Clear frontend .env.local and rebuild

## Troubleshooting

### "Admin access required" error
- Check email is in ADMIN_EMAILS (exact match)
- Verify backend .env is loaded
- Restart backend after env changes
- Check JWT token is valid (re-login)

### Admin link not showing
- Verify NEXT_PUBLIC_ADMIN_EMAILS in frontend
- Ensure emails match backend exactly
- Rebuild frontend (Next.js)
- Clear browser cache

### Stats not loading
- Check backend is running
- Verify database connection
- Check browser console for errors
- Ensure admin authentication passed

## Future Enhancements

Potential features to add:
- [ ] Analytics graphs (Chart.js)
- [ ] Export user data to CSV
- [ ] Bulk user actions
- [ ] Admin activity logs
- [ ] Email notifications
- [ ] Custom user notes
- [ ] Revenue charts over time
- [ ] User engagement scoring

## Files Created

```
backend/
  src/
    middleware/
      admin.ts              # Admin authentication middleware
    routes/
      admin.routes.ts       # Admin API endpoints
  .env.example             # Updated with ADMIN_EMAILS

frontend/
  src/
    app/
      admin/
        page.tsx            # Admin dashboard page
    lib/
      api.ts                # Added adminApi methods
    components/
      Sidebar.tsx           # Added conditional admin link
  .env.example             # Updated with NEXT_PUBLIC_ADMIN_EMAILS
```

## Support

For issues or questions:
1. Check environment variables are set correctly
2. Verify admin email exactly matches ADMIN_EMAILS
3. Check backend logs for detailed error messages
4. Test with curl/Postman to isolate frontend/backend issues
