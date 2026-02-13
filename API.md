# API Documentation

## Базовый URL
```
http://localhost:3000/api
```

## Endpoints

### 1. POST /auth/register - Регистрация пользователя

**Описание:** Создание нового пользователя в системе.

**Request Body:**
```json
{
  "firstName": "Иван",
  "lastName": "Иванов",
  "middleName": "Иванович", // optional
  "dateOfBirth": "1990-01-15",
  "email": "ivan@example.com",
  "password": "SecurePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "Иван",
      "lastName": "Иванов",
      "middleName": "Иванович",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "email": "ivan@example.com",
      "role": "USER",
      "isActive": true,
      "createdAt": "2026-02-05T10:00:00.000Z",
      "updatedAt": "2026-02-05T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Регистрация успешна"
}
```

---

### 2. POST /auth/login - Авторизация

**Описание:** Вход в систему с получением JWT токена.

**Request Body:**
```json
{
  "email": "ivan@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**
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
  "message": "Авторизация успешна"
}
```

---

### 3. GET /users/:id - Получение пользователя по ID

**Описание:** Получение информации о пользователе (админ или сам пользователь).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "Иван",
    "lastName": "Иванов",
    "email": "ivan@example.com",
    "role": "USER",
    "isActive": true,
    "createdAt": "2026-02-05T10:00:00.000Z",
    "updatedAt": "2026-02-05T10:00:00.000Z"
  }
}
```

---

### 4. GET /users - Получение списка пользователей

**Описание:** Получение всех пользователей (только для админа).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firstName": "Иван",
      "lastName": "Иванов",
      "email": "ivan@example.com",
      "role": "USER",
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### 5. PATCH /users/:id/block - Блокировка/разблокировка пользователя

**Описание:** Переключение статуса активности (админ или сам пользователь).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "Иван",
    "lastName": "Иванов",
    "isActive": false
  },
  "message": "Пользователь заблокирован"
}
```

---

## Тестовые аккаунты

После выполнения seed:

**Admin:**
- Email: `admin@example.com`
- Password: `Admin@12345`

**User:**
- Email: `user@example.com`
- Password: `User@12345`

---

## Коды ошибок

- `400` - Bad Request (валидация)
- `401` - Unauthorized (не авторизован)
- `403` - Forbidden (нет прав доступа)
- `404` - Not Found (не найдено)
- `500` - Internal Server Error
