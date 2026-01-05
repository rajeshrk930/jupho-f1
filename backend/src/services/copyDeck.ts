type DecisionStatus = 'FIXABLE' | 'SCALE_READY' | 'BROKEN';

interface DecisionSummary {
  status: DecisionStatus;
  primaryLayer: 'CREATIVE' | 'FUNNEL' | 'SALES' | 'DELIVERY' | 'AUDIENCE';
  rootCause: string;
  metrics: {
    ctrStatus: 'GOOD' | 'AVERAGE' | 'POOR';
    cpmStatus: 'GOOD' | 'AVERAGE' | 'HIGH';
    cpaStatus: 'GOOD' | 'AVERAGE' | 'HIGH';
  };
  thresholds: {
    targetCTR: number;
    targetCPM: number;
    targetCPA: number;
  };
}

interface BuildCopyInput {
  decision: DecisionSummary;
  metrics: { ctr: number; cpm: number; cpa: number };
}

interface HumanizedCopy {
  headline: string;
  reason: string;
  actions: string[];
}

const ROOT_COPY: Record<string, { headline: string; baseReason: string; metricPreference: 'ctr' | 'cpm' | 'cpa'; actions: string[] }> = {
  LAUNCH_PHASE: {
    headline: 'Status: Launch phase',
    baseReason: 'Early delivery is still stabilizing',
    metricPreference: 'cpm',
    actions: [
      'Pause changes for 48–72 hours; avoid swapping the ad.',
      'Let delivery settle before judging cost.'
    ],
  },
  CREATIVE: {
    headline: 'Status: Creative issue',
    baseReason: 'People are not stopping to look',
    metricPreference: 'ctr',
    actions: [
      'Try a new opening visual or headline.',
      'Test a different preview image; keep the same offer/CTA.'
    ],
  },
  AUDIENCE: {
    headline: 'Status: Audience fatigue',
    baseReason: 'Reach is tightening and costs are rising',
    metricPreference: 'cpm',
    actions: [
      'Keep 1–2 audience groups; broaden interests or lookalike size.',
      'Pause overlapping audiences and check how often people see the ad.'
    ],
  },
  DELIVERY: {
    headline: 'Status: Costs rising after budget change',
    baseReason: 'Budget changes are inflating cost',
    metricPreference: 'cpm',
    actions: [
      'Undo big budget jumps; change budgets in 20–30% steps every 2–3 days.',
      'Keep the best audience group separate so it learns cleanly.'
    ],
  },
  FUNNEL: {
    headline: 'Status: Funnel friction',
    baseReason: 'Clicks are not turning into results',
    metricPreference: 'cpa',
    actions: [
      'Speed up the page/form and remove extra steps.',
      'Make the page headline and button match the ad promise.'
    ],
  },
  SALES: {
    headline: 'Status: Follow-up issue',
    baseReason: 'Leads are not converting after contact',
    metricPreference: 'cpa',
    actions: [
      'Reply faster and make pricing clear up front.',
      'Add a short proof line (testimonial/stat) before the first ask.'
    ],
  },
};

const SCALE_READY_COPY: HumanizedCopy = {
  headline: 'Status: Ready to increase budget',
  reason: '',
  actions: [
    'Increase budget 20–30% every 3 days; watch cost per result and cost per 1,000 views.',
    'Avoid swapping the ad during the ramp unless metrics slip.'
  ],
};

const fallbackCopy: HumanizedCopy = {
  headline: 'Status: Analysis ready',
  reason: 'Performance needs review.',
  actions: ['Review metrics before making changes.'],
};

const formatCurrency = (value: number) => `₹${Math.round(value)}`;
const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const METRIC_LABEL: Record<'ctr' | 'cpm' | 'cpa', string> = {
  ctr: 'click rate',
  cpm: 'cost per 1,000 views',
  cpa: 'cost per result',
};

function pickMetric(
  decision: DecisionSummary,
  metrics: { ctr: number; cpm: number; cpa: number },
): { kind: 'ctr' | 'cpm' | 'cpa' | null; value: number; benchmark: number } {
  // Priority: worst offender first, then preference
  if (decision.metrics.cpmStatus === 'HIGH') {
    return { kind: 'cpm', value: metrics.cpm, benchmark: decision.thresholds.targetCPM };
  }
  if (decision.metrics.ctrStatus === 'POOR') {
    return { kind: 'ctr', value: metrics.ctr, benchmark: decision.thresholds.targetCTR };
  }
  if (decision.metrics.cpaStatus === 'HIGH') {
    return { kind: 'cpa', value: metrics.cpa, benchmark: decision.thresholds.targetCPA };
  }

  const pref = ROOT_COPY[decision.rootCause]?.metricPreference;
  if (pref === 'ctr') return { kind: 'ctr', value: metrics.ctr, benchmark: decision.thresholds.targetCTR };
  if (pref === 'cpm') return { kind: 'cpm', value: metrics.cpm, benchmark: decision.thresholds.targetCPM };
  if (pref === 'cpa') return { kind: 'cpa', value: metrics.cpa, benchmark: decision.thresholds.targetCPA };

  return { kind: null, value: 0, benchmark: 0 };
}

function formatReason(base: string, metric: { kind: 'ctr' | 'cpm' | 'cpa' | null; value: number; benchmark: number }): string {
  if (!metric.kind || !metric.value || !metric.benchmark) {
    return base;
  }

  const label = METRIC_LABEL[metric.kind];
  const formatValue = metric.kind === 'ctr' ? formatPercent : formatCurrency;
  return `${base}, because ${label} is ${formatValue(metric.value)} vs ${formatValue(metric.benchmark)} goal.`;
}

export function buildHumanizedCopy(input: BuildCopyInput): HumanizedCopy {
  const { decision, metrics } = input;

  // Scale-ready path: stable performance
  if (decision.status === 'SCALE_READY') {
    const metric = pickMetric(decision, metrics);
    const reason = metric.kind
      ? `Performance is stable; ${METRIC_LABEL[metric.kind]} is ${metric.kind === 'ctr' ? formatPercent(metric.value) : formatCurrency(metric.value)} vs ${metric.kind === 'ctr' ? formatPercent(metric.benchmark) : formatCurrency(metric.benchmark)} goal.`
      : 'Performance is stable against goals.';
    return {
      ...SCALE_READY_COPY,
      reason,
    };
  }

  const deck = ROOT_COPY[decision.rootCause] || fallbackCopy;
  const metric = pickMetric(decision, metrics);
  const reason = formatReason(deck.baseReason, metric);

  // Ensure 1–3 actions max
  const actions = deck.actions.slice(0, 3);

  return {
    headline: deck.headline,
    reason,
    actions: actions.length ? actions : fallbackCopy.actions,
  };
}
