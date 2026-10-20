# LIVDOT Host Event Dashboard

## Overview

A host workspace for preparing and operating a live, ticketed event. The assessment focuses on backend-owned lifecycle state, operational readiness, guarded transitions, and failure handling. It opens with **Lagos Innovation Summit 2026** scheduled but blocked by missing ingest and ticket pricing.

Built with Next.js App Router, strict TypeScript, React, TanStack Query, Vitest, React Testing Library, Lucide icons, and one application stylesheet at `src/app/globals.css`.

## Running Locally

Use Node.js **22.12+** (Node 24 recommended) and npm. With nvm installed, `nvm use` selects the project's Node version.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm start
```

For a fresh checkout, use `npm ci` to install exactly the committed lockfile. Run `npm run verify` to execute tests, lint, type checking, and the production build together. The GitHub Actions workflow runs these same checks plus `npm audit --omit=dev` on pushes and pull requests.

`npm test` is a single run; `npm run test:watch` starts watch mode. No environment variables or external services are required. Commit `package-lock.json` for reproducible installs; CI can use `npm ci`.

## Architecture

The event lifecycle is backend-owned domain state: Draft → Scheduled → Ready for Streaming → Live → Completed → Replay Available. The canonical event stores one `status` and configuration facts.

Operational readiness is modelled separately from lifecycle state. Values such as `canGoLive`, `isReady`, and `missingRequirements` are derived from canonical event data rather than persisted independently. Completing all three requirements makes a scheduled event eligible for Ready; an explicit, confirmed transition is still required.

Lifecycle rules and transition guards live in pure domain functions rather than React components. The mock API validates transitions again: hiding or disabling an action in the frontend is not backend enforcement. API responses are defensive copies, so consumers cannot mutate its canonical store.

In this assessment, the UI and mock API share pure domain rules so business logic is not intentionally duplicated within one repository. In production, the backend would independently enforce the same lifecycle invariants and remain authoritative regardless of frontend validation. Frontend guards improve UX; they are not a security boundary. A real backend must authorize the host, validate every command, and never trust client-provided event state.

```text
src/
  app/                 App Router page, layout, styles, QueryClient/API providers
  components/event/    Header, lifecycle, readiness, details, action, feedback, demo UI
  domain/              Canonical types, status metadata, selectors, transition guards
  hooks/               Event query and shared mutation lifecycle
  services/            In-memory mock API and eight deterministic scenario fixtures
  lib/                 QueryClient factory and date/currency formatters
  test/                Isolated provider/fixture utilities and test setup
