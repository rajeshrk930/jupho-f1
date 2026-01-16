# Clerk Migration - Quick Reference

## For Frontend Developers

### Old Auth Pattern (Removed)
```tsx
// ❌ OLD - Don't use these anymore
import { useAuthStore } from '@/lib/store';

const { user, login, logout } = useAuthStore();
const isAuthenticated = !!user;
```

### New Clerk Pattern
```tsx
// ✅ NEW - Use Clerk hooks
import { useUser, useAuth } from '@clerk/nextjs';

const { user, isLoaded, isSignedIn } = useUser();
const { signOut } = useAuth();

// Get user info
console.log(user?.emailAddresses[0].emailAddress);
console.log(user?.firstName, user?.lastName);
console.log(user?.imageUrl); // Profile photo

// Logout
await signOut();
```

### Protecting Components

```tsx
// ✅ Client-side protection
import { useAuth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default function ProtectedPage() {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (isLoaded && !isSignedIn) {
    redirect('/sign-in');
  }
  
  return <div>Protected Content</div>;
}
```

```tsx
// ✅ Server-side protection
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function ProtectedServerPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  return <div>Protected Content</div>;
}
```

### Getting Current User Data

```tsx
// ✅ Client Component
'use client';
import { useUser } from '@clerk/nextjs';

export default function ProfileDisplay() {
  const { user } = useUser();
  
  return (
    <div>
      <img src={user?.imageUrl} alt="Profile" />
      <p>{user?.fullName}</p>
      <p>{user?.emailAddresses[0].emailAddress}</p>
    </div>
  );
}
```

```tsx
// ✅ Server Component
import { currentUser } from '@clerk/nextjs';

export default async function ProfilePage() {
  const user = await currentUser();
  
  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <p>{user?.emailAddresses[0].emailAddress}</p>
    </div>
  );
}
```

### API Calls (No Changes Needed!)

The API client automatically adds Clerk tokens:

```tsx
// ✅ Works automatically
import { api } from '@/lib/api';

const response = await api.get('/agent/tasks');
// Clerk token is automatically attached to Authorization header
```

### Navigation Changes

```tsx
// ❌ OLD
<Link href="/login">Login</Link>
<Link href="/signup">Sign Up</Link>

// ✅ NEW
<Link href="/sign-in">Sign In</Link>
<Link href="/sign-up">Sign Up</Link>
```

### User Button in Header

```tsx
// Add to header/navigation
import { UserButton } from '@clerk/nextjs';

<UserButton 
  afterSignOutUrl="/"
  appearance={{
    elements: {
      avatarBox: "w-10 h-10"
    }
  }}
/>
```

---

## For Backend Developers

### Route Protection

```typescript
// ❌ OLD
import { authenticate } from '../middleware/auth';
router.get('/tasks', authenticate, handler);

// ✅ NEW
import { clerkAuth } from '../middleware/clerkAuth';
router.get('/tasks', ...clerkAuth, handler);
```

### Accessing User in Routes

```typescript
// ✅ Same as before! req.user still works
router.get('/tasks', ...clerkAuth, async (req, res) => {
  const userId = req.user!.id;        // Internal DB user ID
  const email = req.user!.email;       // User email
  const clerkId = req.user!.clerkId;   // Clerk user ID
  
  // Use as normal
  const tasks = await prisma.agentTask.findMany({
    where: { userId }
  });
});
```

### User Model Changes

```prisma
model User {
  id       String @id @default(uuid())
  clerkId  String @unique  // ✅ NEW
  email    String @unique
  name     String?
  // password String  ❌ REMOVED
  
  // All relationships unchanged
  payments      Payment[]
  conversations Conversation[]
  // ...
}
```

### Webhook Handler (Already Implemented)

```typescript
// POST /api/webhooks/clerk
// Automatically syncs Clerk users to database
// Events handled:
// - user.created → Creates User in DB
// - user.updated → Updates User in DB  
// - user.deleted → Deletes User from DB
```

---

## Environment Variables

### Backend (.env)
```bash
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## Common Patterns

### Check if User is Admin

```tsx
// Frontend
import { useUser } from '@clerk/nextjs';

const { user } = useUser();
const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
const isAdmin = user && adminEmails.includes(user.emailAddresses[0].emailAddress);
```

### Conditional Rendering Based on Auth

```tsx
import { SignedIn, SignedOut } from '@clerk/nextjs';

<SignedIn>
  <Dashboard />
</SignedIn>

<SignedOut>
  <LandingPage />
</SignedOut>
```

### Get User Metadata

```tsx
// Store custom data in Clerk
const { user } = useUser();

// Public metadata (readable by anyone)
user?.publicMetadata.plan; // 'FREE' or 'PRO'

// Private metadata (only readable by user)
user?.privateMetadata.stripeCustomerId;

// Unsafe metadata (only readable/writable by backend)
user?.unsafeMetadata.internalNotes;
```

---

## Migration Checklist

- [x] Install Clerk packages
- [x] Update Prisma schema (add clerkId, remove password)
- [x] Create Clerk middleware
- [x] Replace authenticate with clerkAuth in routes
- [x] Wrap frontend with ClerkProvider
- [x] Update middleware.ts
- [x] Create sign-in/sign-up pages
- [x] Update API client for Clerk tokens
- [x] Add Clerk webhook endpoint
- [ ] Add Clerk API keys to .env
- [ ] Set up webhook in Clerk dashboard
- [ ] Run database migration
- [ ] Test signup/login flows
- [ ] Update header with UserButton
- [ ] Remove old auth pages (login/signup)
- [ ] Remove old auth store (if not used elsewhere)

---

## Files to Delete (After Testing)

These files are no longer needed:

```
frontend/src/app/auth/page.tsx  (if exists)
frontend/src/app/login/page.tsx (if exists)
frontend/src/app/signup/page.tsx (if exists)
```

Keep `frontend/src/lib/store.ts` if you use it for other state management (not auth).

---

## Testing Commands

```bash
# Backend
cd backend
npm run dev

# Frontend  
cd frontend
npm run dev

# Test URLs
http://localhost:3000/sign-in
http://localhost:3000/sign-up
http://localhost:3000/agent (should redirect if not logged in)
```

---

## Support

- Clerk Docs: https://clerk.com/docs
- Clerk Discord: https://clerk.com/discord
- Our Codebase: See [CLERK_SETUP_GUIDE.md](CLERK_SETUP_GUIDE.md) for full details
