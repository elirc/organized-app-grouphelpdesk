// Author: Morgan Lee
// Issue: #35 â€” Define shared knowledge base types

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  authorId: string;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleInput {
  title: string;
  body: string;
  category: string;
  tags?: string[];
  authorId?: string;
  status?: ArticleStatus;
}

export interface ArticleVersion {
  id: string;
  articleId: string;
  versionNumber: number;
  title: string;
  body: string;
  category: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
}

export interface ArticleFeedback {
  id: string;
  articleId: string;
  userId: string;
  helpful: boolean;
  comment: string | null;
  createdAt: string;
}
