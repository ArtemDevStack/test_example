// @ts-nocheck - Temporary until Prisma migration is applied
import {
	AnalyticsRepository,
	DashboardStats,
	SalesStats,
	TopProduct,
	CategoryStats,
} from './analytics.repository.js'

export class AnalyticsService {
	constructor(private readonly analyticsRepository: AnalyticsRepository) {}

	async getDashboardStats(): Promise<DashboardStats> {
		return this.analyticsRepository.getDashboardStats()
	}

	async getSalesByPeriod(params: {
		startDate?: Date
		endDate?: Date
		groupBy?: 'day' | 'week' | 'month'
	}): Promise<SalesStats[]> {
		const endDate = params.endDate || new Date()
		const startDate =
			params.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
		const groupBy = params.groupBy || 'day'

		return this.analyticsRepository.getSalesByPeriod(
			startDate,
			endDate,
			groupBy,
		)
	}

	async getTopProducts(limit?: number): Promise<TopProduct[]> {
		return this.analyticsRepository.getTopProducts(limit || 10)
	}

	async getCategoryStats(): Promise<CategoryStats[]> {
		return this.analyticsRepository.getCategoryStats()
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
		return this.analyticsRepository.getUserActivityStats()
	}

	async getRevenueByStatus(): Promise<
		Array<{
			status: string
			count: number
			revenue: number
		}>
	> {
		return this.analyticsRepository.getRevenueByStatus()
	}

	async getFullReport(): Promise<{
		dashboard: DashboardStats
		topProducts: TopProduct[]
		categoryStats: CategoryStats[]
		revenueByStatus: Array<{ status: string; count: number; revenue: number }>
	}> {
		const [dashboard, topProducts, categoryStats, revenueByStatus] =
			await Promise.all([
				this.getDashboardStats(),
				this.getTopProducts(5),
				this.getCategoryStats(),
				this.getRevenueByStatus(),
			])

		return {
			dashboard,
			topProducts,
			categoryStats,
			revenueByStatus,
		}
	}
}
