"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, CirclePlay, Plus, Radio, Video } from "lucide-react";
import { AppHeader } from "./app-header";
import { EVENT_STATUS_META } from "@/domain/event.constants";
import { EVENT_CATALOG } from "@/services/event-catalog";
import { formatDate } from "@/lib/formatters";
import { useEventBoard } from "@/hooks/use-event-board";

const PAGE_SIZE = 6;

export function EventListView() {
  const [events, setEvents] = useState(EVENT_CATALOG);
  const snapshots = useEventBoard();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => {
    const storedEvents = Object.keys(window.localStorage)
      .filter((key) => key.startsWith("livdot-event:"))
      .map((key) => {
        try {
          const stored = JSON.parse(window.localStorage.getItem(key) ?? "null");
          if (stored?.title?.trim().toLowerCase() === "brigade") {
            const replacement = {
              ...stored,
              title: "Creator Partnerships Roundtable",
              description: "A working session for creators and partners building with LIVDOT.",
              scheduledAt: "2026-12-10T16:00:00.000Z",
              status: "scheduled",
              scenario: "scheduled_blocked",
              accent: "violet",
            };
            window.localStorage.setItem(key, JSON.stringify(replacement));
            return replacement;
          }
          return stored;
        } catch {
          return null;
        }
      })
      .filter((event): event is (typeof EVENT_CATALOG)[number] => Boolean(event?.id));
    if (storedEvents.length) {
      window.setTimeout(() => {
        setEvents((current) => [
          ...storedEvents,
          ...current.filter((event) => !storedEvents.some((stored) => stored.id === event.id)),
        ]);
      }, 0);
    }
  }, []);
  const boardEvents = events.map((event) => ({
    ...event,
    ...(snapshots[event.id]
      ? {
          title: snapshots[event.id].title,
          description: snapshots[event.id].description,
          status: snapshots[event.id].status,
          scheduledAt: snapshots[event.id].scheduledAt,
        }
      : {}),
  }));
  const liveCount = boardEvents.filter((event) => event.status === "live").length;
  const upcomingCount = boardEvents.filter((event) =>
    event.status === "draft" || event.status === "scheduled",
  ).length;
  const replayCount = boardEvents.filter((event) => event.status === "replay_available").length;
  const pageCount = Math.ceil(boardEvents.length / PAGE_SIZE);
  const visibleEvents = boardEvents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    const id = `EV-${String(events.length + 4822).padStart(4, "0")}`;
    const newEvent = {
        id,
        title: trimmedTitle,
        description: description.trim() || "A new LIVDOT broadcast workspace.",
        scheduledAt: scheduledAt ? new Date(`${scheduledAt}T18:00:00`).toISOString() : null,
        status: "draft",
        scenario: "draft",
        accent: "teal",
      } as const;
    setEvents((current) => [newEvent, ...current]);
    setPage(1);
    window.localStorage.setItem(`livdot-event:${id}`, JSON.stringify(newEvent));
    setTitle("");
    setDescription("");
    setScheduledAt("");
    setIsCreateOpen(false);
  }

  return (
    <>
      <AppHeader active="events" />
      <main id="main-content" className="events-main">
        <section className="events-hero" aria-labelledby="events-title">
          <div>
            <div className="eyebrow">
              HOST WORKSPACE <span>/</span> EVENT LIBRARY
            </div>
            <h1 id="events-title">Your events</h1>
            <p>
              Keep every broadcast in view, then open the operations workspace
              when it is time to prepare or go live.
            </p>
          </div>
          <button
            className="button primary events-create"
            type="button"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={16} />
            New event
          </button>
        </section>

        <section className="event-summary-strip" aria-label="Event summary">
          <div>
            <span className="summary-icon"><CalendarDays size={16} /></span>
            <span><strong>{boardEvents.length}</strong> total events</span>
          </div>
          <div>
            <span className="summary-icon live"><Radio size={16} /></span>
            <span><strong>{liveCount}</strong> live now</span>
          </div>
          <div>
            <span className="summary-icon upcoming"><Video size={16} /></span>
            <span><strong>{upcomingCount}</strong> upcoming</span>
          </div>
          <div>
            <span className="summary-icon replay"><CirclePlay size={16} /></span>
            <span><strong>{replayCount}</strong> replay ready</span>
          </div>
        </section>

        <section className="event-list-section" aria-labelledby="event-list-title">
          <div className="list-heading">
            <div>
              <h2 id="event-list-title">Event library</h2>
              <p>Events are saved locally in this assessment environment.</p>
            </div>
            <span className="subtle-label">{boardEvents.length} RECORDS</span>
          </div>
          <div className="event-grid">
            {visibleEvents.map((event) => {
              const scenarioByStatus = {
                draft: "draft",
                scheduled: "scheduled_blocked",
                ready: "ready",
                live: "live",
                completed: "completed",
                replay_available: "replay",
              } as const;
              const href = event.id === "EV-4821"
                ? "/"
                : `/?scenario=${scenarioByStatus[event.status]}&eventId=${encodeURIComponent(event.id)}&title=${encodeURIComponent(event.title)}&description=${encodeURIComponent(event.description)}&scheduledAt=${encodeURIComponent(event.scheduledAt ?? "")}`;
              const isLive = event.status === "live";
              return (
                <article className="event-card" key={event.id}>
                  <div className={`event-card-cover ${event.accent}`}>
                    <span className="cover-overline">LIVDOT / HOST</span>
                    <span className="cover-title">{event.title}</span>
                    {isLive && <span className="live-pulse"><Radio size={12} /> Live now</span>}
                  </div>
                  <div className="event-card-body">
                    <div className="event-card-topline">
                      <span className={`catalog-status ${event.status}`}>
                        <span />
                        {EVENT_STATUS_META[event.status].label}
                      </span>
                      <span className="event-card-id">{event.id}</span>
                    </div>
                    <h3>{event.title}</h3>
                    <p>{event.description}</p>
                    <div className="event-card-meta">
                      <span>
                        <CalendarDays size={14} />
                        {event.scheduledAt ? formatDate(event.scheduledAt) : "No date set"}
                      </span>
                    </div>
                    <Link className="event-card-link" href={href}>
                      Open workspace <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
          {pageCount > 1 && (
            <nav className="pagination" aria-label="Event pages">
              <button
                className="button secondary pagination-button"
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <ArrowLeft size={14} /> Previous
              </button>
              <div className="pagination-pages">
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={`page-number ${page === pageNumber ? "current" : ""}`}
                    aria-current={page === pageNumber ? "page" : undefined}
                    aria-label={`Page ${pageNumber}`}
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
              <span className="pagination-count">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, boardEvents.length)} of {boardEvents.length}
              </span>
              <button
                className="button secondary pagination-button"
                type="button"
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                disabled={page === pageCount}
                aria-label="Next page"
              >
                Next <ArrowRight size={14} />
              </button>
            </nav>
          )}
        </section>
      </main>
      {isCreateOpen && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="create-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-event-title"
          >
            <div className="modal-heading">
              <div>
                <span className="subtle-label">NEW WORKSPACE</span>
                <h2 id="create-event-title">Create an event</h2>
              </div>
              <button
                className="modal-close"
                type="button"
                aria-label="Close create event dialog"
                onClick={() => setIsCreateOpen(false)}
              >
                ×
              </button>
            </div>
            <form className="create-form" onSubmit={createEvent}>
              <label htmlFor="event-title">Event name</label>
              <input
                id="event-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Lagos Product Forum"
                required
              />
              <label htmlFor="event-description">Description</label>
              <textarea
                id="event-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What should hosts know about this broadcast?"
                rows={3}
              />
              <label htmlFor="event-date">Broadcast date</label>
              <input
                id="event-date"
                type="date"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
              />
              <div className="modal-actions">
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </button>
                <button className="button primary" type="submit">
                  Create draft
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      <footer>
        <span>LIVDOT TECHNOLOGIES</span>
        <span>Host operations · Assessment environment</span>
      </footer>
    </>
  );
}
