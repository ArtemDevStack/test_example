// @ts-nocheck - Temporary until Prisma migration is applied
import { CategoriesRepository } from './categories.repository.js'
import { NotFoundException } from '../../shared/exceptions/NotFoundException.js'
import { BadRequestException } from '../../shared/exceptions/BadRequestException.js'

export class CategoriesService {
	constructor(private readonly categoriesRepository: CategoriesRepository) {}

	async createCategory(data: {
		name: string
		slug: string
		description?: string
		parentId?: string
		isActive?: boolean
	}): Promise<Category> {
		// Check if slug already exists
		const existing = await this.categoriesRepository.findBySlug(data.slug)
		if (existing) {
			throw new BadRequestException('Категория с таким slug уже существует')
		}

		// If parentId provided, check if parent exists
		if (data.parentId) {
			const parent = await this.categoriesRepository.findById(data.parentId)
			if (!parent) {
				throw new NotFoundException('Родительская категория не найдена')
			}
		}

		return this.categoriesRepository.create({
			name: data.name,
			slug: data.slug,
			description: data.description,
			isActive: data.isActive ?? true,
			parent: data.parentId ? { connect: { id: data.parentId } } : undefined,
		})
	}

	async getCategoryById(id: string): Promise<Category> {
		const category = await this.categoriesRepository.findById(id)
		if (!category) {
			throw new NotFoundException('Категория не найдена')
		}
		return category
	}

	async getCategoryBySlug(slug: string): Promise<Category> {
		const category = await this.categoriesRepository.findBySlug(slug)
		if (!category) {
			throw new NotFoundException('Категория не найдена')
		}
		return category
	}

	async getAllCategories(params: {
		page?: number
		limit?: number
		search?: string
		isActive?: boolean
		parentId?: string | null
	}): Promise<{
		categories: Category[]
		total: number
		page: number
		limit: number
	}> {
		const page = params.page || 1
		const limit = params.limit || 20
		const skip = (page - 1) * limit

		const where: Prisma.CategoryWhereInput = {}

		if (params.search) {
			where.OR = [
				{ name: { contains: params.search, mode: 'insensitive' } },
				{ slug: { contains: params.search, mode: 'insensitive' } },
				{ description: { contains: params.search, mode: 'insensitive' } },
			]
		}

		if (params.isActive !== undefined) {
			where.isActive = params.isActive
		}

		if (params.parentId !== undefined) {
			where.parentId = params.parentId === null ? null : params.parentId
		}

		const [categories, total] = await Promise.all([
			this.categoriesRepository.findAll({
				skip,
				take: limit,
				where,
				orderBy: { name: 'asc' },
			}),
			this.categoriesRepository.count(where),
		])

		return { categories, total, page, limit }
	}

	async getCategoryTree(): Promise<Category[]> {
		return this.categoriesRepository.getCategoryTree()
	}

	async updateCategory(
		id: string,
		data: {
			name?: string
			slug?: string
			description?: string
			parentId?: string
			isActive?: boolean
		},
	): Promise<Category> {
		const category = await this.categoriesRepository.findById(id)
		if (!category) {
			throw new NotFoundException('Категория не найдена')
		}

		// Check slug uniqueness if updating
		if (data.slug && data.slug !== category.slug) {
			const existing = await this.categoriesRepository.findBySlug(data.slug)
			if (existing) {
				throw new BadRequestException('Категория с таким slug уже существует')
			}
		}

		// Prevent circular reference
		if (data.parentId) {
			if (data.parentId === id) {
				throw new BadRequestException(
					'Категория не может быть родителем самой себе',
				)
			}
			const parent = await this.categoriesRepository.findById(data.parentId)
			if (!parent) {
				throw new NotFoundException('Родительская категория не найдена')
			}
		}

		const updateData: Prisma.CategoryUpdateInput = {
			name: data.name,
			slug: data.slug,
			description: data.description,
			isActive: data.isActive,
		}

		if (data.parentId !== undefined) {
			updateData.parent = data.parentId
				? { connect: { id: data.parentId } }
				: { disconnect: true }
		}

		return this.categoriesRepository.update(id, updateData)
	}

	async deleteCategory(id: string): Promise<void> {
		const category = await this.categoriesRepository.findById(id)
		if (!category) {
			throw new NotFoundException('Категория не найдена')
		}

		// Check if category has products
		const categoryWithCount = await this.categoriesRepository.findById(id)
		if (categoryWithCount && (categoryWithCount as any)._count.products > 0) {
			throw new BadRequestException('Невозможно удалить категорию с товарами')
		}

		// Check if category has children
		if (category.children && category.children.length > 0) {
			throw new BadRequestException(
				'Невозможно удалить категорию с подкатегориями',
			)
		}

		await this.categoriesRepository.delete(id)
	}
}
