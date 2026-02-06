// Input Sanitization Middleware
// Prevents XSS, SQL injection, and other input-based attacks

import { type Request, type Response, type NextFunction } from 'express';

// ====================
// Sanitization Functions
// ====================

/**
 * Sanitizes a string to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
    if (typeof input !== 'string') return input;

    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/`/g, '&#96;')
        .trim();
}

/**
 * Sanitizes an object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map((item) =>
                typeof item === 'string'
                    ? sanitizeString(item)
                    : typeof item === 'object' && item !== null
                        ? sanitizeObject(item as Record<string, unknown>)
                        : item
            );
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value as Record<string, unknown>);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized as T;
}

/**
 * Removes potentially dangerous patterns from strings
 */
export function removeDangerousPatterns(input: string): string {
    return input
        // Remove script tags
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove event handlers
        .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
        // Remove javascript: URLs
        .replace(/javascript:/gi, '')
        // Remove data: URLs (potential XSS vector)
        .replace(/data:/gi, '')
        // Remove vbscript (IE-specific)
        .replace(/vbscript:/gi, '');
}

// ====================
// Validation Helpers
// ====================

/**
 * Validates that a string doesn't contain SQL injection patterns
 */
export function hasSQLInjectionRisk(input: string): boolean {
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b)/i,
        /(--)|(;)|(\/\*)/,
        /'.*OR.*'/i,
        /'.*AND.*'/i,
    ];

    return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validates email format strictly
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validates that input is a safe filename
 */
export function isSafeFilename(filename: string): boolean {
    // Allow only alphanumeric, dots, dashes, and underscores
    const safePattern = /^[a-zA-Z0-9._-]+$/;
    // Prevent directory traversal
    const hasTraversal = /\.\./.test(filename);

    return safePattern.test(filename) && !hasTraversal && filename.length <= 255;
}

// ====================
// Express Middleware
// ====================

/**
 * Middleware to sanitize all request body inputs
 */
export function sanitizeInputMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
): void {
    // Sanitize body
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }

    // Sanitize query params
    if (req.query && typeof req.query === 'object') {
        for (const [key, value] of Object.entries(req.query)) {
            if (typeof value === 'string') {
                req.query[key] = sanitizeString(value);
            }
        }
    }

    // Sanitize URL params
    if (req.params && typeof req.params === 'object') {
        for (const [key, value] of Object.entries(req.params)) {
            if (typeof value === 'string') {
                req.params[key] = sanitizeString(value);
            }
        }
    }

    next();
}

/**
 * Middleware to validate content type
 */
export function validateContentType(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const contentType = req.headers['content-type'];

    // Only check POST, PUT, PATCH requests with body
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        if (!contentType?.includes('application/json') && !contentType?.includes('multipart/form-data')) {
            res.status(415).json({
                success: false,
                error: {
                    message: 'Content-Type must be application/json or multipart/form-data',
                    code: 'UNSUPPORTED_MEDIA_TYPE',
                },
            });
            return;
        }
    }

    next();
}

/**
 * Middleware to limit request body size
 */
export function limitBodySize(maxSizeKB: number) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const contentLength = parseInt(req.headers['content-length'] ?? '0', 10);
        const maxBytes = maxSizeKB * 1024;

        if (contentLength > maxBytes) {
            res.status(413).json({
                success: false,
                error: {
                    message: `Request body too large. Maximum size is ${maxSizeKB}KB`,
                    code: 'PAYLOAD_TOO_LARGE',
                },
            });
            return;
        }

        next();
    };
}
