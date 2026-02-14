import { IsString, IsEnum, IsOptional } from 'class-validator'

export enum OrderStatus {
	PENDING = 'PENDING',
	PROCESSING = 'PROCESSING',
	SHIPPED = 'SHIPPED',
	DELIVERED = 'DELIVERED',
	CANCELLED = 'CANCELLED',
}

export class UpdateOrderDto {
	@IsOptional()
	@IsEnum(OrderStatus)
	status?: OrderStatus

	@IsOptional()
	@IsString()
	notes?: string
}
