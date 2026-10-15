import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { renderDashboard } from "@/test/test-utils";
import { createMockEventApi } from "@/services/mock-event-api";
import type { HostEvent } from "@/domain/event.types";
async function loaded() {
  return screen.findByTestId("event-status");
}
describe("host event dashboard", () => {
  it("displays confirmed lifecycle, missing readiness and exact blocked-action explanations", async () => {
    renderDashboard();
    expect(await loaded()).toHaveTextContent("Scheduled");
    expect(screen.getAllByText("Missing")).toHaveLength(2);
    expect(
      screen.getByText("Streaming ingest must be configured."),
    ).toBeVisible();
    expect(
      screen.getByText("Ticket pricing must be configured."),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Mark Ready for Streaming" }),
    ).toBeDisabled();
    expect(
      within(screen.getByRole("navigation", { name: "Event lifecycle" }))
        .getByText("Scheduled")
        .closest("li"),
    ).toHaveAttribute("aria-current", "step");
  });
  it("completes the last requirement but waits for an explicit Ready transition", async () => {
    const user = userEvent.setup();
    renderDashboard("scheduled_almost_ready");
    await loaded();
    await user.click(
      screen.getByRole("button", { name: "Set ticket pricing" }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Mark Ready for Streaming" }),
      ).toBeEnabled(),
    );
    expect(screen.getByText("3 of 3 requirements satisfied")).toBeVisible();
    expect(await loaded()).toHaveTextContent("Scheduled");
    await user.click(
      screen.getByRole("button", { name: "Mark Ready for Streaming" }),
    );
    await waitFor(() =>
      expect(screen.getByTestId("event-status")).toHaveTextContent(
        "Ready for Streaming",
      ),
    );
  });
  it("retains previous lifecycle while pending and displays new state only after confirmation", async () => {
    const user = userEvent.setup();
    const api = createMockEventApi({ latency: 0, scenario: "ready" });
    let confirm: ((event: HostEvent) => void) | undefined;
    vi.spyOn(api, "execute").mockImplementationOnce(
      () =>
        new Promise<HostEvent>((resolve) => {
          confirm = resolve;
        }),
    );
    renderDashboard("ready", api);
    await loaded();
    await user.click(screen.getByRole("button", { name: "Go Live" }));
    expect(
      await screen.findByRole("button", { name: "Starting broadcast…" }),
    ).toBeDisabled();
    expect(screen.getByTestId("event-status")).toHaveTextContent(
      "Ready for Streaming",
    );
    expect(
      screen.getByRole("button", { name: "Load scenario" }),
    ).toBeDisabled();
    await act(async () => {
      const updated = await api.transitionEvent("live");
      confirm?.(updated);
    });
    await waitFor(() =>
      expect(screen.getByTestId("event-status")).toHaveTextContent("Live"),
    );
  });
  it("preserves Ready on failure, announces an accessible error and retries successfully", async () => {
    const user = userEvent.setup();
    const api = createMockEventApi({ latency: 0, scenario: "ready" });
    const gate = Promise.withResolvers<void>();
    const execute = api.execute;
    const requests = vi
      .spyOn(api, "execute")
      .mockImplementationOnce(async (command) => {
        await gate.promise;
        return execute(command);
      });
    renderDashboard("ready", api);
    const before = await api.getEvent();
    await loaded();
    await user.click(
      screen.getByRole("switch", { name: "Fail next mutation" }),
    );
    await user.click(screen.getByRole("button", { name: "Go Live" }));
    expect(
      await screen.findByRole("button", { name: "Starting broadcast…" }),
    ).toBeDisabled();
    expect(screen.getByRole("region", { name: "Live" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByTestId("event-status")).toHaveTextContent(
      "Ready for Streaming",
    );
    for (const name of [
      "Load scenario",
      "Reset assessment",
      "Refresh event",
      "Clear streaming ingest",
    ]) {
      expect(screen.getByRole("button", { name })).toBeDisabled();
    }
    expect(await api.getEvent()).toEqual(before);
    await act(async () => {
      gate.resolve();
    });
    const error = await screen.findByRole("alert");
    expect(await api.getEvent()).toEqual(before);
    expect(error).toHaveTextContent("Unable to start the broadcast.");
    expect(error).toHaveTextContent(
      "The event remains Ready for Streaming. No lifecycle change was applied.",
    );
    expect(screen.getByTestId("event-status")).toHaveTextContent(
      "Ready for Streaming",
    );
    expect(screen.getByRole("switch")).not.toBeChecked();
    await user.click(screen.getByRole("button", { name: "Try Again" }));
    await waitFor(() =>
      expect(screen.getByTestId("event-status")).toHaveTextContent("Live"),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect((await api.getEvent()).status).toBe("live");
    expect(requests).toHaveBeenCalledTimes(2);
  });
  it("runs the complete operational flow through terminal replay", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await loaded();
    for (const name of [
      "Configure ingest",
      "Set ticket pricing",
      "Mark Ready for Streaming",
      "Go Live",
      "End Broadcast",
      "Enable Replay",
    ]) {
      await waitFor(() =>
        expect(screen.getByRole("button", { name })).toBeEnabled(),
      );
      await user.click(screen.getByRole("button", { name }));
    }
    await waitFor(() =>
      expect(screen.getByTestId("event-status")).toHaveTextContent(
        "Replay Available",
      ),
    );
    expect(
      screen.getByRole("heading", { name: "Lifecycle complete" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Enable Replay" }),
    ).not.toBeInTheDocument();
  });
  it("loads scenarios, schedules a draft, and resets assessment", async () => {
    const user = userEvent.setup();
    const { api } = renderDashboard();
    await loaded();
    await user.selectOptions(
      screen.getByLabelText("Backend scenario"),
      "draft",
    );
    await user.click(screen.getByRole("button", { name: "Load scenario" }));
    await waitFor(() =>
      expect(screen.getByTestId("event-status")).toHaveTextContent("Draft"),
    );
    expect(
      screen.getByRole("button", { name: "Schedule Event" }),
    ).toBeDisabled();
    await user.clear(screen.getByLabelText("Broadcast date & time (WAT)"));
    await user.type(
      screen.getByLabelText("Broadcast date & time (WAT)"),
      "2026-11-05T19:30",
    );
    await user.click(screen.getByRole("button", { name: "Save schedule" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Schedule Event" }),
      ).toBeEnabled(),
    );
    expect((await api.getEvent()).scheduledAt).toBe("2026-11-05T18:30:00.000Z");
    await user.click(screen.getByRole("button", { name: "Schedule Event" }));
    await waitFor(() =>
      expect(screen.getByTestId("event-status")).toHaveTextContent("Scheduled"),
    );
    await user.click(screen.getByRole("button", { name: "Reset assessment" }));
    await screen.findByText("1 of 3 requirements satisfied");
  });
  it("keeps event visible during background refresh", async () => {
    const user = userEvent.setup();
    const { api } = renderDashboard();
    await loaded();
    let resolve: ((event: HostEvent) => void) | undefined;
    const event = await api.getEvent();
    vi.spyOn(api, "getEvent").mockImplementationOnce(
      () =>
        new Promise<HostEvent>((done) => {
          resolve = done;
        }),
    );
    await user.click(screen.getByRole("button", { name: "Refresh event" }));
    expect(screen.getByTestId("event-status")).toHaveTextContent("Scheduled");
    expect(
      screen.getByRole("button", { name: "Refresh event" }),
    ).toHaveAttribute("aria-busy", "true");
    await act(async () => {
      resolve?.(event);
    });
  });
  it("rechecks Go Live eligibility after clearing a requirement", async () => {
    const user = userEvent.setup();
    renderDashboard("ready");
    await loaded();
    await user.click(
      screen.getByRole("button", { name: "Clear streaming ingest" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Go Live" })).toBeDisabled(),
    );
    expect(
      screen.getByText("Streaming ingest must be configured."),
    ).toBeVisible();
    expect(screen.getByTestId("event-status")).toHaveTextContent(
      "Ready for Streaming",
    );
  });
});

describe("fetch recovery and stale requests", () => {
  it("shows initial loading, fetch failure, and successful explicit retry", async () => {
    vi.useFakeTimers();
    try {
      const api = createMockEventApi({ latency: 0 });
      const getEvent = vi
        .spyOn(api, "getEvent")
        .mockRejectedValueOnce(new Error("Service unavailable"))
        .mockRejectedValueOnce(new Error("Service unavailable"));
      renderDashboard("scheduled_blocked", api);
      expect(
        screen.getByRole("heading", { name: "Loading your event…" }),
      ).toBeVisible();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1100);
      });
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Unable to load your event",
      );
      fireEvent.click(
        screen.getByRole("button", { name: "Retry loading event" }),
      );
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10);
      });
      expect(screen.getByTestId("event-status")).toHaveTextContent("Scheduled");
      expect(getEvent).toHaveBeenCalledTimes(3);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps confirmed data when a background refresh fails and clears the error on retry", async () => {
    const api = createMockEventApi({ latency: 0 });
    renderDashboard("scheduled_blocked", api);
    await loaded();
    vi.useFakeTimers();
    try {
      vi.spyOn(api, "getEvent")
        .mockRejectedValueOnce(new Error("Service unavailable"))
        .mockRejectedValueOnce(new Error("Service unavailable"));
      fireEvent.click(screen.getByRole("button", { name: "Refresh event" }));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1100);
      });
      expect(screen.getByRole("alert")).toHaveTextContent("Refresh failed");
      expect(screen.getByTestId("event-status")).toHaveTextContent("Scheduled");
      fireEvent.click(screen.getByRole("button", { name: "Refresh event" }));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10);
      });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByTestId("event-status")).toHaveTextContent("Scheduled");
    } finally {
      vi.useRealTimers();
    }
  });

  it("discards a stale background response after a confirmed mutation", async () => {
    const user = userEvent.setup();
    const { api } = renderDashboard("ready");
    await loaded();
    const stale = await api.getEvent();
    const refresh = Promise.withResolvers<HostEvent>();
    vi.spyOn(api, "getEvent").mockReturnValueOnce(refresh.promise);
    await user.click(screen.getByRole("button", { name: "Refresh event" }));
    await user.click(screen.getByRole("button", { name: "Go Live" }));
    await waitFor(() =>
      expect(screen.getByTestId("event-status")).toHaveTextContent("Live"),
    );
    await act(async () => {
      refresh.resolve(stale);
    });
    expect(screen.getByTestId("event-status")).toHaveTextContent("Live");
  });

  it("clears a failed transition alert when another scenario is confirmed", async () => {
    const user = userEvent.setup();
    renderDashboard("ready");
    await loaded();
    await user.click(
      screen.getByRole("switch", { name: "Fail next mutation" }),
    );
    await user.click(screen.getByRole("button", { name: "Go Live" }));
    await screen.findByRole("alert");
    await user.selectOptions(
      screen.getByLabelText("Backend scenario"),
      "draft",
    );
    await user.click(screen.getByRole("button", { name: "Load scenario" }));
    await waitFor(() =>
      expect(screen.getByTestId("event-status")).toHaveTextContent("Draft"),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Try Again" }),
    ).not.toBeInTheDocument();
  });
});
