import { prisma } from '../lib/prisma';

interface CreateBehaviorParams {
  analysisId: string;
  userId: string;
  problemType: 'CREATIVE' | 'FUNNEL' | 'SALES';
  metrics: {
    ctr: number;
    cpm: number;
    cpa: number;
    objective: string;
  };
  suggestedFix: string;
}

interface TrackActionParams {
  analysisId: string;
  action: 'clickedImplement' | 'openedAI' | 'downloadedPDF' | 'copiedText';
}

interface TrackFeedbackParams {
  analysisId: string;
  fixWorked: boolean;
}

interface TrackReturnParams {
  previousAnalysisId: string;
  newCTR: number;
}

export class BehaviorTrackingService {
  /**
   * Initialize tracking when analysis is created
   */
  static async createBehaviorRecord(params: CreateBehaviorParams) {
    try {
      return await prisma.analysisBehavior.create({
        data: {
          analysisId: params.analysisId,
          userId: params.userId,
          problemType: params.problemType,
          metrics: JSON.stringify(params.metrics),
          suggestedFix: params.suggestedFix,
        },
      });
    } catch (error) {
      console.error('Failed to create behavior record:', error);
      // Don't throw - tracking failure shouldn't break main flow
      return null;
    }
  }

  /**
   * Track user actions (opened AI, downloaded PDF, etc.)
   */
  static async trackAction(params: TrackActionParams) {
    try {
      return await prisma.analysisBehavior.update({
        where: { analysisId: params.analysisId },
        data: { [params.action]: true },
      });
    } catch (error) {
      console.error('Failed to track action:', error);
      return null;
    }
  }

  /**
   * Track user feedback (did fix work?)
   */
  static async trackFeedback(params: TrackFeedbackParams) {
    try {
      return await prisma.analysisBehavior.update({
        where: { analysisId: params.analysisId },
        data: { fixWorked: params.fixWorked },
      });
    } catch (error) {
      console.error('Failed to track feedback:', error);
      return null;
    }
  }

  /**
   * Track return visit with same creative
   */
  static async trackReturn(params: TrackReturnParams) {
    try {
      return await prisma.analysisBehavior.update({
        where: { analysisId: params.previousAnalysisId },
        data: {
          userReturnedWithSameAd: true,
          newCTR: params.newCTR,
        },
      });
    } catch (error) {
      console.error('Failed to track return:', error);
      return null;
    }
  }

  /**
   * Check if creative was analyzed before (for return detection)
   */
  static async findPreviousAnalysis(userId: string, creativeUrl: string) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return await prisma.analysis.findFirst({
        where: {
          userId,
          creativeUrl,
          createdAt: { lt: new Date(), gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true, ctr: true },
      });
    } catch (error) {
      console.error('Failed to find previous analysis:', error);
      return null;
    }
  }
}
