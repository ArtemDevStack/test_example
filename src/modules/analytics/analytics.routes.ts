// @ts-nocheck - Temporary until Prisma migration is applied
import { Router } from 'express'
import { AnalyticsController } from './analytics.controller.js'
import { AnalyticsService } from './analytics.service.js'
import { AnalyticsRepository } from './analytics.repository.js'
import { requireRole } from '../../middlewares/role.middleware.js'
import { Roles as ROLES } from '../../shared/constants/roles.constants.js'

const analyticsRepository = new AnalyticsRepository()
const analyticsService = new AnalyticsService(analyticsRepository)
const analyticsController = new AnalyticsController(analyticsService)

export const analyticsRouter = Router()

// All analytics routes require admin role

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Получить статистику для панели управления (только для администратора)
 *     description: |
 *       Общая статистика: продажи, пользователи, заказы, доход.
 *       
 *       **⚠️ Требуется авторизация как администратор:**
 *       - Email: admin@example.com
 *       - Password: Admin@12345
 *       
 *       **Возвращаемые данные:**
 *       - Общее количество пользователей
 *       - Общее количество активных товаров
 *       - Общее количество заказов
 *       - Общий доход
 *       - Количество ожидающих заказов
 *       - Количество доставленных заказов
 *     tags: [Аналитика]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статистика успешно получена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DashboardStats'
 *       403:
 *         description: Недостаточно прав (требуется роль администратора)
 */
analyticsRouter.get(
	'/dashboard',
	requireRole(ROLES.ADMIN),
	analyticsController.getDashboard,
)

/**
 * @swagger
 * /analytics/sales:
 *   get:
 *     summary: Получить статистику продаж за период (только для администратора)
 *     description: |
 *       Статистика продаж с группировкой по дням, неделям или месяцам.
 *       
 *       **Примеры:**
 *       - За последнюю неделю: `?startDate=2026-02-07&endDate=2026-02-14&groupBy=day`
 *       - За месяц по неделям: `?startDate=2026-01-01&endDate=2026-01-31&groupBy=week`
 *     tags: [Аналитика]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-02-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-02-14"
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *         example: day
 *     responses:
 *       200:
 *         description: Статистика продаж успешно получена
 */
analyticsRouter.get(
	'/sales',
	requireRole(ROLES.ADMIN),
	analyticsController.getSales,
)

/**
 * @swagger
 * /analytics/top-products:
 *   get:
 *     summary: Получить топ продаваемых товаров (только для администратора)
 *     description: "Список самых популярных товаров по количеству продаж. Требуется роль администратора."
 *     tags: [Аналитика]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Топ товаров успешно получен
 */
analyticsRouter.get(
	'/top-products',
	requireRole(ROLES.ADMIN),
	analyticsController.getTopProducts,
)

/**
 * @swagger
 * /analytics/categories:
 *   get:
 *     summary: Получить статистику по категориям (только для администратора)
 *     description: "Аналитика продаж по категориям товаров. Требуется роль администратора."
 *     tags: [Аналитика]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статистика по категориям успешно получена
 */
analyticsRouter.get(
	'/categories',
	requireRole(ROLES.ADMIN),
	analyticsController.getCategoryStats,
)

/**
 * @swagger
 * /analytics/users:
 *   get:
 *     summary: Получить статистику активности пользователей (только для администратора)
 *     description: "Информация о регистрациях и активности пользователей. Требуется роль администратора."
 *     tags: [Аналитика]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статистика активности успешно получена
 */
analyticsRouter.get(
	'/users',
	requireRole(ROLES.ADMIN),
	analyticsController.getUserActivity,
)

/**
 * @swagger
 * /analytics/revenue:
 *   get:
 *     summary: Получить доход по статусам заказов (только для администратора)
 *     description: "Анализ дохода в разрезе статусов заказов. Требуется роль администратора."
 *     tags: [Аналитика]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные о доходе успешно получены
 */
analyticsRouter.get(
	'/revenue',
	requireRole(ROLES.ADMIN),
	analyticsController.getRevenueByStatus,
)

/**
 * @swagger
 * /analytics/report:
 *   get:
 *     summary: Получить полный отчет по аналитике (только для администратора)
 *     description: "Полный отчет со всей статистикой: продажи, товары, пользователи, доход. Требуется роль администратора."
 *     tags: [Аналитика]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Полный отчет успешно получен
 */
analyticsRouter.get(
	'/report',
	requireRole(ROLES.ADMIN),
	analyticsController.getFullReport,
)
