// @ts-nocheck - Temporary until Prisma migration is applied
import { Router } from 'express'
import { CategoriesController } from './categories.controller.js'
import { CategoriesService } from './categories.service.js'
import { CategoriesRepository } from './categories.repository.js'
import { validateDto as validateRequest } from '../../middlewares/validation.middleware.js'
import { authenticate } from '../../middlewares/passport.middleware.js'
import { CreateCategoryDto } from './dto/create-category.dto.js'
import { UpdateCategoryDto } from './dto/update-category.dto.js'
import { requireRole } from '../../middlewares/role.middleware.js'
import { Roles as ROLES } from '../../shared/constants/roles.constants.js'

const categoriesRepository = new CategoriesRepository()
const categoriesService = new CategoriesService(categoriesRepository)
const categoriesController = new CategoriesController(categoriesService)

export const categoriesRouter = Router()

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Получить все категории с пагинацией
 *     description: |
 *       Получение списка всех категорий с фильтрацией и пагинацией.
 *       
 *       **Доступные категории:**
 *       - Электроника (electronics)
 *         - Смартфоны (smartphones)
 *         - Ноутбуки (laptops)
 *       - Одежда (clothing)
 *         - Мужская одежда (men-clothing)
 *     tags: [Категории]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         example: электроника
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *         description: Получить подкатегории конкретной категории
 *     responses:
 *       200:
 *         description: Категории успешно получены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 */
categoriesRouter.get('/', categoriesController.getAll)

/**
 * @swagger
 * /categories/tree:
 *   get:
 *     summary: Получить дерево категорий
 *     description: |
 *       Получение иерархической структуры всех категорий.
 *       Удобно для построения меню навигации.
 *     tags: [Категории]
 *     responses:
 *       200:
 *         description: Дерево категорий успешно получено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 */
categoriesRouter.get('/tree', categoriesController.getTree)

/**
 * @swagger
 * /categories/slug/{slug}:
 *   get:
 *     summary: Получить категорию по slug
 *     description: |
 *       Получение категории по уникальному slug.
 *       
 *       **Доступные категории:**
 *       - `electronics` - Электроника
 *       - `smartphones` - Смартфоны
 *       - `laptops` - Ноутбуки
 *       - `clothing` - Одежда
 *       - `men-clothing` - Мужская одежда
 *     tags: [Категории]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: electronics
 *     responses:
 *       200:
 *         description: Категория успешно получена
 *       404:
 *         description: Категория не найдена
 */
categoriesRouter.get('/slug/:slug', categoriesController.getBySlug)

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Получить категорию по ID
 *     description: Получение категории по уникальному идентификатору
 *     tags: [Категории]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Категория успешно получена
 *       404:
 *         description: Категория не найдена
 */
categoriesRouter.get('/:id', categoriesController.getById)

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Создать новую категорию (только для администратора)
 *     description: Создание новой категории товаров. Требуется роль администратора.
 *     tags: [Категории]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               parentId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Категория успешно создана
 *       400:
 *         description: Ошибка валидации данных
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 */
categoriesRouter.post(
	'/',
	authenticate,
	requireRole(ROLES.ADMIN),
	validateRequest(CreateCategoryDto),
	categoriesController.create,
)

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Обновить категорию (только для администратора)
 *     description: Обновление существующей категории. Требуется роль администратора.
 *     tags: [Категории]
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
 *     responses:
 *       200:
 *         description: Категория успешно обновлена
 *       404:
 *         description: Категория не найдена
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 */
categoriesRouter.patch(
	'/:id',
	authenticate,
	requireRole(ROLES.ADMIN),
	validateRequest(UpdateCategoryDto),
	categoriesController.update,
)

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Удалить категорию (только для администратора)
 *     description: Удаление категории. Требуется роль администратора.
 *     tags: [Категории]
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
 *         description: Категория успешно удалена
 *       404:
 *         description: Категория не найдена
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Недостаточно прав
 */
categoriesRouter.delete(
	'/:id',
	authenticate,
	requireRole(ROLES.ADMIN),
	categoriesController.delete,
)
