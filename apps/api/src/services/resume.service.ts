import { z } from 'zod';

import { prisma } from '@/lib/prisma.js';
import { NotFoundError, ValidationError } from '@/middleware/error-handler.js';
import type { ResumeStatus } from '@prisma/client';

// ====================
// Validation Schemas
// ====================

export const createResumeSchema = z.object({
    title: z.string().min(1).max(200),
    content: z.object({
        contactInfo: z.object({
            fullName: z.string().min(1),
            email: z.string().email(),
            phone: z.string().optional(),
            location: z.string().optional(),
            linkedin: z.string().url().optional(),
            website: z.string().url().optional(),
        }),
        summary: z.string().optional(),
        experience: z.array(z.object({
            company: z.string(),
            title: z.string(),
            location: z.string().optional(),
            startDate: z.string(),
            endDate: z.string().optional(),
            current: z.boolean().optional(),
            bullets: z.array(z.string()),
        })).optional(),
        education: z.array(z.object({
            institution: z.string(),
            degree: z.string(),
            field: z.string().optional(),
            graduationDate: z.string().optional(),
            gpa: z.string().optional(),
        })).optional(),
        skills: z.array(z.string()).optional(),
        certifications: z.array(z.object({
            name: z.string(),
            issuer: z.string().optional(),
            date: z.string().optional(),
        })).optional(),
        projects: z.array(z.object({
            name: z.string(),
            description: z.string().optional(),
            technologies: z.array(z.string()).optional(),
            url: z.string().url().optional(),
        })).optional(),
    }),
    templateId: z.string().optional(),
});

export const updateResumeSchema = createResumeSchema.partial();

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;

// ====================
// Types
// ====================

export interface ResumeContent {
    contactInfo: {
        fullName: string;
        email: string;
        phone?: string;
        location?: string;
        linkedin?: string;
        website?: string;
    };
    summary?: string;
    experience?: Array<{
        company: string;
        title: string;
        location?: string;
        startDate: string;
        endDate?: string;
        current?: boolean;
        bullets: string[];
    }>;
    education?: Array<{
        institution: string;
        degree: string;
        field?: string;
        graduationDate?: string;
        gpa?: string;
    }>;
    skills?: string[];
    certifications?: Array<{
        name: string;
        issuer?: string;
        date?: string;
    }>;
    projects?: Array<{
        name: string;
        description?: string;
        technologies?: string[];
        url?: string;
    }>;
}

interface ResumeResponse {
    id: string;
    title: string;
    content: ResumeContent;
    status: ResumeStatus;
    templateId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// ====================
// Resume Service
// ====================

export async function createResume(
    userId: string,
    input: CreateResumeInput
): Promise<ResumeResponse> {
    const validated = createResumeSchema.safeParse(input);
    if (!validated.success) {
        throw new ValidationError('Invalid resume data', validated.error.flatten().fieldErrors);
    }

    const resume = await prisma.resume.create({
        data: {
            userId,
            title: validated.data.title,
            content: validated.data.content,
            templateId: validated.data.templateId,
            status: 'DRAFT',
        },
    });

    return {
        id: resume.id,
        title: resume.title,
        content: resume.content as ResumeContent,
        status: resume.status,
        templateId: resume.templateId,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
    };
}

export async function getResumeById(
    userId: string,
    resumeId: string
): Promise<ResumeResponse> {
    const resume = await prisma.resume.findFirst({
        where: {
            id: resumeId,
            userId,
        },
    });

    if (!resume) {
        throw new NotFoundError('Resume');
    }

    return {
        id: resume.id,
        title: resume.title,
        content: resume.content as ResumeContent,
        status: resume.status,
        templateId: resume.templateId,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
    };
}

export async function getUserResumes(
    userId: string,
    options: { limit?: number; offset?: number } = {}
): Promise<{ resumes: ResumeResponse[]; total: number }> {
    const { limit = 20, offset = 0 } = options;

    const [resumes, total] = await Promise.all([
        prisma.resume.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            take: limit,
            skip: offset,
        }),
        prisma.resume.count({ where: { userId } }),
    ]);

    return {
        resumes: resumes.map((r) => ({
            id: r.id,
            title: r.title,
            content: r.content as ResumeContent,
            status: r.status,
            templateId: r.templateId,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
        })),
        total,
    };
}

export async function updateResume(
    userId: string,
    resumeId: string,
    input: UpdateResumeInput
): Promise<ResumeResponse> {
    const validated = updateResumeSchema.safeParse(input);
    if (!validated.success) {
        throw new ValidationError('Invalid resume data', validated.error.flatten().fieldErrors);
    }

    const existing = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
    });

    if (!existing) {
        throw new NotFoundError('Resume');
    }

    const resume = await prisma.resume.update({
        where: { id: resumeId },
        data: {
            ...(validated.data.title && { title: validated.data.title }),
            ...(validated.data.content && { content: validated.data.content }),
            ...(validated.data.templateId && { templateId: validated.data.templateId }),
        },
    });

    return {
        id: resume.id,
        title: resume.title,
        content: resume.content as ResumeContent,
        status: resume.status,
        templateId: resume.templateId,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
    };
}

export async function deleteResume(userId: string, resumeId: string): Promise<void> {
    const existing = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
    });

    if (!existing) {
        throw new NotFoundError('Resume');
    }

    await prisma.resume.delete({
        where: { id: resumeId },
    });
}

export async function updateResumeStatus(
    userId: string,
    resumeId: string,
    status: ResumeStatus
): Promise<ResumeResponse> {
    const existing = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
    });

    if (!existing) {
        throw new NotFoundError('Resume');
    }

    const resume = await prisma.resume.update({
        where: { id: resumeId },
        data: { status },
    });

    return {
        id: resume.id,
        title: resume.title,
        content: resume.content as ResumeContent,
        status: resume.status,
        templateId: resume.templateId,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
    };
}
