"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/query-client";
import { mockEventApi, type EventApi } from "@/services/mock-event-api";
const ApiContext = createContext<EventApi>(mockEventApi);
export const useEventApi = () => useContext(ApiContext);
export function Providers({
  children,
  api = mockEventApi,
}: {
  children: ReactNode;
  api?: EventApi;
}) {
  const [client] = useState(createQueryClient);
  return (
    <ApiContext.Provider value={api}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ApiContext.Provider>
  );
}
