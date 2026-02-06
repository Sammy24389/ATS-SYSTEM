import { Router, type Request, type Response, type NextFunction } from 'express';

import {
    createResume,
    getResumeById,
    getUserResumes,
    updateResume,
    deleteResume,
    type CreateResumeInput,
    type UpdateResumeInput,
} from '@/services/resume.service.js';
import { authMiddleware, type AuthenticatedRequest } from '@/middleware/auth.js';

const router = Router();

// All resume routes require authentication
router.use(authMiddleware);

// POST /api/resumes
router.post(
    '/',
    async (req: Request<object, object, CreateResumeInput>, res: Response, next: NextFunction) => {
        try {
            const { userId } = req as AuthenticatedRequest;
            const resume = await createResume(userId, req.body);

            res.status(201).json({
                success: true,
                data: resume,
            });
        } catch (error) {
            next(error);
        }
    }
);

// GET /api/resumes
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req as AuthenticatedRequest;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const result = await getUserResumes(userId, { limit, offset });

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/resumes/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req as AuthenticatedRequest;
        const resume = await getResumeById(userId, req.params.id);

        res.status(200).json({
            success: true,
            data: resume,
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/resumes/:id
router.put(
    '/:id',
    async (req: Request<{ id: string }, object, UpdateResumeInput>, res: Response, next: NextFunction) => {
        try {
            const { userId } = req as AuthenticatedRequest;
            const resume = await updateResume(userId, req.params.id, req.body);

            res.status(200).json({
                success: true,
                data: resume,
            });
        } catch (error) {
            next(error);
        }
    }
);

// DELETE /api/resumes/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req as AuthenticatedRequest;
        await deleteResume(userId, req.params.id);

        res.status(200).json({
            success: true,
            data: { message: 'Resume deleted successfully' },
        });
    } catch (error) {
        next(error);
    }
});

export const resumeRouter = router;
