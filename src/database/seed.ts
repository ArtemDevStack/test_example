import { PrismaClient, Role } from '../generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ArgonUtil } from '../utils/argon.util.js';
import { logger } from '../utils/logger.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  logger.info('🌱 Starting database seeding...');

  // Создание администратора
  const adminEmail = 'admin@example.com';
  const adminPassword = 'Admin@12345';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    logger.info('Admin user already exists');
  } else {
    const hashedPassword = await ArgonUtil.hashPassword(adminPassword);

    const admin = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        dateOfBirth: new Date('1990-01-01'),
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
        isActive: true,
      },
    });

    logger.info(`✅ Created admin user: ${admin.email}`);
    logger.info(`📧 Email: ${adminEmail}`);
    logger.info(`🔑 Password: ${adminPassword}`);
  }

  // Создание тестового пользователя
  const userEmail = 'user@example.com';
  const userPassword = 'User@12345';

  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (existingUser) {
    logger.info('Test user already exists');
  } else {
    const hashedPassword = await ArgonUtil.hashPassword(userPassword);

    const user = await prisma.user.create({
      data: {
        firstName: 'Test',
        lastName: 'User',
        middleName: 'Middle',
        dateOfBirth: new Date('1995-05-15'),
        email: userEmail,
        password: hashedPassword,
        role: Role.USER,
        isActive: true,
      },
    });

    logger.info(`✅ Created test user: ${user.email}`);
    logger.info(`📧 Email: ${userEmail}`);
    logger.info(`🔑 Password: ${userPassword}`);
  }

  logger.info('🌱 Database seeding completed!');
}

main()
  .catch((e) => {
    logger.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
