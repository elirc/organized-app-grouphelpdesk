<!-- Author: Morgan Lee | Issue: #11 -->

# Phase 1: Core CRUD and First Collaboration

Phase 1 turned the Phase 0 plan into the first vertical slice. Morgan defined
shared types, Alex implemented the ticket API and Prisma schema, Sam built the
first React ticket screens, and Morgan added service tests.

## Layered Backend Architecture

```text
React form
  -> API client
    -> Express route
      -> controller
        -> service
          -> Prisma
            -> SQLite
```

The controller stays thin so HTTP details do not leak into business logic. The
service owns validation, Prisma queries, and activity logging. This separation
felt a little formal at first, but it made the code easier to test.

## Ticket Creation Walkthrough

`TicketForm.tsx` collects controlled form state. `api.ts` sends a typed
`POST /api/tickets` request. `tickets.ts` routes the request to
`ticketController.ts`, which maps the body into service input.
`ticketService.ts` validates title, description, creator, optional assignee, and
then calls Prisma. The response travels back through the same stack.

## Annotated Patterns

Service layer:

```ts
const ticket = await prisma.ticket.create({ data: { title, description } });
```

The service owns persistence so controllers do not know how Prisma queries are
shaped.

React hook:

```ts
const { tickets, loading, error } = useTickets(filters);
```

The hook hides loading and error state so the page can focus on composition.

API client:

```ts
return request<{ data: Ticket }>('/api/tickets', { method: 'POST' });
```

Typed helpers make fetch calls consistent and keep error parsing in one place.

## Shared Types

The shared package prevents frontend/backend drift. If `TicketStatus` changes,
both packages compile against the same enum instead of silently disagreeing.

## Merge Conflict Scenario

If Alex adds `teamId` to `Ticket` while Sam adds `requesterName`, Git will mark a
conflict in `packages/shared/src/types/ticket.ts`.

1. Run `git fetch origin`.
2. Run `git merge origin/main`.
3. Open the conflicted file.
4. Keep both valid fields in the final interface.
5. Remove conflict markers.
6. Run `npm run typecheck`.
7. Commit the merge resolution.

## Reflection

The hardest part was seeing how much setup exists before a screen appears. Next
time, I would define demo user IDs earlier so seeded data and frontend forms line
up from the start.
