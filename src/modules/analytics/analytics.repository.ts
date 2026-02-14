// @ts-nocheck - Temporary until Prisma migration is applied
import { prisma } from '../../database/prisma.client.js'
import { OrderStatus } from '../../generated/prisma/index.js'

export interface DashboardStats {
	totalUsers: number
	totalProducts: number
	totalOrders: number
	totalRevenue: number
	pendingOrders: number
	completedOrders: number
}

export interface SalesStats {
	period: string
	totalSales: number
	orderCount: number
	averageOrderValue: number
}

export interface TopProduct {
	id: string
	name: string
	slug: string
	totalSold: number
	revenue: number
}

export interface CategoryStats {
	id: string
	name: string
	productCount: number
	totalRevenue: number
}

export class AnalyticsRepository {
	async getDashboardStats(): Promise<DashboardStats> {
		const [
			totalUsers,
			totalProducts,
			totalOrders,
			ordersAgg,
			pendingOrders,
			completedOrders,
		] = await Promise.all([
			prisma.user.count(),
			prisma.product.count({ where: { isActive: true } }),
			prisma.order.count(),
			prisma.order.aggregate({
				_sum: { totalPrice: true },
			}),
			prisma.order.count({ where: { status: OrderStatus.PENDING } }),
			prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
		])

		return {
			totalUsers,
			totalProducts,
			totalOrders,
			totalRevenue: parseFloat(ordersAgg._sum.totalPrice?.toString() || '0'),
			pendingOrders,
			completedOrders,
		}
	}

	async getSalesByPeriod(
		startDate: Date,
		endDate: Date,
		groupBy: 'day' | 'week' | 'month',
	): Promise<SalesStats[]> {
		// SQL запрос для группировки по периодам
		let dateFormat: string
		switch (groupBy) {
			case 'day':
				dateFormat = 'YYYY-MM-DD'
				break
			case 'week':
				dateFormat = 'YYYY-"W"IW'
				break
			case 'month':
				dateFormat = 'YYYY-MM'
				break
		}

		const result = await prisma.$queryRaw<
			Array<{
				period: string
				total_sales: Decimal
				order_count: bigint
			}>
		>`
      SELECT 
        TO_CHAR("created_at", ${dateFormat}) as period,
        SUM("total_price") as total_sales,
        COUNT(*) as order_count
      FROM orders
      WHERE "created_at" >= ${startDate}
        AND "created_at" <= ${endDate}
        AND status IN ('DELIVERED', 'SHIPPED')
      GROUP BY period
      ORDER BY period ASC
    `

		return result.map(row => ({
			period: row.period,
			totalSales: parseFloat(row.total_sales.toString()),
			orderCount: Number(row.order_count),
			averageOrderValue:
				parseFloat(row.total_sales.toString()) / Number(row.order_count),
		}))
	}

	async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
		const result = await prisma.$queryRaw<
			Array<{
				id: string
				name: string
				slug: string
				total_sold: bigint
				revenue: Decimal
			}>
		>`
      SELECT 
        p.id,
        p.name,
        p.slug,
        SUM(oi.quantity) as total_sold,
        SUM(oi.price * oi.quantity) as revenue
      FROM products p
      INNER JOIN order_items oi ON p.id = oi.product_id
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE o.status IN ('DELIVERED', 'SHIPPED')
      GROUP BY p.id, p.name, p.slug
      ORDER BY revenue DESC
      LIMIT ${limit}
    `

		return result.map(row => ({
			id: row.id,
			name: row.name,
			slug: row.slug,
			totalSold: Number(row.total_sold),
			revenue: parseFloat(row.revenue.toString()),
		}))
	}

	async getCategoryStats(): Promise<CategoryStats[]> {
		const result = await prisma.$queryRaw<
			Array<{
				id: string
				name: string
				product_count: bigint
				total_revenue: Decimal | null
			}>
		>`
      SELECT 
        c.id,
        c.name,
        COUNT(DISTINCT p.id) as product_count,
        COALESCE(SUM(oi.price * oi.quantity), 0) as total_revenue
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('DELIVERED', 'SHIPPED')
      GROUP BY c.id, c.name
      ORDER BY total_revenue DESC
    `

		return result.map(row => ({
			id: row.id,
			name: row.name,
			productCount: Number(row.product_count),
			totalRevenue: parseFloat(row.total_revenue?.toString() || '0'),
		}))
	}

	async getUserActivityStats(): Promise<
		Array<{
			userId: string
			userName: string
			orderCount: number
			totalSpent: number
			averageOrderValue: number
		}>
	> {
		const result = await prisma.$queryRaw<
			Array<{
				user_id: string
				user_name: string
				order_count: bigint
				total_spent: Decimal
			}>
		>`
      SELECT 
        u.id as user_id,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        COUNT(o.id) as order_count,
        COALESCE(SUM(o.total_price), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role != 'ADMIN'
      GROUP BY u.id, user_name
      HAVING COUNT(o.id) > 0
      ORDER BY total_spent DESC
      LIMIT 20
    `

		return result.map(row => ({
			userId: row.user_id,
			userName: row.user_name,
			orderCount: Number(row.order_count),
			totalSpent: parseFloat(row.total_spent.toString()),
			averageOrderValue:
				parseFloat(row.total_spent.toString()) / Number(row.order_count),
		}))
	}

	async getRevenueByStatus(): Promise<
		Array<{
			status: string
			count: number
			revenue: number
		}>
	> {
		const result = await prisma.order.groupBy({
			by: ['status'],
			_count: { id: true },
			_sum: { totalPrice: true },
		})

		return result.map(row => ({
			status: row.status,
			count: row._count.id,
			revenue: parseFloat(row._sum.totalPrice?.toString() || '0'),
		}))
	}
}
