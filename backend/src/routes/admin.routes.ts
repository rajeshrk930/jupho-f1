import { Router } from 'express';
import { clerkAuth } from '../middleware/clerkAuth';
import { requireAdmin } from '../middleware/admin';
import { prisma } from '../lib/prisma';

const router = Router();

// Apply authentication and admin middleware to all routes
router.use(...clerkAuth);
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
      basicUsers,
      growthUsers,
      totalConversations,
      totalAgentTasks,
      revenueData
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { plan: 'FREE' } }),
      prisma.user.count({ where: { plan: 'BASIC' } }),
      prisma.user.count({ where: { plan: 'GROWTH' } }),
      prisma.conversation.count(),
      prisma.agentTask.count(),
      prisma.user.aggregate({
        where: { plan: { in: ['BASIC', 'GROWTH'] } },
        _sum: { apiUsageCount: true }
      })
    ]);

    // Calculate estimated monthly recurring revenue
    // BASIC: ₹1,499/month, GROWTH: ₹1,999/month
    const estimatedRevenue = (basicUsers * 1499) + (growthUsers * 1999);

    res.json({
      users: {
        total: totalUsers,
        free: freeUsers,
        basic: basicUsers,
        growth: growthUsers
      },
      analytics: {
        totalAgentTasks,
        totalConversations,
        avgTasksPerUser: totalUsers > 0 ? (totalAgentTasks / totalUsers).toFixed(2) : 0
      },
      revenue: {
        estimated: estimatedRevenue,
        paidSubscriptions: basicUsers + growthUsers
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
    
    if (plan && (plan === 'FREE' || plan === 'BASIC' || plan === 'GROWTH')) {
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
          planExpiresAt: true,
          createdAt: true,
          _count: {
            select: {
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
    if (plan && !['FREE', 'BASIC', 'GROWTH'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan type. Must be FREE, BASIC, or GROWTH' });
    }

    // Validate subscription status
    if (subscriptionStatus && !['active', 'cancelled', 'expired'].includes(subscriptionStatus)) {
      return res.status(400).json({ message: 'Invalid subscription status' });
    }

    // Build update object
    const updateData: any = {};
    if (plan) {
      updateData.plan = plan;
      // Admin-assigned paid plans get lifetime access (null expiry)
      // FREE plan doesn't need expiry
      if (plan === 'BASIC' || plan === 'GROWTH') {
        updateData.planExpiresAt = null; // Lifetime access for admin-assigned plans
      } else if (plan === 'FREE') {
        updateData.planExpiresAt = null; // FREE plan has no expiry
      }
    }
    if (usageLimit !== undefined) {
      // Reset usage count when updating plan
      updateData.apiUsageCount = 0;
      updateData.agentTasksCreated = 0;
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
        planExpiresAt: true
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

/**
 * GET /api/admin/payments
 * Get all payment transactions with filters
 */
router.get('/payments', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      status = '',
      userId = '',
      startDate = '',
      endDate = ''
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (status && ['PENDING', 'COMPLETED', 'FAILED'].includes(status as string)) {
      where.status = status;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    // Get payments and total count
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              plan: true
            }
          }
        }
      }),
      prisma.payment.count({ where })
    ]);

    res.json({
      payments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Admin payments list error:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

/**
 * GET /api/admin/revenue-stats
 * Get revenue analytics (MRR, ARR, growth trends)
 */
router.get('/revenue-stats', async (req, res) => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last6Months = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    
    // Get current active subscriptions
    const [starterUsers, growthUsers, totalPayments, recentPayments] = await Promise.all([
      prisma.user.count({
        where: {
          plan: 'STARTER',
          planExpiresAt: { gte: now }
        }
      }),
      prisma.user.count({
        where: {
          plan: 'GROWTH',
          planExpiresAt: { gte: now }
        }
      }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true
      }),
      prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: last6Months }
        },
        select: {
          amount: true,
          createdAt: true,
          plan: true
        },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = (starterUsers * 999) + (growthUsers * 1999);
    
    // Calculate ARR (Annual Recurring Revenue)
    const arr = mrr * 12;
    
    // Calculate revenue by month for last 6 months
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);
      
      const monthPayments = recentPayments.filter(p => 
        p.createdAt >= monthStart && p.createdAt <= monthEnd
      );
      
      const revenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      
      return {
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: revenue / 100, // Convert paise to rupees
        count: monthPayments.length
      };
    });

    // Calculate churn rate (simplified - users who didn't renew last month)
    const expiredLastMonth = await prisma.user.count({
      where: {
        planExpiresAt: {
          gte: lastMonth,
          lt: now
        },
        plan: 'STARTER' // Assuming churned users go back to STARTER
      }
    });

    const totalRevenue = totalPayments._sum.amount || 0;
    const totalTransactions = totalPayments._count;

    res.json({
      mrr,
      arr,
      totalRevenue: totalRevenue / 100, // Convert to rupees
      totalTransactions,
      activeSubscriptions: {
        starter: starterUsers,
        growth: growthUsers,
        total: starterUsers + growthUsers
      },
      monthlyRevenue,
      churnRate: expiredLastMonth > 0 ? ((expiredLastMonth / (starterUsers + growthUsers)) * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('Admin revenue stats error:', error);
    res.status(500).json({ message: 'Failed to fetch revenue statistics' });
  }
});

/**
 * POST /api/admin/payments/:id/refund
 * Process a refund for a payment
 */
router.post('/payments/:id/refund', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Can only refund completed payments' });
    }

    // TODO: Integrate with Razorpay refund API
    // const razorpayRefund = await razorpay.payments.refund(payment.razorpayPaymentId, {
    //   amount: payment.amount,
    //   notes: { reason, admin_refund: true }
    // });

    // Update payment status
    await prisma.payment.update({
      where: { id },
      data: {
        status: 'REFUNDED'
      }
    });

    // Downgrade user plan if still active
    if (payment.user.planExpiresAt && payment.user.planExpiresAt > new Date()) {
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          plan: 'STARTER',
          planExpiresAt: null
        }
      });
    }

    res.json({ 
      message: 'Refund processed successfully',
      // razorpayRefundId: razorpayRefund.id
    });
  } catch (error) {
    console.error('Admin refund error:', error);
    res.status(500).json({ message: 'Failed to process refund' });
  }
});

