"use client";

import { useEffect, useState } from "react";
import {
  EVENT_BOARD_STORAGE_KEY,
  EVENT_BOARD_UPDATED_EVENT,
  readEventBoardState,
  type EventBoardSnapshot,
} from "@/services/event-board-state";

export function useEventBoard() {
  const [snapshots, setSnapshots] = useState<Record<string, EventBoardSnapshot>>({});

  useEffect(() => {
    const refresh = () => setSnapshots(readEventBoardState());
    const refreshFromServer = () => {
      void fetch("/api/event-board", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((serverSnapshots: Record<string, EventBoardSnapshot> | null) => {
          if (!serverSnapshots) return;
          window.localStorage.setItem(EVENT_BOARD_STORAGE_KEY, JSON.stringify(serverSnapshots));
          setSnapshots(serverSnapshots);
        })
        .catch(() => undefined);
    };
    const onCustomUpdate = () => refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key === EVENT_BOARD_STORAGE_KEY) refresh();
    };
    refresh();
    refreshFromServer();
    const poll = window.setInterval(refreshFromServer, 1500);
    window.addEventListener(EVENT_BOARD_UPDATED_EVENT, onCustomUpdate);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT_BOARD_UPDATED_EVENT, onCustomUpdate);
      window.removeEventListener("storage", onStorage);
      window.clearInterval(poll);
    };
  }, []);

  return snapshots;
}
