// Author: Morgan Lee
// Issue: Enterprise Sprint 2 - Validate attachment metadata

import { z } from 'zod';

export const attachmentBodySchema = z.object({
  fileName: z.string().trim().min(1, 'fileName is required').max(255),
  mimeType: z.string().trim().min(1, 'mimeType is required').max(120),
  sizeBytes: z.coerce.number().int().min(1),
  commentId: z.string().trim().min(1).nullable().optional(),
});

export type AttachmentBody = z.infer<typeof attachmentBodySchema>;
