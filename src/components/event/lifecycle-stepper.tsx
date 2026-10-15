import { Check } from "lucide-react";
import { EVENT_STATUSES, EVENT_STATUS_META } from "@/domain/event.constants";
import type { EventStatus } from "@/domain/event.types";
export function LifecycleStepper({ status }: { status: EventStatus }) {
  const current = EVENT_STATUSES.indexOf(status);
  return (
    <nav className="lifecycle card" aria-label="Event lifecycle" tabIndex={0}>
      <div className="section-kicker">
        EVENT LIFECYCLE <span>Step {current + 1} of 6</span>
      </div>
      <ol>
        {EVENT_STATUSES.map((step, index) => (
          <li
            key={step}
            aria-current={step === status ? "step" : undefined}
            className={
              index < current ? "past" : index === current ? "current" : ""
            }
          >
            <span className="step-circle">
              {index < current ? <Check size={14} /> : index + 1}
            </span>
            <span>{EVENT_STATUS_META[step].short}</span>
            <span className="sr-only">
              {index < current
                ? " — passed stage"
                : index === current
                  ? " — current stage"
                  : " — upcoming stage"}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
