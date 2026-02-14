// @ts-nocheck - Temporary until Prisma migration is applied
import { ProductsRepository } from './products.repository.js'
import { NotFoundException } from '../../shared/exceptions/NotFoundException.js'
import { BadRequestException } from '../../shared/exceptions/BadRequestException.js'
import { prisma } from '../../database/prisma.client.js'

export class ProductsService {
	constructor(private readonly productsRepository: ProductsRepository) {}

	async createProduct(data: {
		name: string
		slug: string
		description?: string
		price: number
		stock: number
		categoryId: string
		images?: string[]
		isActive?: boolean
	}): Promise<Product> {
		// Check if slug already exists
		const existing = await this.productsRepository.findBySlug(data.slug)
		if (existing) {
			throw new BadRequestException('Товар с таким slug уже существует')
		}

		// Check if category exists
		const category = await prisma.category.findUnique({
			where: { id: data.categoryId },
		})
		if (!category) {
			throw new NotFoundException('Категория не найдена')
		}

		return this.productsRepository.create({
			name: data.name,
			slug: data.slug,
			description: data.description,
			price: data.price,
			stock: data.stock,
			images: data.images || [],
			isActive: data.isActive ?? true,
			category: { connect: { id: data.categoryId } },
		})
	}

	async getProductById(
		id: string,
	): Promise<Product & { averageRating?: number }> {
		const product = await this.productsRepository.findById(id)
		if (!product) {
			throw new NotFoundException('Товар не найден')
		}

		const averageRating = await this.productsRepository.getAverageRating(id)

		return { ...product, averageRating }
	}

	async getProductBySlug(
		slug: string,
	): Promise<Product & { averageRating?: number }> {
		const product = await this.productsRepository.findBySlug(slug)
		if (!product) {
			throw new NotFoundException('Товар не найден')
		}

		const averageRating = await this.productsRepository.getAverageRating(
			product.id,
		)

		return { ...product, averageRating }
	}

	async getAllProducts(params: {
		page?: number
		limit?: number
		search?: string
		categoryId?: string
		minPrice?: number
		maxPrice?: number
		isActive?: boolean
		inStock?: boolean
		sortBy?: 'name' | 'price' | 'createdAt' | 'stock'
		sortOrder?: 'asc' | 'desc'
	}): Promise<{
		products: Product[]
		total: number
		page: number
		limit: number
	}> {
		const page = params.page || 1
		const limit = params.limit || 20
		const skip = (page - 1) * limit

		const where: Prisma.ProductWhereInput = {}

		if (params.search) {
			where.OR = [
				{ name: { contains: params.search, mode: 'insensitive' } },
				{ description: { contains: params.search, mode: 'insensitive' } },
				{ slug: { contains: params.search, mode: 'insensitive' } },
			]
		}

		if (params.categoryId) {
			where.categoryId = params.categoryId
		}

		if (params.minPrice !== undefined || params.maxPrice !== undefined) {
			where.price = {}
			if (params.minPrice !== undefined) {
				where.price.gte = params.minPrice
			}
			if (params.maxPrice !== undefined) {
				where.price.lte = params.maxPrice
			}
		}

		if (params.isActive !== undefined) {
			where.isActive = params.isActive
		}

		if (params.inStock) {
			where.stock = { gt: 0 }
		}

		const orderBy: Prisma.ProductOrderByWithRelationInput = {}
		const sortBy = params.sortBy || 'createdAt'
		const sortOrder = params.sortOrder || 'desc'
		orderBy[sortBy] = sortOrder

		const [products, total] = await Promise.all([
			this.productsRepository.findAll({
				skip,
				take: limit,
				where,
				orderBy,
			}),
			this.productsRepository.count(where),
		])

		return { products, total, page, limit }
	}

	async updateProduct(
		id: string,
		data: {
			name?: string
			slug?: string
			description?: string
			price?: number
			stock?: number
			categoryId?: string
			images?: string[]
			isActive?: boolean
		},
	): Promise<Product> {
		const product = await this.productsRepository.findById(id)
		if (!product) {
			throw new NotFoundException('Товар не найден')
		}

		// Check slug uniqueness if updating
		if (data.slug && data.slug !== product.slug) {
			const existing = await this.productsRepository.findBySlug(data.slug)
			if (existing) {
				throw new BadRequestException('Товар с таким slug уже существует')
			}
		}

		// Check if category exists
		if (data.categoryId) {
			const category = await prisma.category.findUnique({
				where: { id: data.categoryId },
			})
			if (!category) {
				throw new NotFoundException('Категория не найдена')
			}
		}

		const updateData: Prisma.ProductUpdateInput = {
			name: data.name,
			slug: data.slug,
			description: data.description,
			price: data.price,
			stock: data.stock,
			images: data.images,
			isActive: data.isActive,
		}

		if (data.categoryId) {
			updateData.category = { connect: { id: data.categoryId } }
		}

		return this.productsRepository.update(id, updateData)
	}

	async deleteProduct(id: string): Promise<void> {
		const product = await this.productsRepository.findById(id)
		if (!product) {
			throw new NotFoundException('Товар не найден')
		}

		// Check if product is in any orders
		const ordersCount = (product as any)._count?.orderItems || 0
		if (ordersCount > 0) {
			throw new BadRequestException(
				'Невозможно удалить товар, который есть в заказах',
			)
		}

		await this.productsRepository.delete(id)
	}

	async updateStock(id: string, quantity: number): Promise<Product> {
		const product = await this.productsRepository.findById(id)
		if (!product) {
			throw new NotFoundException('Товар не найден')
		}

		if (product.stock + quantity < 0) {
			throw new BadRequestException('Недостаточно товара на складе')
		}

		return this.productsRepository.updateStock(id, quantity)
	}
}
