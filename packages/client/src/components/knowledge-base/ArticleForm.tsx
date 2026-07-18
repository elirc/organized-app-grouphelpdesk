// Author: Morgan Lee
// Issue: #36 â€” Create articles with markdown preview

import { useState } from 'react';
import { marked } from 'marked';
import { ArticleStatus } from '@helpdesk/shared';
import type { ArticleInput } from '@helpdesk/shared';

import { sanitizeHtml } from '../../utils/sanitizeHtml';
import { splitTags } from '../../utils/validators';

interface ArticleFormProps {
  onSubmit: (input: ArticleInput) => Promise<void>;
}

export function ArticleForm({ onSubmit }: ArticleFormProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('# New article');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await onSubmit({
      title,
      body,
      category,
      tags: splitTags(tags),
      status: ArticleStatus.DRAFT,
    });
  }

  return (
    <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
      <div className="space-y-3 rounded border border-line bg-white p-4">
        <input
          className="w-full rounded border border-line px-3 py-2"
          placeholder="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <input
          className="w-full rounded border border-line px-3 py-2"
          placeholder="Category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        />
        <input
          className="w-full rounded border border-line px-3 py-2"
          placeholder="Tags"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
        />
        <textarea
          className="min-h-64 w-full rounded border border-line px-3 py-2 font-mono text-sm"
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <button className="rounded bg-focus px-4 py-2 font-medium text-white">Save article</button>
      </div>
      <div className="rounded border border-line bg-white p-4">
        <h2 className="mb-3 font-semibold">Preview</h2>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(marked.parse(body) as string) }}
        />
      </div>
    </form>
  );
}
