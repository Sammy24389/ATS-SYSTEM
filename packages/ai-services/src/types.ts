// AI Service Types

export interface AIConfig {
    apiKey: string;
    model: string;
    maxTokens?: number;
    temperature?: number;
}

export interface AIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    tokensUsed?: number;
    responseTime?: number;
}

export interface RewrittenBullet {
    original: string;
    rewritten: string;
    improvements: string[];
}

export interface KeywordSuggestion {
    keyword: string;
    context: string;
    priority: 'high' | 'medium' | 'low';
}

export interface EnhancedSummary {
    original?: string;
    enhanced: string;
    keywordsIntegrated: string[];
}

export interface SemanticMatch {
    resumeSection: string;
    jobRequirement: string;
    similarity: number;
    explanation: string;
}

export interface AIEnhancementResult {
    bullets: RewrittenBullet[];
    summary?: EnhancedSummary;
    keywordSuggestions: KeywordSuggestion[];
    semanticMatches: SemanticMatch[];
}

export type PromptVersion = 'v1' | 'v2';

export interface PromptTemplate {
    version: PromptVersion;
    name: string;
    system: string;
    user: string;
    responseFormat: 'json' | 'text';
}
