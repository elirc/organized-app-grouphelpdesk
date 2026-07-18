// Author: Morgan Lee
// Issue: #31 â€” Define shared dashboard types

import type { Priority } from '../constants/priority';
import type { ActivityLogEntry } from './activityLog';

export interface DashboardMetrics {
  openTicketCount: number;
  inProgressCount: number;
  avgResolutionTimeHours: number;
  breachedSlaCount: number;
  escalatedTicketCount: number;
  ticketsByPriority: Record<Priority, number>;
  ticketsByCategory: Array<{ category: string; count: number }>;
}

export interface AgentWorkload {
  agentId: string;
  agentName: string;
  openTicketCount: number;
  inProgressTicketCount: number;
  totalActiveTickets: number;
}

export interface SystemHealth {
  uptime: number;
  requestCount: number;
  averageResponseTimeMs: number;
  slowRequests: Array<{
    method: string;
    path: string;
    durationMs: number;
    timestamp: string;
  }>;
}

export interface DashboardActivityResponse {
  data: ActivityLogEntry[];
}
