import { User } from '../../generated/prisma/index.js';
import { UsersRepository } from '../users/users.repository.js';
import { ArgonUtil } from '../../utils/argon.util.js';
import { JwtUtil } from '../../utils/jwt.util.js';
import { BadRequestException, UnauthorizedException } from '../../shared/exceptions/index.js';
import { ErrorMessages } from '../../shared/constants/errors.constants.js';
import { IRegisterData, ILoginCredentials, IAuthTokens } from '../../shared/types/auth.types.js';
import { IUserPayload } from '../../shared/types/express.types.js';

export class AuthService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Регистрация нового пользователя
   */
  async register(data: IRegisterData): Promise<{ user: User; tokens: IAuthTokens }> {
    // Проверка существования пользователя
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

    // Генерация токенов (tokenVersion = 0 по умолчанию)
    const tokens = this.generateTokens(user);

    return {
      user,
      tokens,
    };
  }

  /**
   * Авторизация пользователя
   */
  async login(credentials: ILoginCredentials): Promise<{ user: User; tokens: IAuthTokens }> {
    // Поиск пользователя по email
    const user = await this.usersRepository.findByEmail(credentials.email);
    
    if (!user) {
      throw new UnauthorizedException(ErrorMessages.INVALID_CREDENTIALS);
    }

    // Проверка активности пользователя
    if (!user.isActive) {
      throw new UnauthorizedException('Аккаунт заблокирован');
    }

    // Проверка пароля
    const isPasswordValid = await ArgonUtil.verifyPassword(user.password, credentials.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException(ErrorMessages.INVALID_CREDENTIALS);
    }

    // Инвалидация старых токенов путем инкремента версии
    const updatedUser = await this.usersRepository.update(user.id, {
      tokenVersion: user.tokenVersion + 1,
    });

    // Генерация токенов
    const tokens = this.generateTokens(updatedUser);

    return {
      user,
      tokens,
    };
  }

  /**
   * Генерация JWT токенов
   */
  private generateTokens(user: User): IAuthTokens {
    const payload: IUserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    const accessToken = JwtUtil.generateToken(payload);

    return {
      accessToken,
    };
  }
}
