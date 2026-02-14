// @ts-nocheck - Temporary until Prisma migration is applied
import { prisma } from '../../database/prisma.client.js'
import { Review, Prisma } from '../../generated/prisma/index.js'

export class ReviewsRepository {
	async create(data: Prisma.ReviewCreateInput): Promise<Review> {
		return prisma.review.create({
			data,
			include: {
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
				product: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
			},
		})
	}

	async findById(id: string): Promise<Review | null> {
		return prisma.review.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
				product: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
			},
		})
	}

	async findByUserAndProduct(
		userId: string,
		productId: string,
	): Promise<Review | null> {
		return prisma.review.findUnique({
			where: {
				userId_productId: {
					userId,
					productId,
				},
			},
		})
	}

	async findAll(params: {
		skip?: number
		take?: number
		where?: Prisma.ReviewWhereInput
		orderBy?: Prisma.ReviewOrderByWithRelationInput
	}): Promise<Review[]> {
		return prisma.review.findMany({
			...params,
			include: {
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
				product: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
			},
		})
	}

	async count(where?: Prisma.ReviewWhereInput): Promise<number> {
		return prisma.review.count({ where })
	}

	async update(id: string, data: Prisma.ReviewUpdateInput): Promise<Review> {
		return prisma.review.update({
			where: { id },
			data,
			include: {
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
				product: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
			},
		})
	}

	async delete(id: string): Promise<Review> {
		return prisma.review.delete({
			where: { id },
		})
	}

	async getProductReviews(
		productId: string,
		params: { skip?: number; take?: number },
	): Promise<Review[]> {
		return prisma.review.findMany({
			where: { productId },
			skip: params.skip,
			take: params.take,
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
		})
	}

	async getUserReviews(
		userId: string,
		params: { skip?: number; take?: number },
	): Promise<Review[]> {
		return prisma.review.findMany({
			where: { userId },
			skip: params.skip,
			take: params.take,
			include: {
				product: {
					select: {
						id: true,
						name: true,
						slug: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		})
	}
}
