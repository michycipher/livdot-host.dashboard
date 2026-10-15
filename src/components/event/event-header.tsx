import { CalendarDays, Radio, RefreshCw } from "lucide-react";
import { EVENT_STATUS_META } from "@/domain/event.constants";
import type { HostEvent } from "@/domain/event.types";
import { formatDate } from "@/lib/formatters";
export function EventHeader({
  event,
  refreshing,
  disabled,
  onRefresh,
}: {
  event: HostEvent;
  refreshing: boolean;
  disabled: boolean;
  onRefresh: () => void;
}) {
  return (
    <header className="event-header">
      <div className="eyebrow">
        HOST WORKSPACE <span>/</span> EVENT OVERVIEW
      </div>
      <div className="title-row">
        <h1>{event.title}</h1>
        <span
          data-testid="event-status"
          className={`status-badge ${event.status === "live" ? "live" : ""}`}
        >
          {event.status === "live" ? (
            <Radio size={14} />
          ) : (
            <span className="status-dot" />
          )}
          {EVENT_STATUS_META[event.status].label}
        </span>
      </div>
      <p className="event-description">{event.description}</p>
      <div className="header-meta">
        <span>
          <CalendarDays size={15} />
          {formatDate(event.scheduledAt)}
        </span>
        <span className="event-id">{event.id}</span>
        <div className="updated">
          <span>Last updated {formatDate(event.updatedAt)}</span>
          <button
            className="icon-button"
            aria-label="Refresh event"
            disabled={disabled || refreshing}
            aria-busy={refreshing}
            onClick={onRefresh}
          >
            <RefreshCw size={15} className={refreshing ? "spin" : ""} />
          </button>
        </div>
      </div>
    </header>
  );
}
