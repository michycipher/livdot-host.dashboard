import { Check, UsersRound, RadioTower, Ticket } from "lucide-react";
import type { ReadinessRequirement } from "@/domain/event.types";
const icons = {
  crewAssigned: UsersRound,
  ingestConfigured: RadioTower,
  ticketPricingConfigured: Ticket,
};
export function ReadinessItem({
  requirement,
  disabled,
  editable,
  pending,
  onChange,
}: {
  requirement: ReadinessRequirement;
  disabled: boolean;
  editable: boolean;
  pending: boolean;
  onChange: () => void;
}) {
  const Icon = icons[requirement.key];
  return (
    <li className="readiness-item" aria-busy={pending}>
      <div
        className={`requirement-icon ${requirement.satisfied ? "satisfied" : ""}`}
      >
        <Icon size={20} />
      </div>
      <div className="requirement-body">
        <div className="requirement-title">
          <h3>{requirement.label}</h3>
          <span
            className={requirement.satisfied ? "ready-label" : "missing-label"}
          >
            {requirement.satisfied && <Check size={12} />}
            {requirement.satisfied ? "Ready" : "Missing"}
          </span>
        </div>
        <p>{requirement.description}</p>
        {editable && (
          <button
            className={
              requirement.satisfied ? "text-button" : "button secondary small"
            }
            disabled={disabled}
            onClick={onChange}
            aria-label={
              requirement.satisfied
                ? `Clear ${requirement.label.toLowerCase()}`
                : requirement.action
            }
          >
            {pending
              ? "Saving…"
              : requirement.satisfied
                ? "Clear configuration"
                : requirement.action}
          </button>
        )}
      </div>
    </li>
  );
}
