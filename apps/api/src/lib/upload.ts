// File Upload Configuration
// ATS Resume Platform

import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

import { ValidationError } from '@/middleware/error-handler.js';

// ====================
// Configuration
// ====================

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'] as const;

// ====================
// Storage Configuration
// ====================

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/resumes');
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueSuffix}${ext}`);
    },
});

// ====================
// File Filter
// ====================

function fileFilter(
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
): void {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;

    const isValidExtension = (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
    const isValidMimeType = (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);

    if (!isValidExtension || !isValidMimeType) {
        cb(new ValidationError('Invalid file type. Allowed: PDF, DOC, DOCX'));
        return;
    }

    cb(null, true);
}

// ====================
// Multer Instance
// ====================

export const resumeUpload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
    },
    fileFilter,
});

// ====================
// Helper Functions
// ====================

export function getUploadPath(filename: string): string {
    return path.join('uploads', 'resumes', filename);
}

export function isValidFileType(mimeType: string): boolean {
    return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function getMaxFileSize(): number {
    return MAX_FILE_SIZE;
}
