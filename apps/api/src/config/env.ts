import { z } from 'zod';

const envSchema = z.object({
    // Application
    NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
    PORT: z.coerce.number().default(4000),
    APP_URL: z.string().url().default('http://localhost:4000'),

    // Database
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

    // Authentication
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('24h'),

    // AI Services
    HUGGINGFACE_API_KEY: z.string().optional(),

    // Redis (optional for development)
    REDIS_URL: z.string().optional(),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

    // CORS
    ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error('❌ Invalid environment variables:');
        console.error(parsed.error.flatten().fieldErrors);
        process.exit(1);
    }

    return parsed.data;
}

export const env: Env = validateEnv();
