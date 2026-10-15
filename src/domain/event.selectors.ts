import { EVENT_TRANSITIONS, TRANSITION_META } from "./event.constants";
import type {
  HostEvent,
  EventStatus,
  ReadinessRequirement,
} from "./event.types";
export function getReadinessRequirements(
  event: HostEvent,
): ReadinessRequirement[] {
  return [
    {
      key: "crewAssigned",
      label: "Production crew",
      description:
        event.crew.name ?? "Assign a crew to manage your live production.",
      satisfied: event.crew.assigned,
      action: "Assign production crew",
      blocker: "Production crew must be assigned.",
    },
    {
      key: "ingestConfigured",
      label: "Streaming ingest",
      description:
        event.streaming.ingestLabel ??
        "Connect an RTMP ingest for your broadcast.",
      satisfied: event.streaming.ingestConfigured,
      action: "Configure ingest",
      blocker: "Streaming ingest must be configured.",
    },
    {
      key: "ticketPricingConfigured",
      label: "Ticket pricing",
      description: event.ticketing.configured
        ? "Ticket pricing is configured for paid access."
        : "Set a ticket price before opening your event.",
      satisfied: event.ticketing.configured,
      action: "Set ticket pricing",
      blocker: "Ticket pricing must be configured.",
    },
  ];
}
export function getReadinessSummary(event: HostEvent) {
  const requirements = getReadinessRequirements(event);
  const missing = requirements.filter((requirement) => !requirement.satisfied);
  return {
    requirements,
    completed: requirements.length - missing.length,
    total: requirements.length,
    missing,
    complete: missing.length === 0,
  };
}
export function getNextLifecycleStatus(
  status: EventStatus,
): EventStatus | null {
  return EVENT_TRANSITIONS[status][0] ?? null;
}
export function getTransitionActionLabel(status: EventStatus) {
  return TRANSITION_META[status].action;
}
export function canConfigureEvent(status: EventStatus) {
  return status === "draft" || status === "scheduled" || status === "ready";
}
