<!-- Author: Morgan Lee | Issue: Learning Phase 3 -->

# Ticket Domain Walkthrough

## Purpose

This walkthrough shows how to read the ticket feature after the module refactor.
Use it when you want to trace a request end-to-end instead of bouncing randomly
between files.

## What Files To Read

For the create-ticket flow, read these in order:

1. `packages/server/src/modules/tickets/ticket.routes.ts`
2. `packages/server/src/modules/tickets/ticket.schema.ts`
3. `packages/server/src/modules/tickets/ticket.controller.ts`
4. `packages/server/src/modules/tickets/ticket.service.ts`
5. `packages/server/src/modules/tickets/ticket.repository.ts`
6. `packages/server/src/modules/tickets/ticket.mapper.ts`
7. `packages/server/src/services/activityLogService.ts`

## What Problem This Pattern Solves

Ticket CRUD is no longer just simple CRUD. It now includes validation, status
rules, assignment rules, filtering, pagination, and activity logging.

If all of that lives in one controller, the code becomes hard to test and harder
to review. The module gives each kind of work a home.

## How The Pattern Works In This Repo

Here is the create-ticket flow:

```text
POST /api/tickets
  -> ticket.routes.ts validates the body with createTicketBodySchema
  -> ticket.controller.ts reads the validated body
  -> ticket.service.ts checks creator and assignee business rules
  -> ticket.repository.ts creates the Prisma record
  -> activityLogService.ts records CREATED
  -> ticket.mapper.ts converts the database record to an API response
  -> controller returns 201
```

The important teaching detail is that each layer trusts the layer before it only
for the correct thing. The controller can trust the route middleware for request
shape. The service does not trust the controller for business rules. The mapper
does not trust the database shape to be the final API shape.

## What Changed

The older imports still work, but they now point into the ticket module. For
example, `packages/server/src/routes/tickets.ts` exports the module router
instead of defining the routes itself.

That lets future PRs migrate one domain at a time without breaking the app.

## Why It Changed

This is a realistic refactor pattern. Teams rarely get to stop feature work and
rewrite a backend from scratch. More often, they choose one important domain,
make it a reference implementation, and then migrate other domains when touching
them for real product work.

## Key Code Reading Notes

`ticket.schema.ts` is for runtime request shape. It should reject bad enum
values, missing titles, invalid page numbers, and empty update bodies.

`ticket.service.ts` is for business meaning. It should reject missing creators,
invalid assignees, invalid status transitions, and `IN_PROGRESS` tickets without
assignees.

`ticket.repository.ts` is for persistence mechanics. It builds the dynamic Prisma
filter for list requests and owns pagination query details.

`ticket.mapper.ts` is a boundary between database representation and API
representation. Tags are still stored as serialized data in this phase, so the
mapper makes sure the API returns a normal array.

## Common Mistakes

- Confusing validation with authorization. Zod can prove a role string is valid,
  but it cannot prove the current user is allowed to act.
- Confusing validation with business rules. Zod can prove `status` is a real
  ticket status, but the service decides whether `OPEN -> RESOLVED` is allowed.
- Returning raw Prisma records directly from controllers.
- Adding a new ticket endpoint in the old `routes/` folder instead of the module.
- Mocking too much in tests and missing whether the layers still connect.

## Debugging Tips

For `POST /api/tickets`:

- A `400` usually means `createTicketBodySchema` rejected the body.
- A `422` usually means the body shape was valid but the service rejected the
  operation.
- A `500` means an unexpected error escaped. Check request logs by request ID.

For `GET /api/tickets`:

- If filters are ignored, check `listTicketsQuerySchema` and
  `buildTicketWhere()`.
- If pagination is wrong, check the repository's `skip`, `take`, and `count`
  calls.
- If tags look wrong, check `mapTicketToResponse()`.

## Review Checklist

- Does the PR modify only the ticket module for ticket behavior?
- Are new request fields added to Zod schemas?
- Are new business rules tested at the service or integration layer?
- Are Prisma query changes isolated to the repository?
- Does the API response stay compatible with frontend expectations?
- Are compatibility exports still working for existing tests?

## Follow-Up Exercises

1. Add a `canDeleteTicket` permission helper that only admins can pass once auth
   exists.
2. Write an integration test for `GET /api/tickets?search=password`.
3. Move comment routes into a `modules/comments/` folder.
4. Refactor tag storage from serialized data to a normalized tag table.
5. Explain how Phase 4 reduced the `actorId` security smell by deriving the
   actor from `req.currentUser`.
