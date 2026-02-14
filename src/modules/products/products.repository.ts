// @ts-nocheck - Temporary until Prisma migration is applied
import { prisma } from '../../database/prisma.client.js'

export class ProductsRepository {
	async create(data: Prisma.ProductCreateInput): Promise<Product> {
		return prisma.product.create({
			data,
			include: {
				category: true,
				_count: {
					select: { reviews: true, orderItems: true },
				},
			},
		})
	}

	async findById(id: string): Promise<Product | null> {
		return prisma.product.findUnique({
			where: { id },
			include: {
				category: true,
				reviews: {
					include: {
						user: {
							select: {
								id: true,
								firstName: true,
								lastName: true,
								email: true,
							},
						},
					},
					orderBy: { createdAt: 'desc' },
				},
				_count: {
					select: { reviews: true, orderItems: true },
				},
			},
		})
	}

	async findBySlug(slug: string): Promise<Product | null> {
		return prisma.product.findUnique({
			where: { slug },
			include: {
				category: true,
				reviews: {
					include: {
						user: {
							select: {
								id: true,
								firstName: true,
								lastName: true,
								email: true,
							},
						},
					},
					orderBy: { createdAt: 'desc' },
				},
				_count: {
					select: { reviews: true, orderItems: true },
				},
			},
		})
	}

	async findAll(params: {
		skip?: number
		take?: number
		where?: Prisma.ProductWhereInput
		orderBy?: Prisma.ProductOrderByWithRelationInput
	}): Promise<Product[]> {
		return prisma.product.findMany({
			...params,
			include: {
				category: true,
				_count: {
					select: { reviews: true },
				},
			},
		})
	}

	async count(where?: Prisma.ProductWhereInput): Promise<number> {
		return prisma.product.count({ where })
	}

	async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
		return prisma.product.update({
			where: { id },
			data,
			include: {
				category: true,
				_count: {
					select: { reviews: true, orderItems: true },
				},
			},
		})
	}

	async delete(id: string): Promise<Product> {
		return prisma.product.delete({
			where: { id },
		})
	}

	async getAverageRating(productId: string): Promise<number> {
		const result = await prisma.review.aggregate({
			where: { productId },
			_avg: { rating: true },
		})
		return result._avg.rating || 0
	}

	async updateStock(id: string, quantity: number): Promise<Product> {
		return prisma.product.update({
			where: { id },
			data: {
				stock: {
					increment: quantity,
				},
			},
		})
	}
}
