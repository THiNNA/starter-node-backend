# API Documentation

Base URL: `http://localhost:3000/api/v1`

All responses follow a standard format:

```json
// Success
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}

// Error
{
  "success": false,
  "message": "Error description",
  "errors": { ... }  // Only for validation errors
}

// Paginated
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

---

## Health Check

### `GET /api/v1/health`

Returns server health status. Not rate-limited. Not logged.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "uptime": 3600.5
  }
}
```

---

## Authentication

All auth endpoints are rate-limited to **20 requests per 15 minutes** per IP.

### `POST /api/v1/auth/register`

Create a new user account and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Validation:**
- `email` — required, valid email format
- `password` — required, minimum 8 characters

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Registration successful"
}
```

**Error Responses:**
| Status | Condition                      |
|--------|--------------------------------|
| 400    | Validation failed              |
| 409    | Email already registered       |

---

### `POST /api/v1/auth/login`

Authenticate with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Validation:**
- `email` — required, valid email format
- `password` — required, non-empty

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Login successful"
}
```

**Error Responses:**
| Status | Condition                      |
|--------|--------------------------------|
| 400    | Validation failed              |
| 401    | Invalid email or password      |
| 401    | Account is deactivated         |

---

### `POST /api/v1/auth/refresh`

Exchange a refresh token for a new access/refresh token pair. Implements **token rotation** — the old refresh token is invalidated and a new one is issued.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Validation:**
- `refreshToken` — required, non-empty

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Token refreshed"
}
```

**Error Responses:**
| Status | Condition                                    |
|--------|----------------------------------------------|
| 400    | Validation failed                            |
| 401    | Invalid refresh token (signature/format)     |
| 401    | Refresh token expired                        |
| 401    | Refresh token reuse detected (all tokens revoked) |

**Security Notes:**
- Each refresh token can only be used **once**
- If a previously-used refresh token is submitted again (reuse detection), **all** refresh tokens for that user are immediately revoked as a security measure
- This protects against token theft — if an attacker uses a stolen token, the legitimate user's next refresh will trigger revocation

---

### `POST /api/v1/auth/logout`

Invalidate a refresh token. **Requires authentication** (Bearer token).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Validation:**
- `refreshToken` — required, non-empty

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Logout successful"
}
```

**Error Responses:**
| Status | Condition                      |
|--------|--------------------------------|
| 400    | Validation failed              |
| 401    | Access token missing/invalid   |

---

## Users

All user endpoints require authentication via Bearer token.

### `GET /api/v1/users`

Get a paginated list of users.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
| Param | Type   | Default | Description              |
|-------|--------|---------|--------------------------|
| page  | number | 1       | Page number (positive integer) |
| limit | number | 10      | Items per page (1-100)   |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "role": "USER",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

**Error Responses:**
| Status | Condition                      |
|--------|--------------------------------|
| 400    | Invalid query parameters       |
| 401    | Access token missing/invalid   |

---

### `GET /api/v1/users/:id`

Get a single user by ID.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Path Parameters:**
| Param | Type | Description              |
|-------|------|--------------------------|
| id    | UUID | User ID                  |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "USER",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
| Status | Condition                      |
|--------|--------------------------------|
| 400    | Invalid UUID format            |
| 401    | Access token missing/invalid   |
| 404    | User not found                 |

---

### `GET /api/v1/users/admin/all`

Admin-only endpoint to list all users. Requires `ADMIN` role.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:** Same as `GET /api/v1/users`

**Error Responses:**
| Status | Condition                      |
|--------|--------------------------------|
| 401    | Access token missing/invalid   |
| 403    | Insufficient permissions (not ADMIN) |

---

## Authentication Flow

### Token Types

| Token          | Lifetime | Storage              | Purpose                    |
|----------------|----------|----------------------|----------------------------|
| Access Token   | 15 min   | Client memory/header | API authentication         |
| Refresh Token  | 7 days   | Client + Server DB   | Obtain new access tokens   |

### Flow Diagram

```
Registration/Login:
┌────────┐   email+password    ┌────────┐
│ Client │ ──────────────────→ │ Server │
│        │ ←────────────────── │        │
└────────┘   accessToken +     └────────┘
             refreshToken

API Call:
┌────────┐  Authorization:     ┌────────┐
│ Client │  Bearer <access>    │ Server │
│        │ ──────────────────→ │        │
│        │ ←────────────────── │        │
└────────┘   response data     └────────┘

Token Refresh:
┌────────┐   refreshToken      ┌────────┐
│ Client │ ──────────────────→ │ Server │
│        │ ←────────────────── │        │
└────────┘   NEW accessToken + └────────┘
             NEW refreshToken
             (old refresh token invalidated)

Logout:
┌────────┐   Bearer <access>   ┌────────┐
│ Client │   + refreshToken    │ Server │
│        │ ──────────────────→ │        │
│        │ ←────────────────── │        │
└────────┘   success           └────────┘
             (refresh token deleted)
```

