# Universal Feedback Platform - AI Sentiment Analysis Backend
# Multi-stage Docker build for production deployment

FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

# ================================
# Dependencies stage
# ================================
FROM base AS deps

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --silent

# ================================
# Development stage
# ================================
FROM base AS development

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci --silent

# Copy source code
COPY . .

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3001

# Start development server
CMD ["dumb-init", "node", "--watch", "server.js"]

# ================================
# Production stage
# ================================
FROM base AS production

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Create directories for caching and logs
RUN mkdir -p /app/cache /app/logs

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { host: 'localhost', port: 3001, path: '/health', timeout: 5000 }; \
    const req = http.request(options, (res) => { \
      console.log('Health check status:', res.statusCode); \
      process.exit(res.statusCode === 200 ? 0 : 1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.on('timeout', () => process.exit(1)); \
    req.end();"

# Expose port
EXPOSE 3001

# Production startup
CMD ["dumb-init", "node", "server.js"]

# ================================
# Metadata
# ================================
LABEL org.opencontainers.image.title="Universal Feedback Platform Backend"
LABEL org.opencontainers.image.description="AI-powered multilingual sentiment analysis API"
LABEL org.opencontainers.image.version="2.0.0"
LABEL org.opencontainers.image.authors="Universal Feedback Platform"
LABEL org.opencontainers.image.source="https://github.com/your-username/twise-feedback"
