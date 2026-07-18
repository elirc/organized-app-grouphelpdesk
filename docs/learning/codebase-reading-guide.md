<!-- Author: Morgan Lee | Issue: Learning Phase 1 -->

# Codebase Reading Guide

## Purpose

This guide helps you read HelpDesk like a working engineer, not like someone
randomly opening files. The goal is to learn how a full-stack CRUD feature moves
through React, HTTP, Express, services, Prisma, and the database.

## What Files To Read

Start with these files in order:

1. [README.md](../../README.md)
2. [packages/shared/src/types/ticket.ts](../../packages/shared/src/types/ticket.ts)
3. [packages/client/src/App.tsx](../../packages/client/src/App.tsx)
4. [packages/client/src/pages/TicketsPage.tsx](../../packages/client/src/pages/TicketsPage.tsx)
5. [packages/client/src/hooks/useTickets.ts](../../packages/client/src/hooks/useTickets.ts)
6. [packages/client/src/services/api.ts](../../packages/client/src/services/api.ts)
7. [packages/server/src/index.ts](../../packages/server/src/index.ts)
8. [packages/server/src/routes/tickets.ts](../../packages/server/src/routes/tickets.ts)
9. [packages/server/src/controllers/ticketController.ts](../../packages/server/src/controllers/ticketController.ts)
10. [packages/server/src/services/ticketService.ts](../../packages/server/src/services/ticketService.ts)
11. [packages/server/prisma/schema.prisma](../../packages/server/prisma/schema.prisma)
12. [tests/unit/ticketService.test.ts](../../tests/unit/ticketService.test.ts)

## What Problem This Reading Order Solves

Many learners read code from the bottom up: database first, then services, then
routes, then UI. That can work, but it often hides the user workflow.

For CRUD apps, a better first pass is user-action first:

```text
User clicks something
  -> React page/component
  -> hook
  -> API client
  -> Express route
  -> controller
  -> service
  -> Prisma
  -> database
```

This mirrors how you debug real production issues: start with the behavior, then
trace where it goes.

## How The Pattern Works In This Repo

### Frontend Entry

[packages/client/src/App.tsx](../../packages/client/src/App.tsx) defines the
routes. It tells you which page owns which URL.

For ticket listing, the route goes to:

[packages/client/src/pages/TicketsPage.tsx](../../packages/client/src/pages/TicketsPage.tsx)

That page composes:

- filter state
- agent lookup
- `useTickets`
- `TicketFilters`
- `TicketList`

### API Client

[packages/client/src/services/api.ts](../../packages/client/src/services/api.ts)
centralizes `fetch`. This is important because components should not each invent
their own error parsing, URL building, and JSON handling.

### Backend Entry

[packages/server/src/index.ts](../../packages/server/src/index.ts) creates the
Express app and mounts routers. If you cannot find an API endpoint, start here.

### Route And Controller

[packages/server/src/routes/tickets.ts](../../packages/server/src/routes/tickets.ts)
connects HTTP methods to controller functions.

[packages/server/src/controllers/ticketController.ts](../../packages/server/src/controllers/ticketController.ts)
turns Express requests into service calls.

Current learning note: ticket routes now validate request input with Zod before
controllers run. The controller reads validated data from `res.locals` and keeps
HTTP mapping separate from business rules.

### Service And Database

[packages/server/src/modules/tickets/ticket.service.ts](../../packages/server/src/modules/tickets/ticket.service.ts)
owns ticket rules.

Current learning note: tickets are now the reference module. Read
`ticket.repository.ts` for Prisma queries, `ticket.mapper.ts` for response
mapping, and `ticket.permissions.ts` for permission-style decisions.

## What Changed In This Phase

This phase added a reading path. No runtime code changed.

The new docs explain:

- where to start reading
- how to trace a feature
- what the current architecture teaches well
- what will be improved next

## Why It Changed

Before adding validation, auth, RBAC, repositories, and TanStack Query, the
project needs an orientation layer. A learner should understand the current code
before seeing it refactored.

## Suggested Feature Traces

### Trace 1: List Tickets

Read in this order:

1. `TicketsPage.tsx`
2. `useTickets.ts`
3. `api.ts`
4. `server/src/index.ts`
5. `routes/tickets.ts`
6. `controllers/ticketController.ts`
7. `services/ticketService.ts`
8. `schema.prisma`

Questions to ask:

- Where do filters enter the UI?
- Where are query params built?
- Where are query params parsed?
- Where does pagination happen?
- Where does Prisma build the `where` clause?

### Trace 2: Create Ticket

Read in this order:

1. `CreateTicketPage.tsx`
2. `TicketForm.tsx`
3. `api.ts`
4. `ticket.routes.ts`
5. `ticket.controller.ts`
6. `ticket.service.ts`
7. `ticket.repository.ts`
8. `activityLogService.ts`
9. `schema.prisma`

Questions to ask:

- Which fields come from the form?
- Which fields come from the authenticated current user?
- What validation happens in the client?
- What validation happens in the server through Zod?
- Where is the activity log written?

### Trace 3: Add Internal Comment

Read in this order:

1. `TicketDetailPage.tsx`
2. `CommentForm.tsx`
3. `useComments.ts`
4. `api.ts`
5. `routes/comments.ts`
6. `commentController.ts`
7. `commentService.ts`

Questions to ask:

- Who decides whether a comment is internal?
- How does the API decide whether internal comments are visible?
- What user identity does the server derive from auth?
- Why would trusting a client-provided role be a security concern?

## Common Mistakes

- Reading only the service and ignoring how the UI sends data.
- Assuming shared TypeScript types validate HTTP requests.
- Treating Prisma records as if they must be the same shape as API responses.
- Skipping tests until after a refactor breaks behavior.
- Looking for auth checks in the client and forgetting backend enforcement.

## Debugging Tips

- If the UI shows stale data, start at the hook and API client.
- If an API request fails, inspect the controller and service.
- If data shape looks wrong, inspect the mapper or serialization logic.
- If a database query surprises you, inspect `schema.prisma` and seed data.
- If logs are confusing, find the request ID from the response headers.

## Review Checklist

- Can the reader explain the feature in one sentence before opening code?
- Can the reader name the first frontend file and first backend file involved?
- Can the reader identify where user input crosses the trust boundary?
- Can the reader identify where the database is queried?
- Can the reader find at least one test for the behavior?

## Follow-Up Exercises

1. Draw the ticket creation flow on paper.
2. Add a temporary `console.log` in the API client and predict when it fires.
3. Add a temporary log in `ticketService.createTicket` and compare it to the
   client log.
4. Find every place `createdBy`, `actorId`, or `viewerRole` appears and decide
   whether it is still trusted or only backward-compatible shape.
5. Compare the ticket module to the older comment service and identify what
   would move in a future comments module refactor.
