// AI Response Validators
// Ensures AI outputs match expected formats

import { z } from 'zod';
import type { RewrittenBullet, KeywordSuggestion, EnhancedSummary, SemanticMatch } from './types.js';

// ====================
// Bullet Rewrite Schema
// ====================

const bulletRewriteSchema = z.object({
    bullets: z.array(
        z.object({
            original: z.string(),
            rewritten: z.string(),
            improvements: z.array(z.string()),
        })
    ),
});

export function parseBulletRewrite(response: string): RewrittenBullet[] {
    const json = extractJSON(response);
    const parsed = bulletRewriteSchema.parse(json);
    return parsed.bullets;
}

// ====================
// Keyword Suggestion Schema
// ====================

const keywordSuggestionSchema = z.object({
    suggestions: z.array(
        z.object({
            keyword: z.string(),
            context: z.string(),
            priority: z.enum(['high', 'medium', 'low']),
            whereToAdd: z.string().optional(),
        })
    ),
});

export function parseKeywordSuggestions(response: string): KeywordSuggestion[] {
    const json = extractJSON(response);
    const parsed = keywordSuggestionSchema.parse(json);
    return parsed.suggestions.map((s) => ({
        keyword: s.keyword,
        context: s.context,
        priority: s.priority,
    }));
}

// ====================
// Summary Enhancement Schema
// ====================

const summaryEnhancementSchema = z.object({
    enhanced: z.string(),
    keywordsIntegrated: z.array(z.string()),
});

export function parseSummaryEnhancement(response: string): EnhancedSummary {
    const json = extractJSON(response);
    const parsed = summaryEnhancementSchema.parse(json);
    return {
        enhanced: parsed.enhanced,
        keywordsIntegrated: parsed.keywordsIntegrated,
    };
}

// ====================
// Semantic Match Schema
// ====================

const semanticMatchSchema = z.object({
    matches: z.array(
        z.object({
            resumeSection: z.string(),
            jobRequirement: z.string(),
            similarity: z.number().min(0).max(100),
            explanation: z.string(),
        })
    ),
    overallSemanticScore: z.number().min(0).max(100),
});

export function parseSemanticMatch(response: string): {
    matches: SemanticMatch[];
    overallScore: number;
} {
    const json = extractJSON(response);
    const parsed = semanticMatchSchema.parse(json);
    return {
        matches: parsed.matches,
        overallScore: parsed.overallSemanticScore,
    };
}

// ====================
// Helper Functions
// ====================

function extractJSON(response: string): unknown {
    // Try direct parse first
    try {
        return JSON.parse(response);
    } catch {
        // Try to find JSON in response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('No valid JSON found in response');
    }
}

// ====================
// Validation Helpers
// ====================

export function validateBulletContent(rewritten: RewrittenBullet[]): boolean {
    for (const bullet of rewritten) {
        // Ensure rewritten version doesn't contain obviously fabricated metrics
        const originalHasNumbers = /\d+/.test(bullet.original);
        const rewrittenHasNumbers = /\d+/.test(bullet.rewritten);

        // If original had no numbers but rewritten does, flag for review
        if (!originalHasNumbers && rewrittenHasNumbers) {
            // Check if it's obviously fabricated
            if (/\d{2,}%|\$\d+[KMB]?/i.test(bullet.rewritten)) {
                return false;
            }
        }
    }
    return true;
}

export function sanitizeAIOutput(text: string): string {
    return text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}
