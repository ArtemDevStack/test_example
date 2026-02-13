import { Request, Response, NextFunction, Router } from 'express';
import { UsersService } from './users.service.js';
import { IAuthenticatedRequest } from '../../shared/types/express.types.js';
import { ResponseUtil } from '../../utils/response.util.js';
import { plainToClass } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto.js';
import { IController } from '../../shared/interfaces/IController.js';

export class UsersController implements IController {
  public readonly router: Router;

  constructor(private readonly usersService: UsersService) {
    this.router = Router();
  }

  /**
   * GET /api/users/:id - Получение пользователя по ID
   */
  getById = async (
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const user = await this.usersService.getUserById(id, req.user!);
      
      const userResponse = plainToClass(UserResponseDto, user, {
        excludeExtraneousValues: false,
      });

      ResponseUtil.success(res, userResponse);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/users - Получение списка пользователей
   */
  getAll = async (
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.usersService.getAllUsers(page, limit, req.user!);

      const usersResponse = result.users.map((user) =>
        plainToClass(UserResponseDto, user, { excludeExtraneousValues: false })
      );

      ResponseUtil.paginated(res, usersResponse, result.page, result.limit, result.total);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/users/:id/block - Блокировка/разблокировка пользователя
   */
  toggleActiveStatus = async (
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const user = await this.usersService.toggleUserActiveStatus(id, req.user!);

      const userResponse = plainToClass(UserResponseDto, user, {
        excludeExtraneousValues: false,
      });

      ResponseUtil.success(
        res,
        userResponse,
        user.isActive ? 'Пользователь разблокирован' : 'Пользователь заблокирован'
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/users/:id - Удаление пользователя
   */
  delete = async (
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await this.usersService.deleteUser(id, req.user!);

      ResponseUtil.success(res, null, 'Пользователь удален');
    } catch (error) {
      next(error);
    }
  };
}
