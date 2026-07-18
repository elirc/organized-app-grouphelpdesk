// Author: Alex Chen
// Issue: #31 â€” Map dashboard metric requests to aggregation service

import type { NextFunction, Request, Response } from 'express';

import { dashboardService } from '../services/dashboardService';

export async function getDashboardMetrics(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await dashboardService.getMetrics() });
  } catch (error) {
    next(error);
  }
}

export async function getDashboardActivity(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await dashboardService.getActivity() });
  } catch (error) {
    next(error);
  }
}

export async function getAgentWorkload(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await dashboardService.getAgentWorkload() });
  } catch (error) {
    next(error);
  }
}

export function getSystemHealth(_req: Request, res: Response) {
  res.json({ data: dashboardService.getSystemHealth() });
}
