<!-- Author: Morgan Lee | Issue: Learning Phase 1 -->

# Mid-Level SWE Skills Map

## Purpose

This map connects HelpDesk improvements to the skills a junior or intermediate
engineer needs to grow toward mid-level full-stack CRUD work. It is practical on
purpose: each skill is tied to files in this repo and to the kind of judgment a
reviewer expects.

## What Files To Read

- [docs/learning/improvement-plan.md](./improvement-plan.md)
- [docs/learning/codebase-reading-guide.md](./codebase-reading-guide.md)
- [docs/learning/current-architecture-review.md](./current-architecture-review.md)
- [packages/server/src/controllers/ticketController.ts](../../packages/server/src/controllers/ticketController.ts)
- [packages/server/src/services/ticketService.ts](../../packages/server/src/services/ticketService.ts)
- [packages/client/src/hooks/useTickets.ts](../../packages/client/src/hooks/useTickets.ts)
- [packages/server/prisma/schema.prisma](../../packages/server/prisma/schema.prisma)

## Skill 1: Trace A Feature End To End

### What Problem This Skill Solves

Junior engineers often fix the first file they find. Mid-level engineers trace
the whole path before deciding where a change belongs.

### How It Works In This Repo

Ticket creation crosses:

```text
TicketForm.tsx
  -> api.ts
  -> routes/tickets.ts
  -> ticketController.ts
  -> ticketService.ts
  -> schema.prisma
```

### What A Mid-Level Engineer Should Notice

- The form is not the source of truth for validation.
- The API client should not know Prisma details.
- The controller should not own business rules.
- The service should not trust client-provided identity forever.

### Follow-Up Exercise

Trace comment creation and write down every file involved.

## Skill 2: Separate Compile-Time Types From Runtime Validation

### What Problem This Skill Solves

TypeScript can prove facts about source code. It cannot prove that an HTTP
request body from a browser is valid.

### How It Works In This Repo Today

`CreateTicketInput` describes a valid ticket creation input. But
`req.body.title` can still be missing, a number, an object, or malicious input.

### Planned Improvement

Phase 2 adds Zod schemas and validation middleware.

### Common Mistake

Writing this:

```ts
const input = req.body as CreateTicketInput;
```

That silences TypeScript. It does not validate the request.

### Review Checklist

- Does the schema reject invalid runtime input?
- Does the controller receive already-validated data?
- Are validation errors readable?
- Are invalid enum values tested?

## Skill 3: Respect Trust Boundaries

### What Problem This Skill Solves

Most CRUD security bugs happen when the server believes something the client
said about identity or permissions.

### How It Works In This Repo Today

The app currently sends fields such as:

- `createdBy`
- `actorId`
- `viewerRole`

Those are learning shortcuts. They should not survive real auth.

### Planned Improvement

Phase 4 adds authentication middleware and derives the current user from the
request. Services will receive trusted user context from the server, not from the
client payload.

### What A Mid-Level Engineer Should Notice

- Frontend route protection improves UX, not security.
- Backend permission checks are mandatory.
- Logs should avoid leaking sensitive auth details.
- Tests should prove unauthorized requests fail.

## Skill 4: Keep Layers Honest

### What Problem This Skill Solves

As a feature grows, one large service file becomes hard to reason about and hard
to test.

### How It Works In This Repo Today

`ticketService.ts` currently handles:

- validation
- user lookup
- status transitions
- Prisma queries
- mapping tags and dates
- activity logging

### Planned Improvement

Phase 3 introduces a ticket module:

```text
ticket.routes.ts
ticket.controller.ts
ticket.schema.ts
ticket.service.ts
ticket.repository.ts
ticket.mapper.ts
ticket.permissions.ts
ticket.types.ts
```

### Common Mistake

Moving files without improving responsibilities. A module folder is not useful if
each file still mixes HTTP, business logic, and database concerns.

## Skill 5: Model Data Relationally

### What Problem This Skill Solves

CRUD apps are mostly about data relationships. Poor modeling makes features
harder, queries slower, and permissions confusing.

### How It Works In This Repo Today

The schema has useful core models: users, tickets, comments, articles, and
activity logs.

It also has learning shortcuts:

- tags are serialized strings
- activity details are serialized strings
- teams are string IDs instead of first-class rows

### Planned Improvement

Phase 6 introduces higher-value relational models such as teams, memberships,
status history, assignment history, and normalized tags.

### What A Mid-Level Engineer Should Notice

- Serialized fields can be acceptable early but limit querying.
- Join tables are normal in CRUD apps.
- Indexes should match common lookup patterns.
- Schema changes are product changes, not just code changes.

## Skill 6: Manage Server State Deliberately

### What Problem This Skill Solves

Manual fetching becomes fragile when the same data appears in many places.

### How It Works In This Repo Today

`useTickets` manually owns:

- loading
- error
- current data
- cancellation guard
- refetch trigger through dependency changes

### Planned Improvement

Phase 5 adds TanStack Query.

### What A Mid-Level Engineer Should Notice

- Server state is owned by the server.
- The frontend cache needs stable query keys.
- Mutations should invalidate affected queries.
- Duplicating server data into local state creates stale UI bugs.

## Skill 7: Test Business Rules At The Right Layer

### What Problem This Skill Solves

Not every test should be an end-to-end test. Not every function needs a unit
test. Mid-level engineers choose the layer that gives confidence with the least
fragility.

### How It Works In This Repo Today

There are tests for:

- ticket service behavior
- comment visibility
- status transitions
- dashboard aggregation
- health endpoint wiring

### Planned Improvement

Phase 7 expands tests around validation, auth, permissions, pagination, and UI
states.

### Review Checklist

- Does the test fail for the right reason?
- Is it testing behavior instead of implementation trivia?
- Does it cover unhappy paths?
- Does it support refactoring?

## Skill 8: Document Tradeoffs

### What Problem This Skill Solves

Real engineering is full of "good enough for now" decisions. The important part
is making those decisions visible.

### How It Works In This Repo Today

The docs already include ADRs and learning journal entries. This new learning
folder adds a more practical refactoring trail.

### What A Mid-Level Engineer Should Notice

- A shortcut is less dangerous when it is named.
- A future improvement is more likely to happen when the reason is documented.
- Reviewers can evaluate tradeoffs better when they know the context.

## Debugging Tips

- If you are lost, draw the request path before editing code.
- If TypeScript is quiet but runtime behavior is wrong, suspect validation or
  data shape.
- If permissions are wrong, identify who the server thinks the current user is.
- If UI state is stale, identify the query or mutation that should refresh it.
- If database behavior is awkward, inspect whether the schema models the
  relationship directly.

## Follow-Up Exercises

1. Pick one current weakness and explain which skill it teaches.
2. Review `ticketService.ts` and label each function by responsibility.
3. Write a fake PR comment about why `viewerRole` is unsafe.
4. Write a test name for each planned validation failure.
5. Sketch the TanStack Query key for ticket list filters.
