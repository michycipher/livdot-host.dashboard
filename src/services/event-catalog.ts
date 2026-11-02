import type { DemoScenario, EventStatus } from "@/domain/event.types";

export interface EventCatalogItem {
  id: string;
  title: string;
  description: string;
  scheduledAt: string | null;
  status: EventStatus;
  scenario: DemoScenario;
  accent: "teal" | "violet" | "amber" | "blue";
}

/**
 * A small local catalog keeps the assessment easy to explore without changing
 * the canonical single-event API or pretending this demo has persistence.
 */
export const EVENT_CATALOG: EventCatalogItem[] = [
  {
    id: "EV-4821",
    title: "Lagos Innovation Summit 2026",
    description:
      "A live technology and business event bringing founders, operators and investors together.",
    scheduledAt: "2026-10-24T17:00:00.000Z",
    status: "scheduled",
    scenario: "scheduled_blocked",
    accent: "teal",
  },
  {
    id: "EV-4818",
    title: "Founders After Hours",
    description: "A private conversation for the next generation of builders.",
    scheduledAt: "2026-11-05T18:30:00.000Z",
    status: "draft",
    scenario: "draft",
    accent: "violet",
  },
  {
    id: "EV-4809",
    title: "Product Launch Briefing",
    description: "A live product walkthrough for partners and early adopters.",
    scheduledAt: "2026-10-18T16:00:00.000Z",
    status: "live",
    scenario: "live",
    accent: "amber",
  },
  {
    id: "EV-4794",
    title: "Annual Investor Briefing",
    description: "An annual update for investors and key stakeholders.",
    scheduledAt: "2026-09-30T15:00:00.000Z",
    status: "replay_available",
    scenario: "replay",
    accent: "blue",
  },
  {
    id: "EV-4788",
    title: "Creator Economy Town Hall",
    description: "A community session on building sustainable creator businesses.",
    scheduledAt: "2026-11-12T16:00:00.000Z",
    status: "scheduled",
    scenario: "scheduled_blocked",
    accent: "violet",
  },
  {
    id: "EV-4776",
    title: "Fintech Partner Showcase",
    description: "A showcase of new payment experiences for partner teams.",
    scheduledAt: "2026-11-19T15:00:00.000Z",
    status: "draft",
    scenario: "draft",
    accent: "blue",
  },
  {
    id: "EV-4762",
    title: "Community Product Showcase",
    description: "A live product walkthrough and Q&A for the LIVDOT community.",
    scheduledAt: "2026-12-03T17:00:00.000Z",
    status: "scheduled",
    scenario: "scheduled_blocked",
    accent: "amber",
  },
];
