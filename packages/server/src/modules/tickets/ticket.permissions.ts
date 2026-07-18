// Author: Alex Chen
// Issue: Learning Phase 3 - Isolate ticket permission-style decisions

import type { User } from '@prisma/client';
import { UserRole } from '@helpdesk/shared';

export function canBeAssignedTicket(user: Pick<User, 'role'> | null): boolean {
  return Boolean(user && (user.role === UserRole.AGENT || user.role === UserRole.ADMIN));
}

export function canMoveToInProgress(assigneeId: string | null | undefined): boolean {
  return Boolean(assigneeId);
}
