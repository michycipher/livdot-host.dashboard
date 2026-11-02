import { readServerEventBoard, writeServerEventBoard } from "@/services/server-event-board";
import type { EventBoardSnapshot } from "@/services/event-board-state";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(readServerEventBoard(), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const event = (await request.json()) as EventBoardSnapshot;
  if (
    !event ||
    typeof event.id !== "string" ||
    typeof event.title !== "string" ||
    typeof event.status !== "string"
  ) {
    return Response.json({ error: "Invalid event board update." }, { status: 400 });
  }
  const board = writeServerEventBoard(event);
  return Response.json(board, { headers: { "Cache-Control": "no-store" } });
}
