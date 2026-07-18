<!-- Author: Morgan Lee | Issue: Enterprise Sprint 1 -->

# Sprint 1: Tenant Boundaries and SLA Foundation

## Sprint Goal

Move HelpDesk from a single-demo queue into a multi-organization support system
with real ownership boundaries, durable sessions, and SLA policy behavior. The
learning goal is to help a junior engineer practice turning security and data
model concerns into concrete service rules.

## User Stories

### Story 1: Persist Auth Sessions

As an operator, I want sessions to survive process restarts so that auth does
not depend on one Node.js process staying alive.

Acceptance criteria:

- Login stores an opaque session token with an expiration time.
- `GET /api/auth/me` can resolve the current user from the persisted session.
- Logout invalidates both cached and persisted session state.
- Current-user context includes `organizationId` for authorization decisions.

Mid-senior learning focus:

- Understand why in-memory sessions fail in horizontally scaled services.
- Keep auth middleware responsible for identity, not business permissions.
- Preserve a small cache without making it the source of truth.

### Story 2: Scope Tickets by Tenant and Role

As an admin, I want users to only see tickets from their organization and role
scope so that data from one customer or team does not leak into another queue.

Acceptance criteria:

- Ticket list requests are scoped by authenticated user context.
- Customers/requesters see their own tickets.
- Agents see tickets for their team and organization.
- Admins see organization-level tickets.
- Ticket detail, update, assignment, and delete paths reject cross-organization
  access as not found.

Mid-senior learning focus:

- Apply authorization at the service layer, not only in route middleware.
- Avoid leaking resource existence through `403` responses on tenant data.
- Treat list scoping and detail scoping as separate risks.

### Story 3: Create SLA Policies

As an admin, I want to define response, resolution, and escalation targets by
priority so that the queue reflects operational commitments.

Acceptance criteria:

- Admins can create SLA policies for an organization and optional team.
- Agents/admins can list SLA policies.
- New tickets pick the best active policy for priority/team/org.
- Tickets store first-response and resolution due timestamps.

Mid-senior learning focus:

- Model policy data separately from ticket snapshot data.
- Understand why tickets store due dates instead of recomputing from mutable
  policy rows forever.
- Keep time calculations deterministic and testable.

### Story 4: Review Escalations

As an admin, I want to run an escalation review so overdue tickets are marked,
logged, and surfaced to admins.

Acceptance criteria:

- The review finds unresolved tickets past `resolutionDueAt`.
- Each breached ticket gets a `TicketEscalation` row.
- The ticket stores `escalatedAt` and `slaBreachedAt`.
- Admin users receive notifications.
- A domain event is written to the outbox.

Mid-senior learning focus:

- Learn how batch workflows differ from request/response CRUD.
- Keep escalation idempotency in mind by marking tickets after review.
- See why business events often need both audit rows and delivery rows.

## Implementation Notes

Implemented files:

- `packages/server/prisma/schema.prisma`
- `packages/server/src/services/authService.ts`
- `packages/server/src/modules/tickets/ticket.service.ts`
- `packages/server/src/modules/tickets/ticket.repository.ts`
- `packages/server/src/services/slaService.ts`
- `packages/server/src/routes/sla.ts`
- `packages/server/src/controllers/slaController.ts`
- `packages/server/src/validation/slaSchemas.ts`
- `packages/shared/src/types/sla.ts`
- `packages/client/src/pages/AdminPage.tsx`

Key implementation details:

- `Session` is now a first-class Prisma model, while the service keeps a small
  in-memory cache as an optimization.
- `CurrentUser` includes `organizationId`, allowing service methods to scope
  tickets without trusting client-provided filters.
- SLA policies are mutable configuration. Tickets store selected due dates as a
  snapshot so later policy changes do not rewrite historical commitments.
- Escalation review writes ticket state, escalation history, notification rows,
  activity logs, and outbox events. That gives learners a realistic example of
  one business action touching several consistency boundaries.

Review questions:

1. Why should tenant scoping live in services instead of only route middleware?
2. Why does the API return not found for cross-tenant ticket access?
3. What would need to change before escalation review could run on a schedule?
4. How would you make escalation review idempotent if two workers ran it at the
   same time?
