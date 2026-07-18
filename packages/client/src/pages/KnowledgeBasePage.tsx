// Author: Morgan Lee
// Issue: #36 â€” Render knowledge base page

import { useEffect, useState } from 'react';
import type { ArticleInput, KnowledgeBaseArticle } from '@helpdesk/shared';

import { ArticleDetail } from '../components/knowledge-base/ArticleDetail';
import { ArticleForm } from '../components/knowledge-base/ArticleForm';
import { ArticleList } from '../components/knowledge-base/ArticleList';
import { EmptyState } from '../components/shared/EmptyState';
import { api } from '../services/api';

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const selected = articles.find((article) => article.id === selectedId) ?? articles[0];

  async function refresh() {
    const response = await api.articles.list();
    setArticles(response.data);
  }

  async function createArticle(input: ArticleInput) {
    await api.articles.create(input);
    await refresh();
  }

  async function transitionArticle(action: 'submit' | 'approve' | 'archive') {
    if (!selected) return;

    if (action === 'submit') await api.articles.submit(selected.id);
    if (action === 'approve') await api.articles.approve(selected.id);
    if (action === 'archive') await api.articles.archive(selected.id);
    await refresh();
  }

  async function sendFeedback(helpful: boolean) {
    if (!selected) return;
    await api.articles.feedback(selected.id, helpful);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">Knowledge base</h1>
        <ArticleList articles={articles} selectedId={selected?.id} onSelect={setSelectedId} />
      </section>
      <section className="space-y-6">
        {selected ? (
          <>
            <ArticleDetail article={selected} />
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded border border-line px-3 py-2 text-sm font-semibold"
                onClick={() => transitionArticle('submit')}
              >
                Submit
              </button>
              <button
                className="rounded border border-line px-3 py-2 text-sm font-semibold"
                onClick={() => transitionArticle('approve')}
              >
                Approve
              </button>
              <button
                className="rounded border border-line px-3 py-2 text-sm font-semibold"
                onClick={() => transitionArticle('archive')}
              >
                Archive
              </button>
              <button
                className="rounded border border-line px-3 py-2 text-sm font-semibold"
                onClick={() => sendFeedback(true)}
              >
                Helpful
              </button>
            </div>
          </>
        ) : (
          <EmptyState title="No articles" description="Create the first article below." />
        )}
        <ArticleForm onSubmit={createArticle} />
      </section>
    </div>
  );
}
