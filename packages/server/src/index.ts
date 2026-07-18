// Author: Alex Chen
// Issue: #3 â€” Bootstrap Express API and route layering

import cors from 'cors';
import express from 'express';

import { config } from './config/env';
import { authRouter } from './routes/auth';
import { commentRouter } from './routes/comments';
import { dashboardRouter } from './routes/dashboard';
import { healthRouter } from './routes/health';
import { knowledgeBaseRouter } from './routes/knowledgeBase';
import { notificationRouter } from './routes/notifications';
import { slaRouter } from './routes/sla';
import { attachmentRouter } from './routes/attachments';
import { ticketRouter } from './routes/tickets';
import { userRouter } from './routes/users';
import { errorHandler } from './middleware/errorHandler';
import { optionalAuth } from './middleware/auth';
import { rateLimit } from './middleware/rateLimit';
import { requestLogger } from './middleware/requestLogger';
import { responseTime } from './middleware/responseTime';
import { securityHeaders } from './middleware/securityHeaders';
import { logger } from './utils/logger';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: config.CORS_ORIGIN === '*' ? true : config.CORS_ORIGIN.split(','),
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(securityHeaders);
  app.use(rateLimit);
  app.use(responseTime);
  app.use(requestLogger);
  app.use(optionalAuth);

  app.use('/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/tickets/:ticketId/attachments', attachmentRouter);
  app.use('/api/tickets/:ticketId/comments', commentRouter);
  app.use('/api/tickets', ticketRouter);
  app.use('/api/users', userRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/articles', knowledgeBaseRouter);
  app.use('/api/notifications', notificationRouter);
  app.use('/api/sla', slaRouter);

  app.use(errorHandler);

  return app;
}

const port = config.PORT;

if (config.NODE_ENV !== 'test') {
  createApp().listen(port, () => {
    logger.info({ port }, 'HelpDesk API listening');
  });
}
