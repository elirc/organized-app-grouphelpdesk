// Author: Morgan Lee
// Issue: Learning Phase 3 - Test ticket module mapper and permissions

import { describe, expect, it } from 'vitest';
import { UserRole } from '@helpdesk/shared';

import { mapTicketToResponse } from './ticket.mapper';
import { canBeAssignedTicket } from './ticket.permissions';

const now = new Date('2026-05-20T12:00:00.000Z');

describe('ticket module helpers', () => {
  it('maps serialized database tags into API tag arrays', () => {
    const response = mapTicketToResponse({
      id: 'ticket_1',
      title: 'Example',
      description: 'Example',
      status: 'OPEN',
      priority: 'MEDIUM',
      createdBy: 'user_1',
      assigneeId: null,
      organizationId: 'org_helpdesk_demo',
      teamId: null,
      slaPolicyId: null,
      firstResponseDueAt: null,
      resolutionDueAt: null,
      firstRespondedAt: null,
      escalatedAt: null,
      slaBreachedAt: null,
      tags: JSON.stringify(['access', 'vpn']),
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
      closedAt: null,
    });

    expect(response.tags).toEqual(['access', 'vpn']);
    expect(response.createdAt).toBe(now.toISOString());
  });

  it('allows agents and admins to be assigned tickets', () => {
    expect(canBeAssignedTicket({ role: UserRole.AGENT })).toBe(true);
    expect(canBeAssignedTicket({ role: UserRole.ADMIN })).toBe(true);
    expect(canBeAssignedTicket({ role: UserRole.REQUESTER })).toBe(false);
    expect(canBeAssignedTicket(null)).toBe(false);
  });
});
