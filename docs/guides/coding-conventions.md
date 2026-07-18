<!-- Author: Morgan Lee | Issue: #11 -->

# Coding Conventions

These conventions keep the HelpDesk codebase predictable as multiple personas
work in parallel. They are not meant to replace judgment; they provide defaults
so code review can focus on behavior, clarity, and design.

## TypeScript

Use strict mode everywhere. The project should treat TypeScript as a design tool,
not just a compiler step.

Prefer `interface` over `type` for object shapes:

```ts
interface TicketSummary {
  id: string;
  title: string;
  status: TicketStatus;
}
```

Use `type` for unions, aliases, and utility compositions:

```ts
type TicketStatusFilter = TicketStatus | 'ALL';
```

Use enums for fixed value sets that represent domain concepts:

```ts
enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}
```

Use `unknown` instead of `any` when a value is not yet known. Narrow the value
before using it.

```ts
function parseError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
}
```

## Naming

Use `camelCase` for variables and functions:

```ts
const openTicketCount = 12;
function calculateResolutionTime() {}
```

Use `PascalCase` for types, interfaces, classes, and React components:

```ts
interface TicketListProps {}
class ValidationError extends AppError {}
function TicketList() {}
```

Use `UPPER_SNAKE_CASE` for constants and enum members:

```ts
const DEFAULT_PAGE_SIZE = 20;
```

## File Naming

Use `camelCase` for utilities, services, hooks, and non-component modules:

```text
ticketService.ts
ticketRepository.ts
useTickets.ts
apiClient.ts
```

Use `PascalCase` for React components:

```text
TicketList.tsx
TicketDetailPage.tsx
PriorityBadge.tsx
```

## Import Ordering

Order imports from broadest to most local:

1. External dependencies
2. `@helpdesk/shared`
3. Relative imports

Separate each group with a blank line.

```ts
import express from 'express';
import { z } from 'zod';

import { TicketStatus } from '@helpdesk/shared';

import { createTicketController } from './ticketController';
```

Use type-only imports when importing types:

```ts
import type { Ticket } from '@helpdesk/shared';
```

## Error Handling

Application errors should use a custom `AppError` hierarchy once the backend
error layer exists. This makes errors predictable for controllers, logs, tests,
and API responses.

Controllers should use `try/catch` and pass errors to centralized error
middleware:

```ts
try {
  const ticket = await ticketService.createTicket(input);
  res.status(201).json({ data: ticket });
} catch (error) {
  next(error);
}
```

Do not swallow errors silently. If a failure is expected, handle it deliberately.
If it is unexpected, let the error middleware log it and return the standard API
error shape.

Avoid raw `throw new Error()` in application code after the custom error classes
exist. Prefer a domain-specific error such as `ValidationError`,
`NotFoundError`, or `ConflictError`.

## React Patterns

Use functional components with hooks. Do not add class components.

Props interfaces should be named after the component:

```ts
interface TicketListProps {
  tickets: Ticket[];
}

function TicketList({ tickets }: TicketListProps) {
  return null;
}
```

Use custom hooks for data fetching and reusable state. A page should be able to
compose hooks and components without owning low-level API details.

Prefer named exports for components and hooks. Page components may use default
exports if the routing setup benefits from them.

## Testing

Name test files with the `*.test.ts` or `*.test.tsx` suffix.

Use `describe` blocks to group related behavior:

```ts
describe('ticket status transitions', () => {
  it('allows OPEN to move to IN_PROGRESS', () => {
    // Test body
  });
});
```

Follow arrange, act, assert:

```ts
// Arrange
const ticket = createTicket({ status: TicketStatus.OPEN });

// Act
const result = transitionTicket(ticket, TicketStatus.IN_PROGRESS);

// Assert
expect(result.status).toBe(TicketStatus.IN_PROGRESS);
```

Tests should focus on behavior. Avoid testing implementation details that would
make harmless refactors difficult.

## Comments and Documentation

Public functions should have JSDoc comments that explain purpose, important
parameters, and return values.

Inline comments should explain why something is necessary, not narrate what the
code already says.

Good:

```ts
// Keep closed tickets visible in audit views even when they are filtered out of queues.
```

Weak:

```ts
// Set status to CLOSED.
```

Use a module-level comment block when a file has an important role in the system
that may not be obvious from the filename alone.
