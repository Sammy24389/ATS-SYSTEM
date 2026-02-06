// Hugging Face Client
// Wraps @huggingface/inference for structured LLM calls

import { HfInference } from '@huggingface/inference';
import type { AIConfig, AIResponse } from './types.js';

// ====================
// Client Configuration
// ====================

const DEFAULT_MODEL = 'Qwen/Qwen2.5-72B-Instruct';
const DEFAULT_MAX_TOKENS = 2048;
const DEFAULT_TEMPERATURE = 0.3;

let hfClient: HfInference | null = null;
let currentConfig: AIConfig | null = null;

export function initializeAIClient(config: AIConfig): void {
    currentConfig = {
        model: config.model ?? DEFAULT_MODEL,
        maxTokens: config.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature: config.temperature ?? DEFAULT_TEMPERATURE,
        apiKey: config.apiKey,
    };

    hfClient = new HfInference(config.apiKey);
}

export function getAIClient(): HfInference {
    if (!hfClient) {
        throw new Error('AI client not initialized. Call initializeAIClient first.');
    }
    return hfClient;
}

export function getConfig(): AIConfig {
    if (!currentConfig) {
        throw new Error('AI client not initialized. Call initializeAIClient first.');
    }
    return currentConfig;
}

// ====================
// Generic Completion
// ====================

export async function generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    options?: {
        maxTokens?: number;
        temperature?: number;
        responseFormat?: 'json' | 'text';
    }
): Promise<AIResponse<string>> {
    const client = getAIClient();
    const config = getConfig();

    const startTime = Date.now();

    try {
        const response = await client.chatCompletion({
            model: config.model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            max_tokens: options?.maxTokens ?? config.maxTokens,
            temperature: options?.temperature ?? config.temperature,
        });

        const content = response.choices[0]?.message?.content ?? '';
        const tokensUsed = response.usage?.total_tokens;

        return {
            success: true,
            data: content,
            tokensUsed,
            responseTime: Date.now() - startTime,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown AI error';

        return {
            success: false,
            error: errorMessage,
            responseTime: Date.now() - startTime,
        };
    }
}

// ====================
// Structured Completion
// ====================

export async function generateStructuredCompletion<T>(
    systemPrompt: string,
    userPrompt: string,
    parser: (response: string) => T,
    options?: {
        maxTokens?: number;
        temperature?: number;
    }
): Promise<AIResponse<T>> {
    const result = await generateCompletion(
        systemPrompt,
        userPrompt,
        { ...options, responseFormat: 'json' }
    );

    if (!result.success || !result.data) {
        return {
            success: false,
            error: result.error ?? 'Empty response from AI',
            responseTime: result.responseTime,
        };
    }

    try {
        const parsed = parser(result.data);
        return {
            success: true,
            data: parsed,
            tokensUsed: result.tokensUsed,
            responseTime: result.responseTime,
        };
    } catch (parseError) {
        return {
            success: false,
            error: `Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
            responseTime: result.responseTime,
        };
    }
}

// ====================
// Health Check
// ====================

export async function checkAIHealth(): Promise<boolean> {
    try {
        const result = await generateCompletion(
            'You are a test assistant.',
            'Reply with only the word "OK"',
            { maxTokens: 10 }
        );
        return result.success && result.data?.includes('OK') === true;
    } catch {
        return false;
    }
}
