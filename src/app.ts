import express, { Application } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger.config.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { usersRouter } from './modules/users/users.routes.js'
import { categoriesRouter } from './modules/categories/categories.routes.js'
import { productsRouter } from './modules/products/products.routes.js'
import { ordersRouter } from './modules/orders/orders.routes.js'
import { reviewsRouter } from './modules/reviews/reviews.routes.js'
import { analyticsRouter } from './modules/analytics/analytics.routes.js'
import {
	errorHandler,
	notFoundHandler,
} from './middlewares/error.middleware.js'
import { httpLogger } from './middlewares/logger.middleware.js'
import { authenticate } from './middlewares/passport.middleware.js'
import { logger } from './utils/logger.js'

export class App {
	public app: Application

	constructor() {
		this.app = express()
		this.initializeMiddlewares()
		this.initializeRoutes()
		this.initializeErrorHandling()
	}

	/**
	 * Инициализация глобальных middlewares
	 */
	private initializeMiddlewares(): void {
		// Security
		this.app.use(helmet())
		this.app.use(cors())

		// Rate limiting
		const limiter = rateLimit({
			windowMs: 20 * 1000, // 20 секунд
			max: 100, // 100 requests per window
			message: 'Слишком много запросов с этого IP, попробуйте позже',
		})
		this.app.use('/api/', limiter)

		// Auth rate limiting (более строгий)
		const authLimiter = rateLimit({
			windowMs: 20 * 1000,
			max: 5, // 5 попыток авторизации
			message: 'Слишком много попыток входа, попробуйте позже',
		})
		this.app.use('/api/auth/login', authLimiter)

		// Body parsing
		this.app.use(express.json())
		this.app.use(express.urlencoded({ extended: true }))
		this.app.use(cookieParser())

		// HTTP logging
		this.app.use(httpLogger)

		// Passport
		this.app.use(passport.initialize())

		logger.info('Middlewares initialized')
	}

	/**
	 * Инициализация роутов
	 */
	private initializeRoutes(): void {
		// Health check
		this.app.get('/health', (req, res) => {
			res.json({ status: 'ok', timestamp: new Date().toISOString() })
		})

		// Swagger documentation
		this.app.use('/api-docs', swaggerUi.serve)

		this.app.get('/api-docs', (req, res, next) => {
			swaggerUi.setup(swaggerSpec, {
				explorer: true,
				customCss: '.swagger-ui .topbar { display: none }',
				customSiteTitle: 'E-Commerce API',
			})(req, res, next)
		})

		// Swagger JSON
		this.app.get('/api-docs.json', (req, res) => {
			res.setHeader('Content-Type', 'application/json')
			res.send(swaggerSpec)
		})

		// API routes
		this.app.use('/api/auth', authRouter)
		this.app.use('/api/users', authenticate, usersRouter)
		this.app.use('/api/categories', categoriesRouter)
		this.app.use('/api/products', productsRouter)
		this.app.use('/api/orders', authenticate, ordersRouter)
		this.app.use('/api/reviews', authenticate, reviewsRouter)
		this.app.use('/api/analytics', authenticate, analyticsRouter)

		logger.info('Routes initialized')
	}

	/**
	 * Инициализация обработки ошибок
	 */
	private initializeErrorHandling(): void {
		// 404 handler
		this.app.use(notFoundHandler)

		// Global error handler
		this.app.use(errorHandler)

		logger.info('Error handling initialized')
	}

	/**
	 * Получение Express приложения
	 */
	public getApp(): Application {
		return this.app
	}
}
