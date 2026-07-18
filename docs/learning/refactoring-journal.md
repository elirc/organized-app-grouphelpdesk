<!-- Author: Morgan Lee | Issue: Learning Phase 1 -->

# Refactoring Journal

## Purpose

This journal records each improvement phase as if it were a realistic pull
request. It explains what changed, why it changed, what skill it teaches, and
what tradeoffs remain.

## How To Use This Journal

Read this file before reviewing a phase. It gives you the intent behind the
change so you can review the code and docs with the right questions in mind.

Each entry should include:

- date
- phase
- files changed
- summary of change
- reason for change
- what skill this teaches
- tradeoffs
- future improvement ideas

## 2026-05-20 - Phase 1: Learning Documentation Foundation

### Files Changed

- `docs/learning/improvement-plan.md`
- `docs/learning/codebase-reading-guide.md`
- `docs/learning/current-architecture-review.md`
- `docs/learning/mid-level-swe-skills-map.md`
- `docs/learning/refactoring-journal.md`

### Summary Of Change

Added the learning documentation foundation for the next improvement cycle. This
phase did not change runtime behavior. It created a practical plan, a codebase
reading path, an architecture review, a skills map, and this journal.

### Reason For Change

The repo already has a working broad-stack implementation, but the next requested
changes are large: runtime validation, ticket module refactoring, real auth,
RBAC, TanStack Query, database modeling, and expanded tests.

Doing all of that without first documenting the current architecture would make
the project harder to learn from. The documentation establishes the baseline and
explains why each future improvement matters.

### What Skill This Teaches

This phase teaches engineering orientation:

- inspect before changing
- identify architecture seams
- name risks clearly
- plan changes in reviewable phases
- connect technical changes to learning outcomes

Mid-level engineers are expected to understand the system before refactoring it.

### Tradeoffs

The obvious tradeoff is that no runtime weakness is fixed yet. The app still has
manual request parsing, client-provided identity fields, mixed service
responsibilities, manual frontend fetching, and simplified database modeling.

That is acceptable for this phase because the goal was to create a safe plan and
learning map before touching behavior.

### Future Improvement Ideas

- Phase 2 should add Zod and validation middleware.
- Phase 3 should modularize only tickets first, not every domain.
- Phase 4 should remove trust in `createdBy`, `actorId`, and `viewerRole`.
- Phase 5 should replace `useTickets` and `useComments` with TanStack Query
  hooks.
- Phase 6 should normalize tags and introduce first-class teams.

### Debugging Notes

No runtime behavior changed, so debugging risk is low.

If a future phase breaks behavior, use the reading guide to trace the affected
feature before editing.

### Review Checklist

- Do the docs point to real files in this repo?
- Does the plan avoid a giant rewrite?
- Are risks named honestly?
- Does each future phase teach a practical skill?
- Would a junior engineer know what to read next?

## 2026-05-20 - Phase 2: Backend Validation Upgrade

### Files Changed

- `packages/server/package.json`
- `packages/server/src/middleware/validateRequest.ts`
- `packages/server/src/validation/commonSchemas.ts`
- `packages/server/src/validation/ticketSchemas.ts`
- `packages/server/src/validation/commentSchemas.ts`
- `packages/server/src/validation/knowledgeBaseSchemas.ts`
- `packages/server/src/validation/userSchemas.ts`
- `packages/server/src/routes/tickets.ts`
- `packages/server/src/routes/comments.ts`
- `packages/server/src/routes/knowledgeBase.ts`
- `packages/server/src/routes/users.ts`
- `packages/server/src/controllers/ticketController.ts`
- `packages/server/src/controllers/commentController.ts`
- `packages/server/src/controllers/knowledgeBaseController.ts`
- `packages/server/src/controllers/userController.ts`
- `tests/integration/validation.test.ts`
- `docs/learning/runtime-validation-guide.md`

### Summary Of Change

Added Zod-based request validation at the backend route boundary. Routes now
validate request bodies, query strings, and params before controllers run.
Controllers now read parsed input from `res.locals` instead of manually parsing
raw `req.body`, `req.query`, or `req.params`.

### Reason For Change

The previous controller code used TypeScript casts and manual checks for runtime
HTTP input. That is a common early-career mistake: TypeScript can describe valid
data, but it cannot guarantee that a real request contains valid data.

This phase creates a clear trust boundary.

### What Skill This Teaches

This teaches the difference between compile-time types and runtime validation.
It also teaches where validation belongs in a layered API:

```text
route validation -> controller mapping -> service business rules
```

