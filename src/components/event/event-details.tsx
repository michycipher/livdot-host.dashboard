import type { HostEvent } from "@/domain/event.types";
import { formatCurrency, formatDate } from "@/lib/formatters";
export function EventDetails({ event }: { event: HostEvent }) {
  return (
    <section className="card details" aria-labelledby="details-title">
      <div className="section-heading">
        <h2 id="details-title">Event details</h2>
        <span className="subtle-label">EVENT CONFIGURATION</span>
      </div>
      <dl>
        <div>
          <dt>Scheduled broadcast</dt>
          <dd>{formatDate(event.scheduledAt)}</dd>
        </div>
        <div>
          <dt>Production crew</dt>
          <dd>{event.crew.name ?? "Not assigned"}</dd>
        </div>
        <div>
          <dt>Streaming ingest</dt>
          <dd>{event.streaming.ingestLabel ?? "Not configured"}</dd>
        </div>
        <div>
          <dt>Ticket price</dt>
          <dd>
            {formatCurrency(event.ticketing.price, event.ticketing.currency)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
