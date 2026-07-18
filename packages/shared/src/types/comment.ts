// Author: Morgan Lee
// Issue: #12 â€” Define shared comment types

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
}

export interface CreateCommentInput {
  ticketId: string;
  authorId?: string;
  body: string;
  isInternal?: boolean;
}
