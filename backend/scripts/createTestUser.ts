import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma';

(async function createUser() {
  try {
    const password = await bcrypt.hash('test123', 10);
    const user = await prisma.user.upsert({
      where: { email: 'test@test.com' },
      update: {},
      create: {
        email: 'test@test.com',
        password,
        name: 'Test User',
        plan: 'STARTER'
      }
    });
    // eslint-disable-next-line no-console
    console.log('✅ Test user created or upserted:', user.email);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to create test user', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
