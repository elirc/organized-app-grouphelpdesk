<!-- Author: Morgan Lee | Issue: #42 -->

# API Design

The HelpDesk API is a RESTful JSON API under `/api`.

## Conventions

Responses use JSON. Errors use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Ticket title is required.",
    "details": {}
  }
}
```

Most application endpoints require:

```text
Authorization: Bearer <session-token>
```

Use `POST /api/auth/login` to obtain a token. The current implementation is a
learning-friendly opaque session token, not a production session design.

Paginated endpoints use:

```text
?page=1&limit=20
```

and respond with:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

## Tickets

Ticket endpoints require authentication. Mutating status, assignment, and delete
operations require agent/admin-style permissions depending on the route.

### `POST /api/auth/login`

```json
{
  "email": "avery.agent@example.com",
  "password": "agent123"
}
```

Returns:

```json
{
  "data": {
    "token": "opaque-session-token",
    "user": {
      "id": "user_agent_1",
      "name": "Avery Agent",
      "email": "avery.agent@example.com",
      "role": "AGENT",
      "teamId": "team-it"
    }
  }
}
```

### `GET /api/auth/me`

Returns the current authenticated user.

### `POST /api/auth/logout`

Deletes the current in-memory session and returns `204`.

### `POST /api/tickets`

Creates a ticket.

```json
{
  "title": "Cannot access payroll",
  "description": "The dashboard is blank.",
  "priority": "HIGH",
  "tags": ["payroll", "access"]
}
```

Returns `201` with `{ "data": Ticket }`.

The server derives `createdBy` from the authenticated user. Client-provided
identity fields are ignored for authorization-sensitive behavior.

### `GET /api/tickets`

Lists tickets. Supports `page`, `limit`, `status`, `priority`, `assigneeId`, and
`search`.

```text
GET /api/tickets?status=OPEN&priority=HIGH&search=payroll
```

### `GET /api/tickets/:id`

Returns one ticket.

### `PATCH /api/tickets/:id`

Updates title, description, status, priority, assignee, team, or tags. Status
updates are validated by the state machine.

### `PATCH /api/tickets/:id/assign`

Assigns a ticket to an agent or admin.

```json
{
  "assigneeId": "user_agent_1"
}
```

### `DELETE /api/tickets/:id`

Deletes a ticket and returns `{ "data": { "id": "...", "deleted": true } }`.

## Comments

### `POST /api/tickets/:ticketId/comments`

```json
{
  "body": "I am checking the VPN profile.",
  "isInternal": true
}
```

The server derives `authorId` from the authenticated user. Customers/requesters
cannot create internal notes.

### `GET /api/tickets/:ticketId/comments`

Supports `includeInternal=true` and `viewerRole=AGENT`. Requesters never receive
internal notes. `viewerRole` is retained only as a backward-compatible optional
query shape; visibility is based on the authenticated user's server-side role.

## Users

### `GET /api/users`

Lists users. Supports `role=AGENT`.

## Dashboard

### `GET /api/dashboard/metrics`

Returns open count, in-progress count, average resolution hours, tickets by
priority, and tickets by category.

### `GET /api/dashboard/activity`

Returns the 20 most recent activity log entries with ticket and user data.

### `GET /api/dashboard/agent-workload`

Returns active ticket counts per agent.

### `GET /api/dashboard/system`

Returns uptime, request count, average response time, and recent slow requests.

## Knowledge Base

### `POST /api/articles`

Creates an article.

### `GET /api/articles`

Lists articles. Supports `search`.

### `GET /api/articles/:id`

Returns one article.

### `PATCH /api/articles/:id`

Updates an article.

### `DELETE /api/articles/:id`

Deletes an article.

## Health

### `GET /health`

Returns service health:

```json
{
  "status": "ok",
  "uptime": 12.4,
  "timestamp": "2026-05-20T12:00:00.000Z"
}
```
