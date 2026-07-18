// Author: Morgan Lee
// Issue: Learning Phase 2 - Share reusable route validation schemas

import { z } from 'zod';

export const idParamsSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

export const ticketIdParamsSchema = z.object({
  ticketId: z.string().min(1, 'ticketId is required'),
});

export const optionalSearchQuerySchema = z.object({
  search: z.string().trim().optional(),
});

export type IdParams = z.infer<typeof idParamsSchema>;
export type TicketIdParams = z.infer<typeof ticketIdParamsSchema>;
