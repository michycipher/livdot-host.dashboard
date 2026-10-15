import { describe, it, expect } from "vitest";
import { createMockEventApi } from "./mock-event-api";
describe("authoritative mock API", () => {
  it("validates direct API transitions and preserves canonical data on rejection", async () => {
    const api = createMockEventApi({ latency: 0 });
    const before = await api.getEvent();
    await expect(api.transitionEvent("ready")).rejects.toMatchObject({
      code: "TRANSITION_BLOCKED",
    });
    expect(await api.getEvent()).toEqual(before);
  });
  it("fails only one mutation, never consumes the failure on GET, and supports retry", async () => {
    const api = createMockEventApi({ latency: 0, scenario: "ready" });
    api.setFailNextRequest(true);
    const before = await api.getEvent();
    await expect(api.transitionEvent("live")).rejects.toMatchObject({
      code: "SIMULATED_FAILURE",
    });
    expect(await api.getEvent()).toEqual(before);
    expect((await api.transitionEvent("live")).status).toBe("live");
  });
  it("returns defensive copies", async () => {
    const api = createMockEventApi({ latency: 0 });
    const copy = await api.getEvent();
    copy.crew.assigned = false;
    expect((await api.getEvent()).crew.assigned).toBe(true);
  });
  it("does not promote lifecycle when completing requirements", async () => {
    const api = createMockEventApi({
      latency: 0,
      scenario: "scheduled_almost_ready",
    });
    expect(
      (await api.setRequirement("ticketPricingConfigured", true)).status,
    ).toBe("scheduled");
  });
  it("rejects invalid schedules and configuration after broadcast starts", async () => {
    const api = createMockEventApi({ latency: 0, scenario: "draft" });
    await expect(api.setScheduledAt("invalid")).rejects.toMatchObject({
      code: "INVALID_DATE",
    });
    await api.resetScenario("live");
    await expect(
      api.setRequirement("crewAssigned", false),
    ).rejects.toMatchObject({ code: "CONFIGURATION_LOCKED" });
  });
  it("preserves data when scenario reset fails", async () => {
    const api = createMockEventApi({ latency: 0 });
    const before = await api.getEvent();
    api.setFailNextRequest(true);
    await expect(api.resetScenario("live")).rejects.toThrow();
    expect(await api.getEvent()).toEqual(before);
  });
});
