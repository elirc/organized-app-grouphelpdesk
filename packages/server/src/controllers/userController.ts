// Author: Alex Chen
// Issue: #14 â€” Expose user lookup endpoints for assignment UI

import type { NextFunction, Request, Response } from 'express';

import { getValidatedQuery } from '../middleware/validateRequest';
import { userService } from '../services/userService';
import type { ListUsersQuery } from '../validation/userSchemas';

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const query = getValidatedQuery<ListUsersQuery>(res);
    const users = await userService.getUsers(query.role, req.currentUser);
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
}
