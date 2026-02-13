import { Request, Response, NextFunction, Router } from 'express';
import { AuthService } from './auth.service.js';
import { ResponseUtil } from '../../utils/response.util.js';
import { plainToClass } from 'class-transformer';
import { UserResponseDto } from '../users/dto/user-response.dto.js';
import { IController } from '../../shared/interfaces/IController.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

export class AuthController implements IController {
  public readonly router: Router;

  constructor(private readonly authService: AuthService) {
    this.router = Router();
  }

  /**
   * POST /api/auth/register - Регистрация пользователя
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const registerData: RegisterDto = req.body;

      const result = await this.authService.register({
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        middleName: registerData.middleName,
        dateOfBirth: new Date(registerData.dateOfBirth),
        email: registerData.email,
        password: registerData.password,
      });

      const userResponse = plainToClass(UserResponseDto, result.user, {
        excludeExtraneousValues: false,
      });

      ResponseUtil.created(
        res,
        {
          user: userResponse,
          token: result.tokens.accessToken,
        },
        'Регистрация успешна'
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/auth/login - Авторизация пользователя
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginData: LoginDto = req.body;

      const result = await this.authService.login({
        email: loginData.email,
        password: loginData.password,
      });

      const userResponse = plainToClass(UserResponseDto, result.user, {
        excludeExtraneousValues: false,
      });

      ResponseUtil.success(
        res,
        {
          user: userResponse,
          token: result.tokens.accessToken,
        },
        'Авторизация успешна'
      );
    } catch (error) {
      next(error);
    }
  };
}
