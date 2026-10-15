import { canTransition } from "@/domain/event.transitions";
import { canConfigureEvent } from "@/domain/event.selectors";
import type {
  DemoScenario,
  EventCommand,
  EventStatus,
  HostEvent,
  ReadinessRequirementKey,
} from "@/domain/event.types";
import { createScenario } from "./mock-event-scenarios";
export class MockApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly blockers: string[] = [],
  ) {
    super(message);
    this.name = "MockApiError";
  }
}
export function createMockEventApi({
  latency = 650,
  scenario = "scheduled_blocked",
}: { latency?: number; scenario?: DemoScenario } = {}) {
  let event = createScenario(scenario);
  let failNext = false;
  const wait = () =>
    new Promise<void>((resolve) => setTimeout(resolve, latency));
  const copy = () => structuredClone(event);
  async function mutate(
    change: (current: HostEvent) => HostEvent,
  ): Promise<HostEvent> {
    // Consume failure at dispatch; no canonical data is changed until validation succeeds.
    const shouldFail = failNext;
    failNext = false;
    await wait();
    if (shouldFail)
      throw new MockApiError(
        "The update could not be saved. Please try again.",
        "SIMULATED_FAILURE",
      );
    const next = change(copy());
    event = { ...next, updatedAt: new Date().toISOString() };
    return copy();
  }
  const api = {
    async getEvent() {
      await wait();
      return copy();
    },
    setFailNextRequest(enabled: boolean) {
      failNext = enabled;
    },
    setScheduledAt(date: string) {
      return mutate((current) => {
        if (current.status !== "draft")
          throw new MockApiError(
            "Only draft events can change their schedule.",
            "SCHEDULE_LOCKED",
          );
        if (!date || Number.isNaN(Date.parse(date)))
          throw new MockApiError(
            "Enter a valid date and time.",
            "INVALID_DATE",
          );
        return { ...current, scheduledAt: new Date(date).toISOString() };
      });
    },
    setRequirement(key: ReadinessRequirementKey, value: boolean) {
      return mutate((current) => {
        if (!canConfigureEvent(current.status))
          throw new MockApiError(
            "Configuration is locked once a broadcast starts.",
            "CONFIGURATION_LOCKED",
          );
        if (key === "crewAssigned")
          current.crew = {
            assigned: value,
            name: value ? "LIVDOT Production Crew" : null,
          };
        if (key === "ingestConfigured")
          current.streaming = {
            ingestConfigured: value,
            ingestLabel: value ? "Primary RTMP ingest" : null,
          };
        if (key === "ticketPricingConfigured")
          current.ticketing = {
            configured: value,
            price: value ? 7500 : null,
            currency: "NGN",
          };
        return current;
      });
    },
    transitionEvent(target: EventStatus) {
      return mutate((current) => {
        const decision = canTransition(current, target);
        if (!decision.allowed)
          throw new MockApiError(
            "The lifecycle transition is blocked.",
            "TRANSITION_BLOCKED",
            decision.blockers,
          );
        return { ...current, status: target };
      });
    },
    resetScenario(nextScenario: DemoScenario) {
      return mutate(() => createScenario(nextScenario));
    },
  };
  return {
    ...api,
    execute(command: EventCommand): Promise<HostEvent> {
      switch (command.type) {
        case "schedule":
          return api.setScheduledAt(command.date);
        case "requirement":
          return api.setRequirement(command.key, command.value);
        case "transition":
          return api.transitionEvent(command.target);
        case "scenario":
          return api.resetScenario(command.scenario);
      }
    },
  };
}
export type EventApi = ReturnType<typeof createMockEventApi>;
export const mockEventApi = createMockEventApi();
