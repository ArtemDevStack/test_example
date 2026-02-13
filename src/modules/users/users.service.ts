import { User } from '../../generated/prisma/index.js';
import { UsersRepository } from './users.repository.js';
import { ICreateUserData, IUpdateUserData } from './interfaces/user.interfaces.js';
import { ArgonUtil } from '../../utils/argon.util.js';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '../../shared/exceptions/index.js';
import { ErrorMessages } from '../../shared/constants/errors.constants.js';
import { IUserPayload } from '../../shared/types/express.types.js';
import { Roles } from '../../shared/constants/roles.constants.js';

export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Получение пользователя по ID с проверкой прав доступа
   */
  async getUserById(id: string, requestingUser: IUserPayload): Promise<User> {
    // Проверка прав: админ или сам пользователь
    if (requestingUser.role !== Roles.ADMIN && requestingUser.id !== id) {
      throw new ForbiddenException(ErrorMessages.FORBIDDEN);
    }

    const user = await this.usersRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    return user;
  }

  /**
   * Получение списка всех пользователей (только для админа)
   */
  async getAllUsers(
    page = 1,
    limit = 10,
    requestingUser: IUserPayload
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    // Только админ может получить список всех пользователей
    if (requestingUser.role !== Roles.ADMIN) {
      throw new ForbiddenException(ErrorMessages.ADMIN_ONLY);
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.usersRepository.findAll(skip, limit),
      this.usersRepository.count(),
    ]);

    return {
      users,
      total,
      page,
      limit,
    };
  }

  /**
   * Создание нового пользователя
   */
  async createUser(data: ICreateUserData): Promise<User> {
    // Проверка существования email
    const existingUser = await this.usersRepository.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException(ErrorMessages.EMAIL_ALREADY_EXISTS);
    }

    // Хеширование пароля
    const hashedPassword = await ArgonUtil.hashPassword(data.password);

    // Создание пользователя
    const user = await this.usersRepository.create({
      ...data,
      password: hashedPassword,
    });

    return user;
  }

  /**
   * Обновление данных пользователя
   */
  async updateUser(
    id: string,
    data: IUpdateUserData,
    requestingUser: IUserPayload
  ): Promise<User> {
    // Проверка прав: админ или сам пользователь
    if (requestingUser.role !== Roles.ADMIN && requestingUser.id !== id) {
      throw new ForbiddenException(ErrorMessages.FORBIDDEN);
    }

    // Проверка существования пользователя
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    // Если обновляется email, проверить уникальность
    if (data.email && data.email !== user.email) {
      const existingUser = await this.usersRepository.findByEmail(data.email);
      if (existingUser) {
        throw new BadRequestException(ErrorMessages.EMAIL_ALREADY_EXISTS);
      }
    }

    return this.usersRepository.update(id, data);
  }

  /**
   * Блокировка/разблокировка пользователя
   */
  async toggleUserActiveStatus(
    id: string,
    requestingUser: IUserPayload
  ): Promise<User> {
    // Проверка прав: админ или сам пользователь
    if (requestingUser.role !== Roles.ADMIN && requestingUser.id !== id) {
      throw new ForbiddenException(ErrorMessages.FORBIDDEN);
    }

    // Проверка существования пользователя
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    // Переключение статуса
    const newStatus = !user.isActive;

    return this.usersRepository.updateActiveStatus(id, newStatus);
  }

  /**
   * Удаление пользователя
   */
  async deleteUser(id: string, requestingUser: IUserPayload): Promise<void> {
    // Только админ может удалять пользователей
    if (requestingUser.role !== Roles.ADMIN) {
      throw new ForbiddenException(ErrorMessages.ADMIN_ONLY);
    }

    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    await this.usersRepository.delete(id);
  }
}
