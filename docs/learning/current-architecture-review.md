<!-- Author: Morgan Lee | Issue: Learning Phase 1 -->

# Current Architecture Review

## Purpose

This review was written at the start of the improvement cycle. It explains the
baseline HelpDesk architecture before the Phase 2-8 upgrades. It is intentionally
kept as a historical review so learners can see what risks were identified
before validation, auth, modular ticket architecture, TanStack Query, and richer
database modeling were added.

For the current post-improvement state, read
`docs/learning/refactoring-retrospective.md` and
`docs/architecture/system-overview.md`.

## What Files To Read

- [packages/server/src/index.ts](../../packages/server/src/index.ts)
- [packages/server/src/controllers/ticketController.ts](../../packages/server/src/controllers/ticketController.ts)
- [packages/server/src/services/ticketService.ts](../../packages/server/src/services/ticketService.ts)
- [packages/server/src/services/commentService.ts](../../packages/server/src/services/commentService.ts)
- [packages/server/src/middleware/errorHandler.ts](../../packages/server/src/middleware/errorHandler.ts)
- [packages/server/src/middleware/validateRequest.ts](../../packages/server/src/middleware/validateRequest.ts)
- [packages/client/src/services/api.ts](../../packages/client/src/services/api.ts)
- [packages/client/src/hooks/useTickets.ts](../../packages/client/src/hooks/useTickets.ts)
- [packages/server/prisma/schema.prisma](../../packages/server/prisma/schema.prisma)

## What The Project Already Teaches Well

### Full-stack feature tracing

The app has enough surface area to trace real CRUD behavior from React to Prisma.
Tickets, comments, assignments, dashboards, and knowledge base articles all move
through recognizable full-stack layers.

### Monorepo basics

The repo teaches npm workspaces and shared packages. A learner can see how
`@helpdesk/shared` gives both the client and server access to the same TypeScript
contracts.

### Layered backend basics

The backend already separates routes, controllers, services, middleware, and
utilities. That is a good early pattern.

### Operational awareness

Pino logging, request IDs, response time tracking, Docker, and GitHub Actions
make the project feel more like a team codebase than a single tutorial app.

### Testing entry points

There are unit tests for services and workflow rules, plus a small Express health
check integration test.

## What Is Missing

Historical note: the items in this section were missing at the start of the
improvement cycle. Most of them have now been addressed in later phases. They are
left here as the original architecture review, not as the current backlog.

### Runtime validation

Controllers parsed request input manually. Example:

```ts
const status = splitQuery(req.query.status) as TicketStatus[] | undefined;
```

That cast tells TypeScript what we hope is true. It does not prove the incoming
HTTP value is valid.

What was missing:

- schema-based request validation
- readable validation errors
- a clear boundary between untrusted input and trusted service input

### Authentication and authorization

The server trusted fields like `createdBy`, `actorId`, and `viewerRole` from the
client.

That is acceptable for an early learning scaffold, but it is not safe for a real
CRUD app. A user should not be able to send another user's ID and act as them.

What was missing:

- login
- password hashing
- current-user context
- server-side role checks
- permission helpers

### Ticket module boundaries

`ticketService.ts` handled:

- validation
- business rules
- Prisma queries
- mapping database records to API records
- activity logging decisions

That is too much for one file as the domain grows.

What was missing:

- ticket repository
- ticket mapper
- ticket schemas
- ticket permissions
- ticket-specific tests near the module

### Frontend server state management

Hooks like `useTickets` manually tracked loading, error, cancellation, and
response state. That was a good learning step, but it became repetitive once
mutations and invalidation mattered.

What was missing:

- stable query keys
- query cache
- mutation invalidation
- shared retry/stale behavior
- less duplicated loading/error handling

### More realistic database relationships

The Prisma schema stores tags and activity details as strings. That was a
reasonable SQLite-friendly shortcut, but it limits what learners can practice
with relational modeling.

What was missing:

- normalized tags
- teams as first-class rows
- organization/tenant boundary
- assignment history
- status history

## What Problem The Next Patterns Solve

Zod solves the "unknown JSON crossed into my TypeScript app" problem.

Module architecture solves the "one service file owns too many reasons to
change" problem.

Auth and RBAC solve the "the client told us who they are" problem.

TanStack Query solves the "every hook hand-rolls server state" problem.

Database modeling improvements solve the "string fields are hiding
relationships" problem.

## How The Current Pattern Works

Baseline ticket list flow:

```text
TicketsPage
  -> useTickets
  -> api.tickets.list
  -> GET /api/tickets
  -> ticketController.listTickets
  -> ticketService.getTickets
  -> prisma.ticket.findMany
```

Baseline ticket creation flow:

```text
TicketForm
  -> api.tickets.create
  -> POST /api/tickets
  -> ticketController.createTicket
  -> ticketService.createTicket
  -> prisma.ticket.create
  -> activityLogService.logActivity
```

Baseline comment visibility flow:

```text
CommentThread
  -> useComments
  -> api.comments.list(includeInternal=true, viewerRole=AGENT)
  -> commentController.listComments
  -> commentService.getComments
```

The last flow was intentionally the most important risk. Phase 4 replaced trust
in `viewerRole` with authenticated request context.

## What Changed In This Phase

This phase added architecture documentation only. No runtime behavior changed.

New files:

- `docs/learning/improvement-plan.md`
- `docs/learning/codebase-reading-guide.md`
- `docs/learning/current-architecture-review.md`
- `docs/learning/mid-level-swe-skills-map.md`
- `docs/learning/refactoring-journal.md`

## Why It Changed

The project is about learning. A good learning repo needs more than code; it
needs a map of the code's strengths, weaknesses, and next moves.

This review gives future phases a decision trail. When Zod, auth, repositories,
or TanStack Query are added later, the learner can see what problem each pattern
was introduced to solve.

## Common Mistakes

- Thinking "the app works" means the architecture is done.
- Adding auth before understanding where identity is currently trusted.
- Refactoring everything at once instead of choosing one reference domain.
- Adding repositories because they sound professional, not because they clarify
  persistence boundaries.
- Replacing manual hooks with TanStack Query without understanding cache keys.

## Debugging Tips

- If a request accepts bad input, inspect the controller first.
- If a user can see or change something they should not, search for `actorId`,
  `createdBy`, and `viewerRole`.
- If ticket behavior is hard to test, inspect `ticketService.ts` for mixed
  responsibilities.
- If UI data does not refresh after a mutation, inspect the hook and API call.
- If tag/category queries feel awkward, inspect how tags are stored in Prisma.

## Review Checklist

- Does the review identify actual files, not vague layers?
- Does each weakness connect to a planned improvement?
- Does the plan preserve working features?
- Does the plan teach a transferable skill?
- Are the highest-risk changes postponed until safer foundations exist?

## Follow-Up Exercises

1. Open `ticketController.ts` and mark every line that handles validation.
2. Open `ticketService.ts` and mark every line that touches Prisma.
3. Open `ticketService.ts` again and mark every line that is business logic.
4. Compare those two sets of lines. What would move into a repository?
5. Search for `viewerRole`. Explain why it is unsafe once auth exists.
