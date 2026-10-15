import { AlertCircle } from "lucide-react";
import { EVENT_STATUS_META, TRANSITION_META } from "@/domain/event.constants";
import type { EventCommand, HostEvent } from "@/domain/event.types";
import { MockApiError } from "@/services/mock-event-api";
export function SystemFeedback({
  event,
  error,
  command,
  onRetry,
  busy,
}: {
  event: HostEvent;
  error: Error | null;
  command?: EventCommand;
  onRetry: () => void;
  busy: boolean;
}) {
  if (!error || !command) return null;
  const heading =
    command.type === "transition"
      ? TRANSITION_META[command.target].failure
      : command.type === "requirement"
        ? "Unable to update event configuration."
        : command.type === "schedule"
          ? "Unable to save the schedule."
          : "Unable to load the scenario.";
  return (
    <section role="alert" className="error-panel">
      <AlertCircle size={20} />
      <div>
        <h2>{heading}</h2>
        <p>
          The event remains {EVENT_STATUS_META[event.status].label}. No
          lifecycle change was applied. Your last saved event details are
          unchanged.
        </p>
        <p>{error.message}</p>
        {error instanceof MockApiError && error.blockers.length > 0 && (
          <ul>
            {error.blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        )}
        <button
          className="button secondary small"
          onClick={onRetry}
          disabled={busy}
        >
          Try Again
        </button>
      </div>
    </section>
  );
}
