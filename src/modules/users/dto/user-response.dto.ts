import { Exclude } from 'class-transformer';
import { Role } from '../../../generated/prisma/index.js';

export class UserResponseDto {
  id!: string;
  firstName!: string;
  lastName!: string;
  middleName?: string | null;
  dateOfBirth!: Date;
  email!: string;
  role!: Role;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  @Exclude()
  password!: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
