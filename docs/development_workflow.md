# Development Workflow

> AI-assisted development practices for the ATS Resume Platform

## Git Workflow

### Branch Naming
```
feature/ATS-123-resume-parser
bugfix/ATS-456-score-calculation
hotfix/ATS-789-security-patch
chore/ATS-012-update-dependencies
```

### Commit Convention
```
type(scope): description

feat(parser): add PDF text extraction
fix(scoring): correct keyword matching algorithm
docs(readme): update installation steps
refactor(api): simplify error handling
test(engine): add unit tests for scorer
```

## Pull Request Process

1. **Create feature branch** from `main`
2. **Implement changes** following coding rules
3. **Run local tests** — `pnpm test`
4. **Self-review** — Check against `.rules/`
5. **Open PR** with description template
6. **Automated checks** — CI runs lint, test, build
7. **Code review** — Minimum 1 approval
8. **Merge** — Squash and merge to `main`

## Local Development

### Setup
```bash
# Clone and install
git clone <repo>
cd ats-resume-platform
pnpm install

# Environment setup
cp .env.example .env.local
# Edit .env.local with your API keys

# Start services
docker-compose up -d db redis
pnpm dev
```

### Commands
```bash
pnpm dev          # Start development servers
pnpm build        # Build all packages
pnpm test         # Run tests
pnpm lint         # Run ESLint
pnpm format       # Run Prettier
pnpm typecheck    # TypeScript check
```

## AI-Assisted Coding

### When to Use AI

| Task | AI Assistance |
|------|---------------|
| Boilerplate generation | ✅ Recommended |
| Complex algorithms | ⚠️ Review carefully |
| Security code | ❌ Manual review required |
| Database migrations | ⚠️ Verify schema |
| Test generation | ✅ Good starting point |

### AI Code Review Checklist

- [ ] Does it follow `.rules/coding_rules.md`?
- [ ] No `any` types introduced?
- [ ] Error handling in place?
- [ ] No placeholder/TODO code?
- [ ] Tests included?

## Testing Strategy

### Test Pyramid
```
         ┌─────────┐
         │   E2E   │  10%
         ├─────────┤
         │ Integr. │  30%
         ├─────────┤
         │  Unit   │  60%
         └─────────┘
```

### Test Requirements
- Unit tests for all business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Minimum 80% code coverage

## Documentation Updates

When to update docs:
- New feature → Update `architecture.md`
- API change → Update OpenAPI spec
- Config change → Update `env.schema`
- Dependency change → Update `tech_stack.md`

## Release Process

1. **Feature freeze** — No new features
2. **QA testing** — Manual + automated
3. **Changelog** — Update CHANGELOG.md
4. **Version bump** — Semantic versioning
5. **Tag release** — `git tag v1.0.0`
6. **Deploy staging** — Verify
7. **Deploy production** — Monitor
