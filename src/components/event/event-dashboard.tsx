"use client";
import { useEffect, useState } from "react";
import { useEvent } from "@/hooks/use-event";
import { useEventActions } from "@/hooks/use-event-actions";
import { useEventApi } from "@/app/providers";
import type { EventCommand } from "@/domain/event.types";
import { EventHeader } from "./event-header";
import { LifecycleStepper } from "./lifecycle-stepper";
import { ReadinessPanel } from "./readiness-panel";
import { EventDetails } from "./event-details";
import { EventActionPanel } from "./event-action-panel";
import { SystemFeedback } from "./system-feedback";
import { DemoControls } from "./demo-controls";
import { AppHeader } from "./app-header";
import { EventPreviewCard } from "./event-preview-card";
import { syncEventToBoard } from "@/services/event-board-state";
export function EventDashboard() {
  const query = useEvent();
  const mutation = useEventActions();
  const api = useEventApi();
  const [failureArmed, setFailureArmed] = useState(false);

  function onCommand(command: EventCommand) {
    if (mutation.mutate(command)) setFailureArmed(false);
  }
  const event = query.data;
  useEffect(() => {
    if (event) syncEventToBoard(event);
  }, [event]);
  return (
    <>
      <AppHeader active="dashboard" />
      <main id="main-content">
        {!event ? (
          query.isError ? (
            <section role="alert" className="card loading">
              <h1>Unable to load your event</h1>
              <p>
                The event service could not be reached. Retry to retrieve the
                confirmed event state.
              </p>
              <button
                className="button primary"
                disabled={query.isFetching}
                aria-busy={query.isFetching}
                onClick={() => void query.refetch()}
              >
                Retry loading event
              </button>
            </section>
          ) : (
            <section className="card loading" role="status" aria-busy="true">
              <div className="skeleton" />
              <h1>Loading your event…</h1>
              <p>Retrieving the confirmed event state.</p>
            </section>
          )
        ) : (
          <>
            <EventHeader
              event={event}
              refreshing={query.isFetching}
              disabled={mutation.isPending}
              onRefresh={() => void query.refetch()}
            />
            <LifecycleStepper status={event.status} />
            {query.isError && (
              <div role="alert" className="error-panel">
                Refresh failed. Showing the last confirmed event. Use Refresh
                event to retry.
              </div>
            )}
            <SystemFeedback
              event={event}
              error={mutation.error}
              command={mutation.variables}
              busy={mutation.isPending}
              onRetry={() => {
                if (mutation.variables) onCommand(mutation.variables);
              }}
            />
            <div className="dashboard-grid">
              <div className="main-column">
                <EventPreviewCard event={event} />
                <ReadinessPanel
                  event={event}
                  busy={mutation.isPending}
                  command={mutation.variables}
                  onCommand={onCommand}
                />
                <EventDetails event={event} />
              </div>
              <aside>
                <EventActionPanel
                  event={event}
                  busy={mutation.isPending}
                  command={mutation.variables}
                  onCommand={onCommand}
                />
                <div className="operations-note">
                  <span className="note-line" />
                  <p>A clear path to going live.</p>
                  <span>
                    Prepare your event, confirm readiness, then start your
                    broadcast.
                  </span>
                </div>
              </aside>
            </div>
            <div className="sr-only" role="status" aria-live="polite">
              {mutation.isPending
                ? "Request in progress. Waiting for confirmation."
                : mutation.isSuccess
                  ? "Event update confirmed."
                  : ""}
            </div>
            <DemoControls
              busy={mutation.isPending}
              failureArmed={failureArmed}
              onFailureChange={(enabled) => {
                api.setFailNextRequest(enabled);
                setFailureArmed(enabled);
              }}
              onCommand={onCommand}
            />
          </>
        )}
      </main>
      <footer>
        <span>LIVDOT TECHNOLOGIES</span>
        <span>Host operations · Assessment environment</span>
      </footer>
    </>
  );
}
