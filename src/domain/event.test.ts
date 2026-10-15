import { describe, expect, it } from "vitest";
import { canTransition } from "./event.transitions";
import { getReadinessSummary, getNextLifecycleStatus } from "./event.selectors";
import { EVENT_STATUSES } from "./event.constants";
import { createScenario } from "@/services/mock-event-scenarios";
import type { DemoScenario, EventStatus } from "./event.types";
describe("lifecycle guards", () => {
  it("blocks scheduling without a date", () => {
    expect(canTransition(createScenario("draft"), "scheduled").allowed).toBe(
      false,
    );
  });
  it("allows scheduling with a valid date", () => {
    const event = createScenario("draft");
    event.scheduledAt = "2026-10-24T17:00:00Z";
    expect(canTransition(event, "scheduled").allowed).toBe(true);
  });
  it("blocks an invalid schedule", () => {
    const event = createScenario("draft");
    event.scheduledAt = "invalid";
    expect(canTransition(event, "scheduled").allowed).toBe(false);
  });
  it.each(["crew", "ingest", "pricing"])(
    "blocks readiness when %s is missing",
    (key) => {
      const event = createScenario("scheduled_fully_configured");
      if (key === "crew") event.crew.assigned = false;
      if (key === "ingest") event.streaming.ingestConfigured = false;
      if (key === "pricing") event.ticketing.configured = false;
      const decision = canTransition(event, "ready");
      expect(decision.allowed).toBe(false);
      expect(decision.blockers).toHaveLength(1);
    },
  );
  it.each<[DemoScenario, EventStatus]>([
    ["scheduled_fully_configured", "ready"],
    ["ready", "live"],
    ["live", "completed"],
    ["completed", "replay_available"],
  ])("allows %s → %s", (scenario, target) => {
    expect(canTransition(createScenario(scenario), target)).toEqual({
      allowed: true,
      blockers: [],
    });
  });
  it("blocks Scheduled → Live", () => {
    expect(
      canTransition(createScenario("scheduled_fully_configured"), "live")
        .allowed,
    ).toBe(false);
  });
  it("rechecks readiness for Go Live", () => {
    const event = createScenario("ready");
    event.streaming.ingestConfigured = false;
    expect(canTransition(event, "live").blockers).toEqual([
      "Streaming ingest must be configured.",
    ]);
  });
  it("has a terminal replay state", () => {
    expect(getNextLifecycleStatus("replay_available")).toBeNull();
    for (const target of EVENT_STATUSES)
      expect(canTransition(createScenario("replay"), target).allowed).toBe(
        false,
      );
  });
  it("rejects every nonadjacent transition", () => {
    const legalEdges: [EventStatus, EventStatus][] = [
      ["draft", "scheduled"],
      ["scheduled", "ready"],
      ["ready", "live"],
      ["live", "completed"],
      ["completed", "replay_available"],
    ];
    for (const source of EVENT_STATUSES)
      for (const target of EVENT_STATUSES) {
        const event = { ...createScenario("ready"), status: source };
        expect(canTransition(event, target).allowed).toBe(
          legalEdges.some(([from, to]) => from === source && to === target),
        );
      }
  });
  it("derives readiness without promoting lifecycle", () => {
    const event = createScenario("scheduled_fully_configured");
    expect(getReadinessSummary(event)).toMatchObject({
      completed: 3,
      total: 3,
      missing: [],
      complete: true,
    });
    expect(event.status).toBe("scheduled");
  });
});
