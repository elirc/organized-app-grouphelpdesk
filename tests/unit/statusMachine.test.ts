// Author: Morgan Lee
// Issue: #18 â€” Test ticket status state machine

import { describe, expect, it } from 'vitest';
import { TicketStatus } from '@helpdesk/shared';

import {
  canTransition,
  getAvailableTransitions,
} from '../../packages/server/src/utils/statusMachine';

describe('statusMachine', () => {
  it('allows documented transitions', () => {
    expect(canTransition(TicketStatus.OPEN, TicketStatus.IN_PROGRESS)).toBe(true);
    expect(canTransition(TicketStatus.IN_PROGRESS, TicketStatus.WAITING)).toBe(true);
    expect(canTransition(TicketStatus.RESOLVED, TicketStatus.CLOSED)).toBe(true);
  });

  it('rejects undocumented transitions', () => {
    expect(canTransition(TicketStatus.OPEN, TicketStatus.RESOLVED)).toBe(false);
    expect(canTransition(TicketStatus.CLOSED, TicketStatus.RESOLVED)).toBe(false);
  });

  it('returns available transitions without exposing internal arrays', () => {
    const transitions = getAvailableTransitions(TicketStatus.OPEN);
    transitions.push(TicketStatus.RESOLVED);

    expect(getAvailableTransitions(TicketStatus.OPEN)).not.toContain(TicketStatus.RESOLVED);
  });
});
