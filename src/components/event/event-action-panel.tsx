import { useState } from "react";
import { ArrowRight, CircleCheck, LockKeyhole, Radio } from "lucide-react";
import { EVENT_STATUS_META, TRANSITION_META } from "@/domain/event.constants";
import {
  getNextLifecycleStatus,
  getTransitionActionLabel,
} from "@/domain/event.selectors";
import { canTransition } from "@/domain/event.transitions";
import type { EventCommand, HostEvent } from "@/domain/event.types";
export function EventActionPanel({
  event,
  busy,
  command,
  onCommand,
}: {
  event: HostEvent;
  busy: boolean;
  command?: EventCommand;
  onCommand: (command: EventCommand) => void;
}) {
  const [date, setDate] = useState("2026-10-24T18:00");
  const target = getNextLifecycleStatus(event.status);
  const decision = target ? canTransition(event, target) : null;
  const pending = busy && command?.type === "transition";
  return (
    <section
      className="card action-panel"
      aria-labelledby="action-title"
      aria-busy={
        busy && (command?.type === "transition" || command?.type === "schedule")
      }
    >
      <div className="section-kicker">
        NEXT STEP <ArrowRight size={15} />
      </div>
      {target && decision ? (
        <>
          <h2 id="action-title">{EVENT_STATUS_META[target].label}</h2>
          <p className="action-description">
            {EVENT_STATUS_META[event.status].description}
          </p>
          {event.status === "draft" && (
            <form
              className="schedule-form"
              onSubmit={(e) => {
                e.preventDefault();
                onCommand({ type: "schedule", date: `${date}:00+01:00` });
              }}
            >
              <label htmlFor="schedule">Broadcast date & time (WAT)</label>
              <input
                id="schedule"
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={busy}
              />
              <button
                className="button secondary"
                disabled={busy || !date}
                type="submit"
              >
                {busy && command?.type === "schedule"
                  ? "Saving date…"
                  : "Save schedule"}
              </button>
            </form>
          )}
          {!decision.allowed ? (
            <div className="blockers" id="transition-blockers">
              <div className="blocker-label">
                <LockKeyhole size={14} /> ACTION BLOCKED
              </div>
              <p>
                {EVENT_STATUS_META[target].label} is currently blocked. Complete
                the following first:
              </p>
              <ul>
                {decision.blockers.map((blocker) => (
                  <li key={blocker}>{blocker}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="eligible">
              <CircleCheck size={17} />
              <span>
                {target === "completed"
                  ? "Ending this broadcast stops the live event. This transition cannot be reversed."
                  : "This event is eligible for the next step."}
              </span>
            </div>
          )}
          <button
            className={`button primary ${target === "completed" ? "danger" : ""}`}
            disabled={busy || !decision.allowed}
            aria-describedby={
              !decision.allowed ? "transition-blockers" : undefined
            }
            onClick={() => onCommand({ type: "transition", target })}
          >
            {pending
              ? TRANSITION_META[target].pending
              : getTransitionActionLabel(target)}
            {!pending &&
              (target === "live" ? (
                <Radio size={16} />
              ) : (
                <ArrowRight size={16} />
              ))}
          </button>
          <p className="authority-note">
            Your event status changes only when the update is confirmed.
          </p>
        </>
      ) : (
        <>
          <div className="complete-icon">
            <CircleCheck size={26} />
          </div>
          <h2 id="action-title">Lifecycle complete</h2>
          <p className="action-description">
            The broadcast has ended and replay is available. There are no
            further lifecycle actions.
          </p>
        </>
      )}
    </section>
  );
}
