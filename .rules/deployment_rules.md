# Deployment Rules

> Deployment and operations standards for the ATS Resume Platform

## Docker-First Deployment

### All Services Must Be Containerized
```dockerfile
# Base image requirements
FROM node:20-alpine AS base

# Multi-stage build required
FROM base AS builder
COPY . .
RUN npm ci && npm run build

FROM base AS runner
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/server.js"]
```

### Container Requirements
- Non-root user execution
- Health check endpoints
- Graceful shutdown handling
- Resource limits defined

```yaml
# docker-compose.yml
services:
  api:
    build: ./apps/api
    user: "1000:1000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 512M
```

## Environment Isolation

### Separate Environments
| Environment | Purpose | Data |
|-------------|---------|------|
| development | Local dev | Mock/seed data |
| staging | Pre-prod testing | Anonymized prod data |
| production | Live system | Real user data |

### Environment-Specific Config
```typescript
// config/environment.ts
const config = {
  development: {
    aiModel: "qwen-7b-local",
    logLevel: "debug",
  },
  staging: {
    aiModel: "qwen-72b",
    logLevel: "info",
  },
  production: {
    aiModel: "qwen-72b",
    logLevel: "warn",
  },
};
```

## Logging Requirements

### Structured Logging
```typescript
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => ({ level: label }),
  },
});

// Usage
logger.info({ userId, action: "resume_analyzed", score: 85 }, "Resume analyzed");
```

### Required Log Fields
- `timestamp` — ISO 8601
- `level` — error/warn/info/debug
- `service` — Service name
- `requestId` — Correlation ID
- `userId` — When authenticated

### Log Retention
- Development: 7 days
- Staging: 30 days
- Production: 90 days

## Monitoring Hooks

### Health Endpoints
```typescript
// Required endpoints
GET /health       // Basic liveness
GET /health/ready // Readiness with dependencies
GET /metrics      // Prometheus metrics
```

### Required Metrics
```typescript
// Application metrics
const metrics = {
  resumesAnalyzed: new Counter("resumes_analyzed_total"),
  analysisLatency: new Histogram("analysis_duration_seconds"),
  aiApiErrors: new Counter("ai_api_errors_total"),
  activeUsers: new Gauge("active_users"),
};
```

### Alerting Rules
| Metric | Threshold | Action |
|--------|-----------|--------|
| Error rate | > 1% | Page on-call |
| Latency p99 | > 5s | Warn |
| AI failures | > 5/min | Page on-call |
| Disk usage | > 80% | Warn |

## CI/CD Pipeline

```yaml
# Required stages
stages:
  - lint        # ESLint, TypeScript
  - test        # Unit + Integration
  - build       # Docker build
  - security    # SAST, dependency scan
  - deploy-stg  # Staging deployment
  - e2e         # End-to-end tests
  - deploy-prod # Production (manual gate)
```
