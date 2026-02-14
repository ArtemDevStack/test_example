import { OrdersService } from '../orders.service';
import { OrdersRepository } from '../orders.repository';
import { OrderStatus } from '../../../generated/prisma/index';
import { NotFoundException } from '../../../shared/exceptions/NotFoundException';
import { BadRequestException } from '../../../shared/exceptions/BadRequestException';

jest.mock('../orders.repository');
jest.mock('../../../database/prisma.client', () => ({
  prisma: {
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback({
      order: {
        create: jest.fn(),
      },
      product: {
        update: jest.fn(),
      },
    })),
  },
}));

describe('OrdersService', () => {
  let ordersService: OrdersService;
  let ordersRepository: jest.Mocked<OrdersRepository>;

  beforeEach(() => {
    ordersRepository = new OrdersRepository() as jest.Mocked<OrdersRepository>;
    ordersService = new OrdersService(ordersRepository);
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should throw BadRequestException if items array is empty', async () => {
      await expect(
        ordersService.createOrder('user-1', {
          items: [],
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if product not found', async () => {
      const { prisma } = require('../../../database/prisma.client');
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(
        ordersService.createOrder('user-1', {
          items: [{ productId: 'invalid-id', quantity: 1 }],
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if product is not active', async () => {
      const { prisma } = require('../../../database/prisma.client');
      prisma.product.findUnique.mockResolvedValue({
        id: '1',
        isActive: false,
        name: 'Test Product',
      });

      await expect(
        ordersService.createOrder('user-1', {
          items: [{ productId: '1', quantity: 1 }],
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      const { prisma } = require('../../../database/prisma.client');
      prisma.product.findUnique.mockResolvedValue({
        id: '1',
        isActive: true,
        name: 'Test Product',
        stock: 5,
      });

      await expect(
        ordersService.createOrder('user-1', {
          items: [{ productId: '1', quantity: 10 }],
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelOrder', () => {
    it('should throw NotFoundException if order not found', async () => {
      ordersRepository.findById.mockResolvedValue(null);

      await expect(
        ordersService.cancelOrder('999', { id: 'user-1', role: 'USER' } as any)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if order status is not PENDING or PROCESSING', async () => {
      ordersRepository.findById.mockResolvedValue({
        id: '1',
        userId: 'user-1',
        status: OrderStatus.DELIVERED,
        orderItems: [],
      } as any);

      await expect(
        ordersService.cancelOrder('1', { id: 'user-1', role: 'USER' } as any)
      ).rejects.toThrow(BadRequestException);
    });
  });
});
