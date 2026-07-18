// Author: Morgan Lee
// Issue: Enterprise Sprint 1 - Validate SLA policy input

import { Priority } from '@helpdesk/shared';
import { z } from 'zod';

export const slaPolicyBodySchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  priority: z.nativeEnum(Priority),
  organizationId: z.string().trim().min(1).optional(),
  teamId: z.string().trim().min(1).nullable().optional(),
  responseHours: z.coerce
    .number()
    .int()
    .min(1)
    .max(24 * 30),
  resolutionHours: z.coerce
    .number()
    .int()
    .min(1)
    .max(24 * 60),
  escalationHours: z.coerce
    .number()
    .int()
    .min(1)
    .max(24 * 30),
  isActive: z.coerce.boolean().optional(),
});

export type SlaPolicyBody = z.infer<typeof slaPolicyBodySchema>;
