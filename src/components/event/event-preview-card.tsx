import { CalendarDays, CirclePlay, Radio, Video } from "lucide-react";
import type { HostEvent } from "@/domain/event.types";
import { EVENT_STATUS_META } from "@/domain/event.constants";
import { formatDate } from "@/lib/formatters";

function isPlayable(status: HostEvent["status"]) {
  return status === "live" || status === "completed" || status === "replay_available";
}

export function EventPreviewCard({ event }: { event: HostEvent }) {
  const playable = isPlayable(event.status);
  const isLive = event.status === "live";

  return (
    <section className="card event-preview-card" aria-labelledby="preview-title">
      <div className="preview-media">
        {playable ? (
          <video
            className="preview-video"
            controls
            preload="metadata"
            poster="/demo/live-stage.svg"
            aria-label={`${event.title} ${isLive ? "live preview" : "replay"}`}
          >
            <source src="/demo/live-preview.mp4" type="video/mp4" />
            Your browser does not support embedded video playback.
          </video>
        ) : (
          <div className="preview-art" aria-hidden="true">
            <span className="art-grid" />
            <span className="art-orbit orbit-one" />
            <span className="art-orbit orbit-two" />
            <span className="art-wordmark">LIVDOT</span>
          </div>
        )}
        <div className="preview-topline">
          <span className={`preview-state ${isLive ? "is-live" : ""}`}>
            {isLive ? <Radio size={13} /> : playable ? <CirclePlay size={13} /> : <Video size={13} />}
            {isLive ? "Live preview" : playable ? "Replay available" : "Broadcast preview"}
          </span>
          <span className="preview-duration">16:9</span>
        </div>
      </div>
      <div className="preview-body">
        <div>
          <span className="subtle-label">EVENT PREVIEW</span>
          <h2 id="preview-title">{event.title}</h2>
          <p>{event.description}</p>
        </div>
        <div className="preview-meta">
          <span><CalendarDays size={14} /> {formatDate(event.scheduledAt)}</span>
          <span className="preview-status-label">{EVENT_STATUS_META[event.status].label}</span>
        </div>
      </div>
    </section>
  );
}
