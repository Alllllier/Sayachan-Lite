# Backend Architecture Audit

Date: 2026-04-23
Project: `personal_os_lite`
Scope: `backend/` runtime, route organization, model/data layer, AI route path, and current backend tests

## Executive Summary

The backend is functional, small, and internally consistent, but it is still in an early-stage structure rather than a fully layered backend architecture.

What is already working well:

- The API surface is small and understandable.
- Core lifecycle semantics for `tasks`, `projects`, and `notes` are covered by behavior-lock tests.
- Domain normalization rules exist and are partially centralized.
- The AI chat path already shows an early service-style separation through `route -> bridge -> private runtime chat service`.

The main architectural gap is not just the missing `service layer`. The backend also lacks several standard supporting layers and cross-cutting concerns:

- request validation
- centralized error handling
- configuration management
- application/bootstrap separation
- route module aggregation
- structured logging and observability
- explicit authorization/authentication boundaries

The project does **not** need a heavy enterprise rewrite right now. It would benefit most from a minimal layering pass:

1. extract business rules from routes into services
2. add request validation
3. add global error middleware
4. centralize config
5. optionally add repositories later if query complexity grows

## Audit Scope

The audit reviewed these areas:

- app bootstrap: `backend/src/server.js`
- database connection: `backend/src/database.js`
- CRUD routes: `backend/src/routes/index.js`
- AI routes: `backend/src/routes/ai.js`
- runtime helpers: `backend/src/routes/taskRuntimeHelpers.js`
- models: `backend/src/models/*.js`
- AI runtime bridge/core:
  - `backend/src/ai/bridge.js`
  - `backend/private_core/sayachan-ai-core/src/runtime/chat-service.js`
- backend tests in `backend/test/`

Verification run:

- `npm test` in `backend/`
- Result: 18 tests passed, 0 failed

## Current Architecture Snapshot

The backend currently looks closest to this:

```text
HTTP Route (Koa)
  -> direct Mongoose model access
  -> inline business rules in route handlers
  -> helper functions for lifecycle normalization/cascade behavior

AI Route
  -> bridge
  -> private AI runtime service
```

This means the project has:

- a route/controller layer
- a schema/model layer
- helper-style domain utilities
- partial service separation in AI runtime only

This means the project does **not** yet have:

- a clear application service layer for CRUD flows
- a request DTO/validation layer
- a repository/data access abstraction layer
- a centralized error mapping layer
- a config module
- a dedicated route aggregation/composition boundary

## What The Backend Already Does Well

### 1. The domain semantics are surprisingly disciplined for a small codebase

The task/project/note lifecycle behavior is not random. Archive and restore semantics are consistent, and the helper layer keeps canonical meanings for `archived`, `status`, and `completed`.

Relevant files:

- `backend/src/routes/taskRuntimeHelpers.js`
- `backend/test/routes.behavior-lock.test.js`
- `backend/test/routes.restore-scoping.test.js`
- `backend/test/taskRuntimeHelpers.guardrail.test.js`

### 2. Behavior locks exist where they matter most today

The backend has contract and regression-oriented tests around:

- list and filter semantics
- create/update/delete response shapes
- not-found handling
- archive/restore cascades
- project-task focus clearing

This is a strong base for refactoring into services because the current behavior is documented by tests.

### 3. AI runtime already demonstrates a better boundary than CRUD routes

The AI chat path uses:

- `backend/src/routes/ai.js`
- `backend/src/ai/bridge.js`
- `backend/private_core/sayachan-ai-core/src/runtime/chat-service.js`

That path already separates transport concerns from runtime orchestration more cleanly than the CRUD route file does.

## Main Findings

### Finding 1. The CRUD backend is missing a true service layer

Status: confirmed
Priority: high

`backend/src/routes/index.js` currently owns too much:

- request parsing
- business rule decisions
- persistence calls
- lifecycle transitions
- cascade behavior
- focus-clearing side effects
- response shaping

Examples:

- note archive/restore handlers both mutate the note and cascade task updates
- project archive/restore handlers both change project state and coordinate task/focus side effects
- task update/delete handlers both change task state and clear project focus when required

This creates three problems:

- business logic is hard to reuse outside HTTP routes
- rules are easy to duplicate or drift over time
- testing is forced to happen at the route level instead of service level

Conclusion:

The backend is missing a standard application service layer for the CRUD domain.

### Finding 2. Domain helpers exist, but they are not a substitute for services

Status: confirmed
Priority: high

`backend/src/routes/taskRuntimeHelpers.js` centralizes useful logic:

- archive filter building
- lifecycle normalization
- project provenance filters
- task cascade behavior
- focus clearing

This is helpful, but it is still not a service layer because:

- it sits under `routes/`
- it mixes query helpers, normalization, and side-effectful operations
- it does not model application use cases such as `archiveProject`, `restoreNote`, or `updateTaskLifecycle`

Conclusion:

