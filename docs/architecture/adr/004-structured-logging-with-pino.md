<!-- Author: Jordan Park | Issue: #29 -->

# ADR-004: Structured Logging with Pino

## Status

Accepted

## Context

The API needs logs that help diagnose failures across requests, controllers,
services, and middleware. Plain strings are easy to write but hard to search,
filter, and correlate once an application grows.

## Decision

The server uses Pino for structured JSON logging. Request middleware assigns a
request ID, attaches it to a child logger, records incoming request metadata, and
logs completion with status code and duration.

## Alternatives Considered

Winston was rejected because Pino is faster and simpler for this Node.js API.
`console.log` was rejected because unstructured logs do not provide reliable
fields for filtering in production tools.

## Consequences

Logs are machine-readable and can be correlated by `requestId`. Raw terminal
output is less friendly than hand-written strings, but developers can pipe logs
through `pino-pretty` during local debugging.
