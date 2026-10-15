import { EVENT_STATUS_META, EVENT_TRANSITIONS } from "./event.constants";
import { getReadinessSummary } from "./event.selectors";
import type { EventStatus, HostEvent, TransitionDecision } from "./event.types";
export function canTransition(
  event: HostEvent,
  target: EventStatus,
): TransitionDecision {
  if (!EVENT_TRANSITIONS[event.status].includes(target))
    return {
      allowed: false,
      blockers: [
        `Cannot move from ${EVENT_STATUS_META[event.status].label} to ${EVENT_STATUS_META[target].label}. Follow the event lifecycle in order.`,
      ],
    };
  const blockers: string[] = [];
  if (
    target === "scheduled" &&
    (!event.scheduledAt || Number.isNaN(Date.parse(event.scheduledAt)))
  )
    blockers.push(
      "Set a valid scheduled date and time before scheduling the event.",
    );
  if (target === "ready" || target === "live")
    blockers.push(
      ...getReadinessSummary(event).missing.map(
        (requirement) => requirement.blocker,
      ),
    );
  return { allowed: blockers.length === 0, blockers };
}
