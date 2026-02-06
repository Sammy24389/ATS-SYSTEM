// Keyword Matcher Module
// Deterministic keyword matching with similarity scoring

import type { KeywordMatchResult, ResumeData, JobRequirements } from './types.js';

// ====================
// Keyword Matching
// ====================

export function matchKeywords(
    resume: ResumeData,
    job: JobRequirements
): KeywordMatchResult {
    const resumeText = extractResumeText(resume).toLowerCase();
    const allJobKeywords = collectJobKeywords(job);

    const matched: string[] = [];
    const missing: string[] = [];
    const partial: KeywordMatchResult['partial'] = [];

    for (const keyword of allJobKeywords) {
        const keywordLower = keyword.toLowerCase();

        if (resumeText.includes(keywordLower)) {
            matched.push(keyword);
        } else {
            // Check for partial matches
            const partialMatch = findPartialMatch(keywordLower, resumeText);
            if (partialMatch) {
                partial.push({
                    keyword,
                    found: partialMatch.found,
                    similarity: partialMatch.similarity,
                });
            } else {
                missing.push(keyword);
            }
        }
    }

    // Calculate score
    const totalKeywords = allJobKeywords.length;
    if (totalKeywords === 0) {
        return { score: 100, matched, missing, partial };
    }

    const matchedWeight = matched.length;
    const partialWeight = partial.reduce((sum, p) => sum + p.similarity, 0);
    const score = Math.round(((matchedWeight + partialWeight) / totalKeywords) * 100);

    return { score: Math.min(score, 100), matched, missing, partial };
}

// ====================
// Helper Functions
// ====================

function extractResumeText(resume: ResumeData): string {
    const parts: string[] = [];

    // Contact info
    parts.push(resume.contactInfo.fullName);

    // Summary
    if (resume.summary) {
        parts.push(resume.summary);
    }

    // Experience
    if (resume.experience) {
        for (const exp of resume.experience) {
            parts.push(exp.title);
            parts.push(exp.company);
            parts.push(...exp.bullets);
        }
    }

    // Education
    if (resume.education) {
        for (const edu of resume.education) {
            parts.push(edu.institution);
            parts.push(edu.degree);
            if (edu.field) parts.push(edu.field);
        }
    }

    // Skills
    if (resume.skills) {
        parts.push(...resume.skills);
    }

    // Certifications
    if (resume.certifications) {
        for (const cert of resume.certifications) {
            parts.push(cert.name);
            if (cert.issuer) parts.push(cert.issuer);
        }
    }

    // Projects
    if (resume.projects) {
        for (const proj of resume.projects) {
            parts.push(proj.name);
            if (proj.description) parts.push(proj.description);
            if (proj.technologies) parts.push(...proj.technologies);
        }
    }

    // Raw text if available
    if (resume.rawText) {
        parts.push(resume.rawText);
    }

    return parts.join(' ');
}

function collectJobKeywords(job: JobRequirements): string[] {
    const keywords = new Set<string>();

    // Required skills (highest priority)
    for (const skill of job.requiredSkills) {
        keywords.add(skill);
    }

    // Preferred skills
    for (const skill of job.preferredSkills) {
        keywords.add(skill);
    }

    // Tools
    for (const tool of job.tools) {
        keywords.add(tool);
    }

    // Soft skills
    for (const skill of job.softSkills) {
        keywords.add(skill);
    }

    // Certifications
    for (const cert of job.certifications) {
        keywords.add(cert);
    }

    // Additional keywords from parsed job
    for (const kw of job.keywords) {
        keywords.add(kw.term);
    }

    return Array.from(keywords);
}

function findPartialMatch(
    keyword: string,
    text: string
): { found: string; similarity: number } | null {
    // Split keyword into words for multi-word matching
    const keywordWords = keyword.split(/\s+/);

    if (keywordWords.length > 1) {
        // For multi-word keywords, check if individual words exist
        const foundWords = keywordWords.filter((w) => text.includes(w));
        if (foundWords.length > 0) {
            const similarity = foundWords.length / keywordWords.length;
            if (similarity >= 0.5) {
                return { found: foundWords.join(' '), similarity };
            }
        }
    }

    // Check for common abbreviations/variations
    const variations = getKeywordVariations(keyword);
    for (const variation of variations) {
        if (text.includes(variation)) {
            return { found: variation, similarity: 0.7 };
        }
    }

    return null;
}

function getKeywordVariations(keyword: string): string[] {
    const variations: string[] = [];
    const keywordLower = keyword.toLowerCase();

    // Common tech variations
    const techVariations: Record<string, string[]> = {
        'javascript': ['js', 'ecmascript'],
        'typescript': ['ts'],
        'python': ['py'],
        'postgresql': ['postgres', 'psql'],
        'mongodb': ['mongo'],
        'kubernetes': ['k8s'],
        'node.js': ['nodejs', 'node'],
        'react.js': ['reactjs', 'react'],
        'vue.js': ['vuejs', 'vue'],
        'next.js': ['nextjs', 'next'],
        'machine learning': ['ml'],
        'artificial intelligence': ['ai'],
        'natural language processing': ['nlp'],
        'continuous integration': ['ci'],
        'continuous deployment': ['cd'],
        'ci/cd': ['cicd', 'ci cd'],
    };

    if (techVariations[keywordLower]) {
        variations.push(...techVariations[keywordLower]);
    }

    // Check reverse mapping
    for (const [full, abbrevs] of Object.entries(techVariations)) {
        if (abbrevs.includes(keywordLower)) {
            variations.push(full);
        }
    }

    return variations;
}
