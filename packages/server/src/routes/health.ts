// Author: Jordan Park
// Issue: #28 â€” Provide service health endpoint

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

export const healthRouter = Router();
const prisma = new PrismaClient();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ready',
      database: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: 'not_ready',
      database: 'unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});
