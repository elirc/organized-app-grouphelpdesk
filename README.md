<!-- Author: Morgan Lee | Issue: #42 -->

# HelpDesk

HelpDesk is a learning-focused full-stack internal support ticket system. It
simulates a four-person senior engineering team building tickets, comments,
assignment, dashboards, knowledge base articles, logging, CI, and Docker support
inside one TypeScript monorepo.

## Features

- Ticket CRUD with status workflow validation
- Assignment to agents and admins
- Public comments and internal notes
- Filterable ticket queue
- Dashboard metrics, activity feed, workload, and system health
- Knowledge base article CRUD with markdown preview/rendering
- Structured Pino logging with request IDs
- Docker Compose and GitHub Actions CI
- Learning-friendly authentication and RBAC
- Runtime request validation with Zod
- TanStack Query server-state caching
- Organization, team, status-history, and assignment-history models

## Team Roster

| Persona     | GitHub Username   | Ownership Area                                             |
| ----------- | ----------------- | ---------------------------------------------------------- |
| Alex Chen   | `alex-chen-dev`   | Backend API, database schema, Prisma, business logic       |
| Sam Rivera  | `sam-rivera-dev`  | Frontend React components, pages, UI/UX, client-side state |
| Jordan Park | `jordan-park-dev` | Infrastructure, Docker, CI/CD, monitoring, logging         |
| Morgan Lee  | `morgan-lee-dev`  | Shared types, auth utilities, testing, docs                |

## Tech Stack

| Layer      | Technology                               |
| ---------- | ---------------------------------------- |
| Frontend   | React 18, TypeScript, Tailwind CSS, Vite |
| Backend    | Node.js, Express, TypeScript             |
| Database   | SQLite via Prisma ORM                    |
| Testing    | Vitest, Supertest                        |
| CI/CD      | GitHub Actions                           |
| Containers | Docker and Docker Compose                |
| Logging    | Pino structured JSON                     |
| Monorepo   | npm workspaces                           |

## Setup

Install dependencies:

```bash
npm install
```

Create `packages/server/.env`:

```bash
DATABASE_URL="file:./dev.db"
PORT=3001
LOG_LEVEL=info
```

Prepare the database:

```bash
npm run db:generate --workspace @helpdesk/server
npm run db:push --workspace @helpdesk/server
npm run db:seed --workspace @helpdesk/server
```

Run development servers:

```bash
npm run dev --workspace @helpdesk/server
npm run dev --workspace @helpdesk/client
```

Seeded login accounts:

| Role     | Email                         | Password      |
| -------- | ----------------------------- | ------------- |
| Customer | `riley.requester@example.com` | `customer123` |
| Agent    | `avery.agent@example.com`     | `agent123`    |
| Admin    | `casey.admin@example.com`     | `admin123`    |

Or run with Docker:

```bash
docker compose -f docker/docker-compose.yml up --build
```

## Validation

```bash
npm run lint
npm run typecheck
npm test
```

## Project Structure

```text
.github/          Issue templates, PR template, CI workflows
docs/             Architecture docs, ADRs, guides, learning journal
packages/client   React application
packages/server   Express API and Prisma schema
packages/shared   Shared TypeScript contracts
docker/           Dockerfiles and Compose setup
tests/            Unit and integration tests
```

Read [CONTRIBUTING.md](./CONTRIBUTING.md) for workflow conventions and
[docs/guides/getting-started.md](./docs/guides/getting-started.md) for detailed
setup notes. The learning-focused improvement docs start at
[docs/learning/improvement-plan.md](./docs/learning/improvement-plan.md).
