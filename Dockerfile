FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Generate Prisma client
FROM deps AS prisma
COPY prisma ./prisma
RUN npx prisma generate

# Build TypeScript
FROM prisma AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production image
FROM base AS production
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=prisma /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
COPY package.json ./

EXPOSE 3000

CMD ["node", "dist/server.js"]
