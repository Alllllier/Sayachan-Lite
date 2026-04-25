# Frontend Architecture Audit

Date: 2026-04-23
Project: `personal_os_lite`
Scope: `frontend/` application bootstrap, routing, page/view structure, component boundaries, services, stores, styling system, and current frontend test/build health

## Executive Summary

The frontend is in better shape than the backend from a UI system perspective, but it is still missing a clear application-state architecture for the main product flows.

What is already working well:

- The app has a clear Vue 3 + Vite baseline.
- Pinia is present and already used for cross-cutting state.
- Shared UI primitives and design tokens exist.
- Some business logic has already been extracted into pure `behavior.js` helpers with tests.
- The service layer exists in part for tasks/chat/context, and frontend tests are healthy.

What is not yet fully matured:

- most CRUD/data orchestration still lives inside large SFCs
- network access is duplicated across pages and components
- page-level and component-level state ownership is inconsistent
- there is no unified API client or frontend domain repository layer
- there is no standard composable layer for async resource management
- global app layout and style ownership are partially mixed with legacy local styles

This is not a bad frontend. It is a frontend that has already started extracting the right ideas, but has not yet completed the architectural consolidation.

The main conclusion is:

1. the frontend does **not** primarily lack a visual design system
2. it **does** lack a stronger state/data-flow architecture
3. the next step should be extracting composables or feature services for `notes`, `projects`, and `dashboard` flows

## Audit Scope

The audit reviewed these areas:

- bootstrap:
  - `frontend/src/main.js`
  - `frontend/src/App.vue`
  - `frontend/src/router/index.js`
- views:
  - `frontend/src/views/*.vue`
- main feature components:
  - `frontend/src/components/NotesPanel.vue`
  - `frontend/src/components/ProjectsPanel.vue`
  - `frontend/src/components/Dashboard.vue`
  - `frontend/src/components/ChatEntry.vue`
- services:
  - `frontend/src/services/*.js`
- stores:
  - `frontend/src/stores/*.js`
- pure behavior helpers:
  - `frontend/src/components/*.behavior.js`
- styles:
  - `frontend/src/styles/*.css`
- utility:
  - `frontend/src/utils/markdown.js`

Verification runs:

- `npm test`
- `npm run build`

Results:

- tests passed: 24
- build passed
- Vite reported large production chunks, especially the Notes page and main bundle

## Current Architecture Snapshot

The frontend currently looks closest to this:

```text
App shell
  -> router views
  -> large feature components
    -> local refs/reactive state
    -> direct fetch() calls
    -> some shared services
    -> some Pinia stores
    -> some pure behavior helpers
```

This means the frontend already has several good ingredients:

- app shell
- route-level views
- feature components
- service modules
- Pinia stores
- shared UI primitives
- tokenized CSS foundation

But those ingredients are not yet aligned into a fully consistent frontend architecture.

## What The Frontend Already Does Well

### 1. The project already has a real UI foundation

Unlike a purely ad hoc frontend, this one has a recognizable shared styling layer:

- `frontend/src/styles/index.css`
- `frontend/src/styles/tokens.css`
- `frontend/src/components/ui/*`
- `frontend/src/components/ui/surfaces/*`
- `frontend/src/components/ui/list/*`

This is a meaningful strength. The frontend is not just page-local CSS glued together. It has tokens, primitives, and reusable surfaces.

### 2. Some business logic is already being extracted from components

The `behavior.js` files are a strong sign of architectural maturity:

- `frontend/src/components/projectsPanel.behavior.js`
- `frontend/src/components/dashboard.behavior.js`
- `frontend/src/components/chatEntry.behavior.js`

These modules isolate pure derivation logic and already have tests. That is exactly the right direction for reducing component complexity.

### 3. Cross-cutting app state already has a foothold in Pinia

Pinia stores already exist for:

- chat UI state
- cockpit/dashboard signals
- runtime controls

This means the project does not need to invent state architecture from scratch. It already has the tooling and some good patterns.

### 4. Service modules exist and are partially useful

Current services include:

