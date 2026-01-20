import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('❌ Usage: npx ts-node scripts/promoteAdmin.ts <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
      select: { email: true, isAdmin: true, name: true, id: true }
    });

    console.log('✅ User promoted to admin successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ID:     ', user.id);
    console.log('Email:  ', user.email);
    console.log('Name:   ', user.name || '(not set)');
    console.log('isAdmin:', user.isAdmin);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error('❌ User not found with email:', email);
      console.error('💡 Make sure the user has logged in at least once to create their account.');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

promoteToAdmin();
