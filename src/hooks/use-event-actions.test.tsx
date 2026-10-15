import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Providers } from "@/app/providers";
import { createMockEventApi } from "@/services/mock-event-api";
import { useEventActions } from "./use-event-actions";

describe("event command coordination", () => {
  it("accepts only one command before React can render pending controls, then unlocks", async () => {
    const api = createMockEventApi({ latency: 0, scenario: "ready" });
    const gate = Promise.withResolvers<void>();
    const execute = api.execute;
    const requests = vi
      .spyOn(api, "execute")
      .mockImplementation(async (command) => {
        await gate.promise;
        return execute(command);
      });
    const { result } = renderHook(useEventActions, {
      wrapper: ({ children }) => <Providers api={api}>{children}</Providers>,
    });
    act(() => {
      result.current.mutate({ type: "transition", target: "live" });
      result.current.mutate({ type: "transition", target: "live" });
      result.current.mutate({ type: "scenario", scenario: "draft" });
    });
    await waitFor(() => expect(requests).toHaveBeenCalledTimes(1));
    await act(async () => {
      gate.resolve();
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((await api.getEvent()).status).toBe("live");
    act(() =>
      result.current.mutate({ type: "transition", target: "completed" }),
    );
    await waitFor(() => expect(result.current.data?.status).toBe("completed"));
    expect(requests).toHaveBeenCalledTimes(2);
  });
});
