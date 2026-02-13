# User Management Service

Сервис работы с пользователями на TypeScript + Express + Prisma + PostgreSQL с полной REST API документацией.

## 🚀 Технологический стек

- **Runtime:** Node.js / Bun
- **Framework:** Express
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + Passport
- **Password Hashing:** Argon2
- **Validation:** class-validator + class-transformer
- **Logging:** Winston + Morgan
- **Documentation:** Swagger/OpenAPI
- **Security:** Helmet, CORS, Rate Limiting

## 📁 Структура проекта

```
src/
├── shared/              # Переиспользуемые компоненты
│   ├── exceptions/      # Кастомные исключения
│   ├── interfaces/      # Общие интерфейсы
│   ├── types/           # Общие типы
│   └── constants/       # Константы
├── config/              # Конфигурация
├── modules/             # Модульная структура
│   ├── auth/            # Модуль аутентификации
│   └── users/           # Модуль пользователей
├── middlewares/         # Middleware
├── database/            # Работа с БД
├── utils/               # Утилиты
├── app.ts               # Express приложение
└── server.ts            # Server entry point
```

## 🛠️ Установка и запуск

### 1. Клонирование и установка зависимостей

```bash
# Установка зависимостей
bun install
# или
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Argon2 Settings
ARGON2_MEMORY_COST=65536
ARGON2_TIME_COST=3
ARGON2_PARALLELISM=4
```
### 3. Применение миграций

```bash
bun run prisma:generate
bun run prisma:migrate
```

### 4. Seed данных (опционально)

```bash
bun run prisma:seed
```

Будут созданы тестовые пользователи:
- **Admin:** admin@example.com / Admin@12345
- **User:** user@example.com / User@12345

### 5. Запуск сервера

```bash
# Development
bun run dev

# Production
bun run build
bun run start
```

## 📚 API Documentation

### Swagger UI (интерактивная документация)

После запуска сервера откройте:
- **Swagger UI:** http://localhost:3000/api-docs
- **OpenAPI JSON:** http://localhost:3000/api-docs.json

Swagger UI предоставляет:
- ✅ Полную интерактивную документацию всех endpoints
- ✅ Возможность тестирования API прямо из браузера
- ✅ Автоматическую валидацию запросов и ответов
- ✅ Примеры запросов и ответов
- ✅ Авторизацию через JWT токен (кнопка "Authorize")

### Основные endpoints:

#### 🔐 Authentication
- `POST /api/auth/register` - Регистрация нового пользователя
- `POST /api/auth/login` - Авторизация и получение JWT токена

#### 👥 Users (требуется авторизация)
- `GET /api/users/:id` - Получение пользователя по ID (админ или сам пользователь)
- `GET /api/users` - Список всех пользователей с пагинацией (только админ)
- `PATCH /api/users/:id/block` - Блокировка/разблокировка пользователя (админ или сам пользователь)
- `DELETE /api/users/:id` - Удаление пользователя (только админ)

#### 🏥 Utility
- `GET /health` - Health check сервера

### Подробная документация

См. также [API.md](./API.md) для детальных примеров запросов и ответов.

## 🔒 Безопасность

- Пароли хешируются с **Argon2** (устойчив к GPU атакам)
- JWT токены для авторизации
- Rate limiting на критичных endpoints
- Helmet для security headers
- Валидация всех входящих данных
- CORS policies
- SQL injection защита (Prisma)

## 🏗️ Архитектурные принципы

- **SOLID принципы**
- **Repository Pattern** - изоляция логики работы с БД
- **Service Layer** - бизнес-логика
- **DTO Pattern** - валидация и трансформация
- **Dependency Injection** - через конструкторы
- **Централизованная обработка ошибок**
- **Class-based architecture**

## 📊 Модель данных

```prisma
model User {
  id           String   @id @default(uuid())
  firstName    String
  lastName     String
  middleName   String?
  dateOfBirth  DateTime
  email        String   @unique
  password     String
  role         Role     @default(USER)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum Role {
  ADMIN
  USER
}
```

## 🧪 Примеры запросов

### Использование Swagger UI (рекомендуется)

1. Запустите сервер: `bun run dev`
2. Откройте http://localhost:3000/api-docs
3. Используйте интерактивный интерфейс для тестирования API

### Использование cURL

