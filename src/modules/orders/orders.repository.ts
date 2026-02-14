// @ts-nocheck - Temporary until Prisma migration is applied
import { prisma } from '../../database/prisma.client.js'
import { Order, Prisma, OrderStatus } from '../../generated/prisma/index.js'

export class OrdersRepository {
	async create(data: Prisma.OrderCreateInput): Promise<Order> {
		return prisma.order.create({
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
				orderItems: {
					include: {
						product: true,
					},
				},
			},
		})
	}

	async findById(id: string): Promise<Order | null> {
		return prisma.order.findUnique({
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
				orderItems: {
					include: {
						product: {
							include: {
								category: true,
							},
						},
					},
				},
			},
		})
	}

	async findAll(params: {
		skip?: number
		take?: number
		where?: Prisma.OrderWhereInput
		orderBy?: Prisma.OrderOrderByWithRelationInput
	}): Promise<Order[]> {
		return prisma.order.findMany({
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
				orderItems: {
					include: {
						product: true,
					},
				},
			},
		})
	}

	async count(where?: Prisma.OrderWhereInput): Promise<number> {
		return prisma.order.count({ where })
	}

	async update(id: string, data: Prisma.OrderUpdateInput): Promise<Order> {
		return prisma.order.update({
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
				orderItems: {
					include: {
						product: true,
					},
				},
			},
		})
	}

	async delete(id: string): Promise<Order> {
		return prisma.order.delete({
			where: { id },
		})
	}

	async getUserOrders(
		userId: string,
		params: {
			skip?: number
			take?: number
			status?: OrderStatus
		},
	): Promise<Order[]> {
		const where: Prisma.OrderWhereInput = { userId }
		if (params.status) {
			where.status = params.status
		}

		return prisma.order.findMany({
			where,
			skip: params.skip,
			take: params.take,
			include: {
				orderItems: {
					include: {
						product: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		})
	}

	async countUserOrders(userId: string, status?: OrderStatus): Promise<number> {
		const where: Prisma.OrderWhereInput = { userId }
		if (status) {
			where.status = status
		}
		return prisma.order.count({ where })
	}
}
