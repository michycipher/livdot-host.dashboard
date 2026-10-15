import type { EventStatus } from "./event.types";
export const EVENT_STATUSES: readonly EventStatus[] = [
  "draft",
  "scheduled",
  "ready",
  "live",
  "completed",
  "replay_available",
];
export const EVENT_TRANSITIONS: Record<EventStatus, readonly EventStatus[]> = {
  draft: ["scheduled"],
  scheduled: ["ready"],
  ready: ["live"],
  live: ["completed"],
  completed: ["replay_available"],
  replay_available: [],
};
export const EVENT_STATUS_META = {
  draft: {
    label: "Draft",
    short: "Draft",
    description: "Event created. Set a date to schedule your event.",
  },
  scheduled: {
    label: "Scheduled",
    short: "Scheduled",
    description:
      "Your event is scheduled. Review operational readiness before progressing.",
  },
  ready: {
    label: "Ready for Streaming",
    short: "Ready",
    description:
      "The event has been marked ready. Verify requirements before broadcasting.",
  },
  live: {
    label: "Live",
    short: "Live",
    description: "Your event is currently broadcasting.",
  },
  completed: {
    label: "Completed",
    short: "Completed",
    description: "The live broadcast has ended.",
  },
  replay_available: {
    label: "Replay Available",
    short: "Replay",
    description: "Catch-up viewing is available to your audience.",
  },
} satisfies Record<
  EventStatus,
  { label: string; short: string; description: string }
>;
export const TRANSITION_META = {
  scheduled: {
    action: "Schedule Event",
    pending: "Scheduling…",
    failure: "Unable to schedule the event.",
  },
  ready: {
    action: "Mark Ready for Streaming",
    pending: "Preparing event…",
    failure: "Unable to mark the event ready.",
  },
  live: {
    action: "Go Live",
    pending: "Starting broadcast…",
    failure: "Unable to start the broadcast.",
  },
  completed: {
    action: "End Broadcast",
    pending: "Ending broadcast…",
    failure: "Unable to end the broadcast.",
  },
  replay_available: {
    action: "Enable Replay",
    pending: "Enabling replay…",
    failure: "Unable to enable replay.",
  },
  draft: {
    action: "Create Draft",
    pending: "Creating draft…",
    failure: "Unable to create draft.",
  },
} satisfies Record<
  EventStatus,
  { action: string; pending: string; failure: string }
>;
