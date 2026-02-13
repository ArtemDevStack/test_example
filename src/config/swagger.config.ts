import swaggerJsdoc from 'swagger-jsdoc';
import { AppConfig } from './app.config.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Management Service API',
      version: '1.0.0',
      description: 'RESTful API для управления пользователями с аутентификацией через JWT',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${AppConfig.PORT}/api`,
        description: 'Development server',
      },
      {
        url: 'https://api.example.com/api',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Аутентификация и авторизация',
      },
      {
        name: 'Users',
        description: 'Управление пользователями',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Введите JWT токен, полученный при авторизации',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Уникальный идентификатор пользователя',
            },
            firstName: {
              type: 'string',
              description: 'Имя',
              example: 'Иван',
            },
            lastName: {
              type: 'string',
              description: 'Фамилия',
              example: 'Иванов',
            },
            middleName: {
              type: 'string',
              nullable: true,
              description: 'Отчество',
              example: 'Иванович',
            },
            dateOfBirth: {
              type: 'string',
              format: 'date-time',
              description: 'Дата рождения',
              example: '1990-01-15T00:00:00.000Z',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email (уникальный)',
              example: 'ivan@example.com',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'USER'],
              description: 'Роль пользователя',
              example: 'USER',
            },
            isActive: {
              type: 'boolean',
              description: 'Статус активности',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата последнего обновления',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'dateOfBirth', 'email', 'password'],
          properties: {
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Имя',
              example: 'Иван',
            },
            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Фамилия',
              example: 'Иванов',
            },
            middleName: {
              type: 'string',
              maxLength: 50,
              description: 'Отчество (опционально)',
              example: 'Иванович',
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              description: 'Дата рождения',
              example: '1990-01-15',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email',
              example: 'ivan@example.com',
            },
            password: {
              type: 'string',
              minLength: 8,
              maxLength: 100,
              description: 'Пароль',
              example: 'SecurePassword123',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email',
              example: 'ivan@example.com',
            },
            password: {
              type: 'string',
              description: 'Пароль',
              example: 'SecurePassword123',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User',
                },
                token: {
                  type: 'string',
                  description: 'JWT токен',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
              },
            },
            message: {
              type: 'string',
              example: 'Регистрация успешна',
            },
          },
        },
        UserResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        UsersListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/User',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'number',
                  example: 1,
                },
                limit: {
                  type: 'number',
                  example: 10,
                },
                total: {
                  type: 'number',
                  example: 50,
                },
                totalPages: {
                  type: 'number',
                  example: 5,
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Ошибка валидации данных',
            },
            error: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'ValidationError',
                },
                message: {
                  type: 'string',
                  example: 'Невалидные данные',
                },
                details: {
                  type: 'object',
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.ts', './src/routes/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
