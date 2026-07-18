<!-- Author: Morgan Lee | Issue: Learning Phase 3 -->

# Backend Module Architecture Guide

## Purpose

This guide explains the backend module pattern introduced for the ticket domain.
The goal is not to make the code look more "enterprise." The goal is to make a
growing CRUD codebase easier to read, test, review, and safely change.

## What Files To Read

Start with the ticket module:

- `packages/server/src/modules/tickets/ticket.routes.ts`
- `packages/server/src/modules/tickets/ticket.controller.ts`
- `packages/server/src/modules/tickets/ticket.schema.ts`
- `packages/server/src/modules/tickets/ticket.service.ts`
- `packages/server/src/modules/tickets/ticket.repository.ts`
- `packages/server/src/modules/tickets/ticket.mapper.ts`
- `packages/server/src/modules/tickets/ticket.permissions.ts`
- `packages/server/src/modules/tickets/ticket.types.ts`

Then compare the compatibility exports:

- `packages/server/src/routes/tickets.ts`
- `packages/server/src/controllers/ticketController.ts`
- `packages/server/src/services/ticketService.ts`

Those compatibility files keep existing imports working while the repo moves
toward a module-based backend.

## What Problem This Pattern Solves

Early CRUD apps often start with broad folders:

```text
routes/
controllers/
services/
```

That is fine at small scale, but it becomes harder to answer simple questions:

- "Where is the ticket business rule?"
- "Where is ticket validation?"
- "Where is the Prisma query?"
- "What files do I need to review for this ticket PR?"

The module pattern groups feature-related backend code together:

```text
modules/tickets/
  ticket.routes.ts
  ticket.controller.ts
  ticket.schema.ts
  ticket.service.ts
  ticket.repository.ts
  ticket.mapper.ts
  ticket.permissions.ts
  ticket.types.ts
```

That makes the ticket feature easier to trace end-to-end.

## How The Pattern Works In This Repo

The request path is intentionally layered:

```text
Express route
  -> validation middleware
  -> controller
  -> service
  -> repository
  -> Prisma
  -> mapper
  -> response
```

Each layer has a narrow job.

`ticket.routes.ts` registers URLs and middleware. It should not contain business
rules or Prisma calls.

`ticket.schema.ts` defines Zod schemas for untrusted HTTP input. It answers:
"Is this request shaped correctly?"

`ticket.controller.ts` translates HTTP into application calls. It reads validated
data from `res.locals`, calls the service, chooses status codes, and forwards
errors.

`ticket.service.ts` owns business rules. It answers questions like:

- Does the creator exist?
- Can this assignee receive tickets?
- Is this status transition allowed?
- Should an activity log entry be written?

`ticket.repository.ts` owns database access. It knows Prisma. The service should
not need to remember the exact Prisma `where` shape for ticket filtering.

`ticket.mapper.ts` translates database records into API response shapes. In this
repo it turns serialized database tags into string arrays and serializes dates.

`ticket.permissions.ts` holds small permission-style decisions. These are simple
today, but this file becomes important when real authentication and RBAC arrive.

## What Changed

Phase 3 moved ticket behavior into `packages/server/src/modules/tickets/` while
leaving compatibility exports in the old route/controller/service paths. That
keeps the app stable and avoids a giant rewrite.

The service now depends on a repository interface instead of directly owning
Prisma query details. Tests can still create a service with a mocked Prisma
client through the compatibility wrapper.

## Why It Changed

This teaches one of the biggest mid-level backend skills: knowing where code
belongs.

A junior engineer may make code work by placing all logic in a controller. A
mid-level engineer should notice when the controller is doing too much and move
validation, business rules, persistence, and mapping into clearer seams.

## Common Mistakes

- Putting Prisma calls in controllers because "it is faster."
- Putting HTTP status codes inside services, which couples business logic to
  Express.
- Treating repositories as a place for business rules instead of database access.
- Creating a module pattern for every tiny concept before the code needs it.
- Moving files without adding tests, which makes refactors hard to trust.
- Creating circular imports between modules.

## Debugging Tips

If a ticket request fails with `400`, start in `ticket.schema.ts` and the route
validation middleware.

If it fails with `404` or `422`, read `ticket.service.ts`. That usually means the
request shape was valid, but the requested operation violated a business rule.

If filtering or pagination behaves incorrectly, read `ticket.repository.ts`.
That is where the Prisma `where`, `skip`, and `take` logic lives.

If the API response shape looks wrong, read `ticket.mapper.ts`.

## Review Checklist

- Do routes only register endpoints and middleware?
- Does the controller avoid manual parsing that belongs in Zod schemas?
- Does the service contain business rules without raw Express concerns?
- Does the repository contain Prisma details without workflow decisions?
- Are response-shape transformations centralized in the mapper?
- Are permission questions named as permission helpers?
- Can a reviewer trace the feature without opening unrelated domains?

## Follow-Up Exercises

1. Move comments into `modules/comments/` using the same pattern.
2. Add an auth-aware `canUpdateTicket(currentUser, ticket)` permission helper.
3. Write a repository unit test for ticket filtering.
4. Draw the request flow for `PATCH /api/tickets/:id/assign`.
5. Identify one place where the repository pattern may be more ceremony than
   value for this small app.
