// AI Service Integration
// Initializes Hugging Face client and provides AI-enhanced endpoints

import { initializeAIClient } from '@ats/ai-services';
import { env } from '@/config/env.js';
import { logger } from '@/middleware/logger.js';

export function initializeAIService(): void {
    if (!env.HUGGINGFACE_API_KEY) {
        logger.warn('HUGGINGFACE_API_KEY not configured - AI features will be disabled');
        return;
    }

    try {
        initializeAIClient({
            apiKey: env.HUGGINGFACE_API_KEY,
            model: 'Qwen/Qwen2.5-72B-Instruct',
            maxTokens: 2048,
            temperature: 0.3,
        });
        logger.info('✨ AI service initialized successfully');
    } catch (error) {
        logger.error('Failed to initialize AI service:', error);
    }
}

export function isAIEnabled(): boolean {
    return !!env.HUGGINGFACE_API_KEY;
}
