// @ts-nocheck - Temporary until Prisma migration is applied
import { Response, NextFunction, Router } from 'express'
import { AnalyticsService } from './analytics.service.js'
import { ResponseUtil } from '../../utils/response.util.js'
import { IController } from '../../shared/interfaces/IController.js'
import { IAuthenticatedRequest } from '../../shared/types/express.types.js'

export class AnalyticsController implements IController {
	public readonly router: Router

	constructor(private readonly analyticsService: AnalyticsService) {
		this.router = Router()
	}

	/**
	 * GET /api/analytics/dashboard - Get dashboard statistics
	 */
	getDashboard = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const stats = await this.analyticsService.getDashboardStats()
			ResponseUtil.success(res, stats)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * GET /api/analytics/sales - Get sales statistics by period
	 */
	getSales = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const startDate = req.query.startDate
				? new Date(req.query.startDate as string)
				: undefined
			const endDate = req.query.endDate
				? new Date(req.query.endDate as string)
				: undefined
			const groupBy = (req.query.groupBy as 'day' | 'week' | 'month') || 'day'

			const stats = await this.analyticsService.getSalesByPeriod({
				startDate,
				endDate,
				groupBy,
			})

			ResponseUtil.success(res, stats)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * GET /api/analytics/top-products - Get top selling products
	 */
	getTopProducts = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const limit = req.query.limit ? parseInt(req.query.limit as string) : 10
			const products = await this.analyticsService.getTopProducts(limit)
			ResponseUtil.success(res, products)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * GET /api/analytics/categories - Get category statistics
	 */
	getCategoryStats = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const stats = await this.analyticsService.getCategoryStats()
			ResponseUtil.success(res, stats)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * GET /api/analytics/users - Get user activity statistics
	 */
	getUserActivity = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const stats = await this.analyticsService.getUserActivityStats()
			ResponseUtil.success(res, stats)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * GET /api/analytics/revenue - Get revenue by order status
	 */
	getRevenueByStatus = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const stats = await this.analyticsService.getRevenueByStatus()
			ResponseUtil.success(res, stats)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * GET /api/analytics/report - Get full analytics report
	 */
	getFullReport = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const report = await this.analyticsService.getFullReport()
			ResponseUtil.success(res, report)
		} catch (error) {
			next(error)
		}
	}
}