- `taskService.js`
- `chatService.js`
- `dashboardContextService.js`
- `aiService.js`

This is important because the app has already started separating transport concerns from view code, even if that separation is incomplete.

### 5. Tests and production build are healthy

The frontend passed:

- 24 tests in Vitest
- production build in Vite

This creates safe conditions for refactoring.

## Main Findings

### Finding 1. The frontend is missing a consistent feature-state architecture

Status: confirmed
Priority: high

The biggest architectural gap is not visual. It is data and state ownership.

Right now:

- views fetch their own initial data
- large components fetch again
- some data lives in local component refs
- some data lives in service-level singleton refs
- some cross-cutting state lives in Pinia

Examples:

- `NotesPage.vue` fetches notes, but `NotesPanel.vue` also owns its own notes state and also fetches notes
- `ProjectsPage.vue` fetches projects, while `ProjectsPanel.vue` keeps its own `projects` ref and also fetches projects/tasks
- `Dashboard.vue` reads from `taskService` shared refs but still performs direct task mutations itself

This creates a mixed ownership model:

- parent-as-owner in some places
- child-as-owner in others
- service-as-owner in others
- store-as-owner in still others

Conclusion:

The frontend is missing a clear feature-state architecture and canonical ownership for resource state.

### Finding 2. Large feature components are acting as controllers, services, and views at the same time

Status: confirmed
Priority: high

`NotesPanel.vue`, `ProjectsPanel.vue`, and `Dashboard.vue` are all large, stateful orchestration components.

They currently mix:

- API requests
- optimistic/local mutations
- validation
- UI event handling
- persistence fallback logic
- view rendering
- derived display logic
- notification logic

This is the frontend equivalent of a missing service/application layer.

The most obvious example is `ProjectsPanel.vue`, which carries:

- CRUD
- task capture modes
- AI suggestion flow
- focus management
- project task preview state
- archived/active view switching
- validation state
- toast state

Conclusion:

The frontend has several fat feature components that need composable or feature-controller extraction.

### Finding 3. Direct `fetch()` usage is duplicated and widely scattered

Status: confirmed
Priority: high

Network requests are performed in many places:

- `NotesPage.vue`
- `DashboardPage.vue`
- `ProjectsPage.vue`
- `NotesPanel.vue`
- `ProjectsPanel.vue`
- `Dashboard.vue`
- `ChatEntry.vue`
- service files

This creates several problems:

- repeated `API_BASE` declarations
- repeated JSON parsing and error handling
- inconsistent retry/fallback behavior
- weak central visibility into transport concerns

Conclusion:

The frontend is missing a unified API client boundary or feature-level data access layer.

### Finding 4. Views are thin, but not truly authoritative

Status: confirmed
Priority: medium-high

The route views look intentionally slim, which is good in principle.
But they are not consistently authoritative owners of data.

For example:

- `NotesPage.vue` fetches notes but does not pass them into `NotesPanel.vue`
- `ProjectsPage.vue` passes `projects` down, but `ProjectsPanel.vue` still hydrates and mutates its own copy
- `DashboardPage.vue` owns note/project arrays, but `Dashboard.vue` also relies on task service singleton state

So the app has route views, but not a clean “container view owns feature state” pattern.

Conclusion:

The view layer exists, but feature ownership boundaries are blurred.

### Finding 5. Pinia usage is good, but partial and uneven

Status: confirmed
Priority: medium-high

Pinia is currently used for:

- chat modal/session state
- cockpit signals
- runtime controls

But core CRUD resources are not represented as formal stores:

- notes
- projects
- tasks-as-a-feature

Instead, tasks are partly stored in a service singleton ref, which is workable but asymmetrical compared to Pinia usage elsewhere.

Conclusion:

The frontend has a state-management foundation, but feature stores are incomplete and unevenly applied.

### Finding 6. `behavior.js` extraction is promising, but the next extraction layer is still missing

Status: confirmed
Priority: medium-high

The project already extracts pure derivation logic into `behavior.js`, which is excellent.
However, there is still a missing middle layer for stateful orchestration, such as:

