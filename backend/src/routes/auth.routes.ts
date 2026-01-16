import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { clerkAuth } from '../middleware/clerkAuth';
import { AuthRequest } from '../middleware/auth';
import { getCsrfToken } from '../middleware/csrf';

const router = Router();

// NOTE: Password-based auth (register/login) removed - using Clerk OAuth
// All authentication now handled by Clerk at /sign-in and /sign-up

// Get current user
router.get('/me', ...clerkAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent caching so clients always get a fresh 200 with the user payload
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Failed to get user' });
  }
});

// Update profile
router.patch(
  '/profile',
  ...clerkAuth,
  [
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name } = req.body;
      const userId = req.user!.id;

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name !== undefined && { name }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          createdAt: true
        }
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  }
);

// Export user data
router.get('/export', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Fetch all user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
        conversations: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            messages: {
              select: {
                role: true,
                content: true,
                createdAt: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Format data for export
    const exportData = {
      account: {
        email: user.email,
        name: user.name,
        plan: user.plan,
        memberSince: user.createdAt
      },
      conversations: user.conversations,
      exportedAt: new Date().toISOString()
    };

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=jupho-data-export-${Date.now()}.json`);
    res.json(exportData);
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ success: false, message: 'Failed to export data' });
  }
});

// Delete account
router.delete('/account', ...clerkAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Delete user (cascade deletes related data via Prisma schema)
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
});

// Get CSRF token
router.get('/csrf-token', ...clerkAuth, getCsrfToken);

export { router as authRoutes };
