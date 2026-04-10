# Starter Node Backend

Production-ready Node.js backend starter template with Express, TypeScript, Prisma ORM, JWT authentication, and Docker.

## Tech Stack

- **Runtime:** Node.js + TypeScript (strict mode)
- **Framework:** Express.js
- **ORM:** Prisma with MySQL
- **Authentication:** JWT with refresh token rotation
- **Validation:** Zod
- **Logger:** Pino (pretty in dev, JSON in production)
- **Security:** Helmet, CORS, bcrypt, rate limiting
- **Containerization:** Docker + Docker Compose

## Project Structure

```
src/
├── app.ts                         # Express app setup
├── server.ts                      # Entry point + graceful shutdown
├── config/
│   ├── env.ts                     # Environment configuration
│   └── logger.ts                  # Pino logger configuration
├── constants/                     # App constants
├── core/
│   ├── asyncHandler.ts            # Express async wrapper
│   ├── responseFormatter.ts       # Standard response format
│   └── errors/                    # Custom error classes
├── database/
│   └── prisma.ts                  # Prisma client instance
├── middlewares/
│   ├── auth.middleware.ts         # JWT authentication
│   ├── rbac.middleware.ts         # Role-based authorization
│   ├── validate.middleware.ts     # Zod validation wrapper
│   ├── requestId.middleware.ts    # Request ID tracking
│   ├── logger.middleware.ts       # Request logging (pino-http)
│   ├── rateLimit.middleware.ts    # Rate limiting
│   ├── errorHandler.middleware.ts # Centralized error handler
│   └── notFound.middleware.ts     # 404 handler
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.validation.ts
│   │   ├── auth.route.ts
│   │   └── auth.types.ts
│   └── user/
│       ├── user.controller.ts
│       ├── user.service.ts
│       ├── user.repository.ts
│       ├── user.validation.ts
│       ├── user.route.ts
│       └── user.types.ts
├── routes/                        # Route aggregation
├── types/                         # Shared TypeScript types
├── utils/                         # JWT & password utilities
└── libs/                          # Shared libraries

prisma/
└── schema.prisma                  # Database schema

Dockerfile
docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js >= 20
- MySQL 8.0 (or use Docker)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd starter-node-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your values
```

### Using Docker

```bash
# Start all services (app + MySQL)
docker compose up -d

# Run migrations
docker compose exec app npx prisma migrate deploy
```

### Local Development

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

## Scripts

| Script              | Description                      |
|---------------------|----------------------------------|
| `npm run dev`       | Start dev server with ts-node    |
| `npm run build`     | Compile TypeScript to dist/      |
| `npm start`         | Run production build             |
| `npm run lint`      | Run ESLint                       |
| `npm run format`    | Format code with Prettier        |
| `npm run prisma:generate` | Generate Prisma client    |
| `npm run prisma:migrate`  | Run database migrations   |
| `npm run prisma:studio`   | Open Prisma Studio        |

## Environment Variables

| Variable             | Default       | Description              |
|----------------------|---------------|--------------------------|
| `PORT`               | `3000`        | Server port              |
| `NODE_ENV`           | `development` | Environment mode         |
| `DATABASE_URL`       | —             | MySQL connection string  |
| `JWT_ACCESS_SECRET`  | —             | JWT access token secret  |
| `JWT_REFRESH_SECRET` | —             | JWT refresh token secret |

## API Endpoints

### Auth

| Method | Path                     | Description       | Auth |
|--------|--------------------------|-------------------|------|
| POST   | `/api/v1/auth/register`  | Register user     | No   |
| POST   | `/api/v1/auth/login`     | Login             | No   |
| POST   | `/api/v1/auth/refresh`   | Refresh tokens    | No   |
| POST   | `/api/v1/auth/logout`    | Logout            | No   |

### Users

| Method | Path                     | Description       | Auth  |
|--------|--------------------------|-------------------|-------|
| GET    | `/api/v1/users`          | List users        | JWT   |
| GET    | `/api/v1/users/:id`      | Get user by ID    | JWT   |
| GET    | `/api/v1/users/admin/all`| Admin list users  | Admin |

### Health

| Method | Path               | Description   |
|--------|--------------------|---------------|
| GET    | `/api/v1/health`   | Health check  |

## Architecture

- **MVC + Service + Repository pattern** — clean separation of concerns
- **Repository pattern** — abstracts Prisma from business logic
- **Refresh token rotation** — secure token management with reuse detection
- **Centralized error handling** — custom error classes with consistent responses
- **Modular structure** — each feature is self-contained
