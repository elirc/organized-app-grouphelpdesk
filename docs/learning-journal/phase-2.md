<!-- Author: Morgan Lee | Issue: #22 -->

# Phase 2: Richer Features and Business Logic

Phase 2 added comments, internal notes, assignment, filters, and status
transition validation. The business layer became more important because the API
now had rules beyond simple CRUD.

## State Machine Pattern

A state machine defines allowed movement between states:

```text
OPEN
  -> IN_PROGRESS
  -> CLOSED

IN_PROGRESS
  -> WAITING
  -> RESOLVED
  -> OPEN

WAITING
  -> IN_PROGRESS
  -> CLOSED

RESOLVED
  -> CLOSED
  -> OPEN

CLOSED
  -> OPEN
```

`statusMachine.ts` keeps this rule table in one file. That is useful because
workflow rules are easy to review and test when they are centralized.

## Comment Visibility

The API accepts `includeInternal=true`, but the service checks the viewer role.
Agents and admins can see internal notes. Requesters only see public comments.
The UI renders internal notes with a distinct visual treatment so agents know
they are not public replies.

## Filtering

Ticket filters move from UI state to query parameters, then into the controller,
then into a dynamic Prisma `where` clause. This keeps filtering server-side so
pagination and search can eventually scale beyond one loaded page.

## Code Review Observations

A good review of the status machine would check every allowed transition,
invalid transition error messages, same-state behavior, assignee requirements,
and test coverage for reopening closed or resolved tickets.

## What I Would Do Differently

I would define role simulation earlier. Phase 2 needs viewer roles and actor IDs,
and those details are easier when the project has a clear development identity
model from the beginning.
