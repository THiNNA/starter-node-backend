# Agent Guide — starter-node-backend

> This document is for AI agents (Copilot, ChatGPT, etc.) to read **before** generating code for this project.
> Follow these conventions strictly to maintain consistency with the existing codebase.

---

## Project Overview

- **Stack:** Node.js + Express.js + TypeScript + Prisma ORM (MySQL) + JWT + Pino logger + Zod validation
- **Architecture:** MVC + Service Layer + Repository Pattern (modular)
- **API prefix:** `/api/v1`
- **Build:** `npm run build` (tsc) — **always verify build passes before committing**
- **Lint:** `npm run lint` (eslint) — **always verify lint passes before committing**
- **Prisma:** `npx prisma generate` after any schema change

---

## Directory Structure

```
src/
├── app.ts                    # Express app factory (createApp)
├── server.ts                 # Bootstrap: config → rate limiters → app → listen
├── config/                   # env, logger, database config
├── constants/                # API_PREFIX, ROLES
├── core/                     # asyncHandler, responseFormatter, error classes
├── database/                 # Prisma client singleton
├── libs/                     # Shared library utilities
├── middlewares/               # auth, rbac, validate, rateLimit, errorHandler, etc.
├── modules/                  # Feature modules (one directory per feature)
│   ├── app-config/           # System config from DB (sys_configs)
│   ├── auth/                 # Register, login, refresh, logout
│   ├── user/                 # User CRUD (read-only in this starter)
│   └── product/              # Example CRUD module
├── routes/                   # Route aggregator (imports all module routers)
├── types/                    # Shared TypeScript types (AuthenticatedRequest)
└── utils/                    # JWT, password hashing utilities
```

---

## Module Creation Checklist

When adding a new feature/module, **always create these files** inside `src/modules/<module-name>/`:

| # | File                       | Purpose                                           |
|---|----------------------------|---------------------------------------------------|
| 1 | `<name>.types.ts`          | TypeScript interfaces for responses and inputs     |
| 2 | `<name>.validation.ts`     | Zod schemas for request validation                 |
| 3 | `<name>.repository.ts`     | Data access layer (Prisma queries only)            |
| 4 | `<name>.service.ts`        | Business logic (NO HTTP awareness)                 |
| 5 | `<name>.controller.ts`     | HTTP handlers (thin — delegates to service)        |
| 6 | `<name>.route.ts`          | Express Router with middleware chain               |
| 7 | `index.ts`                 | Re-exports the router (e.g., `export { default as fooRouter } from './foo.route'`) |

After creating the module, **register it** in `src/routes/index.ts`:
```typescript
import { fooRouter } from '../modules/foo';
router.use('/foos', fooRouter);
```

---

## Code Patterns

### Controller Pattern
```typescript
import { Request, Response } from 'express';
import { asyncHandler, sendSuccess, sendPaginated } from '../../core';
import { AuthenticatedRequest } from '../../types';
import { FooService } from './foo.service';
import { FooRepository } from './foo.repository';

const fooService = new FooService(new FooRepository());

export const createFoo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const result = await fooService.create(req.body, authReq.user!.userId);
  sendSuccess(res, result, 201);
});
```

**Rules:**
- Always wrap handlers with `asyncHandler` (catches errors automatically)
- Use `sendSuccess(res, data, statusCode?)` or `sendPaginated(res, data[], pagination)`
- The `responseWrapper` middleware automatically wraps all JSON responses in `{ head, body }` format — controllers do **not** need to set `model` or `method`
- Access authenticated user via `(req as AuthenticatedRequest).user!`
- Controller is thin — **no business logic here**

### Service Pattern
```typescript
import { NotFoundError } from '../../core';
import { FooRepository } from './foo.repository';
import { FooResponse } from './foo.types';
import { Foo } from '@prisma/client';

export class FooService {
  constructor(private fooRepository: FooRepository) {}

  private toResponse(foo: Foo): FooResponse {
    return {
      id: foo.foo_id,            // Map DB snake_case to camelCase response
      name: foo.name,
      isActive: foo.is_active,
      createdAt: foo.created_at,
      updatedAt: foo.updated_at,
    };
  }

  async getById(id: string): Promise<FooResponse> {
    const foo = await this.fooRepository.findById(id);
    if (!foo) {
      throw new NotFoundError('Foo not found');
    }
    return this.toResponse(foo);
  }
}
```

**Rules:**
- Constructor receives repositories via dependency injection
- Use private `toResponse()` to map DB model → API response (snake_case → camelCase)
- Throw custom errors from `../../core`: `NotFoundError`, `ConflictError`, `AuthError`, `ForbiddenError`, `ValidationError`
- **No HTTP awareness** — no `req`, `res`, status codes

