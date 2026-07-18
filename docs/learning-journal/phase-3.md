<!-- Author: Morgan Lee | Issue: #30 -->

# Phase 3: Infrastructure and DevOps

Phase 3 added Docker, CI, structured logging, health checks, request IDs, and
response-time monitoring. These pieces do not look like product features, but
they make the project easier to run, review, and debug.

## Multi-Stage Docker Builds

The client Dockerfile builds the Vite app in a Node image, then copies the static
output into nginx. The final image does not need source files or dev
dependencies.

```dockerfile
FROM node:20-alpine AS build
RUN npm install
RUN npm run build --workspace @helpdesk/client

FROM nginx:alpine AS runtime
COPY --from=build /app/packages/client/dist /usr/share/nginx/html
```

The same idea applies to the server: compile first, run only the compiled output.

## CI Pipeline

The CI workflow checks out the repo, installs Node, installs dependencies,
generates Prisma client code, lints, type-checks, and runs tests. This catches
basic problems before a PR merges.

## Structured Logging

JSON logs make each field searchable. Request IDs connect an incoming request,
controller behavior, service errors, and final response timing. In production,
that would let a developer trace a slow or failing request across logs.

Hypothetical debugging flow: a user reports a failed ticket update. The support
engineer finds the `requestId` in the response header, searches logs for that ID,
and sees the validation error plus the invalid status transition.

## Before and After

Before Docker and CI, running the project depended on remembering local setup
steps. After Phase 3, there is a repeatable container path and a GitHub Actions
path that teaches what a real team expects from every change.

## Reflection

Infrastructure work is easy to undervalue because users rarely see it directly.
But it improves team velocity by making local setup, review, debugging, and
failure diagnosis more reliable.
