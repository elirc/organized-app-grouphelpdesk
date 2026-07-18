// Author: Morgan Lee
// Issue: Learning Phase 2 - Validate ticket API inputs

import { Priority, TicketStatus } from '@helpdesk/shared';
import { z } from 'zod';

function nullableOptionalString() {
  return z.string().trim().min(1).nullable().optional();
}

function enumList<T extends [string, ...string[]]>(values: T) {
  return z.preprocess(
    (value) => {
      if (Array.isArray(value)) {
        return value.flatMap((item) => String(item).split(','));
      }

      if (typeof value === 'string') {
        return value.split(',');
      }

      return value;
    },
    z.array(z.enum(values)).optional(),
  );
}

export const createTicketBodySchema = z.object({
  title: z.string().trim().min(1, 'title is required'),
  description: z.string().trim().min(1, 'description is required'),
  priority: z.nativeEnum(Priority),
  createdBy: z.string().trim().min(1).optional(),
  assigneeId: nullableOptionalString(),
  teamId: nullableOptionalString(),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
});

export const updateTicketBodySchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    status: z.nativeEnum(TicketStatus).optional(),
    priority: z.nativeEnum(Priority).optional(),
    assigneeId: nullableOptionalString(),
    teamId: nullableOptionalString(),
    tags: z.array(z.string().trim().min(1)).optional(),
    actorId: z.string().trim().min(1).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one update field is required.',
  });

export const assignTicketBodySchema = z.object({
  assigneeId: z.string().trim().min(1, 'assigneeId is required'),
  actorId: z.string().trim().min(1).optional(),
});

export const listTicketsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: enumList(Object.values(TicketStatus) as [TicketStatus, ...TicketStatus[]]),
  priority: enumList(Object.values(Priority) as [Priority, ...Priority[]]),
  assigneeId: z.string().trim().min(1).optional(),
  teamId: z.string().trim().min(1).optional(),
  createdBy: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
});

export type CreateTicketBody = z.infer<typeof createTicketBodySchema>;
export type UpdateTicketBody = z.infer<typeof updateTicketBodySchema>;
export type AssignTicketBody = z.infer<typeof assignTicketBodySchema>;
export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;
