// Author: Jordan Park
// Issue: #27 â€” Extend Express request context

import type { AppLogger } from '../utils/logger';
import type { CurrentUser } from '../services/authService';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      log?: AppLogger;
      startedAt?: bigint;
      authToken?: string;
      currentUser?: CurrentUser;
    }
  }
}

export {};
