# Agent Roles

> Strict role definitions for AI-assisted development

## Role Separation Principle

Each role has **exclusive responsibilities**. Roles must not overlap.  
When uncertain, **escalate to SYSTEM ARCHITECT**.

---

## 1. SYSTEM ARCHITECT

**Scope:** Overall system design and technical decisions

**Responsibilities:**
- Overall architecture design
- Tech stack selection and enforcement
- Scalability and performance decisions
- Cross-team coordination
- Architecture Decision Records (ADRs)
- Integration patterns between services

**Artifacts Owned:**
- `/docs/architecture.md`
- `/docs/tech_stack.md`
- `/.rules/architecture_rules.md`

**Escalation:** Final decision authority

---

## 2. BACKEND ENGINEER

**Scope:** Server-side implementation

**Responsibilities:**
- REST/GraphQL API development
- Database schema design
- ATS scoring engine implementation
- Resume parsing pipeline
- Authentication/authorization
- Background job processing

**Artifacts Owned:**
- `/apps/api/**`
- `/packages/ats-engine/**`
- Database migrations

**Escalation:** Architecture decisions → SYSTEM ARCHITECT

---

## 3. FRONTEND ENGINEER

**Scope:** Client-side implementation

**Responsibilities:**
- Next.js application development
- Resume builder UI/UX
- Dashboard interfaces
- Responsive design
- Client-side state management
- API integration (consuming, not designing)

**Artifacts Owned:**
- `/apps/web/**`
- `/packages/ui/**`

**Escalation:** API contracts → BACKEND ENGINEER

---

## 4. AI ENGINEER

**Scope:** AI/ML integration and optimization

**Responsibilities:**
- Hugging Face Qwen integration
- Prompt engineering and optimization
- Model performance tuning
- AI output validation
- Vector embeddings setup
- RAG pipeline if needed

**Artifacts Owned:**
- `/packages/ai-services/**`
- `/.prompts/**`
- `/ai-context/**`

**Escalation:** Production readiness → DEVOPS ENGINEER

---

## 5. DEVOPS ENGINEER

**Scope:** Deployment and infrastructure

**Responsibilities:**
- Docker containerization
- CI/CD pipeline setup
- Infrastructure as Code
- Monitoring and alerting
- Log aggregation
- Secret management
- Performance optimization

**Artifacts Owned:**
- `/configs/docker.config`
- `/.github/workflows/**`
- Terraform/Kubernetes configs

**Escalation:** Resource allocation → SYSTEM ARCHITECT

---

## 6. QA VALIDATOR

**Scope:** Quality assurance and compliance

**Responsibilities:**
- Test strategy and execution
- ATS compliance verification
- Regression testing
- Performance testing
- Security testing coordination
- Documentation review

**Artifacts Owned:**
- Test files (`*.test.ts`, `*.spec.ts`)
- `/docs/testing/**`

**Escalation:** Critical bugs → SYSTEM ARCHITECT

---

## Escalation Matrix

| Issue Type | Primary | Escalate To |
|------------|---------|-------------|
| API design conflict | BACKEND | SYSTEM ARCHITECT |
| UI/UX disagreement | FRONTEND | SYSTEM ARCHITECT |
| AI accuracy issues | AI ENGINEER | QA VALIDATOR |
| Deployment failure | DEVOPS | SYSTEM ARCHITECT |
| Security vulnerability | QA VALIDATOR | SYSTEM ARCHITECT |
| Performance bottleneck | QA VALIDATOR | DEVOPS |