### Repository Pattern
```typescript
import { prisma } from '../../database';
import { Foo, Prisma } from '@prisma/client';

export class FooRepository {
  async create(data: Prisma.FooUncheckedCreateInput): Promise<Foo> {
    return prisma.foo.create({ data });
  }

  async findById(id: string): Promise<Foo | null> {
    return prisma.foo.findUnique({ where: { foo_id: id } });
  }

  async findMany(params: { skip: number; take: number; where?: Prisma.FooWhereInput }): Promise<Foo[]> {
    return prisma.foo.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: { created_at: 'desc' },
    });
  }

  async count(where?: Prisma.FooWhereInput): Promise<number> {
    return prisma.foo.count({ where });
  }

  async update(id: string, data: Prisma.FooUncheckedUpdateInput): Promise<Foo> {
    return prisma.foo.update({ where: { foo_id: id }, data });
  }

  async delete(id: string): Promise<Foo> {
    return prisma.foo.delete({ where: { foo_id: id } });
  }
}
```

**Rules:**
- Import `prisma` from `../../database`
- Use Prisma generated types for input (`Prisma.FooUncheckedCreateInput`, etc.)
- **No business logic** — just data access
- Always use the `_id` field for where clauses (e.g., `foo_id`, not `id`)

### Validation Pattern
```typescript
import { z } from 'zod';

export const createFooSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  price: z.number().nonnegative('Price must be non-negative'),
});

export const getFooByIdSchema = z.object({
  id: z.string().uuid('Invalid ID'),
});

export const getFoosSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});
```

### Route Pattern
```typescript
import { Router } from 'express';
import { authenticate, authorize, validate } from '../../middlewares';
import { createFooSchema, getFooByIdSchema, getFoosSchema } from './foo.validation';
import * as fooController from './foo.controller';

const router = Router();

// Public routes (rare — most routes require auth)
// router.get('/public', fooController.publicEndpoint);

// Authenticated routes
router.use(authenticate);  // Apply auth to all routes below

router.post('/', validate(createFooSchema), fooController.create);
router.get('/', validate(getFoosSchema, 'query'), fooController.getAll);
router.get('/:id', validate(getFooByIdSchema, 'params'), fooController.getById);
router.put('/:id', validate(getFooByIdSchema, 'params'), validate(updateFooSchema), fooController.update);
router.delete('/:id', validate(getFooByIdSchema, 'params'), fooController.remove);

// Admin-only routes
router.get('/admin/stats', authorize('ADMIN'), fooController.getStats);

export default router;
```

**Rules:**
- Always use `validate(schema, target)` — target is `'body'` (default), `'query'`, or `'params'`
- Use `authenticate` middleware for protected routes
- Use `authorize('ADMIN')` for admin-only routes
- Multiple validations can chain: `validate(paramsSchema, 'params'), validate(bodySchema)`

---

## Database Conventions

### Table Naming

| Prefix | Purpose                  | Example            |
|--------|--------------------------|--------------------|
| `m_`   | Master data              | `m_users`, `m_products` |
| `t_`   | Transactions             | `t_refresh_tokens`, `t_orders` |
| `sys_` | System config            | `sys_configs`      |
| `log_` | Log / audit data         | `log_api_requests` |

### Column Naming

- **All columns use `snake_case`**
- **Primary key:** `<entity>_id` (e.g., `user_id`, `product_id`, `order_id`)
- **Foreign key:** Same as referenced PK (e.g., `user_id` referencing `m_users.user_id`)
- **Booleans:** `is_<adjective>` (e.g., `is_active`, `is_deleted`)
- **Timestamps:** `created_at`, `updated_at`, `deleted_at`, `expires_at`
- **Audit fields:** `created_by`, `updated_by` (UUID referencing `m_users.user_id`)

### Prisma Model Example

```prisma
/// Master: Foo entity
model Foo {
  foo_id      String   @id @default(uuid()) @map("foo_id")
  name        String   @db.VarChar(200)
  description String?  @db.Text
  is_active   Boolean  @default(true) @map("is_active")
  created_by  String   @map("created_by")
  updated_by  String?  @map("updated_by")
  created_at  DateTime @default(now()) @map("created_at")
  updated_at  DateTime @updatedAt @map("updated_at")

  creator User  @relation("FooCreator", fields: [created_by], references: [user_id])
  updater User? @relation("FooUpdater", fields: [updated_by], references: [user_id])

  @@map("m_foos")
}
```

**Rules:**
- Always add `@map("column_name")` for mapped column names
- Always add `@@map("table_name")` with the correct prefix
- Use `@default(uuid())` for primary keys
- Use `@default(now())` for `created_at`
- Use `@updatedAt` for `updated_at`
- After editing `prisma/schema.prisma`, run: `npx prisma generate`
- Don't forget to add **reverse relations** on related models (e.g., User model)

