<!-- Author: Morgan Lee | Issue: Learning Phase 1 -->

# HelpDesk Improvement Plan

## Purpose

This plan turns HelpDesk from a broad demo app into a stronger learning project
for a junior or intermediate engineer growing toward mid-level full-stack CRUD
work. The goal is not to make the app perfect. The goal is to make the next
engineering moves realistic, reviewable, and teachable.

## What Files To Read First

- [README.md](../../README.md): setup, features, and project shape.
- [packages/server/src/index.ts](../../packages/server/src/index.ts): Express app composition.
- [packages/server/src/routes/tickets.ts](../../packages/server/src/routes/tickets.ts): current ticket route entrypoint.
- [packages/server/src/controllers/ticketController.ts](../../packages/server/src/controllers/ticketController.ts): current HTTP boundary.
- [packages/server/src/services/ticketService.ts](../../packages/server/src/services/ticketService.ts): current ticket business logic and Prisma access.
- [packages/client/src/services/api.ts](../../packages/client/src/services/api.ts): frontend API client.
- [packages/client/src/hooks/useTickets.ts](../../packages/client/src/hooks/useTickets.ts): current manual data-fetching pattern.
- [packages/server/prisma/schema.prisma](../../packages/server/prisma/schema.prisma): current database model.

## Current Architecture Snapshot

HelpDesk currently uses this shape:

```text
React pages/components
  -> custom hooks
    -> api.ts fetch wrapper
      -> Express routes
        -> controllers
          -> services
            -> Prisma Client
              -> SQLite
```

This is a good first architecture for learning full-stack CRUD. It already
teaches monorepos, shared types, API boundaries, React composition, services,
Prisma, Docker, CI, and tests.

The next step is to make the seams more explicit. Right now controllers still do
some manual parsing, services mix business rules with database queries, and the
server trusts client-provided identity fields such as `createdBy`, `actorId`, and
`viewerRole`. Those are excellent teaching opportunities because they mirror
common early-career mistakes in real CRUD apps.

## Highest-Impact Improvement Path

### Phase 1: Learning Documentation Foundation

Status: implemented in this change.

What changes:

- Add this improvement plan.
- Add a codebase reading guide.
- Add an architecture review.
- Add a mid-level SWE skills map.
- Start a refactoring journal.

Why it matters:

Learners need to know what they are looking at before patterns get more
sophisticated. Without a reading path, a monorepo can feel like a pile of files
instead of a system.

Expected risk:

Low. Documentation-only.

### Phase 2: Backend Validation Upgrade

Planned PR size: small to medium.

Likely files affected:

- `packages/server/package.json`
- `packages/server/src/middleware/validateRequest.ts`
- `packages/server/src/controllers/*.ts`
- New server validation schema files
- `docs/learning/runtime-validation-guide.md`
- `tests/`

What changes:

- Add Zod.
- Create schemas for request bodies, params, and query strings.
- Replace controller-level manual parsing with reusable validation middleware.
- Return consistent `400` validation responses for malformed HTTP input.

Why it matters:

TypeScript checks source code, not runtime HTTP payloads. A mid-level engineer
must understand that API input is untrusted even in a TypeScript app.

Expected risk:

Medium. Validation can accidentally reject requests the current UI sends. The
safe path is to start with tickets and comments, test the failures, then expand.

### Phase 3: Ticket Domain Modular Refactor

Planned PR size: medium.

Likely files affected:

- New `packages/server/src/modules/tickets/`
- Existing ticket routes/controllers/services
- Ticket tests
- `docs/learning/backend-module-architecture-guide.md`
- `docs/learning/ticket-domain-walkthrough.md`

What changes:

- Move ticket feature into a module.
- Split ticket responsibilities into route, controller, schema, service,
  repository, mapper, permissions, and types.
- Keep behavior compatible while making boundaries easier to teach.

Why it matters:

Mid-level CRUD engineers are expected to organize features so they can grow
without becoming one large service file.

Expected risk:

Medium. Refactors can silently change behavior. Tests should be expanded before
or during the refactor.

### Phase 4: Real Authentication and RBAC

Planned PR size: medium to large.

Likely files affected:

- Prisma schema and seed data
- Server auth middleware and routes
- Ticket/comment services
- Client API and route protection
- Tests
- `docs/learning/auth-and-rbac-guide.md`
- `docs/learning/security-mistakes-in-crud-apps.md`

What changes:

- Add password hashing and login.
- Add current-user middleware.
- Derive `createdBy`, `actorId`, and visibility from authenticated request
  context.
- Enforce role-based permissions server-side.

Why it matters:

