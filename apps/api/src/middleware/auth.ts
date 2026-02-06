import type { Request, Response, NextFunction } from 'express';

import { verifyToken } from '@/lib/auth.js';
import { AuthenticationError } from '@/middleware/error-handler.js';

export interface AuthenticatedRequest extends Request {
    userId: string;
    userEmail: string;
}

export async function authMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            throw new AuthenticationError('Missing or invalid authorization header');
        }

        const token = authHeader.slice(7);

        if (!token) {
            throw new AuthenticationError('Token not provided');
        }

        const payload = await verifyToken(token);

        (req as AuthenticatedRequest).userId = payload.userId;
        (req as AuthenticatedRequest).userEmail = payload.email;

        next();
    } catch (error) {
        if (error instanceof AuthenticationError) {
            next(error);
        } else {
            next(new AuthenticationError('Invalid or expired token'));
        }
    }
}

export function optionalAuth(
    req: Request,
    _res: Response,
    next: NextFunction
): void {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        next();
        return;
    }

    const token = authHeader.slice(7);

    verifyToken(token)
        .then((payload) => {
            (req as AuthenticatedRequest).userId = payload.userId;
            (req as AuthenticatedRequest).userEmail = payload.email;
            next();
        })
        .catch(() => {
            // Token invalid, continue without auth
            next();
        });
}
