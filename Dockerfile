# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.15.1

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm@10.15.1

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install ALL dependencies (vite needed for conditional imports)
RUN pnpm install --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

# Expose port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start the application
CMD ["pnpm", "start"]
