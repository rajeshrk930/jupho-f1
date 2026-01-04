import { prisma } from '../src/lib/prisma';

(async function saveTest() {
  try {
    const user = await prisma.user.findUnique({ where: { email: 'test@test.com' } });
    if (!user) {
      console.error('Test user not found');
      process.exit(1);
    }

    const analysis = await prisma.analysis.create({
      data: {
        userId: user.id,
        creativeUrl: null,
        creativeType: 'IMAGE',
        primaryText: 'Test ad',
        headline: 'Buy',
        objective: 'LEADS',
        problemFaced: 'LOW_CLICKS',
        whatChanged: 'CREATIVE_CHANGED',
        audienceType: 'BROAD',
        cpm: 10,
        ctr: 0.5,
        cpa: 50,
        primaryReason: 'Test reason',
        supportingLogic: ['a','b'],
        singleFix: 'Test fix',
        resultType: 'AVERAGE'
      }
    });
    console.log('Saved analysis id:', analysis.id);
  } catch (err) {
    console.error('Save failed:', err);
    process.exit(1);
  }
  process.exit(0);
})();
