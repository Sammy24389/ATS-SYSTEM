import { Router, type Request, type Response, type NextFunction } from 'express';

import { prisma } from '@/lib/prisma.js';
import { authMiddleware, type AuthenticatedRequest } from '@/middleware/auth.js';
import { NotFoundError, ValidationError } from '@/middleware/error-handler.js';
import { parseJobDescription, type ParsedJobDescription } from '@/services/job-parser.service.js';
import type { ResumeContent } from '@/services/resume.service.js';

// Note: In production, import from @ats/ats-engine package
// For now, we inline the scoring logic

const router = Router();

// All scoring routes require authentication
router.use(authMiddleware);

// ====================
// Types
// ====================

interface ScoreRequest {
    resumeId: string;
    jobAnalysisId?: string;
    jobDescription?: string;
}

interface ScoreResponse {
    overallScore: number;
    classification: string;
    breakdown: Record<string, {
        score: number;
        weight: number;
        weightedScore: number;
    }>;
    matchedKeywords: string[];
    missingKeywords: string[];
    suggestions: Array<{
        priority: string;
        category: string;
        issue: string;
        action: string;
    }>;
}

// ====================
// Routes
// ====================

// POST /api/scoring/analyze
router.post(
    '/analyze',
    async (req: Request<object, object, ScoreRequest>, res: Response, next: NextFunction) => {
        try {
            const { userId } = req as AuthenticatedRequest;
            const { resumeId, jobAnalysisId, jobDescription } = req.body;

            if (!resumeId) {
                throw new ValidationError('Resume ID is required');
            }

            if (!jobAnalysisId && !jobDescription) {
                throw new ValidationError('Either job analysis ID or job description is required');
            }

            // Get resume
            const resume = await prisma.resume.findFirst({
                where: { id: resumeId, userId },
            });

            if (!resume) {
                throw new NotFoundError('Resume');
            }

            // Get or create job analysis
            let parsedJob: ParsedJobDescription;

            if (jobAnalysisId) {
                const jobAnalysis = await prisma.jobAnalysis.findFirst({
                    where: { id: jobAnalysisId, userId },
                });
                if (!jobAnalysis) {
                    throw new NotFoundError('Job Analysis');
                }
                parsedJob = jobAnalysis.parsedData as ParsedJobDescription;
            } else {
                parsedJob = parseJobDescription(jobDescription!);
            }

            // Calculate score
            const resumeContent = resume.content as ResumeContent;
            const scoreResult = calculateScore(resumeContent, parsedJob);

            // Save score to database
            const savedScore = await prisma.aTSScore.create({
                data: {
                    resumeId,
                    jobAnalysisId: jobAnalysisId ?? await createQuickJobAnalysis(userId, jobDescription!, parsedJob),
                    overallScore: scoreResult.overallScore,
                    keywordScore: scoreResult.breakdown.keywordScore,
                    formatScore: scoreResult.breakdown.formatScore,
                    structureScore: scoreResult.breakdown.structureScore,
                    matchedKeywords: scoreResult.matchedKeywords,
                    missingKeywords: scoreResult.missingKeywords,
                    suggestions: scoreResult.suggestions,
                },
            });

            res.status(200).json({
                success: true,
                data: {
                    id: savedScore.id,
                    ...scoreResult,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

// GET /api/scoring/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req as AuthenticatedRequest;

        const score = await prisma.aTSScore.findFirst({
            where: { id: req.params.id },
            include: {
                resume: { select: { userId: true, title: true } },
                jobAnalysis: { select: { title: true, company: true } },
            },
        });

        if (!score || score.resume.userId !== userId) {
            throw new NotFoundError('Score');
        }

        res.status(200).json({
            success: true,
            data: score,
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/scoring/resume/:resumeId/history
router.get('/resume/:resumeId/history', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req as AuthenticatedRequest;

        const resume = await prisma.resume.findFirst({
            where: { id: req.params.resumeId, userId },
        });

        if (!resume) {
            throw new NotFoundError('Resume');
        }

        const scores = await prisma.aTSScore.findMany({
            where: { resumeId: req.params.resumeId },
            orderBy: { createdAt: 'desc' },
            include: {
                jobAnalysis: { select: { title: true, company: true } },
            },
        });

        res.status(200).json({
            success: true,
            data: { scores },
        });
    } catch (error) {
        next(error);
    }
});

// ====================
// Helper Functions
// ====================

async function createQuickJobAnalysis(
    userId: string,
    rawDescription: string,
    parsed: ParsedJobDescription
): Promise<string> {
    const analysis = await prisma.jobAnalysis.create({
        data: {
            userId,
            title: parsed.title,
            company: parsed.company,
            rawDescription,
            parsedData: parsed,
            keywords: parsed.keywords.map((k) => k.term),
        },
    });
    return analysis.id;
}

function calculateScore(
    resume: ResumeContent,
    job: ParsedJobDescription
): ScoreResponse {
    // Keyword matching
    const allKeywords = [
        ...job.requiredSkills,
        ...job.preferredSkills,
        ...job.tools,
    ];

    const resumeText = JSON.stringify(resume).toLowerCase();
    const matched = allKeywords.filter((k) => resumeText.includes(k.toLowerCase()));
    const missing = allKeywords.filter((k) => !resumeText.includes(k.toLowerCase()));

    const keywordScore = allKeywords.length > 0
        ? Math.round((matched.length / allKeywords.length) * 100)
        : 75;

    // Format score (simplified)
    let formatScore = 100;
    if (!resume.skills || resume.skills.length < 3) formatScore -= 20;
    if (!resume.experience || resume.experience.length === 0) formatScore -= 30;
    if (!resume.summary) formatScore -= 10;

    // Structure score
    let structureScore = 100;
    if (!resume.contactInfo.email) structureScore -= 20;
    if (!resume.contactInfo.phone) structureScore -= 10;

    // Overall score (weighted)
    const overallScore = Math.round(
        keywordScore * 0.4 +
        formatScore * 0.35 +
        structureScore * 0.25
    );

    // Classification
    let classification = 'critical';
    if (overallScore >= 90) classification = 'excellent';
    else if (overallScore >= 75) classification = 'good';
    else if (overallScore >= 60) classification = 'fair';
    else if (overallScore >= 40) classification = 'poor';

    // Suggestions
    const suggestions: ScoreResponse['suggestions'] = [];

    for (const kw of missing.slice(0, 5)) {
        suggestions.push({
            priority: 'high',
            category: 'keyword',
            issue: `Missing keyword: ${kw}`,
            action: `Add "${kw}" to skills or experience if applicable`,
        });
    }

    if (!resume.skills || resume.skills.length < 5) {
        suggestions.push({
            priority: 'medium',
            category: 'format',
            issue: 'Skills section is underdeveloped',
            action: 'Add more relevant skills to improve keyword matching',
        });
    }

    return {
        overallScore,
        classification,
        breakdown: {
            keywordScore: { score: keywordScore, weight: 0.4, weightedScore: keywordScore * 0.4 },
            formatScore: { score: formatScore, weight: 0.35, weightedScore: formatScore * 0.35 },
            structureScore: { score: structureScore, weight: 0.25, weightedScore: structureScore * 0.25 },
        },
        matchedKeywords: matched,
        missingKeywords: missing,
        suggestions,
    };
}

export const scoringRouter = router;