The codebase has domain helpers, not application services.

### Finding 3. Request validation is missing

Status: confirmed
Priority: high

Routes consume `ctx.request.body` directly with little or no validation.

Examples:

- `POST /notes`
- `POST /projects`
- `POST /tasks`
- all `PUT` handlers
- all AI POST handlers

Current reliance is mostly on Mongoose validation after the route has already accepted and interpreted the request.

Risks:

- malformed request shapes reach business logic
- inconsistent error responses from validation failures
- implicit coercion and partial update ambiguity
- future refactors become harder because input assumptions are undocumented

Conclusion:

The backend is missing a request validation layer and request schemas.

### Finding 4. Centralized error handling is missing

Status: confirmed
Priority: high

There is no top-level Koa error middleware in `backend/src/server.js`.

Current behavior is mostly:

- hand-written `404` responses inside routes
- local `try/catch` in AI routes
- no common error taxonomy
- no shared mapping from domain errors to HTTP responses

Risks:

- uneven error payloads
- route files become cluttered with repetitive error branching
- production debugging becomes harder
- future service extraction will still leak transport concerns unless error handling is centralized

Conclusion:

The backend is missing a standard global error handling layer.

### Finding 5. App bootstrap and app composition are not separated

Status: confirmed
Priority: medium

`backend/src/server.js` currently:

- loads env
- creates the Koa app
- registers middleware
- mounts routes
- defines 404 behavior
- connects to MongoDB
- starts listening

This is workable for a small app, but it makes test setup and composition less clean than a split such as:

- `app.js` or `createApp.js`
- `server.js` for startup only

Conclusion:

The backend is missing a clean application composition boundary.

### Finding 6. Configuration is scattered across the codebase

Status: confirmed
Priority: medium

Environment variables are read directly from runtime files:

- `PORT`
- `FRONTEND_ORIGIN`
- `MONGO_URI`
- `GLM_API_KEY`
- `KIMI_API_KEY`
- `MOONSHOT_API_KEY`

This is acceptable early on, but a standard backend usually centralizes:

- defaults
- required/optional distinction
- environment-specific behavior
- config validation

Conclusion:

The backend is missing a configuration layer.

### Finding 7. Logging exists, but structured observability does not

Status: confirmed
Priority: medium

The backend uses `console.log`, `console.warn`, and `console.error` in many places, which is adequate for local development.

What is missing:

- request-scoped logging
- correlation/request IDs
- log levels managed in one place
- structured metadata for production analysis

Conclusion:

The backend has basic logging, but not a standard observability setup.

### Finding 8. Route aggregation is too manual and should move behind a unified router entry

Status: confirmed
Priority: medium

`backend/src/server.js` currently mounts routers one by one:

- main business routes
- AI routes

That is still manageable at the current size, but it does not scale cleanly once the route tree grows into separate files such as:

- `notes.js`
- `projects.js`
- `tasks.js`
- `ai.js`

What is missing is not just “an extra import cleanup.” The backend is missing a route composition boundary where:

- each route module owns one resource or feature area
- `routes/index.js` aggregates them in one place
- `server.js` mounts only the final composed router

Risks if left as-is:

- `server.js` becomes a growing router registry
- route mounting order becomes more implicit and scattered
- future route splitting provides less value because composition still leaks into bootstrap

Conclusion:

The backend should add a unified route index entry and use it together with resource-level route modules.

### Finding 9. Repository layer is absent, but this is optional for now

Status: confirmed
Priority: medium-low

Routes currently call Mongoose models directly. A more layered backend might add repositories like:

- `noteRepository`
- `projectRepository`
- `taskRepository`

However, for a codebase this size, adding repositories immediately is not mandatory. Mongoose is already acting as a thin data access interface, and query complexity is still low.

Conclusion:

The backend does not have a repository layer, but this is a lower-priority gap than services, validation, and errors.

### Finding 10. Authentication and authorization boundaries are absent

Status: confirmed
Priority: contextual

There is currently no sign of:

- authentication middleware
- user scoping
- authorization checks
- tenant ownership boundaries

If this backend is intentionally single-user and local-first for now, this is acceptable.
If the backend is expected to become multi-user or remotely exposed, this becomes a major missing layer.

Conclusion:

Security boundaries are currently minimal and should be treated as a future architectural requirement if deployment scope expands.

### Finding 11. Test coverage is good for route behavior, but weak for deeper architectural layers

Status: confirmed
Priority: medium

The current backend tests are useful and passing, but they are concentrated around route behavior and helper semantics.

What is missing:

- service unit tests
- integration tests against a real or ephemeral database
- middleware/error handling tests
- AI route contract tests
- config validation tests

Conclusion:

The backend has a solid regression base for current behavior, but not yet the test pyramid needed for a more layered backend.

## Gap Matrix

