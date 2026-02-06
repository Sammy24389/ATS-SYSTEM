# AI Usage Rules

> Guidelines for responsible AI integration in the ATS Resume Platform

## Core Principles

### Never Fabricate Data
- **NEVER hallucinate resume experience**
- **NEVER invent job history, skills, or qualifications**
- Only enhance/reword what the user provides
- Preserve factual accuracy at all times

### Deterministic Before LLM
```typescript
// ✅ CORRECT: Parse deterministically first
const parsed = parseResumeStructure(rawText);  // Deterministic
const enhanced = await ai.enhance(parsed);      // AI enhancement

// ❌ WRONG: Direct AI parsing
const parsed = await ai.parseResume(rawText);   // Unpredictable
```

## Prompt Version Control

### All Prompts Must Be Versioned
```typescript
// prompts/resume-rewrite.v1.prompt
// prompts/resume-rewrite.v2.prompt

const PROMPT_VERSION = "v2.1.0";

async function rewriteResume(content: string) {
  const prompt = await loadPrompt("resume-rewrite", PROMPT_VERSION);
  // ...
}
```

### Prompt Change Tracking
- Git history for all `.prompt` files
- Changelog for prompt modifications
- A/B testing for major changes

## AI Output Validation

### Always Validate AI Outputs
```typescript
import { z } from "zod";

const ATSScoreSchema = z.object({
  overallScore: z.number().min(0).max(100),
  keywordMatches: z.array(z.string()),
  suggestions: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

async function getATSScore(resume: string, job: string) {
  const raw = await ai.analyze(resume, job);
  const validated = ATSScoreSchema.parse(raw); // Throws if invalid
  return validated;
}
```

### Fallback Strategies
```typescript
try {
  return await ai.extractKeywords(text);
} catch (error) {
  logger.error("AI extraction failed", error);
  return fallbackKeywordExtraction(text); // Deterministic fallback
}
```

## Structured Outputs

### Always Request JSON
```typescript
const prompt = `
Extract keywords from the following resume.
Return ONLY valid JSON in this format:
{
  "technical_skills": ["skill1", "skill2"],
  "soft_skills": ["skill1", "skill2"],
  "certifications": ["cert1", "cert2"]
}
`;
```

### Temperature Settings
| Task | Temperature | Reason |
|------|-------------|--------|
| Keyword extraction | 0.0 | Deterministic |
| ATS scoring | 0.0 | Consistent results |
| Resume rewriting | 0.3 | Slight creativity |
| Suggestions | 0.5 | More options |

## Prohibited Behaviors

- ❌ Never claim skills the user doesn't have
- ❌ Never add fake certifications
- ❌ Never invent work experience
- ❌ Never guess dates or durations
- ❌ Never assume job titles or responsibilities
