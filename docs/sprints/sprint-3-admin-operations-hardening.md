<!-- Author: Morgan Lee | Issue: Enterprise Sprint 3 -->

# Sprint 3: Admin Console and Operational Hardening

## Sprint Goal

Expose the new enterprise controls in the UI and add baseline operational
hardening around configuration, HTTP behavior, health checks, and dashboards.
The learning goal is to help a junior engineer see that production readiness is
not one feature; it is a set of boring, dependable boundaries.

## User Stories

### Story 1: Build an Admin Console

As an admin, I want a single place to inspect users, manage SLA policies, and
run escalation review so I can operate the system without calling raw APIs.

Acceptance criteria:

- The sidebar includes an Admin route.
- Admin page lists users.
- Admin page lists SLA policies.
- Admin page can create an SLA policy.
- Admin page can run escalation review and show the result.

Mid-senior learning focus:

- Build thin operational UI over existing APIs instead of duplicating logic.
- Keep admin workflows dense and task-oriented.
- Think about what an operator needs to inspect after an action.

### Story 2: Add Dashboard SLA Signals

As a support lead, I want dashboard metrics for breached and escalated tickets
so I can quickly see whether the queue is healthy.

Acceptance criteria:

- Dashboard metrics include breached SLA count.
- Dashboard metrics include escalated ticket count.
- Metric cards render the new values.
- Ticket details show response due, resolution due, and escalation state.

Mid-senior learning focus:

- Understand how operational metrics differ from raw CRUD data.
- Add dashboard fields without forcing the UI to understand persistence details.
- Keep summary data server-owned.

### Story 3: Validate Runtime Configuration

As a platform owner, I want environment variables validated at startup so
misconfigured deployments fail loudly and predictably.

Acceptance criteria:

- Runtime config is parsed through a schema.
- Port, log level, CORS origin, session TTL, and rate limit settings are
  centralized.
- Logger and app composition read from the validated config.

Mid-senior learning focus:

- Treat environment variables as untrusted input.
- Avoid scattering `process.env` reads across the codebase.
- Learn the difference between defaulting for development and hiding production
  mistakes.

### Story 4: Add Baseline HTTP Hardening

As a security reviewer, I want basic headers, JSON size limits, CORS controls,
and request throttling so the API has reasonable default protections.

Acceptance criteria:

- Express JSON body size is limited.
- CORS origin is configurable.
- Baseline security headers are set.
- A lightweight in-memory rate limiter rejects noisy clients.
- Rate limiting is disabled in tests to keep the suite deterministic.

Mid-senior learning focus:

- Understand which protections belong at app level and which belong at edge
  infrastructure.
- Keep middleware small, predictable, and test-friendly.
- Recognize why in-memory rate limiting is a local development baseline, not a
  final distributed design.

### Story 5: Add Readiness Health Check

As an operator, I want a readiness endpoint that checks database access so
containers and orchestration can distinguish "process is up" from "service is
ready."

Acceptance criteria:

- `/health` remains a lightweight liveness endpoint.
- `/health/ready` checks database connectivity.
- Readiness returns `503` when the database is unavailable.

Mid-senior learning focus:

- Distinguish liveness from readiness.
- Keep health endpoints cheap and explicit.
- Understand how deployment platforms use these checks differently.

## Implementation Notes

Implemented files:

- `packages/client/src/pages/AdminPage.tsx`
- `packages/client/src/components/layout/Sidebar.tsx`
- `packages/client/src/components/dashboard/MetricsCards.tsx`
- `packages/client/src/components/tickets/TicketDetail.tsx`
- `packages/server/src/config/env.ts`
- `packages/server/src/middleware/securityHeaders.ts`
- `packages/server/src/middleware/rateLimit.ts`
- `packages/server/src/index.ts`
- `packages/server/src/routes/health.ts`
- `packages/server/src/services/dashboardService.ts`
- `packages/shared/src/types/dashboard.ts`

Key implementation details:

- The Admin page reuses the SLA and user APIs. It does not own any business
  rules; it simply orchestrates existing endpoints.
- Dashboard metrics were extended server-side so the client receives concise
  operational facts.
- Config validation uses Zod, matching the app's request validation pattern and
  reinforcing that runtime input must be parsed.
- Security headers are implemented as local middleware to avoid adding another
  dependency, while still teaching the header categories.
- The rate limiter is intentionally simple. A production deployment would move
  this to Redis, an API gateway, or edge infrastructure.

Review questions:

1. Why is `/health` not enough for readiness?
2. Which config defaults are acceptable for development but dangerous in
   production?
3. What breaks if rate limiting is stored only in process memory?
4. How would you protect the Admin page from non-admin users in the client and
   server?
