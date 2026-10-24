import { useState } from "react";
import { FlaskConical, RotateCcw } from "lucide-react";
import type { DemoScenario, EventCommand } from "@/domain/event.types";
import { SCENARIOS } from "@/services/mock-event-scenarios";
export function DemoControls({
  busy,
  failureArmed,
  onFailureChange,
  onCommand,
}: {
  busy: boolean;
  failureArmed: boolean;
  onFailureChange: (enabled: boolean) => void;
  onCommand: (command: EventCommand) => void;
}) {
  const [scenario, setScenario] = useState<DemoScenario>("scheduled_blocked");
  return (
    <section className="demo-controls" aria-labelledby="demo-title">
      <div className="demo-heading">
        <FlaskConical size={18} />
        <h2 id="demo-title">Assessment demo controls</h2>
        <span className="subtle-label">SIMULATION</span>
      </div>
      <p>
        These controls simulate backend scenarios and are not part of the
        production Host Dashboard.
      </p>
      <div className="demo-grid">
        <div>
          <label htmlFor="scenario">Backend scenario</label>
          <div className="scenario-input">
            <div className="scenario-select">
              <select
                id="scenario"
                value={scenario}
                disabled={busy}
                onChange={(e) => setScenario(e.target.value as DemoScenario)}
              >
                {Object.entries(SCENARIOS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="button secondary"
              disabled={busy}
              onClick={() => onCommand({ type: "scenario", scenario })}
            >
              Load scenario
            </button>
          </div>
        </div>
        <div className="failure-control">
          <label className="switch-label">
            <input
              type="checkbox"
              role="switch"
              checked={failureArmed}
              disabled={busy}
              onChange={(e) => onFailureChange(e.target.checked)}
            />
            <span>Fail next mutation</span>
          </label>
          <p>
            Fails once, preserves event state, then allows retry. Refresh
            requests are unaffected.
          </p>
        </div>
        <button
          className="text-button reset-button"
          disabled={busy}
          onClick={() =>
            onCommand({ type: "scenario", scenario: "scheduled_blocked" })
          }
        >
          <RotateCcw size={14} />
          Reset assessment
        </button>
      </div>
    </section>
  );
}
