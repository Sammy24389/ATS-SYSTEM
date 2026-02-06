// Export Routes
// PDF and DOCX resume export endpoints

import { Router, type Request, type Response, type NextFunction } from 'express';

import { prisma } from '@/lib/prisma.js';
import { authMiddleware, type AuthenticatedRequest } from '@/middleware/auth.js';
import { NotFoundError, ValidationError } from '@/middleware/error-handler.js';
import { generatePDF, generatePreviewHTML } from '@/services/pdf-export.service.js';
import { generateDOCX } from '@/services/docx-export.service.js';
import type { ResumeContent } from '@/services/resume.service.js';

const router = Router();

// All export routes require authentication
router.use(authMiddleware);

// ====================
// PDF Export
// ====================

// GET /api/export/:resumeId/pdf
router.get('/:resumeId/pdf', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req as AuthenticatedRequest;
        const { resumeId } = req.params;
        const template = (req.query.template as string) ?? 'classic';

        const resume = await prisma.resume.findFirst({
            where: { id: resumeId, userId },
        });

        if (!resume) {
            throw new NotFoundError('Resume');
        }

        const content = resume.content as ResumeContent;

        if (!content.contactInfo?.fullName) {
            throw new ValidationError('Resume is incomplete. Please add contact information.');
        }

        const pdfBuffer = await generatePDF(content, { template });

        // Sanitize filename
        const filename = `${content.contactInfo.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_Resume.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.send(pdfBuffer);
    } catch (error) {
        next(error);
    }
});

// ====================
// DOCX Export
// ====================

// GET /api/export/:resumeId/docx
router.get('/:resumeId/docx', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req as AuthenticatedRequest;
        const { resumeId } = req.params;

        const resume = await prisma.resume.findFirst({
            where: { id: resumeId, userId },
        });

        if (!resume) {
            throw new NotFoundError('Resume');
        }

        const content = resume.content as ResumeContent;

        if (!content.contactInfo?.fullName) {
            throw new ValidationError('Resume is incomplete. Please add contact information.');
        }

        const docxBuffer = await generateDOCX(content);

        // Sanitize filename
        const filename = `${content.contactInfo.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_Resume.docx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', docxBuffer.length);
        res.send(docxBuffer);
    } catch (error) {
        next(error);
    }
});

// ====================
// HTML Preview
// ====================

// GET /api/export/:resumeId/preview
router.get('/:resumeId/preview', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req as AuthenticatedRequest;
        const { resumeId } = req.params;
        const template = (req.query.template as string) ?? 'classic';

        const resume = await prisma.resume.findFirst({
            where: { id: resumeId, userId },
        });

        if (!resume) {
            throw new NotFoundError('Resume');
        }

        const content = resume.content as ResumeContent;
        const html = generatePreviewHTML(content, template);

        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        next(error);
    }
});

export const exportRouter = router;
