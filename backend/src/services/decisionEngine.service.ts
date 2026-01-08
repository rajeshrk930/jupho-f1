/**
 * V1 Decision Engine - Intent-First Logic (ENHANCED with Smart Overrides)
 * 
 * Flow:
 * 0. The Guardian - Override user lies with metric reality
 * 1. Trust intent first (problemFaced)
 * 2. Validate with metrics (confirm only)
 * 3. Use whatChanged to lock root cause
 * 4. CPM logic ONLY after audience type
 * 5. Objective filter (mandatory)
 * 6. FINAL classification (last step)
 */

interface DecisionInput {
  objective: 'LEADS' | 'WHATSAPP' | 'SALES';
  problemFaced: 'LOW_CLICKS' | 'CLICKS_NO_ACTION' | 'MESSAGES_NO_CONVERSION';
  whatChanged: 'CREATIVE_CHANGED' | 'AUDIENCE_CHANGED' | 'BUDGET_CHANGED' | 'NOTHING_NEW_AD';
  audienceType: 'BROAD' | 'INTEREST_BASED' | 'LOOKALIKE';
  ctr: number;
  cpm: number;
  cpa: number;
}

interface DecisionOutput {
  status: 'FIXABLE' | 'SCALE_READY' | 'BROKEN' | 'DEAD';
  primaryLayer: 'CREATIVE' | 'FUNNEL' | 'SALES' | 'DELIVERY' | 'AUDIENCE';
  rootCause: string;
  confirmed: boolean;
  audienceIssue: string | null;
  successMetric: string;
  thresholds: {
    targetCTR: number;
    targetCPM: number;
    targetCPA: number;
  };
  metrics: {
    ctrStatus: 'GOOD' | 'AVERAGE' | 'POOR';
    cpmStatus: 'GOOD' | 'AVERAGE' | 'HIGH';
    cpaStatus: 'GOOD' | 'AVERAGE' | 'HIGH';
  };
}

export class DecisionEngine {
  
  // Step 1: Trust intent first (problemFaced decides primary layer)
  private getPrimaryLayer(problemFaced: string): 'CREATIVE' | 'FUNNEL' | 'SALES' {
    switch (problemFaced) {
      case 'LOW_CLICKS': return 'CREATIVE';
      case 'CLICKS_NO_ACTION': return 'FUNNEL';
      case 'MESSAGES_NO_CONVERSION': return 'SALES';
      default: return 'CREATIVE';
    }
  }

  // Step 2: Get objective-specific thresholds
  private getThresholds(objective: string, audienceType: string) {
    const baseThresholds = {
      LEADS: {
        BROAD: { ctr: 1.0, cpm: 350, cpa: 80 },
        INTEREST_BASED: { ctr: 1.2, cpm: 300, cpa: 60 },
        LOOKALIKE: { ctr: 1.5, cpm: 250, cpa: 50 },
      },
      WHATSAPP: {
        BROAD: { ctr: 1.5, cpm: 300, cpa: 40 },
        INTEREST_BASED: { ctr: 1.8, cpm: 250, cpa: 30 },
        LOOKALIKE: { ctr: 2.0, cpm: 200, cpa: 25 },
      },
      SALES: {
        BROAD: { ctr: 0.8, cpm: 400, cpa: 150 },
        INTEREST_BASED: { ctr: 1.0, cpm: 350, cpa: 120 },
        LOOKALIKE: { ctr: 1.2, cpm: 300, cpa: 100 },
      },
    };

    return baseThresholds[objective as keyof typeof baseThresholds]?.[audienceType as keyof typeof baseThresholds.LEADS] 
      || baseThresholds.LEADS.BROAD;
  }

  // Step 3: Validate with metrics (confirm only, don't decide)
  private validateWithMetrics(
    primaryLayer: string,
    ctr: number,
    cpa: number,
    thresholds: { ctr: number; cpa: number }
  ): boolean {
    if (primaryLayer === 'CREATIVE') {
      return ctr < (thresholds.ctr * 0.7); // 30% below target
    }

    if (primaryLayer === 'FUNNEL') {
      return ctr >= thresholds.ctr && cpa > (thresholds.cpa * 1.5); // Good CTR but high CPA
    }

    if (primaryLayer === 'SALES') {
      // Would need conversion data; for now assume true
      return true;
    }

    return false;
  }

  // Step 4: Lock root cause (FIXED: Now checks isLiveAd)
  private getRootCause(whatChanged: string, primaryLayer: string, isLiveAd: boolean): string {
    switch (whatChanged) {
      case 'CREATIVE_CHANGED': return 'CREATIVE';
      case 'AUDIENCE_CHANGED': return 'AUDIENCE';
      case 'BUDGET_CHANGED': return 'DELIVERY';
      case 'NOTHING_NEW_AD':
        // FIX: If ad is LIVE (has data), ignore "Launch Phase" and treat as normal issue
        if (isLiveAd) {
          return primaryLayer; 
        }
        return primaryLayer === 'CREATIVE' ? 'LAUNCH_PHASE' : primaryLayer;
      default: return primaryLayer;
    }
  }

