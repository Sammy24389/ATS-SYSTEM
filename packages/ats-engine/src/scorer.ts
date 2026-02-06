// ATS Scorer Module
// Main scoring engine with weighted formula

import type {
    ResumeData,
    JobRequirements,
    ATSScoreResult,
    ScoreComponent,
    Suggestion,
} from './types.js';
import { matchKeywords } from './keyword-matcher.js';
import { checkFormat } from './format-checker.js';

// ====================
// Score Weights
// ====================

const WEIGHTS = {
    keyword: 0.40,
    title: 0.15,
    experience: 0.20,
    format: 0.15,
    semantic: 0.10,
} as const;

// ====================
// Main Scoring Function
// ====================

export function calculateATSScore(
    resume: ResumeData,
    job: JobRequirements
): ATSScoreResult {
    // Calculate individual scores
    const keywordResult = matchKeywords(resume, job);
    const formatResult = checkFormat(resume);
    const titleScore = calculateTitleScore(resume, job);
    const experienceScore = calculateExperienceScore(resume, job);
    const semanticScore = 70; // Placeholder - will use AI service

    // Build score breakdown
    const breakdown: ATSScoreResult['breakdown'] = {
        keywordScore: {
            score: keywordResult.score,
            weight: WEIGHTS.keyword,
            weightedScore: keywordResult.score * WEIGHTS.keyword,
            details: `Matched ${keywordResult.matched.length} of ${keywordResult.matched.length + keywordResult.missing.length} keywords`,
        },
        titleScore: {
            score: titleScore,
            weight: WEIGHTS.title,
            weightedScore: titleScore * WEIGHTS.title,
            details: 'Job title relevance',
        },
        experienceScore: {
            score: experienceScore,
            weight: WEIGHTS.experience,
            weightedScore: experienceScore * WEIGHTS.experience,
            details: 'Experience alignment',
        },
        formatScore: {
            score: formatResult.score,
            weight: WEIGHTS.format,
            weightedScore: formatResult.score * WEIGHTS.format,
            details: `${formatResult.issues.length} formatting issues found`,
        },
        semanticScore: {
            score: semanticScore,
            weight: WEIGHTS.semantic,
            weightedScore: semanticScore * WEIGHTS.semantic,
            details: 'Semantic similarity (AI-enhanced)',
        },
    };

    // Calculate overall score
    const overallScore = Math.round(
        breakdown.keywordScore.weightedScore +
        breakdown.titleScore.weightedScore +
        breakdown.experienceScore.weightedScore +
        breakdown.formatScore.weightedScore +
        breakdown.semanticScore.weightedScore
    );

    // Generate suggestions
    const suggestions = generateSuggestions(
        keywordResult,
        formatResult,
        breakdown,
        job
    );

    // Classify score
    const classification = classifyScore(overallScore);

    return {
        overallScore,
        classification,
        breakdown,
        matchedKeywords: keywordResult.matched,
        missingKeywords: keywordResult.missing,
        suggestions,
    };
}

// ====================
// Score Calculations
// ====================

function calculateTitleScore(resume: ResumeData, job: JobRequirements): number {
    if (!resume.experience || resume.experience.length === 0) {
        return 0;
    }

    const jobTitleLower = job.title.toLowerCase();
    const jobTitleWords = jobTitleLower.split(/\s+/);

    let bestMatch = 0;

    for (const exp of resume.experience) {
        const resumeTitleLower = exp.title.toLowerCase();
        const resumeTitleWords = resumeTitleLower.split(/\s+/);

        // Exact match
        if (resumeTitleLower === jobTitleLower) {
            return 100;
        }

        // Word overlap
        const matchedWords = jobTitleWords.filter((w) => resumeTitleWords.includes(w));
        const similarity = (matchedWords.length / jobTitleWords.length) * 100;

        if (similarity > bestMatch) {
            bestMatch = similarity;
        }
    }

    return Math.round(bestMatch);
}

function calculateExperienceScore(resume: ResumeData, job: JobRequirements): number {
    const { min: requiredYears } = job.experienceYears;

    if (requiredYears === null) {
        // If no experience requirement, give benefit of the doubt
        return 75;
    }

    if (!resume.experience || resume.experience.length === 0) {
        return 0;
    }

    // Estimate years of experience from resume
    let estimatedYears = 0;

    for (const exp of resume.experience) {
        const startYear = extractYear(exp.startDate);
        const endYear = exp.current ? new Date().getFullYear() : extractYear(exp.endDate);

        if (startYear && endYear) {
            estimatedYears += endYear - startYear;
        } else {
            // Assume 1-2 years if dates unclear
            estimatedYears += 1;
        }
    }

    // Calculate score based on experience match
    if (estimatedYears >= requiredYears) {
        return 100;
    }

    const ratio = estimatedYears / requiredYears;
    return Math.round(ratio * 100);
}

function extractYear(dateStr?: string): number | null {
    if (!dateStr) return null;

    const match = dateStr.match(/\d{4}/);
    return match ? parseInt(match[0], 10) : null;
}

// ====================
// Classification
// ====================

function classifyScore(score: number): ATSScoreResult['classification'] {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 40) return 'poor';
    return 'critical';
}

// ====================
// Suggestion Generation
// ====================

function generateSuggestions(
    keywordResult: ReturnType<typeof matchKeywords>,
    formatResult: ReturnType<typeof checkFormat>,
    breakdown: ATSScoreResult['breakdown'],
    job: JobRequirements
): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // High priority: Missing critical keywords
    const criticalMissing = keywordResult.missing.slice(0, 5);
    for (const keyword of criticalMissing) {
        suggestions.push({
            priority: 'high',
            category: 'keyword',
            issue: `Missing keyword: "${keyword}"`,
            action: `Add "${keyword}" to your skills or experience sections if you have this competency`,
            estimatedImpact: `+${Math.round(5 / keywordResult.missing.length * 10)} points`,
        });
    }

    // High priority: Critical format issues
    const criticalIssues = formatResult.issues.filter((i) => i.type === 'critical');
    for (const issue of criticalIssues) {
        suggestions.push({
            priority: 'high',
            category: 'format',
            issue: issue.message,
            action: `Fix this issue in ${issue.location ?? 'your resume'}`,
            estimatedImpact: '+3-5 points',
        });
    }

    // Medium priority: Title mismatch
    if (breakdown.titleScore.score < 50) {
        suggestions.push({
            priority: 'medium',
            category: 'content',
            issue: 'Job title does not closely match target position',
            action: `Consider tailoring your most recent title to better match "${job.title}"`,
            estimatedImpact: '+5-8 points',
        });
    }

    // Medium priority: Experience gap
    if (breakdown.experienceScore.score < 70) {
        suggestions.push({
            priority: 'medium',
            category: 'experience',
            issue: 'Experience may not fully meet requirements',
            action: 'Highlight relevant projects, certifications, or transferable skills',
            estimatedImpact: '+3-5 points',
        });
    }

    // Low priority: Format warnings
    const warnings = formatResult.issues.filter((i) => i.type === 'warning');
    for (const warning of warnings.slice(0, 3)) {
        suggestions.push({
            priority: 'low',
            category: 'format',
            issue: warning.message,
            action: `Consider addressing this in ${warning.location ?? 'your resume'}`,
            estimatedImpact: '+1-2 points',
        });
    }

    // Add recommendations
    for (const rec of formatResult.recommendations.slice(0, 2)) {
        suggestions.push({
            priority: 'low',
            category: 'structure',
            issue: 'Improvement opportunity',
            action: rec,
            estimatedImpact: '+1-2 points',
        });
    }

    return suggestions;
}
