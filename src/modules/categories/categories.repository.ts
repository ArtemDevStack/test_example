// @ts-nocheck - Temporary until Prisma migration is applied
import { prisma } from '../../database/prisma.client.js'

export class CategoriesRepository {
	async create(data: Prisma.CategoryCreateInput): Promise<Category> {
		return prisma.category.create({
			data,
			include: {
				parent: true,
				children: true,
				_count: {
					select: { products: true },
				},
			},
		})
	}

	async findById(id: string): Promise<Category | null> {
		return prisma.category.findUnique({
			where: { id },
			include: {
				parent: true,
				children: true,
				_count: {
					select: { products: true },
				},
			},
		})
	}

	async findBySlug(slug: string): Promise<Category | null> {
		return prisma.category.findUnique({
			where: { slug },
			include: {
				parent: true,
				children: true,
				_count: {
					select: { products: true },
				},
			},
		})
	}

	async findAll(params: {
		skip?: number
		take?: number
		where?: Prisma.CategoryWhereInput
		orderBy?: Prisma.CategoryOrderByWithRelationInput
	}): Promise<Category[]> {
		return prisma.category.findMany({
			...params,
			include: {
				parent: true,
				children: true,
				_count: {
					select: { products: true },
				},
			},
		})
	}

	async count(where?: Prisma.CategoryWhereInput): Promise<number> {
		return prisma.category.count({ where })
	}

	async update(
		id: string,
		data: Prisma.CategoryUpdateInput,
	): Promise<Category> {
		return prisma.category.update({
			where: { id },
			data,
			include: {
				parent: true,
				children: true,
				_count: {
					select: { products: true },
				},
			},
		})
	}

	async delete(id: string): Promise<Category> {
		return prisma.category.delete({
			where: { id },
		})
	}

	async findRootCategories(): Promise<Category[]> {
		return prisma.category.findMany({
			where: { parentId: null },
			include: {
				children: true,
				_count: {
					select: { products: true },
				},
			},
			orderBy: { name: 'asc' },
		})
	}

	async getCategoryTree(): Promise<Category[]> {
		return prisma.category.findMany({
			where: { parentId: null },
			include: {
				children: {
					include: {
						children: true,
						_count: { select: { products: true } },
					},
				},
				_count: { select: { products: true } },
			},
			orderBy: { name: 'asc' },
		})
	}
}