  // Step 5: CPM logic ONLY after audience type
  private getAudienceIssue(audienceType: string, cpm: number, thresholds: { cpm: number }): string | null {
    const highCPM = cpm > (thresholds.cpm * 1.3);

    if (!highCPM) return null;

    switch (audienceType) {
      case 'INTEREST_BASED':
        return 'OVER_TARGETING';
      case 'BROAD':
        return 'CREATIVE_OR_COMPETITION';
      case 'LOOKALIKE':
        return 'NORMAL_BEHAVIOR';
      default:
        return null;
    }
  }

  // Step 6: Get success metric based on objective
  private getSuccessMetric(objective: string): string {
    switch (objective) {
      case 'WHATSAPP':
        return 'MESSAGES';
      case 'LEADS':
        return 'FORMS';
      case 'SALES':
        return 'PURCHASES';
      default:
        return 'RESULTS';
    }
  }

  // Step 7: Classify metrics status
  private classifyMetrics(ctr: number, cpm: number, cpa: number, thresholds: any) {
    return {
      ctrStatus: 
        ctr >= thresholds.ctr * 1.2 ? 'GOOD' :
        ctr >= thresholds.ctr * 0.8 ? 'AVERAGE' : 'POOR',
      cpmStatus:
        cpm <= thresholds.cpm * 0.8 ? 'GOOD' :
        cpm <= thresholds.cpm * 1.2 ? 'AVERAGE' : 'HIGH',
      cpaStatus:
        cpa <= thresholds.cpa * 0.8 ? 'GOOD' :
        cpa <= thresholds.cpa * 1.2 ? 'AVERAGE' : 'HIGH',
    } as const;
  }

  // Step 8: FINAL classification (Updated for DEAD status)
  private getFinalStatus(
    confirmed: boolean,
    metrics: ReturnType<typeof this.classifyMetrics>,
    primaryLayer: string
  ): 'FIXABLE' | 'SCALE_READY' | 'BROKEN' | 'DEAD' {
    // SCALE_READY: All metrics good
    if (metrics.ctrStatus === 'GOOD' && metrics.cpmStatus === 'GOOD' && metrics.cpaStatus === 'GOOD') {
      return 'SCALE_READY';
    }

    // Safety Logic: If everything is bad, it's DEAD, not just Broken
    if (metrics.ctrStatus === 'POOR' && metrics.cpmStatus === 'HIGH' && metrics.cpaStatus === 'HIGH') {
      return 'DEAD';
    }

    // FIXABLE: Confirmed issue but addressable
    if (confirmed && (metrics.ctrStatus !== 'POOR' || metrics.cpaStatus !== 'HIGH')) {
      return 'FIXABLE';
    }

    // Default: If issue confirmed but not terrible, it's fixable
    return confirmed ? 'FIXABLE' : 'BROKEN';
  }

  // Main decision function (THIS IS WHERE THE MAGIC HAPPENS)
  public decide(input: DecisionInput): DecisionOutput {
    
    // =========================================================
    // STEP 0: THE GUARDIAN (Override User Lies)
    // =========================================================
    
    // 1. GHOST CHECK: Does this ad have real data?
    // If CTR or CPA > 0, it is LIVE. We ignore "New Ad" status later.
    const isLiveAd = input.ctr > 0 || input.cpa > 0;

    // 2. TRAFFIC OVERRIDE: 
    // If user says "Sales Issue" but CTR < 0.6%, FORCE Creative Issue.
    if (input.problemFaced === 'MESSAGES_NO_CONVERSION' && input.ctr < 0.6) {
       console.log("⚡ LOGIC OVERRIDE: Forcing Creative Focus due to low CTR");
       input.problemFaced = 'LOW_CLICKS';
    }

    // =========================================================
    // END GUARDIAN - Proceed with normal 8 Steps
    // =========================================================

    // Step 1: Trust intent (Now filtered by Guardian)
    const primaryLayer = this.getPrimaryLayer(input.problemFaced);

    // Step 2: Get thresholds
    const thresholds = this.getThresholds(input.objective, input.audienceType);

    // Step 3: Validate with metrics
    const confirmed = this.validateWithMetrics(primaryLayer, input.ctr, input.cpa, thresholds);

    // Step 4: Lock root cause (Passing isLiveAd to fix "Wait 48h" bug)
    const rootCause = this.getRootCause(input.whatChanged, primaryLayer, isLiveAd);

    // Step 5: CPM analysis
    const audienceIssue = this.getAudienceIssue(input.audienceType, input.cpm, thresholds);

    // Step 6: Success metric
    const successMetric = this.getSuccessMetric(input.objective);

    // Step 7: Classify metrics
    const metrics = this.classifyMetrics(input.ctr, input.cpm, input.cpa, thresholds);

    // Step 8: Final status
    const status = this.getFinalStatus(confirmed, metrics, primaryLayer);

    return {
      status,
      primaryLayer,
      rootCause,
      confirmed,
      audienceIssue,
      successMetric,
      thresholds: {
        targetCTR: thresholds.ctr,
        targetCPM: thresholds.cpm,
        targetCPA: thresholds.cpa,
      },
      metrics,
    };
  }
}