### Recommended Client Implementation

```
1. Store accessToken in memory (NOT localStorage)
2. Store refreshToken in httpOnly cookie or secure storage
3. On 401 response → call /auth/refresh with refreshToken
4. If refresh fails → redirect to login
5. On logout → call /auth/logout, then clear stored tokens
```

---

## Error Codes Reference

| Status | Error Type       | Common Causes                         |
|--------|------------------|---------------------------------------|
| 400    | ValidationError  | Missing/invalid fields                |
| 401    | AuthError        | Missing/expired/invalid token         |
| 403    | ForbiddenError   | Insufficient role permissions         |
| 404    | NotFoundError    | Resource or route not found           |
| 409    | ConflictError    | Duplicate resource (e.g., email)      |
| 429    | Rate Limited     | Too many requests                     |
| 500    | Internal Error   | Unhandled server error                |

---

## Rate Limiting

| Scope    | Limit            | Endpoints                  |
|----------|------------------|----------------------------|
| Global   | 100 req / 15 min | All endpoints              |
| Auth     | 20 req / 15 min  | /auth/register, /auth/login |

Rate limit headers are included in responses:
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1705312200
```

---

## Products (Example CRUD)

All product endpoints require authentication via Bearer token.

### `POST /api/v1/products`

Create a new product.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "name": "Widget Pro",
  "description": "A premium widget",
  "price": 29.99,
  "stock": 100
}
```

**Validation:**
- `name` — required, 1-200 characters
- `description` — optional, max 5000 characters
- `price` — required, non-negative number
- `stock` — optional, non-negative integer (default: 0)

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Widget Pro",
    "description": "A premium widget",
    "price": 29.99,
    "stock": 100,
    "isActive": true,
    "createdBy": "user-uuid",
    "updatedBy": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Product created"
}
```

**Error Responses:**
| Status | Condition                      |
|--------|--------------------------------|
| 400    | Validation failed              |
| 401    | Access token missing/invalid   |

---

### `GET /api/v1/products`

Get a paginated list of products with optional search.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
| Param  | Type   | Default | Description                    |
|--------|--------|---------|--------------------------------|
| page   | number | 1       | Page number (positive integer) |
| limit  | number | 10      | Items per page (1-100)         |
| search | string | —       | Search in name and description |

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Widget Pro",
      "description": "A premium widget",
      "price": 29.99,
      "stock": 100,
      "isActive": true,
      "createdBy": "user-uuid",
      "updatedBy": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

---

### `GET /api/v1/products/:id`

Get a single product by ID.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| id    | UUID | Product ID  |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Widget Pro",
    "description": "A premium widget",
    "price": 29.99,
    "stock": 100,
    "isActive": true,
    "createdBy": "user-uuid",
    "updatedBy": null,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
| Status | Condition                      |
|--------|--------------------------------|
| 400    | Invalid UUID format            |
| 401    | Access token missing/invalid   |
| 404    | Product not found              |

---

### `PUT /api/v1/products/:id`

Update an existing product. Only provided fields are updated.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| id    | UUID | Product ID  |

**Request Body (all fields optional):**
```json
{
  "name": "Widget Pro v2",
  "description": "Updated description",
  "price": 39.99,
  "stock": 50,
  "isActive": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Widget Pro v2",
    "description": "Updated description",
    "price": 39.99,
    "stock": 50,
    "isActive": false,
    "createdBy": "user-uuid",
    "updatedBy": "updater-uuid",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T08:00:00.000Z"
  },
  "message": "Product updated"
}
```

**Error Responses:**
| Status | Condition                      |
|--------|--------------------------------|
| 400    | Validation failed / invalid ID |
| 401    | Access token missing/invalid   |
| 404    | Product not found              |

---

### `DELETE /api/v1/products/:id`

Delete a product.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| id    | UUID | Product ID  |

**Success Response (200):**
```json
{
  "success": true,
  "data": null,
  "message": "Product deleted"
}
```

**Error Responses:**
| Status | Condition                      |
|--------|--------------------------------|
| 400    | Invalid UUID format            |
| 401    | Access token missing/invalid   |
| 404    | Product not found              |
