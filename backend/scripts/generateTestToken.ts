import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma';

(async function gen() {
  try {
    // Ensure test user exists
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

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    // eslint-disable-next-line no-console
    console.log(token);
    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to generate token', err);
    process.exit(1);
  }
})();
