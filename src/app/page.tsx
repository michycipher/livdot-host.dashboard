import { EventDashboard } from "@/components/event/event-dashboard";
import { Providers } from "./providers";
import { SCENARIOS } from "@/services/mock-event-scenarios";
import type { DemoScenario } from "@/domain/event.types";
import { EVENT_CATALOG } from "@/services/event-catalog";

function getScenario(value: string | string[] | undefined) {
  if (typeof value !== "string") return undefined;
  return value in SCENARIOS ? (value as DemoScenario) : undefined;
}

function getEventId(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    scenario?: string | string[];
    eventId?: string | string[];
    title?: string | string[];
    description?: string | string[];
    scheduledAt?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const { scenario, eventId } = params;
  const selectedId = getEventId(eventId);
  const catalogEvent = EVENT_CATALOG.find((event) => event.id === selectedId);
  const titleOverride = typeof params.title === "string"
    ? params.title
    : undefined;
  const descriptionOverride = typeof params.description === "string"
    ? params.description
    : undefined;
  const scheduleOverride = typeof params.scheduledAt === "string"
    ? params.scheduledAt || null
    : undefined;
  return (
    <Providers
      initialScenario={getScenario(scenario)}
      initialOverrides={
        catalogEvent
          ? {
              id: catalogEvent.id,
              title: titleOverride ?? catalogEvent.title,
              description: descriptionOverride ?? catalogEvent.description,
              scheduledAt: scheduleOverride ?? catalogEvent.scheduledAt,
            }
          : selectedId
            ? {
                id: selectedId,
                title: titleOverride ?? "New LIVDOT Event",
                description: descriptionOverride ?? "A new LIVDOT broadcast workspace.",
                scheduledAt: scheduleOverride ?? null,
              }
            : undefined
      }
    >
      <EventDashboard />
    </Providers>
  );
}