---

## API Response Format

All responses are automatically wrapped in a `head`/`body` structure by the `responseWrapper` middleware. Controllers just send plain data — the middleware handles:
- `model` — extracted from the route module (e.g. `auth`, `users`, `products`)
- `method` — extracted from the route action (e.g. `login`, `register`) or HTTP method for RESTful routes (e.g. `list`, `detail`, `create`, `update`, `delete`)

### Success
```json
{
  "head": {
    "model": "foo",
    "method": "create",
    "errorcode": "0",
    "errorflag": "N",
    "errordesc": ""
  },
  "body": { ... }
}
```

### Paginated
```json
{
  "head": {
    "model": "foo",
    "method": "list",
    "errorcode": "0",
    "errorflag": "N",
    "errordesc": ""
  },
  "body": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 42,
      "totalPages": 5
    }
  }
}
```

### Error
```json
{
  "head": {
    "model": "foo",
    "method": "create",
    "errorcode": "400",
    "errorflag": "Y",
    "errordesc": "Validation failed"
  },
  "body": {
    "errors": { "field": ["error1"] }
  }
}
```

Use:
- `sendSuccess(res, data, statusCode?)` — default 200
- `sendPaginated(res, data[], { page, limit, total })`
- Throw errors to let `errorHandler` middleware format the response
- **Do NOT manually build head/body** — the middleware does it automatically

---

## Security Rules

> **Follow these rules strictly when writing any code.**

1. **Always require authentication** — Use `authenticate` middleware on all routes that access or modify data. Public endpoints are the exception, not the rule.

2. **Always validate input** — Use Zod schemas via `validate()` middleware on every endpoint. Validate body, query params, and path params.

3. **Never expose sensitive data** — The `toResponse()` mapping in service layer must exclude `password`, internal IDs, and other sensitive fields. API responses use camelCase.

4. **Use parameterized queries only** — Never construct raw SQL. Always use Prisma's query builder.

5. **Role-based access** — Use `authorize('ADMIN')` for admin-only endpoints. Check ownership in service layer for user-specific resources.

6. **Audit trail** — Include `created_by` and `updated_by` fields on data tables. Populate them from the authenticated user's ID.

7. **Rate limiting** — The global rate limiter applies to all routes. Use `authRateLimiter` for authentication endpoints.

8. **Config from database** — Runtime config values (intervals, limits, sizes) are stored in `sys_configs` table and loaded via `appConfigService`. **Never hardcode** values that might need to change.

9. **Error handling** — Throw typed errors (`NotFoundError`, `ConflictError`, etc.). Never catch errors silently. The `errorHandler` middleware handles all errors consistently.

10. **No secrets in code** — Use environment variables for secrets (JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, DATABASE_URL). In production, all secrets are required via `requireEnv()`.

---

## Existing Error Classes

Import from `../../core`:

| Class             | Status | Use When                                |
|-------------------|--------|-----------------------------------------|
| `ValidationError` | 400    | Input validation fails (with field errors) |
| `AuthError`       | 401    | Authentication failure                  |
| `ForbiddenError`  | 403    | Insufficient permissions                |
| `NotFoundError`   | 404    | Resource not found                      |
| `ConflictError`   | 409    | Duplicate resource                      |

---

## Middleware Available

Import from `../../middlewares`:

| Middleware       | Usage                                                  |
|------------------|--------------------------------------------------------|
| `authenticate`   | Verify JWT access token, populate `req.user`           |
| `authorize(...roles)` | Check user role (must come after `authenticate`)   |
| `validate(schema, target?)` | Validate request with Zod schema             |
| `rateLimiter`    | Global rate limiter                                    |
| `authRateLimiter`| Stricter rate limiter for auth endpoints               |

---

## Imports Convention

```typescript
// External packages
import { Router } from 'express';
import { z } from 'zod';

// Project core
import { asyncHandler, sendSuccess, sendPaginated } from '../../core';
import { NotFoundError, ConflictError } from '../../core';
import { prisma } from '../../database';
import { authenticate, validate, authorize } from '../../middlewares';
import { AuthenticatedRequest } from '../../types';

// Same module
import { FooService } from './foo.service';
import { FooRepository } from './foo.repository';
import { FooResponse } from './foo.types';
```

---

## Quick Start: Adding a New Module

1. **Add Prisma model** in `prisma/schema.prisma` (follow naming conventions above)
2. **Run** `npx prisma generate`
3. **Create module directory** `src/modules/<name>/`
4. **Create files** (in order): types → validation → repository → service → controller → route → index
5. **Register route** in `src/routes/index.ts`
6. **Build & lint:** `npm run build && npm run lint`
7. **Update docs** if needed: `docs/API.md`, `docs/ARCHITECTURE.md`
