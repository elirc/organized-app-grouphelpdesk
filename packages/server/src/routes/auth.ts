// Author: Morgan Lee
// Issue: Learning Phase 4 - Register authentication routes

import { Router } from 'express';

import { login, logout, me } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validateRequest';
import { loginBodySchema } from '../validation/authSchemas';

export const authRouter = Router();

authRouter.post('/login', validateBody(loginBodySchema), login);
authRouter.get('/me', requireAuth, me);
authRouter.post('/logout', requireAuth, logout);
