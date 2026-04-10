# System Architecture

## Overview

This is a production-ready Node.js backend starter template built with **Express.js**, **TypeScript**, **Prisma ORM** (MySQL), **JWT authentication**, and **Pino logger**. It follows a modular **MVC + Service Layer + Repository Pattern** architecture.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (HTTP)                           │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express Application                        │
│  ┌───────────┐ ┌──────┐ ┌──────────┐ ┌──────┐ ┌────────────┐  │
│  │  Helmet    │ │ CORS │ │RateLimit │ │ JSON │ │ RequestId  │  │
│  └───────────┘ └──────┘ └──────────┘ └──────┘ └────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Pino HTTP Logger                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Router (/api/v1)                         │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │ /health  │  │ /auth        │  │ /users                    │ │
│  │          │  │  ├ register  │  │  ├ GET / (auth)           │ │
│  │          │  │  ├ login     │  │  ├ GET /:id (auth)        │ │
│  │          │  │  ├ refresh   │  │  └ GET /admin/all (admin) │ │
│  │          │  │  └ logout    │  │                           │ │
│  └──────────┘  └──────────────┘  └───────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Middleware     │  │   Controller    │  │   Middleware     │
│  ┌───────────┐  │  │  (Request/      │  │  ┌───────────┐  │
│  │ Validate  │  │  │   Response)     │  │  │ Auth/RBAC │  │
│  │ (Zod)     │  │  │                 │  │  │           │  │
│  └───────────┘  │  │                 │  │  └───────────┘  │
└─────────────────┘  └────────┬────────┘  └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    Service      │
                    │  (Business      │
                    │   Logic)        │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Repository    │
                    │  (Data Access)  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Prisma ORM     │
                    │  (MySQL)        │
                    └─────────────────┘
```

---

## Directory Structure

```
src/
├── app.ts                          # Express app configuration & middleware stack
├── server.ts                       # HTTP server, graceful shutdown, token cleanup
│
├── config/
│   ├── index.ts                    # Re-exports all config
│   ├── env.ts                      # Environment variable loader with validation
│   ├── logger.ts                   # Pino logger configuration
│   └── database.ts                 # Database configuration
│
├── core/
│   ├── index.ts                    # Re-exports core utilities
│   ├── asyncHandler.ts             # Express async error wrapper
│   ├── responseFormatter.ts        # Standardized API response format
│   └── errors/
│       └── index.ts                # Custom error class hierarchy
│
├── database/
│   ├── index.ts                    # Re-exports Prisma client
│   └── prisma.ts                   # Prisma client singleton with logging
│
├── middlewares/
│   ├── index.ts                    # Re-exports all middlewares
│   ├── auth.middleware.ts          # JWT authentication
│   ├── rbac.middleware.ts          # Role-based access control
│   ├── validate.middleware.ts      # Zod schema validation wrapper
│   ├── requestId.middleware.ts     # Request ID (UUID) tracking
│   ├── logger.middleware.ts        # Pino HTTP request logging
│   ├── rateLimit.middleware.ts     # Rate limiter (global + auth)
│   ├── errorHandler.middleware.ts  # Centralized error handler
│   └── notFound.middleware.ts      # 404 handler
│
├── modules/
│   ├── app-config/
│   │   ├── index.ts                # Re-exports config service & keys
│   │   ├── app-config.service.ts   # Config CRUD, cache, seed defaults
│   │   ├── app-config.repository.ts # Config data access (AppConfig table)
│   │   └── app-config.types.ts     # Config keys, types, defaults
│   │
│   ├── auth/
│   │   ├── index.ts                # Re-exports auth router
│   │   ├── auth.controller.ts      # HTTP handlers (register, login, refresh, logout)
│   │   ├── auth.service.ts         # Auth business logic
│   │   ├── auth.repository.ts      # Refresh token data access
│   │   ├── auth.validation.ts      # Zod schemas for auth endpoints
│   │   ├── auth.route.ts           # Auth route definitions
│   │   └── auth.types.ts           # Auth TypeScript interfaces
│   │
│   └── user/
│       ├── index.ts                # Re-exports user router
│       ├── user.controller.ts      # HTTP handlers (getUsers, getUserById)
│       ├── user.service.ts         # User business logic
│       ├── user.repository.ts      # User data access
│       ├── user.validation.ts      # Zod schemas for user endpoints
│       ├── user.route.ts           # User route definitions
│       └── user.types.ts           # User TypeScript interfaces
│
├── routes/
│   └── index.ts                    # Route aggregator (health + modules)
│
├── utils/
│   ├── index.ts                    # Re-exports utilities
│   ├── jwt.ts                      # JWT token generation & verification
│   └── password.ts                 # bcrypt password hashing & comparison
│
├── types/
│   └── index.ts                    # Shared TypeScript types
│
├── constants/
│   └── index.ts                    # API prefix, roles enum
│
└── libs/
    └── index.ts                    # Shared library utilities (placeholder)