### Tradeoffs

Validation schemas add files and a dependency. They also require discipline:
shape validation should stay in schemas, while business rules should stay in
services.

For example, Zod validates that a ticket status is a known enum value. The ticket
service still validates whether the status transition is allowed.

### Future Improvement Ideas

- Move ticket validation schemas into a ticket module during Phase 3.
- Add auth-aware validation once the server derives current user identity.
- Add OpenAPI generation from Zod schemas if API documentation needs to stay
  synchronized.
- Add frontend form schemas that share validation intent without coupling the UI
  directly to backend request schemas.

### Debugging Notes

If a request now returns `400`, inspect `error.details.issues`. It should name
the invalid field path and the Zod issue code.

If a request returns `422`, the shape was valid but a service-level business rule
failed.

### Review Checklist

- Are routes validating all unsafe request parts?
- Are controllers smaller than before?
- Do validation errors return `400` consistently?
- Do services still own workflow and permission-style rules?
- Are invalid-input tests present?

## 2026-05-20 - Phase 3: Ticket Domain Modular Refactor

### Files Changed

- `packages/server/src/modules/tickets/ticket.routes.ts`
- `packages/server/src/modules/tickets/ticket.controller.ts`
- `packages/server/src/modules/tickets/ticket.schema.ts`
- `packages/server/src/modules/tickets/ticket.service.ts`
- `packages/server/src/modules/tickets/ticket.repository.ts`
- `packages/server/src/modules/tickets/ticket.mapper.ts`
- `packages/server/src/modules/tickets/ticket.permissions.ts`
- `packages/server/src/modules/tickets/ticket.types.ts`
- `packages/server/src/modules/tickets/ticket.test.ts`
- `packages/server/src/routes/tickets.ts`
- `packages/server/src/controllers/ticketController.ts`
- `packages/server/src/services/ticketService.ts`
- `tests/unit/ticketService.test.ts`
- `docs/learning/backend-module-architecture-guide.md`
- `docs/learning/ticket-domain-walkthrough.md`

### Summary Of Change

Moved the ticket backend into a feature module with separate route, controller,
schema, service, repository, mapper, permission, and type files. The old
route/controller/service files now act as compatibility exports so existing code
keeps working while new ticket work has a clearer home.

### Reason For Change

The ticket domain has grown beyond basic CRUD. It now includes pagination,
filtering, assignment rules, status transition rules, activity logging, and
response mapping. Keeping those concerns in broad folders makes the feature
harder to trace and review.

This phase creates a reference implementation for future backend modules.

### What Skill This Teaches

This teaches separation of responsibilities in a real CRUD backend:

- routes register endpoints and middleware
- schemas validate untrusted HTTP input
- controllers translate HTTP to application calls
- services own business rules
- repositories own Prisma persistence details
- mappers shape database records for API responses
- permission helpers isolate authorization-style questions

Mid-level engineers are expected to know where a change belongs and to avoid
turning controllers into catch-all files.

### Tradeoffs

The module pattern adds files and indirection. For a tiny app, that can feel like
ceremony. In this repo it is justified because HelpDesk is intentionally a
learning artifact for larger full-stack CRUD systems.

Only tickets were refactored. Comments, users, dashboard, and knowledge base
still use the older folder-by-layer layout. That is intentional: one safe module
is better than an uncontrolled rewrite.

### Future Improvement Ideas

- Move comments into `modules/comments/` once auth and visibility rules are
  upgraded.
- Move permission helpers from simple role checks to auth-aware current-user
  checks in Phase 4.
- Add repository tests for complex filters.
- Normalize tags so the mapper no longer has to parse serialized tag data.

### Debugging Notes

For ticket requests, debug in this order:

```text
route schema -> controller -> service -> repository -> mapper
```

A `400` points to schema validation. A `422` points to service-level business
rules. Incorrect database filtering points to the repository. Incorrect response
shape points to the mapper.

### Review Checklist

- Are ticket changes inside `modules/tickets/`?
- Are compatibility exports still present?
- Does the service avoid Express-specific response concerns?
- Does the repository avoid workflow decisions?
- Are tests aligned with the new responsibility boundaries?

## 2026-05-20 - Phase 4: Real Authentication And RBAC

### Files Changed

