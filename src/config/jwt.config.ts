import dotenv from 'dotenv';

dotenv.config();

export class JwtConfig {
  static readonly SECRET: string = process.env.JWT_SECRET || 'default-secret-change-in-production';
  static readonly EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '24h';

  static validateConfig(): void {
    if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be defined in production environment');
    }
  }
}
