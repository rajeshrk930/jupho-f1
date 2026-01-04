import { DecisionEngine } from '../decisionEngine.service';

describe('DecisionEngine', () => {
  const engine = new DecisionEngine();

  test('LOW_CLICKS -> creative confirmed when CTR very low', () => {
    const out = engine.decide({
      objective: 'LEADS',
      problemFaced: 'LOW_CLICKS',
      whatChanged: 'NOTHING_NEW_AD',
      audienceType: 'BROAD',
      ctr: 0.3,
      cpm: 400,
      cpa: 90,
    });
    expect(out.primaryLayer).toBe('CREATIVE');
    expect(out.confirmed).toBe(true);
    expect(out.rootCause).toBe('LAUNCH_PHASE');
  });

  test('CLICKS_NO_ACTION -> funnel confirmed when CTR good but CPA high', () => {
    const out = engine.decide({
      objective: 'LEADS',
      problemFaced: 'CLICKS_NO_ACTION',
      whatChanged: 'BUDGET_CHANGED',
      audienceType: 'INTEREST_BASED',
      ctr: 1.3,
      cpm: 320,
      cpa: 100,
    });
    expect(out.primaryLayer).toBe('FUNNEL');
    expect(out.confirmed).toBe(true);
    expect(out.rootCause).toBe('DELIVERY');
  });

  test('MESSAGES_NO_CONVERSION -> sales primary and audience root cause when audience changed', () => {
    const out = engine.decide({
      objective: 'WHATSAPP',
      problemFaced: 'MESSAGES_NO_CONVERSION',
      whatChanged: 'AUDIENCE_CHANGED',
      audienceType: 'LOOKALIKE',
      ctr: 2.1,
      cpm: 220,
      cpa: 35,
    });
    expect(out.primaryLayer).toBe('SALES');
    expect(out.rootCause).toBe('AUDIENCE');
  });
});