#### Регистрация

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Иван",
    "lastName": "Иванов",
    "middleName": "Иванович",
    "dateOfBirth": "1990-01-15",
    "email": "ivan@example.com",
    "password": "SecurePass123"
  }'
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "Иван",
      "lastName": "Иванов",
      "email": "ivan@example.com",
      "role": "USER",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Регистрация успешна"
}
```

#### Авторизация

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ivan@example.com",
    "password": "SecurePass123"
  }'
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "ivan@example.com",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Авторизация успешна"
}
```

#### Получение пользователя

```bash
curl -X GET http://localhost:3000/api/users/{id} \
  -H "Authorization: Bearer {your-token}"
```

#### Получение списка пользователей (только админ)

```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer {admin-token}"
```

**Ответ:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### Блокировка пользователя

```bash
curl -X PATCH http://localhost:3000/api/users/{id}/block \
  -H "Authorization: Bearer {your-token}"
```

## 🛡️ Разграничение прав доступа

| Endpoint | Описание | Admin | User (сам себя) |
|----------|----------|-------|-----------------|
| POST /auth/register | Регистрация | ✅ | ✅ |
| POST /auth/login | Авторизация | ✅ | ✅ |
| GET /users/:id | Получение пользователя | ✅ | ✅ |
| GET /users | Список пользователей | ✅ | ❌ |
| PATCH /users/:id/block | Блокировка | ✅ | ✅ |
| DELETE /users/:id | Удаление | ✅ | ❌ |

## 📝 Скрипты

```json
{
  "dev": "nodemon --watch",
  "build": "tsc",
  "start": "node dist/server.js",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:seed": "ts-node src/database/seed.ts",
  "prisma:studio": "prisma studio"
}
```

## 🔧 Дополнительные команды

```bash
# Prisma Studio (GUI для БД)
bun run prisma:studio

# Форматирование Prisma schema
bunx prisma format

# Проверка TypeScript
bunx tsc --noEmit
```

## 📦 Зависимости

### Production
- **express** - Web framework
- **prisma** + **@prisma/adapter-pg** - ORM с PostgreSQL адаптером
- **pg** - PostgreSQL клиент
- **argon2** - Password hashing (современная альтернатива bcrypt)
- **passport** + **passport-jwt** - Стратегии аутентификации
- **jsonwebtoken** - JWT tokens
- **class-validator** + **class-transformer** - DTO валидация
- **helmet** - Security headers
- **cors** - CORS middleware
- **express-rate-limit** - Rate limiting
- **winston** + **morgan** - Logging
- **swagger-ui-express** + **swagger-jsdoc** - API документация
- **dotenv** - Environment variables

### Development
- **typescript** - Type safety
- **nodemon** - Auto-restart
- **@types/*** - Type definitions

## 🌟 Особенности

- ✅ **TypeScript** - полная типизация
- ✅ **Clean Architecture** - разделение на слои (Repository, Service, Controller)
- ✅ **SOLID принципы** - масштабируемая архитектура
- ✅ **JWT Authentication** - безопасная авторизация
- ✅ **Argon2 Hashing** - современное хеширование паролей
- ✅ **Swagger Documentation** - интерактивная API документация
- ✅ **Validation** - автоматическая валидация DTO
- ✅ **Error Handling** - централизованная обработка ошибок
- ✅ **Logging** - structured logging с Winston
- ✅ **Rate Limiting** - защита от brute-force
- ✅ **Database Migrations** - Prisma migrations
- ✅ **Seed Data** - тестовые данные
- ✅ **Health Checks** - мониторинг состояния

## 📖 Дополнительные ресурсы

- [Swagger UI](http://localhost:3000/api-docs) - Интерактивная документация API
- [API.md](./API.md) - Детальная документация endpoints
- [Prisma Docs](https://www.prisma.io/docs) - Документация ORM
- [Passport.js](http://www.passportjs.org/) - Документация аутентификации

## ✅ Выполненные требования ТЗ

- ✅ Модель пользователя с ФИО, датой рождения, email, паролем, ролью, статусом
- ✅ Регистрация пользователя
- ✅ Авторизация с JWT
- ✅ Получение пользователя по ID с проверкой прав
- ✅ Получение списка пользователей (только админ)
- ✅ Блокировка пользователя с проверкой прав
- ✅ Архитектура с соблюдением best practices
- ✅ TypeScript
- ✅ Express
- ✅ PostgreSQL + Prisma
- ✅ Масштабируемая структура проекта
