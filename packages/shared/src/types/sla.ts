// Author: Morgan Lee
// Issue: Enterprise Sprint 1 - Share SLA policy contracts

import type { Priority } from '../constants/priority';

export interface SlaPolicy {
  id: string;
  name: string;
  priority: Priority;
  organizationId: string;
  teamId: string | null;
  responseHours: number;
  resolutionHours: number;
  escalationHours: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SlaPolicyInput {
  name: string;
  priority: Priority;
  organizationId?: string;
  teamId?: string | null;
  responseHours: number;
  resolutionHours: number;
  escalationHours: number;
  isActive?: boolean;
}

export interface TicketEscalation {
  id: string;
  ticketId: string;
  escalatedBy: string | null;
  level: number;
  reason: string;
  createdAt: string;
}

export interface EscalationReviewResult {
  reviewedAt: string;
  escalatedTicketIds: string[];
}
