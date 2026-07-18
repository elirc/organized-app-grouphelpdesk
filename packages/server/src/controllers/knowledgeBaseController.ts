// Author: Morgan Lee
// Issue: #35 â€” Map knowledge base HTTP requests to service operations

import type { NextFunction, Request, Response } from 'express';

import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from '../middleware/validateRequest';
import { knowledgeBaseService } from '../services/knowledgeBaseService';
import type { IdParams } from '../validation/commonSchemas';
import type {
  ArticleBody,
  ArticleFeedbackBody,
  UpdateArticleBody,
} from '../validation/knowledgeBaseSchemas';

export async function listArticles(_req: Request, res: Response, next: NextFunction) {
  try {
    const query = getValidatedQuery<{ search?: string }>(res);
    res.json({ data: await knowledgeBaseService.listArticles(query.search) });
  } catch (error) {
    next(error);
  }
}

export async function getArticle(_req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    res.json({ data: await knowledgeBaseService.getArticle(params.id) });
  } catch (error) {
    next(error);
  }
}

export async function createArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const body = getValidatedBody<ArticleBody>(res);
    const article = await knowledgeBaseService.createArticle({
      ...body,
      authorId: req.currentUser!.id,
    });
    res.status(201).json({ data: article });
  } catch (error) {
    next(error);
  }
}

export async function updateArticle(_req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    const body = getValidatedBody<UpdateArticleBody>(res);
    res.json({
      data: await knowledgeBaseService.updateArticle(params.id, body, _req.currentUser!.id),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteArticle(_req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    res.json({ data: await knowledgeBaseService.deleteArticle(params.id) });
  } catch (error) {
    next(error);
  }
}

export async function submitArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    res.json({ data: await knowledgeBaseService.submitForReview(params.id, req.currentUser!.id) });
  } catch (error) {
    next(error);
  }
}

export async function approveArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    res.json({ data: await knowledgeBaseService.approveArticle(params.id, req.currentUser!.id) });
  } catch (error) {
    next(error);
  }
}

export async function archiveArticle(_req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    res.json({ data: await knowledgeBaseService.archiveArticle(params.id) });
  } catch (error) {
    next(error);
  }
}

export async function listArticleVersions(_req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    res.json({ data: await knowledgeBaseService.listVersions(params.id) });
  } catch (error) {
    next(error);
  }
}

export async function addArticleFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    const body = getValidatedBody<ArticleFeedbackBody>(res);
    const feedback = await knowledgeBaseService.addFeedback(
      params.id,
      req.currentUser!.id,
      body.helpful,
      body.comment,
    );
    res.status(201).json({ data: feedback });
  } catch (error) {
    next(error);
  }
}
