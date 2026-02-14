// @ts-nocheck - Test file
import { ProductsService } from '../products.service';
import { ProductsRepository } from '../products.repository';
import { NotFoundException } from '../../../shared/exceptions/NotFoundException';
import { BadRequestException } from '../../../shared/exceptions/BadRequestException';

// Mock repository
jest.mock('../products.repository');

describe('ProductsService', () => {
  let productsService: ProductsService;
  let productsRepository: jest.Mocked<ProductsRepository>;

  beforeEach(() => {
    productsRepository = new ProductsRepository() as jest.Mocked<ProductsRepository>;
    productsService = new ProductsService(productsRepository);
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        categoryId: 'cat-1',
        images: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      productsRepository.findBySlug.mockResolvedValue(null);
      productsRepository.create.mockResolvedValue(mockProduct as any);

      const result = await productsService.createProduct({
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        categoryId: 'cat-1',
      });

      expect(result).toEqual(mockProduct);
      expect(productsRepository.findBySlug).toHaveBeenCalledWith('test-product');
      expect(productsRepository.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if slug already exists', async () => {
      const existingProduct = {
        id: '1',
        slug: 'test-product',
      };

      productsRepository.findBySlug.mockResolvedValue(existingProduct as any);

      await expect(
        productsService.createProduct({
          name: 'Test Product',
          slug: 'test-product',
          price: 100,
          stock: 10,
          categoryId: 'cat-1',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProductById', () => {
    it('should return product with average rating', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        slug: 'test-product',
        price: 100,
      };

      productsRepository.findById.mockResolvedValue(mockProduct as any);
      productsRepository.getAverageRating.mockResolvedValue(4.5);

      const result = await productsService.getProductById('1');

      expect(result).toHaveProperty('averageRating', 4.5);
      expect(productsRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if product not found', async () => {
      productsRepository.findById.mockResolvedValue(null);

      await expect(productsService.getProductById('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllProducts', () => {
    it('should return paginated products with filters', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1' },
        { id: '2', name: 'Product 2' },
      ];

      productsRepository.findAll.mockResolvedValue(mockProducts as any);
      productsRepository.count.mockResolvedValue(2);

      const result = await productsService.getAllProducts({
        page: 1,
        limit: 10,
        search: 'test',
        minPrice: 50,
        maxPrice: 200,
      });

      expect(result).toEqual({
        products: mockProducts,
        total: 2,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('updateStock', () => {
    it('should update product stock', async () => {
      const mockProduct = {
        id: '1',
        stock: 10,
      };

      productsRepository.findById.mockResolvedValue(mockProduct as any);
      productsRepository.updateStock.mockResolvedValue({ ...mockProduct, stock: 15 } as any);

      const result = await productsService.updateStock('1', 5);

      expect(result.stock).toBe(15);
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      const mockProduct = {
        id: '1',
        stock: 5,
      };

      productsRepository.findById.mockResolvedValue(mockProduct as any);

      await expect(productsService.updateStock('1', -10)).rejects.toThrow(BadRequestException);
    });
  });
});
