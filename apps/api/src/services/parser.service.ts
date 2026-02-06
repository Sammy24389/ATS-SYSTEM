// Resume Parsing Service
// Deterministic parsing first, AI cleanup second

import type { ResumeContent } from '@/services/resume.service.js';

// ====================
// Section Patterns
// ====================

const SECTION_PATTERNS = {
    contact: /^(contact|personal)\s*(info|information|details)?$/i,
    summary: /^(summary|profile|objective|professional\s+summary|about(\s+me)?|overview)$/i,
    experience: /^(experience|work\s+(experience|history)|employment|professional\s+experience)$/i,
    education: /^(education|academic|qualifications|degrees?)$/i,
    skills: /^(skills|technical\s+skills|competencies|expertise|core\s+competencies)$/i,
    certifications: /^(certifications?|licenses?|credentials|professional\s+certifications?)$/i,
    projects: /^(projects|personal\s+projects|portfolio)$/i,
    awards: /^(awards|achievements|honors|accomplishments)$/i,
};

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const LINKEDIN_REGEX = /(?:linkedin\.com\/in\/|linkedin:?\s*)([a-zA-Z0-9-]+)/gi;
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;

const DATE_REGEX = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4}|\d{1,2}\/\d{4}|Present|Current/gi;

// ====================
// Parsing Functions
// ====================

export interface ParsedResume {
    content: ResumeContent;
    rawSections: Record<string, string>;
    confidence: number;
}

export function parseResumeText(text: string): ParsedResume {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const sections = identifySections(lines);

    const contact = extractContactInfo(text, sections.contact);
    const summary = extractSummary(sections.summary);
    const experience = extractExperience(sections.experience);
    const education = extractEducation(sections.education);
    const skills = extractSkills(sections.skills);
    const certifications = extractCertifications(sections.certifications);
    const projects = extractProjects(sections.projects);

    const content: ResumeContent = {
        contactInfo: contact,
        summary,
        experience,
        education,
        skills,
        certifications,
        projects,
    };

    // Calculate parsing confidence
    const confidence = calculateConfidence(content);

    return {
        content,
        rawSections: sections,
        confidence,
    };
}

function identifySections(lines: string[]): Record<string, string> {
    const sections: Record<string, string> = {};
    let currentSection = 'header';
    let currentContent: string[] = [];

    for (const line of lines) {
        const sectionType = detectSectionHeader(line);

        if (sectionType) {
            if (currentContent.length > 0) {
                sections[currentSection] = currentContent.join('\n');
            }
            currentSection = sectionType;
            currentContent = [];
        } else {
            currentContent.push(line);
        }
    }

    if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n');
    }

    return sections;
}

function detectSectionHeader(line: string): string | null {
    const cleanLine = line.replace(/[:\-_|]/g, '').trim();

    for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
        if (pattern.test(cleanLine)) {
            return section;
        }
    }

    return null;
}

function extractContactInfo(fullText: string, headerSection?: string): ResumeContent['contactInfo'] {
    const searchText = headerSection ?? fullText.slice(0, 1000);

    const emails = searchText.match(EMAIL_REGEX) ?? [];
    const phones = searchText.match(PHONE_REGEX) ?? [];
    const linkedinMatches = searchText.match(LINKEDIN_REGEX);
    const urls = searchText.match(URL_REGEX) ?? [];

    // Extract name (usually first non-email, non-phone line)
    const lines = searchText.split(/\r?\n/).filter(Boolean);
    let fullName = 'Unknown';

    for (const line of lines) {
        const cleanLine = line.trim();
        if (
            cleanLine.length > 2 &&
            cleanLine.length < 60 &&
            !EMAIL_REGEX.test(cleanLine) &&
            !PHONE_REGEX.test(cleanLine) &&
            !URL_REGEX.test(cleanLine)
        ) {
            fullName = cleanLine;
            break;
        }
    }

    const linkedin = linkedinMatches
        ? `https://linkedin.com/in/${linkedinMatches[0].replace(/linkedin\.com\/in\/|linkedin:?\s*/i, '')}`
        : undefined;

    const website = urls.find((u) => !u.includes('linkedin.com'));

    return {
        fullName,
        email: emails[0] ?? 'unknown@email.com',
        phone: phones[0],
        linkedin,
        website,
    };
}

