# Security Rules

> Security requirements for the ATS Resume Platform

## Input Validation

### Sanitize All Inputs
```typescript
import DOMPurify from "dompurify";
import { z } from "zod";

// Schema validation
const ResumeInputSchema = z.object({
  name: z.string().max(100).regex(/^[\w\s-]+$/),
  email: z.string().email(),
  content: z.string().max(50000), // Limit size
});

// HTML sanitization
const cleanContent = DOMPurify.sanitize(userInput);
```

### SQL Injection Prevention
- Use parameterized queries ONLY
- Never concatenate user input into queries
- Use ORM with proper escaping

## File Upload Security

### Validate File Uploads
```typescript
const ALLOWED_TYPES = ["application/pdf", "application/msword", 
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function validateUpload(file: File): boolean {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("File too large");
  }
  // Verify magic bytes, not just extension
  return verifyMagicBytes(file);
}
```

### File Storage
- Store outside web root
- Generate random UUIDs for filenames
- Scan for malware before processing
- Delete temporary files after processing

## Environment Variables

### Encryption Requirements
```bash
# ❌ WRONG
API_KEY=sk-1234567890

# ✅ CORRECT - Use secrets manager
API_KEY_SECRET_NAME=ats-platform/api-key
```

### Required Secrets
- Database credentials → Secrets Manager
- AI API keys → Secrets Manager
- JWT secrets → Secrets Manager
- Encryption keys → Hardware Security Module

## Authentication

### Mandatory for All Dashboards
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const publicPaths = ["/", "/login", "/api/health"];
  
  if (!publicPaths.includes(request.pathname)) {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.redirect("/login");
    }
  }
}
```

### Session Security
- HTTP-only cookies
- Secure flag in production
- SameSite=Strict
- Session timeout: 24 hours
- Refresh token rotation

## API Security

### Rate Limiting
```typescript
const rateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window
  keyGenerator: (req) => req.ip,
});
```

### CORS Configuration
```typescript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(","),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
```

## Data Protection

- Encrypt PII at rest
- TLS 1.3 for transit
- Resume data encrypted with user-specific keys
- Right to deletion supported
- Audit logging for data access
