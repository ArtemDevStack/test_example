// @ts-nocheck - Temporary until Prisma migration is applied
import { Router } from 'express'
import { OrdersController } from './orders.controller.js'
import { OrdersService } from './orders.service.js'
import { OrdersRepository } from './orders.repository.js'
import { validateRequest } from '../../middlewares/validation.middleware.js'
import { CreateOrderDto } from './dto/create-order.dto.js'
import { UpdateOrderDto } from './dto/update-order.dto.js'
import { requireRole } from '../../middlewares/role.middleware.js'
import { ROLES } from '../../shared/constants/roles.constants.js'

const ordersRepository = new OrdersRepository()
const ordersService = new OrdersService(ordersRepository)
const ordersController = new OrdersController(ordersService)

export const ordersRouter = Router()

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Получить все заказы (Администратор видит все, Пользователь только свои)
 *     description: Администраторы видят все заказы с возможностью фильтрации, пользователи только свои заказы
 *     tags: [Заказы]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Заказы успешно получены
 */
ordersRouter.get('/', ordersController.getAll)

/**
 * @swagger
 * /orders/my:
 *   get:
 *     summary: Получить мои заказы
 *     description: Получение списка заказов текущего авторизованного пользователя
 *     tags: [Заказы]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Заказы успешно получены
 */
ordersRouter.get('/my', ordersController.getMyOrders)

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Получить заказ по ID
 *     description: Получение детальной информации о заказе. Пользователи могут видеть только свои заказы.
 *     tags: [Заказы]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Заказ успешно получен
 *       404:
 *         description: Заказ не найден
 */
ordersRouter.get('/:id', ordersController.getById)

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Создать новый заказ
 *     description: |
 *       Оформление нового заказа для авторизованного пользователя.
 *       
 *       **Шаги:**
 *       1. Авторизуйтесь как user@example.com
 *       2. Получите ID товаров из GET /products
 *       3. Создайте заказ с этими productId
 *       
 *       **Пример заказа:**
 *       - iPhone 15 Pro (1 шт)
 *       - Samsung Galaxy S24 Ultra (1 шт)
 *     tags: [Заказы]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *           example:
 *             items:
 *               - productId: "<получите из GET /products>"
 *                 quantity: 1
 *               - productId: "<получите из GET /products>"
 *                 quantity: 2
 *     responses:
 *       201:
 *         description: Заказ успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Ошибка валидации
 */
ordersRouter.post('/', validateRequest(CreateOrderDto), ordersController.create)

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Обновить статус заказа (только для администратора)
 *     description: Изменение статуса заказа. Требуется роль администратора.
 *     tags: [Заказы]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Статус заказа успешно обновлен
 *       404:
 *         description: Заказ не найден
 */
ordersRouter.patch(
	'/:id/status',
	requireRole(ROLES.ADMIN),
	validateRequest(UpdateOrderDto),
	ordersController.updateStatus,
)

/**
 * @swagger
 * /orders/{id}/cancel:
 *   post:
 *     summary: Отменить заказ
 *     description: Отмена заказа пользователем или администратором
 *     tags: [Заказы]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Заказ успешно отменен
 *       404:
 *         description: Заказ не найден
 */
ordersRouter.post('/:id/cancel', ordersController.cancel)
