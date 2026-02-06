import type { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { env } from '@/config/env.js';
import { logger } from '@/middleware/logger.js';

export interface ApiError extends Error {
    statusCode?: number;
    code?: string;
    details?: unknown;
}

export class AppError extends Error implements ApiError {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly details?: unknown;

    constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = 'AppError';

        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: unknown) {
        super(message, 400, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR');
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403, 'AUTHORIZATION_ERROR');
        this.name = 'AuthorizationError';
    }
}

export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, 'CONFLICT');
        this.name = 'ConflictError';
    }
}

interface ErrorResponse {
    success: false;
    error: {
        message: string;
        code: string;
        details?: unknown;
        stack?: string;
    };
}

function formatZodError(error: ZodError): { field: string; message: string }[] {
    return error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
    }));
}

export const errorHandler: ErrorRequestHandler = (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    logger.error({ error: error.message, stack: error.stack }, 'Error occurred');

    let statusCode = 500;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';
    let details: unknown = undefined;

    if (error instanceof ZodError) {
        statusCode = 400;
        code = 'VALIDATION_ERROR';
        message = 'Validation failed';
        details = formatZodError(error);
    } else if (error instanceof AppError) {
        statusCode = error.statusCode;
        code = error.code;
        message = error.message;
        details = error.details;
    } else if (error.name === 'PrismaClientKnownRequestError') {
        statusCode = 400;
        code = 'DATABASE_ERROR';
        message = 'Database operation failed';
    }

    const response: ErrorResponse = {
        success: false,
        error: {
            message,
            code,
            details,
            ...(env.NODE_ENV === 'development' && { stack: error.stack }),
        },
    };

    res.status(statusCode).json(response);
};

export function notFoundHandler(_req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        error: {
            message: 'Endpoint not found',
            code: 'NOT_FOUND',
        },
    });
}
