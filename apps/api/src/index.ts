import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { env } from '@/config/env.js';
import { connectDatabase, disconnectDatabase } from '@/lib/prisma.js';
import { httpLogger, logger } from '@/middleware/logger.js';
import { errorHandler, notFoundHandler } from '@/middleware/error-handler.js';
import { globalRateLimiter } from '@/middleware/rate-limit.js';
import { healthRouter } from '@/routes/health.js';
import { authRouter } from '@/routes/auth.js';
import { resumeRouter } from '@/routes/resumes.js';
import { scoringRouter } from '@/routes/scoring.js';
import { exportRouter } from '@/routes/export.js';
import { initializeAIService } from '@/services/ai.init.js';
import { initializeRedis, closeRedis } from '@/lib/cache.js';
import { closeBrowser } from '@/services/pdf-export.service.js';
import { sanitizeInputMiddleware, validateContentType } from '@/middleware/sanitize.js';

let app: Express | null = null;

async function getApp(): Promise<Express> {
    if (app) return app;

    app = express();

    // Security middleware
    app.use(helmet());
    app.use(
        cors({
            origin: env.ALLOWED_ORIGINS.split(','),
            credentials: true,
        })
    );

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Request logging
    app.use(httpLogger);

    // Global rate limiting
    app.use(globalRateLimiter);

    // Routes
    app.use(healthRouter);

    // API routes
    app.use('/api/auth', authRouter);
    app.use('/api/resumes', resumeRouter);
    app.use('/api/scoring', scoringRouter);
    app.use('/api/export', exportRouter);

    // Error handling
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Initialize services
    initializeAIService();

    return app;
}

// Standalone Server Start (for local dev/Railway)
async function startStandaloneServer() {
    try {
        await connectDatabase();
        const appInstance = await getApp();

        const server = appInstance.listen(env.PORT, () => {
            logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
            logger.info(`📊 Health check: http://localhost:${env.PORT}/health`);
            logger.info(`🌍 Environment: ${env.NODE_ENV}`);
        });

        // Graceful shutdown
        const shutdown = async (signal: string): Promise<void> => {
            logger.info(`${signal} received, shutting down gracefully...`);

            server.close(async () => {
                await disconnectDatabase();
                logger.info('Server closed');
                process.exit(0);
            });

            // Force close after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Only start server if running directly (not imported as Vercel function)
// VERCEL env var is usually set in Vercel environment
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    startStandaloneServer();
}

// Export for Vercel Serverless
export default async (req: any, res: any) => {
    await connectDatabase(); // Ensure DB is connected per request (or reused)
    const appInstance = await getApp();
    return appInstance(req, res);
};
