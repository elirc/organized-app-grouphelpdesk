// Author: Alex Chen
// Issue: #31 â€” Register dashboard API routes

import { Router } from 'express';
import { UserRole } from '@helpdesk/shared';

import {
  getAgentWorkload,
  getDashboardActivity,
  getDashboardMetrics,
  getSystemHealth,
} from '../controllers/dashboardController';
import { requireRole } from '../middleware/auth';

export const dashboardRouter = Router();

dashboardRouter.use(requireRole(UserRole.AGENT, UserRole.ADMIN));
dashboardRouter.get('/metrics', getDashboardMetrics);
dashboardRouter.get('/activity', getDashboardActivity);
dashboardRouter.get('/agent-workload', getAgentWorkload);
dashboardRouter.get('/system', getSystemHealth);
