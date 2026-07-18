<!-- Author: Morgan Lee | Issue: #11 -->

# ADR-002: Ticket Status Workflow

## Status

Accepted

## Context

HelpDesk tickets need enough lifecycle detail to feel realistic without turning
the learning project into a workflow engine. The team considered a simpler
three-status model: `OPEN`, `IN_PROGRESS`, and `CLOSED`. That would have been
easy to implement, but it would hide common helpdesk states such as waiting on a
requester and resolved-but-not-closed work.

## Decision

Tickets use five statuses:

- `OPEN`
- `IN_PROGRESS`
- `WAITING`
- `RESOLVED`
- `CLOSED`

Allowed transitions are enforced by `statusMachine.ts`:

```text
OPEN -> IN_PROGRESS, CLOSED
IN_PROGRESS -> WAITING, RESOLVED, OPEN
WAITING -> IN_PROGRESS, CLOSED
RESOLVED -> CLOSED, OPEN
CLOSED -> OPEN
```

Moving a ticket to `IN_PROGRESS` requires an assignee. This keeps ownership clear
before active work begins.

## Alternatives Considered

A three-status model was rejected because it was too simple for the learning
goals. It would not teach state transition validation or support realistic queue
behavior.

A fully configurable workflow system was rejected because it would introduce too
much complexity. The app does not need custom workflows, workflow designers, or
per-team status rules.

## Consequences

The five-status model creates more validation logic and more tests, but it better
matches real support workflows. The state machine gives the team one obvious
place to review workflow changes, and it prevents invalid transitions from being
spread across controllers or UI code.