prisma/
└── schema.prisma                   # Database schema (User, RefreshToken models)

Dockerfile                          # Multi-stage Docker build
docker-compose.yml                  # App + MySQL services
.env.example                        # Environment variable template
```

---

## Module Pattern

Each module follows a strict **6-file structure**:

| File                 | Purpose                                        |
|----------------------|------------------------------------------------|
| `*.controller.ts`    | HTTP request/response handling                 |
| `*.service.ts`       | Business logic (no HTTP awareness)             |
| `*.repository.ts`    | Database operations (Prisma queries)           |
| `*.validation.ts`    | Input validation schemas (Zod)                 |
| `*.route.ts`         | Express route definitions with middleware       |
| `*.types.ts`         | TypeScript interfaces and types                |

### Data Flow

```
Request → Route → Middleware(s) → Controller → Service → Repository → Database
                                                                        │
Response ← Controller ← Service ← Repository ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
```

### Layer Responsibilities

| Layer        | Knows About     | Does NOT Know About                |
|--------------|-----------------|-------------------------------------|
| Controller   | Request/Response, Service | Repository, Database        |
| Service      | Repository, Business Rules | HTTP, Express, Request    |
| Repository   | Prisma, Database Queries   | Business Rules, HTTP      |

---

## Request Lifecycle

Every HTTP request flows through this pipeline:

```
1. Helmet          → Sets security headers
2. CORS            → Cross-origin access control
3. Rate Limiter    → Prevents abuse (100 req/15min global)
4. JSON Parser     → Parses request body (10KB limit)
5. Request ID      → Generates/reads X-Request-Id header (UUID)
6. Pino Logger     → Logs request/response with timing
7. Router          → Matches route pattern
8. Validation      → Validates input with Zod schema
9. Auth (optional) → Verifies JWT access token
10. RBAC (optional)→ Checks user role permissions
11. Controller     → Processes request via service layer
12. Error Handler  → Catches and formats any errors
```

---

## Error Handling

### Error Class Hierarchy

```
Error (built-in)
  └── BaseError (statusCode, isOperational)
        ├── ValidationError (400) — includes field-level errors
        ├── AuthError (401)       — authentication failures
        ├── ForbiddenError (403)  — insufficient permissions
        ├── NotFoundError (404)   — resource not found
        └── ConflictError (409)   — duplicate resource
```

### Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email address"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

Unhandled errors return a generic 500 response. Stack traces are only included in development mode.

---

## Database Schema

### User Model

| Field     | Type     | Description                     |
|-----------|----------|---------------------------------|
| id        | UUID     | Primary key (auto-generated)    |
| email     | String   | Unique email address            |
| password  | String   | bcrypt hashed password          |
| role      | Enum     | USER or ADMIN (default: USER)   |
| isActive  | Boolean  | Account active flag (default: true) |
| createdAt | DateTime | Auto-generated timestamp        |
| updatedAt | DateTime | Auto-updated timestamp          |

### RefreshToken Model

| Field     | Type     | Description                     |
|-----------|----------|---------------------------------|
| id        | UUID     | Primary key (auto-generated)    |
| token     | String   | JWT refresh token (unique, max 500 chars) |
| userId    | UUID     | Foreign key to User (cascade delete) |
| expiresAt | DateTime | Token expiration time           |
| createdAt | DateTime | Auto-generated timestamp        |

### Entity Relationship

```
User (1) ──── (N) RefreshToken
```

A user can have multiple active refresh tokens (e.g., logged in on multiple devices). Deleting a user cascades to delete all their refresh tokens.

---

## Database-Driven Configuration

All runtime configuration values are stored in the `app_configs` table and loaded into an in-memory cache at startup. This allows changing system behavior (e.g., rate limits, token expiry, salt rounds) without redeploying — just update the DB row and restart (or call reload).

### How It Works

```
Server Start
    │
    ▼
