import { User, Role } from '../../../generated/prisma/index.js';

export interface IUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  dateOfBirth: Date;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUserData {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  email: string;
  password: string;
  role?: Role;
}

export interface IUpdateUserData {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: Date;
  email?: string;
  isActive?: boolean;
  tokenVersion?: number;
}

export interface IUsersRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(skip?: number, take?: number): Promise<User[]>;
  count(): Promise<number>;
  create(data: ICreateUserData): Promise<User>;
  update(id: string, data: IUpdateUserData): Promise<User>;
  updateActiveStatus(id: string, isActive: boolean): Promise<User>;
  delete(id: string): Promise<void>;
}

// Re-export User type as IUser for compatibility
export type IUser = User;
