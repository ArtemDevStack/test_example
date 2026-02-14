// @ts-nocheck - Temporary until Prisma migration is applied
import { Response, NextFunction, Router } from 'express'
import { ReviewsService } from './reviews.service.js'
import { ResponseUtil } from '../../utils/response.util.js'
import { IController } from '../../shared/interfaces/IController.js'
import { IAuthenticatedRequest } from '../../shared/types/express.types.js'

export class ReviewsController implements IController {
	public readonly router: Router

	constructor(private readonly reviewsService: ReviewsService) {
		this.router = Router()
	}

	/**
	 * POST /api/reviews - Create review
	 */
	create = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const review = await this.reviewsService.createReview(
				req.user!.id,
				req.body,
			)
			ResponseUtil.created(res, review, 'Отзыв создан')
		} catch (error) {
			next(error)
		}
	}

	/**
	 * GET /api/reviews/:id - Get review by ID
	 */
	getById = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
			const review = await this.reviewsService.getReviewById(id)
			ResponseUtil.success(res, review)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * GET /api/reviews/product/:productId - Get product reviews
	 */
	getProductReviews = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const productId = Array.isArray(req.params.productId)
				? req.params.productId[0]
				: req.params.productId
			const page = parseInt(req.query.page as string) || 1
			const limit = parseInt(req.query.limit as string) || 20
			const rating = req.query.rating
				? parseInt(req.query.rating as string)
				: undefined

			const result = await this.reviewsService.getProductReviews(productId, {
				page,
				limit,
				rating,
			})

			ResponseUtil.paginated(
				res,
				result.reviews,
				result.page,
				result.limit,
				result.total,
			)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * GET /api/reviews/my - Get current user's reviews
	 */
	getMyReviews = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const page = parseInt(req.query.page as string) || 1
			const limit = parseInt(req.query.limit as string) || 20

			const result = await this.reviewsService.getUserReviews(req.user!.id, {
				page,
				limit,
			})

			ResponseUtil.paginated(
				res,
				result.reviews,
				result.page,
				result.limit,
				result.total,
			)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * PATCH /api/reviews/:id - Update review
	 */
	update = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
			const review = await this.reviewsService.updateReview(
				id,
				req.body,
				req.user!,
			)
			ResponseUtil.success(res, review, 'Отзыв обновлен')
		} catch (error) {
			next(error)
		}
	}

	/**
	 * DELETE /api/reviews/:id - Delete review
	 */
	delete = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
			await this.reviewsService.deleteReview(id, req.user!)
			ResponseUtil.success(res, null, 'Отзыв удален')
		} catch (error) {
			next(error)
		}
	}
}
