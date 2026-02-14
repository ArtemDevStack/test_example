// @ts-nocheck - Temporary until Prisma migration is applied
import { prisma } from './prisma.client.js';
import { ArgonUtil } from '../utils/argon.util.js';
import { logger } from '../utils/logger.js';

async function main() {
  logger.info('Starting database seeding...');

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  logger.info('Cleared existing data');

  // Create users
  const adminPassword = await ArgonUtil.hashPassword('Admin@12345');
  const userPassword = await ArgonUtil.hashPassword('User@12345');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      dateOfBirth: new Date('1990-01-01'),
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1995-05-15'),
      role: 'USER',
    },
  });

  logger.info('Created users');

  // Create categories with hierarchy
  const electronics = await prisma.category.create({
    data: {
      name: 'Электроника',
      slug: 'electronics',
      description: 'Электронные устройства и гаджеты',
    },
  });

  const phones = await prisma.category.create({
    data: {
      name: 'Смартфоны',
      slug: 'smartphones',
      description: 'Мобильные телефоны и аксессуары',
      parentId: electronics.id,
    },
  });

  const laptops = await prisma.category.create({
    data: {
      name: 'Ноутбуки',
      slug: 'laptops',
      description: 'Портативные компьютеры',
      parentId: electronics.id,
    },
  });

  const clothing = await prisma.category.create({
    data: {
      name: 'Одежда',
      slug: 'clothing',
      description: 'Одежда и аксессуары',
    },
  });

  const menClothing = await prisma.category.create({
    data: {
      name: 'Мужская одежда',
      slug: 'men-clothing',
      description: 'Одежда для мужчин',
      parentId: clothing.id,
    },
  });

  logger.info('Created categories');

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'Флагманский смартфон Apple с чипом A17 Pro',
        price: 99999,
        stock: 50,
        categoryId: phones.id,
        images: ['https://example.com/iphone15pro-1.jpg', 'https://example.com/iphone15pro-2.jpg'],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Samsung Galaxy S24 Ultra',
        slug: 'samsung-s24-ultra',
        description: 'Премиум смартфон Samsung с S Pen',
        price: 89999,
        stock: 30,
        categoryId: phones.id,
        images: ['https://example.com/s24-1.jpg'],
      },
    }),
    prisma.product.create({
      data: {
        name: 'MacBook Pro 16"',
        slug: 'macbook-pro-16',
        description: 'Мощный ноутбук для профессионалов на M3 Max',
        price: 299999,
        stock: 15,
        categoryId: laptops.id,
        images: ['https://example.com/mbp16-1.jpg', 'https://example.com/mbp16-2.jpg'],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Dell XPS 15',
        slug: 'dell-xps-15',
        description: 'Тонкий и мощный ноутбук для работы и творчества',
        price: 149999,
        stock: 20,
        categoryId: laptops.id,
        images: ['https://example.com/xps15.jpg'],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Классическая футболка',
        slug: 'classic-tshirt',
        description: 'Базовая хлопковая футболка',
        price: 1999,
        stock: 100,
        categoryId: menClothing.id,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: 'Джинсы Slim Fit',
        slug: 'slim-fit-jeans',
        description: 'Стильные зауженные джинсы',
        price: 4999,
        stock: 60,
        categoryId: menClothing.id,
        images: ['https://example.com/jeans.jpg'],
      },
    }),
  ]);

  logger.info('Created products');

  // Create orders
  const order1 = await prisma.order.create({
    data: {
      userId: user.id,
      status: 'DELIVERED',
      totalPrice: 101998,
      orderItems: {
        create: [
          {
            productId: products[0].id, // iPhone
            quantity: 1,
            price: 99999,
          },
          {
            productId: products[4].id, // T-shirt
            quantity: 1,
            price: 1999,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: user.id,
      status: 'PROCESSING',
      totalPrice: 299999,
      orderItems: {
        create: [
          {
            productId: products[2].id, // MacBook
            quantity: 1,
            price: 299999,
          },
        ],
      },
    },
  });

  logger.info('Created orders');

  // Create reviews
  await Promise.all([
    prisma.review.create({
      data: {
        userId: user.id,
        productId: products[0].id, // iPhone
        rating: 5,
        comment: 'Отличный смартфон! Камера просто невероятная.',
      },
    }),
    prisma.review.create({
      data: {
        userId: user.id,
        productId: products[4].id, // T-shirt
        rating: 4,
        comment: 'Хорошее качество ткани, размер соответствует.',
      },
    }),
  ]);

  logger.info('Created reviews');

  // Update product stocks after orders
  await prisma.product.update({
    where: { id: products[0].id },
    data: { stock: 49 },
  });

  await prisma.product.update({
    where: { id: products[2].id },
    data: { stock: 14 },
  });

  await prisma.product.update({
    where: { id: products[4].id },
    data: { stock: 99 },
  });

  logger.info('Updated product stocks');

  logger.info('✅ Database seeding completed successfully!');
  logger.info('\nTest accounts:');
  logger.info('Admin: admin@example.com / Admin@12345');
  logger.info('User: user@example.com / User@12345');
}

main()
  .catch((e) => {
    logger.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
