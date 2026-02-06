// File Text Extraction Service
// Handles PDF and DOCX text extraction

import fs from 'fs/promises';
import path from 'path';

import { ValidationError } from '@/middleware/error-handler.js';
import { logger } from '@/middleware/logger.js';

// ====================
// Types
// ====================

export interface ExtractionResult {
    text: string;
    pageCount?: number;
    metadata?: Record<string, string>;
}

// ====================
// Text Extraction
// ====================

export async function extractTextFromFile(filePath: string): Promise<ExtractionResult> {
    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
        case '.pdf':
            return extractFromPDF(filePath);
        case '.docx':
            return extractFromDOCX(filePath);
        case '.doc':
            throw new ValidationError('Legacy .doc files are not supported. Please convert to .docx');
        default:
            throw new ValidationError(`Unsupported file type: ${ext}`);
    }
}

async function extractFromPDF(filePath: string): Promise<ExtractionResult> {
    try {
        // Dynamic import for pdf-parse
        const pdfParse = (await import('pdf-parse')).default;
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);

        return {
            text: normalizeText(data.text),
            pageCount: data.numpages,
            metadata: {
                title: data.info?.Title ?? '',
                author: data.info?.Author ?? '',
            },
        };
    } catch (error) {
        logger.error({ error, filePath }, 'PDF extraction failed');
        throw new ValidationError('Failed to extract text from PDF. The file may be corrupted or password-protected.');
    }
}

async function extractFromDOCX(filePath: string): Promise<ExtractionResult> {
    try {
        // Dynamic import for mammoth
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ path: filePath });

        if (result.messages.length > 0) {
            logger.warn({ messages: result.messages }, 'DOCX extraction warnings');
        }

        return {
            text: normalizeText(result.value),
        };
    } catch (error) {
        logger.error({ error, filePath }, 'DOCX extraction failed');
        throw new ValidationError('Failed to extract text from DOCX. The file may be corrupted.');
    }
}

// ====================
// Text Normalization
// ====================

function normalizeText(text: string): string {
    return text
        // Normalize line endings
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Remove excessive whitespace
        .replace(/[ \t]+/g, ' ')
        // Remove excessive line breaks (more than 2)
        .replace(/\n{3,}/g, '\n\n')
        // Trim each line
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
        // Final trim
        .trim();
}

// ====================
// File Validation
// ====================

export async function validateFileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

export async function getFileSize(filePath: string): Promise<number> {
    const stats = await fs.stat(filePath);
    return stats.size;
}

export async function deleteFile(filePath: string): Promise<void> {
    try {
        await fs.unlink(filePath);
    } catch (error) {
        logger.warn({ error, filePath }, 'Failed to delete file');
    }
}
