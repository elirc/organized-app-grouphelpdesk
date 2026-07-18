<!-- Author: Sam Rivera | Issue: Learning Phase 5 -->

# Frontend Server State Guide

## Purpose

This guide explains the Phase 5 move from manual `useEffect` data fetching to
TanStack Query. The goal is to teach a practical mid-level React skill: server
state should usually be cached, invalidated, and refreshed by a dedicated data
layer instead of hand-rolled in every component.

## What Files To Read

- `packages/client/src/services/queryClient.ts`
- `packages/client/src/services/queryKeys.ts`
- `packages/client/src/App.tsx`
- `packages/client/src/hooks/useTickets.ts`
- `packages/client/src/hooks/useComments.ts`
- `packages/client/src/hooks/useDashboard.ts`
- `packages/client/src/services/api.ts`

## What Problem This Pattern Solves

Manual fetching starts simple:

```ts
useEffect(() => {
  setLoading(true);
  api.tickets.list().then(...);
}, []);
```

But it becomes repetitive when the app needs caching, refetching, mutation
updates, stale data handling, error states, and request cancellation.

TanStack Query gives the app one consistent server-state model.

## How The Pattern Works In This Repo

`queryClient.ts` configures shared query behavior like `staleTime`, retry count,
and whether to refetch on window focus.

`queryKeys.ts` centralizes cache keys:

```ts
queryKeys.tickets.detail(ticket.id);
```

That matters because invalidation only works reliably when the team uses the
same key shape everywhere.

The ticket hooks now wrap TanStack Query:

```ts
useTicketsQuery(filters);
useTicketQuery(id);
useUpdateTicketMutation(id);
useAssignTicketMutation(id);
```

The older `useTickets` and `useTicket` exports still return `{ loading, error }`
so existing pages do not need a giant rewrite.

## What Changed

- Added `@tanstack/react-query`.
- Added a root `QueryClientProvider`.
- Added stable query-key helpers.
- Replaced manual ticket, comment, and dashboard `useEffect` fetching with
  queries.
- Added ticket/comment mutation hooks with cache invalidation.

## Why It Changed

This teaches the difference between client state and server state.

Client state is UI-only: whether a modal is open, the current text in a form, or
which tab is active.

Server state comes from the API: tickets, comments, dashboard metrics, users,
and articles. It can become stale and may be shared across pages.

A mid-level React engineer should avoid copying server state into local state
unless there is a clear reason.

## Common Mistakes

- Building a new loading/error state machine in every hook.
- Using inconsistent query keys like `['ticket', id]` in one file and
  `['tickets', id]` in another.
- Forgetting to invalidate list queries after creating or updating records.
- Duplicating server data into local component state and wondering why it goes
  stale.
- Treating mutations as "just POST requests" instead of cache-changing events.

## Debugging Tips

If a page shows stale data after a mutation, check the mutation's `onSuccess`
handler and confirm it invalidates the right query key.

If a query runs too often, inspect the query key. Passing a newly constructed
object is okay when its values are stable, but noisy filter objects can cause
extra fetches.

If the app says the user is unauthorized after login, debug auth first: TanStack
Query is only calling the centralized API client, which adds the bearer token.

## Review Checklist

- Are query keys centralized?
- Does each mutation invalidate or update affected caches?
- Are loading and error states still visible in the UI?
- Does the API client remain the only place that knows `fetch` details?
- Did the PR avoid unnecessary local copies of server state?
- Are old hook names kept only where they reduce migration risk?

## Follow-Up Exercises

1. Add `useCreateTicketMutation` and update `CreateTicketPage` to use it.
2. Add React Query Devtools in development only.
3. Move user and knowledge-base fetching to query hooks.
4. Implement optimistic assignment updates and rollback on error.
5. Write a short note comparing `staleTime` and `cacheTime`.
