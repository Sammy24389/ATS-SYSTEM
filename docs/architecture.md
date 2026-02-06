# Architecture

> ATS Resume Platform System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Next.js Web App                        │   │
│  │         (Resume Builder, Dashboard, Analytics)           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   REST API (Node.js)                     │   │
│  │     Auth | Resume | Jobs | Scoring | Export | Users      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
┌───────────────────┐ ┌───────────────┐ ┌───────────────────┐
│   ATS Engine      │ │  AI Services  │ │    Database       │
│   (Scoring)       │ │ (Hugging Face)│ │   (PostgreSQL)    │
└───────────────────┘ └───────────────┘ └───────────────────┘
```

## Package Structure

```
ats-resume-platform/
├── apps/
│   ├── web/                 # Next.js 14 Frontend
│   │   ├── app/            # App Router pages
│   │   ├── components/     # UI components
│   │   └── lib/            # Client utilities
│   │
│   └── api/                 # Node.js Backend
│       ├── controllers/    # Route handlers
│       ├── services/       # Business logic
│       ├── models/         # Database models
│       └── middleware/     # Auth, validation
│
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── utils/               # Shared utilities
│   ├── ats-engine/          # ATS scoring logic
│   └── ai-services/         # AI integrations
```

## Data Flow

### Resume Analysis Flow
```
1. User uploads resume (PDF/DOCX)
2. API validates and stores file
3. Resume Parser extracts text → structured data
4. User submits job description
5. Job Parser extracts requirements/keywords
6. ATS Engine scores resume vs job
7. AI Service generates suggestions
8. Results returned to frontend
```

### Scoring Pipeline
```
Resume Text → Parser → Structured Resume
                              │
Job Description → Parser → Requirements
                              │
                              ▼
                    ┌─────────────────┐
                    │   ATS Engine    │
                    │  ┌───────────┐  │
                    │  │ Keyword   │  │
                    │  │ Matcher   │  │
                    │  └───────────┘  │
                    │  ┌───────────┐  │
                    │  │ Format    │  │
                    │  │ Checker   │  │
                    │  └───────────┘  │
                    │  ┌───────────┐  │
                    │  │ Structure │  │
                    │  │ Analyzer  │  │
                    │  └───────────┘  │
                    └───────────────────┘
                              │
                              ▼
                       Score + Report
```

## Technology Decisions

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Frontend | Next.js 14 | SSR, App Router, React |
| Backend | Node.js + Express | TypeScript, async |
| Database | PostgreSQL | Relational, JSON support |
| Cache | Redis | Session, rate limiting |
| AI | Hugging Face | Qwen models, self-hosted option |
| Queue | BullMQ | Background jobs |
| Storage | S3-compatible | Resume files |

## Security Architecture

- JWT authentication with refresh tokens
- Rate limiting per user/IP
- File upload scanning
- Input sanitization (Zod validation)
- Encrypted sensitive data at rest
- TLS for all connections
