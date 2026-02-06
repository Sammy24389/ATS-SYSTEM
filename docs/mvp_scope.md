# MVP Scope

> Minimum Viable Product Definition

## MVP Goal

Launch a functional ATS resume optimization tool that allows users to:
1. Upload a resume
2. Paste a job description
3. Receive an ATS compatibility score
4. Get actionable improvement suggestions

## In Scope (MVP)

### Core Features

| Feature | Priority | Status |
|---------|----------|--------|
| Resume Upload (PDF/DOCX) | P0 | 🔲 |
| Resume Text Extraction | P0 | 🔲 |
| Job Description Input | P0 | 🔲 |
| ATS Score Calculation | P0 | 🔲 |
| Keyword Match Report | P0 | 🔲 |
| Improvement Suggestions | P0 | 🔲 |
| Basic Resume Builder | P1 | 🔲 |
| Export to PDF | P1 | 🔲 |
| User Authentication | P1 | 🔲 |
| Resume History | P2 | 🔲 |

### User Stories

```
AS A job seeker
I WANT TO upload my resume and a job description
SO THAT I can see how well my resume matches the job

AS A job seeker
I WANT TO see which keywords are missing from my resume
SO THAT I can add them before applying

AS A job seeker
I WANT TO receive AI-generated suggestions
SO THAT I can improve my resume's ATS compatibility
```

## Out of Scope (Post-MVP)

- ❌ LinkedIn integration
- ❌ Multiple language support
- ❌ Company database/insights
- ❌ Resume templates library
- ❌ Cover letter generator
- ❌ Job board integration
- ❌ Team/enterprise features
- ❌ Mobile native apps

## Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Parse accuracy | >90% | Manual QA on 100 resumes |
| Score reliability | >85% | Correlation with real ATS |
| Response time | <3s | P95 latency |
| User completion | >70% | Upload → Score funnel |

## MVP Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Setup | Week 1 | Project structure, CI/CD |
| Backend | Week 2-3 | API, parsing, scoring |
| Frontend | Week 3-4 | UI, upload, results |
| AI Integration | Week 4-5 | Suggestions, rewriting |
| Testing | Week 5-6 | QA, bug fixes |
| Launch | Week 6 | Beta release |

## Technical Constraints

- Single region deployment (initially)
- Free tier Hugging Face (rate limited)
- PostgreSQL ≤100 connections
- File storage ≤10GB (MVP)
- Max 5MB per resume upload
