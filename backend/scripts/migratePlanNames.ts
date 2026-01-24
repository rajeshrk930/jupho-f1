/**
 * Migration script to standardize plan names from FREE/PRO to STARTER/GROWTH
 * 
 * This fixes the inconsistency where:
 * - Old system used: FREE, PRO
 * - New system uses: STARTER, GROWTH
 * 
 * Run with: npx ts-node backend/scripts/migratePlanNames.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migratePlanNames() {
  console.log('🔄 Starting plan name migration...\n');

  try {
    // Find all users with old plan names
    const freeUsers = await prisma.user.findMany({
      where: { plan: 'FREE' },
      select: { id: true, email: true, plan: true }
    });

    const proUsers = await prisma.user.findMany({
      where: { plan: 'PRO' },
      select: { id: true, email: true, plan: true }
    });

    console.log(`Found ${freeUsers.length} users with 'FREE' plan`);
    console.log(`Found ${proUsers.length} users with 'PRO' plan\n`);

    if (freeUsers.length === 0 && proUsers.length === 0) {
      console.log('✅ No users found with old plan names. Migration not needed!');
      return;
    }

    // Migrate FREE → STARTER
    if (freeUsers.length > 0) {
      console.log('Migrating FREE → STARTER...');
      const freeResult = await prisma.user.updateMany({
        where: { plan: 'FREE' },
        data: { plan: 'STARTER' }
      });
      console.log(`✅ Migrated ${freeResult.count} users from FREE to STARTER`);
    }

    // Migrate PRO → GROWTH (and set planExpiresAt to null for lifetime access)
    if (proUsers.length > 0) {
      console.log('Migrating PRO → GROWTH...');
      
      // Update each user individually to also set planExpiresAt
      let migratedCount = 0;
      for (const user of proUsers) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: 'GROWTH',
            planExpiresAt: null // Lifetime access for existing PRO users
          }
        });
        migratedCount++;
        console.log(`  ✓ ${user.email} (${user.id})`);
      }
      
      console.log(`✅ Migrated ${migratedCount} users from PRO to GROWTH`);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\nSummary:');
    console.log(`  - FREE → STARTER: ${freeUsers.length} users`);
    console.log(`  - PRO → GROWTH: ${proUsers.length} users`);
    console.log(`  - All PRO users now have lifetime GROWTH access (planExpiresAt = null)`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migratePlanNames()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
