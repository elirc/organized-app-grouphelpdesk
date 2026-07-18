// Author: Alex Chen
// Issue: #16 â€” Validate ticket status transitions

import { TicketStatus } from '@helpdesk/shared';

export const VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
  [TicketStatus.IN_PROGRESS]: [TicketStatus.WAITING, TicketStatus.RESOLVED, TicketStatus.OPEN],
  [TicketStatus.WAITING]: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
  [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.OPEN],
  [TicketStatus.CLOSED]: [TicketStatus.OPEN],
};

export function canTransition(from: TicketStatus, to: TicketStatus): boolean {
  if (from === to) {
    return true;
  }

  return VALID_TRANSITIONS[from].includes(to);
}

export function getAvailableTransitions(current: TicketStatus): TicketStatus[] {
  return [...VALID_TRANSITIONS[current]];
}
