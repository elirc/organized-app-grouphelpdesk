<!-- Author: Alex Chen | Issue: #42 -->

# ADR-005: Dashboard Aggregation Strategy

## Status

Accepted

## Context

The dashboard needs metrics from transactional ticket data: open counts, active
workload, priority distribution, category distribution, resolution time, and
recent activity. The project uses SQLite and is intended for learning, not
large-scale production analytics.

## Decision

Dashboard metrics are computed on request with Prisma queries and small in-memory
aggregation steps. Counts that Prisma can aggregate directly use database
queries. Tag/category counts are calculated in application code because tags are
stored as JSON arrays.

## Alternatives Considered

Materialized views were rejected because SQLite does not support them in the way
larger analytical databases do.

Cron-based pre-computation was rejected because the dataset is small and the
extra job infrastructure would obscure the learning goal.

## Consequences

The dashboard stays simple and always reflects current transactional data. At
scale, request-time aggregation would become too slow. A future production path
would introduce pre-aggregated tables, background jobs, or a dedicated analytics
store.
