# ATS Domain Rules

> Understanding Applicant Tracking Systems for optimization

## What is an ATS?

Applicant Tracking Systems are software used by employers to:
- Collect and store resumes
- Parse resume content into structured data
- Rank candidates based on keyword matches
- Filter candidates before human review

**Key Insight:** 75% of resumes are rejected by ATS before a human sees them.

## ATS Parsing Constraints

### Format Compatibility

| Element | ATS-Friendly | ATS-Problematic |
|---------|--------------|-----------------|
| Font | Arial, Calibri, Times New Roman | Decorative fonts |
| Layout | Single column | Multi-column, tables |
| Headers | Standard (Experience, Skills) | Creative/unusual |
| File type | .docx, .pdf (text-based) | .pdf (scanned images) |
| Graphics | None | Images, charts, logos |
| Special characters | Basic punctuation | Symbols, emojis |

### Standard Section Headers

ATS systems recognize these headers:
```
Contact Information
Summary / Professional Summary / Objective
Work Experience / Experience / Employment History
Education
Skills / Technical Skills / Core Competencies
Certifications / Licenses
Projects
Awards / Achievements
```

❌ Avoid creative headers like:
- "My Journey"
- "What I Bring to the Table"
- "Career Highlights Reel"

## Keyword Matching Rules

### How ATS Matches Keywords

1. **Exact Match** — "Project Management" matches "Project Management"
2. **Partial Match** — "Project Manager" partially matches "Project Management"
3. **Synonym Match** — Some ATS recognize "PM" = "Project Manager"
4. **Frequency Scoring** — More occurrences = higher score

### Keyword Placement Priority

```
1. Job Title (highest weight)
2. Skills Section
3. Work Experience (in context)
4. Summary Section
5. Education / Certifications
```

### Keyword Density

- **Optimal:** 2-3 mentions of primary keywords
- **Risky:** 5+ mentions (keyword stuffing detection)
- **Invisible:** Keywords only in footer/header

## Common ATS Systems

| ATS | Market Share | Notes |
|-----|--------------|-------|
| Taleo (Oracle) | 25% | Strict parsing |
| Workday | 15% | Context-aware |
| Greenhouse | 12% | Modern, flexible |
| iCIMS | 10% | Skills matching |
| Lever | 8% | Startup-friendly |
| BambooHR | 8% | SMB focused |

## Parsing Failure Points

These cause ATS parsing errors:
- Text in headers/footers
- Tables for layout
- Text boxes
- Columns
- Images containing text
- Non-standard date formats
- Special characters in section headers
