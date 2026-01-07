import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { BehaviorTrackingService } from '../services/behaviorTracking.service';

const router = Router();

// Track user action (opened AI, downloaded PDF, copied text)
router.post(
  '/action',
  authenticate,
  [
    body('analysisId').isString().notEmpty(),
    body('action').isIn(['clickedImplement', 'openedAI', 'downloadedPDF', 'copiedText']),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { analysisId, action } = req.body;

    await BehaviorTrackingService.trackAction({ analysisId, action });

    return res.json({ success: true });
  }
);

// Track user feedback (did fix work?)
router.post(
  '/feedback',
  authenticate,
  [
    body('analysisId').isString().notEmpty(),
    body('fixWorked').isBoolean(),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { analysisId, fixWorked } = req.body;

    await BehaviorTrackingService.trackFeedback({ analysisId, fixWorked });

    return res.json({ success: true });
  }
);

export default router;
