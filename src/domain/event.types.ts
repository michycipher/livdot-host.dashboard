export type EventStatus =
  | "draft"
  | "scheduled"
  | "ready"
  | "live"
  | "completed"
  | "replay_available";
export type ReadinessRequirementKey =
  | "crewAssigned"
  | "ingestConfigured"
  | "ticketPricingConfigured";
export interface HostEvent {
  id: string;
  title: string;
  description: string;
  status: EventStatus;
  scheduledAt: string | null;
  crew: { assigned: boolean; name: string | null };
  streaming: { ingestConfigured: boolean; ingestLabel: string | null };
  ticketing: { configured: boolean; price: number | null; currency: string };
  updatedAt: string;
}
export interface ReadinessRequirement {
  key: ReadinessRequirementKey;
  label: string;
  description: string;
  satisfied: boolean;
  action: string;
  blocker: string;
}
export interface TransitionDecision {
  allowed: boolean;
  blockers: string[];
}
export type DemoScenario =
  | "draft"
  | "scheduled_blocked"
  | "scheduled_almost_ready"
  | "scheduled_fully_configured"
  | "ready"
  | "live"
  | "completed"
  | "replay";
export type EventCommand =
  | { type: "schedule"; date: string }
  | { type: "requirement"; key: ReadinessRequirementKey; value: boolean }
  | { type: "transition"; target: EventStatus }
  | { type: "scenario"; scenario: DemoScenario };
