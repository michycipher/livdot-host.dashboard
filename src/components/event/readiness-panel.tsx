import { ShieldCheck } from "lucide-react";
import {
  canConfigureEvent,
  getReadinessSummary,
} from "@/domain/event.selectors";
import type { EventCommand, HostEvent } from "@/domain/event.types";
import { ReadinessItem } from "./readiness-item";
export function ReadinessPanel({
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
  const summary = getReadinessSummary(event);
  return (
    <section className="card readiness" aria-labelledby="readiness-title">
      <div className="section-heading">
        <div>
          <div className="heading-with-icon">
            <ShieldCheck size={19} />
            <h2 id="readiness-title">Operational readiness</h2>
          </div>
          <p>Everything your event needs before going live.</p>
        </div>
        <span className="readiness-count">
          {summary.completed}
          <span> / {summary.total}</span>
        </span>
      </div>
      <div className="readiness-summary">
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Readiness requirements satisfied"
          aria-valuenow={summary.completed}
          aria-valuemin={0}
          aria-valuemax={summary.total}
        >
          <div
            style={{ width: `${(summary.completed / summary.total) * 100}%` }}
          />
        </div>
        <p>
          {summary.completed} of {summary.total} requirements satisfied
        </p>
      </div>
      <ul className="requirements">
        {summary.requirements.map((requirement) => (
          <ReadinessItem
            key={requirement.key}
            requirement={requirement}
            editable={canConfigureEvent(event.status)}
            disabled={busy}
            pending={
              busy &&
              command?.type === "requirement" &&
              command.key === requirement.key
            }
            onChange={() =>
              onCommand({
                type: "requirement",
                key: requirement.key,
                value: !requirement.satisfied,
              })
            }
          />
        ))}
      </ul>
      <div className="readiness-footnote">
        {summary.complete
          ? "All operational requirements are complete."
          : `${summary.missing.length} ${summary.missing.length === 1 ? "requirement is" : "requirements are"} preventing this event from progressing.`}
        {summary.complete && event.status === "scheduled" && (
          <span> Eligible to transition to Ready for Streaming.</span>
        )}
        {!canConfigureEvent(event.status) && (
          <span> Configuration is locked after broadcasting starts.</span>
        )}
      </div>
    </section>
  );
}
