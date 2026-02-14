// @ts-nocheck - Temporary until Prisma migration is applied
import { Response, NextFunction, Router } from 'express'
import { OrdersService } from './orders.service.js'
import { ResponseUtil } from '../../utils/response.util.js'
import { IController } from '../../shared/interfaces/IController.js'
import { IAuthenticatedRequest } from '../../shared/types/express.types.js'
import { OrderStatus } from '../../generated/prisma/index.js'

export class OrdersController implements IController {
	public readonly router: Router

	constructor(private readonly ordersService: OrdersService) {
		this.router = Router()
	}

	/**
	 * POST /api/orders - Create order
	 */
	create = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const order = await this.ordersService.createOrder(req.user!.id, req.body)
			ResponseUtil.created(res, order, 'Заказ создан')
		} catch (error) {
			next(error)
		}
	}

	/**
	 * GET /api/orders/:id - Get order by ID
	 */
	getById = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
			const order = await this.ordersService.getOrderById(id, req.user!)
			ResponseUtil.success(res, order)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * GET /api/orders - Get all orders
	 */
	getAll = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const page = parseInt(req.query.page as string) || 1
			const limit = parseInt(req.query.limit as string) || 20
			const status = req.query.status as OrderStatus | undefined
			const userId = req.query.userId as string | undefined

			const result = await this.ordersService.getAllOrders(
				{
					page,
					limit,
					status,
					userId,
				},
				req.user!,
			)

			ResponseUtil.paginated(
				res,
				result.orders,
				result.page,
				result.limit,
				result.total,
			)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * GET /api/orders/my - Get current user's orders
	 */
	getMyOrders = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const page = parseInt(req.query.page as string) || 1
			const limit = parseInt(req.query.limit as string) || 20
			const status = req.query.status as OrderStatus | undefined

			const result = await this.ordersService.getUserOrders(req.user!.id, {
				page,
				limit,
				status,
			})

			ResponseUtil.paginated(
				res,
				result.orders,
				result.page,
				result.limit,
				result.total,
			)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * PATCH /api/orders/:id/status - Update order status (Admin only)
	 */
	updateStatus = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
			const { status } = req.body
			const order = await this.ordersService.updateOrderStatus(
				id,
				status,
				req.user!,
			)
			ResponseUtil.success(res, order, 'Статус заказа обновлен')
		} catch (error) {
			next(error)
		}
	}

	/**
	 * POST /api/orders/:id/cancel - Cancel order
	 */
	cancel = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
			const order = await this.ordersService.cancelOrder(id, req.user!)
			ResponseUtil.success(res, order, 'Заказ отменен')
		} catch (error) {
			next(error)
		}
	}
}
