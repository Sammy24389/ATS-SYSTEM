# Architecture Rules

> System design principles for the ATS Resume Platform

## Core Principles

### API-First Design
- Design APIs before implementation
- OpenAPI specifications for all endpoints
- Contract-first development

### Separation of Concerns
- Clear boundaries between layers
- No cross-cutting concerns without abstraction
- Each module has single responsibility

### Clean Architecture

```
┌─────────────────────────────────────────────┐
│                   UI Layer                  │
│         (Next.js Pages/Components)          │
├─────────────────────────────────────────────┤
│               Application Layer             │
│            (Use Cases/Controllers)          │
├─────────────────────────────────────────────┤
│                Domain Layer                 │
│          (Business Logic/Entities)          │
├─────────────────────────────────────────────┤
│             Infrastructure Layer            │
│       (Database/External Services/AI)       │
└─────────────────────────────────────────────┘
```

## Strict Rules

### No Business Logic in UI
```typescript
// ❌ WRONG
function ResumeCard({ resume }) {
  const score = resume.keywords.length * 10; // Business logic in component
  return <div>Score: {score}</div>;
}

// ✅ CORRECT
function ResumeCard({ resume, score }) {
  return <div>Score: {score}</div>;
}
```

### No Direct AI Calls from Frontend
```typescript
// ❌ WRONG - Frontend calling AI directly
const response = await openai.chat.completions.create({...});

// ✅ CORRECT - Frontend calls API, API calls AI
const response = await api.post("/api/analyze-resume", { resume });
```

### Service-Layer Abstraction
```typescript
// All external services wrapped in service classes
class ATSService {
  async scoreResume(resume: Resume, jobDescription: string): Promise<Score> {
    // Implementation details hidden
  }
}

class AIService {
  async extractKeywords(text: string): Promise<string[]> {
    // AI provider abstracted
  }
}
```

## Package Dependencies

```
apps/web ──────→ packages/ui
    │           packages/utils
    └──────────→ apps/api (via HTTP)

apps/api ──────→ packages/ats-engine
    │           packages/ai-services
    └──────────→ packages/utils

packages/ats-engine ──→ packages/utils
packages/ai-services ──→ packages/utils
```

## Scalability Requirements

- Stateless API design
- Horizontal scaling support
- Database connection pooling
- Async job processing for heavy AI tasks
