import { render } from "@testing-library/react";
import { Providers } from "@/app/providers";
import { EventDashboard } from "@/components/event/event-dashboard";
import { createMockEventApi, type EventApi } from "@/services/mock-event-api";
import type { DemoScenario } from "@/domain/event.types";
export function renderDashboard(
  scenario: DemoScenario = "scheduled_blocked",
  suppliedApi?: EventApi,
) {
  const api = suppliedApi ?? createMockEventApi({ latency: 0, scenario });
  return {
    api,
    ...render(
      <Providers api={api}>
        <EventDashboard />
      </Providers>,
    ),
  };
}
