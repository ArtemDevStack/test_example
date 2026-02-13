import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { JwtConfig } from '../../../config/jwt.config.js';
import { UsersRepository } from '../../users/users.repository.js';
import { IUserPayload } from '../../../shared/types/express.types.js';

export class PassportJwtStrategy {
  constructor(private readonly usersRepository: UsersRepository) {}

  getStrategy(): JwtStrategy {
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JwtConfig.SECRET,
    };

    return new JwtStrategy(options, async (payload: IUserPayload, done) => {
      try {
        const user = await this.usersRepository.findById(payload.id);

        if (!user) {
          return done(null, false);
        }

        // Проверка активности пользователя
        if (!user.isActive) {
          return done(null, false);
        }

        // Проверка версии токена - если версии не совпадают, токен недействителен
        if (user.tokenVersion !== payload.tokenVersion) {
          return done(null, false);
        }

        // Передаем payload в req.user
        const userPayload: IUserPayload = {
          id: user.id,
          email: user.email,
          role: user.role,
          tokenVersion: user.tokenVersion,
        };

        return done(null, userPayload);
      } catch (error) {
        return done(error, false);
      }
    });
  }
}
