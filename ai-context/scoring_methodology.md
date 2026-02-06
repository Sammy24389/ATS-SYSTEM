# Scoring Methodology

> ATS compatibility scoring formulas and algorithms

## Overall Score Calculation

```
ATS_SCORE = (KEYWORD_SCORE × 0.40) + (FORMAT_SCORE × 0.25) + 
            (STRUCTURE_SCORE × 0.20) + (COMPLETENESS_SCORE × 0.15)
```

### Score Ranges

| Score | Rating | Interpretation |
|-------|--------|----------------|
| 90-100 | Excellent | High ATS pass rate |
| 75-89 | Good | Likely to pass most ATS |
| 60-74 | Fair | May need optimization |
| 40-59 | Poor | Significant improvements needed |
| 0-39 | Critical | Major restructuring required |

---

## Keyword Score (40%)

### Formula
```
KEYWORD_SCORE = (MATCHED_KEYWORDS / REQUIRED_KEYWORDS) × 100

Where:
- MATCHED_KEYWORDS = Keywords found in resume
- REQUIRED_KEYWORDS = Keywords extracted from job description
```

### Keyword Categories and Weights

| Category | Weight | Examples |
|----------|--------|----------|
| Job Title | 20% | "Software Engineer", "Product Manager" |
| Hard Skills | 30% | "Python", "SQL", "AWS" |
| Soft Skills | 15% | "Leadership", "Communication" |
| Tools | 20% | "Jira", "Salesforce", "Figma" |
| Certifications | 15% | "PMP", "AWS Certified", "CPA" |

### Match Types

```typescript
enum MatchType {
  EXACT = 1.0,      // "Python" → "Python"
  PARTIAL = 0.7,    // "Python" → "Python programming"
  SYNONYM = 0.5,    // "Python" → "Py"
  RELATED = 0.3,    // "Python" → "Django" (known relation)
}
```

---

## Format Score (25%)

### Evaluation Criteria

| Criterion | Points | Check |
|-----------|--------|-------|
| File is .docx or text-based PDF | 20 | `file.type in ['docx', 'pdf']` |
| No tables/columns | 20 | `tables.count == 0` |
| Standard fonts used | 15 | `font in ALLOWED_FONTS` |
| No images/graphics | 15 | `images.count == 0` |
| Reasonable length (1-2 pages) | 15 | `1 <= pages <= 2` |
| No special characters in headers | 15 | `headers.match(/^[A-Za-z\s]+$/)` |

### Deductions

```typescript
const formatDeductions = {
  tables: -20,
  multiColumn: -15,
  images: -10,
  headerFooterText: -10,
  textBoxes: -15,
  unusualFonts: -5,
  excessiveFormatting: -5,
};
```

---

## Structure Score (20%)

### Required Sections

| Section | Required | Points |
|---------|----------|--------|
| Contact Info | Yes | 15 |
| Experience | Yes | 25 |
| Skills | Yes | 20 |
| Education | Yes | 15 |
| Summary | Recommended | 10 |
| Certifications | Optional | 10 |
| Projects | Optional | 5 |

### Section Header Recognition

```typescript
const headerMappings = {
  experience: ["work experience", "experience", "employment", "work history"],
  education: ["education", "academic background", "qualifications"],
  skills: ["skills", "technical skills", "competencies", "expertise"],
  summary: ["summary", "professional summary", "profile", "objective"],
};
```

---

## Completeness Score (15%)

### Evaluation Points

| Element | Points |
|---------|--------|
| Email present | 10 |
| Phone present | 10 |
| Location present | 5 |
| 3+ experience entries | 20 |
| 5+ skills listed | 15 |
| Education with dates | 10 |
| Quantified achievements | 20 |
| LinkedIn URL | 10 |

---

## Job Description Parsing

### Required Extractions

```typescript
interface ParsedJobDescription {
  title: string;
  company: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experience_years: number;
  education: string;
  certifications: string[];
  softSkills: string[];
  tools: string[];
  keywords: {
    term: string;
    frequency: number;
    category: KeywordCategory;
  }[];
}
```

### Keyword Extraction Algorithm

1. **Tokenize** — Split text into words
2. **Remove stopwords** — Filter common words
3. **Identify noun phrases** — Capture multi-word skills
4. **Match against skill database** — Verify known skills
5. **Rank by frequency** — Priority by mention count
6. **Categorize** — Assign to skill categories
