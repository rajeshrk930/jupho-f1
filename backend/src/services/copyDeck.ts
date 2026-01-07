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
  creativeBrief?: string;
}

const ROOT_COPY: Record<string, { headline: string; baseReason: string; metricPreference: 'ctr' | 'cpm' | 'cpa'; actions: string[]; creativeBrief?: string }> = {
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
      'Change ONLY the opening visual. Keep your offer and CTA exactly the same.',
      'Use a bold color (#FF6B35 orange or #10B981 green) with high contrast text.'
    ],
    creativeBrief: `⏱️ ESTIMATED EFFORT: 15-20 minutes

📋 CREATIVE BRIEF FOR YOUR DESIGNER:

🎨 Background/Visual:
• Remove busy patterns or dull colors
• Use a bold solid color or gradient (e.g., #FF6B35 coral orange, #3B82F6 blue, or #10B981 green)
• Alternative: Use a high-contrast image with dark overlay (70% opacity) so text pops

✍️ Headline:
• Make it 2x bolder - use fonts like: Montserrat Bold, Poppins Bold, or Oswald
• Size: 42-56px for mobile-first ads
• Color: White text on dark background OR black text on bright background
• Position: Top-third of image (eye-level on mobile)

🖼️ Product/Visual Element:
• Move product to bottom-right or bottom-left corner
• Leave center space empty or use a "pattern interrupt" (emoji, unexpected visual)
• If showing people: use close-up faces with direct eye contact

🎯 CTA Button (if applicable):
• Make button 50% larger than current size
• Use contrasting color (if background is blue, use yellow/orange button)
• Text: Keep it 2-3 words max ("Get Started", "Claim Offer")

💡 Canva Quick Start:
1. Search: "Bold Sales Ad Template" or "Modern Ad Design"
2. Pick templates with: minimal text, strong colors, clear hierarchy
3. Replace only the visual - keep all text the same

⏱️ Total Time: 15-20 minutes
📱 Test on Mobile First: 80% of users will see this on phones`
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
      'Remove ALL unnecessary form fields. Keep only: Name, Phone, Email.',
      'Make your landing page headline match your ad promise EXACTLY.'
    ],
    creativeBrief: `⏱️ ESTIMATED EFFORT: 30-45 minutes

📋 LANDING PAGE OPTIMIZATION BRIEF:

🎯 Above the Fold (First Screen):
• Headline: Must match your ad's promise exactly
  - If ad says "Get Leads in 24 Hours" → landing page headline must say the same
  - Font: Large, bold, 36-48px on desktop, 28-36px on mobile
  - Position: Visible without scrolling

📝 Form Optimization:
• Reduce fields to 3-4 maximum (Name, Phone, Email, City - that's it!)
• Remove: Address, Company name, "How did you hear about us?"
• Button text: Use action words ("Get My Free Quote", "Start Now")
• Button color: Use high-contrast (Orange on white, Green on dark blue)

⚡ Speed Fixes:
• Compress all images (use TinyPNG.com - free)
• Remove unnecessary videos above the fold
• Test page speed: PageSpeed Insights (aim for 80+ score on mobile)

✅ Trust Elements:
• Add 1-2 testimonials near the form (use real names + photos if possible)
• Show certifications/badges (Google Partner, awards, "5000+ clients")
• Add live chat option OR WhatsApp button (increases conversions 20-30%)

🔄 Scent Matching Checklist:
□ Ad headline = Landing page headline ✓
□ Ad CTA = Button text on page ✓
□ Ad visual style = Page design style ✓
□ Form loads in under 3 seconds ✓

💡 Quick Tools:
• Page Speed Test: pagespeed.web.dev
• Form Builder: Google Forms, Typeform (if current form is slow)
• Image Compression: tinypng.com

⏱️ Estimated Time to Fix: 30-45 minutes
📊 Expected Improvement: 30-50% better conversion rate`
  },
  SALES: {
    headline: 'Status: Follow-up issue',
    baseReason: 'Leads are not converting after contact',
    metricPreference: 'cpa',
    actions: [
      'Respond to EVERY lead within 15 minutes. Set up auto-reply if needed.',
      'Show pricing upfront in your first message. Stop hiding it.'
    ],
    creativeBrief: `⏱️ ESTIMATED EFFORT: 1-2 hours (one-time setup)

📋 SALES FOLLOW-UP OPTIMIZATION BRIEF:

⚡ Speed Response Protocol:
• Target: Respond within 15 minutes (while intent is hot)
• First message template:
  "Hi [Name]! Thanks for your interest in [Product]. I can help you with [specific benefit they inquired about]. When's a good time for a quick 10-min call?"
• Use auto-responders if you can't reply immediately:
  "Got your message! Will respond in [X minutes]. Meanwhile, here's [useful resource]."

💰 Pricing Transparency:
• DON'T hide pricing - it filters non-buyers
• First message can say: "Our plans start at ₹[X]/month. Want to see which fits your needs?"
• Builds trust and saves time on unqualified leads

🎯 Message Structure (Use This Exact Template):
Opening: "Hi [Name], thanks for reaching out!"
Social Proof: "We've helped 50+ businesses like yours with [problem]."
Quick Win: "Can I share a quick [resource/tip] that might help immediately?"
Soft Ask: "Would a 15-min call work for you tomorrow?"

📞 Follow-Up Sequence:
Day 1: Initial response (within 15 min)
Day 2: Value-add message (share case study/tip)
Day 4: Check-in with specific question
Day 7: Final attempt with discount/urgency

✅ Add Trust Before Asking:
• Include in signature: "[X] happy clients | [Achievement] | Google Rating [X]/5"
• Attach: 1-page case study PDF or client testimonial screenshot
• Mention: "No pressure - just here to help even if you don't buy"

💡 Quick Tools:
• WhatsApp Business (auto-replies, quick responses)
• Google Voice (if you need separate business number)
• Calendly (easy scheduling)

⏱️ Estimated Time to Implement: 1-2 hours (set up templates)
📈 Expected Improvement: 40-60% better lead-to-sale conversion`
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
    creativeBrief: deck.creativeBrief,
  };
}
