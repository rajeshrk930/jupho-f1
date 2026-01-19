const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createUser() {
  try {
    const user = await prisma.user.create({
      data: {
        clerkId: 'user_38QGPUAHWERukQjztkYw5oF3bss',
        email: 'newuser@test.com',
        name: 'New User',
        plan: 'FREE',
        apiUsageCount: 0,
        agentTasksCreated: 0,
      }
    });
    console.log('✅ SUCCESS! User created in production database!');
    console.log('Email:', user.email);
    console.log('Clerk ID:', user.clerkId);
    console.log('User ID:', user.id);
    await prisma.$disconnect();
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('✅ User already exists in production!');
    } else {
      console.error('❌ Error:', error);
    }
    await prisma.$disconnect();
  }
}

createUser();