/**
 * PATCH /api/admin/payments/:userId/subscription
 * Manually extend or cancel a user's subscription
 */
router.patch('/payments/:userId/subscription', async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, plan, months } = req.body;

    if (!['extend', 'cancel', 'change_plan'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let updateData: any = {};

    if (action === 'extend' && months) {
      const currentExpiry = user.planExpiresAt || new Date();
      const newExpiry = new Date(currentExpiry);
      newExpiry.setMonth(newExpiry.getMonth() + parseInt(months));
      updateData.planExpiresAt = newExpiry;
    }

    if (action === 'cancel') {
      updateData.plan = 'STARTER';
      updateData.planExpiresAt = null;
    }

    if (action === 'change_plan' && plan && ['STARTER', 'GROWTH'].includes(plan)) {
      updateData.plan = plan;
      if (plan === 'STARTER') {
        updateData.planExpiresAt = null;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        planExpiresAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Admin subscription update error:', error);
    res.status(500).json({ message: 'Failed to update subscription' });
  }
});

/**
 * GET /api/admin/templates
 * Get all templates (system + user templates) with filters
 */
router.get('/templates', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '50',
      category = '',
      isPublic = '',
      userId = '',
      search = ''
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (isPublic !== '') {
      where.isPublic = isPublic === 'true';
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (search) {
      where.AND = {
        OR: [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ]
      };
    }

    // Get templates and total count
    const [templates, total] = await Promise.all([
      prisma.adTemplate.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      }),
      prisma.adTemplate.count({ where })
    ]);

    res.json({
      templates,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Admin templates list error:', error);
    res.status(500).json({ message: 'Failed to fetch templates' });
  }
});

/**
 * GET /api/admin/templates/stats
 * Get template usage statistics
 */
