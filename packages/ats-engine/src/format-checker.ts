// Format Checker Module
// Checks resume format for ATS compatibility

import type { FormatCheckResult, FormatIssue, ResumeData } from './types.js';

// ====================
// Format Checks
// ====================

export function checkFormat(resume: ResumeData): FormatCheckResult {
    const issues: FormatIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check contact info completeness
    const contactScore = checkContactInfo(resume.contactInfo, issues, recommendations);
    score -= (20 - contactScore);

    // Check experience section
    const experienceScore = checkExperience(resume.experience, issues, recommendations);
    score -= (25 - experienceScore);

    // Check education section
    const educationScore = checkEducation(resume.education, issues, recommendations);
    score -= (15 - educationScore);

    // Check skills section
    const skillsScore = checkSkills(resume.skills, issues, recommendations);
    score -= (20 - skillsScore);

    // Check summary
    const summaryScore = checkSummary(resume.summary, issues, recommendations);
    score -= (10 - summaryScore);

    // Check overall structure
    const structureScore = checkStructure(resume, issues, recommendations);
    score -= (10 - structureScore);

    return {
        score: Math.max(0, Math.min(100, score)),
        issues,
        recommendations,
    };
}

// ====================
// Section Checks
// ====================

function checkContactInfo(
    contact: ResumeData['contactInfo'],
    issues: FormatIssue[],
    recommendations: string[]
): number {
    let score = 20;

    if (!contact.fullName || contact.fullName === 'Unknown') {
        issues.push({
            type: 'critical',
            message: 'Name is missing or could not be parsed',
            location: 'Contact Information',
        });
        score -= 5;
    }

    if (!contact.email || !contact.email.includes('@')) {
        issues.push({
            type: 'critical',
            message: 'Valid email address is required',
            location: 'Contact Information',
        });
        score -= 5;
    }

    if (!contact.phone) {
        issues.push({
            type: 'warning',
            message: 'Phone number is recommended',
            location: 'Contact Information',
        });
        score -= 2;
    }

    if (!contact.linkedin) {
        recommendations.push('Add LinkedIn profile URL to improve professional presence');
        score -= 1;
    }

    if (!contact.location) {
        issues.push({
            type: 'info',
            message: 'Consider adding city/state location',
            location: 'Contact Information',
        });
        score -= 1;
    }

    return Math.max(0, score);
}

function checkExperience(
    experience: ResumeData['experience'],
    issues: FormatIssue[],
    recommendations: string[]
): number {
    let score = 25;

    if (!experience || experience.length === 0) {
        issues.push({
            type: 'critical',
            message: 'Work experience section is missing or empty',
            location: 'Experience',
        });
        return 0;
    }

    for (let i = 0; i < experience.length; i++) {
        const exp = experience[i];

        if (!exp.title || exp.title === 'Unknown Title') {
            issues.push({
                type: 'warning',
                message: `Job title missing for experience entry ${i + 1}`,
                location: 'Experience',
            });
            score -= 2;
        }

        if (!exp.company || exp.company === 'Unknown Company') {
            issues.push({
                type: 'warning',
                message: `Company name missing for experience entry ${i + 1}`,
                location: 'Experience',
            });
            score -= 2;
        }

        if (!exp.bullets || exp.bullets.length === 0) {
            issues.push({
                type: 'warning',
                message: `No bullet points for experience at ${exp.company}`,
                location: 'Experience',
            });
            score -= 3;
        } else {
            // Check bullet point quality
            const shortBullets = exp.bullets.filter((b) => b.length < 30);
            if (shortBullets.length > exp.bullets.length / 2) {
                recommendations.push(`Expand bullet points for ${exp.company} with more detail and metrics`);
                score -= 1;
            }

            // Check for quantification
            const hasNumbers = exp.bullets.some((b) => /\d+%?/.test(b));
            if (!hasNumbers) {
                recommendations.push(`Add quantified achievements (numbers, percentages) for ${exp.company}`);
                score -= 1;
            }
        }

        if (!exp.startDate) {
            issues.push({
                type: 'info',
                message: `Missing start date for ${exp.company}`,
                location: 'Experience',
            });
            score -= 1;
        }
    }

    return Math.max(0, score);
}

function checkEducation(
    education: ResumeData['education'],
    issues: FormatIssue[],
    _recommendations: string[]
): number {
    let score = 15;

    if (!education || education.length === 0) {
        issues.push({
            type: 'warning',
            message: 'Education section is missing',
            location: 'Education',
        });
        return 5; // Not always required, but recommended
    }

    for (const edu of education) {
        if (!edu.institution || edu.institution === 'Unknown Institution') {
            issues.push({
                type: 'warning',
                message: 'Institution name is missing',
                location: 'Education',
            });
            score -= 3;
        }

        if (!edu.degree || edu.degree === 'Unknown Degree') {
            issues.push({
                type: 'warning',
                message: 'Degree information is missing',
                location: 'Education',
            });
            score -= 3;
        }
    }

    return Math.max(0, score);
}

function checkSkills(
    skills: ResumeData['skills'],
    issues: FormatIssue[],
    recommendations: string[]
): number {
    let score = 20;

    if (!skills || skills.length === 0) {
        issues.push({
            type: 'critical',
            message: 'Skills section is missing - critical for ATS matching',
            location: 'Skills',
        });
        return 0;
    }

    if (skills.length < 5) {
        issues.push({
            type: 'warning',
            message: 'Skills section has fewer than 5 skills',
            location: 'Skills',
        });
        score -= 5;
        recommendations.push('Add more relevant skills to improve keyword matching');
    }

    if (skills.length > 30) {
        issues.push({
            type: 'info',
            message: 'Skills section may be too long - consider prioritizing top skills',
            location: 'Skills',
        });
        score -= 2;
    }

    return Math.max(0, score);
}

function checkSummary(
    summary: ResumeData['summary'],
    issues: FormatIssue[],
    recommendations: string[]
): number {
    let score = 10;

    if (!summary) {
        issues.push({
            type: 'info',
            message: 'Professional summary is missing',
            location: 'Summary',
        });
        recommendations.push('Add a 2-3 sentence professional summary highlighting key qualifications');
        return 5;
    }

    if (summary.length < 50) {
        issues.push({
            type: 'warning',
            message: 'Professional summary is too short',
            location: 'Summary',
        });
        score -= 3;
    }

    if (summary.length > 500) {
        issues.push({
            type: 'info',
            message: 'Professional summary may be too long',
            location: 'Summary',
        });
        recommendations.push('Shorten summary to 2-3 impactful sentences');
        score -= 2;
    }

    return Math.max(0, score);
}

function checkStructure(
    resume: ResumeData,
    issues: FormatIssue[],
    _recommendations: string[]
): number {
    let score = 10;

    // Check section presence
    const sections = {
        contact: !!resume.contactInfo.email,
        experience: !!(resume.experience && resume.experience.length > 0),
        education: !!(resume.education && resume.education.length > 0),
        skills: !!(resume.skills && resume.skills.length > 0),
    };

    const presentSections = Object.values(sections).filter(Boolean).length;

    if (presentSections < 3) {
        issues.push({
            type: 'critical',
            message: 'Resume is missing critical sections',
            location: 'Structure',
        });
        score -= 5;
    }

    if (!sections.experience && !sections.education) {
        issues.push({
            type: 'critical',
            message: 'Resume needs at least experience or education section',
            location: 'Structure',
        });
        score -= 5;
    }

    return Math.max(0, score);
}