| Capability | Current state | Gap level | Recommendation |
| --- | --- | --- | --- |
| Routes/controllers | Present | Low | Keep, but slim them down |
| Models/schemas | Present | Low | Keep |
| Service layer | Missing for CRUD | High | Add now |
| Request validation | Missing | High | Add now |
| Error middleware | Missing | High | Add now |
| Config module | Missing | Medium | Add soon |
| App/bootstrap separation | Missing | Medium | Add soon |
| Route aggregation entry | Partial/manual | Medium | Add soon |
| Logging/observability | Basic only | Medium | Add incrementally |
| Repository layer | Missing | Medium-low | Add later if needed |
| Auth/authz | Missing | Contextual | Add when exposure/users grow |
| Service-level tests | Missing | Medium | Add alongside service extraction |

## Recommended Target Architecture

For the current project size, a good target is a lightweight layered backend:

```text
src/
  app.js
  server.js
  config/
    index.js
  middleware/
    errorHandler.js
    requestLogger.js
  routes/
    index.js
    notes.js
    projects.js
    tasks.js
    ai.js
  services/
    noteService.js
    projectService.js
    taskService.js
    aiService.js
  repositories/        # optional, can be deferred
    noteRepository.js
    projectRepository.js
    taskRepository.js
  models/
  serializers/
    noteSerializer.js
    projectSerializer.js
    taskSerializer.js
  validation/
    noteSchemas.js
    projectSchemas.js
    taskSchemas.js
    aiSchemas.js
```

Important note:

This does **not** need to be implemented all at once. The right move is a staged extraction, not a rewrite.

## Recommended Implementation Order

### Phase 1. Extract services without changing external API behavior

Create:

- `services/noteService.js`
- `services/projectService.js`
- `services/taskService.js`

Move into services:

- archive/restore orchestration
- focus clearing
- lifecycle updates
- Mongoose writes currently embedded in routes

Keep routes responsible only for:

- reading params/body/query
- calling a service
- setting status/body

### Phase 2. Add request validation

Introduce request schemas for:

- note create/update
- project create/update
- task create/update
- AI note task generation
- AI project next action
- AI chat

Goal:

- reject malformed payloads before business logic executes
- standardize 400-level responses

### Phase 3. Add global error middleware

Introduce:

- `NotFoundError`
- `ValidationError`
- `DomainConflictError` if needed later

Then map them in one Koa middleware.

### Phase 4. Centralize config

Create a config module that exposes:

- `port`
- `frontendOrigin`
- `mongoUri`
- `glmApiKey`
- `kimiApiKey`

This should also own validation of required settings for AI features.

### Phase 5. Split app creation from process startup

Refactor:

- `app.js` creates and returns the Koa app
- `server.js` connects DB and listens

This will make future integration testing easier.

### Phase 6. Add a unified route entry and split route files by resource

Refactor toward:

- `routes/notes.js`
- `routes/projects.js`
- `routes/tasks.js`
- `routes/ai.js`
- `routes/index.js`

Where:

- each route file exports one router module
- `routes/index.js` composes and exports the final router
- `server.js` mounts only the aggregated router

Important note:

If the current large `routes/index.js` is wrapped by another index file without first splitting the resource routes, the benefit is limited. The real win comes from combining:

- resource-level router files
- one unified router entry

### Phase 7. Decide later whether repositories are worth it

Add repositories only if one or more of these becomes true:

- queries become more complex
- multiple services share the same data access logic
- transactions or batching expand
- Mongoose-specific details start leaking too widely

## Practical Refactor Boundaries

To avoid over-engineering, the following should stay simple for now:

- keep Mongoose models
- keep the current response shape contracts
- keep route URLs unchanged
- do not introduce repositories unless service extraction reveals real duplication
- do not add a route aggregator that only re-exports one giant router file without splitting by resource
- do not build a full domain-driven architecture for this codebase yet

## Risks If The Current Structure Stays As-Is

If the backend keeps growing in the current form, the likely failure modes are:

- route file becomes the de facto service layer and keeps expanding
- route registration in bootstrap becomes an increasingly manual checklist
- business rules drift between note/project/task endpoints
- AI and CRUD paths evolve with inconsistent architectural standards
- validation behavior stays inconsistent
- future auth or audit requirements become much harder to layer in cleanly

## Final Assessment

The backend is healthy enough to keep shipping on, but it is now at the point where architectural debt is beginning to compound.

The most important conclusion is:

- yes, the backend is missing a service layer
- but the bigger architectural picture is that it is also missing validation, centralized error handling, config centralization, route aggregation, and app composition separation

If only one improvement is made next, it should be **service extraction for CRUD routes**.
If two more are made after that, they should be **request validation** and **global error middleware**.

## Suggested Next Step

The safest next implementation step is:

1. extract `taskService` and `projectService`
2. keep all existing route contracts unchanged
3. preserve the current tests as behavior locks
4. add new service-level tests as the logic moves

That path gives the project a cleaner backend architecture without forcing a risky rewrite.
