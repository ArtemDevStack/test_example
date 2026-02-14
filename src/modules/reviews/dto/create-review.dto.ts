import {
	IsString,
	IsNumber,
	IsOptional,
	Min,
	Max,
	MaxLength,
} from 'class-validator'

export class CreateReviewDto {
	@IsString()
	productId!: string

	@IsNumber()
	@Min(1)
	@Max(5)
	rating!: number

	@IsOptional()
	@IsString()
	@MaxLength(1000)
	comment?: string
}
