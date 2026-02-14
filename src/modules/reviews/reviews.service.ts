// @ts-nocheck - Temporary until Prisma migration is applied
import { ReviewsRepository } from './reviews.repository.js'
import { Review, Prisma } from '../../generated/prisma/index.js'
import { NotFoundException } from '../../shared/exceptions/NotFoundException.js'
import { BadRequestException } from '../../shared/exceptions/BadRequestException.js'
import { ForbiddenException } from '../../shared/exceptions/ForbiddenException.js'
import { IUser } from '../users/interfaces/user.interfaces.js'
import { prisma } from '../../database/prisma.client.js'

export class ReviewsService {
	constructor(private readonly reviewsRepository: ReviewsRepository) {}

	async createReview(
		userId: string,
		data: {
			productId: string
			rating: number
			comment?: string
		},
	): Promise<Review> {
		// Check if product exists
		const product = await prisma.product.findUnique({
			where: { id: data.productId },
		})
		if (!product) {
			throw new NotFoundException('Товар не найден')
		}

		// Check if user already reviewed this product
		const existingReview = await this.reviewsRepository.findByUserAndProduct(
			userId,
			data.productId,
		)
		if (existingReview) {
			throw new BadRequestException('Вы уже оставили отзыв на этот товар')
		}

		// Check if user purchased this product
		const hasPurchased = await prisma.orderItem.findFirst({
			where: {
				productId: data.productId,
				order: {
					userId,
					status: 'DELIVERED',
				},
			},
		})

		if (!hasPurchased) {
			throw new BadRequestException(
				'Вы можете оставлять отзывы только на купленные товары',
			)
		}

		return this.reviewsRepository.create({
			rating: data.rating,
			comment: data.comment,
			user: { connect: { id: userId } },
			product: { connect: { id: data.productId } },
		})
	}

	async getReviewById(id: string): Promise<Review> {
		const review = await this.reviewsRepository.findById(id)
		if (!review) {
			throw new NotFoundException('Отзыв не найден')
		}
		return review
	}

	async getProductReviews(
		productId: string,
		params: {
			page?: number
			limit?: number
			rating?: number
		},
	): Promise<{
		reviews: Review[]
		total: number
		page: number
		limit: number
	}> {
		const page = params.page || 1
		const limit = params.limit || 20
		const skip = (page - 1) * limit

		const where: Prisma.ReviewWhereInput = { productId }
		if (params.rating) {
			where.rating = params.rating
		}

		const [reviews, total] = await Promise.all([
			this.reviewsRepository.findAll({
				skip,
				take: limit,
				where,
				orderBy: { createdAt: 'desc' },
			}),
			this.reviewsRepository.count(where),
		])

		return { reviews, total, page, limit }
	}

	async getUserReviews(
		userId: string,
		params: {
			page?: number
			limit?: number
		},
	): Promise<{
		reviews: Review[]
		total: number
		page: number
		limit: number
	}> {
		const page = params.page || 1
		const limit = params.limit || 20
		const skip = (page - 1) * limit

		const [reviews, total] = await Promise.all([
			this.reviewsRepository.getUserReviews(userId, { skip, take: limit }),
			this.reviewsRepository.count({ userId }),
		])

		return { reviews, total, page, limit }
	}

	async updateReview(
		id: string,
		data: {
			rating?: number
			comment?: string
		},
		user: IUser,
	): Promise<Review> {
		const review = await this.reviewsRepository.findById(id)
		if (!review) {
			throw new NotFoundException('Отзыв не найден')
		}

		// Only review author can update
		if (review.userId !== user.id) {
			throw new ForbiddenException('Вы можете изменять только свои отзывы')
		}

		const updateData: Prisma.ReviewUpdateInput = {
			rating: data.rating,
			comment: data.comment,
		}

		return this.reviewsRepository.update(id, updateData)
	}

	async deleteReview(id: string, user: IUser): Promise<void> {
		const review = await this.reviewsRepository.findById(id)
		if (!review) {
			throw new NotFoundException('Отзыв не найден')
		}

		// Only review author or admin can delete
		if (review.userId !== user.id && user.role !== 'ADMIN') {
			throw new ForbiddenException('Доступ запрещен')
		}

		await this.reviewsRepository.delete(id)
	}
}
