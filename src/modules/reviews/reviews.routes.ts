// @ts-nocheck - Temporary until Prisma migration is applied
import { Router } from 'express'
import { ReviewsController } from './reviews.controller.js'
import { ReviewsService } from './reviews.service.js'
import { ReviewsRepository } from './reviews.repository.js'
import { validateRequest } from '../../middlewares/validation.middleware.js'
import { CreateReviewDto } from './dto/create-review.dto.js'
import { UpdateReviewDto } from './dto/update-review.dto.js'

const reviewsRepository = new ReviewsRepository()
const reviewsService = new ReviewsService(reviewsRepository)
const reviewsController = new ReviewsController(reviewsService)

export const reviewsRouter = Router()

/**
 * @swagger
 * /reviews/my:
 *   get:
 *     summary: Получить мои отзывы
 *     description: Получение списка отзывов текущего авторизованного пользователя
 *     tags: [Отзывы]
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
 *     responses:
 *       200:
 *         description: Отзывы успешно получены
 */
reviewsRouter.get('/my', reviewsController.getMyReviews)

/**
 * @swagger
 * /reviews/product/{productId}:
 *   get:
 *     summary: Получить отзывы о товаре
 *     description: Получение всех отзывов к конкретному товару с возможностью фильтрации по рейтингу
 *     tags: [Отзывы]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *     responses:
 *       200:
 *         description: Отзывы успешно получены
 */
reviewsRouter.get('/product/:productId', reviewsController.getProductReviews)

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Получить отзыв по ID
 *     description: Получение детальной информации об отзыве
 *     tags: [Отзывы]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Отзыв успешно получен
 *       404:
 *         description: Отзыв не найден
 */
reviewsRouter.get('/:id', reviewsController.getById)

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Создать новый отзыв
 *     description: |
 *       Добавление отзыва к товару. Пользователь может оставить отзыв только к купленному товару.
 *       
 *       **Шаги:**
 *       1. Авторизуйтесь как user@example.com
 *       2. Получите ID товара из GET /products
 *       3. Оставьте отзыв на этот товар
 *       
 *       **Доступные товары для отзыва (user@example.com покупал):**
 *       - iPhone 15 Pro (iphone-15-pro)
 *       - Классическая футболка (classic-tshirt)
 *     tags: [Отзывы]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReviewRequest'
 *           example:
 *             productId: "<получите из GET /products>"
 *             rating: 5
 *             comment: Отличный товар, всем рекомендую! Быстрая доставка.
 *     responses:
 *       201:
 *         description: Отзыв успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: Ошибка валидации
 */
reviewsRouter.post(
	'/',
	validateRequest(CreateReviewDto),
	reviewsController.create,
)

/**
 * @swagger
 * /reviews/{id}:
 *   patch:
 *     summary: Обновить отзыв
 *     description: Редактирование своего отзыва. Пользователь может редактировать только свой отзыв.
 *     tags: [Отзывы]
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
 *         description: Отзыв успешно обновлен
 *       404:
 *         description: Отзыв не найден
 */
reviewsRouter.patch(
	'/:id',
	validateRequest(UpdateReviewDto),
	reviewsController.update,
)

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Удалить отзыв
 *     description: Удаление своего отзыва. Пользователь может удалить только свой отзыв.
 *     tags: [Отзывы]
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
 *         description: Отзыв успешно удален
 *       404:
 *         description: Отзыв не найден
 */
reviewsRouter.delete('/:id', reviewsController.delete)
