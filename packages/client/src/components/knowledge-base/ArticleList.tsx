// Author: Morgan Lee
// Issue: #35 â€” Render searchable knowledge base article list

import type { KnowledgeBaseArticle } from '@helpdesk/shared';

interface ArticleListProps {
  articles: KnowledgeBaseArticle[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function ArticleList({ articles, selectedId, onSelect }: ArticleListProps) {
  return (
    <div className="space-y-2">
      {articles.map((article) => (
        <button
          key={article.id}
          className={`w-full rounded border p-3 text-left ${
            selectedId === article.id ? 'border-focus bg-teal-50' : 'border-line bg-white'
          }`}
          type="button"
          onClick={() => onSelect(article.id)}
        >
          <strong>{article.title}</strong>
          <p className="text-sm text-slate-600">{article.category}</p>
        </button>
      ))}
    </div>
  );
}
