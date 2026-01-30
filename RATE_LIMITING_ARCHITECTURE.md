# Per-User Rate Limiting Architecture

## Overview
Jupho has implemented **per-user rate limiting** with **subscription tier awareness** to ensure fair usage across all customers in the SaaS platform.

## Problem with IP-Based Rate Limiting
Previously, rate limits were tracked per IP address, which caused issues:
- **Office Networks**: 10 employees sharing 1 office IP = shared 100 request limit
- **Mobile Networks**: Thousands of users behind carrier-grade NAT = same IP
- **VPNs/Proxies**: Multiple users behind same VPN endpoint = bottleneck
- **No Monetization**: All users had same limits regardless of subscription

## Solution: Per-User + Subscription Tiers

### Rate Limit Configuration

#### General API Endpoints (`/api/*`)
| Tier | Limit | Window | Use Case |
|------|-------|--------|----------|
| **ENTERPRISE** | 50,000 requests | 15 minutes | High-volume customers |
| **PAID/GROWTH/PROFESSIONAL** | 5,000 requests | 15 minutes | Premium customers |
| **FREE/STARTER** | 500 requests | 15 minutes | Free tier users |
| **Anonymous** (unauthenticated) | 100 requests | 15 minutes | Public endpoints |

#### AI/Agent Endpoints (`/api/agent/*`)
| Tier | Limit | Window | Reason |
|------|-------|--------|--------|
| **ENTERPRISE** | 100 requests | 1 minute | Cost-sensitive (OpenAI API) |
| **PAID/GROWTH/PROFESSIONAL** | 30 requests | 1 minute | Premium AI access |
| **FREE/STARTER** | 10 requests | 1 minute | Limited AI usage |
| **Anonymous** | 5 requests | 1 minute | Minimal unauthenticated AI |

#### Auth Endpoints (`/api/auth/*`)
| Limit | Window | Tracking | Reason |
|-------|--------|----------|--------|
| 5 attempts | 15 minutes | **IP-based** | Brute-force protection |

> **Note**: Auth endpoints intentionally use IP-based limiting to prevent distributed brute-force attacks across multiple accounts.

## Implementation Details

### Backend Changes

**File: `backend/src/index.ts`**
```typescript
// Helper function to determine user's subscription plan
const getUserPlan = (req: any): string => {
  if (req.user?.plan) {
    return req.user.plan; // Authenticated user's plan
  }
  return 'ANONYMOUS'; // Unauthenticated requests
};

// Per-user rate limiter with subscription tiers
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: async (req) => {
    const plan = getUserPlan(req);
    if (plan === 'ENTERPRISE') return 50000;
    if (plan === 'PAID' || plan === 'GROWTH' || plan === 'PROFESSIONAL') return 5000;
    if (plan === 'FREE' || plan === 'STARTER') return 500;
    return 100; // Anonymous
  },
  keyGenerator: (req) => {
    // Use user.id for authenticated, IP for anonymous
    return (req as AuthRequest).user?.id || req.ip || 'unknown';
  },
  message: 'You\'ve reached your API limit. Please upgrade your plan for higher limits.',
});
```

**File: `backend/src/middleware/auth.ts`**
```typescript
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    clerkId: string;
    plan: string; // ✅ Added for rate limiting
  };
}

// Include plan in database query
const user = await prisma.user.findUnique({
  where: { id: decoded.userId },
  select: { id: true, email: true, clerkId: true, plan: true }
});

req.user = {
  id: user.id,
  email: user.email,
  clerkId: user.clerkId,
  plan: user.plan // ✅ Attach to request
};
```

## Benefits

### ✅ Fair Usage
- Each user gets independent rate limits
- Multiple users in same office don't interfere with each other
- Mobile users don't share limits with thousands of others

### ✅ Monetization
- Higher limits incentivize plan upgrades
- Clear value proposition for PAID and ENTERPRISE tiers
- Free tier users see upgrade prompts when hitting limits

### ✅ Scalability
- No bottlenecks from shared IPs
- Handles offices, mobile networks, VPNs correctly
- Enterprise customers get essentially unlimited access

### ✅ Security
- Auth endpoints still use IP-based limits (brute-force protection)
- Anonymous users have lowest limits (abuse prevention)
- Rate limit headers show remaining quota

## Error Messages

### User-Friendly Messages
- ❌ Before: `"Too many requests from this IP"`
- ✅ After: `"You've reached your API limit. Please upgrade your plan for higher limits."`

### AI Endpoint Messages
- ❌ Before: `"Too many AI requests, please slow down."`
- ✅ After: `"You've reached your AI request limit. Upgrade to PAID or ENTERPRISE for more capacity."`

## Testing Scenarios

### Scenario 1: Office Network (Same IP, Different Users)
```
User A (FREE) makes 500 requests ✅ Success
User A's 501st request ❌ Rate limited

User B (PAID) on same IP makes request ✅ Success
(User B has independent 5000 request limit)
```

### Scenario 2: Mobile Network (Carrier NAT)
```
1000 users behind same carrier IP
Each user gets independent limits based on their plan
No interference between users
```

### Scenario 3: Plan Upgrade
```
User starts on FREE (500 req/15min)
User upgrades to PAID
Next request uses PAID limits (5000 req/15min)
```

## Migration Notes

### Backward Compatibility
- ✅ Unauthenticated requests still work (IP fallback)
- ✅ Existing authenticated users automatically get per-user limits
- ✅ No database migrations required (plan field already exists)

### Deployment
- Zero downtime deployment
- Rate limit counters reset automatically (15-minute window)
- No action required from users

## Monitoring

### Rate Limit Headers
Express-rate-limit sends standard headers:
```
RateLimit-Limit: 5000        (user's max limit)
RateLimit-Remaining: 4950    (requests left)
RateLimit-Reset: 1738281600  (unix timestamp when limit resets)
```

### Sentry Integration
- Rate limit errors tracked per user
- Can identify users hitting limits frequently
- Helps identify upgrade opportunities

## Future Enhancements

### Potential Improvements
1. **Redis-Based Rate Limiting**: For multi-server deployments
2. **Custom Limits**: Allow admin to set per-user overrides
3. **Burst Allowance**: Allow brief spikes above limit
4. **Usage Dashboard**: Show users their API usage in real-time
5. **Webhook Notifications**: Alert users at 80% of limit

## Troubleshooting

### User Hitting Limits
1. Check user's plan: `SELECT plan FROM "User" WHERE id = ?`
2. Verify rate limit headers in response
3. Check if user needs plan upgrade
4. For enterprise customers, increase limit in code

### Rate Limit Not Working
1. Verify `req.user.plan` is populated (check auth middleware)
2. Check `trust proxy` setting (Railway/Vercel require `app.set('trust proxy', 1)`)
3. Verify user is authenticated (unauthenticated = IP-based fallback)

## References
- express-rate-limit: https://github.com/express-rate-limit/express-rate-limit
- Prisma User model: `backend/prisma/schema.prisma`
- Auth middleware: `backend/src/middleware/auth.ts`
- Rate limit config: `backend/src/index.ts`