- composables like `useNotesFeature`
- composables like `useProjectsFeature`
- feature controllers like `useDashboardTasks`

Without that layer, the components remain very large even if their pure logic is testable.

Conclusion:

The frontend is missing a composable/controller layer between pure helpers and Vue components.

### Finding 7. The design system is ahead of the page/style cleanup

Status: confirmed
Priority: medium

The project has tokens and shared surfaces, but local SFC styles still duplicate layout and typography choices.

Examples:

- `App.vue` still carries global-ish layout styles and system-font defaults
- page files repeat nearly identical `.page` and `.page-title` blocks
- feature components still contain many local color literals and legacy style fragments

This means the design system exists, but the migration is incomplete.

Conclusion:

The frontend does not lack a design system; it lacks full adoption and cleanup around that design system.

### Finding 8. The app shell is simple, but layout ownership is not fully centralized

Status: confirmed
Priority: medium

`App.vue` owns:

- router outlet
- bottom nav
- global chat entry
- some global layout styles

This is fine for a small app, but a more standard frontend shell often separates:

- `AppShell`
- `BottomNav`
- overlay surfaces like global chat

Conclusion:

The shell is functional, but some app-level layout concerns are still concentrated in `App.vue`.

### Finding 9. AI-related frontend architecture is split between fallback-only service logic and backend-backed flows

Status: confirmed
Priority: medium

There are two different AI patterns in the frontend:

- `aiService.js` provides local fallback-style helpers for dashboard AI workflow
- notes/projects AI actions call backend endpoints directly from components
- chat goes through `chatService.js`

This makes the AI architecture internally inconsistent on the frontend side.

Conclusion:

The frontend is missing a single coherent AI feature boundary.

### Finding 10. Build health is good, but bundle partitioning needs attention

Status: confirmed
Priority: medium

`npm run build` passed, but Vite reported large chunks:

- `NotesPage` chunk is large
- main `index` bundle is over 1 MB before gzip

The likely reasons include:

- CodeMirror and markdown/highlight dependencies
- globally shared imports that reduce effective code splitting
- large feature components

Conclusion:

The frontend is missing a deliberate code-splitting and bundle-weight strategy.

### Finding 11. Error and loading handling are mostly local and non-uniform

Status: confirmed
Priority: medium

Different components handle async state differently:

- some use `loading` refs
- some use toast only
- some set `error`
- some swallow failure and only log to console

This is understandable for a growing frontend, but it means users may experience inconsistent failure handling across features.

Conclusion:

The frontend is missing a more standardized async UX pattern.

## Gap Matrix

| Capability | Current state | Gap level | Recommendation |
| --- | --- | --- | --- |
| Vue app bootstrap | Present | Low | Keep |
| Router/view structure | Present | Low | Keep, tighten ownership |
| Shared UI primitives | Present | Low | Keep expanding |
| Design tokens | Present | Low | Keep, continue adoption |
| Pinia foundation | Present | Low | Extend to core features |
| Pure behavior helpers | Present | Low | Keep extracting |
| Feature state architecture | Inconsistent | High | Fix now |
| Composable/controller layer | Missing | High | Add now |
| Unified API client | Missing | High | Add now |
| Canonical CRUD feature stores | Missing/incomplete | High | Add now |
| Async state conventions | Partial | Medium | Standardize |
| App shell decomposition | Partial | Medium | Improve later |
| AI feature boundary | Split | Medium | Consolidate |
| Bundle/code splitting strategy | Weak | Medium | Improve soon |

## Recommended Target Architecture

For the current project size, a good target is a lightweight feature-oriented frontend:

```text
src/
  app/
    AppShell.vue
    router.js
  views/
    NotesPage.vue
    ProjectsPage.vue
    DashboardPage.vue
  features/
    notes/
      components/
      useNotesFeature.js
      notesApi.js
      notesSchemas.js        # optional later
    projects/
      components/
      useProjectsFeature.js
      projectsApi.js
    dashboard/
      components/
      useDashboardTasks.js
      dashboardApi.js        # if needed
    chat/
      components/
      useChatFeature.js
      chatApi.js
  stores/
    chat.js
    runtimeControls.js
    cockpitSignals.js
    notes.js                # optional if Pinia chosen for feature state
    projects.js             # optional if Pinia chosen for feature state
    tasks.js                # optional if Pinia chosen for feature state
  services/
    apiClient.js
  components/
    ui/
  styles/
```