router.get('/templates/stats', async (req, res) => {
  try {
    const [
      totalTemplates,
      systemTemplates,
      userTemplates,
      topTemplates
    ] = await Promise.all([
      prisma.adTemplate.count(),
      prisma.adTemplate.count({ where: { isPublic: true } }),
      prisma.adTemplate.count({ where: { isPublic: false } }),
      prisma.adTemplate.findMany({
        take: 10,
        orderBy: { usageCount: 'desc' },
        select: {
          id: true,
          name: true,
          category: true,
          usageCount: true,
          isPublic: true
        }
      })
    ]);

    res.json({
      totalTemplates,
      systemTemplates,
      userTemplates,
      topTemplates
    });
  } catch (error) {
    console.error('Admin template stats error:', error);
    res.status(500).json({ message: 'Failed to fetch template statistics' });
  }
});

/**
 * PATCH /api/admin/templates/:id
 * Update template details (mark as public/featured, edit content)
 */
router.patch('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate allowed updates
    const allowedFields = ['name', 'description', 'category', 'isPublic', 'targeting', 'budget', 'adCopy'];
    const updates: any = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    const updatedTemplate = await prisma.adTemplate.update({
      where: { id },
      data: updates
    });

    res.json(updatedTemplate);
  } catch (error: any) {
    console.error('Admin template update error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.status(500).json({ message: 'Failed to update template' });
  }
});

/**
 * DELETE /api/admin/templates/:id
 * Delete a template (admin override)
 */
router.delete('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.adTemplate.delete({
      where: { id }
    });

    res.json({ message: 'Template deleted successfully' });
  } catch (error: any) {
    console.error('Admin template delete error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.status(500).json({ message: 'Failed to delete template' });
  }
});

/**
 * POST /api/admin/templates/bulk-delete
 * Delete multiple templates
 */
router.post('/templates/bulk-delete', async (req, res) => {
  try {
    const { templateIds } = req.body;

    if (!Array.isArray(templateIds) || templateIds.length === 0) {
      return res.status(400).json({ message: 'Template IDs array required' });
    }

    const result = await prisma.adTemplate.deleteMany({
      where: {
        id: { in: templateIds }
      }
    });

    res.json({ 
      message: `${result.count} templates deleted successfully`,
      count: result.count
    });
  } catch (error) {
    console.error('Admin bulk delete templates error:', error);
    res.status(500).json({ message: 'Failed to delete templates' });
  }
});

/**
 * PATCH /api/admin/templates/bulk-update
 * Update multiple templates (e.g., change category, make public)
 */
router.patch('/templates/bulk-update', async (req, res) => {
  try {
    const { templateIds, updates } = req.body;

    if (!Array.isArray(templateIds) || templateIds.length === 0) {
      return res.status(400).json({ message: 'Template IDs array required' });
    }

    const allowedFields = ['category', 'isPublic'];
    const updateData: any = {};
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid updates provided' });
    }

    const result = await prisma.adTemplate.updateMany({
      where: {
        id: { in: templateIds }
      },
      data: updateData
    });

    res.json({ 
      message: `${result.count} templates updated successfully`,
      count: result.count
    });
  } catch (error) {
    console.error('Admin bulk update templates error:', error);
    res.status(500).json({ message: 'Failed to update templates' });
  }
});

/**
 * GET /api/admin/campaigns
 * Get all campaigns across all users with filters
 */
router.get('/campaigns', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '50',
      status = '',
      userId = '',
      startDate = '',
      endDate = ''
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    // Get campaigns and total count
    const [campaigns, total] = await Promise.all([
      prisma.agentTask.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          status: true,
          createdVia: true,
          fbCampaignId: true,
          fbAdSetId: true,
          fbAdId: true,
          actualCPM: true,
          actualCTR: true,
          actualConversions: true,
          actualSpend: true,
          impressions: true,
          clicks: true,
          performanceGrade: true,
          lastPerformanceSync: true,
          createdAt: true,
          completedAt: true,
          userId: true
        }
      }),
      prisma.agentTask.count({ where })
    ]);

    res.json({
      campaigns,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Admin campaigns list error:', error);
    res.status(500).json({ message: 'Failed to fetch campaigns' });
  }
});

