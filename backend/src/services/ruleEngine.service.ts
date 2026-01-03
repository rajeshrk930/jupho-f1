export interface AnalysisInput {
  creativeType: 'IMAGE' | 'VIDEO';
  primaryText?: string;
  headline?: string;
  objective: string;
  industry?: string;
  cpm?: number;
  ctr?: number;
  cpc?: number;
  cpa?: number;
}

export interface AnalysisResult {
  primaryReason: string;
  supportingLogic: string[];
  singleFix: string;
  resultType: 'DEAD' | 'AVERAGE' | 'WINNING';
  failureReason: string;
}

/**
 * Simple rule-based engine for v1.
 * Interprets CTR as percent (e.g. 0.8 means 0.8%).
 */
export async function evaluateRule(input: AnalysisInput): Promise<AnalysisResult> {
  // Prefer metrics first
  const ctr = typeof input.ctr === 'number' ? input.ctr : undefined;

  if (typeof ctr === 'number' && !isNaN(ctr)) {
    if (ctr < 0.8) {
      return {
        primaryReason: 'Weak opening hook',
        supportingLogic: [
          'The creative does not grab attention in the first 2 seconds',
          'Branding appears before the problem is clearly shown'
        ],
        singleFix: 'Start the creative with a strong pain point or outcome in the first frame.',
        resultType: 'DEAD',
        failureReason: 'weak_hook'
      };
    }

    // CTR present but above threshold — do not praise, provide constructive guidance
    return {
      primaryReason: 'No clear performance issue detected yet',
      supportingLogic: [
        'CTR meets the basic threshold provided',
        'Further validation is needed at scale to confirm sustained performance'
      ],
      singleFix: 'Run controlled A/B tests focusing on different opening hooks and scale spend gradually to validate results.',
      resultType: 'AVERAGE',
      failureReason: 'inconclusive'
    };
  }

  // No CTR — fallbacks based on copy and creative presence
  const hasPrimaryCopy = !!(input.primaryText && input.primaryText.trim());
  const hasHeadline = !!(input.headline && input.headline.trim());

  if (hasPrimaryCopy || hasHeadline) {
    return {
      primaryReason: 'Weak message clarity',
      supportingLogic: [
        'Primary text or headline does not state a clear benefit or outcome',
        'Copy does not immediately communicate the user benefit in the first line'
      ],
      singleFix: 'Clarify the core benefit in the first line of your primary text or headline; state one clear outcome or pain point.',
      resultType: 'DEAD',
      failureReason: 'unclear_message'
    };
  }

  // If creative exists (file presence is checked by route), assume weak hook
  return {
    primaryReason: 'Missing creative signals',
    supportingLogic: [
      'No creative or copy provided to evaluate the opening hook',
      'Metrics are not available to validate performance'
    ],
    singleFix: 'Upload at least one creative or add primary text with a clear first-line benefit; meanwhile, try a strong, benefit-led first line.',
    resultType: 'AVERAGE',
    failureReason: 'missing_signals'
  };
}

export default { evaluateRule };
