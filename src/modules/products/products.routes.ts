// @ts-nocheck - Temporary until Prisma migration is applied
import { Router } from 'express'
import { ProductsController } from './products.controller.js'
import { ProductsService } from './products.service.js'
import { ProductsRepository } from './products.repository.js'
import { validateDto as validateRequest } from '../../middlewares/validation.middleware.js'
import { authenticate } from '../../middlewares/passport.middleware.js'
import { CreateProductDto } from './dto/create-product.dto.js'
import { UpdateProductDto } from './dto/update-product.dto.js'
import { requireRole } from '../../middlewares/role.middleware.js'
import { Roles as ROLES } from '../../shared/constants/roles.constants.js'

const productsRepository = new ProductsRepository()
const productsService = new ProductsService(productsRepository)
const productsController = new ProductsController(productsService)

export const productsRouter = Router()

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Получить все товары с фильтрацией и пагинацией
 *     description: |
 *       Получение каталога товаров с возможностью фильтрации по цене, категории, наличию и поиску.
 *       
 *       **Примеры фильтров:**
 *       - Поиск iPhone: `?search=iphone`
 *       - Только в наличии: `?inStock=true`
 *       - Цена от 50000 до 100000: `?minPrice=50000&maxPrice=100000`
 *       - Сортировка по убыванию цены: `?sortBy=price&sortOrder=desc`
 *     tags: [Товары]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Количество элементов на странице
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Поиск по названию
 *         example: iPhone
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Фильтр по категории
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         example: 50000
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         example: 150000
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Только товары в наличии
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, createdAt, stock]
 *         example: price
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         example: desc
 *     responses:
 *       200:
 *         description: Товары успешно получены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 */
productsRouter.get('/', productsController.getAll)

/**
 * @swagger
 * /products/slug/{slug}:
 *   get:
 *     summary: Получить товар по slug
 *     description: |
 *       Получение товара по уникальному slug.
 *       
 *       **Доступные товары:**
 *       - `iphone-15-pro`
 *       - `samsung-s24-ultra`
 *       - `macbook-pro-16`
 *       - `dell-xps-15`
 *       - `classic-tshirt`
 *       - `slim-fit-jeans`
 *     tags: [Товары]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: iphone-15-pro
 *     responses:
 *       200:
 *         description: Товар успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
productsRouter.get('/slug/:slug', productsController.getBySlug)

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     description: Получение детальной информации о товаре
 *     tags: [Товары]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Товар успешно получен
 *       404:
 *         description: Товар не найден
 */
productsRouter.get('/:id', productsController.getById)

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Создать новый товар (только для администратора)
 *     description: |
 *       Добавление нового товара в каталог. Требуется роль администратора.
 *       
 *       **Шаги:**
 *       1. Авторизуйтесь как администратор
 *       2. Получите ID категории из GET /categories
 *       3. Создайте товар с этим categoryId
 *     tags: [Товары]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *           example:
 *             name: iPhone 15 Pro Max
 *             slug: iphone-15-pro-max
 *             description: Самый мощный iPhone с титановым корпусом
 *             price: 119999
 *             stock: 30
 *             categoryId: "<получите из GET /categories>"
 *             images:
 *               - https://example.com/iphone15promax-1.jpg
 *               - https://example.com/iphone15promax-2.jpg
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 */
productsRouter.post(
	'/',
	authenticate,
	requireRole(ROLES.ADMIN),
	validateRequest(CreateProductDto),
	productsController.create,
)

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Обновить товар (только для администратора)
 *     description: Обновление информации о товаре. Требуется роль администратора.
 *     tags: [Товары]
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
 *         description: Товар успешно обновлен
 *       404:
 *         description: Товар не найден
 */
productsRouter.patch(
	'/:id',
	authenticate,
	requireRole(ROLES.ADMIN),
	validateRequest(UpdateProductDto),
	productsController.update,
)

/**
 * @swagger
 * /products/{id}/stock:
 *   patch:
 *     summary: Обновить остаток товара (только для администратора)
 *     description: Изменение количества товара на складе. Требуется роль администратора.
 *     tags: [Товары]
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
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Остаток успешно обновлен
 *       404:
 *         description: Товар не найден
 */
productsRouter.patch(
	'/:id/stock',
	authenticate,
	requireRole(ROLES.ADMIN),
	productsController.updateStock,
)

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Удалить товар (только для администратора)
 *     description: Удаление товара из каталога. Требуется роль администратора.
 *     tags: [Товары]
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
 *         description: Товар успешно удален
 *       404:
 *         description: Товар не найден
 */
productsRouter.delete(
	'/:id',
	authenticate,
	requireRole(ROLES.ADMIN),
	productsController.delete,
)
