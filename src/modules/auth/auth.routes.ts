import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsersRepository } from '../users/users.repository.js';
import { validateDto } from '../../middlewares/validation.middleware.js';
import { authenticate } from '../../middlewares/passport.middleware.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

// Dependency Injection
const usersRepository = new UsersRepository();
const authService = new AuthService(usersRepository);
const authController = new AuthController(authService);

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Аутентификация]
 *     summary: Регистрация нового пользователя
 *     description: |
 *       Создание нового аккаунта с получением JWT токена.
 *       
 *       **После регистрации:**
 *       1. Скопируйте полученный token из ответа
 *       2. Нажмите кнопку **Authorize** вверху страницы
 *       3. Вставьте токен и нажмите **Authorize**
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             firstName: Петр
 *             lastName: Петров
 *             middleName: Петрович
 *             dateOfBirth: "1992-05-20"
 *             email: petr@example.com
 *             password: MyPassword@123
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Ошибка валидации данных
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Пользователь с таким email уже существует
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', validateDto(RegisterDto), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Аутентификация]
 *     summary: Авторизация пользователя
 *     description: |
 *       Вход в систему с получением JWT токена.
 *       
 *       **🔑 Тестовые аккаунты:**
 *       
 *       **Администратор:**
 *       ```json
 *       {
 *         "email": "admin@example.com",
 *         "password": "Admin@12345"
 *       }
 *       ```
 *       
 *       **Пользователь:**
 *       ```json
 *       {
 *         "email": "user@example.com",
 *         "password": "User@12345"
 *       }
 *       ```
 *       
 *       **После авторизации:**
 *       1. Скопируйте полученный token
 *       2. Нажмите кнопку **Authorize** вверху
 *       3. Вставьте токен
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             admin:
 *               summary: Вход как администратор
 *               value:
 *                 email: admin@example.com
 *                 password: Admin@12345
 *             user:
 *               summary: Вход как пользователь
 *               value:
 *                 email: user@example.com
 *                 password: User@12345
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Неверные учетные данные
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', validateDto(LoginDto), authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Аутентификация]
 *     summary: Выход из системы
 *     description: Выход из системы с аннулированием токенов
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Выход выполнен успешно
 *       401:
 *         description: Не авторизован
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Аутентификация]
 *     summary: Обновить access token
 *     description: Получение нового access и refresh токенов по refresh токену
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Токены успешно обновлены
 *       401:
 *         description: Невалидный refresh token
 */
router.post('/refresh', authController.refresh);

export { router as authRouter };
