// Author: Jordan Park
// Issue: Enterprise Sprint 3 - Validate operational configuration

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
  LOG_LEVEL: z.string().default('info'),
  DATABASE_URL: z.string().optional(),
  CORS_ORIGIN: z.string().default('*'),
  SESSION_TTL_HOURS: z.coerce
    .number()
    .int()
    .min(1)
    .max(24 * 30)
    .default(24),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1_000).default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(600),
});

export const config = envSchema.parse(process.env);
