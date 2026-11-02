import type { EventStatus, HostEvent } from "@/domain/event.types";

export const EVENT_BOARD_STORAGE_KEY = "livdot-event-board";
export const EVENT_BOARD_UPDATED_EVENT = "livdot:event-board-updated";

export interface EventBoardSnapshot {
  id: string;
  title: string;
  description: string;
  status: EventStatus;
  scheduledAt: string | null;
  updatedAt: string;
}

function canUseBrowserStorage() {
  return typeof window !== "undefined";
}

export function readEventBoardState(): Record<string, EventBoardSnapshot> {
  if (!canUseBrowserStorage()) return {};
  try {
    const raw = window.localStorage.getItem(EVENT_BOARD_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, EventBoardSnapshot>) : {};
  } catch {
    return {};
  }
}

export function syncEventToBoard(event: HostEvent) {
  if (!canUseBrowserStorage()) return;
  const next = {
    ...readEventBoardState(),
    [event.id]: {
      id: event.id,
      title: event.title,
      description: event.description,
      status: event.status,
      scheduledAt: event.scheduledAt,
      updatedAt: event.updatedAt,
    },
  } satisfies Record<string, EventBoardSnapshot>;
  window.localStorage.setItem(EVENT_BOARD_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT_BOARD_UPDATED_EVENT, { detail: next }));
  void fetch("/api/event-board", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(next[event.id]),
    keepalive: true,
  }).catch(() => undefined);
}
