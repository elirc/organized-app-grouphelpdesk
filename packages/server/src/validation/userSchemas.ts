// Author: Morgan Lee
// Issue: Learning Phase 2 - Validate user lookup query inputs

import { UserRole } from '@helpdesk/shared';
import { z } from 'zod';

export const listUsersQuerySchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
