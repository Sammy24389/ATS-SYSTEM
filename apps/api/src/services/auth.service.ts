import { z } from 'zod';

import { prisma } from '@/lib/prisma.js';
import { hashPassword, verifyPassword, signToken } from '@/lib/auth.js';
import {
    ValidationError,
    AuthenticationError,
    ConflictError,
} from '@/middleware/error-handler.js';

// ====================
// Validation Schemas
// ====================

export const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    name: z.string().min(1).max(100).optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ====================
// Response Types
// ====================

interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string | null;
    };
    accessToken: string;
    expiresAt: string;
}

// ====================
// Auth Service
// ====================

export async function signup(input: SignupInput): Promise<AuthResponse> {
    // Validate input
    const validated = signupSchema.safeParse(input);
    if (!validated.success) {
        throw new ValidationError('Invalid input', validated.error.flatten().fieldErrors);
    }

    const { email, password, name } = validated.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (existingUser) {
        throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
        data: {
            email: email.toLowerCase(),
            passwordHash,
            name,
        },
        select: {
            id: true,
            email: true,
            name: true,
        },
    });

    // Generate token
    const { accessToken, expiresAt } = await signToken({
        userId: user.id,
        email: user.email,
    });

    return {
        user,
        accessToken,
        expiresAt: expiresAt.toISOString(),
    };
}

export async function login(input: LoginInput): Promise<AuthResponse> {
    // Validate input
    const validated = loginSchema.safeParse(input);
    if (!validated.success) {
        throw new ValidationError('Invalid input', validated.error.flatten().fieldErrors);
    }

    const { email, password } = validated.data;

    // Find user
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (!user) {
        throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
        throw new AuthenticationError('Invalid email or password');
    }

    // Generate token
    const { accessToken, expiresAt } = await signToken({
        userId: user.id,
        email: user.email,
    });

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
        accessToken,
        expiresAt: expiresAt.toISOString(),
    };
}

export async function getUserById(userId: string): Promise<{
    id: string;
    email: string;
    name: string | null;
} | null> {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
        },
    });
}
