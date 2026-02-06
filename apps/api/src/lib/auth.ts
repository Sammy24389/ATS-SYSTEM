import * as jose from 'jose';
import bcrypt from 'bcrypt';

import { env } from '@/config/env.js';

const SALT_ROUNDS = 12;
const JWT_ALGORITHM = 'HS256';

interface JWTPayload {
    userId: string;
    email: string;
}

interface TokenPair {
    accessToken: string;
    expiresAt: Date;
}

const secretKey = new TextEncoder().encode(env.JWT_SECRET);

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function signToken(payload: JWTPayload): Promise<TokenPair> {
    const expiresIn = parseExpiresIn(env.JWT_EXPIRES_IN);
    const expiresAt = new Date(Date.now() + expiresIn);

    const accessToken = await new jose.SignJWT({ ...payload })
        .setProtectedHeader({ alg: JWT_ALGORITHM })
        .setIssuedAt()
        .setExpirationTime(expiresAt)
        .setSubject(payload.userId)
        .sign(secretKey);

    return { accessToken, expiresAt };
}

export async function verifyToken(token: string): Promise<JWTPayload> {
    const { payload } = await jose.jwtVerify(token, secretKey, {
        algorithms: [JWT_ALGORITHM],
    });

    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
        throw new Error('Invalid token payload');
    }

    return {
        userId: payload.sub,
        email: payload.email as string,
    };
}

function parseExpiresIn(value: string): number {
    const match = value.match(/^(\d+)(s|m|h|d)$/);
    if (!match) {
        return 24 * 60 * 60 * 1000; // Default: 24 hours
    }

    const amount = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    return amount * multipliers[unit];
}
