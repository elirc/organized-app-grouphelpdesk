// Author: Morgan Lee
// Issue: Enterprise Sprint 2 - Share attachment metadata contracts

export interface Attachment {
  id: string;
  ticketId: string;
  commentId: string | null;
  uploadedBy: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  createdAt: string;
}

export interface AttachmentInput {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  commentId?: string | null;
}
