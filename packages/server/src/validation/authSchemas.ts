// Author: Morgan Lee
// Issue: Learning Phase 4 - Validate authentication requests

import { z } from 'zod';

export const loginBodySchema = z.object({
  email: z.string().trim().email('A valid email is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
