import pino from 'pino';
import pinoHttp from 'pino-http';

import { env } from '@/config/env.js';

export const logger = pino({
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    transport:
        env.NODE_ENV === 'development'
            ? {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                },
            }
            : undefined,
    formatters: {
        level: (label) => ({ level: label }),
    },
    base: {
        service: 'ats-api',
        env: env.NODE_ENV,
    },
});

export const httpLogger = pinoHttp({
    logger,
    customLogLevel: (_req, res, error) => {
        if (error || res.statusCode >= 500) {
            return 'error';
        }
        if (res.statusCode >= 400) {
            return 'warn';
        }
        return 'info';
    },
    customSuccessMessage: (req, res) => {
        return `${req.method} ${req.url} - ${res.statusCode}`;
    },
    customErrorMessage: (req, _res, error) => {
        return `${req.method} ${req.url} failed: ${error.message}`;
    },
    serializers: {
        req: (req) => ({
            method: req.method,
            url: req.url,
            userId: req.raw?.userId,
        }),
        res: (res) => ({
            statusCode: res.statusCode,
        }),
    },
});
