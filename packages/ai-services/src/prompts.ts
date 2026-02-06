// AI Prompts with Version Control
// All prompts are versioned and validated

import type { PromptTemplate } from './types.js';

// ====================
// Resume Rewrite Prompt
// ====================

export const RESUME_REWRITE_PROMPT: PromptTemplate = {
    version: 'v1',
    name: 'resume_rewrite',
    responseFormat: 'json',
    system: `You are an expert ATS resume optimizer. Your task is to rewrite resume bullet points to be more impactful and ATS-friendly.

CRITICAL RULES:
1. NEVER fabricate information - only enhance what the user provided
2. Preserve all factual claims - do not add fake metrics or achievements
3. Use strong action verbs at the start of each bullet
4. Quantify achievements ONLY if the original contains numbers
5. Integrate relevant keywords naturally
6. Keep bullets concise (under 100 characters preferred)

OUTPUT FORMAT (JSON):
{
  "bullets": [
    {
      "original": "string",
      "rewritten": "string",
      "improvements": ["string"]
    }
  ]
}`,
    user: `Rewrite the following resume bullets for a {{targetRole}} position.

TARGET KEYWORDS: {{keywords}}

ORIGINAL BULLETS:
{{bullets}}

Return only valid JSON matching the specified format.`,
};

// ====================
// Keyword Integration Prompt
// ====================

export const KEYWORD_INTEGRATION_PROMPT: PromptTemplate = {
    version: 'v1',
    name: 'keyword_integration',
    responseFormat: 'json',
    system: `You are an ATS keyword optimization specialist. Your task is to suggest how to naturally integrate missing keywords into a resume.

CRITICAL RULES:
1. Only suggest keywords the candidate might realistically have
2. Suggest specific locations in the resume for each keyword
3. Provide natural-sounding context phrases
4. Do NOT suggest fabricating experience

OUTPUT FORMAT (JSON):
{
  "suggestions": [
    {
      "keyword": "string",
      "context": "string",
      "priority": "high|medium|low",
      "wherToAdd": "string"
    }
  ]
}`,
    user: `Suggest how to integrate these missing keywords into the resume:

MISSING KEYWORDS: {{missingKeywords}}

CURRENT RESUME SKILLS: {{currentSkills}}

RESUME EXPERIENCE SUMMARY: {{experienceSummary}}

Return only valid JSON matching the specified format.`,
};

// ====================
// Summary Enhancement Prompt
// ====================

export const SUMMARY_ENHANCEMENT_PROMPT: PromptTemplate = {
    version: 'v1',
    name: 'summary_enhancement',
    responseFormat: 'json',
    system: `You are a professional resume writer specializing in executive summaries. Create compelling professional summaries that are ATS-optimized.

CRITICAL RULES:
1. Keep summary to 2-3 sentences maximum
2. Lead with years of experience and primary expertise
3. Include 3-5 relevant keywords naturally
4. End with unique value proposition
5. Do NOT include personal pronouns (I, my, etc.)

OUTPUT FORMAT (JSON):
{
  "enhanced": "string",
  "keywordsIntegrated": ["string"]
}`,
    user: `Create an enhanced professional summary for a {{targetRole}} position.

CURRENT SUMMARY: {{currentSummary}}

YEARS OF EXPERIENCE: {{yearsExperience}}

TOP SKILLS: {{topSkills}}

TARGET KEYWORDS: {{targetKeywords}}

Return only valid JSON matching the specified format.`,
};

// ====================
// Semantic Matching Prompt
// ====================

export const SEMANTIC_MATCHING_PROMPT: PromptTemplate = {
    version: 'v1',
    name: 'semantic_matching',
    responseFormat: 'json',
    system: `You are an expert at matching resume content to job requirements. Analyze semantic similarity between resume sections and job requirements.

OUTPUT FORMAT (JSON):
{
  "matches": [
    {
      "resumeSection": "string",
      "jobRequirement": "string",
      "similarity": 0-100,
      "explanation": "string"
    }
  ],
  "overallSemanticScore": 0-100
}`,
    user: `Analyze the semantic match between this resume and job description.

RESUME CONTENT:
{{resumeContent}}

JOB REQUIREMENTS:
{{jobRequirements}}

Return only valid JSON matching the specified format.`,
};

// ====================
// Template Rendering
// ====================

export function renderPrompt(
    template: PromptTemplate,
    variables: Record<string, string | string[]>
): { system: string; user: string } {
    let userPrompt = template.user;

    for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        const replacement = Array.isArray(value) ? value.join(', ') : value;
        userPrompt = userPrompt.replace(new RegExp(placeholder, 'g'), replacement);
    }

    return {
        system: template.system,
        user: userPrompt,
    };
}

// ====================
// Prompt Registry
// ====================

const PROMPT_REGISTRY: Map<string, PromptTemplate> = new Map([
    ['resume_rewrite', RESUME_REWRITE_PROMPT],
    ['keyword_integration', KEYWORD_INTEGRATION_PROMPT],
    ['summary_enhancement', SUMMARY_ENHANCEMENT_PROMPT],
    ['semantic_matching', SEMANTIC_MATCHING_PROMPT],
]);

export function getPrompt(name: string): PromptTemplate | undefined {
    return PROMPT_REGISTRY.get(name);
}

export function listPrompts(): string[] {
    return Array.from(PROMPT_REGISTRY.keys());
}
