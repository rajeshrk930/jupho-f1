import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Migration script to update all STARTER plan users to FREE plan
 * Run with: npx ts-node scripts/migrateStarterToFree.ts
 */
async function migrateStarterToFree() {
  try {
    console.log('🔍 Searching for users with STARTER plan...');

    // Find all users with STARTER plan
    const starterUsers = await prisma.user.findMany({
      where: {
        plan: 'STARTER',
      },
      select: {
        id: true,
        email: true,
        plan: true,
        planExpiresAt: true,
      },
    });

    console.log(`\nFound ${starterUsers.length} users with STARTER plan:`);
    starterUsers.forEach((user) => {
      console.log(`  - ${user.email} (ID: ${user.id})`);
    });

    if (starterUsers.length === 0) {
      console.log('\n✅ No STARTER users found. Database is clean!');
      return;
    }

    console.log('\n🔄 Migrating STARTER users to FREE plan...');

    // Update all STARTER users to FREE
    const result = await prisma.user.updateMany({
      where: {
        plan: 'STARTER',
      },
      data: {
        plan: 'FREE',
        planExpiresAt: null, // FREE plan never expires
      },
    });

    console.log(`\n✅ Successfully migrated ${result.count} users from STARTER to FREE`);
    
    // Also check for any other invalid plans
    console.log('\n🔍 Checking for other invalid plans...');
    const invalidPlanUsers = await prisma.user.findMany({
      where: {
        plan: {
          notIn: ['FREE', 'BASIC', 'GROWTH'],
        },
      },
      select: {
        id: true,
        email: true,
        plan: true,
      },
    });

    if (invalidPlanUsers.length > 0) {
      console.log(`\n⚠️  Found ${invalidPlanUsers.length} users with invalid plans:`);
      invalidPlanUsers.forEach((user) => {
        console.log(`  - ${user.email}: plan="${user.plan}"`);
      });
      console.log('\n💡 Consider updating these manually or running another migration.');
    } else {
      console.log('✅ All users have valid plans (FREE/BASIC/GROWTH)');
    }

    console.log('\n✨ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateStarterToFree()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