```

## State Management

TanStack Query manages simulated server state. React local state is limited to ephemeral concerns: selected demo scenario, failure toggle, and the unsaved scheduling input. A single mutation hook coordinates commands. A synchronous in-flight guard rejects duplicate submissions even before React renders disabled controls; it unlocks after success or failure.

Critical lifecycle mutations are pessimistic. The query cache receives only the backend's successful response. In-flight queries are cancelled before a mutation so a stale refresh cannot overwrite its confirmed result. Background refresh retains existing data; initial loading and load failure have dedicated states. Mutations have no automatic retry, so consequential commands are retried deliberately.

The in-memory service lives in the browser module and uses deterministic **650 ms** latency. Reloading the page restores the initial scenario; it is not a durable or shared backend. Tests inject isolated service instances with zero latency or manually controlled promises.

## Why No XState

The lifecycle is conceptually a finite-state machine. For six mostly linear states, explicit TypeScript transition rules are easy to inspect and test without another runtime dependency. If the production lifecycle grew to include cancellation, reconnecting streams, production failures, refunds, concurrent crew states, replay processing, and recovery states, a dedicated state-machine solution such as XState would be worth considering.

## Assumptions

1. **Scheduled → Ready is explicit.** Completing requirements creates eligibility, not permission for the frontend to silently change lifecycle state.
2. **Transitions are forward-only.** Cancellation, reverting states, emergency termination, refunds, and reconnection are outside scope.
3. **Backend state is authoritative.** The API may reject an action that the UI previously considered available. Ready → Live rechecks every readiness requirement.
4. **Replay processing is simplified.** The brief supplies no processing prerequisites, so enabling replay is a mocked transition from Completed.
5. **Configuration is editable before broadcasting.** Draft, Scheduled, and Ready permit configuration changes. Removing a requirement from Ready leaves its canonical status intact and blocks Go Live. Once broadcasting begins, configuration is locked in both UI and API.
6. **Dates use event time.** Sample event dates are displayed in the event timezone (`Africa/Lagos`). A production implementation would use the timezone configured for each event rather than assuming the operator's local timezone. Canonical values are ISO timestamps; this sample's scheduling input explicitly uses WAT (UTC+1). The fixture is October 24, 2026 at 6:00 PM WAT. Draft schedules require a valid date; no unspecified lead-time rule is imposed.
7. **Configuration is simulated.** Actions assign LIVDOT Production Crew, Primary RTMP ingest, or NGN 7,500 pricing. No actual stream or payment is initiated. Reset assessment loads the initial blocked scenario and, like other mutations, may fail if the failure toggle is armed.

## Failure Handling

Enable **Fail next mutation**, then perform an action. The service consumes the flag once; GET requests do not consume it. On rejection, canonical data and the last confirmed cache remain unchanged. An accessible inline alert explains the failed action, the retained lifecycle state, and offers **Try Again**. The toggle clears when a request is dispatched, and retry runs normally unless failure is armed again.

An action such as Go Live never changes the visible status before confirmation. This avoids presenting a false operational state. Configuration and scenario changes use the same confirmed-response approach.

## Component Structure

`EventDashboard` composes query state and the page sections. `EventHeader` presents confirmed facts; `LifecycleStepper` is noninteractive progress with `aria-current="step"`. `ReadinessPanel` and `ReadinessItem` render derived requirements. `EventActionPanel` consumes domain decisions, explains blockers, and submits the next legal command. `SystemFeedback` contextualizes mutation errors. `DemoControls` stays visibly separate from host operations.

Business rules live outside these components so the UI and API can share the same tested contract without coupling validation to rendering. Request loading never becomes an event status.

## Testing

The tests cover:

- Every allowed edge and every illegal state-to-state transition, required schedule, each missing readiness fact, terminal replay, and readiness revalidation before Go Live.
- Derived readiness without automatic lifecycle promotion.
- Independent API validation, defensive copies, one-shot failures, GET behavior, rejected scenario resets, and configuration locks.
- Current status, blockers, final-requirement completion, explicit transitions, pending-state preservation, accessible failure feedback, retry, scenario controls, scheduling, and the full path to replay.
- Same-tick duplicate-command prevention, initial/background fetch recovery, cancellation of stale refresh responses, and clearing errors after scenario changes.

UI tests use React Testing Library and user-event, with an isolated service and QueryClient for each render. A controlled promise proves that the old status remains visible throughout an in-flight transition; tests do not depend on the production latency or snapshots.

### Manual review flow

1. Start in Scheduled with crew assigned and two missing requirements.
2. Configure ingest, then ticket pricing. Confirm 2/3 then 3/3; status stays Scheduled.
3. Mark Ready for Streaming. Confirm Scheduled remains visible during “Preparing event…”.
4. Arm Fail next mutation and click Go Live. Confirm “Starting broadcast…” while the status stays Ready for Streaming.
5. Confirm the error preserves Ready, then Try Again. Confirm Live only after success.
6. End Broadcast, then Enable Replay. Confirm no further lifecycle action.
7. Load Draft and save a schedule before scheduling. Check keyboard focus and the horizontally scrollable lifecycle at 320, 375, 390, 768, 1024, and 1440px. Confirm no page-level horizontal overflow, including when an error is displayed.

## Production Considerations

Replace the service adapter with REST or GraphQL and retain backend-authoritative guards, authenticated host permissions, and backend-enforced RBAC. Use WebSockets or Server-Sent Events for stream health, crew readiness, ingest connectivity, and lifecycle updates; TanStack Query can continue owning the cache while subscriptions update or invalidate it.

Use idempotent lifecycle commands, audit logs, and event/version identifiers or ETags/If-Match to prevent simultaneous host/crew operations from overwriting each other. Add observability/error reporting, stream health telemetry, and a deliberate retry/backoff strategy that distinguishes transient failures from rejected commands. Durable storage, authentication, streaming, checkout, and subscriptions are intentionally outside this assessment.

## Interview Talking Point

I deliberately separated event lifecycle state from request state. While a Go Live request is pending, the event remains Ready for Streaming because that is the last state confirmed by the backend. The UI may communicate that a transition is in progress, but it does not claim that the event is Live until that transition succeeds.

## Dependency Notes

`npm audit --omit=dev` reports zero production dependency vulnerabilities. Remaining audit findings are confined to the development tooling dependency chain. This dependency check is not a security guarantee for the application.