Important note:

The project does **not** need a large SPA enterprise rewrite. It needs a cleaner separation of feature orchestration from rendering.

## Recommended Implementation Order

### Phase 1. Introduce a shared API client

Create one place for:

- base URL
- `fetch` wrapper
- JSON parsing
- standardized error creation

This should replace repeated `API_BASE` constants and repetitive request code.

### Phase 2. Extract feature composables from the large SFCs

Best first candidates:

- `useNotesFeature()`
- `useProjectsFeature()`
- `useDashboardTasks()`

Move into composables:

- loading/error refs
- fetch/refresh methods
- validation state
- CRUD actions
- local optimistic updates
- archive/restore/pin orchestration

Keep components focused on rendering and event wiring.

### Phase 3. Decide canonical state ownership per feature

For each feature, choose one primary owner:

- view-local composable state
- Pinia store
- or service singleton

Do not keep mixing all three for the same resource.

Recommended:

- use composables for page-local orchestration
- use Pinia only for cross-route/global state

Unless notes/projects/tasks truly need cross-route persistence as first-class app state.

### Phase 4. Consolidate task state strategy

Right now tasks are split between:

- `taskService` singleton refs
- dashboard-local mutation logic
- project-card task fetching

Decide whether tasks should live in:

- a `useTasksStore()` Pinia store
- or a clearer `tasks feature` composable pattern

The current half-singleton approach should be normalized.

### Phase 5. Continue pure-logic extraction

Keep using `behavior.js` style modules for:

- sorting
- grouping
- filtering
- task preview logic
- UI eligibility rules

This is already a good pattern and should continue.

### Phase 6. Finish style system adoption

Refactor repeated local styles into shared primitives where possible:

- page layout wrapper
- page title styling
- cards and section wrappers
- repeated status/meta presentation

Also move remaining hard-coded color literals toward semantic tokens.

### Phase 7. Improve bundle partitioning

Most likely wins:

- lazy-load CodeMirror-heavy editor surfaces if practical
- isolate markdown/editor dependencies from routes that do not need them
- ensure large feature modules are route-scoped where possible

## Practical Refactor Boundaries

To avoid over-engineering, the following should stay simple:

- keep Vue SFCs
- keep Pinia
- keep the existing UI component library
- keep behavior-lock tests
- avoid adding a complex query/cache library unless actual cache invalidation pain appears

This project probably does **not** need React Query/TanStack-style infrastructure yet.

## Risks If The Current Structure Stays As-Is

If the current frontend keeps growing without consolidation, the likely failure modes are:

- feature components become harder to reason about
- request logic drifts across views/components/services
- bugs arise from duplicated resource ownership
- async UX becomes inconsistent
- tests become more awkward because orchestration stays trapped inside large SFCs
- bundle size continues to rise without intentional boundaries

## Final Assessment

The frontend is not missing fundamentals. In several ways, it is already more structured than the backend:

- it has a design token layer
- it has reusable UI primitives
- it has Pinia
- it has extracted pure behavior modules
- it has passing tests

The main architectural debt is elsewhere:

- the frontend lacks a consistent feature orchestration layer
- data/state ownership is mixed
- API access is too scattered
- some core components are too large and multi-responsibility

If only one improvement is made next, it should be:

- extract feature composables for `notes`, `projects`, and `dashboard tasks`

If two more follow, they should be:

- add a shared API client
- normalize feature state ownership

## Suggested Next Step

The safest next implementation step is:

1. introduce `services/apiClient.js`
2. extract `useNotesFeature()` from `NotesPanel.vue`
3. keep all current UI and route contracts unchanged
4. preserve current Vitest tests as behavior locks
5. add focused tests around the new composable

That path will reduce frontend complexity without forcing a redesign of the whole app.
