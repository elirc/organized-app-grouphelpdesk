// Author: Alex Chen
// Issue: #14 â€” Register user lookup routes

import { Router } from 'express';

import { listUsers } from '../controllers/userController';
import { requireAuth } from '../middleware/auth';
import { validateQuery } from '../middleware/validateRequest';
import { listUsersQuerySchema } from '../validation/userSchemas';

export const userRouter = Router();

userRouter.get('/', validateQuery(listUsersQuerySchema), requireAuth, listUsers);
