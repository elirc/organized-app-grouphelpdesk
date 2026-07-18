// Author: Sam Rivera
// Issue: #6 â€” Create typed API client wrapper

import type {
  AgentWorkload,
  Attachment,
  AttachmentInput,
  ArticleInput,
  ArticleVersion,
  Comment,
  CreateCommentInput,
  CreateTicketInput,
  DashboardMetrics,
  EscalationReviewResult,
  KnowledgeBaseArticle,
  LoginInput,
  LoginResponse,
  Notification,
  SlaPolicy,
  SlaPolicyInput,
  SystemHealth,
  Ticket,
  TicketFilters,
  UpdateTicketInput,
  User,
} from '@helpdesk/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const AUTH_STORAGE_KEY = 'helpdesk.authToken';

let authToken =
  typeof window === 'undefined' ? null : window.localStorage.getItem(AUTH_STORAGE_KEY);

interface ApiErrorBody {
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

function buildQuery(params?: object) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    searchParams.set(key, Array.isArray(value) ? value.join(',') : String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...init?.headers,
    },
  });

  const body = (await response.json().catch(() => ({}))) as ApiErrorBody | T;

  if (!response.ok) {
    const errorBody = body as ApiErrorBody;
    throw new ApiError(
      response.status,
      errorBody.error?.code ?? 'UNKNOWN_ERROR',
      errorBody.error?.message ?? 'Request failed.',
      errorBody.error?.details,
    );
  }

  return body as T;
}

export function setAuthToken(token: string | null) {
  authToken = token;

  if (typeof window === 'undefined') return;

  if (token) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export const api = {
  auth: {
    login(input: LoginInput) {
      return request<{ data: LoginResponse }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    me() {
      return request<{ data: User }>('/api/auth/me');
    },
    async logout() {
      await request<void>('/api/auth/logout', { method: 'POST' });
      setAuthToken(null);
    },
  },
  tickets: {
    list(filters: TicketFilters = {}) {
      return request<{
        data: Ticket[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>(`/api/tickets${buildQuery(filters)}`);
    },
    get(id: string) {
      return request<{ data: Ticket }>(`/api/tickets/${id}`);
    },
    create(input: CreateTicketInput) {
      return request<{ data: Ticket }>('/api/tickets', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    update(id: string, input: UpdateTicketInput) {
      return request<{ data: Ticket }>(`/api/tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      });
    },
    assign(id: string, assigneeId: string) {
      return request<{ data: Ticket }>(`/api/tickets/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ assigneeId }),
      });
    },
  },
  comments: {
    list(ticketId: string, includeInternal = true) {
      return request<{ data: Comment[] }>(
        `/api/tickets/${ticketId}/comments${buildQuery({
          includeInternal,
        })}`,
      );
    },
    create(input: CreateCommentInput) {
      return request<{ data: Comment }>(`/api/tickets/${input.ticketId}/comments`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
  },
  attachments: {
    list(ticketId: string) {
      return request<{ data: Attachment[] }>(`/api/tickets/${ticketId}/attachments`);
    },
    create(ticketId: string, input: AttachmentInput) {
      return request<{ data: Attachment }>(`/api/tickets/${ticketId}/attachments`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
  },
  users: {
    list(role?: string) {
      return request<{ data: User[] }>(`/api/users${buildQuery({ role })}`);
    },
  },
  dashboard: {
    metrics() {
      return request<{ data: DashboardMetrics }>('/api/dashboard/metrics');
    },
    activity() {
      return request<{ data: unknown[] }>('/api/dashboard/activity');
    },
    workload() {
      return request<{ data: AgentWorkload[] }>('/api/dashboard/agent-workload');
    },
    system() {
      return request<{ data: SystemHealth }>('/api/dashboard/system');
    },
  },
  articles: {
    list(search?: string) {
      return request<{ data: KnowledgeBaseArticle[] }>(`/api/articles${buildQuery({ search })}`);
    },
    get(id: string) {
      return request<{ data: KnowledgeBaseArticle }>(`/api/articles/${id}`);
    },
    create(input: ArticleInput) {
      return request<{ data: KnowledgeBaseArticle }>('/api/articles', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    update(id: string, input: Partial<ArticleInput>) {
      return request<{ data: KnowledgeBaseArticle }>(`/api/articles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      });
    },
    submit(id: string) {
      return request<{ data: KnowledgeBaseArticle }>(`/api/articles/${id}/submit`, {
        method: 'POST',
      });
    },
    approve(id: string) {
      return request<{ data: KnowledgeBaseArticle }>(`/api/articles/${id}/approve`, {
        method: 'POST',
      });
    },
    archive(id: string) {
      return request<{ data: KnowledgeBaseArticle }>(`/api/articles/${id}/archive`, {
        method: 'POST',
      });
    },
    versions(id: string) {
      return request<{ data: ArticleVersion[] }>(`/api/articles/${id}/versions`);
    },
    feedback(id: string, helpful: boolean, comment?: string) {
      return request<{ data: unknown }>(`/api/articles/${id}/feedback`, {
        method: 'POST',
        body: JSON.stringify({ helpful, comment }),
      });
    },
  },
  notifications: {
    list() {
      return request<{ data: Notification[] }>('/api/notifications');
    },
    markRead(id: string) {
      return request<{ data: Notification }>(`/api/notifications/${id}/read`, {
        method: 'POST',
      });
    },
  },
  sla: {
    listPolicies() {
      return request<{ data: SlaPolicy[] }>('/api/sla/policies');
    },
    createPolicy(input: SlaPolicyInput) {
      return request<{ data: SlaPolicy }>('/api/sla/policies', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
    reviewEscalations() {
      return request<{ data: EscalationReviewResult }>('/api/sla/escalations/review', {
        method: 'POST',
      });
    },
  },
};
