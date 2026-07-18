// Author: Sam Rivera
// Issue: #13 â€” Add comments to tickets

import { useState } from 'react';

interface CommentFormProps {
  onSubmit: (body: string, isInternal: boolean) => Promise<void>;
  canCreateInternal?: boolean;
}

export function CommentForm({ onSubmit, canCreateInternal = true }: CommentFormProps) {
  const [body, setBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;

    setSubmitting(true);
    await onSubmit(body, isInternal);
    setBody('');
    setIsInternal(false);
    setSubmitting(false);
  }

  return (
    <form className="space-y-3 rounded border border-line bg-white p-4" onSubmit={handleSubmit}>
      <textarea
        className="min-h-28 w-full rounded border border-line px-3 py-2"
        placeholder="Add a comment"
        value={body}
        onChange={(event) => setBody(event.target.value)}
      />
      <div className="flex items-center justify-between">
        {canCreateInternal && (
          <label className="flex items-center gap-2 text-sm">
            <input
              checked={isInternal}
              type="checkbox"
              onChange={(event) => setIsInternal(event.target.checked)}
            />
            Internal note
          </label>
        )}
        <button
          className="rounded bg-focus px-4 py-2 text-sm font-medium text-white"
          disabled={submitting}
        >
          {submitting ? 'Posting...' : 'Post comment'}
        </button>
      </div>
    </form>
  );
}
