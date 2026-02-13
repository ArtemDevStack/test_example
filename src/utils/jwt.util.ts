import jwt, { type SignOptions, type Secret } from 'jsonwebtoken';
import { JwtConfig } from '../config/jwt.config.js';
import { IUserPayload } from '../shared/types/express.types.js';

export class JwtUtil {
  /**
   * Генерация JWT токена
   */
  static generateToken(payload: IUserPayload): string {
    return jwt.sign(
      payload,
      JwtConfig.SECRET as Secret,
      {
        expiresIn: JwtConfig.EXPIRES_IN,
      } as SignOptions
    );
  }

  /**
   * Верификация JWT токена
   */
  static verifyToken(token: string): IUserPayload {
    return jwt.verify(token, JwtConfig.SECRET) as IUserPayload;
  }

  /**
   * Декодирование токена без верификации
   */
  static decodeToken(token: string): IUserPayload | null {
    const decoded = jwt.decode(token);
    return decoded as IUserPayload | null;
  }
}