function extractSummary(sectionText?: string): string | undefined {
    if (!sectionText) return undefined;
    return sectionText.trim();
}

function extractExperience(sectionText?: string): ResumeContent['experience'] {
    if (!sectionText) return [];

    const entries: NonNullable<ResumeContent['experience']> = [];
    const blocks = sectionText.split(/\n{2,}/);

    for (const block of blocks) {
        const lines = block.split('\n').filter(Boolean);
        if (lines.length === 0) continue;

        const dates = block.match(DATE_REGEX) ?? [];
        const bullets = lines.filter((l) => l.startsWith('•') || l.startsWith('-') || l.startsWith('*'));

        entries.push({
            company: lines[1]?.replace(/[•\-*]/, '').trim() ?? 'Unknown Company',
            title: lines[0]?.replace(/[•\-*]/, '').trim() ?? 'Unknown Title',
            startDate: dates[0] ?? '',
            endDate: dates[1],
            current: /present|current/i.test(block),
            bullets: bullets.map((b) => b.replace(/^[•\-*]\s*/, '').trim()),
        });
    }

    return entries;
}

function extractEducation(sectionText?: string): ResumeContent['education'] {
    if (!sectionText) return [];

    const entries: NonNullable<ResumeContent['education']> = [];
    const blocks = sectionText.split(/\n{2,}/);

    for (const block of blocks) {
        const lines = block.split('\n').filter(Boolean);
        if (lines.length === 0) continue;

        const dates = block.match(DATE_REGEX) ?? [];

        entries.push({
            institution: lines[0]?.trim() ?? 'Unknown Institution',
            degree: lines[1]?.trim() ?? 'Unknown Degree',
            graduationDate: dates[0],
        });
    }

    return entries;
}

function extractSkills(sectionText?: string): string[] {
    if (!sectionText) return [];

    // Split by common delimiters
    const skills = sectionText
        .split(/[,;|•\-\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1 && s.length < 50);

    // Remove duplicates
    return [...new Set(skills)];
}

function extractCertifications(sectionText?: string): ResumeContent['certifications'] {
    if (!sectionText) return [];

    const lines = sectionText.split('\n').filter(Boolean);

    return lines.map((line) => {
        const dates = line.match(DATE_REGEX) ?? [];
        return {
            name: line.replace(DATE_REGEX, '').trim(),
            date: dates[0],
        };
    });
}

function extractProjects(sectionText?: string): ResumeContent['projects'] {
    if (!sectionText) return [];

    const blocks = sectionText.split(/\n{2,}/);

    return blocks.map((block) => {
        const lines = block.split('\n').filter(Boolean);
        return {
            name: lines[0]?.trim() ?? 'Unknown Project',
            description: lines.slice(1).join(' ').trim(),
        };
    });
}

function calculateConfidence(content: ResumeContent): number {
    let score = 0;
    const maxScore = 100;

    // Contact info completeness
    if (content.contactInfo.fullName !== 'Unknown') score += 15;
    if (content.contactInfo.email !== 'unknown@email.com') score += 15;
    if (content.contactInfo.phone) score += 5;
    if (content.contactInfo.linkedin) score += 5;

    // Content sections
    if (content.summary && content.summary.length > 50) score += 10;
    if (content.experience && content.experience.length > 0) score += 20;
    if (content.education && content.education.length > 0) score += 15;
    if (content.skills && content.skills.length > 3) score += 10;
    if (content.certifications && content.certifications.length > 0) score += 5;

    return Math.min(score, maxScore);
}
