// Redis Cache Service
// Optional caching layer for ATS scores and parsed job descriptions

import type { Redis } from 'ioredis';
import { logger } from '@/middleware/logger.js';
import { env } from '@/config/env.js';

let redisClient: Redis | null = null;

// Default TTL values (in seconds)
const TTL = {
    SCORE: 3600,        // 1 hour
    JOB_ANALYSIS: 86400, // 24 hours
    SESSION: 604800,    // 7 days
} as const;

/**
 * Initialize Redis connection
 * Falls back gracefully if Redis is unavailable
 */
export async function initializeRedis(): Promise<void> {
    if (!env.REDIS_URL) {
        logger.info('Redis URL not configured - caching disabled');
        return;
    }

    try {
        // Dynamic import to avoid requiring ioredis when not needed
        const { default: Redis } = await import('ioredis');

        redisClient = new Redis(env.REDIS_URL, {
            maxRetriesPerRequest: 3,
            retryDelayOnFailover: 100,
            lazyConnect: true,
        });

        await redisClient.connect();
        logger.info('✅ Redis connected successfully');

        redisClient.on('error', (err) => {
            logger.error('Redis error:', err);
        });

        redisClient.on('reconnecting', () => {
            logger.warn('Redis reconnecting...');
        });
    } catch (error) {
        logger.warn('Redis connection failed - caching disabled:', error);
        redisClient = null;
    }
}

/**
 * Close Redis connection gracefully
 */
export async function closeRedis(): Promise<void> {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        logger.info('Redis connection closed');
    }
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
    return redisClient !== null && redisClient.status === 'ready';
}

// ====================
// Generic Cache Operations
// ====================

export async function cacheGet<T>(key: string): Promise<T | null> {
    if (!redisClient) return null;

    try {
        const value = await redisClient.get(key);
        if (!value) return null;
        return JSON.parse(value) as T;
    } catch (error) {
        logger.error(`Cache get failed for key ${key}:`, error);
        return null;
    }
}

export async function cacheSet<T>(
    key: string,
    value: T,
    ttlSeconds: number = TTL.SCORE
): Promise<boolean> {
    if (!redisClient) return false;

    try {
        await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
        return true;
    } catch (error) {
        logger.error(`Cache set failed for key ${key}:`, error);
        return false;
    }
}

export async function cacheDelete(key: string): Promise<boolean> {
    if (!redisClient) return false;

    try {
        await redisClient.del(key);
        return true;
    } catch (error) {
        logger.error(`Cache delete failed for key ${key}:`, error);
        return false;
    }
}

export async function cacheDeletePattern(pattern: string): Promise<number> {
    if (!redisClient) return 0;

    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length === 0) return 0;
        return await redisClient.del(...keys);
    } catch (error) {
        logger.error(`Cache delete pattern failed for ${pattern}:`, error);
        return 0;
    }
}

// ====================
// Domain-Specific Cache Keys
// ====================

export const CacheKeys = {
    score: (resumeId: string, jobId: string) => `score:${resumeId}:${jobId}`,
    jobAnalysis: (hash: string) => `job:${hash}`,
    userResumes: (userId: string) => `resumes:${userId}`,
} as const;

// ====================
// Cached Score Operations
// ====================

export async function getCachedScore(
    resumeId: string,
    jobAnalysisId: string
): Promise<unknown | null> {
    return cacheGet(CacheKeys.score(resumeId, jobAnalysisId));
}

export async function setCachedScore(
    resumeId: string,
    jobAnalysisId: string,
    score: unknown
): Promise<void> {
    await cacheSet(CacheKeys.score(resumeId, jobAnalysisId), score, TTL.SCORE);
}

export async function invalidateResumeScores(resumeId: string): Promise<void> {
    await cacheDeletePattern(`score:${resumeId}:*`);
}
