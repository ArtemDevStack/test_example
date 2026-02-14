import {
	IsString,
	IsNumber,
	IsOptional,
	IsBoolean,
	IsArray,
	Min,
	MaxLength,
	MinLength,
} from 'class-validator'

export class CreateProductDto {
	@IsString()
	@MinLength(2)
	@MaxLength(200)
	name!: string

	@IsString()
	@MinLength(2)
	@MaxLength(200)
	slug!: string

	@IsOptional()
	@IsString()
	@MaxLength(2000)
	description?: string

	@IsNumber()
	@Min(0)
	price!: number

	@IsNumber()
	@Min(0)
	stock!: number

	@IsString()
	categoryId!: string

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	images?: string[]

	@IsOptional()
	@IsBoolean()
	isActive?: boolean
}
