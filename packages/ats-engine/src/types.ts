// ATS Engine Types

export interface ResumeData {
    contactInfo: {
        fullName: string;
        email: string;
        phone?: string;
        location?: string;
        linkedin?: string;
        website?: string;
    };
    summary?: string;
    experience?: Array<{
        company: string;
        title: string;
        location?: string;
        startDate: string;
        endDate?: string;
        current?: boolean;
        bullets: string[];
    }>;
    education?: Array<{
        institution: string;
        degree: string;
        field?: string;
        graduationDate?: string;
        gpa?: string;
    }>;
    skills?: string[];
    certifications?: Array<{
        name: string;
        issuer?: string;
        date?: string;
    }>;
    projects?: Array<{
        name: string;
        description?: string;
        technologies?: string[];
        url?: string;
    }>;
    rawText?: string;
}

export interface JobRequirements {
    title: string;
    company?: string;
    requiredSkills: string[];
    preferredSkills: string[];
    tools: string[];
    softSkills: string[];
    certifications: string[];
    experienceYears: {
        min: number | null;
        max: number | null;
    };
    education?: string;
    keywords: Array<{
        term: string;
        frequency: number;
        category: 'technical' | 'soft' | 'tool' | 'certification' | 'general';
    }>;
}

export interface ATSScoreResult {
    overallScore: number;
    classification: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    breakdown: {
        keywordScore: ScoreComponent;
        titleScore: ScoreComponent;
        experienceScore: ScoreComponent;
        formatScore: ScoreComponent;
        semanticScore: ScoreComponent;
    };
    matchedKeywords: string[];
    missingKeywords: string[];
    suggestions: Suggestion[];
}

export interface ScoreComponent {
    score: number;
    weight: number;
    weightedScore: number;
    details: string;
}

export interface Suggestion {
    priority: 'high' | 'medium' | 'low';
    category: 'keyword' | 'format' | 'experience' | 'structure' | 'content';
    issue: string;
    action: string;
    estimatedImpact: string;
}

export interface FormatCheckResult {
    score: number;
    issues: FormatIssue[];
    recommendations: string[];
}

export interface FormatIssue {
    type: 'critical' | 'warning' | 'info';
    message: string;
    location?: string;
}

export interface KeywordMatchResult {
    score: number;
    matched: string[];
    missing: string[];
    partial: Array<{
        keyword: string;
        found: string;
        similarity: number;
    }>;
}
