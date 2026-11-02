import type { EventBoardSnapshot } from "./event-board-state";

const boardKey = Symbol.for("livdot.server-event-board");
type BoardGlobal = typeof globalThis & {
  [boardKey]?: Map<string, EventBoardSnapshot>;
};

function board() {
  const root = globalThis as BoardGlobal;
  root[boardKey] ??= new Map();
  return root[boardKey];
}

export function readServerEventBoard() {
  return Object.fromEntries(board().entries());
}

export function writeServerEventBoard(event: EventBoardSnapshot) {
  board().set(event.id, event);
  return readServerEventBoard();
}
