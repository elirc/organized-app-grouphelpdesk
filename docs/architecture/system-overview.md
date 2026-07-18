<!-- Author: Morgan Lee | Issue: #42 -->

# System Overview

HelpDesk is a TypeScript monorepo with a React client, Express API, shared types,
SQLite database, and operational tooling.

## Final Architecture

```text
React + Vite Client
  pages, components, TanStack Query hooks, auth provider, api client
        |
        | JSON over HTTP
        v
Express API
  auth -> validation -> routes -> controllers -> services -> repositories -> Prisma
        |
        v
SQLite
  organizations, teams, users, tickets, comments, articles, activity logs,
  ticket status history, ticket assignment history

Operational layer:
  Pino logs, request IDs, response timing, /health, Docker, GitHub Actions
```

## Monorepo Packages

- `@helpdesk/client` owns React UI, routing, hooks, forms, dashboard charts, and
  knowledge base screens.
- `@helpdesk/server` owns Express, Prisma, services, routes, middleware, logging,
  and database seed data.
- `@helpdesk/shared` owns enums and interfaces consumed by both client and
  server.

## Backend Layers

Routes register URLs and HTTP methods. Controllers translate request/response
details. Zod schemas validate untrusted input at the route boundary. Services
own business rules. The ticket domain now uses a module layout with repository,
mapper, permissions, and schema files so Prisma details are isolated from HTTP
controllers. Utilities handle shared concerns like errors, logging, auth, and
status transitions.

```text
auth -> validation -> routes -> controllers -> services -> repositories -> Prisma -> SQLite
```

## Frontend Layers

Pages represent routes. Components render focused UI. TanStack Query hooks manage
server state, cache keys, and invalidation. `services/api.ts` centralizes fetch,
auth headers, query string construction, response typing, and API error
handling.

```text
pages -> hooks/components -> api client -> Express API
```

## Main Data Flows

Signing in starts at `LoginPage`, reaches `POST /api/auth/login`, verifies a
scrypt password hash, and returns an opaque bearer token for the learning app's
in-memory session store.

Creating a ticket starts in `TicketForm`, moves through `api.tickets.create`,
reaches `POST /api/tickets`, passes auth and Zod validation, reaches the ticket
module controller, and is created by the ticket service through the ticket
repository and Prisma. The service also writes an activity log.

Adding a comment goes through the comment API. The service filters internal notes
based on the server-derived current user's role, not a client-provided
`viewerRole`.

Dashboard metrics are computed by `dashboardService` using Prisma counts,
grouping, and tag aggregation.

Knowledge base articles are stored as markdown and rendered in the client with a
small markdown renderer.

## Operational Concerns

Pino emits structured JSON logs. Request middleware assigns request IDs so logs
can be correlated. Response-time middleware records request counts, average
latency, and slow requests for the system dashboard endpoint.

## Out of Scope

Production-grade authentication, database-backed sessions, production
deployment, WebSockets, organization-wide RBAC enforcement, and fully normalized
tags remain future learning opportunities.
