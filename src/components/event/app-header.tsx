"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Moon, RadioTower, Sun } from "lucide-react";

type Theme = "light" | "dark";

export function AppHeader({ active }: { active: "dashboard" | "events" }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("livdot-theme");
    if (savedTheme === "dark") {
      window.setTimeout(() => setTheme("dark"), 0);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("livdot-theme", theme);
  }, [theme]);

  return (
    <header className="app-bar">
      <div className="app-bar-inner">
        <Link className="brand" href="/" aria-label="LIVDOT Host Dashboard">
          <span className="brand-mark">
            <RadioTower size={21} />
          </span>
          LIVDOT<span className="brand-period">.</span>
        </Link>
        <span className="app-divider" />
        <span className="workspace-label">Host Dashboard</span>
        <nav className="app-nav" aria-label="Primary navigation">
          <Link
            className={`nav-link ${active === "dashboard" ? "active" : ""}`}
            href="/"
          >
            Dashboard
          </Link>
          <Link
            className={`nav-link ${active === "events" ? "active" : ""}`}
            href="/events"
          >
            All events
          </Link>
        </nav>
        <div className="header-actions">
          <button
            className="theme-toggle"
            type="button"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            aria-pressed={theme === "dark"}
            onClick={() =>
              setTheme((current) => (current === "light" ? "dark" : "light"))
            }
          >
            {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
            <span>{theme === "light" ? "Dark" : "Light"}</span>
          </button>
          <span className="host-avatar" aria-label="Host workspace">
            H
          </span>
        </div>
      </div>
    </header>
  );
}
