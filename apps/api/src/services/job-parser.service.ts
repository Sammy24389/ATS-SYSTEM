// Job Description Parser Service
// Hybrid: Deterministic parsing + AI refinement

import { z } from 'zod';
import { ValidationError } from '@/middleware/error-handler.js';
import { prisma } from '@/lib/prisma.js';

// ====================
// Types
// ====================

export interface ParsedJobDescription {
    title: string;
    company: string | null;
    location: string | null;
    employmentType: string | null;
    experienceYears: {
        min: number | null;
        max: number | null;
    };
    education: string | null;
    requiredSkills: string[];
    preferredSkills: string[];
    tools: string[];
    softSkills: string[];
    certifications: string[];
    keywords: Array<{
        term: string;
        frequency: number;
        category: 'technical' | 'soft' | 'tool' | 'certification' | 'general';
    }>;
    responsibilities: string[];
}

export const jobDescriptionInputSchema = z.object({
    rawDescription: z.string().min(50, 'Job description must be at least 50 characters'),
    title: z.string().optional(),
    company: z.string().optional(),
});

export type JobDescriptionInput = z.infer<typeof jobDescriptionInputSchema>;

// ====================
// Patterns for Extraction
// ====================

const EXPERIENCE_PATTERNS = [
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)/gi,
    /(?:minimum|at least)\s*(\d+)\s*(?:years?|yrs?)/gi,
    /(\d+)\s*(?:to|-)\s*(\d+)\s*(?:years?|yrs?)/gi,
];

const EDUCATION_PATTERNS = [
    /(?:bachelor'?s?|bs|ba)\s*(?:degree)?(?:\s+in\s+[\w\s]+)?/gi,
    /(?:master'?s?|ms|ma|mba)\s*(?:degree)?(?:\s+in\s+[\w\s]+)?/gi,
    /(?:ph\.?d\.?|doctorate)/gi,
    /(?:associate'?s?)\s*(?:degree)?/gi,
];

const EMPLOYMENT_TYPE_PATTERNS = [
    /\b(full[-\s]?time|part[-\s]?time|contract|freelance|remote|hybrid|on[-\s]?site)\b/gi,
];

const LOCATION_PATTERNS = [
    /(?:location|based in|office in|located in)[:\s]+([^.\n]+)/gi,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2})/g, // City, State
];

// Common technical skills database
const TECHNICAL_SKILLS = new Set([
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby',
    'react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'fastify',
    'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
    'git', 'ci/cd', 'jenkins', 'github actions',
    'machine learning', 'deep learning', 'nlp', 'computer vision',
    'rest', 'graphql', 'api', 'microservices',
    'agile', 'scrum', 'kanban',
]);

const SOFT_SKILLS = new Set([
    'communication', 'leadership', 'teamwork', 'problem solving', 'critical thinking',
    'time management', 'adaptability', 'collaboration', 'creativity', 'attention to detail',
    'interpersonal', 'analytical', 'organizational', 'decision making', 'conflict resolution',
]);

const COMMON_TOOLS = new Set([
    'jira', 'confluence', 'slack', 'teams', 'figma', 'sketch', 'photoshop',
    'tableau', 'power bi', 'excel', 'salesforce', 'hubspot',
    'postman', 'swagger', 'datadog', 'splunk', 'grafana',
]);

// ====================
// Parsing Functions
// ====================

export function parseJobDescription(text: string, metadata?: { title?: string; company?: string }): ParsedJobDescription {
    const normalizedText = text.toLowerCase();

    const experienceYears = extractExperienceYears(text);
    const education = extractEducation(text);
    const employmentType = extractEmploymentType(text);
    const location = extractLocation(text);
    const skills = extractSkills(normalizedText);
    const responsibilities = extractResponsibilities(text);
    const keywords = extractKeywords(normalizedText, skills);

    return {
        title: metadata?.title ?? extractJobTitle(text),
        company: metadata?.company ?? null,
        location,
        employmentType,
        experienceYears,
        education,
        requiredSkills: skills.required,
        preferredSkills: skills.preferred,
        tools: skills.tools,
        softSkills: skills.soft,
        certifications: skills.certifications,
        keywords,
        responsibilities,
    };
}

function extractJobTitle(text: string): string {
    const lines = text.split('\n').filter(Boolean);
    // Title is usually in the first few lines
    for (const line of lines.slice(0, 5)) {
        const trimmed = line.trim();
        if (trimmed.length > 5 && trimmed.length < 100 && !trimmed.includes('@')) {
            return trimmed;
        }
    }
    return 'Unknown Position';
}

function extractExperienceYears(text: string): { min: number | null; max: number | null } {
    for (const pattern of EXPERIENCE_PATTERNS) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            if (match[2]) {
                return { min: parseInt(match[1], 10), max: parseInt(match[2], 10) };
            }
            if (match[1]) {
                return { min: parseInt(match[1], 10), max: null };
            }
        }
    }
    return { min: null, max: null };
}

