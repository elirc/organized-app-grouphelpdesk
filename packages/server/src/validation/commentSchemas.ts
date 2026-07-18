// Author: Morgan Lee
// Issue: Learning Phase 2 - Validate comment API inputs

import { UserRole } from '@helpdesk/shared';
import { z } from 'zod';

export const createCommentBodySchema = z.object({
  authorId: z.string().trim().min(1).optional(),
  body: z.string().trim().min(1, 'body is required'),
  isInternal: z.coerce.boolean().optional().default(false),
});

export const listCommentsQuerySchema = z.object({
  includeInternal: z.coerce.boolean().optional().default(false),
  viewerRole: z.nativeEnum(UserRole).optional(),
});

export type CreateCommentBody = z.infer<typeof createCommentBodySchema>;
export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>;
