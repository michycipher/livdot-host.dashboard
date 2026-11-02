"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/query-client";
import {
  createMockEventApi,
  mockEventApi,
  type EventApi,
} from "@/services/mock-event-api";
import type { DemoScenario } from "@/domain/event.types";
import type { ScenarioOverrides } from "@/services/mock-event-scenarios";
const ApiContext = createContext<EventApi>(mockEventApi);
export const useEventApi = () => useContext(ApiContext);
export function Providers({
  children,
  api = mockEventApi,
  initialScenario,
  initialOverrides,
}: {
  children: ReactNode;
  api?: EventApi;
  initialScenario?: DemoScenario;
  initialOverrides?: ScenarioOverrides;
}) {
  const [client] = useState(createQueryClient);
  const [resolvedApi] = useState(() =>
    api === mockEventApi && initialScenario
      ? createMockEventApi({ scenario: initialScenario, overrides: initialOverrides })
      : api,
  );
  return (
    <ApiContext.Provider value={resolvedApi}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ApiContext.Provider>
  );
}