- `packages/server/prisma/schema.prisma`
- `packages/server/prisma/seed.ts`
- `packages/server/src/routes/auth.ts`
- `packages/server/src/controllers/authController.ts`
- `packages/server/src/services/authService.ts`
- `packages/server/src/middleware/auth.ts`
- `packages/server/src/utils/password.ts`
- `packages/server/src/types/express.d.ts`
- `packages/server/src/modules/tickets/ticket.routes.ts`
- `packages/server/src/modules/tickets/ticket.controller.ts`
- `packages/server/src/routes/comments.ts`
- `packages/server/src/controllers/commentController.ts`
- `packages/server/src/routes/dashboard.ts`
- `packages/server/src/routes/knowledgeBase.ts`
- `packages/server/src/controllers/knowledgeBaseController.ts`
- `packages/client/src/auth/AuthProvider.tsx`
- `packages/client/src/auth/ProtectedRoute.tsx`
- `packages/client/src/pages/LoginPage.tsx`
- `packages/client/src/App.tsx`
- `packages/client/src/services/api.ts`
- `tests/unit/authService.test.ts`
- `docs/learning/auth-and-rbac-guide.md`
- `docs/learning/security-mistakes-in-crud-apps.md`

### Summary Of Change

Added a learning-friendly authentication and RBAC flow. Users now have password
hashes, can log in through `/api/auth/login`, receive an opaque bearer session
token, and access protected routes through auth middleware. The frontend now has
an auth provider, a login page, and protected application routes.

### Reason For Change

The previous app trusted client-provided identity fields such as `createdBy`,
`authorId`, `actorId`, and `viewerRole`. That is acceptable in early scaffolding
but teaches the wrong security habit if left in place.

This phase moves identity-sensitive decisions to the server.

### What Skill This Teaches

This teaches the difference between authentication, authorization, and frontend
route protection. It also teaches that TypeScript types do not make HTTP input
trustworthy.

A mid-level engineer should notice where identity comes from and whether the
backend is enforcing the rule.

### Tradeoffs

Sessions are stored in memory. That keeps the implementation easy to read, but
sessions disappear when the server restarts and would not work across multiple
server instances.

Tokens are stored in localStorage. That is simple for a learning app, but a
production app would need a deeper discussion of XSS, cookies, CSRF, expiration,
and refresh tokens.

### Future Improvement Ideas

- Add database-backed sessions with expiration.
- Add ownership checks so customers can only view their own tickets.
- Add integration tests that log in and exercise protected endpoints.
- Add rate limiting to login.
- Replace compatibility identity fields in shared types once all callers are
  migrated.

### Debugging Notes

A `401` means the request has no valid session. A `403` means the user is logged
in but lacks the role required for the route.

If login fails after schema changes, run Prisma generate and reseed the database
so users have `passwordHash` values.

### Review Checklist

- Is `req.currentUser` used instead of trusting body/query identity fields?
- Are dashboard and assignment routes protected server-side?
- Does login avoid returning `passwordHash`?
- Are frontend route guards treated as UX, not security?
- Are the remaining auth limitations documented honestly?

## 2026-05-20 - Phase 5: Frontend Server State Upgrade

### Files Changed

- `packages/client/package.json`
- `packages/client/src/App.tsx`
- `packages/client/src/services/queryClient.ts`
- `packages/client/src/services/queryKeys.ts`
- `packages/client/src/hooks/useTickets.ts`
- `packages/client/src/hooks/useComments.ts`
- `packages/client/src/hooks/useDashboard.ts`
- `docs/learning/frontend-server-state-guide.md`

### Summary Of Change

Added TanStack Query and moved ticket, comment, and dashboard fetching from
manual `useEffect` state machines into query and mutation hooks. The existing
hook return shapes were preserved where practical so the UI could migrate
incrementally.

### Reason For Change

Manual frontend fetching had repeated loading/error logic and no shared cache
invalidation model. That works in a small demo, but it becomes hard to reason
about as CRUD features grow.

### What Skill This Teaches

This teaches the difference between client state and server state. It also
teaches stable query keys, mutation invalidation, and how to improve data flow
without rewriting every component.

### Tradeoffs

The app now has another dependency and a new abstraction to learn. Some hooks
still expose the old `{ loading, error }` shape as a compatibility layer, so the
codebase is in an intentional transition state.

### Future Improvement Ideas

- Move user and knowledge-base data fetching to TanStack Query.
- Add `useCreateTicketMutation` to the create-ticket page.
- Add optimistic assignment updates.
- Add frontend tests for loading, error, and mutation states.

### Debugging Notes

If data looks stale, check `queryKeys.ts` and mutation `onSuccess` handlers.
Most React Query bugs in CRUD apps are cache-key or invalidation bugs.

### Review Checklist

