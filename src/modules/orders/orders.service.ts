// @ts-nocheck - Temporary until Prisma migration is applied
import { OrdersRepository } from './orders.repository.js'
import { Order, Prisma, OrderStatus } from '../../generated/prisma/index.js'
import { NotFoundException } from '../../shared/exceptions/NotFoundException.js'
import { BadRequestException } from '../../shared/exceptions/BadRequestException.js'
import { ForbiddenException } from '../../shared/exceptions/ForbiddenException.js'
import { IUser } from '../users/interfaces/user.interfaces.js'
import { prisma } from '../../database/prisma.client.js'
import { Decimal } from '../../generated/prisma/client.js'

export class OrdersService {
	constructor(private readonly ordersRepository: OrdersRepository) {}

	async createOrder(
		userId: string,
		data: {
			items: Array<{ productId: string; quantity: number }>
			notes?: string
		},
	): Promise<Order> {
		if (!data.items || data.items.length === 0) {
			throw new BadRequestException('Заказ должен содержать хотя бы один товар')
		}

		// Проверка товаров и расчет стоимости
		const orderItems: Array<{
			productId: string
			quantity: number
			price: Decimal
		}> = []
		let totalPrice = new Decimal(0)

		for (const item of data.items) {
			const product = await prisma.product.findUnique({
				where: { id: item.productId },
			})

			if (!product) {
				throw new NotFoundException(`Товар с ID ${item.productId} не найден`)
			}

			if (!product.isActive) {
				throw new BadRequestException(`Товар "${product.name}" недоступен`)
			}

			if (product.stock < item.quantity) {
				throw new BadRequestException(
					`Недостаточно товара "${product.name}" на складе. Доступно: ${product.stock}`,
				)
			}

			const itemPrice = new Decimal(product.price.toString()).mul(item.quantity)
			totalPrice = totalPrice.add(itemPrice)

			orderItems.push({
				productId: product.id,
				quantity: item.quantity,
				price: new Decimal(product.price.toString()),
			})
		}

		// Создание заказа в транзакции
		const order = await prisma.$transaction(async tx => {
			// Создаем заказ
			const createdOrder = await tx.order.create({
				data: {
					userId,
					status: OrderStatus.PENDING,
					totalPrice,
					notes: data.notes,
					orderItems: {
						create: orderItems.map(item => ({
							productId: item.productId,
							quantity: item.quantity,
							price: item.price,
						})),
					},
				},
				include: {
					user: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							email: true,
						},
					},
					orderItems: {
						include: {
							product: true,
						},
					},
				},
			})

			// Уменьшаем остатки товаров
			for (const item of orderItems) {
				await tx.product.update({
					where: { id: item.productId },
					data: {
						stock: {
							decrement: item.quantity,
						},
					},
				})
			}

			return createdOrder
		})

		return order
	}

	async getOrderById(id: string, user: IUser): Promise<Order> {
		const order = await this.ordersRepository.findById(id)
		if (!order) {
			throw new NotFoundException('Заказ не найден')
		}

		// Пользователи могут видеть только свои заказы
		if (user.role !== 'ADMIN' && order.userId !== user.id) {
			throw new ForbiddenException('Доступ запрещен')
		}

		return order
	}

	async getAllOrders(
		params: {
			page?: number
			limit?: number
			status?: OrderStatus
			userId?: string
		},
		user: IUser,
	): Promise<{ orders: Order[]; total: number; page: number; limit: number }> {
		const page = params.page || 1
		const limit = params.limit || 20
		const skip = (page - 1) * limit

		const where: Prisma.OrderWhereInput = {}

		// Админ видит все заказы, пользователь - только свои
		if (user.role !== 'ADMIN') {
			where.userId = user.id
		} else if (params.userId) {
			where.userId = params.userId
		}

		if (params.status) {
			where.status = params.status
		}

		const [orders, total] = await Promise.all([
			this.ordersRepository.findAll({
				skip,
				take: limit,
				where,
				orderBy: { createdAt: 'desc' },
			}),
			this.ordersRepository.count(where),
		])

		return { orders, total, page, limit }
	}

	async updateOrderStatus(
		id: string,
		status: OrderStatus,
		user: IUser,
	): Promise<Order> {
		const order = await this.ordersRepository.findById(id)
		if (!order) {
			throw new NotFoundException('Заказ не найден')
		}

		// Только админ может изменять статус
		if (user.role !== 'ADMIN') {
			throw new ForbiddenException(
				'Только администратор может изменять статус заказа',
			)
		}

		// Проверка валидности перехода статуса
		if (
			order.status === OrderStatus.CANCELLED ||
			order.status === OrderStatus.DELIVERED
		) {
			throw new BadRequestException(
				'Невозможно изменить статус завершенного или отмененного заказа',
			)
		}

		return this.ordersRepository.update(id, { status })
	}

	async cancelOrder(id: string, user: IUser): Promise<Order> {
		const order = await this.ordersRepository.findById(id)
		if (!order) {
			throw new NotFoundException('Заказ не найден')
		}

		// Проверка прав доступа
		if (user.role !== 'ADMIN' && order.userId !== user.id) {
			throw new ForbiddenException('Доступ запрещен')
		}

		// Можно отменить только заказы в статусе PENDING или PROCESSING
		if (
			order.status !== OrderStatus.PENDING &&
			order.status !== OrderStatus.PROCESSING
		) {
			throw new BadRequestException(
				'Невозможно отменить заказ в текущем статусе',
			)
		}

		// Отмена заказа и возврат товаров на склад
		const cancelledOrder = await prisma.$transaction(async tx => {
			// Обновляем статус
			const updated = await tx.order.update({
				where: { id },
				data: { status: OrderStatus.CANCELLED },
				include: {
					user: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							email: true,
						},
					},
					orderItems: {
						include: {
							product: true,
						},
					},
				},
			})

			// Возвращаем товары на склад
			for (const item of order.orderItems) {
				await tx.product.update({
					where: { id: item.productId },
					data: {
						stock: {
							increment: item.quantity,
						},
					},
				})
			}

			return updated
		})

		return cancelledOrder
	}

	async getUserOrders(
		userId: string,
		params: {
			page?: number
			limit?: number
			status?: OrderStatus
		},
	): Promise<{ orders: Order[]; total: number; page: number; limit: number }> {
		const page = params.page || 1
		const limit = params.limit || 20
		const skip = (page - 1) * limit

		const [orders, total] = await Promise.all([
			this.ordersRepository.getUserOrders(userId, {
				skip,
				take: limit,
				status: params.status,
			}),
			this.ordersRepository.countUserOrders(userId, params.status),
		])

		return { orders, total, page, limit }
	}
}
