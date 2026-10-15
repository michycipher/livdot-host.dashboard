import type { DemoScenario, HostEvent } from "@/domain/event.types";
export const SCENARIOS: Record<DemoScenario, string> = {
  draft: "Draft · no schedule",
  scheduled_blocked: "Scheduled · 1 of 3 ready",
  scheduled_almost_ready: "Scheduled · 2 of 3 ready",
  scheduled_fully_configured: "Scheduled · all requirements met",
  ready: "Ready for Streaming",
  live: "Live broadcast",
  completed: "Broadcast completed",
  replay: "Replay available",
};
export function createScenario(scenario: DemoScenario): HostEvent {
  const crew = scenario !== "draft";
  const ingest = crew && scenario !== "scheduled_blocked";
  const tickets = ingest && scenario !== "scheduled_almost_ready";
  return {
    id: "EV-4821",
    title: "Lagos Innovation Summit 2026",
    description:
      "A live technology and business event bringing founders, operators and investors together.",
    status: (
      {
        draft: "draft",
        scheduled_blocked: "scheduled",
        scheduled_almost_ready: "scheduled",
        scheduled_fully_configured: "scheduled",
        ready: "ready",
        live: "live",
        completed: "completed",
        replay: "replay_available",
      } satisfies Record<DemoScenario, HostEvent["status"]>
    )[scenario],
    scheduledAt: scenario === "draft" ? null : "2026-10-24T17:00:00.000Z",
    crew: { assigned: crew, name: crew ? "LIVDOT Production Crew" : null },
    streaming: {
      ingestConfigured: ingest,
      ingestLabel: ingest ? "Primary RTMP ingest" : null,
    },
    ticketing: {
      configured: tickets,
      price: tickets ? 7500 : null,
      currency: "NGN",
    },
    updatedAt: "2026-10-10T16:42:00.000Z",
  };
}
