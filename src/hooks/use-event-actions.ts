import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEventApi } from "@/app/providers";
import type { EventCommand } from "@/domain/event.types";
import { EVENT_QUERY_KEY } from "./use-event";
export function useEventActions() {
  const api = useEventApi();
  const client = useQueryClient();
  const inFlight = useRef(false);
  const mutation = useMutation({
    mutationFn: (command: EventCommand) => api.execute(command),
    onMutate: async () => {
      await client.cancelQueries({ queryKey: EVENT_QUERY_KEY });
    },
    onSuccess: (event) => {
      client.setQueryData(EVENT_QUERY_KEY, event);
    },
    onSettled: () => {
      inFlight.current = false;
    },
  });
  function submit(command: EventCommand): boolean {
    // Close the same-tick gap before React renders disabled controls.
    if (inFlight.current) return false;
    inFlight.current = true;
    mutation.mutate(command);
    return true;
  }
  return {
    mutate: submit,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    variables: mutation.variables,
    data: mutation.data,
  };
}
