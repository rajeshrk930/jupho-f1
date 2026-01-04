(async function run() {
  try {
    // Ensure the rule engine path is used (avoids requiring OPENAI_API_KEY during local tests)
    process.env.USE_RULE_ENGINE = 'true';

    const { analyzeCreative } = await import('../src/services/openai.service');

    const result = await analyzeCreative({
      creativeUrl: undefined,
      creativeType: 'IMAGE',
      primaryText: 'Test ad copy',
      headline: 'Buy now',
      objective: 'LEADS',
      problemFaced: 'LOW_CLICKS',
      whatChanged: 'CREATIVE_CHANGED',
      audienceType: 'BROAD',
      cpm: 10,
      ctr: 0.5,
      cpa: 50,
    } as any);
    // eslint-disable-next-line no-console
    console.log('Analyze result:', JSON.stringify(result, null, 2));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Analyze failed:', err);
    process.exit(1);
  }
  process.exit(0);
})();
