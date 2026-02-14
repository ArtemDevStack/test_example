// @ts-nocheck - Temporary until Prisma migration is applied
import { Request, Response, NextFunction, Router } from 'express'
import { CategoriesService } from './categories.service.js'
import { ResponseUtil } from '../../utils/response.util.js'
import { IController } from '../../shared/interfaces/IController.js'
import { IAuthenticatedRequest } from '../../shared/types/express.types.js'

export class CategoriesController implements IController {
	public readonly router: Router

	constructor(private readonly categoriesService: CategoriesService) {
		this.router = Router()
	}

	/**
	 * POST /api/categories - Create category (Admin only)
	 */
	create = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const category = await this.categoriesService.createCategory(req.body)
			ResponseUtil.created(res, category, 'Категория создана')
		} catch (error) {
			next(error)
		}
	}

	/**
	 * GET /api/categories/:id - Get category by ID
	 */
	getById = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
			const category = await this.categoriesService.getCategoryById(id)
			ResponseUtil.success(res, category)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * GET /api/categories/slug/:slug - Get category by slug
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
			const category = await this.categoriesService.getCategoryBySlug(slug)
			ResponseUtil.success(res, category)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * GET /api/categories - Get all categories with pagination
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
			const isActive =
				req.query.isActive === 'true'
					? true
					: req.query.isActive === 'false'
						? false
						: undefined
			const parentId =
				req.query.parentId === 'null' ? null : (req.query.parentId as string)

			const result = await this.categoriesService.getAllCategories({
				page,
				limit,
				search,
				isActive,
				parentId,
			})

			ResponseUtil.paginated(
				res,
				result.categories,
				result.page,
				result.limit,
				result.total,
			)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * GET /api/categories/tree - Get category tree
	 */
	getTree = async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const tree = await this.categoriesService.getCategoryTree()
			ResponseUtil.success(res, tree)
		} catch (error) {
			next(error)
		}
	}

	/**
	 * PATCH /api/categories/:id - Update category (Admin only)
	 */
	update = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
			const category = await this.categoriesService.updateCategory(id, req.body)
			ResponseUtil.success(res, category, 'Категория обновлена')
		} catch (error) {
			next(error)
		}
	}

	/**
	 * DELETE /api/categories/:id - Delete category (Admin only)
	 */
	delete = async (
		req: IAuthenticatedRequest,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
			await this.categoriesService.deleteCategory(id)
			ResponseUtil.success(res, null, 'Категория удалена')
		} catch (error) {
			next(error)
		}
	}
}
