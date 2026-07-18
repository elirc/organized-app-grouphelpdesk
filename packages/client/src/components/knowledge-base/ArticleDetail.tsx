// Author: Morgan Lee
// Issue: #35 â€” Render markdown article details

import { marked } from 'marked';
import type { KnowledgeBaseArticle } from '@helpdesk/shared';

import { sanitizeHtml } from '../../utils/sanitizeHtml';

interface ArticleDetailProps {
  article: KnowledgeBaseArticle;
}

export function ArticleDetail({ article }: ArticleDetailProps) {
  return (
    <article className="rounded border border-line bg-white p-5">
      <p className="text-sm text-slate-600">{article.category}</p>
      <h1 className="mt-1 text-2xl font-semibold">{article.title}</h1>
      <p className="mt-2 inline-flex rounded border border-line px-2 py-1 text-xs font-semibold">
        {article.status}
      </p>
      <div
        className="prose mt-5 max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(marked.parse(article.body) as string) }}
      />
    </article>
  );
}
