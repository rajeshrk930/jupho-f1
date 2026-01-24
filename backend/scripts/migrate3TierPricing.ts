/**
 * Migration Script: 3-Tier Pricing System
 * 
 * Migrates existing users from old 2-tier (STARTER/GROWTH) to new 3-tier (FREE/BASIC/GROWTH) system
 * 
 * Migration Rules:
 * - STARTER → FREE (free users with 5 campaigns become FREE with 2 campaigns)
 * - PRO → GROWTH (old PRO users become GROWTH)
 * - GROWTH → GROWTH (already on new system)
 * - Any other plan → FREE (safe default)
 * 
 * Run with: npx ts-node backend/scripts/migrate3TierPricing.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate3TierPricing() {
  console.log('\n🔄 Starting 3-Tier Pricing Migration...\n');

  try {
    // Get all users and their current plans
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        plan: true,
        agentTasksCreated: true,
        planExpiresAt: true,
      },
    });

    console.log(`📊 Found ${users.length} total users\n`);

    // Categorize users
    const starterUsers = users.filter(u => u.plan === 'STARTER');
    const proUsers = users.filter(u => u.plan === 'PRO');
    const growthUsers = users.filter(u => u.plan === 'GROWTH');
    const otherUsers = users.filter(u => !['STARTER', 'PRO', 'GROWTH'].includes(u.plan));

    console.log('Current Plan Distribution:');
    console.log(`  - STARTER: ${starterUsers.length} users`);
    console.log(`  - PRO: ${proUsers.length} users`);
    console.log(`  - GROWTH: ${growthUsers.length} users`);
    console.log(`  - Other/Unknown: ${otherUsers.length} users\n`);

    // Migration plan
    console.log('📋 Migration Plan:');
    console.log(`  ✅ ${starterUsers.length} STARTER → FREE`);
    console.log(`  ✅ ${proUsers.length} PRO → GROWTH`);
    console.log(`  ✅ ${growthUsers.length} GROWTH → GROWTH (no change)`);
    console.log(`  ✅ ${otherUsers.length} Other → FREE (safe default)\n`);

    // Confirm before proceeding
    console.log('⚠️  This will UPDATE user plans in the database.');
    console.log('Press Ctrl+C to cancel, or waiting 5 seconds to proceed...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('🚀 Starting migration...\n');

    // Migrate STARTER → FREE
    if (starterUsers.length > 0) {
      const result = await prisma.user.updateMany({
        where: { plan: 'STARTER' },
        data: { 
          plan: 'FREE',
          // Reset campaign count for fair start with new limits
          agentTasksCreated: 0,
          agentLastResetDate: new Date(),
        },
      });
      console.log(`  ✅ Migrated ${result.count} STARTER users to FREE`);
    }

    // Migrate PRO → GROWTH
    if (proUsers.length > 0) {
      const result = await prisma.user.updateMany({
        where: { plan: 'PRO' },
        data: { 
          plan: 'GROWTH',
          // Keep their campaign count and expiry
        },
      });
      console.log(`  ✅ Migrated ${result.count} PRO users to GROWTH`);
    }

    // Migrate unknown plans → FREE
    if (otherUsers.length > 0) {
      const otherPlanNames = [...new Set(otherUsers.map(u => u.plan))];
      for (const planName of otherPlanNames) {
        const result = await prisma.user.updateMany({
          where: { plan: planName },
          data: { 
            plan: 'FREE',
            agentTasksCreated: 0,
            agentLastResetDate: new Date(),
            planExpiresAt: null,
          },
        });
        console.log(`  ✅ Migrated ${result.count} ${planName} users to FREE`);
      }
    }

    console.log('\n✅ Migration Complete!\n');

    // Verify migration
    const afterMigration = await prisma.user.groupBy({
      by: ['plan'],
      _count: true,
    });

    console.log('📊 Final Plan Distribution:');
    afterMigration.forEach((group) => {
      console.log(`  - ${group.plan}: ${group._count} users`);
    });

    console.log('\n🎉 All users successfully migrated to 3-tier pricing system!');
    console.log('\nNew Structure:');
    console.log('  - FREE: 2 campaigns/month, templates only');
    console.log('  - BASIC: ₹1,499/month, 10 campaigns, templates only');
    console.log('  - GROWTH: ₹1,999/month, 25 campaigns, AI Agent included\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrate3TierPricing()
  .then(() => {
    console.log('✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