┌──────────────────────┐
│ 1. Seed defaults     │  Insert default config rows if not already present
│    (appConfigService │
│     .seedDefaults()) │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 2. Load all configs  │  Read all rows into in-memory Map<key, value>
│    (appConfigService │
│     .loadAll())      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 3. Reinitialize      │  Recreate rate limiters, etc. with loaded values
│    middlewares        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 4. Create Express    │  App uses cached config for body size, etc.
│    app & listen      │
└──────────────────────┘
```

### Config Keys

| Key                          | Default    | Description                             |
|------------------------------|------------|-----------------------------------------|
| `jwt.accessExpiresIn`        | `15m`      | JWT access token expiration             |
| `jwt.refreshExpiresIn`       | `7d`       | JWT refresh token expiration            |
| `auth.refreshTokenDays`      | `7`        | Refresh token DB storage duration (days)|
| `rateLimit.windowMs`         | `900000`   | Global rate limit window (ms)           |
| `rateLimit.max`              | `100`      | Max requests per global window          |
| `rateLimit.auth.windowMs`    | `900000`   | Auth rate limit window (ms)             |
| `rateLimit.auth.max`         | `20`       | Max auth requests per window            |
| `security.bcryptSaltRounds`  | `12`       | bcrypt salt rounds for password hashing |
| `security.bodyMaxSize`       | `10kb`     | Max request body size                   |
| `server.cleanupIntervalMs`   | `3600000`  | Token cleanup interval (ms, default 1h) |
| `server.shutdownTimeoutMs`   | `10000`    | Graceful shutdown timeout (ms)          |

### Updating Config at Runtime

Update a value directly in the database:

```sql
UPDATE app_configs SET value = '30m' WHERE `key` = 'jwt.accessExpiresIn';
```

Or via the `AppConfigService`:

```typescript
await appConfigService.set('jwt.accessExpiresIn', '30m');
```

Some changes (e.g., rate limits) require calling `appConfigService.reload()` and `refreshRateLimiters()` to take effect without restart.

### Database Schema

```prisma
model AppConfig {
  key         String   @id @db.VarChar(100)
  value       String   @db.VarChar(500)
  description String?  @db.VarChar(255)
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("app_configs")
}
```

---

## Security Measures

| Feature             | Implementation                                        |
|---------------------|-------------------------------------------------------|
| Password Hashing    | bcrypt (salt rounds from DB config, default 12)       |
| JWT Access Tokens   | Expiry from DB config (default 15m), signed with secret |
| JWT Refresh Tokens  | Expiry from DB config (default 7d), signed with secret  |
| Token Rotation      | Old refresh token deleted on each refresh             |
| Reuse Detection     | All user tokens revoked if reuse detected             |
| Token Cleanup       | Interval from DB config (default 1h)                  |
| Rate Limiting       | Limits from DB config (default 100/15min, 20/15min auth) |
| Security Headers    | Helmet middleware                                     |
| CORS                | Configurable origins via CORS_ORIGIN env var          |
| Body Size Limit     | Max size from DB config (default 10KB)                |
| Input Validation    | Zod schemas on all endpoints                          |
| Request Tracing     | UUID-based X-Request-Id header                        |
| Env Validation      | Required secrets enforced in production               |
| Graceful Shutdown   | Timeout from DB config (default 10s)                  |

---

## Logging System

### Configuration

- **Development:** Pretty-printed, colorized logs via `pino-pretty` at DEBUG level
- **Production:** Structured JSON logs at INFO level

### What Gets Logged

| Event                | Level | Details                              |
|----------------------|-------|--------------------------------------|
| Config Seeded        | info  | Each new config key seeded           |
| Config Loaded        | info  | Number of configs loaded from DB     |
| HTTP Request/Response| info  | Method, URL, status code, duration   |
| 4xx Client Errors    | warn  | Full error with requestId            |
| 5xx Server Errors    | error | Full error with stack trace          |
| Prisma Queries       | debug | Query text, duration                 |
| Prisma Errors        | error | Error message, target                |
| Token Cleanup        | info  | Number of tokens cleaned             |
| Config Updated       | info  | Key and new value                    |
| Server Start         | info  | Port, environment                    |
| Graceful Shutdown    | info  | Signal received, connection status   |
| Unhandled Rejection  | error | Reason                               |
| Uncaught Exception   | fatal | Error (triggers process exit)        |

### Request ID Tracking

Every request gets a UUID (`X-Request-Id` header). This ID is:
- Generated server-side or accepted from client
- Included in all log entries for that request
- Returned in the response header
- Useful for correlating logs across services

---

## Docker Setup

### Services

| Service | Image         | Port  | Purpose         |
|---------|---------------|-------|-----------------|
| app     | Node 20 Alpine| 3000  | Application     |
| mysql   | MySQL 8.0     | 3306  | Database        |

### Multi-Stage Build

```
Stage 1 (base)       → Node.js Alpine base
Stage 2 (deps)       → npm ci install
Stage 3 (prisma)     → Generate Prisma client
Stage 4 (build)      → Compile TypeScript
Stage 5 (production) → Minimal runtime image
```

### Usage

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f app

# Run migrations
docker compose exec app npx prisma migrate deploy

# Stop
docker compose down
```
