import { Router, RequestHandler } from 'express';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { UsersRepository } from './users.repository.js';

// Dependency Injection
const usersRepository = new UsersRepository();
const usersService = new UsersService(usersRepository);
const usersController = new UsersController(usersService);

const router = Router();

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Пользователи]
 *     summary: Получение пользователя по ID
 *     description: Администратор может получить любого пользователя, обычный пользователь - только свои данные
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
 *         description: Данные пользователя
 *       401:
 *         description: Требуется авторизация
 *       403:
 *         description: Нет прав доступа
 *       404:
 *         description: Пользователь не найден
 */
router.get('/:id', usersController.getById as RequestHandler);

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Пользователи]
 *     summary: Получение списка пользователей (только админ)
 *     description: Получение списка всех пользователей с пагинацией
 *     security:
 *       - bearerAuth: []
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
 *           default: 10
 *     responses:
 *       200:
 *         description: Список пользователей
 *       401:
 *         description: Требуется авторизация
 *       403:
 *         description: Доступ только для администраторов
 */
router.get('/', usersController.getAll as RequestHandler);

/**
 * @swagger
 * /users/{id}/block:
 *   patch:
 *     tags: [Пользователи]
 *     summary: Блокировка/разблокировка пользователя
 *     description: Изменение статуса активности пользователя (только для администратора)
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
 *         description: Статус пользователя изменен
 *       401:
 *         description: Требуется авторизация
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Пользователь не найден
 */
router.patch('/:id/block', usersController.toggleActiveStatus as RequestHandler);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Пользователи]
 *     summary: Удаление пользователя (только админ)
 *     description: Удаление пользователя из системы
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
 *         description: Пользователь успешно удален
 *       401:
 *         description: Требуется авторизация
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Пользователь не найден
 */
router.delete('/:id', usersController.delete as RequestHandler);

export { router as usersRouter };
