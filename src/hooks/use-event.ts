import { useQuery } from "@tanstack/react-query";
import { useEventApi } from "@/app/providers";
export const EVENT_QUERY_KEY = ["host-event"] as const;
export function useEvent() {
  const api = useEventApi();
  return useQuery({ queryKey: EVENT_QUERY_KEY, queryFn: () => api.getEvent() });
}