function extractEducation(text: string): string | null {
    for (const pattern of EDUCATION_PATTERNS) {
        const match = text.match(pattern);
        if (match) {
            return match[0].trim();
        }
    }
    return null;
}

function extractEmploymentType(text: string): string | null {
    for (const pattern of EMPLOYMENT_TYPE_PATTERNS) {
        const match = text.match(pattern);
        if (match) {
            return match[1].toLowerCase().replace(/[-\s]+/g, '-');
        }
    }
    return null;
}

function extractLocation(text: string): string | null {
    for (const pattern of LOCATION_PATTERNS) {
        const match = text.match(pattern);
        if (match) {
            return match[1]?.trim() ?? match[0]?.trim();
        }
    }
    return null;
}

function extractSkills(text: string): {
    required: string[];
    preferred: string[];
    tools: string[];
    soft: string[];
    certifications: string[];
} {
    const required: string[] = [];
    const preferred: string[] = [];
    const tools: string[] = [];
    const soft: string[] = [];
    const certifications: string[] = [];

    // Find technical skills
    for (const skill of TECHNICAL_SKILLS) {
        if (text.includes(skill)) {
            required.push(skill);
        }
    }

    // Find soft skills
    for (const skill of SOFT_SKILLS) {
        if (text.includes(skill)) {
            soft.push(skill);
        }
    }

    // Find tools
    for (const tool of COMMON_TOOLS) {
        if (text.includes(tool)) {
            tools.push(tool);
        }
    }

    // Extract certifications
    const certPatterns = [
        /\b(aws\s+certified\s+[\w\s]+)/gi,
        /\b(pmp|scrum master|csm)\b/gi,
        /\b(cpa|cfa|cissp)\b/gi,
    ];

    for (const pattern of certPatterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            certifications.push(match[1]);
        }
    }

    return { required, preferred, tools, soft, certifications };
}

function extractResponsibilities(text: string): string[] {
    const responsibilities: string[] = [];
    const lines = text.split('\n');

    let inResponsibilitiesSection = false;

    for (const line of lines) {
        const trimmed = line.trim();

        if (/responsibilities|duties|what you('ll| will) do/i.test(trimmed)) {
            inResponsibilitiesSection = true;
            continue;
        }

        if (inResponsibilitiesSection) {
            if (/requirements|qualifications|skills/i.test(trimmed)) {
                break;
            }

            if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
                responsibilities.push(trimmed.replace(/^[•\-*]\s*/, ''));
            }
        }
    }

    return responsibilities;
}

function extractKeywords(
    text: string,
    skills: { required: string[]; preferred: string[]; tools: string[]; soft: string[] }
): ParsedJobDescription['keywords'] {
    const keywords: Map<string, { frequency: number; category: ParsedJobDescription['keywords'][0]['category'] }> = new Map();

    // Add skills as keywords with categories
    for (const skill of skills.required) {
        const freq = (text.match(new RegExp(skill, 'gi')) ?? []).length;
        keywords.set(skill, { frequency: freq, category: 'technical' });
    }

    for (const tool of skills.tools) {
        const freq = (text.match(new RegExp(tool, 'gi')) ?? []).length;
        keywords.set(tool, { frequency: freq, category: 'tool' });
    }

    for (const soft of skills.soft) {
        const freq = (text.match(new RegExp(soft, 'gi')) ?? []).length;
        keywords.set(soft, { frequency: freq, category: 'soft' });
    }

    return Array.from(keywords.entries())
        .map(([term, data]) => ({ term, ...data }))
        .sort((a, b) => b.frequency - a.frequency);
}

// ====================
// Database Operations
// ====================

export async function createJobAnalysis(
    userId: string,
    input: JobDescriptionInput
): Promise<{ id: string; parsed: ParsedJobDescription }> {
    const validated = jobDescriptionInputSchema.safeParse(input);
    if (!validated.success) {
        throw new ValidationError('Invalid job description', validated.error.flatten().fieldErrors);
    }

    const parsed = parseJobDescription(validated.data.rawDescription, {
        title: validated.data.title,
        company: validated.data.company,
    });

    const jobAnalysis = await prisma.jobAnalysis.create({
        data: {
            userId,
            title: parsed.title,
            company: parsed.company,
            rawDescription: validated.data.rawDescription,
            parsedData: parsed,
            keywords: parsed.keywords.map((k) => k.term),
        },
    });

    return { id: jobAnalysis.id, parsed };
}

export async function getJobAnalysis(
    userId: string,
    analysisId: string
): Promise<{ id: string; parsed: ParsedJobDescription } | null> {
    const analysis = await prisma.jobAnalysis.findFirst({
        where: { id: analysisId, userId },
    });

    if (!analysis) return null;

    return {
        id: analysis.id,
        parsed: analysis.parsedData as ParsedJobDescription,
    };
}