- Are query keys reused consistently?
- Do mutations invalidate affected list/detail queries?
- Is the API client still centralized?
- Did the phase avoid a giant frontend rewrite?

## 2026-05-20 - Phase 6: Database Modeling Improvements

### Files Changed

- `packages/server/prisma/schema.prisma`
- `packages/server/prisma/seed.ts`
- `packages/server/src/modules/tickets/ticket.types.ts`
- `packages/server/src/modules/tickets/ticket.repository.ts`
- `packages/server/src/modules/tickets/ticket.service.ts`
- `docs/learning/database-modeling-guide.md`

### Summary Of Change

Added first-class organization and team models, connected users and tickets to
teams through Prisma relations, and added ticket status/assignment history
tables. Ticket status and assignment changes now write structured history rows in
addition to the existing activity log.

### Reason For Change

The original schema used simple string fields for team membership and a generic
activity log for all audit behavior. That was good for early scaffolding but
missed important relational modeling lessons.

### What Skill This Teaches

This phase teaches one-to-many relationships, foreign keys, seed ordering,
history/audit modeling, and when a concept should graduate from a string field
to a table.

### Tradeoffs

The schema is more realistic, but it is not fully normalized yet. Tags are still
serialized strings, and the API does not yet expose organization/team management
endpoints.

### Future Improvement Ideas

- Normalize tags with a join table.
- Add organization scoping to all ticket queries.
- Add tests for history row creation.
- Add real Prisma migrations for production-style change management.

### Debugging Notes

Foreign-key failures usually mean seed order or missing related records. Missing
history rows usually mean the service path did not call the repository history
method.

### Review Checklist

- Do relations preserve existing core behavior?
- Are history writes inside the service layer?
- Does seed data create parent records first?
- Are schema tradeoffs documented honestly?

## 2026-05-20 - Phase 7: Testing Expansion

### Files Changed

- `tests/unit/ticketService.test.ts`
- `tests/integration/authz.test.ts`
- `docs/learning/testing-strategy-guide.md`
- `docs/learning/refactoring-journal.md`

### Summary Of Change

Added focused tests for protected API boundaries and ticket status history
creation. Documented the project's testing strategy and how to decide what layer
should own a test.

### Reason For Change

Recent phases added security and persistence side effects. Those are exactly the
areas that regress during refactors if tests only cover happy-path CRUD.

### What Skill This Teaches

This phase teaches test selection: unit tests for business rules and helper
logic, integration tests for HTTP boundaries, and side-effect tests for audit
behavior.

### Tradeoffs

The tests still do not use a dedicated test database for full login flows. That
is a worthwhile future improvement, but the current tests add useful protection
without requiring a larger test harness.

### Future Improvement Ideas

- Add database-backed auth integration tests.
- Add frontend tests for protected routes and TanStack Query states.
- Add Playwright smoke tests for login and ticket creation.

### Debugging Notes

If a service test fails after a repository change, inspect the mock contract. If
an integration test returns `400`, check validation first; if it returns `401` or
`403`, check auth middleware.

### Review Checklist

- Do tests protect important behavior?
- Are auth failures covered?
- Are side effects like history writes covered?
- Does the documentation explain what not to over-test?

## 2026-05-20 - Phase 8: Debugging And Code Review Documentation

### Files Changed

- `docs/learning/debugging-playbook.md`
- `docs/learning/code-review-guide.md`
- `docs/learning/senior-engineering-decisions.md`
- `docs/learning/refactoring-retrospective.md`
- `docs/learning/refactoring-journal.md`

### Summary Of Change

Added the final learning documentation layer: debugging guidance, code review
guidance, senior decision tradeoffs, and a retrospective.

### Reason For Change

The repo is meant to teach realistic software engineering, not only produce a
working app. Debugging, reviewing, and tradeoff explanation are core mid-level
skills.

### What Skill This Teaches

This phase teaches how to trace bugs, review PRs, explain decisions, and name
technical debt honestly.

### Tradeoffs

No runtime behavior changed in this phase. The value is learning leverage and
future maintainability.

### Future Improvement Ideas

- Add screenshots or diagrams to the debugging guide.
- Add example PR reviews against real commits.
- Convert the retrospective into GitHub issues for the next learning cycle.

### Debugging Notes

Use the debugging playbook before editing code. The fastest fix usually starts
with finding the failing layer.

### Review Checklist

- Are the docs practical and repo-specific?
- Do they name common mistakes?
- Do they include debugging and review guidance?
- Do they honestly describe remaining debt?