/**
 * GET /api/admin/campaigns/stats
 * Get platform-wide campaign performance metrics
 */
router.get('/campaigns/stats', async (req, res) => {
  try {
    const [
      totalCampaigns,
      activeCampaigns,
      completedCampaigns,
      failedCampaignsCount,
      performanceData
    ] = await Promise.all([
      prisma.agentTask.count(),
      prisma.agentTask.count({ where: { status: { in: ['PENDING', 'GATHERING_INFO', 'GENERATING', 'CREATING'] } } }),
      prisma.agentTask.count({ where: { status: 'COMPLETED' } }),
      prisma.agentTask.count({ where: { status: 'FAILED' } }),
      prisma.agentTask.aggregate({
        where: {
          status: 'COMPLETED',
          actualSpend: { not: null }
        },
        _sum: {
          actualSpend: true,
          impressions: true,
          clicks: true,
          actualConversions: true
        },
        _avg: {
          actualCPM: true,
          actualCTR: true
        }
      })
    ]);

    // Get campaigns with performance grades
    const gradeDistribution = await prisma.agentTask.groupBy({
      by: ['performanceGrade'],
      where: {
        performanceGrade: { not: null }
      },
      _count: true
    });

    // Get failing campaigns (POOR performance or FAILED status)
    const failingCampaignsList = await prisma.agentTask.findMany({
      where: {
        OR: [
          { performanceGrade: 'POOR' },
          { status: 'FAILED' }
        ]
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        performanceGrade: true,
        fbCampaignId: true,
        actualCPM: true,
        actualCTR: true,
        createdAt: true,
        userId: true
      }
    });

    res.json({
      totalCampaigns,
      activeCampaigns,
      completedCampaigns,
      failedCampaigns: failingCampaignsList.length,
      platformMetrics: {
        totalSpend: performanceData._sum.actualSpend || 0,
        totalImpressions: performanceData._sum.impressions || 0,
        totalClicks: performanceData._sum.clicks || 0,
        totalConversions: performanceData._sum.actualConversions || 0,
        avgCPM: performanceData._avg.actualCPM || 0,
        avgCTR: performanceData._avg.actualCTR || 0
      },
      gradeDistribution,
      failingCampaigns: failingCampaignsList
    });
  } catch (error) {
    console.error('Admin campaign stats error:', error);
    res.status(500).json({ message: 'Failed to fetch campaign statistics' });
  }
});

/**
 * GET /api/admin/integrations/facebook
 * Get all Facebook account connections with health status
 */
router.get('/integrations/facebook', async (req, res) => {
  try {
    const connections = await prisma.facebookAccount.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            plan: true
          }
        }
      }
    });

    // Calculate health metrics for each connection
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const connectionsWithHealth = connections.map(conn => {
      const daysUntilExpiry = Math.floor((conn.tokenExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...conn,
        healthStatus: !conn.isActive 
          ? 'disconnected' 
          : conn.tokenExpiresAt < now 
            ? 'expired' 
            : conn.tokenExpiresAt < sevenDaysFromNow 
              ? 'expiring_soon' 
              : 'healthy',
        daysUntilExpiry
      };
    });

    // Aggregate stats
    const stats = {
      total: connections.length,
      healthy: connectionsWithHealth.filter(c => c.healthStatus === 'healthy').length,
      expiringSoon: connectionsWithHealth.filter(c => c.healthStatus === 'expiring_soon').length,
      expired: connectionsWithHealth.filter(c => c.healthStatus === 'expired').length,
      disconnected: connectionsWithHealth.filter(c => c.healthStatus === 'disconnected').length
    };

    res.json({
      connections: connectionsWithHealth,
      stats
    });
  } catch (error) {
    console.error('Admin Facebook integrations error:', error);
    res.status(500).json({ message: 'Failed to fetch Facebook connections' });
  }
});

export default router;
