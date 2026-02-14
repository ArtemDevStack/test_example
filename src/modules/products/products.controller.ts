// @ts-nocheck - Temporary until Prisma migration is applied
import { Request, Response, NextFunction, Router } from 'express'
import { ProductsService } from './products.service.js'
import { ResponseUtil } from '../../utils/response.util.js'
import { IController } from '../../shared/interfaces/IController.js'
import { IAuthenticatedRequest } from '../../shared/types/express.types.js'

export class ProductsController implements IController {
	public readonly router: Router

	constructor(private readonly productsService: ProductsService) {
		this.router = Router()
	}

	/**
	 * POST /api/products - Create product (Admin only)
	 */
	create = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const product = await this.productsService.createProduct(req.body)
			ResponseUtil.created(res, product, 'Товар создан')
		} catch (error) {
			next(error)
		}
	}

	/**
	 * GET /api/products/:id - Get product by ID
	 */
	getById = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
			const product = await this.productsService.getProductById(id)
			ResponseUtil.success(res, product)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * GET /api/products/slug/:slug - Get product by slug
	 */
	getBySlug = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const slug = Array.isArray(req.params.slug)
				? req.params.slug[0]
				: req.params.slug
			const product = await this.productsService.getProductBySlug(slug)
			ResponseUtil.success(res, product)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * GET /api/products - Get all products with filtering, sorting, pagination
	 */
	getAll = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const page = parseInt(req.query.page as string) || 1
			const limit = parseInt(req.query.limit as string) || 20
			const search = req.query.search as string
			const categoryId = req.query.categoryId as string
			const minPrice = req.query.minPrice
				? parseFloat(req.query.minPrice as string)
				: undefined
			const maxPrice = req.query.maxPrice
				? parseFloat(req.query.maxPrice as string)
				: undefined
			const isActive =
				req.query.isActive === 'true'
					? true
					: req.query.isActive === 'false'
						? false
						: undefined
			const inStock = req.query.inStock === 'true'
			const sortBy = req.query.sortBy as
				| 'name'
				| 'price'
				| 'createdAt'
				| 'stock'
				| undefined
			const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined

			const result = await this.productsService.getAllProducts({
				page,
				limit,
				search,
				categoryId,
				minPrice,
				maxPrice,
				isActive,
				inStock,
				sortBy,
				sortOrder,
			})

			ResponseUtil.paginated(
				res,
				result.products,
				result.page,
				result.limit,
				result.total,
			)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * PATCH /api/products/:id - Update product (Admin only)
	 */
	update = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
			const product = await this.productsService.updateProduct(id, req.body)
			ResponseUtil.success(res, product, 'Товар обновлен')
		} catch (error) {
			next(error)
		}
	}

	/**
	 * DELETE /api/products/:id - Delete product (Admin only)
	 */
	delete = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
			await this.productsService.deleteProduct(id)
			ResponseUtil.success(res, null, 'Товар удален')
		} catch (error) {
			next(error)
		}
	}

	/**
	 * PATCH /api/products/:id/stock - Update product stock (Admin only)
	 */
	updateStock = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
			const { quantity } = req.body
			const product = await this.productsService.updateStock(id, quantity)
			ResponseUtil.success(res, product, 'Остаток обновлен')
		} catch (error) {
			next(error)
		}
	}
}
