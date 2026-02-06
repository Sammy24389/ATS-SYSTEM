import { Router, type Request, type Response, type NextFunction } from 'express';

import { signup, login, getUserById } from '@/services/auth.service.js';
import { authMiddleware, type AuthenticatedRequest } from '@/middleware/auth.js';
import { authRateLimiter } from '@/middleware/rate-limit.js';

const router = Router();

interface SignupBody {
    email: string;
    password: string;
    name?: string;
}

interface LoginBody {
    email: string;
    password: string;
}

// POST /api/auth/signup
router.post(
    '/signup',
    authRateLimiter,
    async (req: Request<object, object, SignupBody>, res: Response, next: NextFunction) => {
        try {
            const result = await signup(req.body);

            res.status(201).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
);

// POST /api/auth/login
router.post(
    '/login',
    authRateLimiter,
    async (req: Request<object, object, LoginBody>, res: Response, next: NextFunction) => {
        try {
            const result = await login(req.body);

            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
);

// GET /api/auth/me
router.get(
    '/me',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req as AuthenticatedRequest;
            const user = await getUserById(userId);

            if (!user) {
                res.status(404).json({
                    success: false,
                    error: {
                        message: 'User not found',
                        code: 'NOT_FOUND',
                    },
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }
);

// POST /api/auth/logout
router.post(
    '/logout',
    authMiddleware,
    async (_req: Request, res: Response) => {
        // JWT is stateless, client should discard token
        // In production, you might want to blacklist the token
        res.status(200).json({
            success: true,
            data: { message: 'Logged out successfully' },
        });
    }
);

export const authRouter = router;
