# Coding Rules

> Strict coding standards for the ATS Resume Platform

## TypeScript Requirements

- **TypeScript everywhere** — No JavaScript files allowed
- **No `any` types** — Use proper typing or `unknown` with type guards
- **Strict mode enabled** — `strict: true` in tsconfig

## Code Quality

- **No placeholder code** — All code must be functional
- **No TODO comments** — Complete features before merging
- **No fake APIs** — Use real implementations or proper mocks
- **No pseudocode** — All code must compile and run

## Component Standards

- **Modular reusable components only** — DRY principle enforced
- **Single responsibility** — One component, one purpose
- **Props validation** — All component props must be typed

## Error Handling

- **Explicit error handling required** — No silent failures
- **Try-catch for async operations** — All promises handled
- **User-friendly error messages** — Technical details logged, not shown
- **Error boundaries** — React components must have error boundaries

## Naming Conventions

```typescript
// Files: kebab-case
resume-parser.ts
ats-score-calculator.ts

// Components: PascalCase
ResumeBuilder.tsx
ATSScoreCard.tsx

// Functions/Variables: camelCase
calculateATSScore()
const resumeData = {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_RESUME_SIZE = 5242880
const API_BASE_URL = "..."
```

## Import Rules

```typescript
// Order: external → internal → relative → types
import { z } from "zod";
import { api } from "@/lib/api";
import { Button } from "../components";
import type { Resume } from "@/types";
```
