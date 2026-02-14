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

export class UpdateProductDto {
	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(200)
	name?: string

	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(200)
	slug?: string

	@IsOptional()
	@IsString()
	@MaxLength(2000)
	description?: string

	@IsOptional()
	@IsNumber()
	@Min(0)
	price?: number

	@IsOptional()
	@IsNumber()
	@Min(0)
	stock?: number

	@IsOptional()
	@IsString()
	categoryId?: string

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	images?: string[]

	@IsOptional()
	@IsBoolean()
	isActive?: boolean
}
