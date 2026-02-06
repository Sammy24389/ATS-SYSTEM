import { Router } from 'express';

import { prisma } from '@/lib/prisma.js';

const router = Router();

interface HealthResponse {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    uptime: number;
    services: {
        database: 'connected' | 'disconnected';
    };
}

router.get('/health', async (_req, res) => {
    let databaseStatus: 'connected' | 'disconnected' = 'disconnected';

    try {
        await prisma.$queryRaw`SELECT 1`;
        databaseStatus = 'connected';
    } catch {
        databaseStatus = 'disconnected';
    }

    const isHealthy = databaseStatus === 'connected';

    const response: HealthResponse = {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            database: databaseStatus,
        },
    };

    res.status(isHealthy ? 200 : 503).json(response);
});

router.get('/health/live', (_req, res) => {
    res.status(200).json({ status: 'alive' });
});

router.get('/health/ready', async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: 'ready' });
    } catch {
        res.status(503).json({ status: 'not ready' });
    }
});

export const healthRouter = router;
