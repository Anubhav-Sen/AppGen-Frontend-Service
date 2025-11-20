# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument for API URL
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the application
RUN npm run build

# Production stage - serve with serve package
FROM node:20-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S appuser -u 1001
USER appuser

# Expose port (Railway uses PORT env var)
EXPOSE 3000

# Default port, Railway will override with PORT env var
ENV PORT=3000

# Serve the app with SPA fallback - shell form to expand $PORT
CMD serve -s dist -l $PORT
