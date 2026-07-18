// Author: Morgan Lee
// Issue: Enterprise Sprint 2 - Share notification and outbox contracts

export enum NotificationType {
  TICKET_ASSIGNED = 'TICKET_ASSIGNED',
  TICKET_COMMENTED = 'TICKET_COMMENTED',
  SLA_ESCALATED = 'SLA_ESCALATED',
  ARTICLE_REVIEW_REQUESTED = 'ARTICLE_REVIEW_REQUESTED',
}

export enum OutboxStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

export interface Notification {
  id: string;
  userId: string;
  ticketId: string | null;
  type: NotificationType;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface EventOutboxEntry {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: unknown;
  status: OutboxStatus;
  attempts: number;
  nextAttemptAt: string | null;
  processedAt: string | null;
  createdAt: string;
}