The current app is intentionally trusting. That is useful early, but unsafe.
Learning when and why to stop trusting the client is a major step toward
mid-level engineering judgment.

Expected risk:

High. Auth touches many flows. Do it after validation and ticket modularization
so the blast radius is easier to control.

### Phase 5: Frontend Server State Upgrade

Planned PR size: medium.

Likely files affected:

- `packages/client/package.json`
- `packages/client/src/main.tsx`
- `packages/client/src/hooks/`
- Ticket/comment/dashboard pages
- `docs/learning/frontend-server-state-guide.md`

What changes:

- Add TanStack Query.
- Replace manual `useEffect` server fetching where appropriate.
- Add query keys and mutation invalidation.

Why it matters:

Manual loading/error state is fine at first. As features grow, server state
needs caching, invalidation, stale data handling, and mutation coordination.

Expected risk:

Medium. The UI can regress if query keys or invalidation are wrong.

### Phase 6: Database Modeling Improvements

Planned PR size: medium.

Likely files affected:

- Prisma schema
- Seed data
- Ticket/article services
- Tests
- `docs/learning/database-modeling-guide.md`

What changes:

- Add higher-value relational models such as `Organization`, `Team`,
  `Membership`, status history, assignment history, and normalized tags.
- Replace some stringified JSON fields where the learning value is high.

Why it matters:

Most real CRUD apps are database apps wearing a UI. Mid-level engineers need to
understand relationships, indexes, joins, history, and migration risk.

Expected risk:

High. Schema changes require careful migration thinking and service updates.

### Phase 7: Testing Expansion

Planned PR size: medium.

Likely files affected:

- `tests/`
- Possibly client test tooling
- `docs/learning/testing-strategy-guide.md`

What changes:

- Add validation failure tests.
- Add authorization tests after auth exists.
- Add pagination and business-rule coverage.
- Add focused frontend tests if tooling is introduced safely.

Why it matters:

Tests teach design pressure. A hard-to-test function often has too many
responsibilities.

Expected risk:

Low to medium. Tests can become brittle if they assert implementation details.

### Phase 8: Debugging and Code Review Documentation

Planned PR size: small.

Likely files affected:

- `docs/learning/debugging-playbook.md`
- `docs/learning/code-review-guide.md`
- `docs/learning/refactoring-journal.md`
- `docs/learning/senior-engineering-decisions.md`

What changes:

- Explain how to debug requests, validation, auth, stale frontend state,
  database relationship bugs, and request logs.
- Explain how to review PRs like a mid-level engineer.

Why it matters:

Learning to debug and review is as important as learning to write new code.

Expected risk:

Low. Documentation-only.

## What Junior Engineers Often Misunderstand

- TypeScript does not validate JSON requests at runtime.
- Frontend route protection is not backend authorization.
- A service file should not become a dumping ground for every concern.
- Prisma models are not the same thing as API response shapes.
- Manual `useEffect` data fetching gets harder as mutations and invalidation
  grow.
- A database schema that works for a demo may still teach the wrong lesson for a
  realistic CRUD app.
- More abstraction is not automatically better; abstraction should reduce
  repeated reasoning.

## What A Mid-Level Engineer Should Notice

- Where user identity enters the system.
- Where untrusted input becomes trusted data.
- Whether each layer has one job.
- Whether business rules are testable without Express.
- Whether database queries are hidden behind a clear API.
- Whether API error responses are consistent enough for frontend code.
- Whether frontend state is local UI state or server-owned data.
- Whether docs explain the tradeoffs, not just the happy path.

## Debugging Tips

- Start with the route and confirm the request reaches the expected controller.
- Check whether the controller parses input or receives validated input.
- Check whether the service owns the business rule being violated.
- Check Prisma queries separately from API response mapping.
- Use request IDs in logs to follow one API call.
- In the client, check whether the page owns state that should be server state.

## PR Review Checklist

- Does this phase change one clear concept?
- Are validation, permissions, business rules, and persistence separated?
- Do tests cover the rule being introduced or refactored?
- Does documentation explain why the change exists?
- Can a junior engineer trace the new pattern from route to database or from page
  to API?
- Are there compatibility risks for existing UI flows?

## Follow-Up Exercises

1. Trace `POST /api/tickets` from the React form to Prisma and write down every
   file involved.
2. Find every place the server used to trust a client-provided user or role, then
   compare it to the current auth-backed implementation.
3. Write three invalid ticket creation payloads that TypeScript cannot prevent at
   runtime.
4. Sketch what the ticket module should look like before moving any files.
5. Identify one database field that should eventually become a relationship
   instead of a string or serialized value.
