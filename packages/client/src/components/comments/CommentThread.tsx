// Author: Sam Rivera
// Issue: #13 â€” Render public comments and internal notes

import type { Comment } from '@helpdesk/shared';

import { formatDateTime } from '../../utils/formatters';
import { EmptyState } from '../shared/EmptyState';

interface CommentThreadProps {
  comments: Comment[];
}

export function CommentThread({ comments }: CommentThreadProps) {
  if (comments.length === 0) {
    return (
      <EmptyState
        title="No comments yet"
        description="Start the conversation with a public reply or note."
      />
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <article
          key={comment.id}
          className={`rounded border p-4 ${comment.isInternal ? 'border-amber-200 bg-amber-50' : 'border-line bg-white'}`}
        >
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>{comment.isInternal ? 'Internal note' : 'Public reply'}</span>
            <time>{formatDateTime(comment.createdAt)}</time>
          </div>
          <p className="mt-2 whitespace-pre-wrap">{comment.body}</p>
        </article>
      ))}
    </div>
  );
}
