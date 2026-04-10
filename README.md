# starter-node-backend

Starter project สำหรับ Node.js backend ด้วย Express และ TypeScript

## โครงสร้างโปรเจกต์

```
src/
├── config/
│   └── env.ts               # โหลด environment variables
├── controllers/
│   └── health.controller.ts # Health check controller
├── middlewares/
│   ├── error.middleware.ts  # Global error handler
│   └── notFound.middleware.ts # 404 handler
├── routes/
│   ├── index.ts             # รวม routes ทั้งหมด
│   └── health.route.ts      # Health check route
├── app.ts                   # Express app setup
└── index.ts                 # Entry point
```

## การติดตั้ง

```bash
npm install
```

## การใช้งาน

```bash
# Development (hot-reload)
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint
```

## Environment Variables

คัดลอก `.env.example` เป็น `.env` แล้วปรับค่าตามต้องการ:

```bash
cp .env.example .env
```

| Variable   | Default       | Description             |
|------------|---------------|-------------------------|
| `PORT`     | `3000`        | พอร์ตที่ server รัน     |
| `NODE_ENV` | `development` | สภาพแวดล้อมการทำงาน     |

## API Endpoints

| Method | Path           | Description       |
|--------|----------------|-------------------|
| GET    | `/api/health`  | Health check      |

## Dependencies

- **express** — HTTP framework
- **cors** — Cross-Origin Resource Sharing
- **helmet** — Security headers
- **morgan** — HTTP request logger
- **dotenv** — Environment variable loader
