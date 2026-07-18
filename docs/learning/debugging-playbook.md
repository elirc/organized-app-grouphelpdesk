<!-- Author: Morgan Lee | Issue: Learning Phase 8 -->

# Debugging Playbook

## Purpose

This playbook gives a practical path for debugging HelpDesk issues from React to
Express to Prisma. Use it when something breaks and you need a calm sequence
instead of random file-hopping.

## What Files To Read

- `packages/client/src/services/api.ts`
- `packages/client/src/hooks/useTickets.ts`
- `packages/server/src/index.ts`
- `packages/server/src/middleware/requestLogger.ts`
- `packages/server/src/middleware/errorHandler.ts`
- `packages/server/src/modules/tickets/ticket.routes.ts`
- `packages/server/src/modules/tickets/ticket.service.ts`
- `packages/server/src/modules/tickets/ticket.repository.ts`

## What Problem This Pattern Solves

Full-stack bugs cross boundaries. A failed ticket request might be a form bug, a
missing auth token, a Zod validation error, a service rule, or a Prisma query.

The trick is to identify the boundary where the data first becomes wrong.

## How The Pattern Works In This Repo

Trace requests in this order:

```text
React page/component
  -> custom hook
  -> api.ts
  -> Express route
  -> validation middleware
  -> controller
  -> service
  -> repository
  -> Prisma/database
```

For ticket requests, start in `ticket.routes.ts` and follow the module files.

## What Changed

Phase 8 adds this playbook so future debugging can use the architecture created
in earlier phases: request IDs, structured errors, Zod validation, auth
middleware, module boundaries, and TanStack Query cache keys.

## Why It Changed

Debugging is a mid-level engineering skill. Mid-level engineers do not just fix
the symptom; they find the layer where the contract broke.

## Common Mistakes

- Changing frontend code before reading the API response.
- Ignoring `error.code` in structured error responses.
- Assuming a `401` is a validation bug.
- Forgetting that TanStack Query may show cached data.
- Debugging Prisma before confirming the controller received valid input.
- Losing the request ID that connects logs for one request.

## Debugging Tips

For `400`, inspect `error.details.issues`. This usually points to a Zod schema.

For `401`, check localStorage and the `Authorization` header.

For `403`, check route-level `requireRole` and permission helpers.

For stale UI, check `queryKeys.ts` and mutation invalidation.

For missing audit/history records, check the service layer, not controllers.

For slow requests, inspect request logs and `responseTime` middleware output.

## Review Checklist

- Can the bug be reproduced with exact steps?
- Is the failing layer identified?
- Is the fix placed in the layer that owns the rule?
- Is there a regression test?
- Did the fix preserve existing API contracts?

## Follow-Up Exercises

1. Debug an unauthenticated ticket-list request and write the trace.
2. Break a status transition intentionally and follow the error.
3. Create a stale query bug by removing invalidation, then fix it.
4. Add a request ID to a bug report.
5. Use Prisma Studio to inspect ticket history rows.
