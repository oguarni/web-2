# Sistema de Reservas de Espaços - API Documentation

## Authentication

### Login
**POST** `/api/auth/login`

Request:
```json
{
  "login": "admin",
  "senha": "1234"
}
```

Response:
```json
{
  "success": true,
  "token": "a1b2c3d4e5f6...",
  "user": {
    "id": 1,
    "nome": "Administrador",
    "login": "admin",
    "tipo": 1
  }
}
```

## Headers
All protected routes require:
```
Authorization: Bearer <token>
```

## User Types
- `1`: Administrator (full access)
- `2`: Regular user (limited access)

---

## Usuarios (Admin Only)

### List Users
**GET** `/api/usuarios`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Admin",
      "login": "admin",
      "tipo": 1,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get User
**GET** `/api/usuarios/:id`

### Create User
**POST** `/api/usuarios`

Request:
```json
{
  "nome": "New User",
  "login": "newuser",
  "senha": "password",
  "tipo": 2
}
```

### Update User
**PUT** `/api/usuarios/:id`

### Delete User
**DELETE** `/api/usuarios/:id`

---

## Reservas

### List Reservations
**GET** `/api/reservas`
- Regular users see only their reservations
- Admins see all reservations

### Get Reservation
**GET** `/api/reservas/:id`

### Create Reservation
**POST** `/api/reservas`

Request:
```json
{
  "titulo": "Meeting Room",
  "dataInicio": "2025-01-15T09:00:00.000Z",
  "dataFim": "2025-01-15T11:00:00.000Z",
  "descricao": "Team meeting",
  "espacoId": 1
}
```

### Update Reservation
**PUT** `/api/reservas/:id`

### Delete Reservation
**DELETE** `/api/reservas/:id`

### Update Status (Admin Only)
**PUT** `/api/reservas/:id/status`

Request:
```json
{
  "status": "confirmada"
}
```

Valid status: `confirmada`, `pendente`, `cancelada`

---

## Espacos

### List Spaces
**GET** `/api/espacos`
Query parameters:
- `ativo`: true/false

### Get Space
**GET** `/api/espacos/:id`

### Create Space (Admin Only)
**POST** `/api/espacos`

Request:
```json
{
  "nome": "Conference Room A",
  "descricao": "Large conference room",
  "capacidade": 20,
  "localizacao": "Building 1, Floor 2",
  "equipamentos": "Projector, Whiteboard, Video Conference"
}
```

### Update Space (Admin Only)
**PUT** `/api/espacos/:id`

### Delete Space (Admin Only)
**DELETE** `/api/espacos/:id`

### Check Availability
**GET** `/api/espacos/:id/disponibilidade`
Query parameters:
- `dataInicio`: ISO date string
- `dataFim`: ISO date string

Response:
```json
{
  "success": true,
  "data": {
    "available": false,
    "conflicts": [
      {
        "id": 1,
        "titulo": "Existing Meeting",
        "dataInicio": "2025-01-15T09:30:00.000Z",
        "dataFim": "2025-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

## Logs (Admin Only)

### List Logs
**GET** `/api/logs`
Query parameters:
- `page`: page number (default: 1)
- `limit`: items per page (default: 50)
- `usuarioId`: filter by user ID
- `acao`: filter by action (partial match)
- `startDate`: filter from date
- `endDate`: filter to date

### Get Log
**GET** `/api/logs/:id`

### Create Log
**POST** `/api/logs`

Request:
```json
{
  "usuarioId": 1,
  "acao": "custom_action",
  "ip": "127.0.0.1",
  "detalhes": {"custom": "data"}
}
```

### Get Statistics
**GET** `/api/logs/stats`
Query parameters:
- `startDate`: filter from date
- `endDate`: filter to date

### Cleanup Old Logs
**DELETE** `/api/logs/cleanup`

Request:
```json
{
  "olderThan": "2024-01-01T00:00:00.000Z"
}
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error message"
}
```

### Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

---

## Example Usage

### 1. Login and get token
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login": "admin", "senha": "1234"}'
```

### 2. Create space (admin)
```bash
curl -X POST http://localhost:8081/api/espacos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"nome": "Room A", "capacidade": 10, "localizacao": "Floor 1"}'
```

### 3. Create reservation
```bash
curl -X POST http://localhost:8081/api/reservas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Meeting",
    "dataInicio": "2025-01-15T09:00:00.000Z",
    "dataFim": "2025-01-15T11:00:00.000Z",
    "espacoId": 1
  }'
```

### 4. Check availability
```bash
curl "http://localhost:8081/api/espacos/1/disponibilidade?dataInicio=2025-01-15T09:00:00.000Z&dataFim=2025-01-15T11:00:00.000Z" \
  -H "Authorization: Bearer <token>"
```