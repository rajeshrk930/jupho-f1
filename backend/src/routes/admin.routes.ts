import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { prisma } from '../lib/prisma';

const router = Router();

// Apply authentication and admin middleware to all routes
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/admin/stats
 * Get overall platform statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      freeUsers,
      proUsers,
      totalAnalyses,
      totalConversations,
      revenueData
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { plan: 'FREE' } }),
      prisma.user.count({ where: { plan: 'PRO' } }),
      prisma.analysis.count(),
      prisma.conversation.count(),
      prisma.user.aggregate({
        where: { plan: 'PRO' },
        _sum: { apiUsageCount: true }
      })
    ]);

    // Calculate estimated revenue (₹299 per PRO user)
    const estimatedRevenue = proUsers * 299;

    res.json({
      users: {
        total: totalUsers,
        free: freeUsers,
        pro: proUsers
      },
      analytics: {
        totalAnalyses,
        totalConversations,
        avgAnalysesPerUser: totalUsers > 0 ? (totalAnalyses / totalUsers).toFixed(2) : 0
      },
      revenue: {
        estimated: estimatedRevenue,
        proSubscriptions: proUsers
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

/**
 * GET /api/admin/users
 * Get paginated list of users with search and filters
 */
router.get('/users', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      plan = '',
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (plan && (plan === 'FREE' || plan === 'PRO')) {
      where.plan = plan;
    }

    // Get users and total count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: order as 'asc' | 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          apiUsageCount: true,
          proExpiresAt: true,
          createdAt: true,
          _count: {
            select: {
              analyses: true,
              conversations: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Admin users list error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

/**
 * GET /api/admin/users/:id
 * Get detailed information about a specific user
 */
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        analyses: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            createdAt: true,
            creativeType: true,
            resultType: true
          }
        },
        conversations: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            createdAt: true,
            _count: {
              select: { messages: true }
            }
          }
        },
        _count: {
          select: {
            analyses: true,
            conversations: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Admin user details error:', error);
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
});

/**
 * PATCH /api/admin/users/:id
 * Update user's plan and subscription status
 */
router.patch('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { plan, subscriptionStatus, usageLimit } = req.body;

    // Validate plan
    if (plan && !['FREE', 'PRO'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan type' });
    }

    // Validate subscription status
    if (subscriptionStatus && !['active', 'cancelled', 'expired'].includes(subscriptionStatus)) {
      return res.status(400).json({ message: 'Invalid subscription status' });
    }

    // Build update object
    const updateData: any = {};
    if (plan) updateData.plan = plan;
    if (usageLimit !== undefined) {
      // For FREE users, set to 3. For PRO, set to -1 (unlimited)
      updateData.apiUsageCount = 0; // Reset count when updating
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        apiUsageCount: true,
        proExpiresAt: true
      }
    });

    res.json(updatedUser);
  } catch (error: any) {
    console.error('Admin user update error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Failed to update user' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user account (admin override)
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Admin user delete error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

export default router;
