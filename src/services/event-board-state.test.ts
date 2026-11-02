import { beforeEach, describe, expect, it, vi } from "vitest";
import { createScenario } from "./mock-event-scenarios";
import {
  EVENT_BOARD_STORAGE_KEY,
  EVENT_BOARD_UPDATED_EVENT,
  readEventBoardState,
  syncEventToBoard,
} from "./event-board-state";

describe("event board state", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("persists the latest confirmed event state and announces an update", () => {
    const listener = vi.fn();
    window.addEventListener(EVENT_BOARD_UPDATED_EVENT, listener);
    const event = createScenario("live");

    syncEventToBoard(event);

    expect(readEventBoardState()[event.id]).toMatchObject({
      id: event.id,
      status: "live",
      title: event.title,
    });
    expect(window.localStorage.getItem(EVENT_BOARD_STORAGE_KEY)).toContain(
      '"status":"live"',
    );
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(EVENT_BOARD_UPDATED_EVENT, listener);
  });

  it("ignores malformed board data instead of breaking the event library", () => {
    window.localStorage.setItem(EVENT_BOARD_STORAGE_KEY, "not-json");

    expect(readEventBoardState()).toEqual({});
  });
});
