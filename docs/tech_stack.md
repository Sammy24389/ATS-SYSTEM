# Tech Stack

> Technology choices for the ATS Resume Platform

## Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework, App Router |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| shadcn/ui | latest | Component library |
| React Query | 5.x | Data fetching |
| Zustand | 4.x | State management |
| React Hook Form | 7.x | Form handling |
| Zod | 3.x | Validation |

## Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x LTS | Runtime |
| Express | 4.x | Web framework |
| TypeScript | 5.x | Type safety |
| Prisma | 5.x | ORM |
| PostgreSQL | 16.x | Primary database |
| Redis | 7.x | Cache, sessions, queue |
| BullMQ | 4.x | Job queue |
| Zod | 3.x | Validation |
| Pino | 8.x | Logging |

## AI/ML

| Technology | Purpose |
|------------|---------|
| Hugging Face Inference API | Primary AI provider |
| Qwen/Qwen2.5-72B-Instruct | Main model |
| Transformers.js | Client-side fallback |
| LangChain (optional) | Orchestration |

### Model Selection Rationale

| Model | Use Case | Why |
|-------|----------|-----|
| Qwen 72B | Complex analysis | High accuracy |
| Qwen 7B | Quick scoring | Low latency |
| Sentence Transformers | Embeddings | Keyword matching |

## Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Local development |
| GitHub Actions | CI/CD |
| Vercel | Frontend hosting |
| Railway/Render | Backend hosting |
| AWS S3 | File storage |
| Sentry | Error tracking |
| Prometheus + Grafana | Monitoring |

## Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Linting |
| Prettier | Formatting |
| Husky | Git hooks |
| Vitest | Unit testing |
| Playwright | E2E testing |
| pnpm | Package manager |
| Turborepo | Monorepo tooling |

## Document Processing

| Library | Purpose |
|---------|---------|
| pdf-parse | PDF text extraction |
| mammoth | DOCX text extraction |
| pdf-lib | PDF generation |
| docx | DOCX generation |

## Security

| Technology | Purpose |
|------------|---------|
| bcrypt | Password hashing |
| jose | JWT handling |
| helmet | HTTP security headers |
| express-rate-limit | Rate limiting |
| DOMPurify | XSS prevention |
